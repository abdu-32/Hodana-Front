"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  Gavel,
  Trophy,
  FileText,
  Megaphone,
  Briefcase,
  Search,
  Check,
  Plus,
  ChevronDown,
  Layers,
  Rocket,
  Star,
  Award,
  ExternalLink,
  FolderGit2,
  Filter,
  SlidersHorizontal,
  Sparkles,
  DollarSign,
  Building2,
  Smartphone,
  ShieldCheck,
  Send,
  X,
  Users,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { Logomark } from "@/components/ui/Logomark";
import {
  submissionsClient,
  type ProjectSubmission,
  type WinnerRank,
} from "@/features/submissions/lib/submissions-client";
import {
  prizesClient,
  type PrizePool,
  type PaymentMethodConfig,
} from "@/features/prizes/lib/prizes-client";

interface HackathonOption {
  id: string;
  title: string;
}

const MANAGED_HACKATHONS: HackathonOption[] = [
  { id: "all", title: "All Hackathons" },
  { id: "hck-agritech", title: "AgriTech Hack 2024" },
  { id: "hck-fintech", title: "FinTech Frontier" },
];

export default function OrganizerSubmissionsPage() {
  const t = useTranslations("Organizer");
  const { user } = useSession();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("submissions");

  // Filters State
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>("all");
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"score" | "date" | "name">("score");
  const [searchQuery, setSearchQuery] = useState("");

  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Submissions Data
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Winner Modal State
  const [assigningSubmission, setAssigningSubmission] = useState<ProjectSubmission | null>(null);
  const [targetRank, setTargetRank] = useState<WinnerRank>("FIRST");
  const [winnerNotes, setWinnerNotes] = useState("");
  const [prizeDetails, setPrizeDetails] = useState<{
    prizePool: PrizePool | null;
    paymentMethods: PaymentMethodConfig[];
  }>({ prizePool: null, paymentMethods: [] });
  const [isSubmittingWinner, setIsSubmittingWinner] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const organizerName = user?.fullName || "Abeba Selassie";
  const organizerTitle = "Lead Organizer";
  const userInitial = organizerName.charAt(0).toUpperCase();

  // Load Submissions
  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const data = await submissionsClient.getSubmissions(
        selectedHackathonId,
        minScoreFilter,
        selectedCategory
      );
      setSubmissions(data);
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [selectedHackathonId, minScoreFilter, selectedCategory]);

  // Load Prize Pool details when modal opens
  useEffect(() => {
    async function loadPrizes() {
      if (assigningSubmission) {
        try {
          const res = await prizesClient.getPrizeDetails(assigningSubmission.hackathonId);
          setPrizeDetails(res);
        } catch (err) {
          console.error("Failed to fetch prize details:", err);
        }
      }
    }
    loadPrizes();
  }, [assigningSubmission]);

  // Filtered & Sorted Submissions
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.projectTitle.toLowerCase().includes(query) ||
          s.teamName.toLowerCase().includes(query) ||
          s.tagline.toLowerCase().includes(query)
      );
    }

    if (sortBy === "score") {
      result.sort((a, b) => b.averageScore - a.averageScore);
    } else if (sortBy === "date") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "name") {
      result.sort((a, b) => a.projectTitle.localeCompare(b.projectTitle));
    }

    return result;
  }, [submissions, searchQuery, sortBy]);

  // Handle Assigning Winner
  const handleConfirmWinnerAssignment = async () => {
    if (!assigningSubmission) return;
    setIsSubmittingWinner(true);
    try {
      const res = await submissionsClient.assignWinnerRank(
        assigningSubmission.id,
        targetRank,
        winnerNotes
      );
      if (res.success) {
        setToastMsg(
          `Successfully assigned ${targetRank === "FIRST" ? "1st Place 🥇" : targetRank === "SECOND" ? "2nd Place 🥈" : "3rd Place 🥉"} to ${assigningSubmission.teamName}!`
        );
        setTimeout(() => setToastMsg(null), 4000);
        setAssigningSubmission(null);
        setWinnerNotes("");
        loadSubmissions();
      }
    } catch (err) {
      console.error("Failed to assign winner:", err);
    } finally {
      setIsSubmittingWinner(false);
    }
  };

  const selectedHackathonTitle =
    MANAGED_HACKATHONS.find((h) => h.id === selectedHackathonId)?.title || "All Hackathons";

  return (
    <div className="min-h-screen bg-[#F4F3FF] text-[#1E1E38]">
      <div className="mx-auto flex w-full max-w-[1500px]">
        {/* ================= LEFT SIDEBAR (ORGANIZER CONTEXT) ================= */}
        <aside
          className={`sticky top-0 hidden h-screen flex-col justify-between border-r border-indigo-100/80 bg-white p-5 lg:flex shadow-2xs transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "w-20 px-3" : "w-64 px-5"
          }`}
        >
          <div className="flex flex-col gap-8">
            {/* Brand Logo & Portal Tag */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="flex items-center gap-3 cursor-pointer text-left group focus:outline-none"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label="Toggle Sidebar"
            >
              <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#F9F8F3] border border-[#E2DFD8] shadow-xs overflow-hidden p-1 transition-transform group-hover:scale-105">
                <Logomark className="h-full w-full object-contain" />
              </span>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                  isSidebarCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-xs opacity-100"
                }`}
              >
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#3B34D2]">
                  HODANA
                </h1>
                <p className="text-xs font-semibold text-[#6B6B80]">
                  Ecosystem Portal
                </p>
              </div>
            </button>

            {/* Sidebar Navigation */}
            <nav className="flex flex-col gap-1 text-xs font-semibold text-[#52526B]">
              <Link
                href="/organizer/dashboard"
                title={isSidebarCollapsed ? t("navOverview") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-indigo-50 hover:text-[#3B34D2] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navOverview")}</span>}
              </Link>

              <Link
                href="/organizer/hackathons"
                title={isSidebarCollapsed ? t("navHackathons") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-indigo-50 hover:text-[#3B34D2] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Calendar className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navHackathons")}</span>}
              </Link>

              <Link
                href="/organizer/registrations"
                title={isSidebarCollapsed ? t("navRegistrations") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-indigo-50 hover:text-[#3B34D2] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <UserCheck className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navRegistrations")}</span>}
              </Link>

              <Link
                href="/organizer/judges"
                title={isSidebarCollapsed ? t("navJudging") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-indigo-50 hover:text-[#3B34D2] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Gavel className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navJudging")}</span>}
              </Link>

              <Link
                href="/organizer/prizes"
                title={isSidebarCollapsed ? t("navPrizes") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-indigo-50 hover:text-[#3B34D2] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Trophy className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navPrizes")}</span>}
              </Link>

              <button
                type="button"
                onClick={() => setActiveTab("submissions")}
                title={isSidebarCollapsed ? t("navAnalytics") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } bg-[#3B34D2] text-white shadow-md font-bold`}
              >
                <FileText className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navAnalytics")}</span>}
              </button>

              <Link
                href="/organizer/announcements"
                title={isSidebarCollapsed ? t("navAnnouncements") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-indigo-50 hover:text-[#3B34D2] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Megaphone className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navAnnouncements")}</span>}
              </Link>

              <Link
                href="/dashboard/portfolio"
                title={isSidebarCollapsed ? t("navPortfolio") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-indigo-50 hover:text-[#3B34D2] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Briefcase className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navPortfolio")}</span>}
              </Link>
            </nav>
          </div>

          {/* Sidebar Bottom CTA & User Footer */}
          <div className="flex flex-col gap-4 border-t border-indigo-100/80 pt-4">
            <Link
              href="/organizer/hackathons"
              title={isSidebarCollapsed ? t("launchProject") : undefined}
              className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#3B34D2] py-2.5 text-xs font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 ${
                isSidebarCollapsed ? "px-0" : "px-4"
              }`}
            >
              <Rocket className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("launchProject")}</span>}
            </Link>

            <Link
              href="/settings/profile"
              title={isSidebarCollapsed ? organizerName : undefined}
              className={`flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-100 ${
                isSidebarCollapsed ? "justify-center p-1" : ""
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3B34D2] text-xs font-extrabold text-white shadow-xs">
                {userInitial}
              </span>
              {!isSidebarCollapsed && (
                <div className="flex min-w-0 flex-1 flex-col whitespace-nowrap overflow-hidden">
                  <p className="truncate text-xs font-bold text-[#1E1E38]">
                    {organizerName}
                  </p>
                  <p className="truncate text-[11px] font-medium text-[#6B6B80]">
                    {organizerTitle}
                  </p>
                </div>
              )}
            </Link>
          </div>
        </aside>

        {/* ================= MAIN CONTENT AREA ================= */}
        <main className="flex min-w-0 flex-1 flex-col p-4 sm:p-6 lg:p-8 transition-all duration-300">
          {/* Header Title Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6">
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#1E1E38]">
                Submissions & Winner Designation
              </h1>
              <p className="text-xs text-[#6B6B80] mt-1">
                Filter project evaluations by score (1–10), assign 1st, 2nd, and 3rd place winners, and initiate disbursement.
              </p>
            </div>
          </div>

          {/* Success Toast Banner */}
          {toastMsg && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 animate-fade-in shadow-xs">
              <Check className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* 1. Top Filters Bar */}
          <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-indigo-100/80 bg-white p-5 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search project title or team name..."
                className="h-10 w-full rounded-2xl border border-indigo-100/80 bg-[#F9F8FE] pl-10 pr-4 text-xs font-medium text-[#1E1E38] outline-none focus:border-[#3B34D2] focus:bg-white"
              />
            </div>

            {/* Filter Dropdowns Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* 1. Hackathon Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsEventDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-2xl border border-indigo-100 bg-[#F9F8FE] px-3.5 py-2.5 text-xs font-bold text-[#1E1E38] shadow-2xs hover:bg-white transition-all cursor-pointer"
                >
                  <Layers className="h-3.5 w-3.5 text-[#3B34D2]" />
                  <span className="text-[#6B6B80]">Event:</span>
                  <span>{selectedHackathonTitle}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>

                {isEventDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-indigo-100 bg-white p-2 shadow-xl z-30">
                    {MANAGED_HACKATHONS.map((hck) => (
                      <button
                        key={hck.id}
                        type="button"
                        onClick={() => {
                          setSelectedHackathonId(hck.id);
                          setIsEventDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                          selectedHackathonId === hck.id
                            ? "bg-[#3B34D2] text-white"
                            : "text-[#1E1E38] hover:bg-indigo-50"
                        }`}
                      >
                        <span>{hck.title}</span>
                        {selectedHackathonId === hck.id && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Score Filter Selector */}
              <div className="flex items-center gap-1 rounded-2xl border border-indigo-100 bg-[#F9F8FE] p-1">
                <span className="px-2 text-[10px] font-extrabold uppercase text-[#6B6B80]">
                  Score:
                </span>
                {[
                  { label: "All", value: 0 },
                  { label: "≥ 9.0", value: 9.0 },
                  { label: "≥ 8.0", value: 8.0 },
                  { label: "≥ 7.0", value: 7.0 },
                ].map((threshold) => (
                  <button
                    key={threshold.label}
                    type="button"
                    onClick={() => setMinScoreFilter(threshold.value)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      minScoreFilter === threshold.value
                        ? "bg-[#3B34D2] text-white shadow-2xs"
                        : "text-[#6B6B80] hover:text-[#1E1E38]"
                    }`}
                  >
                    {threshold.label}
                  </button>
                ))}
              </div>

              {/* 3. Category Filter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-2xl border border-indigo-100 bg-[#F9F8FE] px-3.5 py-2.5 text-xs font-bold text-[#1E1E38] shadow-2xs hover:bg-white transition-all cursor-pointer"
                >
                  <Filter className="h-3.5 w-3.5 text-[#3B34D2]" />
                  <span className="capitalize">{selectedCategory === "all" ? "All Tracks" : selectedCategory}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-indigo-100 bg-white p-2 shadow-xl z-30">
                    {["all", "AI/ML", "AgriTech", "Blockchain", "FinTech"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? "bg-[#3B34D2] text-white"
                            : "text-[#1E1E38] hover:bg-indigo-50"
                        }`}
                      >
                        <span className="capitalize">{cat === "all" ? "All Tracks" : cat}</span>
                        {selectedCategory === cat && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Sort By */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSortDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-2xl border border-indigo-100 bg-[#F9F8FE] px-3.5 py-2.5 text-xs font-bold text-[#1E1E38] shadow-2xs hover:bg-white transition-all cursor-pointer"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-[#3B34D2]" />
                  <span>
                    Sort: {sortBy === "score" ? "Highest Score" : sortBy === "date" ? "Date" : "Name"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>

                {isSortDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-indigo-100 bg-white p-2 shadow-xl z-30">
                    {[
                      { key: "score", label: "Highest Judge Score" },
                      { key: "date", label: "Submission Date" },
                      { key: "name", label: "Project Title" },
                    ].map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => {
                          setSortBy(s.key as any);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                          sortBy === s.key ? "bg-[#3B34D2] text-white" : "text-[#1E1E38] hover:bg-indigo-50"
                        }`}
                      >
                        <span>{s.label}</span>
                        {sortBy === s.key && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Submission Review & Leaderboard Table */}
          <div className="overflow-hidden rounded-3xl border border-indigo-100/80 bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-indigo-100/80 bg-[#F9F8FE] text-[11px] font-extrabold uppercase tracking-wider text-[#6B6B80]">
                    <th className="py-4 px-6">Project / Team Name</th>
                    <th className="py-4 px-6">Event & Track</th>
                    <th className="py-4 px-6">Judge Rating</th>
                    <th className="py-4 px-6">Ranking Status</th>
                    <th className="py-4 px-6 text-right">Assign Winner Prize</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500 font-semibold">
                        Loading submissions and judge evaluations...
                      </td>
                    </tr>
                  ) : filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500 font-semibold">
                        No submissions match the active filters.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => {
                      const is1st = sub.rank === "FIRST";
                      const is2nd = sub.rank === "SECOND";
                      const is3rd = sub.rank === "THIRD";

                      return (
                        <tr
                          key={sub.id}
                          className={`transition-colors hover:bg-indigo-50/40 ${
                            is1st ? "bg-amber-50/30" : is2nd ? "bg-indigo-50/20" : is3rd ? "bg-orange-50/20" : ""
                          }`}
                        >
                          {/* Project & Team */}
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-display text-sm font-extrabold text-[#1E1E38]">
                                  {sub.projectTitle}
                                </span>
                                {sub.repoUrl && (
                                  <a
                                    href={sub.repoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-gray-400 hover:text-[#3B34D2]"
                                  >
                                    <FolderGit2 className="h-3.5 w-3.5" />
                                  </a>
                                )}
                                {sub.demoUrl && (
                                  <a
                                    href={sub.demoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-gray-400 hover:text-[#3B34D2]"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
                              <p className="text-[11px] text-[#6B6B80] max-w-sm line-clamp-1">
                                {sub.tagline}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-[#52526B] mt-0.5">
                                <Users className="h-3 w-3 text-indigo-400" />
                                <span>{sub.teamName} ({sub.teamMembersCount} Members)</span>
                              </div>
                            </div>
                          </td>

                          {/* Event & Track */}
                          <td className="py-4 px-6">
                            <div className="flex flex-col items-start gap-1">
                              <span className="rounded-lg bg-indigo-50 border border-indigo-100/60 px-2.5 py-0.5 text-[10px] font-bold text-[#3B34D2]">
                                {sub.hackathonName}
                              </span>
                              <span className="text-[10px] font-semibold text-[#6B6B80]">
                                {sub.category}
                              </span>
                            </div>
                          </td>

                          {/* Judge Score Rating Badge */}
                          <td className="py-4 px-6">
                            <div className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-extrabold text-amber-900 shadow-2xs">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                              <span>{sub.averageScore.toFixed(1)} / 10.0</span>
                              <span className="text-[10px] font-normal text-amber-700">
                                ({sub.evaluationsCount} evaluations)
                              </span>
                            </div>
                          </td>

                          {/* Ranking Status Badge */}
                          <td className="py-4 px-6">
                            {is1st ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-extrabold text-amber-800 shadow-2xs">
                                🥇 1ST PLACE WINNER
                              </span>
                            ) : is2nd ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-extrabold text-indigo-800 shadow-2xs">
                                🥈 2ND PLACE RUNNER-UP
                              </span>
                            ) : is3rd ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-[10px] font-extrabold text-orange-800 shadow-2xs">
                                🥉 3RD PLACE RUNNER-UP
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold text-[#6B6B80]">
                                SUBMITTED
                              </span>
                            )}
                          </td>

                          {/* Assign Prize Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setAssigningSubmission(sub);
                                  setTargetRank("FIRST");
                                }}
                                className={`rounded-xl px-2.5 py-1.5 text-[11px] font-extrabold transition-all cursor-pointer ${
                                  is1st
                                    ? "bg-amber-500 text-white shadow-xs"
                                    : "bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100"
                                }`}
                              >
                                🥇 1st
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setAssigningSubmission(sub);
                                  setTargetRank("SECOND");
                                }}
                                className={`rounded-xl px-2.5 py-1.5 text-[11px] font-extrabold transition-all cursor-pointer ${
                                  is2nd
                                    ? "bg-indigo-600 text-white shadow-xs"
                                    : "bg-indigo-50 border border-indigo-200 text-indigo-800 hover:bg-indigo-100"
                                }`}
                              >
                                🥈 2nd
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setAssigningSubmission(sub);
                                  setTargetRank("THIRD");
                                }}
                                className={`rounded-xl px-2.5 py-1.5 text-[11px] font-extrabold transition-all cursor-pointer ${
                                  is3rd
                                    ? "bg-orange-500 text-white shadow-xs"
                                    : "bg-orange-50 border border-orange-200 text-orange-800 hover:bg-orange-100"
                                }`}
                              >
                                🥉 3rd
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* 3. Assign Winner Modal / Drawer */}
      {assigningSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="w-full max-w-lg rounded-3xl border border-indigo-100 bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 flex flex-col gap-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-indigo-100/80 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-2xs font-extrabold text-base">
                  {targetRank === "FIRST" ? "🥇" : targetRank === "SECOND" ? "🥈" : "🥉"}
                </span>
                <div>
                  <h3 className="font-display text-base font-extrabold text-[#1E1E38]">
                    Designate {targetRank === "FIRST" ? "1st Place Winner" : targetRank === "SECOND" ? "2nd Place Runner-Up" : "3rd Place Runner-Up"}
                  </h3>
                  <p className="text-[11px] font-semibold text-[#6B6B80]">
                    {assigningSubmission.hackathonName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAssigningSubmission(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Target Submission Details */}
            <div className="rounded-2xl bg-[#F9F8FE] border border-indigo-100/80 p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-extrabold text-[#1E1E38]">
                  {assigningSubmission.projectTitle}
                </span>
                <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                  <span>{assigningSubmission.averageScore.toFixed(1)} / 10.0</span>
                </div>
              </div>
              <p className="text-xs text-[#52526B]">
                Team: <strong>{assigningSubmission.teamName}</strong> ({assigningSubmission.teamMembersCount} Members)
              </p>
            </div>

            {/* Prize & Payment Gateways Configured */}
            {prizeDetails.prizePool && (
              <div className="flex flex-col gap-2 rounded-2xl bg-gradient-to-r from-[#3B34D2] to-[#4F46E5] p-4 text-white shadow-md">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-200">
                  Pre-Configured Prize Disbursement
                </span>
                <p className="font-display text-xl font-extrabold">
                  {targetRank === "FIRST"
                    ? `${prizeDetails.prizePool.currency === "ETB" ? `${prizeDetails.prizePool.firstPlaceAmount.toLocaleString()} ETB` : `$${prizeDetails.prizePool.firstPlaceAmount.toLocaleString()}`}`
                    : targetRank === "SECOND"
                    ? `${prizeDetails.prizePool.currency === "ETB" ? `${prizeDetails.prizePool.secondPlaceAmount.toLocaleString()} ETB` : `$${prizeDetails.prizePool.secondPlaceAmount.toLocaleString()}`}`
                    : `${prizeDetails.prizePool.currency === "ETB" ? `${prizeDetails.prizePool.thirdPlaceAmount.toLocaleString()} ETB` : `$${prizeDetails.prizePool.thirdPlaceAmount.toLocaleString()}`}`}
                </p>
                {prizeDetails.paymentMethods.length > 0 && (
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-white/90">
                    <span>Gateways:</span>
                    {prizeDetails.paymentMethods
                      .filter((pm) => pm.isActive)
                      .map((pm) => (
                        <span key={pm.id} className="rounded-md bg-white/20 px-2 py-0.5">
                          {pm.providerName}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Custom Notes / Feedback */}
            <div>
              <label className="block text-xs font-extrabold text-[#1E1E38] mb-1.5">
                Custom Feedback & Winner Announcement Note
              </label>
              <textarea
                rows={3}
                value={winnerNotes}
                onChange={(e) => setWinnerNotes(e.target.value)}
                placeholder="Attach judges' commendations or instructions for the team..."
                className="w-full rounded-2xl border border-indigo-100 bg-[#F9F8FE] p-3 text-xs font-medium text-[#1E1E38] outline-none focus:border-[#3B34D2] focus:bg-white"
              />
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAssigningSubmission(null)}
                className="rounded-xl border border-indigo-100 bg-white px-5 py-2.5 text-xs font-bold text-[#52526B] hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmWinnerAssignment}
                disabled={isSubmittingWinner}
                className="flex items-center gap-2 rounded-xl bg-[#3B34D2] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#322BB8] transition-all cursor-pointer disabled:opacity-50"
              >
                <Award className="h-4 w-4" />
                <span>{isSubmittingWinner ? "Assigning..." : "Confirm Winner Assignment"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
