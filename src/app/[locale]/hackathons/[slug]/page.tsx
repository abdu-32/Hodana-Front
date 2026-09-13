"use client";

import { use, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button, ErrorBanner, StatusBadge, useToast } from "@/components/ui";
import { useSession } from "@/features/auth";
import { useHackathonBySlug } from "@/features/hackathons/hooks/useHackathonBySlug";
import { formatHackathonPrize } from "@/features/hackathons";

export default function HackathonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const t = useTranslations("Hackathons");
  const { isAuthenticated } = useSession();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "prizes" | "rules">("overview");

  const hackathonQuery = useHackathonBySlug(slug);

  if (hackathonQuery.isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12 sm:px-6">
        <div className="h-6 w-48 animate-pulse rounded bg-surface-alt" />
        <div className="h-72 animate-pulse rounded-3xl bg-surface-alt" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-96 animate-pulse rounded-2xl bg-surface-alt lg:col-span-2" />
          <div className="h-96 animate-pulse rounded-2xl bg-surface-alt" />
        </div>
      </main>
    );
  }

  if (hackathonQuery.isError || !hackathonQuery.data) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6 text-center">
        <ErrorBanner message="Failed to load hackathon details. Please try again later." />
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          &larr; Back to hackathons
        </Link>
      </main>
    );
  }

  const hackathon = hackathonQuery.data;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Hackathon link copied to clipboard!", "success");
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-text-muted">
        <Link href="/" className="hover:text-text transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/" className="hover:text-text transition-colors">
          Hackathons
        </Link>
        <span>/</span>
        <span className="font-medium text-text truncate max-w-[240px]">
          {hackathon.title}
        </span>
      </nav>

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-surface shadow-xl">
        <div className="relative min-h-[400px] sm:min-h-[360px] md:h-96 w-full flex flex-col justify-end">
          <img
            src={hackathon.bannerUrl || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80"}
            alt={hackathon.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
          
          <div className="relative z-10 flex flex-col gap-3.5 sm:gap-4 p-4 sm:p-8 text-white">
            <div className="flex flex-wrap items-center gap-2">
              {hackathon.status && (
                <StatusBadge domain="hackathon" value={hackathon.status}>
                  {hackathon.status}
                </StatusBadge>
              )}
              {hackathon.field && (
                <span className="inline-flex items-center rounded-full bg-[#0f6b5c]/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                  {hackathon.field}
                </span>
              )}
              <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                📍 {hackathon.locationName || hackathon.locationMode || "Online / Virtual"}
              </span>
              {hackathon.openTo && (
                <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  👥 {hackathon.openTo.includes("ALL") ? "Open to Everyone" : hackathon.openTo.includes("UNIVERSITY_STUDENT") ? "University Students Only" : "Gov / Public Sector"}
                </span>
              )}
              <span className="inline-flex items-center rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-1 text-xs font-bold backdrop-blur-md">
                🏆 {formatHackathonPrize(hackathon)}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {hackathon.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm font-semibold">
                  {hackathon.title.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-white/70 uppercase tracking-wider">Host Organization</p>
                  <p className="text-sm font-medium text-white">HODANA</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex min-h-[42px] sm:min-h-[44px] items-center justify-center rounded-xl bg-white/10 px-4 text-xs sm:text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20 cursor-pointer"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.368 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684" />
                  </svg>
                  Share
                </button>

                <Link
                  href={`/hackathons/${slug}/register`}
                  className="inline-flex min-h-[42px] sm:min-h-[44px] items-center justify-center rounded-xl bg-primary px-6 text-xs sm:text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Register Now &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout with Sidebar */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Columns: Tabs & Main Information */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-black/10 pb-2 overflow-x-auto no-scrollbar whitespace-nowrap">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "overview"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-muted hover:text-text hover:bg-surface-alt"
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("timeline")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "timeline"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-muted hover:text-text hover:bg-surface-alt"
              }`}
            >
              Timeline
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("prizes")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "prizes"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-muted hover:text-text hover:bg-surface-alt"
              }`}
            >
              Prizes & Rewards
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("rules")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "rules"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-muted hover:text-text hover:bg-surface-alt"
              }`}
            >
              Rules
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6">
              <section className="rounded-2xl border border-black/[0.08] bg-surface p-6 shadow-xs">
                <h2 className="font-display text-xl font-semibold tracking-tight text-text mb-3">
                  About the Hackathon
                </h2>
                <p className="text-base leading-relaxed text-text-muted">
                  {hackathon.description ||
                    "Join Ethiopia's top developers, designers, and innovators in creating high-impact solutions for key regional challenges."}
                </p>

                {hackathon.tags && hackathon.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-text-muted mr-1">Focus Areas:</span>
                    {hackathon.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-surface-alt px-3 py-1 text-xs font-medium text-text"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-black/[0.08] bg-surface p-6 shadow-xs">
                <h2 className="font-display text-xl font-semibold tracking-tight text-text mb-4">
                  Why Participate?
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-xl bg-surface-alt/50 p-4">
                    <span className="text-2xl">💰</span>
                    <div>
                      <h3 className="font-semibold text-text text-sm">Major Funding & Prizes</h3>
                      <p className="text-xs text-text-muted mt-1">Compete for cash rewards, incubation grants, and investor backing.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl bg-surface-alt/50 p-4">
                    <span className="text-2xl">👥</span>
                    <div>
                      <h3 className="font-semibold text-text text-sm">Team Collaboration</h3>
                      <p className="text-xs text-text-muted mt-1">Form teams or join skilled builders across technical disciplines.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl bg-surface-alt/50 p-4">
                    <span className="text-2xl">🎓</span>
                    <div>
                      <h3 className="font-semibold text-text text-sm">Expert Mentorship</h3>
                      <p className="text-xs text-text-muted mt-1">Get direct guidance from seasoned tech leaders and industry mentors.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl bg-surface-alt/50 p-4">
                    <span className="text-2xl">🚀</span>
                    <div>
                      <h3 className="font-semibold text-text text-sm">National Showcase</h3>
                      <p className="text-xs text-text-muted mt-1">Present your solution to venture partners and community leaders.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="flex flex-col gap-6">
              <section className="rounded-2xl border border-black/[0.08] bg-surface p-6 shadow-xs">
                <h2 className="font-display text-xl font-semibold tracking-tight text-text mb-6">
                  Event Schedule & Deadlines
                </h2>

                <div className="relative border-l-2 border-primary/20 pl-6 flex flex-col gap-8 ml-2">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full bg-primary ring-4 ring-primary/20" />
                    <h3 className="font-semibold text-text text-base">Registration Opens</h3>
                    <p className="text-sm text-text-muted mt-0.5">
                      {new Date(hackathon.registrationOpensAt).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-text-muted mt-1">Sign up as a participant and start exploring tracks.</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full bg-primary/80 ring-4 ring-primary/10" />
                    <h3 className="font-semibold text-text text-base">Registration Closes</h3>
                    <p className="text-sm text-text-muted mt-0.5">
                      {new Date(hackathon.registrationClosesAt).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-text-muted mt-1">Final deadline to register and complete team formation.</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
                    <h3 className="font-semibold text-text text-base">Submission Window</h3>
                    <p className="text-sm text-text-muted mt-0.5">
                      {new Date(hackathon.submissionOpensAt).toLocaleDateString()} &mdash;{" "}
                      {new Date(hackathon.submissionClosesAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-text-muted mt-1">Submit your project demo, code repository, and presentation slides.</p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "prizes" && (
            <div className="flex flex-col gap-6">
              <section className="rounded-2xl border border-black/[0.08] bg-surface p-6 shadow-xs">
                <h2 className="font-display text-xl font-semibold tracking-tight text-text mb-4">
                  Prize Structure
                </h2>
                <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-surface to-surface p-6 border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🏆</span>
                    <div>
                      <p className="text-xs font-semibold uppercase text-amber-600">Total Prize Pool</p>
                      <p className="font-display text-2xl font-extrabold text-text">{formatHackathonPrize(hackathon)}</p>
                    </div>
                  </div>
                </div>

                {Boolean(
                  (hackathon.prizeDistribution as any)?.firstPlaceAmount ||
                  (hackathon.prizeDistribution as any)?.secondPlaceAmount ||
                  (hackathon.prizeDistribution as any)?.thirdPlaceAmount
                ) && (
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {(hackathon.prizeDistribution as any)?.firstPlaceAmount && (
                      <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 text-center">
                        <span className="text-2xl">🥇</span>
                        <p className="text-xs font-bold text-amber-800 uppercase mt-1">1st Place</p>
                        <p className="font-display text-lg font-extrabold text-amber-900">
                          {(hackathon.prizeDistribution as any)?.currency === "ETB"
                            ? `${Number((hackathon.prizeDistribution as any).firstPlaceAmount).toLocaleString()} ETB`
                            : `$${Number((hackathon.prizeDistribution as any).firstPlaceAmount).toLocaleString()} USD`}
                        </p>
                      </div>
                    )}
                    {(hackathon.prizeDistribution as any)?.secondPlaceAmount && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-center">
                        <span className="text-2xl">🥈</span>
                        <p className="text-xs font-bold text-slate-700 uppercase mt-1">2nd Place</p>
                        <p className="font-display text-lg font-extrabold text-slate-900">
                          {(hackathon.prizeDistribution as any)?.currency === "ETB"
                            ? `${Number((hackathon.prizeDistribution as any).secondPlaceAmount).toLocaleString()} ETB`
                            : `$${Number((hackathon.prizeDistribution as any).secondPlaceAmount).toLocaleString()} USD`}
                        </p>
                      </div>
                    )}
                    {(hackathon.prizeDistribution as any)?.thirdPlaceAmount && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 text-center">
                        <span className="text-2xl">🥉</span>
                        <p className="text-xs font-bold text-amber-900 uppercase mt-1">3rd Place</p>
                        <p className="font-display text-lg font-extrabold text-amber-950">
                          {(hackathon.prizeDistribution as any)?.currency === "ETB"
                            ? `${Number((hackathon.prizeDistribution as any).thirdPlaceAmount).toLocaleString()} ETB`
                            : `$${Number((hackathon.prizeDistribution as any).thirdPlaceAmount).toLocaleString()} USD`}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === "rules" && (
            <div className="flex flex-col gap-6">
              <section className="rounded-2xl border border-black/[0.08] bg-surface p-6 shadow-xs">
                <h2 className="font-display text-xl font-semibold tracking-tight text-text mb-4">
                  Rules & Eligibility
                </h2>
                <div className="prose prose-sm max-w-none text-text-muted whitespace-pre-line leading-relaxed">
                  {hackathon.rules ||
                    "1. All teams must submit original work created during the hackathon period.\n2. Projects using existing open source code must clearly document external code.\n3. Respect code of conduct and maintain professional collaboration."}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Right 1 Column: Sticky Action Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="sticky top-6 flex flex-col gap-6 rounded-2xl border border-black/[0.08] bg-surface p-6 shadow-md">
            <h3 className="font-display text-lg font-semibold tracking-tight text-text">
              Quick Actions
            </h3>

            <div className="flex flex-col gap-3">
              <Link
                href={`/hackathons/${slug}/register`}
                className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-hover"
              >
                Register for Hackathon
              </Link>

              <Link
                href={`/hackathons/${slug}/team`}
                className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-black/10 bg-surface px-6 text-sm font-semibold text-text shadow-sm transition-all hover:bg-surface-alt"
              >
                Team Management Hub
              </Link>
            </div>

            <hr className="border-black/[0.06]" />

            <div className="flex flex-col gap-3 text-xs text-text-muted">
              <div className="flex justify-between items-start gap-2">
                <span>Location</span>
                <span className="font-semibold text-text text-right">
                  {hackathon.locationName || hackathon.locationMode || "Online / Virtual"}
                </span>
              </div>
              {hackathon.venue && (
                <div className="flex justify-between items-start gap-2">
                  <span>Venue</span>
                  <span className="font-medium text-text text-right">{hackathon.venue}</span>
                </div>
              )}
              {hackathon.field && (
                <div className="flex justify-between items-start gap-2">
                  <span>Field / Industry</span>
                  <span className="font-semibold text-[#0f6b5c] text-right">{hackathon.field}</span>
                </div>
              )}
              <div className="flex justify-between items-start gap-2">
                <span>Eligibility</span>
                <span className="font-medium text-amber-700 text-right">
                  {hackathon.openTo?.includes("ALL") || !hackathon.openTo?.length
                    ? "Everyone"
                    : hackathon.openTo?.includes("UNIVERSITY_STUDENT")
                    ? "University Students"
                    : "Government & Public Sector"}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span>Status</span>
                <span className="font-medium text-text">{hackathon.status || "PUBLISHED"}</span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span>Registration Closes</span>
                <span className="font-medium text-text">
                  {new Date(hackathon.registrationClosesAt).toLocaleDateString()}
                </span>
              </div>
              {hackathon.tags && hackathon.tags.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-2 border-t border-black/[0.06]">
                  <span className="text-[11px] font-bold text-text-muted">Tags</span>
                  <div className="flex flex-wrap gap-1">
                    {hackathon.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-surface-alt px-2 py-0.5 text-[10px] font-semibold text-text"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
