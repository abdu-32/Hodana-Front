"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button, ErrorBanner } from "@/components/ui";
import { ApiError } from "@/lib/api-client";
import { resendVerification, verifyEmail } from "../lib/auth-client";

/**
 * Doc 06 Sec 5.1: `/verify-email` covers both halves of FR-AUTH-003 as one
 * screen, switched on which query param the page component saw server-side:
 *
 * - `?email=` -- straight from `/signup` (see SignupForm). Pending state:
 *   "check your inbox", with a resend action.
 * - `?token=` -- the person followed the emailed confirmation link.
 *   Confirm state: fire `POST /auth/verify-email` once on mount.
 *
 * Neither present (e.g. someone bookmarked the bare `/verify-email` URL)
 * falls back to a generic pending message with no resend action, since
 * there's no address to resend to.
 */
export function VerifyEmailPanel({
  token,
  email,
}: {
  token: string | undefined;
  email: string | undefined;
}) {
  if (token) {
    return <ConfirmState token={token} />;
  }
  return <PendingState email={email} />;
}

function ConfirmState({ token }: { token: string }) {
  const t = useTranslations("Auth");
  const attempted = useRef(false);

  const mutation = useMutation({
    mutationFn: () => verifyEmail({ token }),
  });

  useEffect(() => {
    // Guards against React 18 Strict Mode's double-invoke of effects in
    // development firing this token at the (single-use) backend endpoint
    // twice.
    if (attempted.current) return;
    attempted.current = true;
    mutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once
  }, []);

  if (mutation.isPending || mutation.isIdle) {
    return (
      <div className="flex items-center gap-2.5 text-sm text-text-muted" role="status">
        <span
          aria-hidden="true"
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-text-muted/30 border-t-primary"
        />
        {t("verifyEmailConfirming")}
      </div>
    );
  }

  if (mutation.isSuccess) {
    return (
      <div className="flex flex-col gap-4">
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-lg border border-success/20 bg-success/[0.06] px-4 py-3 text-sm text-text"
        >
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-success/15 text-[11px] font-bold text-success"
          >
            ✓
          </span>
          <span className="leading-snug">{t("verifyEmailSuccess")}</span>
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

  const message =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : t("verifyEmailError");

  return <ErrorBanner message={message} />;
}

function PendingState({ email }: { email: string | undefined }) {
  const t = useTranslations("Auth");
  const [resent, setResent] = useState(false);

  const mutation = useMutation({
    mutationFn: () => {
      if (!email) {
        throw new Error(t("genericError"));
      }
      return resendVerification({ email });
    },
    onSuccess: () => setResent(true),
  });

  const bannerMessage =
    mutation.isError && mutation.error instanceof Error
      ? mutation.error.message
      : null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-text" role="status">
        {email
          ? t("verifyEmailPendingWithAddress", { email })
          : t("verifyEmailPending")}
      </p>

      {email && (
        <>
          {bannerMessage && (
            <ErrorBanner
              message={bannerMessage}
              onDismiss={() => mutation.reset()}
              dismissLabel={t("dismissError")}
            />
          )}
          {resent ? (
            <p className="flex items-center gap-1.5 text-sm font-medium text-success" role="status">
              <span aria-hidden="true">✓</span>
              {t("resendSuccess")}
            </p>
          ) : (
            <Button
              type="button"
              variant="secondary"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? t("resending") : t("resendCta")}
            </Button>
          )}
        </>
      )}

      <Link
        href="/login"
        className="text-sm font-medium text-primary hover:underline"
      >
        {t("goToLogin")}
      </Link>
    </div>
  );
}
