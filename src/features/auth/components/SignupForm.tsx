"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button, ErrorBanner, TextField, useToast } from "@/components/ui";
import { ApiError } from "@/lib/api-client";
import { signup } from "../lib/auth-client";

/**
 * Doc 06 Sec 5.1: `/signup` (FR-AUTH-001). Signup itself returns no tokens
 * (see auth-client.ts) -- a successful submit creates the account and sends
 * the person to /verify-email (FR-AUTH-003), not straight into the app.
 */
export function SignupForm() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () => signup({ fullName, email, password }),
    onSuccess: () => {
      showToast(t("signupSuccess"), "success");
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
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
        label={t("fullNameLabel")}
        type="text"
        autoComplete="name"
        required
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        error={fieldErrors.fullName}
      />

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
        autoComplete="new-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
        hint={fieldErrors.password ? undefined : t("passwordHint")}
      />

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? t("signingUp") : t("signupCta")}
      </Button>
    </form>
  );
}
