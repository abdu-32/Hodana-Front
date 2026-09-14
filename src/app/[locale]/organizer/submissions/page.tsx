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
  Download,
  Loader2,
  Copy,
  CheckCircle2,
  Clock,
  CreditCard,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { Logomark } from "@/components/ui/Logomark";
import { downloadHackathonExport } from "@/features/exports";
import {
  submissionsClient,
  type ProjectSubmission,
  type WinnerRank,
} from "@/features/submissions/lib/submissions-client";
import { PortalMobileNav } from "@/components/layout/PortalMobileNav";
import {
  prizesClient,
  type PrizePool,
  type PaymentMethodConfig,
} from "@/features/prizes/lib/prizes-client";
import { hackathonsClient } from "@/features/hackathons";
import {
  fetchMyOrganizations,
  getCachedActiveOrganization,
  type MyOrganization,
} from "@/features/organizer-onboarding";

interface HackathonOption {
  id: string;
  title: string;
}

export default function OrganizerSubmissionsPage() {
  const t = useTranslations("Organizer");
  const { user } = useSession();

  const [activeOrg, setActiveOrg] = useState<MyOrganization | null>(getCachedActiveOrganization());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("submissions");

  // Dynamic Hackathons
  const [managedHackathons, setManagedHackathons] = useState<HackathonOption[]>([
    { id: "all", title: "All Hackathons" },
  ]);
  const [isManagedLoaded, setIsManagedLoaded] = useState(false);

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
  const [isExporting, setIsExporting] = useState(false);

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

  // Top 3 and Payout Management States
  const [isTop3Only, setIsTop3Only] = useState(false);
  const [viewingPayoutSubmission, setViewingPayoutSubmission] = useState<ProjectSubmission | null>(null);
  const [requestingPayoutSubmission, setRequestingPayoutSubmission] = useState<ProjectSubmission | null>(null);
  const [payoutRequestMessage, setPayoutRequestMessage] = useState("");
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [isRequestingTop3, setIsRequestingTop3] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const organizerName = user?.fullName || "Organizer";
  const organizerTitle = activeOrg?.name || (user as any)?.organization || "Innovation Hub";
  const userInitial = organizerName.charAt(0).toUpperCase();

  // Load Organization
  useEffect(() => {
    fetchMyOrganizations()
      .then((orgs) => {
        if (orgs.length > 0) {
          const approved =
            orgs.find(
              (o) =>
                o.verificationStatus === "verified" ||
                (o as any).status?.toUpperCase() === "APPROVED"
            ) || orgs[0];
          setActiveOrg(approved);
        }
      })
      .catch(() => {});
  }, []);

  // Load Managed Hackathons on Mount
  useEffect(() => {
    async function loadManaged() {
      try {
        const res = await hackathonsClient.listHackathons({ managed: true });
        if (res && res.data) {
          const list: HackathonOption[] = [
            { id: "all", title: "All Hackathons" },
            ...res.data.map((h: any) => ({ id: h.id, title: h.title })),
          ];
          setManagedHackathons(list);
        }
      } catch (err) {
        console.warn("Failed to load managed hackathons in submissions page:", err);
      } finally {
        setIsManagedLoaded(true);
      }
    }
    loadManaged();
  }, []);

  // Load Submissions
  const loadSubmissions = async () => {
    if (!isManagedLoaded) return;
    setIsLoading(true);
    try {
      const realHackathonIds = managedHackathons.filter((h) => h.id !== "all").map((h) => h.id);
      if (realHackathonIds.length === 0) {
        setSubmissions([]);
        return;
      }

      const targetHackathonId =
        selectedHackathonId !== "all" && !realHackathonIds.includes(selectedHackathonId)
          ? "all"
          : selectedHackathonId;

      if (targetHackathonId !== selectedHackathonId) {
        setSelectedHackathonId(targetHackathonId);
      }

      const data = await submissionsClient.getSubmissions(
        targetHackathonId,
        minScoreFilter,
        selectedCategory,
        realHackathonIds
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
  }, [selectedHackathonId, minScoreFilter, selectedCategory, isManagedLoaded, managedHackathons]);

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

    if (isTop3Only) {
      result.sort((a, b) => b.averageScore - a.averageScore);
      result = result.slice(0, 3);
    } else {
      if (sortBy === "score") {
        result.sort((a, b) => b.averageScore - a.averageScore);
      } else if (sortBy === "date") {
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sortBy === "name") {
        result.sort((a, b) => a.projectTitle.localeCompare(b.projectTitle));
      }
    }

    return result;
  }, [submissions, searchQuery, sortBy, isTop3Only]);

  // Export Submissions Current View Handler
  const handleExportSubmissions = async () => {
    setIsExporting(true);
    try {
      await downloadHackathonExport({
        hackathonId: selectedHackathonId,
        resource: "submissions",
        format: "xlsx",
        search: searchQuery,
        track: selectedCategory === "all" ? undefined : selectedCategory,
      });
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

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

  // Handle Requesting Payout Form for single submission
  const handleConfirmRequestPayout = async () => {
    if (!requestingPayoutSubmission) return;
    setIsRequestingPayout(true);
    try {
      await submissionsClient.requestPayout(
        requestingPayoutSubmission.id,
        payoutRequestMessage
      );
      setToastMsg(
        `Payment method form dispatched to ${requestingPayoutSubmission.teamName} (${requestingPayoutSubmission.projectTitle})!`
      );
      setTimeout(() => setToastMsg(null), 4500);
      setRequestingPayoutSubmission(null);
      setPayoutRequestMessage("");
      loadSubmissions();
    } catch (err) {
      console.error("Failed to request payout:", err);
    } finally {
      setIsRequestingPayout(false);
    }
  };

  // Handle Bulk Request Payment Forms for Top 3
  const handleRequestTop3Payouts = async () => {
    setIsRequestingTop3(true);
    try {
      const sorted = [...submissions].sort((a, b) => b.averageScore - a.averageScore).slice(0, 3);
      if (sorted.length === 0) {
        setToastMsg("No submissions available to request payment details for.");
        setTimeout(() => setToastMsg(null), 4000);
        return;
      }
      const targetHckId = selectedHackathonId !== "all" ? selectedHackathonId : sorted[0].hackathonId;
      await submissionsClient.requestTop3Payouts(targetHckId);
      setToastMsg(
        `🎉 Payment method forms dispatched to all Top 3 winning teams!`
      );
      setTimeout(() => setToastMsg(null), 4500);
      loadSubmissions();
    } catch (err) {
      console.error("Failed to request Top 3 payouts:", err);
    } finally {
      setIsRequestingTop3(false);
    }
  };

  // Handle Mark Payout Paid
  const handleMarkPayoutPaid = async (submissionId: string) => {
    try {
      await submissionsClient.markPayoutPaid(submissionId);
      setToastMsg("Prize marked as disbursed / paid!");
      setTimeout(() => setToastMsg(null), 4000);
      if (viewingPayoutSubmission && viewingPayoutSubmission.id === submissionId) {
        setViewingPayoutSubmission(null);
      }
      loadSubmissions();
    } catch (err) {
      console.error("Failed to mark payout paid:", err);
    }
  };

  const selectedHackathonTitle =
    managedHackathons.find((h) => h.id === selectedHackathonId)?.title || "All Hackathons";

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#122622]">
      {/* Mobile Sticky Navigation Bar & Slide-Out Drawer */}
      <PortalMobileNav portalType="organizer" activeItem="submissions" title="Submissions" />

      <div className="mx-auto flex w-full max-w-[1500px]">
        {/* ================= LEFT SIDEBAR (ORGANIZER CONTEXT) ================= */}
        <aside
          className={`sticky top-0 hidden h-screen flex-col justify-between border-r border-[#d6e7e1] bg-white p-5 lg:flex shadow-2xs transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "w-20 px-3" : "w-64 px-5"
          }`}
        >
          <div className="flex flex-col gap-8">
            {/* Brand Logo & Portal Tag -> Navigates to Hero / Homepage */}
            <Link
              href="/"
              className="flex items-center gap-3 cursor-pointer text-left group focus:outline-none"
              title="Go to Home"
            >
              <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#e8f3f0] border border-[#d6e7e1] shadow-xs overflow-hidden p-1 transition-transform group-hover:scale-105">
                <Logomark className="h-full w-full object-contain" />
              </span>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                  isSidebarCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-xs opacity-100"
                }`}
              >
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#0f6b5c]">
                  HODANA
                </h1>
                <p className="text-xs font-semibold text-[#57685f]">
                  Ecosystem Portal
                </p>
              </div>
            </Link>

            {/* Sidebar Navigation */}
            <nav className="flex flex-col gap-1 text-xs font-semibold text-[#57685f]">
              <Link
                href="/organizer/dashboard"
                title={isSidebarCollapsed ? t("navOverview") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navOverview")}</span>}
              </Link>

              <Link
                href="/organizer/hackathons"
                title={isSidebarCollapsed ? t("navHackathons") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Calendar className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navHackathons")}</span>}
              </Link>

              <Link
                href="/organizer/registrations"
                title={isSidebarCollapsed ? t("navRegistrations") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <UserCheck className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navRegistrations")}</span>}
              </Link>

              <Link
                href="/organizer/judges"
                title={isSidebarCollapsed ? t("navJudging") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Gavel className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navJudging")}</span>}
              </Link>

              <Link
                href="/organizer/prizes"
                title={isSidebarCollapsed ? t("navPrizes") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
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
                } bg-[#0f6b5c] text-white shadow-md font-bold`}
              >
                <FileText className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navAnalytics")}</span>}
              </button>

              <Link
                href="/organizer/announcements"
                title={isSidebarCollapsed ? t("navAnnouncements") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Megaphone className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navAnnouncements")}</span>}
              </Link>

              <Link
                href="/dashboard/portfolio"
                title={isSidebarCollapsed ? t("navPortfolio") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Briefcase className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navPortfolio")}</span>}
              </Link>
            </nav>
          </div>

          {/* Sidebar Bottom CTA & User Footer */}
          <div className="flex flex-col gap-4 border-t border-[#d6e7e1] pt-4">
            <Link
              href="/organizer/hackathons"
              title={isSidebarCollapsed ? t("launchProject") : undefined}
              className={`flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] hover:bg-[#0b5347] py-2.5 text-xs font-bold text-white shadow-md transition-all ${
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
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0f6b5c] text-xs font-extrabold text-white shadow-xs">
                {userInitial}
              </span>
              {!isSidebarCollapsed && (
                <div className="flex min-w-0 flex-1 flex-col whitespace-nowrap overflow-hidden">
                  <p className="truncate text-xs font-bold text-[#122622]">
                    {organizerName}
                  </p>
                  <p className="truncate text-[11px] font-medium text-[#57685f]">
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
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#122622]">
                Submissions & Winner Designation
              </h1>
              <p className="text-xs text-[#57685f] mt-1">
                Filter project evaluations by score (1–10), isolate Top 3 finalists, dispatch prize payment forms, and disburse awards.
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

          {/* Top 3 Finalists & Deadline Action Banner */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50/80 via-white to-emerald-50/50 p-5 shadow-xs">
            <div className="flex items-start sm:items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shadow-2xs font-extrabold text-xl">
                🏆
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-extrabold text-[#122622]">
                    Top 3 Finalists & Winner Prize Disbursement
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                    Active Judging
                  </span>
                </div>
                <p className="text-xs text-[#57685f] mt-0.5">
                  Filter out the top 3 highest-scoring projects and send them a form to collect banking and Telebirr payment details.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsTop3Only((prev) => !prev)}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  isTop3Only
                    ? "border-amber-400 bg-amber-500 text-white hover:bg-amber-600"
                    : "border-amber-300 bg-white text-amber-900 hover:bg-amber-50"
                }`}
              >
                <Trophy className={`h-4 w-4 ${isTop3Only ? "text-white" : "text-amber-600"}`} />
                <span>{isTop3Only ? "Showing Top 3 Only" : "Filter Top 3 Finalists"}</span>
                {isTop3Only && <Check className="h-3.5 w-3.5 text-white ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={handleRequestTop3Payouts}
                disabled={isRequestingTop3 || submissions.length === 0}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-[#0f6b5c] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-all cursor-pointer disabled:opacity-50"
                title="Send payment method forms to all Top 3 winning teams"
              >
                {isRequestingTop3 ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Send Forms to Top 3</span>
              </button>
            </div>
          </div>

          {/* 1. Top Filters Bar */}
          <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-[#d6e7e1] bg-white p-4 sm:p-5 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 w-full min-w-0 sm:min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search project title or team name..."
                className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0]/40 pl-10 pr-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
              />
            </div>

            {/* Filter Dropdowns Controls */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* 1. Hackathon Selector */}
              <div className="relative w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsEventDropdownOpen((prev) => !prev)}
                  className="flex items-center justify-between gap-2 rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0]/50 px-3.5 py-2.5 text-xs font-bold text-[#122622] shadow-2xs hover:bg-white transition-all cursor-pointer w-full sm:w-auto"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Layers className="h-3.5 w-3.5 text-[#0f6b5c] shrink-0" />
                    <span className="text-[#57685f]">Event:</span>
                    <span className="truncate">{selectedHackathonTitle}</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                </button>

                {isEventDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[#d6e7e1] bg-white p-2 shadow-xl z-30">
                    {managedHackathons.map((hck) => (
                      <button
                        key={hck.id}
                        type="button"
                        onClick={() => {
                          setSelectedHackathonId(hck.id);
                          setIsEventDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                          selectedHackathonId === hck.id
                            ? "bg-[#0f6b5c] text-white"
                            : "text-[#122622] hover:bg-[#e8f3f0]"
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
              <div className="flex items-center gap-1 rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0]/50 p-1">
                <span className="px-2 text-[10px] font-extrabold uppercase text-[#57685f]">
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
                        ? "bg-[#0f6b5c] text-white shadow-2xs"
                        : "text-[#57685f] hover:text-[#122622]"
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
                  className="flex items-center gap-2 rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0]/50 px-3.5 py-2.5 text-xs font-bold text-[#122622] shadow-2xs hover:bg-white transition-all cursor-pointer"
                >
                  <Filter className="h-3.5 w-3.5 text-[#0f6b5c]" />
                  <span className="capitalize">{selectedCategory === "all" ? "All Tracks" : selectedCategory}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-[#d6e7e1] bg-white p-2 shadow-xl z-30">
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
                            ? "bg-[#0f6b5c] text-white"
                            : "text-[#122622] hover:bg-[#e8f3f0]"
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
                  className="flex items-center gap-2 rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0]/50 px-3.5 py-2.5 text-xs font-bold text-[#122622] shadow-2xs hover:bg-white transition-all cursor-pointer"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-[#0f6b5c]" />
                  <span>
                    Sort: {sortBy === "score" ? "Highest Score" : sortBy === "date" ? "Date" : "Name"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>

                {isSortDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-[#d6e7e1] bg-white p-2 shadow-xl z-30">
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
                          sortBy === s.key ? "bg-[#0f6b5c] text-white" : "text-[#122622] hover:bg-[#e8f3f0]"
                        }`}
                      >
                        <span>{s.label}</span>
                        {sortBy === s.key && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Export Submissions Button */}
              <button
                type="button"
                onClick={handleExportSubmissions}
                disabled={isExporting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-[#d6e7e1] bg-white px-4 py-2.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#e8f3f0] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                title="Export currently filtered project submissions"
              >
                {isExporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0f6b5c]" />
                ) : (
                  <Download className="h-3.5 w-3.5 text-[#0f6b5c]" />
                )}
                <span>Export Submissions</span>
              </button>
            </div>
          </div>

          {/* 2. Submission Review & Leaderboard Table */}
          <div className="overflow-hidden rounded-3xl border border-[#d6e7e1] bg-white shadow-2xs">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full min-w-[850px] text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#d6e7e1] bg-[#e8f3f0]/50 text-[11px] font-extrabold uppercase tracking-wider text-[#57685f]">
                    <th className="py-4 px-6">Project / Team Name</th>
                    <th className="py-4 px-6">Event & Track</th>
                    <th className="py-4 px-6">Judge Rating</th>
                    <th className="py-4 px-6">Ranking Status</th>
                    <th className="py-4 px-6 text-center">Payment Method Form</th>
                    <th className="py-4 px-6 text-right">Assign Winner Prize</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d6e7e1]/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500 font-semibold">
                        Loading submissions and judge evaluations...
                      </td>
                    </tr>
                  ) : !isLoading && isManagedLoaded && managedHackathons.filter((h) => h.id !== "all").length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-xs text-[#57685f]">
                        <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c] mb-3">
                            <Trophy className="h-6 w-6" />
                          </div>
                          <h4 className="font-display text-sm font-bold text-[#122622]">
                            No Hackathons Created Yet
                          </h4>
                          <p className="mt-1 text-xs text-[#57685f]">
                            Project submissions and evaluations are linked to hackathon events. Launch your organization's first hackathon to receive project submissions.
                          </p>
                          <Link
                            href="/organizer/hackathons"
                            className="mt-4 flex items-center gap-2 rounded-xl bg-[#0f6b5c] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0c574a] transition-all"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Launch First Event</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500 font-semibold">
                        {isTop3Only ? "No submissions found for Top 3 finalists." : "No submissions match the active filters."}
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
                          className={`transition-colors hover:bg-[#e8f3f0]/40 ${
                            is1st ? "bg-amber-50/30" : is2nd ? "bg-[#e8f3f0]/30" : is3rd ? "bg-orange-50/20" : ""
                          }`}
                        >
                          {/* Project & Team */}
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-display text-sm font-extrabold text-[#122622]">
                                  {sub.projectTitle}
                                </span>
                                {sub.repoUrl && (
                                  <a
                                    href={sub.repoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-gray-400 hover:text-[#0f6b5c]"
                                  >
                                    <FolderGit2 className="h-3.5 w-3.5" />
                                  </a>
                                )}
                                {sub.demoUrl && (
                                  <a
                                    href={sub.demoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-gray-400 hover:text-[#0f6b5c]"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
                              <p className="text-[11px] text-[#57685f] max-w-sm line-clamp-1">
                                {sub.tagline}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-[#57685f] mt-0.5">
                                <Users className="h-3 w-3 text-[#0f6b5c]" />
                                <span>{sub.teamName} ({sub.teamMembersCount} Members)</span>
                              </div>
                            </div>
                          </td>

                          {/* Event & Track */}
                          <td className="py-4 px-6">
                            <div className="flex flex-col items-start gap-1">
                              <span className="rounded-lg bg-[#e8f3f0] border border-[#d6e7e1] px-2.5 py-0.5 text-[10px] font-bold text-[#0f6b5c]">
                                {sub.hackathonName}
                              </span>
                              <span className="text-[10px] font-semibold text-[#57685f]">
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
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f3f0] px-3 py-1 text-[10px] font-extrabold text-[#0f6b5c] shadow-2xs">
                                🥈 2ND PLACE RUNNER-UP
                              </span>
                            ) : is3rd ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-[10px] font-extrabold text-orange-800 shadow-2xs">
                                🥉 3RD PLACE RUNNER-UP
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold text-[#57685f]">
                                SUBMITTED
                              </span>
                            )}
                          </td>

                          {/* Payment Method Form Column */}
                          <td className="py-4 px-6 text-center">
                            {sub.payoutStatus === "SUBMITTED" ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 shadow-2xs">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                                  Details Submitted
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setViewingPayoutSubmission(sub)}
                                    className="text-[11px] font-bold text-[#0f6b5c] hover:underline cursor-pointer"
                                  >
                                    View Info
                                  </button>
                                  <span className="text-gray-300">•</span>
                                  <button
                                    type="button"
                                    onClick={() => handleMarkPayoutPaid(sub.id)}
                                    className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
                                  >
                                    Mark Paid
                                  </button>
                                </div>
                              </div>
                            ) : sub.payoutStatus === "PAID" ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 border border-blue-300 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-800 shadow-2xs">
                                  <DollarSign className="h-3 w-3 text-blue-600 shrink-0" />
                                  Prize Disbursed
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setViewingPayoutSubmission(sub)}
                                  className="text-[11px] font-bold text-[#0f6b5c] hover:underline cursor-pointer mt-0.5"
                                >
                                  View Info
                                </button>
                              </div>
                            ) : sub.payoutStatus === "REQUESTED" ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-900 shadow-2xs">
                                  <Clock className="h-3 w-3 text-amber-600 shrink-0" />
                                  Form Sent (Awaiting)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRequestingPayoutSubmission(sub);
                                    setPayoutRequestMessage(
                                      `Reminder: Please submit your bank account or Telebirr details so the organizer team can process your cash prize disbursement.`
                                    );
                                  }}
                                  className="text-[10px] font-bold text-gray-500 hover:text-[#0f6b5c] hover:underline cursor-pointer mt-0.5"
                                >
                                  Resend Form
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setRequestingPayoutSubmission(sub);
                                  setPayoutRequestMessage(
                                    `Congratulations on placing in the Top 3 for ${sub.projectTitle}! Please provide your bank account or Telebirr details so we can process your cash prize disbursement.`
                                  );
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[11px] font-extrabold text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
                              >
                                <Send className="h-3 w-3 text-emerald-600 shrink-0" />
                                <span>Send Form</span>
                              </button>
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
                                    ? "bg-[#0f6b5c] text-white shadow-xs"
                                    : "bg-[#e8f3f0] border border-[#d6e7e1] text-[#0f6b5c] hover:bg-[#d6e7e1]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in-50">
          <div className="w-full max-w-lg my-auto max-h-[92dvh] overflow-y-auto rounded-3xl border border-[#d6e7e1] bg-white p-5 sm:p-8 shadow-2xl animate-in zoom-in-95 flex flex-col gap-5 sm:gap-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-2xs font-extrabold text-base">
                  {targetRank === "FIRST" ? "🥇" : targetRank === "SECOND" ? "🥈" : "🥉"}
                </span>
                <div>
                  <h3 className="font-display text-base font-extrabold text-[#122622]">
                    Designate {targetRank === "FIRST" ? "1st Place Winner" : targetRank === "SECOND" ? "2nd Place Runner-Up" : "3rd Place Runner-Up"}
                  </h3>
                  <p className="text-[11px] font-semibold text-[#57685f]">
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
            <div className="rounded-2xl bg-[#e8f3f0]/40 border border-[#d6e7e1] p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-extrabold text-[#122622]">
                  {assigningSubmission.projectTitle}
                </span>
                <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                  <span>{assigningSubmission.averageScore.toFixed(1)} / 10.0</span>
                </div>
              </div>
              <p className="text-xs text-[#57685f]">
                Team: <strong>{assigningSubmission.teamName}</strong> ({assigningSubmission.teamMembersCount} Members)
              </p>
            </div>

            {/* Prize & Payment Gateways Configured */}
            {prizeDetails.prizePool && (
              <div className="flex flex-col gap-2 rounded-2xl bg-gradient-to-r from-[#0f6b5c] to-[#0b5347] p-4 text-white shadow-md">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100">
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
              <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                Custom Feedback & Winner Announcement Note
              </label>
              <textarea
                rows={3}
                value={winnerNotes}
                onChange={(e) => setWinnerNotes(e.target.value)}
                placeholder="Attach judges' commendations or instructions for the team..."
                className="w-full rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0]/30 p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
              />
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAssigningSubmission(null)}
                className="w-full sm:w-auto rounded-xl border border-[#d6e7e1] bg-white px-5 py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 transition-all cursor-pointer text-center"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmWinnerAssignment}
                disabled={isSubmittingWinner}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer disabled:opacity-50"
              >
                <Award className="h-4 w-4" />
                <span>{isSubmittingWinner ? "Assigning..." : "Confirm Winner Assignment"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Request Payment Method Form Modal */}
      {requestingPayoutSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-lg my-auto max-h-[92dvh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-[#d6e7e1] flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c] shadow-2xs font-extrabold text-base">
                  <CreditCard className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-base font-extrabold text-[#122622]">
                    Send Payment Method Form
                  </h3>
                  <p className="text-[11px] font-semibold text-[#57685f]">
                    Request disbursement details from winning team
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRequestingPayoutSubmission(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Target Submission Details */}
            <div className="rounded-2xl bg-[#e8f3f0]/40 border border-[#d6e7e1] p-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-extrabold text-[#122622]">
                  {requestingPayoutSubmission.projectTitle}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                  {requestingPayoutSubmission.rank === "FIRST" ? "🥇 1st Place" : requestingPayoutSubmission.rank === "SECOND" ? "🥈 2nd Place" : requestingPayoutSubmission.rank === "THIRD" ? "🥉 3rd Place" : "Finalist"}
                </span>
              </div>
              <p className="text-xs text-[#57685f]">
                Team: <strong>{requestingPayoutSubmission.teamName}</strong> • {requestingPayoutSubmission.hackathonName}
              </p>
            </div>

            {/* Message / Instructions */}
            <div>
              <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                Instructions for the Winning Team
              </label>
              <textarea
                rows={3}
                value={payoutRequestMessage}
                onChange={(e) => setPayoutRequestMessage(e.target.value)}
                placeholder="Congratulations! Please provide your official bank or Telebirr account information for prize disbursement..."
                className="w-full rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0]/30 p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
              />
              <p className="mt-1 text-[11px] text-[#57685f]">
                This prompt will appear in the participant's "My Projects" dashboard with a secure payment submission form.
              </p>
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRequestingPayoutSubmission(null)}
                className="w-full sm:w-auto rounded-xl border border-[#d6e7e1] bg-white px-5 py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 transition-all cursor-pointer text-center"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmRequestPayout}
                disabled={isRequestingPayout}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer disabled:opacity-50"
              >
                {isRequestingPayout ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{isRequestingPayout ? "Sending Form..." : "Send Form to Team"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. View Submitted Payment Details & Mark Paid Modal */}
      {viewingPayoutSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-lg my-auto max-h-[92dvh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-[#d6e7e1] flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-2xs font-extrabold text-base">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-base font-extrabold text-[#122622]">
                    Winner Payment Details
                  </h3>
                  <p className="text-[11px] font-semibold text-[#57685f]">
                    {viewingPayoutSubmission.projectTitle} • {viewingPayoutSubmission.teamName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingPayoutSubmission(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Status Banner */}
            <div className="flex items-center justify-between rounded-2xl bg-[#e8f3f0] p-3 text-xs">
              <span className="font-bold text-[#122622]">Disbursement Status:</span>
              <span className={`rounded-full px-3 py-1 font-extrabold text-[11px] ${
                viewingPayoutSubmission.payoutStatus === "PAID"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-blue-100 text-blue-800"
              }`}>
                {viewingPayoutSubmission.payoutStatus === "PAID" ? "✅ Prize Disbursed (Paid)" : "📥 Payment Form Submitted"}
              </span>
            </div>

            {/* Submitted Account Info */}
            {viewingPayoutSubmission.payoutDetails ? (
              <div className="rounded-2xl border border-[#d6e7e1] bg-[#f9fbfb] p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#d6e7e1]/60 pb-2">
                  <span className="text-[11px] font-extrabold text-[#57685f] uppercase tracking-wider">
                    Bank / Payment Provider
                  </span>
                  <span className="font-extrabold text-[#122622] text-sm">
                    {viewingPayoutSubmission.payoutDetails.provider || "Not specified"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#d6e7e1]/60 pb-2">
                  <span className="text-[11px] font-extrabold text-[#57685f] uppercase tracking-wider">
                    Beneficiary Name
                  </span>
                  <span className="font-bold text-[#122622] text-xs">
                    {viewingPayoutSubmission.payoutDetails.beneficiaryName || "Not specified"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#d6e7e1]/60 pb-2">
                  <span className="text-[11px] font-extrabold text-[#57685f] uppercase tracking-wider">
                    Account / Wallet Number
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sm text-[#0f6b5c] bg-[#e8f3f0] px-2.5 py-1 rounded-lg">
                      {viewingPayoutSubmission.payoutDetails.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (viewingPayoutSubmission.payoutDetails?.accountNumber) {
                          navigator.clipboard.writeText(viewingPayoutSubmission.payoutDetails.accountNumber);
                          setCopiedAccount(viewingPayoutSubmission.id);
                          setTimeout(() => setCopiedAccount(null), 2500);
                        }
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#d6e7e1] bg-white text-gray-500 hover:bg-[#e8f3f0] hover:text-[#0f6b5c] transition-all cursor-pointer"
                      title="Copy Account Number"
                    >
                      {copiedAccount === viewingPayoutSubmission.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {viewingPayoutSubmission.payoutDetails.phone && (
                  <div className="flex items-center justify-between border-b border-[#d6e7e1]/60 pb-2">
                    <span className="text-[11px] font-extrabold text-[#57685f] uppercase tracking-wider">
                      Contact Phone
                    </span>
                    <span className="font-medium text-[#122622] text-xs">
                      {viewingPayoutSubmission.payoutDetails.phone}
                    </span>
                  </div>
                )}

                {viewingPayoutSubmission.payoutDetails.notes && (
                  <div className="flex flex-col gap-1 pt-1">
                    <span className="text-[11px] font-extrabold text-[#57685f] uppercase tracking-wider">
                      Team Notes
                    </span>
                    <p className="rounded-xl bg-white border border-[#d6e7e1]/60 p-2.5 text-xs text-[#122622] font-medium italic">
                      "{viewingPayoutSubmission.payoutDetails.notes}"
                    </p>
                  </div>
                )}

                {viewingPayoutSubmission.payoutDetails.submittedAt && (
                  <span className="text-[10px] text-[#57685f] text-right mt-1">
                    Submitted on: {new Date(viewingPayoutSubmission.payoutDetails.submittedAt).toLocaleString()}
                  </span>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d6e7e1] p-6 text-center text-xs text-[#57685f]">
                No payment details submitted yet.
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setViewingPayoutSubmission(null)}
                className="w-full sm:w-auto rounded-xl border border-[#d6e7e1] bg-white px-5 py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 transition-all cursor-pointer text-center"
              >
                Close
              </button>

              {viewingPayoutSubmission.payoutStatus !== "PAID" && (
                <button
                  type="button"
                  onClick={() => handleMarkPayoutPaid(viewingPayoutSubmission.id)}
                  disabled={isRequestingPayout}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Mark as Disbursed / Paid</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
