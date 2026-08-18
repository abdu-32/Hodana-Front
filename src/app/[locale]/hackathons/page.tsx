"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  MapPin,
  Tag,
  Calendar,
  Bookmark,
  Heart,
  ArrowRight,
  ChevronDown,
  Building2,
  Sparkles,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { hackathonsClient } from "@/features/hackathons";

interface HackathonItem {
  id: string;
  slug: string;
  title: string;
  isFeatured?: boolean;
  category: string;
  description: string;
  status: "Active" | "Upcoming" | "Ended";
  interestTags: string[];
  length: "Sprint" | "Week" | "Month";
  hostType: "OpenToAll" | "Students" | "Gov";
  hostName: string;
  location: string;
  dates: string;
  prizePool: string;
  daysRemaining?: number;
  imageUrl: string;
}

const MOCK_HACKATHONS_LIST: HackathonItem[] = [
  {
    id: "ethio-fin-2024",
    slug: "ethio-fin-innovate-2024",
    title: "Ethio-Fin Innovate 2024",
    isFeatured: true,
    category: "FinTech & Blockchain",
    description: "Revolutionizing digital payments for the Horn of Africa. Build the next generation of inclusive banking systems.",
    status: "Active",
    interestTags: ["Machine Learning / AI", "FinTech & Blockchain", "Beginner Friendly"],
    length: "Sprint",
    hostType: "Gov",
    hostName: "National Bank",
    location: "Addis Ababa / Hybrid",
    dates: "Aug 10 - Aug 14, 2024",
    prizePool: "1.2M ETB",
    daysRemaining: 4,
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "greenseed-challenge",
    slug: "greenseed-challenge-2024",
    title: "GreenSeed Challenge",
    category: "AgriTech",
    description: "Optimizing coffee yield through IoT and satellite data mapping across the Oromia region.",
    status: "Active",
    interestTags: ["AgriTech", "Social Good", "Beginner Friendly"],
    length: "Sprint",
    hostType: "OpenToAll",
    hostName: "Ministry of Agriculture",
    location: "Jimma, Ethiopia",
    dates: "Sept 12 - Sept 15, 2024",
    prizePool: "500k ETB",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "amharic-nlp-sprint",
    slug: "amharic-nlp-sprint-2024",
    title: "Amharic NLP Sprint",
    category: "AI & Data",
    description: "Develop open-source Large Language Models specifically fine-tuned for Ethiopian local languages.",
    status: "Active",
    interestTags: ["Machine Learning / AI", "Education", "Beginner Friendly"],
    length: "Week",
    hostType: "OpenToAll",
    hostName: "AAU AI Hub",
    location: "Virtual / Global",
    dates: "Oct 05 - Oct 10, 2024",
    prizePool: "850k ETB",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "egov-ethiopia-hack",
    slug: "egov-ethiopia-hack-2024",
    title: "e-Gov Ethiopia Hack",
    category: "GovTech",
    description: "Streamlining municipal service delivery through unified citizen-facing portals and identity systems.",
    status: "Active",
    interestTags: ["GovTech", "Social Good", "Education"],
    length: "Sprint",
    hostType: "Students",
    hostName: "Bahir Dar University",
    location: "Bahir Dar University",
    dates: "Nov 20 - Nov 22, 2024",
    prizePool: "400k ETB",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "ethio-health-ai-2024",
    slug: "ethio-health-ai-2024",
    title: "Ethio-Health AI Challenge",
    category: "HealthTech",
    description: "Leveraging AI and computer vision for early diagnosis of maternal health complications in remote clinics.",
    status: "Upcoming",
    interestTags: ["Machine Learning / AI", "Social Good", "Beginner Friendly"],
    length: "Month",
    hostType: "OpenToAll",
    hostName: "Ministry of Health",
    location: "Addis Ababa",
    dates: "Dec 01 - Dec 15, 2024",
    prizePool: "1.0M ETB",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
  },
];

