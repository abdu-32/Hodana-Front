"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button, ErrorBanner } from "@/components/ui";
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
  const { isAuthenticated, isLoading: isSessionLoading } = useSession();

  const hackathonQuery = useHackathonBySlug(slug);

  const registrationsQuery = useQuery({
    queryKey: ["registrations", "me"],
    queryFn: listMyRegistrations,
    enabled: isAuthenticated,
  });

  if (isSessionLoading || hackathonQuery.isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12 sm:px-6">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-48 animate-pulse rounded-2xl bg-gray-200" />
        <div className="h-64 animate-pulse rounded-2xl bg-gray-200" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-6 px-4 py-20 text-center sm:px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0f6b5c]/10 text-[#0f6b5c]">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#122622]">
            {t("registerHeading")}
          </h1>
          <p className="max-w-md text-sm text-[#57685f]">
            Please log in to your participant account to register for this hackathon and form a team.
          </p>
        </div>
        <Link
          href={`/login?redirect=/hackathons/${slug}/register`}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#0f6b5c] px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0b5347]"
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
        <Link href="/" className="text-sm font-medium text-[#0f6b5c] hover:underline">
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

  if (isAlreadyRegistered && existingRegistration) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6">
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-[#57685f]">
          <Link href="/" className="hover:text-[#122622] transition-colors">
            Hackathons
          </Link>
          <span>/</span>
          <Link href={`/hackathons/${slug}`} className="hover:text-[#122622] transition-colors truncate max-w-[200px]">
            {hackathon.title}
          </Link>
          <span>/</span>
          <span className="font-bold text-[#122622]">Registered</span>
        </nav>

        <section className="flex flex-col gap-6 rounded-3xl border border-emerald-200 bg-emerald-50/40 p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0f6b5c] text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-xl font-bold text-[#122622]">
                You are registered for {hackathon.title}!
              </h2>
              <p className="text-xs text-[#57685f]">
                {t("registeredAtLabel", {
                  date: new Date(existingRegistration.registeredAt).toLocaleDateString(),
                })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-emerald-200/60 pt-5">
            <Link
              href={`/hackathons/${slug}/team`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#0f6b5c] px-6 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#0b5347]"
            >
              Open Team Hub &rarr;
            </Link>
            <Link
              href="/dashboard/registrations"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gray-200 bg-white px-6 text-xs font-bold text-[#122622] shadow-xs transition-colors hover:bg-gray-50"
            >
              My Registrations
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return <RegistrationForm hackathon={hackathon} />;
}
