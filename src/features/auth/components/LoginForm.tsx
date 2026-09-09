"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button, ErrorBanner, TextField, useToast } from "@/components/ui";
import { ApiError } from "@/lib/api-client";
import { login } from "../lib/auth-client";

/** Only ever a same-origin, locale-stripped app path -- middleware
 * (`proxy.ts`) is the only thing that sets `?next=`, always to
 * `request.nextUrl.pathname` of one of our own protected routes. Still
 * re-validated here (must start with a single `/`, never `//`) before
 * ever being handed to `router.push`, since a query param is
 * attacker-controlled input regardless of who's expected to set it. */
function safeNextPath(next: string | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/";
}

/**
 * Doc 06 Sec 5.1: `/login`, SSR shell + this CSR form (Sec 7.1 -- forms are
 * always client-rendered even on an otherwise-SSR page). Per Sec 2 "one
 * error contract, one error experience": field errors render inline via
 * TextField's own `error` prop; anything not tied to a field renders in the
 * shared ErrorBanner.
 */
export function LoginForm({ next }: { next?: string }) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () => login({ email, password }),
    onSuccess: (data) => {
      // Check if there is a pending judge invitation
      const pendingToken = typeof window !== "undefined" ? localStorage.getItem("hodana_pending_judge_token") : null;
      if (pendingToken || next?.includes("/judge/dashboard")) {
        if (pendingToken) {
          localStorage.removeItem("hodana_pending_judge_token");
        }
        showToast("Judge Invitation Accepted! Welcome to your Judge Portal.", "success");
        router.push("/judge/dashboard");
        return;
      }

      // Check if user is Platform Admin (Abdulhalim Aliye Ahmed / abdulhalimaliyi54@gmail.com)
      const isAdmin =
        data.email?.toLowerCase() === "abdulhalimaliyi54@gmail.com" ||
        data.roles?.some((r: string) => r.toLowerCase() === "admin" || r.toLowerCase() === "platform_admin") ||
        (data as any).role === "admin";

      showToast(t("loginSuccess"), "success");

      if (isAdmin) {
        if (next && next.startsWith("/admin")) {
          router.push(safeNextPath(next));
        } else {
          router.push("/admin/dashboard");
        }
        return;
      }

      // Check if user is an Organizer
      const isOrganizer =
        data.roles?.some((r: string) => r.toLowerCase() === "organizer") ||
        (data as any).role === "organizer";

      if (isOrganizer) {
        if (next && (next.startsWith("/organizer") || next.startsWith("/dashboard/organizer"))) {
          router.push(safeNextPath(next));
        } else {
          router.push("/organizer/dashboard");
        }
        return;
      }

      // Check if user is a Judge
      const isJudge =
        data.roles?.some((r: string) => r.toLowerCase() === "judge") ||
        (data as any).role === "judge";

      if (isJudge) {
        if (next && next.startsWith("/judge")) {
          router.push(safeNextPath(next));
        } else {
          router.push("/judge/dashboard");
        }
        return;
      }

      router.push(safeNextPath(next));
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.fields) {
        setFieldErrors(
          Object.fromEntries(
            Object.entries(error.fields).map(([field, messages]) => [
              field,
              messages[0],
            ]),
          ),
        );
      }
    },
  });

  const bannerMessage =
    mutation.isError &&
    !(mutation.error instanceof ApiError && mutation.error.fields)
      ? mutation.error instanceof Error
        ? mutation.error.message
        : t("genericError")
      : null;

  return (
    <form
      noValidate
      className="flex w-full flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setFieldErrors({});
        mutation.mutate();
      }}
    >
      {bannerMessage && (
        <ErrorBanner
          message={bannerMessage}
          onDismiss={() => mutation.reset()}
          dismissLabel={t("dismissError")}
        />
      )}

      <TextField
        label={t("emailLabel")}
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={fieldErrors.email}
      />

      <TextField
        label={t("passwordLabel")}
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
      />

      <Link
        href="/forgot-password"
        className="-mt-2 self-start text-sm font-medium text-primary hover:underline"
      >
        {t("forgotPasswordLink")}
      </Link>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? t("loggingIn") : t("loginCta")}
      </Button>
    </form>
  );
}