export default function HackathonsDiscoveryPage() {
  const t = useTranslations("HackathonsPage");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedField, setSelectedField] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState<"Active" | "Upcoming" | "Ended" | "All">("Active");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedLength, setSelectedLength] = useState("All");
  const [selectedHost, setSelectedHost] = useState("All");
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [dynamicItems, setDynamicItems] = useState<HackathonItem[]>(MOCK_HACKATHONS_LIST);

  useEffect(() => {
    async function loadDynamicHackathons() {
      try {
        const res = await hackathonsClient.listHackathons();
        if (res?.data && Array.isArray(res.data)) {
          const mapped: HackathonItem[] = res.data.map((h, idx) => ({
            id: h.id,
            slug: h.slug,
            title: h.title,
            isFeatured: idx === 0,
            category: h.tags?.[0] || "AgriTech",
            description: h.description || "Exciting hackathon challenge open for innovation.",
            status: (h.status === "published" || h.status === ("active" as any)) ? "Active" : "Upcoming",
            interestTags: h.tags && h.tags.length > 0 ? h.tags : ["Innovation", "Technology"],
            length: "Sprint",
            hostType: "OpenToAll",
            hostName: "HODANA Portal",
            location: h.locationMode || "Addis Ababa / Hybrid",
            dates: "Active Now",
            prizePool: h.prizeInfo || "1.0M ETB",
            daysRemaining: 14,
            imageUrl: h.bannerUrl || "/futuristic_city_banner.png",
          }));
          setDynamicItems(mapped);
        }
      } catch (err) {
        console.warn("Could not load dynamic catalog hackathons:", err);
      }
    }
    loadDynamicHackathons();
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredHackathons = useMemo(() => {
    return dynamicItems.filter((h) => {
      // Status Filter
      if (selectedStatus !== "All" && h.status !== selectedStatus) return false;

      // Location Filter
      if (selectedLocation !== "All" && !h.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
        return false;
      }

      // Field Filter
      if (selectedField !== "All" && h.category !== selectedField) return false;

      // Interest Tag Filter
      if (selectedTag !== "All" && !h.interestTags.includes(selectedTag)) return false;

      // Length Filter
      if (selectedLength !== "All" && h.length !== selectedLength) return false;

      // Host Filter
      if (selectedHost !== "All" && h.hostType !== selectedHost) return false;

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          h.title.toLowerCase().includes(q) ||
          h.category.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q) ||
          h.hostName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [dynamicItems, selectedStatus, selectedLocation, selectedField, selectedTag, selectedLength, selectedHost, searchQuery]);

  const featuredHackathon = filteredHackathons.find((h) => h.isFeatured) || filteredHackathons[0];
  const otherHackathons = filteredHackathons.filter((h) => h.id !== featuredHackathon?.id);

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#122622]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
        {/* ================= HERO HEADER ================= */}
        <section className="flex flex-col items-start gap-4 pt-4">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#122622] sm:text-5xl lg:text-6xl leading-[1.12]">
            {t("titlePart1")}{" "}
            <span className="text-[#0f6b5c] font-extrabold block sm:inline">
              {t("titlePart2")}
            </span>
          </h1>
          <p className="text-base text-[#57685f] sm:text-lg leading-relaxed max-w-3xl">
            {t("subtitle")}
          </p>

          {/* Search & Location/Field Filter Bar */}
          <div className="w-full rounded-2xl border border-[#d6e7e1] bg-white p-3 shadow-md mt-2 flex flex-col lg:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-gray-50 py-2.5 pl-10 pr-4 text-xs font-medium text-[#122622] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]"
              />
            </div>

            {/* Location Select */}
            <div className="relative w-full lg:w-48">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full appearance-none rounded-xl bg-gray-50 py-2.5 pl-9 pr-8 text-xs font-semibold text-[#122622] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]"
              >
                <option value="All">{t("allLocations")}</option>
                <option value="Addis Ababa">Addis Ababa</option>
                <option value="Jimma">Jimma</option>
                <option value="Bahir Dar">Bahir Dar</option>
                <option value="Virtual">Virtual / Global</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Field Select */}
            <div className="relative w-full lg:w-48">
              <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full appearance-none rounded-xl bg-gray-50 py-2.5 pl-9 pr-8 text-xs font-semibold text-[#122622] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]"
              >
                <option value="All">{t("allFields")}</option>
                <option value="FinTech & Blockchain">FinTech & Blockchain</option>
                <option value="AgriTech">AgriTech</option>
                <option value="AI & Data">AI & Data</option>
                <option value="GovTech">GovTech</option>
                <option value="HealthTech">HealthTech</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Search Button */}
            <button
              type="button"
              className="w-full lg:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0b5347] transition-colors cursor-pointer"
            >
              <span>{t("searchBtn")}</span>
            </button>
          </div>
        </section>

        {/* ================= FILTER PILLS & ITERATION BAR ================= */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Status Toggle Pills */}
            <div className="flex items-center gap-1 rounded-full bg-[#e8f3f0] p-1 border border-[#d6e7e1]">
              {(["Active", "Upcoming", "Ended", "All"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    selectedStatus === st
                      ? "bg-[#0f6b5c] text-white shadow-xs"
                      : "text-[#57685f] hover:text-[#0f6b5c]"
                  }`}
                >
                  {st === "Active" ? `${t("statusActive")} (10)` : st === "Upcoming" ? `${t("statusUpcoming")} (24)` : st === "Ended" ? t("statusEnded") : t("statusAll")}
                </button>
              ))}
            </div>

            {/* Interest Tags Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-[#57685f] uppercase tracking-wider mr-1">Tags:</span>
              {[
                { key: "All", label: t("tagAll") },
                { key: "Beginner Friendly", label: `🔰 ${t("tagBeginner")}` },
                { key: "Machine Learning / AI", label: `🤖 ${t("tagAI")}` },
                { key: "Education", label: `🎓 ${t("tagEdTech")}` },
                { key: "Social Good", label: `🌱 ${t("tagSocialGood")}` },
              ].map((tagItem) => (
                <button
                  key={tagItem.key}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tagItem.key ? "All" : tagItem.key)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    selectedTag === tagItem.key
                      ? "bg-[#0f6b5c] text-white shadow-xs"
                      : "border border-[#d6e7e1] bg-white text-[#57685f] hover:bg-[#e8f3f0]"
                  }`}
                >
                  {tagItem.label}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Iteration Controls: Length & Host Open To */}
          <div className="flex flex-wrap items-center gap-4 border-t border-[#d6e7e1] pt-3 text-xs">
            {/* Length Filter */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#57685f]">{t("lengthLabel")}:</span>
              <select
                value={selectedLength}
                onChange={(e) => setSelectedLength(e.target.value)}
                className="rounded-lg border border-[#d6e7e1] bg-white px-2.5 py-1 text-xs font-medium text-[#122622] focus:outline-none focus:ring-1 focus:ring-[#0f6b5c]"
              >
                <option value="All">{t("lengthAll")}</option>
                <option value="Sprint">{t("lengthSprint")}</option>
                <option value="Week">{t("lengthWeek")}</option>
                <option value="Month">{t("lengthMonth")}</option>
              </select>
            </div>

            {/* Host Filter */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#57685f]">{t("hostLabel")}:</span>
              <select
                value={selectedHost}
                onChange={(e) => setSelectedHost(e.target.value)}
                className="rounded-lg border border-[#d6e7e1] bg-white px-2.5 py-1 text-xs font-medium text-[#122622] focus:outline-none focus:ring-1 focus:ring-[#0f6b5c]"
              >
                <option value="All">{t("hostAll")}</option>
                <option value="OpenToAll">{t("hostAll")}</option>
                <option value="Students">{t("hostStudents")}</option>
                <option value="Gov">{t("hostGov")}</option>
              </select>
            </div>
          </div>
        </section>

        {/* ================= HACKATHONS CARDS GRID ================= */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Featured Large Card (7 cols on lg) */}
          {featuredHackathon && (
            <article className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#d6e7e1] bg-white shadow-sm lg:col-span-7 group">
              <div className="grid grid-cols-1 md:grid-cols-12 h-full">
                {/* Banner Image */}
                <div className="relative h-60 md:h-full md:col-span-5 overflow-hidden bg-gray-100">
                  <img
                    src={featuredHackathon.imageUrl}
                    alt={featuredHackathon.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-md bg-[#b45309] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                      {t("featuredBadge")}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 md:col-span-7 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#b45309]">
                        {featuredHackathon.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleBookmark(featuredHackathon.id)}
                        className="text-gray-400 hover:text-[#0f6b5c] transition-colors"
                      >
                        <Bookmark className={`h-5 w-5 ${bookmarkedIds[featuredHackathon.id] ? "fill-[#0f6b5c] text-[#0f6b5c]" : ""}`} />
                      </button>
                    </div>

                    <h3 className="font-display text-xl font-bold text-[#122622] group-hover:text-[#0f6b5c] transition-colors">
                      {featuredHackathon.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-[#57685f]">
                      {featuredHackathon.description}
                    </p>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-[#122622]">
                        <Building2 className="h-4 w-4 text-[#0f6b5c]" />
                        <span className="truncate">{featuredHackathon.hostName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-extrabold text-[#b45309]">
                        <Award className="h-4 w-4" />
                        <span>{featuredHackathon.prizePool}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer & Action */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="rounded-full bg-[#e8f3f0] px-3 py-1 text-xs font-bold text-[#0f6b5c]">
                      Ends in {featuredHackathon.daysRemaining || 4} Days
                    </span>

                    <Link
                      href={`/hackathons/${featuredHackathon.slug}/register`}
                      className="inline-flex items-center justify-center rounded-xl bg-[#0f6b5c] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-colors"
                    >
                      {t("registerNow")}
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* Right Cards Column (5 cols on lg) */}
          <div className="grid grid-cols-1 gap-6 lg:col-span-5 sm:grid-cols-2 lg:grid-cols-1">
            {otherHackathons.slice(0, 1).map((h) => (
              <article
                key={h.id}
                className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-[#e8f3f0] px-2.5 py-0.5 text-[11px] font-bold text-[#0f6b5c]">
                      {h.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleBookmark(h.id)}
                      className="text-gray-400 hover:text-[#c4211c] transition-colors"
                    >
                      <Heart className={`h-5 w-5 ${bookmarkedIds[h.id] ? "fill-[#c4211c] text-[#c4211c]" : ""}`} />
                    </button>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#122622]">
                    {h.title}
                  </h3>
                  <p className="text-xs text-[#57685f] leading-relaxed line-clamp-2">
                    {h.description}
                  </p>

                  <div className="flex flex-col gap-1.5 pt-1 text-xs text-[#57685f] font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#0f6b5c]" />
                      <span>{h.dates}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#0f6b5c]" />
                      <span>{h.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
                  <div>
                    <span className="block text-[10px] text-[#57685f] uppercase font-bold">{t("prizePool")}</span>
                    <span className="font-display text-lg font-extrabold text-[#0f6b5c]">{h.prizePool}</span>
                  </div>

                  <Link
                    href={`/hackathons/${h.slug}/register`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f3f0] text-[#0f6b5c] hover:bg-[#0f6b5c] hover:text-white transition-colors"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Bottom Row Hackathon Cards */}
          {otherHackathons.slice(1, 3).map((h) => (
            <article
              key={h.id}
              className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-xs lg:col-span-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[#e8f3f0] px-2.5 py-0.5 text-[11px] font-bold text-[#0f6b5c]">
                    {h.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(h.id)}
                    className="text-gray-400 hover:text-[#c4211c] transition-colors"
                  >
                    <Heart className={`h-5 w-5 ${bookmarkedIds[h.id] ? "fill-[#c4211c] text-[#c4211c]" : ""}`} />
                  </button>
                </div>

                <h3 className="font-display text-lg font-bold text-[#122622]">
                  {h.title}
                </h3>
                <p className="text-xs text-[#57685f] leading-relaxed line-clamp-2">
                  {h.description}
                </p>

                <div className="flex flex-col gap-1.5 pt-1 text-xs text-[#57685f] font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#0f6b5c]" />
                    <span>{h.dates}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#0f6b5c]" />
                    <span>{h.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
                <div>
                  <span className="block text-[10px] text-[#57685f] uppercase font-bold">{t("prizePool")}</span>
                  <span className="font-display text-lg font-extrabold text-[#0f6b5c]">{h.prizePool}</span>
                </div>

                <Link
                  href={`/hackathons/${h.slug}/register`}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f3f0] text-[#0f6b5c] hover:bg-[#0f6b5c] hover:text-white transition-colors"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}

          {/* Hosting an Event? CTA Card (4 cols on lg) */}
          <article className="flex flex-col items-center justify-center text-center rounded-3xl bg-[#0f6b5c] p-8 text-white shadow-md lg:col-span-4 gap-4 min-h-[260px]">
            <div className="flex flex-col items-center gap-2">
              <h3 className="font-display text-2xl font-extrabold text-white">
                {t("hostingTitle")}
              </h3>
              <p className="text-xs text-[#e8f3f0] leading-relaxed max-w-xs">
                {t("hostingSubtitle")}
              </p>
            </div>

            <Link
              href="/signup"
              className="rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-white hover:text-[#0f6b5c] transition-colors cursor-pointer"
            >
              {t("getFeatured")}
            </Link>
          </article>
        </section>

        {/* ================= ECOSYSTEM STATS COUNTER ROW ================= */}
        <section className="grid grid-cols-2 gap-6 sm:grid-cols-4 border-t border-[#d6e7e1] pt-10 pb-6 text-center">
          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-3xl font-extrabold text-[#0f6b5c]">128+</span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#57685f]">{t("annualEvents")}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-3xl font-extrabold text-[#0f6b5c]">15k</span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#57685f]">{t("activeDevs")}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-3xl font-extrabold text-[#b45309]">45M</span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#57685f]">{t("totalPrize")}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-3xl font-extrabold text-[#0f6b5c]">82%</span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#57685f]">{t("projectMaturity")}</span>
          </div>
        </section>
      </main>
    </div>
  );
}
