"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Terminal,
  Wallet,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Landmark,
  GraduationCap,
  Atom,
  Globe,
  ShieldCheck,
  Search,
  Sparkles,
  UserCheck,
  Layers,
  Award,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useToast } from "@/components/ui/Toast";
import { LegalModal, type LegalModalType } from "@/components/ui/LegalModal";

import { useSession } from "@/features/auth";
import {
  listHackathons,
  formatHackathonPrize,
  getPlatformStats,
  type PlatformStats,
} from "@/features/hackathons/lib/hackathons-client";
import type { Hackathon } from "@/lib/api-types-helpers";
import { userProjectsClient, type UserProject } from "@/features/projects/lib/user-projects-client";

export default function Home() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [activeModal, setActiveModal] = useState<LegalModalType>(null);
  const { showToast } = useToast();
  const { user, isAuthenticated, isLoading: isSessionLoading } = useSession();

  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const tHero = useTranslations("Hero");
  const tHackathons = useTranslations("FeaturedHackathons");
  const tCollaborate = useTranslations("DiscoverCollaborate");
  const tPartners = useTranslations("EcosystemPartners");
  const tNewsletter = useTranslations("Newsletter");

  // Fetch live hackathons, platform stats, and showcase projects data from backend/clients
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [hackathonsRes, projectsRes, statsRes] = await Promise.allSettled([
          listHackathons(),
          isAuthenticated ? userProjectsClient.getUserProjects() : userProjectsClient.getShowcaseProjects(),
          getPlatformStats(),
        ]);

        if (mounted) {
          if (hackathonsRes.status === "fulfilled" && hackathonsRes.value?.data) {
            setHackathons(hackathonsRes.value.data);
          }
          if (projectsRes.status === "fulfilled" && Array.isArray(projectsRes.value) && projectsRes.value.length > 0) {
            setProjects(projectsRes.value);
          } else {
            // Use showcase projects for landing page featured showcase if user has no personal projects
            const showcase = await userProjectsClient.getShowcaseProjects();
            if (mounted) setProjects(showcase);
          }
          if (statsRes.status === "fulfilled" && statsRes.value) {
            setPlatformStats(statsRes.value);
          }
        }
      } catch (err) {
        console.warn("Failed loading hero page backend data:", err);
      } finally {
        if (mounted) {
          setIsLoadingData(false);
        }
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  // Compute dynamic next hackathon and remaining days
  const nextHackathonInfo = useMemo(() => {
    if (!hackathons || hackathons.length === 0) {
      return {
        item: null,
        title: tHero("nextHackathonTitle"),
        daysRemaining: tHero("daysRemaining"),
        slug: "agristream-2024",
      };
    }

    const now = Date.now();
    // Find hackathons where registration or submission closes in the future
    const activeOrUpcoming = hackathons
      .filter((h) => {
        const regEnd = h.registrationClosesAt ? new Date(h.registrationClosesAt).getTime() : 0;
        const subEnd = h.submissionClosesAt ? new Date(h.submissionClosesAt).getTime() : 0;
        return (regEnd > now || subEnd > now) && !h.isSuspended;
      })
      .sort((a, b) => {
        const dateA = new Date(a.registrationClosesAt || a.submissionClosesAt || 0).getTime();
        const dateB = new Date(b.registrationClosesAt || b.submissionClosesAt || 0).getTime();
        return dateA - dateB;
      });

    const candidate = activeOrUpcoming[0] || hackathons[0];
    const targetDate = new Date(candidate.registrationClosesAt || candidate.submissionClosesAt || now).getTime();
    const diffDays = Math.max(1, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)));
    const rawSlug = candidate.slug || candidate.id;
    const cleanSlug = rawSlug && rawSlug !== "string" ? rawSlug : "agristream-2024";

    return {
      item: candidate,
      title: candidate.title && candidate.title !== "string" ? candidate.title : tHero("nextHackathonTitle"),
      daysRemaining: `${diffDays} Days Remaining`,
      slug: cleanSlug,
    };
  }, [hackathons, tHero]);

  // Real active developers count from backend database
  const activeDevelopersDisplay = useMemo(() => {
    if (platformStats && typeof platformStats.activeDevelopers === "number") {
      const count = platformStats.activeDevelopers;
      return count >= 1000 ? `${(count / 1000).toFixed(1)}k+` : `${count}`;
    }
    return tHero("devCount");
  }, [platformStats, tHero]);

  // Compute dynamic funding & total prizes
  const dynamicFundingStats = useMemo(() => {
    if (platformStats && typeof platformStats.totalPrizeVolumeETB === "number" && platformStats.totalPrizeVolumeETB > 0) {
      const volume = platformStats.totalPrizeVolumeETB;
      return volume >= 1000000
        ? `${(volume / 1000000).toFixed(1)}M ETB`
        : volume >= 1000
        ? `${Math.round(volume / 1000)}k ETB`
        : `${volume} ETB`;
    }
    if (!hackathons || hackathons.length === 0) return tHero("fundingAmount");
    // Calculate sum of extracted numerical prizes or default formatted string
    let totalPrizes = 0;
    for (const h of hackathons) {
      if (h.totalPrizeBudget !== undefined && h.totalPrizeBudget !== null && Number(h.totalPrizeBudget) > 0) {
        totalPrizes += Number(h.totalPrizeBudget);
      } else {
        const match = (h.prizeInfo || "").match(/(\d+[\d,]*)/);
        if (match) {
          totalPrizes += parseInt(match[1].replace(/,/g, ""), 10);
        }
      }
    }
    if (totalPrizes > 0) {
      return totalPrizes >= 1000 ? `$${Math.round(totalPrizes / 1000)}k+` : `$${totalPrizes}`;
    }
    return tHero("fundingAmount");
  }, [platformStats, hackathons, tHero]);

  // Spotlight project from backend projects
  const spotlightProject = useMemo(() => {
    if (projects && projects.length > 0) {
      const priority = projects.find((p) => p.isPriority) || projects[0];
      return priority;
    }
    return null;
  }, [projects]);

  // Carousel items (3 cards per page)
  const itemsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil((hackathons.length || itemsPerPage) / itemsPerPage));
  const currentHackathons = useMemo(() => {
    if (hackathons.length === 0) return [];
    const start = carouselIndex * itemsPerPage;
    return hackathons.slice(start, start + itemsPerPage);
  }, [hackathons, carouselIndex]);

  const handlePrevCarousel = () => {
    setCarouselIndex((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNextCarousel = () => {
    setCarouselIndex((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubscribing) return;

    setIsSubscribing(true);
    // Simulate brief network submission
    await new Promise((res) => setTimeout(res, 600));
    setIsSubscribing(false);
    showToast(tNewsletter("toastSuccess"), "success");
    setEmail("");
  };

  const isOrganizer = user?.roles?.some((r) => r.toLowerCase().includes("organizer"));
  const isJudge = user?.roles?.some((r) => r.toLowerCase().includes("judge"));

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#122622]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-6 sm:px-6 lg:px-8">
        {/* ================= HERO SECTION ================= */}
        <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8 pt-4 pb-4">
          {/* Left Hero Content */}
          <div className="flex flex-col items-start gap-6 lg:col-span-6">
            {/* User Greeting Pill if Authenticated */}
            {isAuthenticated && user ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f3f0] pl-2 pr-4 py-1 text-xs font-bold text-[#0f6b5c] border border-[#d6e7e1] shadow-xs">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0f6b5c] text-[10px] text-white">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </span>
                <span>
                  Welcome back, <strong className="font-extrabold">{user.fullName || user.email.split("@")[0]}</strong>
                </span>
                {user.verificationStatus === "verified" && (
                  <span title="Verified User" className="inline-flex items-center">
                    <UserCheck className="h-3.5 w-3.5 text-[#0f6b5c]" />
                  </span>
                )}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f3f0] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0f6b5c] border border-[#d6e7e1] shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{tHero("pillTag")}</span>
              </div>
            )}

            <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#122622] sm:text-5xl lg:text-6xl leading-[1.12]">
              {tHero("titlePart1")}{" "}
              <span className="text-[#0f6b5c] font-extrabold block sm:inline">
                {tHero("titlePart2")}
              </span>
            </h1>

            <p className="text-base text-[#57685f] sm:text-lg leading-relaxed max-w-xl font-normal">
              {tHero("description")}
            </p>

            {/* Mobile-only: Register CTA right below description */}
            {!isAuthenticated && (
              <Link
                href="/signup"
                className="md:hidden inline-flex w-full items-center justify-center gap-2.5 min-h-[50px] rounded-2xl bg-[#0f6b5c] px-6 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-[#0b5347] hover:shadow-lg"
              >
                <span>Register Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/hackathons"
                className="inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-2xl bg-[#0f6b5c] px-7 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-[#0b5347] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span>{tHero("exploreBtn")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-[#d6e7e1] bg-white px-5 text-sm font-bold text-[#0f6b5c] shadow-2xs transition-all hover:bg-[#e8f3f0]"
                  >
                    <Layers className="h-4 w-4" />
                    <span>{tHero("forParticipants")}</span>
                  </Link>

                  <Link
                    href={isOrganizer ? "/organizer/dashboard" : "/onboarding/organizer"}
                    className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0] px-5 text-sm font-bold text-[#0f6b5c] shadow-2xs transition-all hover:bg-[#d6e7e1]"
                  >
                    <Award className="h-4 w-4" />
                    <span>{tHero("forOrganizers")}</span>
                  </Link>

                  {isJudge && (
                    <Link
                      href="/judge/dashboard"
                      className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-[#d6e7e1] bg-amber-50 px-5 text-sm font-bold text-amber-900 shadow-2xs transition-all hover:bg-amber-100"
                    >
                      <span>Judge Portal</span>
                    </Link>
                  )}
                </>
              ) : (
                /* "Join Platform" secondary CTA — only on desktop (mobile uses Register above) */
                <Link
                  href="/signup"
                  className="hidden md:inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-2xl border border-[#d6e7e1] bg-white px-6 text-sm font-bold text-[#0f6b5c] shadow-2xs transition-all hover:bg-[#e8f3f0]"
                >
                  <span>Join Platform</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Right Hero Bento Grid (2x2 on sm+, 1 col on mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:col-span-6">
            {/* Card 1: Developers Stat */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#d6e7e1] bg-white p-5 shadow-xs hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between text-[#0f6b5c]">
                <Terminal className="h-5 w-5" />
                <span className="text-[10px] font-bold text-[#0f6b5c] bg-[#e8f3f0] px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
              <div className="mt-6">
                <p className="font-display text-2xl font-extrabold text-[#122622] sm:text-3xl">
                  {activeDevelopersDisplay}
                </p>
                <p className="text-xs text-[#57685f] font-medium mt-0.5">{tHero("devLabel")}</p>
              </div>
            </div>

            {/* Card 2: Funding Stat */}
            <div className="flex flex-col justify-between rounded-2xl bg-[#0f6b5c] p-5 text-white shadow-md">
              <div className="flex items-center justify-between opacity-90">
                <Wallet className="h-5 w-5" />
                <span className="text-[10px] font-bold text-white/90 bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-xs">
                  Grants
                </span>
              </div>
              <div className="mt-6">
                <p className="font-display text-2xl font-extrabold sm:text-3xl text-white">
                  {dynamicFundingStats}
                </p>
                <p className="text-xs text-white/80 font-medium mt-0.5">{tHero("fundingLabel")}</p>
              </div>
            </div>

            {/* Card 3: Addis Tech Summit Image */}
            <Link
              href="/hackathons"
              className="relative h-44 overflow-hidden rounded-2xl border border-black/5 shadow-xs group block"
            >
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80"
                alt="Addis Tech Summit"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="rounded-lg bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white border border-white/20 inline-block group-hover:bg-[#0f6b5c] transition-colors">
                  {tHero("summitTitle")}
                </span>
              </div>
            </Link>

            {/* Card 4: Dynamic Next Hackathon */}
            <Link
              href={`/hackathons/${nextHackathonInfo.slug}`}
              className="flex flex-col justify-between rounded-2xl border border-[#d6e7e1] bg-white p-5 shadow-xs hover:border-[#0f6b5c] transition-all group block"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#57685f]">
                  {tHero("nextHackathonTag")}
                </p>
                <ArrowRight className="h-3.5 w-3.5 text-[#57685f] group-hover:text-[#0f6b5c] transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mt-2">
                <p className="font-display text-base font-bold text-[#122622] group-hover:text-[#0f6b5c] transition-colors line-clamp-1">
                  {nextHackathonInfo.title}
                </p>
                <p className="text-xs font-bold text-[#b45309] mt-1.5 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {nextHackathonInfo.daysRemaining}
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* ================= FEATURED HACKATHONS SECTION ================= */}
        <section id="hackathons" className="flex flex-col gap-8 scroll-mt-8 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#122622]">
                {tHackathons("title")}
              </h2>
              <p className="mt-1 text-sm text-[#57685f]">
                {tHackathons("subtitle")}
              </p>
            </div>

            {/* Carousel Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevCarousel}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-[#122622] shadow-xs transition-colors hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                aria-label="Previous hackathons"
                disabled={totalPages <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextCarousel}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f6b5c] text-white shadow-md transition-colors hover:bg-[#0b5347] cursor-pointer disabled:opacity-50"
                aria-label="Next hackathons"
                disabled={totalPages <= 1}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Hackathons Cards Grid */}
          {isLoadingData ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="animate-pulse flex flex-col rounded-2xl border border-[#d6e7e1] bg-white overflow-hidden p-0"
                >
                  <div className="h-48 bg-gray-200 w-full" />
                  <div className="p-5 flex flex-col gap-3">
                    <div className="h-5 bg-gray-200 rounded-md w-3/4" />
                    <div className="h-4 bg-gray-100 rounded-md w-full" />
                    <div className="h-4 bg-gray-100 rounded-md w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : currentHackathons.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {currentHackathons.map((h) => {
                const now = Date.now();
                const isUpcoming = h.registrationOpensAt && new Date(h.registrationOpensAt).getTime() > now;
                const isFeatured = h.tags?.some((t) => t.toLowerCase().includes("featured")) || true;
                const rawSlug = h.slug || h.id;
                const slug = rawSlug && rawSlug !== "string" ? rawSlug : "agristream-2024";

                return (
                  <article
                    key={h.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#d6e7e1] bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    <Link href={`/hackathons/${slug}`} className="relative h-48 w-full overflow-hidden bg-gray-100 block">
                      <img
                        src={
                          h.bannerUrl ||
                          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={h.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        {isUpcoming ? (
                          <span className="rounded-md bg-[#b45309] px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                            {tHackathons("upcomingBadge")}
                          </span>
                        ) : (
                          <span className="rounded-md bg-[#16793d] px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                            {tHackathons("activeBadge")}
                          </span>
                        )}
                        {isFeatured && (
                          <span className="rounded-md bg-[#0f6b5c] px-2.5 py-1 text-xs font-bold text-white shadow-xs flex items-center gap-1">
                            {tHackathons("featuredBadge")}
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="flex flex-1 flex-col justify-between p-5 gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/hackathons/${slug}`}
                            className="font-display text-lg font-bold text-[#122622] group-hover:text-[#0f6b5c] transition-colors line-clamp-1"
                          >
                            {h.title}
                          </Link>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-extrabold text-[#0f6b5c]">
                              {formatHackathonPrize(h)}
                            </span>
                            <span className="block text-[10px] font-medium text-[#57685f]">
                              {tHackathons("prizeTag")}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs leading-relaxed text-[#57685f] line-clamp-2">
                          {h.description || "Join innovators across Ethiopia to build groundbreaking solutions."}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-[#57685f] font-medium">
                        <span className="line-clamp-1 max-w-[160px]">{h.locationMode || "Addis Ababa | Hybrid"}</span>
                        <Link
                          href={`/hackathons/${slug}/register`}
                          className="font-bold text-[#0f6b5c] hover:underline shrink-0"
                        >
                          {tHackathons("registerLink")}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#d6e7e1] p-12 text-center text-sm text-[#57685f]">
              No active hackathons found at the moment.
            </div>
          )}
        </section>

        {/* ================= DISCOVER & COLLABORATE SECTION ================= */}
        <section id="startups" className="flex flex-col gap-8 pt-8">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0f6b5c]">
              {tCollaborate("title")}
            </h2>
            <p className="text-sm text-[#57685f]">
              {tCollaborate("subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Spotlight Feature Card */}
            <div className="relative overflow-hidden rounded-3xl lg:col-span-6 min-h-[360px] shadow-md group">
              <img
                src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1000&q=80"
                alt={spotlightProject?.title || "SolarFlow: Rift Valley Energy"}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white flex flex-col gap-2.5">
                <span className="w-fit rounded-md bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md text-white border border-white/30">
                  {tCollaborate("spotlightTag")}
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                  {spotlightProject ? spotlightProject.title : tCollaborate("spotlightTitle")}
                </h3>
                <p className="text-xs text-white/90 leading-relaxed max-w-md line-clamp-2">
                  {spotlightProject ? spotlightProject.description : tCollaborate("spotlightDesc")}
                </p>

                {spotlightProject?.demoUrl && spotlightProject.demoUrl !== "string" && (
                  <a
                    href={
                      spotlightProject.demoUrl.startsWith("http://") || spotlightProject.demoUrl.startsWith("https://")
                        ? spotlightProject.demoUrl
                        : `https://${spotlightProject.demoUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-[#86efac] hover:underline"
                  >
                    <span>Visit Live Prototype</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Right Bento Grid */}
            <div className="grid grid-cols-1 gap-4 lg:col-span-6 sm:grid-cols-2">
              {/* Top Full Width Dark Green Card */}
              <div className="sm:col-span-2 rounded-3xl bg-[#0f6b5c] p-6 text-white shadow-md flex flex-col justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">{tCollaborate("teamTitle")}</h3>
                  <p className="text-xs text-white/80 mt-1.5 max-w-md leading-relaxed">
                    {tCollaborate("teamDesc")}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[10px] font-extrabold text-white border border-white/30 backdrop-blur-md">
                    JS
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[10px] font-extrabold text-white border border-white/30 backdrop-blur-md">
                    ME
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[10px] font-extrabold text-white border border-white/30 backdrop-blur-md">
                    AI
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/30 text-[10px] font-extrabold text-white border border-white/30 backdrop-blur-md px-1">
                    +{projects.length > 0 ? projects.length * 4 : 12}
                  </span>
                </div>
              </div>

              {/* Bottom Left Burnt Orange Card */}
              <div className="rounded-3xl bg-[#b45309] p-6 text-white shadow-md flex flex-col justify-between min-h-[150px]">
                <div className="w-2 h-2 rounded-full bg-white/60" />
                <div>
                  <p className="font-display text-4xl font-extrabold text-white">
                    {projects.length > 0 ? `${projects.length * 30}+` : tCollaborate("startupsCount")}
                  </p>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-white/90 mt-1">
                    {tCollaborate("startupsLabel")}
                  </p>
                </div>
              </div>

              {/* Bottom Right Policy Hub White Card */}
              <div
                id="policy"
                onClick={() => setActiveModal("policy")}
                className="rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-xs flex flex-col justify-between min-h-[150px] cursor-pointer hover:border-[#0f6b5c]/40 transition-colors group"
              >
                <div className="h-8 w-8 rounded-lg bg-[#e8f3f0] flex items-center justify-center text-[#0f6b5c] group-hover:bg-[#0f6b5c] group-hover:text-white transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-base font-bold text-[#122622] group-hover:text-[#0f6b5c] transition-colors">
                    {tCollaborate("policyTitle")}
                  </h4>
                  <p className="text-xs text-[#57685f] mt-1">{tCollaborate("policyDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= OUR ECOSYSTEM PARTNERS ================= */}
        <section id="programs" className="flex flex-col gap-6 pt-10 pb-6 text-center border-t border-[#d6e7e1]">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#57685f]">
            {tPartners("title")}
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-xs sm:text-sm font-semibold text-[#57685f]">
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-[#57685f]" />
              <span>{tPartners("ministry")}</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#57685f]" />
              <span>{tPartners("university")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Atom className="h-4 w-4 text-[#57685f]" />
              <span>{tPartners("hub")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#57685f]" />
              <span>{tPartners("alliance")}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#57685f]" />
              <span>{tPartners("undp")}</span>
            </div>
          </div>
        </section>

        {/* ================= NEWSLETTER SUBSCRIPTION ================= */}
        <section className="w-full rounded-3xl bg-[#0e2b25] py-12 px-6 sm:px-12 text-center text-white shadow-xl my-4">
          <div className="max-w-2xl mx-auto flex flex-col gap-3">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              {tNewsletter("title")}
            </h2>
            <p className="text-xs sm:text-sm text-[#e8f3f0]/90 leading-relaxed">
              {tNewsletter("subtitle")}
            </p>

            <form onSubmit={handleSubscribe} className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <input
                type="email"
                placeholder={tNewsletter("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full sm:w-80 rounded-2xl bg-white px-5 py-3.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f6b5c] shadow-inner"
                required
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="w-full sm:w-auto rounded-2xl bg-[#0f6b5c] px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-[#0b5347] transition-colors cursor-pointer shadow-xs disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubscribing && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{tNewsletter("subscribeCta")}</span>
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Floating Action / Search Button */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#0f6b5c] text-white shadow-xl hover:bg-[#0b5347] transition-all hover:scale-105 cursor-pointer"
        aria-label="Search or back to top"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Legal Popup Modal */}
      <LegalModal type={activeModal} onClose={() => setActiveModal(null)} />
    </div>
  );
}

