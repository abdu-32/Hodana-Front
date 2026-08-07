"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { listHackathons, MOCK_HACKATHONS } from "@/features/hackathons/lib/hackathons-client";
import type { Hackathon } from "@/lib/api-types-helpers";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const hackathonsQuery = useQuery({
    queryKey: ["hackathons", "public-list"],
    queryFn: listHackathons,
  });

  const hackathons: Hackathon[] = hackathonsQuery.data?.data ?? MOCK_HACKATHONS;

  return (
    <div className="min-h-screen bg-[#F5F5FA] text-[#1E1E2F]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-8 sm:px-6 lg:px-8">
        {/* ================= HERO SECTION ================= */}
        <section className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8 pt-4">
          {/* Left Hero Content */}
          <div className="flex flex-col items-start gap-6 lg:col-span-6">
            <div className="inline-flex items-center rounded-full bg-[#E0E0FE] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#4338CA] border border-[#C7C7FE]">
              National Innovation Framework
            </div>

            <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#1E1E38] sm:text-5xl lg:text-6xl leading-[1.15]">
              Powering Ethiopia's{" "}
              <span className="bg-gradient-to-r from-[#4F46E5] to-[#059669] bg-clip-text text-transparent">
                Digital Renaissance
              </span>
            </h1>

            <p className="text-base text-[#52526B] sm:text-lg leading-relaxed max-w-xl font-normal">
              The centralized gateway for Ethiopian talent to innovate, compete in national hackathons, and connect with global investors.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#hackathons"
                className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-[#4338CA] px-7 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-[#3730A3] hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Explore Hackathons &rarr;
              </a>
            </div>
          </div>

          {/* Right Hero Bento Cards Grid */}
          <div className="grid grid-cols-2 gap-4 lg:col-span-6">
            {/* Top Left Card: Developers Stat */}
            <div className="flex flex-col justify-between rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-[#4338CA]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Live</span>
              </div>
              <div className="mt-4">
                <p className="font-display text-2xl font-extrabold text-[#1E1E38] sm:text-3xl">5,400+</p>
                <p className="text-xs text-[#6B6B80] font-medium mt-0.5">Active Developers</p>
              </div>
            </div>

            {/* Top Right Card: Funding Stat (Solid Purple Card) */}
            <div className="flex flex-col justify-between rounded-2xl bg-[#4338CA] p-5 text-white shadow-md">
              <div className="flex items-center justify-between opacity-80">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mt-4">
                <p className="font-display text-2xl font-extrabold sm:text-3xl text-white">$1.2M</p>
                <p className="text-xs text-white/80 font-medium mt-0.5">Funding Distributed</p>
              </div>
            </div>

            {/* Bottom Left Card: Tech Summit Image */}
            <div className="relative h-44 overflow-hidden rounded-2xl border border-black/5 shadow-sm group">
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80"
                alt="Addis Tech Summit"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white border border-white/20">
                  Addis Tech Summit '24
                </span>
              </div>
            </div>

            {/* Bottom Right Card: Next Hackathon Countdown */}
            <div className="flex flex-col justify-between rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase text-[#6B6B80]">Next Hackathon</p>
              <div>
                <p className="font-display text-base font-bold text-[#1E1E38]">AgriTech Focus</p>
                <p className="text-xs font-semibold text-rose-500 mt-1 flex items-center gap-1">
                  <span>⏱️</span> 4 Days Remaining
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURED HACKATHONS SECTION ================= */}
        <section id="hackathons" className="flex flex-col gap-8 scroll-mt-8 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1E1E38]">
                Featured Hackathons
              </h2>
              <p className="mt-1 text-sm text-[#6B6B80]">
                Join the most prestigious tech competitions in the nation.
              </p>
            </div>

            {/* Carousel Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[#1E1E38] shadow-sm transition-colors hover:bg-gray-100"
                aria-label="Previous hackathons"
              >
                &larr;
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4338CA] text-white shadow-sm transition-colors hover:bg-[#3730A3]"
                aria-label="Next hackathons"
              >
                &rarr;
              </button>
            </div>
          </div>

          {/* Hackathons Cards Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {hackathons.map((h, idx) => {
              const isActive = idx % 2 === 0;
              return (
                <article
                  key={h.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Card Image Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={h.bannerUrl || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"}
                      alt={h.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold backdrop-blur-md ${
                          isActive
                            ? "bg-[#4338CA] text-white"
                            : "bg-[#EA580C] text-white"
                        }`}
                      >
                        {isActive ? "Active" : "Upcoming"}
                      </span>
                      {idx === 0 && (
                        <span className="rounded-md bg-[#EEF2FF] px-2.5 py-1 text-xs font-bold text-[#4338CA] border border-[#C7C7FE]">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col justify-between p-5 gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-bold text-[#1E1E38] group-hover:text-[#4338CA] transition-colors">
                          {h.title}
                        </h3>
                        <span className="text-xs font-extrabold text-[#4338CA] bg-indigo-50 px-2 py-0.5 rounded">
                          {h.prizeInfo}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#6B6B80] line-clamp-2">
                        {h.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-black/5 pt-3 text-xs">
                      <span className="text-[#6B6B80] font-medium">{h.locationMode}</span>
                      <Link
                        href={`/hackathons/${h.slug}/register`}
                        className="font-bold text-[#4338CA] hover:underline flex items-center gap-0.5"
                      >
                        Register ↗
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ================= DISCOVER & COLLABORATE SECTION ================= */}
        <section className="flex flex-col gap-8 pt-6">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1E1E38]">
              Discover & Collaborate
            </h2>
            <p className="text-sm text-[#6B6B80]">
              Build your dream team or showcase your groundbreaking innovations to the world.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Prototype Spotlight Feature Card */}
            <div className="relative overflow-hidden rounded-3xl lg:col-span-6 min-h-[340px] shadow-md group">
              <img
                src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1000&q=80"
                alt="Rift Valley Energy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white flex flex-col gap-2">
                <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md text-white border border-white/20">
                  PROTOTYPE SPOTLIGHT
                </span>
                <h3 className="font-display text-2xl font-bold text-white">
                  SmartGrid Rift Valley Energy
                </h3>
                <p className="text-xs text-white/80 leading-relaxed max-w-md">
                  Winner of CleanTech Hackathon. A decentralized solar grid management system for off-grid communities.
                </p>
              </div>
            </div>

            {/* Right Bento Grid */}
            <div className="grid grid-cols-1 gap-4 lg:col-span-6 sm:grid-cols-2">
              {/* Top Full Width Solid Blue Card */}
              <div className="sm:col-span-2 rounded-3xl bg-[#4338CA] p-6 text-white shadow-md flex flex-col justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Find Your Core Team</h3>
                  <p className="text-xs text-white/80 mt-1 max-w-md leading-relaxed">
                    Search 450+ open project roles. We need Designers, Data Scientists, and Market Experts.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <div className="flex -space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-200 text-xs font-bold text-[#4338CA] ring-2 ring-[#4338CA]">JS</div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-800 ring-2 ring-[#4338CA]">ME</div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800 ring-2 ring-[#4338CA]">AI</div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white ring-2 ring-[#4338CA] backdrop-blur-md">+12</div>
                  </div>
                </div>
              </div>

              {/* Bottom Left Burnt Orange Card */}
              <div className="rounded-3xl bg-[#C2410C] p-6 text-white shadow-md flex flex-col justify-between gap-4 min-h-[150px]">
                <span className="text-3xl">🚀</span>
                <div>
                  <p className="font-display text-3xl font-extrabold text-white">120</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/90">STARTUPS LAUNCHED</p>
                </div>
              </div>

              {/* Bottom Right White Policy Hub Card */}
              <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm flex flex-col justify-between gap-4 min-h-[150px]">
                <span className="text-3xl">📄</span>
                <div>
                  <h4 className="font-display text-base font-bold text-[#1E1E38]">Policy Hub</h4>
                  <p className="text-xs text-[#6B6B80] mt-1">Read the 2024 Ethiopian Startup Act guidelines.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= OUR ECOSYSTEM PARTNERS ================= */}
        <section className="flex flex-col gap-6 pt-8 pb-12 text-center border-t border-black/5">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#6B6B80]">
            OUR ECOSYSTEM PARTNERS
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-sm font-semibold text-[#6B6B80] opacity-80">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏛️</span> Ministry of Innovation
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🎓</span> AAU University
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">⚛️</span> Ecosystem Hub
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🌐</span> Global Tech Alliance
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🛡️</span> UNDP Ethiopia
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
