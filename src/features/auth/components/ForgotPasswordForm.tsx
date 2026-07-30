"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button, ErrorBanner, TextField } from "@/components/ui";
import { ApiError } from "@/lib/api-client";
import { requestPasswordReset } from "../lib/auth-client";

/**
 * Doc 06 Sec 5.1: `/forgot-password` half of FR-AUTH-004. Always shows the
 * same success state regardless of whether the address is registered --
 * the backend's `PasswordResetRequestResponse` is a plain `{ message }`
 * with no indication either way, so there's nothing account-enumerating
 * to leak here even if we wanted to.
 */
export function ForgotPasswordForm() {
  const t = useTranslations("Auth");
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () => requestPasswordReset({ email }),
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

  if (mutation.isSuccess) {
    return (
      <div
        role="status"
        className="flex items-start gap-2.5 rounded-lg border border-success/20 bg-success/6 px-4 py-3 text-sm text-text"
      >
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-success/15 text-[11px] font-bold text-success"
        >
          ✓
        </span>
        <span className="leading-snug">{t("forgotPasswordSuccess")}</span>
      </div>
    );
  }

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

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? t("sendingResetLink") : t("sendResetLinkCta")}
      </Button>
    </form>
  );
}
