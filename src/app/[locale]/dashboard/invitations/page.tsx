"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { InvitationInbox } from "@/features/teams";

export default function InvitationsPage() {
  const t = useTranslations("Teams");
  const { isAuthenticated, isLoading: isSessionLoading } = useSession();

  if (isSessionLoading) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-alt" />
        <div className="h-4 w-96 animate-pulse rounded bg-surface-alt" />
        <div className="h-64 animate-pulse rounded-2xl bg-surface-alt" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-6 px-4 py-20 text-center sm:px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
            {t("invitationsHeading")}
          </h1>
          <p className="max-w-md text-sm text-text-muted">
            Please log in to view and respond to your team invitations.
          </p>
        </div>
        <Link
          href="/login?redirect=/dashboard/invitations"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Log in to Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-8 px-4 py-12 sm:px-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
          {t("invitationsHeading")}
        </h1>
        <p className="mt-2 text-sm text-text-muted">{t("invitationsIntro")}</p>
      </div>
      <div className="w-full">
        <InvitationInbox />
      </div>
    </main>
  );
}
