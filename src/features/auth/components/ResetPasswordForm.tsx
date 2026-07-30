"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button, ErrorBanner, TextField } from "@/components/ui";
import { ApiError } from "@/lib/api-client";
import { confirmPasswordReset } from "../lib/auth-client";

/**
 * Doc 06 Sec 5.1: `/reset-password` half of FR-AUTH-004. `token` comes from
 * the query string of the emailed link -- read server-side by the page
 * component and passed down as a prop, same shape as the token/email split
 * on `/verify-email`.
 */
export function ResetPasswordForm({ token }: { token: string | undefined }) {
  const t = useTranslations("Auth");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmMismatch, setConfirmMismatch] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () => {
      if (!token) {
        throw new Error(t("resetPasswordMissingToken"));
      }
      return confirmPasswordReset({ token, newPassword });
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

  if (mutation.isSuccess) {
    return (
      <div className="flex w-full flex-col gap-4">
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
          <span className="leading-snug">{t("resetPasswordSuccess")}</span>
        </div>
        <Link
          href="/login"
          className="self-start text-sm font-medium text-primary hover:underline"
        >
          {t("goToLogin")}
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <p
        className="w-full rounded-lg border border-danger/20 bg-danger/6 px-4 py-3 text-sm text-danger"
        role="alert"
      >
        {t("resetPasswordMissingToken")}
      </p>
    );
  }

  return (
    <form
      noValidate
      className="flex w-full flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setFieldErrors({});
        if (newPassword !== confirmPassword) {
          setConfirmMismatch(true);
          return;
        }
        setConfirmMismatch(false);
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
        label={t("newPasswordLabel")}
        type="password"
        autoComplete="new-password"
        required
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        error={fieldErrors.newPassword}
        hint={fieldErrors.newPassword ? undefined : t("passwordHint")}
      />

      <TextField
        label={t("confirmPasswordLabel")}
        type="password"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        error={confirmMismatch ? t("passwordMismatch") : undefined}
      />

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? t("resettingPassword") : t("resetPasswordCta")}
      </Button>
    </form>
  );
}
