"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Search, ChevronDown, Rocket, ArrowRight, ShieldCheck, HeartPulse, Truck, Sprout, BookOpen, CreditCard } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface Startup {
  id: string;
  name: string;
  isTopTier?: boolean;
  description: string;
  industry: string;
  launchYear: string;
  stage: "Growth" | "Seed";
  logoBg: string;
  logoIcon: React.ReactNode;
}

const MOCK_STARTUPS: Startup[] = [
  {
    id: "kifya-digital",
    name: "Kifya Digital",
    isTopTier: true,
    description: "Revolutionizing mobile lending for rural farmers through AI-driven credit scoring.",
    industry: "FinTech",
    launchYear: "2023",
    stage: "Growth",
    logoBg: "bg-indigo-600",
    logoIcon: <CreditCard className="h-5 w-5 text-white" />,
  },
  {
    id: "medx-ethiopia",
    name: "MedX Ethiopia",
    description: "Digital telemedicine network connecting urban specialists with rural clinics.",
    industry: "HealthTech",
    launchYear: "2024",
    stage: "Seed",
    logoBg: "bg-[#9A3412]",
    logoIcon: <HeartPulse className="h-5 w-5 text-white" />,
  },
  {
    id: "z-logistics",
    name: "Z-Logistics",
    description: "Last-mile delivery using solar-powered e-bikes across Addis Ababa.",
    industry: "Logistics",
    launchYear: "2022",
    stage: "Growth",
    logoBg: "bg-sky-500",
    logoIcon: <Truck className="h-5 w-5 text-white" />,
  },
  {
    id: "agrismart",
    name: "AgriSmart",
    description: "IoT-based soil monitoring and automated irrigation for large-scale coffee plantations.",
    industry: "AgriTech",
    launchYear: "2024",
    stage: "Seed",
    logoBg: "bg-blue-600",
    logoIcon: <Sprout className="h-5 w-5 text-white" />,
  },
  {
    id: "learnabb",
    name: "LearnAbb",
    description: "Gamified coding curriculum for public schools in Amharic and Oromiffa.",
    industry: "EdTech",
    launchYear: "2023",
    stage: "Seed",
    logoBg: "bg-purple-600",
    logoIcon: <BookOpen className="h-5 w-5 text-white" />,
  },
  {
    id: "safipay",
    name: "SafiPay",
    description: "Seamless cross-border payment gateway for Ethiopian exporters to the EU.",
    industry: "FinTech",
    launchYear: "2024",
    stage: "Growth",
    logoBg: "bg-indigo-500",
    logoIcon: <CreditCard className="h-5 w-5 text-white" />,
  },
];

