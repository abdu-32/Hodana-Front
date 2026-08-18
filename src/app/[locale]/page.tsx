"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useToast } from "@/components/ui/Toast";
import { LegalModal, type LegalModalType } from "@/components/ui/LegalModal";

import { useSession } from "@/features/auth";

export default function Home() {
  const [email, setEmail] = useState("");
  const [activeModal, setActiveModal] = useState<LegalModalType>(null);
  const { showToast } = useToast();
  const { isAuthenticated } = useSession();

  const tHero = useTranslations("Hero");
  const tHackathons = useTranslations("FeaturedHackathons");
  const tCollaborate = useTranslations("DiscoverCollaborate");
  const tPartners = useTranslations("EcosystemPartners");
  const tNewsletter = useTranslations("Newsletter");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      showToast(tNewsletter("toastSuccess"), "success");
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#122622]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-6 sm:px-6 lg:px-8">
        {/* ================= HERO SECTION ================= */}
        <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8 pt-4 pb-4">
          {/* Left Hero Content */}
          <div className="flex flex-col items-start gap-6 lg:col-span-6">
            <div className="inline-flex items-center rounded-full bg-[#e8f3f0] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0f6b5c] border border-[#d6e7e1] shadow-xs">
              {tHero("pillTag")}
            </div>

            <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#122622] sm:text-5xl lg:text-6xl leading-[1.12]">
              {tHero("titlePart1")}{" "}
              <span className="text-[#0f6b5c] font-extrabold block sm:inline">
                {tHero("titlePart2")}
              </span>
            </h1>

            <p className="text-base text-[#57685f] sm:text-lg leading-relaxed max-w-xl font-normal">
              {tHero("description")}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/hackathons"
                className="inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-2xl bg-[#0f6b5c] px-7 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-[#0b5347] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span>{tHero("exploreBtn")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-2xl border border-[#d6e7e1] bg-white px-6 text-sm font-bold text-[#0f6b5c] shadow-2xs transition-all hover:bg-[#e8f3f0]"
                  >
                    <span>{tHero("forParticipants")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/organizer/dashboard"
                    className="inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0] px-6 text-sm font-bold text-[#0f6b5c] shadow-2xs transition-all hover:bg-[#d6e7e1]"
                  >
                    <span>{tHero("forOrganizers")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Hero Bento Grid (2x2) */}
          <div className="grid grid-cols-2 gap-4 lg:col-span-6">
            {/* Card 1: Developers Stat */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#d6e7e1] bg-white p-5 shadow-xs hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between text-[#0f6b5c]">
                <Terminal className="h-5 w-5" />
              </div>
              <div className="mt-6">
                <p className="font-display text-2xl font-extrabold text-[#122622] sm:text-3xl">{tHero("devCount")}</p>
                <p className="text-xs text-[#57685f] font-medium mt-0.5">{tHero("devLabel")}</p>
              </div>
            </div>

            {/* Card 2: Funding Stat */}
            <div className="flex flex-col justify-between rounded-2xl bg-[#0f6b5c] p-5 text-white shadow-md">
              <div className="flex items-center justify-between opacity-90">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="mt-6">
                <p className="font-display text-2xl font-extrabold sm:text-3xl text-white">{tHero("fundingAmount")}</p>
                <p className="text-xs text-white/80 font-medium mt-0.5">{tHero("fundingLabel")}</p>
              </div>
            </div>

            {/* Card 3: Addis Tech Summit Image */}
            <div className="relative h-44 overflow-hidden rounded-2xl border border-black/5 shadow-xs group">
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80"
                alt="Addis Tech Summit"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="rounded-lg bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white border border-white/20 inline-block">
                  {tHero("summitTitle")}
                </span>
              </div>
            </div>

            {/* Card 4: Next Hackathon */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#d6e7e1] bg-white p-5 shadow-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#57685f]">{tHero("nextHackathonTag")}</p>
              <div className="mt-2">
                <p className="font-display text-base font-bold text-[#122622]">{tHero("nextHackathonTitle")}</p>
                <p className="text-xs font-bold text-[#b45309] mt-1.5 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {tHero("daysRemaining")}
                </p>
              </div>
            </div>
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
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-[#122622] shadow-xs transition-colors hover:bg-gray-50 cursor-pointer"
                aria-label="Previous hackathons"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f6b5c] text-white shadow-md transition-colors hover:bg-[#0b5347] cursor-pointer"
                aria-label="Next hackathons"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Hackathons Cards Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Card 1: AgriStream */}
            <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#d6e7e1] bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
                  alt="AgriStream"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="rounded-md bg-[#16793d] px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                    {tHackathons("activeBadge")}
                  </span>
                  <span className="rounded-md bg-[#0f6b5c] px-2.5 py-1 text-xs font-bold text-white shadow-xs flex items-center gap-1">
                    {tHackathons("featuredBadge")}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between p-5 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-[#122622] group-hover:text-[#0f6b5c] transition-colors">
                      AgriStream 2024
                    </h3>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[#0f6b5c]">
                        $15,000
                      </span>
                      <span className="block text-[10px] font-medium text-[#57685f]">{tHackathons("prizeTag")}</span>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-[#57685f]">
                    Revolutionizing supply chain efficiency for small-holder farmers using blockchain and IoT.
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-[#57685f] font-medium">
                  <span>Addis Ababa | Hybrid</span>
                  <Link href="/hackathons/agristream-2024/register" className="font-bold text-[#0f6b5c] hover:underline">
                    {tHackathons("registerLink")}
                  </Link>
                </div>
              </div>
            </article>

            {/* Card 2: FinTech Frontier */}
            <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#d6e7e1] bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
                  alt="FinTech Frontier"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="rounded-md bg-[#b45309] px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                    {tHackathons("upcomingBadge")}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between p-5 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-[#122622] group-hover:text-[#0f6b5c] transition-colors">
                      FinTech Frontier
                    </h3>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[#0f6b5c]">
                        $25,000
                      </span>
                      <span className="block text-[10px] font-medium text-[#57685f]">{tHackathons("prizeTag")}</span>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-[#57685f]">
                    Building accessible micro-payment solutions for local commerce and cross-border trade.
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-[#57685f] font-medium">
                  <span>Virtual</span>
                  <Link href="/hackathons/fintech-frontier-2024/register" className="font-bold text-[#0f6b5c] hover:underline">
                    {tHackathons("registerLink")}
                  </Link>
                </div>
              </div>
            </article>

            {/* Card 3: Ethio-Health AI */}
            <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#d6e7e1] bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
                  alt="Ethio-Health AI"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="rounded-md bg-[#16793d] px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                    {tHackathons("activeBadge")}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between p-5 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-[#122622] group-hover:text-[#0f6b5c] transition-colors">
                      Ethio-Health AI
                    </h3>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[#0f6b5c]">
                        $40,000
                      </span>
                      <span className="block text-[10px] font-medium text-[#57685f]">{tHackathons("prizeTag")}</span>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-[#57685f]">
                    Leveraging machine learning to improve maternal health outcomes and diagnostic accuracy.
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-[#57685f] font-medium">
                  <span>Bahir Dar | In-person</span>
                  <Link href="/hackathons/ethio-health-ai-2024/register" className="font-bold text-[#0f6b5c] hover:underline">
                    {tHackathons("registerLink")}
                  </Link>
                </div>
              </div>
            </article>
          </div>
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
                alt="SolarFlow: Rift Valley Energy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white flex flex-col gap-2.5">
                <span className="w-fit rounded-md bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md text-white border border-white/30">
                  {tCollaborate("spotlightTag")}
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                  {tCollaborate("spotlightTitle")}
                </h3>
                <p className="text-xs text-white/90 leading-relaxed max-w-md">
                  {tCollaborate("spotlightDesc")}
                </p>
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
                    +12
                  </span>
                </div>
              </div>

              {/* Bottom Left Burnt Orange Card */}
              <div className="rounded-3xl bg-[#b45309] p-6 text-white shadow-md flex flex-col justify-between min-h-[150px]">
                <div className="w-2 h-2 rounded-full bg-white/60" />
                <div>
                  <p className="font-display text-4xl font-extrabold text-white">{tCollaborate("startupsCount")}</p>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-white/90 mt-1">{tCollaborate("startupsLabel")}</p>
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
                  <h4 className="font-display text-base font-bold text-[#122622] group-hover:text-[#0f6b5c] transition-colors">{tCollaborate("policyTitle")}</h4>
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
                className="w-full sm:w-auto rounded-2xl bg-[#0f6b5c] px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-[#0b5347] transition-colors cursor-pointer shadow-xs"
              >
                {tNewsletter("subscribeCta")}
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Floating Action / Search Button */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
