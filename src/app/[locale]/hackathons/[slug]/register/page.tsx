"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button, ErrorBanner, StatusBadge } from "@/components/ui";
import { useSession } from "@/features/auth";
import { useHackathonBySlug } from "@/features/hackathons/hooks/useHackathonBySlug";
import { RegistrationForm, listMyRegistrations } from "@/features/registrations";

export default function HackathonRegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const t = useTranslations("Registrations");
  const { user, isAuthenticated, isLoading: isSessionLoading } = useSession();

  const hackathonQuery = useHackathonBySlug(slug);

  const registrationsQuery = useQuery({
    queryKey: ["registrations", "me"],
    queryFn: listMyRegistrations,
    enabled: isAuthenticated,
  });

  if (isSessionLoading || hackathonQuery.isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6">
        <div className="h-6 w-32 animate-pulse rounded bg-surface-alt" />
        <div className="h-48 animate-pulse rounded-2xl bg-surface-alt" />
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
            {t("registerHeading")}
          </h1>
          <p className="max-w-md text-sm text-text-muted">
            Please log in to your participant account to register for this hackathon and form a team.
          </p>
        </div>
        <Link
          href={`/login?redirect=/hackathons/${slug}/register`}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Log in to Register
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

  // Check if user is already registered
  const existingRegistration = (registrationsQuery.data ?? []).find(
    (reg) => reg.hackathonId === hackathon.id && !reg.withdrawnAt,
  );
  const isAlreadyRegistered = Boolean(existingRegistration);

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
        <span className="font-medium text-text">Register</span>
      </nav>

      {/* Selected Hackathon Header Card */}
      <section className="flex flex-col gap-6 rounded-2xl border border-black/[0.07] bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Hackathon
              </span>
              {hackathon.status && (
                <StatusBadge domain="hackathon" value={hackathon.status}>
                  {hackathon.status}
                </StatusBadge>
              )}
            </div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
              {hackathon.title}
            </h1>
          </div>
        </div>

        {hackathon.description && (
          <p className="text-sm text-text-muted leading-relaxed">
            {hackathon.description}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 border-t border-black/[0.06] pt-4 sm:grid-cols-2">
          {hackathon.registrationOpensAt && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Registration Window
              </p>
              <p className="mt-1 text-sm font-medium text-text">
                {new Date(hackathon.registrationOpensAt).toLocaleDateString()} &mdash;{" "}
                {hackathon.registrationClosesAt
                  ? new Date(hackathon.registrationClosesAt).toLocaleDateString()
                  : "Open"}
              </p>
            </div>
          )}
          {hackathon.submissionOpensAt && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Submission Window
              </p>
              <p className="mt-1 text-sm font-medium text-text">
                {new Date(hackathon.submissionOpensAt).toLocaleDateString()} &mdash;{" "}
                {hackathon.submissionClosesAt
                  ? new Date(hackathon.submissionClosesAt).toLocaleDateString()
                  : "TBD"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Registration Form or Already Registered Banner */}
      {isAlreadyRegistered && existingRegistration ? (
        <section className="flex flex-col gap-6 rounded-2xl border border-success/30 bg-success/5 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-lg font-semibold text-text">
                You are registered for this hackathon!
              </h2>
              <p className="text-sm text-text-muted">
                {t("registeredAtLabel", {
                  date: new Date(existingRegistration.registeredAt).toLocaleDateString(),
                })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-success/20 pt-4">
            <Link
              href={`/hackathons/${slug}/team`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Open Team Hub &rarr;
            </Link>
            <Link
              href="/dashboard/registrations"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-black/10 bg-surface px-5 text-sm font-medium text-text shadow-sm transition-colors hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              My Registrations
            </Link>
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-text">
              {t("registerHeading")}
            </h2>
            <p className="mt-1 text-sm text-text-muted">{t("registerIntro")}</p>
          </div>

          <RegistrationForm
            hackathonId={hackathon.id}
            hackathonSlug={hackathon.slug}
          />
        </section>
      )}
    </main>
  );
}