export default function StartupsPage() {
  const t = useTranslations("StartupsPage");

  const [selectedIndustry, setSelectedIndustry] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedStage, setSelectedStage] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredStartups = useMemo(() => {
    return MOCK_STARTUPS.filter((item) => {
      if (selectedIndustry !== "All" && item.industry !== selectedIndustry) return false;
      if (selectedYear !== "All" && item.launchYear !== selectedYear) return false;
      if (selectedStage !== "All" && item.stage !== selectedStage) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.industry.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedIndustry, selectedYear, selectedStage, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#122622]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
        {/* ================= PAGE HEADER ================= */}
        <section className="flex flex-col items-start gap-3 pt-4">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#122622] sm:text-5xl">
            {t("title")}
          </h1>
          <p className="text-base text-[#57685f] sm:text-lg leading-relaxed max-w-3xl">
            {t("subtitle")}
          </p>
        </section>

        {/* ================= FILTER CONTROLS BAR ================= */}
        <section className="rounded-2xl border border-[#d6e7e1] bg-white/80 p-4 shadow-xs backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left Filter Dropdowns & Stage Pills */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Industry Select */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#57685f] uppercase tracking-wider">
                  {t("industryLabel")}
                </label>
                <div className="relative">
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-2 pr-9 text-xs font-semibold text-[#122622] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]"
                  >
                    <option value="All">{t("allIndustries")}</option>
                    <option value="FinTech">FinTech</option>
                    <option value="HealthTech">HealthTech</option>
                    <option value="AgriTech">AgriTech</option>
                    <option value="Logistics">Logistics</option>
                    <option value="EdTech">EdTech</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Launch Year Select */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#57685f] uppercase tracking-wider">
                  {t("yearLabel")}
                </label>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-2 pr-9 text-xs font-semibold text-[#122622] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]"
                  >
                    <option value="All">{t("allYears")}</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Stage Pills */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#57685f] uppercase tracking-wider">
                  {t("stageLabel")}
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedStage(selectedStage === "Growth" ? "All" : "Growth")}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      selectedStage === "Growth"
                        ? "bg-[#0f6b5c] text-white shadow-xs"
                        : "border border-gray-200 bg-white text-[#57685f] hover:bg-gray-50"
                    }`}
                  >
                    {t("growthStage")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStage(selectedStage === "Seed" ? "All" : "Seed")}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      selectedStage === "Seed"
                        ? "bg-[#0f6b5c] text-white shadow-xs"
                        : "border border-gray-200 bg-white text-[#57685f] hover:bg-gray-50"
                    }`}
                  >
                    {t("seedStage")}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Search Input */}
            <div className="relative w-full sm:w-64 pt-2 sm:pt-0">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-white py-2 pl-9 pr-4 text-xs font-medium text-[#122622] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f6b5c] shadow-xs"
              />
            </div>
          </div>
        </section>

        {/* ================= STARTUPS CARDS GRID ================= */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredStartups.map((s) => (
            <article
              key={s.id}
              className="flex flex-col justify-between rounded-2xl border border-[#d6e7e1] bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex flex-col gap-4">
                {/* Header: Logo Icon & Top Tier Badge */}
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.logoBg} shadow-xs`}>
                    {s.logoIcon}
                  </div>
                  {s.isTopTier && (
                    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#b45309] border border-amber-200">
                      {t("topTierBadge")}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-display text-lg font-bold text-[#122622]">
                    {s.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#57685f] leading-relaxed line-clamp-3">
                    {s.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="rounded-md bg-[#e8f3f0] px-2.5 py-0.5 text-[11px] font-bold text-[#0f6b5c]">
                    {s.industry}
                  </span>
                  <span className="text-[11px] font-medium text-[#57685f]">
                    • Launched {s.launchYear}
                  </span>
                </div>
              </div>

              {/* View Profile Action */}
              <div className="mt-6 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  className="w-full rounded-xl border border-[#d6e7e1] bg-white py-2 text-xs font-bold text-[#0f6b5c] shadow-2xs hover:bg-[#e8f3f0] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{t("viewProfile")}</span>
                </button>
              </div>
            </article>
          ))}

          {/* CTA Card: Your Startup Next? */}
          <article className="flex flex-col items-center justify-between text-center rounded-2xl bg-[#0f6b5c] p-6 text-white shadow-md border-2 border-dashed border-[#0b5347] min-h-[300px]">
            <div className="flex flex-col items-center gap-3 my-auto">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display text-xl font-extrabold text-white">
                {t("ctaTitle")}
              </h3>
              <p className="text-xs text-[#e8f3f0] leading-relaxed max-w-xs">
                {t("ctaSubtitle")}
              </p>
            </div>

            <Link
              href="/signup"
              className="w-full rounded-2xl bg-[#c68a00] py-3 text-xs font-bold text-white shadow-md hover:bg-[#b07b00] transition-colors cursor-pointer"
            >
              {t("applyNow")}
            </Link>
          </article>
        </section>

        {/* ================= LOAD MORE CONTROL ================= */}
        <section className="flex items-center justify-center pt-4 pb-8">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-2.5 text-xs font-bold text-[#122622] shadow-xs hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span>{t("loadMore")}</span>
          </button>
        </section>
      </main>
    </div>
  );
}
