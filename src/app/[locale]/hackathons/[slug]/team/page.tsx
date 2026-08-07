"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ErrorBanner, StatusBadge } from "@/components/ui";
import { useSession } from "@/features/auth";
import { useHackathonBySlug } from "@/features/hackathons/hooks/useHackathonBySlug";
import { TeamHub } from "@/features/teams";

export default function HackathonTeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const t = useTranslations("Teams");
  const { isAuthenticated, isLoading: isSessionLoading } = useSession();

  const hackathonQuery = useHackathonBySlug(slug);

  if (isSessionLoading || hackathonQuery.isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6">
        <div className="h-6 w-32 animate-pulse rounded bg-surface-alt" />
        <div className="h-28 animate-pulse rounded-2xl bg-surface-alt" />
        <div className="h-64 animate-pulse rounded-2xl bg-surface-alt" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-6 px-4 py-20 text-center sm:px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
            {t("teamHubHeading")}
          </h1>
          <p className="max-w-md text-sm text-text-muted">
            Please log in to manage your team or create a new team for this hackathon.
          </p>
        </div>
        <Link
          href={`/login?redirect=/hackathons/${slug}/team`}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Log in to Team Hub
        </Link>
      </main>
    );
  }

  if (hackathonQuery.isError || !hackathonQuery.data) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6">
        <ErrorBanner message={t("hackathonLoadError")} />
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          &larr; Back to hackathons
        </Link>
      </main>
    );
  }

  const hackathon = hackathonQuery.data;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6">
      {/* Navigation Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-text-muted">
        <Link href="/" className="hover:text-text transition-colors">
          Hackathons
        </Link>
        <span>/</span>
        <Link href={`/hackathons/${slug}`} className="hover:text-text transition-colors truncate max-w-[200px]">
          {hackathon.title}
        </Link>
        <span>/</span>
        <span className="font-medium text-text">Team Hub</span>
      </nav>

      {/* Header Banner */}
      <section className="flex flex-col gap-3 rounded-2xl border border-black/[0.07] bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              Team Management Center
            </span>
            {hackathon.status && (
              <StatusBadge domain="hackathon" value={hackathon.status}>
                {hackathon.status}
              </StatusBadge>
            )}
          </div>
          <Link
            href={`/hackathons/${slug}`}
            className="text-xs font-medium text-primary hover:underline"
          >
            View Hackathon Details &rarr;
          </Link>
        </div>

        <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
          {hackathon.title}
        </h1>
        <p className="text-sm text-text-muted">
          {t("teamHubIntro")}
        </p>
      </section>

      {/* Team Hub Main Component */}
      <div className="w-full">
        <TeamHub hackathonId={hackathon.id} />
      </div>
    </main>
  );
}
