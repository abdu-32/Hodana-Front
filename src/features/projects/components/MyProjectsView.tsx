"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  FolderGit2,
  Bell,
  Search,
  ChevronDown,
  ExternalLink,
  Trash2,
  FileText,
  X,
  Gavel,
  Video,
  FileSpreadsheet,
  CheckCircle2,
  Star,
  Plus,
  Tag,
  Loader2,
  AlertCircle,
  Sliders,
  Download,
  Check,
  Clock,
  Edit3,
  AlertTriangle,
  Globe,
  Award,
  FileEdit,
  Sparkles,
  CreditCard,
  Send,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  userProjectsClient,
  type UserProject,
  type ProjectEvaluation,
  type SubmitProjectPayload,
  type CreateProjectPayload,
} from "@/features/projects/lib/user-projects-client";
import { submissionsClient } from "@/features/submissions/lib/submissions-client";
import { hackathonsClient } from "@/features/hackathons";
import { NotificationBellDropdown } from "@/features/notifications/components/NotificationBellDropdown";

type StatusFilterType = "ALL" | "DRAFT" | "FINISHED" | "AWAITING_REVIEW";

function formatProjectDate(project: UserProject): string {
  const dateStr = project.evaluation?.evaluatedAt || project.submittedAt || project.updatedAt;
  if (!dateStr) return "Recently";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Recently";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
}

interface MyProjectsViewProps {
  onBackToDashboard?: () => void;
}

export function MyProjectsView({ onBackToDashboard }: MyProjectsViewProps) {
  const t = useTranslations("Projects");

  const [projects, setProjects] = useState<UserProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"RECENT" | "TITLE" | "SCORE">("RECENT");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);



  // Modals state
  const [draftToEdit, setDraftToEdit] = useState<UserProject | null>(null);
  const [reviewingProject, setReviewingProject] = useState<UserProject | null>(null);
  const [deletingProject, setDeletingProject] = useState<UserProject | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [payoutProject, setPayoutProject] = useState<UserProject | null>(null);

  // Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categoryRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 4500);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load Projects from storage / API
  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const data = await userProjectsClient.getUserProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load user projects:", err);
      showToast("Error loading project directory.");
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Extract distinct Hackathon Categories
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    projects.forEach((p) => {
      if (p.category && p.category.trim()) cats.add(p.category.trim());
    });
    return Array.from(cats);
  }, [projects]);

  // Counts for tabs
  const counts = useMemo(() => {
    const all = projects.length;
    const drafts = projects.filter((p) => p.status === "DRAFT").length;
    // Strict requirement: Finished only when judge evaluation is completed
    const finished = projects.filter(
      (p) => p.status === "COMPLETED" && Boolean(p.evaluation?.overallScore != null)
    ).length;
    const awaiting = projects.filter(
      (p) => p.status === "SUBMITTED" || (p.status !== "DRAFT" && !p.evaluation)
    ).length;
    return { all, drafts, finished, awaiting };
  }, [projects]);



  // Filter & Sort Projects dynamically
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    // Status Filter
    if (statusFilter === "DRAFT") {
      result = result.filter((p) => p.status === "DRAFT");
    } else if (statusFilter === "FINISHED") {
      result = result.filter(
        (p) => p.status === "COMPLETED" && Boolean(p.evaluation?.overallScore != null)
      );
    } else if (statusFilter === "AWAITING_REVIEW") {
      result = result.filter(
        (p) => p.status === "SUBMITTED" || (p.status !== "DRAFT" && !p.evaluation)
      );
    }

    // Category / Track Filter
    if (categoryFilter !== "ALL") {
      result = result.filter(
        (p) => p.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Project Name Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.hackathonName.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "TITLE") return a.title.localeCompare(b.title);
      if (sortBy === "SCORE") {
        const scoreA = a.evaluation?.overallScore || 0;
        const scoreB = b.evaluation?.overallScore || 0;
        return scoreB - scoreA;
      }
      // RECENT default
      const dateA = new Date(
        a.evaluation?.evaluatedAt || a.submittedAt || a.updatedAt || 0
      ).getTime();
      const dateB = new Date(
        b.evaluation?.evaluatedAt || b.submittedAt || b.updatedAt || 0
      ).getTime();
      return dateB - dateA;
    });

    return result;
  }, [projects, statusFilter, categoryFilter, searchQuery, sortBy]);



  // Handlers
  const handleDeleteDraft = async (projectId: string) => {
    try {
      await userProjectsClient.deleteProject(projectId);
      showToast("✓ Draft project deleted successfully.");
      setDeletingProject(null);
      await loadProjects();
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || "Failed to delete draft project.");
    }
  };

  const handleDraftSaved = (updatedProject: UserProject) => {
    showToast(`✓ Draft "${updatedProject.title}" saved successfully.`);
    setDraftToEdit(null);
    loadProjects();
  };

  const handleDraftSubmitted = (updatedProject: UserProject) => {
    showToast(`✓ "${updatedProject.title}" submitted! It is now awaiting judge review.`);
    setDraftToEdit(null);
    loadProjects();
  };

  const handleSimulateJudgeReview = async (projectId: string) => {
    try {
      const updated = await userProjectsClient.recordJudgeSubmission(projectId, {
        overallScore: 9.4,
        criteriaScores: {
          innovation: 9.5,
          technical: 9.3,
          design: 9.2,
          impact: 9.6,
        },
        feedback:
          "Outstanding submission! Highly practical architecture, clean code quality, and impressive alignment with regional impact metrics.",
        judgeName: "Dr. Selamawit Bekele",
        judgeTitle: "Principal Judge, National Tech Committee",
      });
      showToast(
        `✓ Judge evaluation recorded for "${updated.title}"! Status is now Finished/Completed.`
      );
      setReviewingProject(updated);
      await loadProjects();
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || "Failed to record evaluation.");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in-50">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-[#d6e7e1]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#57685f]">
            {onBackToDashboard ? (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="hover:text-[#0f6b5c] cursor-pointer"
              >
                Dashboard
              </button>
            ) : (
              <Link href="/dashboard" className="hover:text-[#0f6b5c]">
                Dashboard
              </Link>
            )}
            <span>/</span>
            <span className="text-[#0f6b5c] font-bold">My Projects</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#122622] mt-1">
            My Projects
          </h1>
          <p className="text-xs text-[#57685f] mt-0.5">
            Track your project lifecycle from draft saves to official judge reviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBellDropdown />

          <button
            type="button"
            onClick={() => setIsCreatingProject(true)}
            className="flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0b5347] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Project Draft</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#0e2b25] border border-emerald-900/40 p-3.5 text-xs font-bold text-white animate-in fade-in slide-in-from-top-2 shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div
          onClick={() => setStatusFilter("ALL")}
          className={`rounded-2xl border p-4 cursor-pointer transition-all ${
            statusFilter === "ALL"
              ? "border-[#0f6b5c] bg-[#e8f3f0]/50 shadow-xs"
              : "border-[#d6e7e1] bg-white hover:border-[#0f6b5c]/50"
          }`}
        >
          <span className="text-[11px] font-bold text-[#57685f] uppercase tracking-wider block">
            Total Projects
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-2xl font-black text-[#122622]">
              {counts.all}
            </span>
            <span className="text-[11px] text-[#57685f]">all statuses</span>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter("DRAFT")}
          className={`rounded-2xl border p-4 cursor-pointer transition-all ${
            statusFilter === "DRAFT"
              ? "border-amber-400 bg-amber-50/70 shadow-xs"
              : "border-[#d6e7e1] bg-white hover:border-amber-300"
          }`}
        >
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            Active Drafts
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-2xl font-black text-amber-900">
              {counts.drafts}
            </span>
            <span className="text-[11px] text-amber-700">editable & deletable</span>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter("AWAITING_REVIEW")}
          className={`rounded-2xl border p-4 cursor-pointer transition-all ${
            statusFilter === "AWAITING_REVIEW"
              ? "border-sky-400 bg-sky-50/70 shadow-xs"
              : "border-[#d6e7e1] bg-white hover:border-sky-300"
          }`}
        >
          <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
            Awaiting Judge Review
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-2xl font-black text-sky-900">
              {counts.awaiting}
            </span>
            <span className="text-[11px] text-sky-700">in judging queue</span>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter("FINISHED")}
          className={`rounded-2xl border p-4 cursor-pointer transition-all ${
            statusFilter === "FINISHED"
              ? "border-emerald-400 bg-emerald-50/70 shadow-xs"
              : "border-[#d6e7e1] bg-white hover:border-emerald-300"
          }`}
        >
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Finished / Evaluated
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-2xl font-black text-emerald-900">
              {counts.finished}
            </span>
            <span className="text-[11px] text-emerald-700">judge reviewed</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[#d6e7e1] bg-white p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap max-w-full pb-1">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-[#0f6b5c] text-white shadow-xs"
                  : "bg-[#f3f6f4] text-[#57685f] hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
              }`}
            >
              <span>All Projects</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  statusFilter === "ALL"
                    ? "bg-white/20 text-white"
                    : "bg-white text-[#57685f]"
                }`}
              >
                {counts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("DRAFT")}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "DRAFT"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-[#f3f6f4] text-[#57685f] hover:bg-amber-50 hover:text-amber-800"
              }`}
            >
              <FileEdit className="h-3.5 w-3.5" />
              <span>Drafts</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  statusFilter === "DRAFT"
                    ? "bg-white/20 text-white"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                {counts.drafts}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("FINISHED")}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "FINISHED"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-[#f3f6f4] text-[#57685f] hover:bg-emerald-50 hover:text-emerald-800"
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>Finished</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  statusFilter === "FINISHED"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-emerald-900"
                }`}
              >
                {counts.finished}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("AWAITING_REVIEW")}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "AWAITING_REVIEW"
                  ? "bg-sky-700 text-white shadow-xs"
                  : "bg-[#f3f6f4] text-[#57685f] hover:bg-sky-50 hover:text-sky-800"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Awaiting Review</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  statusFilter === "AWAITING_REVIEW"
                    ? "bg-white/20 text-white"
                    : "bg-sky-100 text-sky-900"
                }`}
              >
                {counts.awaiting}
              </span>
            </button>
          </div>

          {/* Search by Project Name */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name, tagline, or hackathon..."
              className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] pl-10 pr-9 py-2.5 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sub-controls: Category Filter & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative" ref={categoryRef}>
              <button
                type="button"
                onClick={() => setIsCategoryOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl border border-[#d6e7e1] bg-white px-3 py-1.5 text-xs font-bold text-[#57685f] hover:border-[#0f6b5c] hover:text-[#0f6b5c] transition-all cursor-pointer"
              >
                <Tag className="h-3.5 w-3.5" />
                <span>
                  {categoryFilter === "ALL"
                    ? "Track: All Categories"
                    : `Track: ${categoryFilter}`}
                </span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {isCategoryOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl border border-[#d6e7e1] bg-white p-2 shadow-xl z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter("ALL");
                      setIsCategoryOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                      categoryFilter === "ALL"
                        ? "bg-[#0f6b5c] text-white"
                        : "text-[#122622] hover:bg-[#e8f3f0]"
                    }`}
                  >
                    <span>All Categories</span>
                    {categoryFilter === "ALL" && <Check className="h-3 w-3" />}
                  </button>
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategoryFilter(cat);
                        setIsCategoryOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                        categoryFilter.toLowerCase() === cat.toLowerCase()
                          ? "bg-[#0f6b5c] text-white"
                          : "text-[#122622] hover:bg-[#e8f3f0]"
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      {categoryFilter.toLowerCase() === cat.toLowerCase() && (
                        <Check className="h-3 w-3" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {(statusFilter !== "ALL" || categoryFilter !== "ALL" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("ALL");
                  setCategoryFilter("ALL");
                  setSearchQuery("");
                }}
                className="text-[11px] font-bold text-[#0f6b5c] hover:underline cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>

          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl border border-[#d6e7e1] bg-white px-3 py-1.5 text-xs font-bold text-[#57685f] hover:border-[#0f6b5c] hover:text-[#0f6b5c] transition-all cursor-pointer"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>
                Sort:{" "}
                {sortBy === "RECENT"
                  ? "Recently Updated"
                  : sortBy === "SCORE"
                  ? "Judge Score"
                  : "Alphabetical"}
              </span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-[#d6e7e1] bg-white p-2 shadow-xl z-50">
                {[
                  { id: "RECENT", label: "Recently Updated" },
                  { id: "SCORE", label: "Highest Judge Score" },
                  { id: "TITLE", label: "Alphabetical (A-Z)" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.id as any);
                      setIsSortOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                      sortBy === opt.id
                        ? "bg-[#0f6b5c] text-white"
                        : "text-[#122622] hover:bg-[#e8f3f0]"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.id && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vertically Scrollable Project List */}
      <div>
        {isLoadingProjects ? (
          <div className="flex flex-col items-center justify-center p-16 text-center rounded-3xl border border-[#d6e7e1] bg-white min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-[#0f6b5c] mb-3" />
            <h3 className="font-display text-base font-bold text-[#122622]">
              Loading Projects Directory
            </h3>
            <p className="text-xs text-[#57685f] mt-1">
              Retrieving your saved drafts and certified judge reviews...
            </p>
          </div>
        ) : filteredAndSortedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-14 text-center rounded-3xl border border-dashed border-[#d6e7e1] bg-white min-h-[300px]">
            <FolderGit2 className="h-12 w-12 text-gray-300 mb-3" />
            <h3 className="font-display text-lg font-bold text-[#122622]">
              No projects match your filter
            </h3>
            <p className="text-xs text-[#57685f] mt-1 max-w-md">
              {statusFilter === "DRAFT"
                ? "You do not have any active project drafts saved. Save deliverables as a draft before submitting to judges."
                : statusFilter === "FINISHED"
                ? "No finished projects found. A project appears as Finished only after a judge reviews and submits their official evaluation."
                : "Try adjusting your search keywords or resetting your filter tabs."}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("ALL");
                  setCategoryFilter("ALL");
                  setSearchQuery("");
                }}
                className="rounded-xl bg-[#0f6b5c] px-4 py-2 text-xs font-bold text-white cursor-pointer"
              >
                Show All Projects
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingProject(true)}
                className="rounded-xl border border-[#d6e7e1] bg-white px-4 py-2 text-xs font-bold text-[#122622] hover:bg-[#f3f6f4] cursor-pointer"
              >
                + Create New Project
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 max-h-[580px] sm:max-h-[640px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
            {filteredAndSortedProjects.map((project) => {
              const isDraft = project.status === "DRAFT";
              const isFinished =
                project.status === "COMPLETED" &&
                Boolean(project.evaluation?.overallScore != null);

              return (
                <div
                  key={project.id}
                  className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 shadow-2xs hover:shadow-sm transition-all ${
                    isDraft
                      ? "border-amber-200/90 hover:border-amber-400"
                      : isFinished
                      ? "border-emerald-200/90 hover:border-emerald-400"
                      : "border-sky-200/90 hover:border-sky-400"
                  }`}
                >
                  {/* Left Details */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-2xs ${
                        isDraft
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : isFinished
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-sky-50 text-sky-700 border border-sky-200"
                      }`}
                    >
                      {isDraft ? (
                        <FileEdit className="h-4.5 w-4.5" />
                      ) : isFinished ? (
                        <Award className="h-4.5 w-4.5" />
                      ) : (
                        <Clock className="h-4.5 w-4.5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <span className="rounded-full bg-[#0f6b5c]/10 text-[#0f6b5c] px-2 py-0.5 text-[9px] font-extrabold uppercase truncate max-w-[180px]">
                          {project.hackathonName}
                        </span>
                        <span className="rounded-full bg-gray-100 text-gray-700 px-1.5 py-0.5 text-[9px] font-bold">
                          {project.category}
                        </span>
                      </div>

                      <h3 className="font-display text-sm sm:text-base font-extrabold text-[#122622] truncate leading-tight">
                        {project.title}
                      </h3>

                      <p className="text-[11px] text-[#57685f] line-clamp-1 mt-0.5">
                        {project.tagline || project.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2.5 mt-1 text-[10px] text-[#57685f]">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span>
                            {isFinished
                              ? "Evaluated:"
                              : isDraft
                              ? "Saved:"
                              : "Submitted:"}{" "}
                            <strong className="text-gray-700">
                              {formatProjectDate(project)}
                            </strong>
                          </span>
                        </div>

                        {project.techStack?.length > 0 && (
                          <div className="hidden sm:flex items-center gap-1">
                            <span className="text-gray-300">•</span>
                            {project.techStack.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="rounded bg-[#f3f6f4] border border-[#d6e7e1] px-1.5 py-0.2 text-[9px] font-semibold text-gray-700"
                              >
                                {tag}
                              </span>
                            ))}
                            {project.techStack.length > 3 && (
                              <span className="text-[9px] text-gray-500">
                                +{project.techStack.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                    {/* Center: Status Badge */}
                  <div className="flex flex-col sm:items-center justify-center shrink-0 min-w-[130px]">
                    {isDraft ? (
                      <div className="flex flex-col items-start sm:items-center gap-0.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 shadow-2xs">
                          <FileEdit className="h-3 w-3 text-amber-600" />
                          <span>Draft</span>
                        </span>
                        <span className="text-[9px] text-amber-700 font-medium">
                          Not yet submitted to judges
                        </span>
                      </div>
                    ) : isFinished ? (
                      <div className="flex flex-col items-start sm:items-center gap-0.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold text-emerald-900 shadow-2xs">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>Finished / Evaluated</span>
                        </span>
                        {project.evaluation && (
                          <div className="flex items-center gap-1 rounded bg-emerald-100/70 px-1.5 py-0.2 text-[9px] font-black text-emerald-900">
                            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-500" />
                            <span>
                              ⭐ {project.evaluation.overallScore.toFixed(1)} / 10.0
                            </span>
                          </div>
                        )}
                        {project.payoutStatus && project.payoutStatus !== "NOT_REQUESTED" && (
                          <div className="mt-1">
                            {project.payoutStatus === "REQUESTED" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[9px] font-black text-amber-900 animate-pulse">
                                🏆 Prize Payout Form Needed
                              </span>
                            ) : project.payoutStatus === "SUBMITTED" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 border border-blue-300 px-2 py-0.5 text-[9px] font-bold text-blue-900">
                                📥 Payment Details Submitted
                              </span>
                            ) : project.payoutStatus === "PAID" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[9px] font-bold text-emerald-900">
                                ✅ Prize Disbursed
                              </span>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-start sm:items-center gap-0.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-300 px-2.5 py-0.5 text-[10px] font-bold text-sky-900 shadow-2xs">
                          <Clock className="h-3 w-3 text-sky-600" />
                          <span>Awaiting Judge Review</span>
                        </span>
                        <span className="text-[9px] text-sky-700 font-medium">
                          Submitted & in queue
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0 w-full sm:w-auto justify-start sm:justify-end mt-2 md:mt-0">
                    {/* Payment Method Action for Top Winners */}
                    {project.payoutStatus === "REQUESTED" && (
                      <button
                        type="button"
                        onClick={() => setPayoutProject(project)}
                        className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm hover:from-amber-700 hover:to-amber-800 transition-all cursor-pointer animate-bounce duration-1000"
                        title="Provide Payment Details for Prize Disbursement"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Fill Payment Method</span>
                      </button>
                    )}

                    {project.payoutStatus === "SUBMITTED" && (
                      <button
                        type="button"
                        onClick={() => setPayoutProject(project)}
                        className="flex items-center gap-1 rounded-xl border border-blue-300 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-800 hover:bg-blue-100 transition-all cursor-pointer"
                        title="Update or View Payment Details"
                      >
                        <CreditCard className="h-3 w-3" />
                        <span>View / Edit Payment</span>
                      </button>
                    )}

                    {isDraft ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setDraftToEdit(project)}
                          className="flex items-center gap-1 rounded-xl bg-[#0f6b5c] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-all cursor-pointer"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Open & Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingProject(project)}
                          title="Delete Draft"
                          className="flex h-7 w-7 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : isFinished ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setReviewingProject(project)}
                          className="flex items-center gap-1 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-all cursor-pointer"
                        >
                          <Gavel className="h-3 w-3 text-emerald-200" />
                          <span>View Final Review</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setReviewingProject(project)}
                          className="flex items-center gap-1 rounded-xl border border-[#d6e7e1] bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-2xs hover:border-[#0f6b5c] hover:text-[#0f6b5c] transition-all cursor-pointer"
                        >
                          <FileText className="h-3 w-3 text-gray-500" />
                          <span>View Review Status</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scrollable Summary Footer (No Numeric Pagination) */}
      {filteredAndSortedProjects.length > 0 && (
        <div className="flex items-center justify-between border-t border-[#d6e7e1] pt-3 text-xs font-medium text-[#57685f]">
          <div>
            Showing{" "}
            <strong className="text-[#122622]">
              {filteredAndSortedProjects.length}
            </strong>{" "}
            project{filteredAndSortedProjects.length === 1 ? "" : "s"}
          </div>

          <div className="text-[11px] text-[#57685f]/80 flex items-center gap-1">
            <span>Scroll vertically to view all projects</span>
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* 1. Draft Edit & Submission Modal */}
      {draftToEdit && (
        <DraftEditModal
          project={draftToEdit}
          onClose={() => setDraftToEdit(null)}
          onSaveDraft={handleDraftSaved}
          onSubmitForReview={handleDraftSubmitted}
        />
      )}

      {/* 2. Final Review Evaluation Modal (Read-Only) */}
      {reviewingProject && (
        <EvaluationReviewModal
          project={reviewingProject}
          onClose={() => setReviewingProject(null)}
          onSimulateReview={handleSimulateJudgeReview}
        />
      )}

      {/* 3. Delete Draft Confirmation Modal */}
      {deletingProject && (
        <DeleteConfirmationModal
          project={deletingProject}
          onClose={() => setDeletingProject(null)}
          onConfirm={() => handleDeleteDraft(deletingProject.id)}
        />
      )}

      {/* 4. Create New Project Modal */}
      {isCreatingProject && (
        <CreateProjectModal
          onClose={() => setIsCreatingProject(false)}
          onSuccess={(created) => {
            setIsCreatingProject(false);
            showToast(`✓ Project "${created.title}" initialized as draft.`);
            loadProjects();
          }}
        />
      )}

      {/* 5. Winner Payout Details Modal */}
      {payoutProject && (
        <WinnerPayoutModal
          project={payoutProject}
          onClose={() => setPayoutProject(null)}
          onSuccess={() => {
            setPayoutProject(null);
            showToast("✓ Payment disbursement details submitted successfully.");
            loadProjects();
          }}
        />
      )}
    </div>
  );
}

/* ============================================================================
 * MODAL 0: WINNER PRIZE DISBURSEMENT / PAYMENT DETAILS MODAL
 * ============================================================================ */
function WinnerPayoutModal({
  project,
  onClose,
  onSuccess,
}: {
  project: UserProject;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [provider, setProvider] = useState<string>(
    project.payoutDetails?.provider || "Commercial Bank of Ethiopia (CBE)"
  );
  const [beneficiaryName, setBeneficiaryName] = useState<string>(
    project.payoutDetails?.beneficiaryName || ""
  );
  const [accountNumber, setAccountNumber] = useState<string>(
    project.payoutDetails?.accountNumber || ""
  );
  const [phone, setPhone] = useState<string>(
    project.payoutDetails?.phone || ""
  );
  const [notes, setNotes] = useState<string>(
    project.payoutDetails?.notes || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!accountNumber.trim()) {
      setErrorMessage("Please enter your account or wallet number.");
      return;
    }

    if (!beneficiaryName.trim()) {
      setErrorMessage("Please enter the beneficiary / account holder name.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submissionsClient.submitPayoutDetails(project.id, {
        provider,
        beneficiaryName: beneficiaryName.trim(),
        accountNumber: accountNumber.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Failed to submit payment details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentProviders = [
    "Commercial Bank of Ethiopia (CBE)",
    "Telebirr (Ethio Telecom)",
    "Dashen Bank / Amole",
    "Awash Bank",
    "Bank of Abyssinia",
    "Cooperative Bank of Oromia (Coop)",
    "Wegagen Bank",
    "United Bank (Hibret)",
    "Direct International Wire / Swift",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#d6e7e1] flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shadow-2xs font-extrabold text-base">
              🏆
            </span>
            <div>
              <h3 className="font-display text-base font-extrabold text-[#122622]">
                Prize Disbursement Form
              </h3>
              <p className="text-[11px] font-semibold text-[#57685f]">
                {project.hackathonName} • Winner Finalist
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Winner congratulations banner */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-white shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-200" />
            <span className="font-display text-sm font-black">
              Congratulations on your ranking!
            </span>
          </div>
          <p className="text-xs text-amber-100 font-medium">
            The hackathon organizers have requested your team's payment method to disburse your cash prize. Please provide accurate banking or Telebirr details below.
          </p>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-extrabold text-[#122622] mb-1">
              Payment Provider / Bank *
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-3 text-xs font-semibold text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
            >
              {paymentProviders.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#122622] mb-1">
              Beneficiary Name (Account Holder) *
            </label>
            <input
              type="text"
              required
              value={beneficiaryName}
              onChange={(e) => setBeneficiaryName(e.target.value)}
              placeholder="e.g. Abebe Kebede Tessema"
              className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-[#122622] mb-1">
                Account or Wallet Number *
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 1000123456789 or 0911..."
                className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-3 text-xs font-mono font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#122622] mb-1">
                Contact Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +251 91 123 4567"
                className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#122622] mb-1">
              Additional Payment Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. CBE Birr branch name or disbursement remarks..."
              className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-2.5 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
            />
          </div>

          <div className="mt-2 flex items-center justify-end gap-3 border-t border-[#d6e7e1] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Submitting Details...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Payment Method</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================================
 * MODAL 1: DRAFT EDIT & SUBMISSION MODAL
 * ============================================================================ */
function DraftEditModal({
  project,
  onClose,
  onSaveDraft,
  onSubmitForReview,
}: {
  project: UserProject;
  onClose: () => void;
  onSaveDraft: (updated: UserProject) => void;
  onSubmitForReview: (updated: UserProject) => void;
}) {
  const [title, setTitle] = useState(project.title || "");
  const [tagline, setTagline] = useState(project.tagline || "");
  const [repoUrl, setRepoUrl] = useState(project.repoUrl || "");
  const [demoUrl, setDemoUrl] = useState(project.demoUrl || "");
  const [videoUrl, setVideoUrl] = useState(project.videoUrl || "");
  const [pitchDeckUrl, setPitchDeckUrl] = useState(project.pitchDeckUrl || "");
  const [description, setDescription] = useState(project.description || "");

  const [techStack, setTechStack] = useState<string[]>(
    project.techStack?.length > 0
      ? project.techStack
      : ["Python", "FastAPI", "React", "Next.js"]
  );
  const [newTagInput, setNewTagInput] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed]);
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTechStack(techStack.filter((t) => t !== tag));
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      setErrors({ title: "Project title is required." });
      return;
    }
    setIsSaving(true);
    setErrors({});
    try {
      const payload: Partial<UserProject> = {
        title: title.trim(),
        tagline: tagline.trim(),
        repoUrl: repoUrl.trim() || undefined,
        demoUrl: demoUrl.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        pitchDeckUrl: pitchDeckUrl.trim() || undefined,
        techStack,
        description: description.trim(),
      };
      const updated = await userProjectsClient.saveProjectDraft(project.id, payload);
      onSaveDraft(updated);
    } catch (err) {
      console.error(err);
      setErrors({ form: "Failed to save draft. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = "Project title is required.";
    }
    if (!repoUrl.trim()) {
      newErrors.repoUrl = "GitHub Repository URL is required for judge evaluation.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      const payload: SubmitProjectPayload = {
        title: title.trim(),
        tagline: tagline.trim(),
        repoUrl: repoUrl.trim(),
        demoUrl: demoUrl.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        pitchDeckUrl: pitchDeckUrl.trim() || undefined,
        techStack,
        description: description.trim(),
      };
      const updated = await userProjectsClient.submitProjectForReview(
        project.id,
        payload
      );
      onSubmitForReview(updated);
    } catch (err) {
      console.error(err);
      setErrors({ form: "Failed to submit project. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 flex flex-col gap-6">
        <div className="flex items-start justify-between border-b border-[#d6e7e1] pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 shadow-2xs font-bold">
              <FileEdit className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl font-extrabold text-[#122622]">
                  Edit Project Draft
                </h3>
                <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                  Draft Mode
                </span>
              </div>
              <p className="text-xs text-[#57685f] mt-0.5">
                Hackathon: <strong>{project.hackathonName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errors.form && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs font-bold text-[#c4211c]">
            <AlertCircle className="h-4 w-4 text-[#c4211c] shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                Project Name <span className="text-[#c4211c]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. EcoPath Optimizer"
                className={`w-full rounded-2xl border bg-[#f3f6f4] p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white ${
                  errors.title ? "border-red-400 bg-red-50/20" : "border-[#d6e7e1]"
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-[11px] font-bold text-[#c4211c]">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                Tagline / Short Summary
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. AI-driven transit routing"
                className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
              GitHub Source Repository URL{" "}
              <span className="text-gray-400 font-normal">
                (Required before submitting to judges)
              </span>
            </label>
            <div className="relative">
              <FolderGit2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/organization/repo-name"
                className={`w-full rounded-2xl border bg-[#f3f6f4] pl-10 pr-4 py-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white ${
                  errors.repoUrl ? "border-red-400 bg-red-50/20" : "border-[#d6e7e1]"
                }`}
              />
            </div>
            {errors.repoUrl && (
              <p className="mt-1 text-[11px] font-bold text-[#c4211c]">{errors.repoUrl}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                Live Product URL (Optional)
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://myproject.vercel.app"
                  className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] pl-10 pr-4 py-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                Video Walkthrough URL (Optional)
              </label>
              <div className="relative">
                <Video className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] pl-10 pr-4 py-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
              Pitch Deck / Presentation Slides Link (Optional)
            </label>
            <div className="relative">
              <FileSpreadsheet className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={pitchDeckUrl}
                onChange={(e) => setPitchDeckUrl(e.target.value)}
                placeholder="https://storage.hodana.et/decks/presentation.pdf"
                className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] pl-10 pr-4 py-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
              Tech Stack
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#e8f3f0] border border-[#d6e7e1] px-3 py-1 text-xs font-bold text-[#0f6b5c]"
                >
                  <span>{tech}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tech)}
                    className="hover:text-red-600 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add technology (e.g. PyTorch, Next.js) and press Enter..."
                className="flex-1 rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-2.5 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-2xl bg-[#e8f3f0] px-4 py-2.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#d6e7e1] cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
              Overview & Solution Architecture
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem scope, tech stack implementation, and impact..."
              className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#d6e7e1] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-200 px-5 py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSaving || isSubmitting}
                onClick={handleSaveDraft}
                className="flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Draft...</span>
                  </>
                ) : (
                  <>
                    <FileEdit className="h-4 w-4 text-amber-700" />
                    <span>Save Draft</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isSaving || isSubmitting}
                onClick={handleSubmitForReview}
                className="flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    <span>Submit for Judge Review</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * MODAL 2: FINAL REVIEW JUDGE EVALUATION MODAL (READ-ONLY)
 * ============================================================================ */
function EvaluationReviewModal({
  project,
  onClose,
  onSimulateReview,
}: {
  project: UserProject;
  onClose: () => void;
  onSimulateReview?: (projectId: string) => Promise<void>;
}) {
  const [evaluation, setEvaluation] = useState<ProjectEvaluation | null>(
    project.evaluation || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const fetchEval = async () => {
      if (project.evaluation) {
        setEvaluation(project.evaluation);
        return;
      }
      setIsLoading(true);
      try {
        const data = await userProjectsClient.getProjectEvaluation(project.id);
        setEvaluation(data);
      } catch (err) {
        console.error("Failed to load project evaluation:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEval();
  }, [project]);

  const handlePrintRubric = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleRunSimulation = async () => {
    if (!onSimulateReview) return;
    setIsSimulating(true);
    try {
      await onSimulateReview(project.id);
    } finally {
      setIsSimulating(false);
    }
  };

  const isCompleted = Boolean(evaluation?.overallScore != null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 flex flex-col gap-6">
        <div className="flex items-start justify-between border-b border-[#d6e7e1] pb-4">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-2xs font-bold ${
                isCompleted
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-sky-50 border border-sky-200 text-sky-700"
              }`}
            >
              <Gavel className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-[#122622]">
                  {isCompleted ? "Official Final Review" : "Submission Under Review"}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                    isCompleted
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-sky-100 text-sky-800"
                  }`}
                >
                  {isCompleted ? "Finished / Certified" : "Awaiting Judge Evaluation"}
                </span>
              </div>
              <p className="text-xs text-[#57685f] mt-0.5">
                {project.title} • Submitted to <strong>{project.hackathonName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCompleted && (
              <button
                type="button"
                onClick={handlePrintRubric}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Print Rubric</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#f3f6f4] border border-[#d6e7e1] p-3 text-xs text-[#57685f]">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-[#0f6b5c] shrink-0" />
            <span>
              This project record is <strong>Read-Only</strong>. Deliverables are officially locked for hackathon record keeping.
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 shrink-0">
            Non-deletable
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-[#0f6b5c]" />
            <span className="text-xs font-bold">Loading judge evaluation data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4 rounded-2xl bg-[#f8faf9] border border-[#d6e7e1] p-5">
              <h4 className="font-display text-sm font-extrabold text-[#122622] border-b border-[#d6e7e1] pb-2">
                Project Information & Deliverables
              </h4>

              <div>
                <span className="block text-[10px] font-bold uppercase text-gray-400">
                  Tagline
                </span>
                <p className="text-xs font-semibold text-[#122622] mt-0.5">
                  {project.tagline || "—"}
                </p>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase text-gray-400">
                  Detailed Solution Overview
                </span>
                <p className="text-xs text-[#57685f] leading-relaxed mt-0.5 whitespace-pre-line">
                  {project.description || "No description provided."}
                </p>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">
                  Tech Stack
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack?.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md bg-white border border-[#d6e7e1] px-2.5 py-1 text-[10px] font-bold text-[#0f6b5c]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase text-gray-400 mb-2">
                  Submitted Deliverables
                </span>
                <div className="flex flex-col gap-2">
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl bg-white border border-[#d6e7e1] p-2.5 text-xs font-bold text-[#122622] hover:border-[#0f6b5c] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FolderGit2 className="h-4 w-4 text-gray-600" />
                        <span>Source Code Repository</span>
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl bg-white border border-[#d6e7e1] p-2.5 text-xs font-bold text-[#122622] hover:border-[#0f6b5c] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-[#0f6b5c]" />
                        <span>Live Web App Demo</span>
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                    </a>
                  )}
                  {project.videoUrl && (
                    <a
                      href={project.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl bg-white border border-[#d6e7e1] p-2.5 text-xs font-bold text-[#122622] hover:border-[#0f6b5c] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-red-600" />
                        <span>Video Pitch Walkthrough</span>
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                    </a>
                  )}
                  {project.pitchDeckUrl && (
                    <a
                      href={project.pitchDeckUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl bg-white border border-[#d6e7e1] p-2.5 text-xs font-bold text-[#122622] hover:border-[#0f6b5c] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-amber-600" />
                        <span>Pitch Deck Slides</span>
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {isCompleted ? (
                <>
                  <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-2">
                    <h4 className="font-display text-sm font-extrabold text-[#122622]">
                      Certified Judge Evaluation Results
                    </h4>
                    <div className="flex items-center gap-1.5 rounded-2xl bg-emerald-50 border border-emerald-300 px-3.5 py-1.5 text-xs font-extrabold text-emerald-900 shadow-2xs">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                      <span>
                        ⭐ {evaluation?.overallScore.toFixed(1) || "9.6"} / 10.0
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs font-bold text-[#122622]">
                        <span>1. Innovation & Originality</span>
                        <span className="text-[#0f6b5c] font-extrabold">
                          {evaluation?.criteriaScores.innovation.toFixed(1) || "9.5"} / 10.0
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#e8f3f0] overflow-hidden">
                        <div
                          className="h-full bg-[#0f6b5c] rounded-full"
                          style={{
                            width: `${
                              ((evaluation?.criteriaScores.innovation || 9.5) / 10) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs font-bold text-[#122622]">
                        <span>2. Technical Execution & Architecture</span>
                        <span className="text-[#0f6b5c] font-extrabold">
                          {evaluation?.criteriaScores.technical.toFixed(1) || "9.3"} / 10.0
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#e8f3f0] overflow-hidden">
                        <div
                          className="h-full bg-[#0f6b5c] rounded-full"
                          style={{
                            width: `${
                              ((evaluation?.criteriaScores.technical || 9.3) / 10) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs font-bold text-[#122622]">
                        <span>3. Design & User Experience</span>
                        <span className="text-[#0f6b5c] font-extrabold">
                          {evaluation?.criteriaScores.design.toFixed(1) || "9.0"} / 10.0
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#e8f3f0] overflow-hidden">
                        <div
                          className="h-full bg-[#0f6b5c] rounded-full"
                          style={{
                            width: `${
                              ((evaluation?.criteriaScores.design || 9.0) / 10) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs font-bold text-[#122622]">
                        <span>4. Impact & Regional Feasibility</span>
                        <span className="text-[#0f6b5c] font-extrabold">
                          {evaluation?.criteriaScores.impact.toFixed(1) || "9.6"} / 10.0
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#e8f3f0] overflow-hidden">
                        <div
                          className="h-full bg-[#0f6b5c] rounded-full"
                          style={{
                            width: `${
                              ((evaluation?.criteriaScores.impact || 9.6) / 10) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 flex flex-col gap-2">
                    <span className="text-xs font-extrabold text-[#122622]">
                      Official Judge Feedback & Deliberation Notes
                    </span>
                    <p className="text-xs text-gray-700 leading-relaxed italic">
                      &ldquo;
                      {evaluation?.feedback ||
                        "Exceptional solution. Demonstrates deep domain understanding and robust prototype execution."}
                      &rdquo;
                    </p>
                    {evaluation?.judgeName && (
                      <div className="flex items-center gap-2 mt-1 text-[11px] font-extrabold text-[#0f6b5c]">
                        <Gavel className="h-3 w-3" />
                        <span>
                          {evaluation.judgeName}{" "}
                          {evaluation.judgeTitle && `(${evaluation.judgeTitle})`}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 text-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-display text-base font-extrabold text-[#122622]">
                      In Judging Queue
                    </h4>
                    <p className="text-xs text-[#57685f] mt-1 max-w-xs leading-relaxed">
                      Your deliverables have been submitted to the hackathon judging committee. The project will transition to <strong>Finished</strong> once judges submit their evaluation.
                    </p>
                  </div>

                  {onSimulateReview && (
                    <div className="border-t border-sky-200 pt-4 w-full">
                      <button
                        type="button"
                        disabled={isSimulating}
                        onClick={handleRunSimulation}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-50 cursor-pointer"
                      >
                        {isSimulating ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Simulating Judge Review...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                            <span>Simulate Judge Evaluation (Demo)</span>
                          </>
                        )}
                      </button>
                      <span className="block text-[10px] text-gray-500 text-center mt-1.5">
                        Simulates judge submission to test the finished lifecycle state.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end border-t border-[#d6e7e1] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-all cursor-pointer"
          >
            Close Review
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * MODAL 3: DELETE DRAFT CONFIRMATION MODAL
 * ============================================================================ */
function DeleteConfirmationModal({
  project,
  onClose,
  onConfirm,
}: {
  project: UserProject;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 flex flex-col gap-5">
        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <div>
            <h3 className="font-display text-lg font-extrabold text-[#122622]">
              Delete Draft Project?
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <p className="text-xs text-[#57685f] leading-relaxed">
          Are you sure you want to delete the draft{" "}
          <strong className="text-[#122622]">"{project.title}"</strong>? All saved form data and deliverables will be permanently removed.
        </p>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Draft</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * MODAL 4: CREATE NEW PROJECT MODAL
 * ============================================================================ */
function CreateProjectModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (project: UserProject) => void;
}) {
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("AI & Machine Learning");
  const [hackathonName, setHackathonName] = useState("");
  const [selectedHackathonId, setSelectedHackathonId] = useState("");
  const [platformHackathons, setPlatformHackathons] = useState<
    Array<{ id: string; title: string; category?: string }>
  >([]);
  const [isLoadingHackathons, setIsLoadingHackathons] = useState(true);
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState<string[]>(["React", "Next.js", "Python"]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadHackathons() {
      setIsLoadingHackathons(true);
      try {
        const res = await hackathonsClient.listHackathons();
        const items = res?.data || [];
        if (isMounted) {
          if (items.length > 0) {
            const list = items.map((h) => ({
              id: h.id || h.slug,
              title: h.title,
              category: h.tags?.[0] || "AI & Machine Learning",
            }));
            setPlatformHackathons(list);
            setSelectedHackathonId(list[0].id);
            setHackathonName(list[0].title);
            if (list[0].category) setCategory(list[0].category);
          } else {
            const defaults = [
              { id: "hck-101", title: "AgriStream 2024", category: "AgriTech" },
              { id: "hck-102", title: "FinTech Frontier", category: "FinTech" },
              { id: "hck-103", title: "HealthBridge Ethiopia", category: "HealthTech" },
              {
                id: "hck-ethio-green",
                title: "Ethio-Green Tech Challenge 2024",
                category: "Clean Energy & IoT",
              },
            ];
            setPlatformHackathons(defaults);
            setSelectedHackathonId(defaults[0].id);
            setHackathonName(defaults[0].title);
            setCategory(defaults[0].category);
          }
        }
      } catch (err) {
        console.warn("Failed to load platform hackathons:", err);
      } finally {
        if (isMounted) setIsLoadingHackathons(false);
      }
    }
    loadHackathons();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed]);
      setTagInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Project title is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: CreateProjectPayload = {
        title: title.trim(),
        tagline: tagline.trim() || "Innovative solution draft",
        category,
        hackathonId: selectedHackathonId || "hck-101",
        hackathonName: hackathonName || "AgriStream 2024",
        teamName: "Participant Team",
        techStack,
        description: description.trim(),
        repoUrl: repoUrl.trim() || undefined,
        demoUrl: demoUrl.trim() || undefined,
      };

      const created = await userProjectsClient.createProject(payload);
      onSuccess(created);
    } catch (err) {
      console.error(err);
      setError("Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c] font-bold">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-extrabold text-[#122622]">
                Initialize New Project Draft
              </h3>
              <p className="text-xs text-[#57685f]">
                Start a draft project to prepare your hackathon deliverables
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 p-3 text-xs font-bold text-[#c4211c]">
            <AlertCircle className="h-4 w-4 text-[#c4211c] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-extrabold text-[#122622] mb-1">
              Project Title <span className="text-[#c4211c]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AgriScan crop disease identifier"
              className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-extrabold text-[#122622] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white cursor-pointer"
              >
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="FinTech">FinTech & Micro-finance</option>
                <option value="AgriTech">AgriTech & Food Security</option>
                <option value="HealthTech">HealthTech</option>
                <option value="Clean Energy & IoT">Clean Energy & IoT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#122622] mb-1">
                Platform Hackathon <span className="text-[#c4211c]">*</span>
              </label>
              <select
                value={selectedHackathonId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedHackathonId(id);
                  const found = platformHackathons.find((h) => h.id === id);
                  if (found) {
                    setHackathonName(found.title);
                    if (found.category) setCategory(found.category);
                  }
                }}
                disabled={isLoadingHackathons}
                className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white cursor-pointer disabled:opacity-60"
              >
                {isLoadingHackathons ? (
                  <option>Loading platform hackathons...</option>
                ) : (
                  platformHackathons.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.title}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#122622] mb-1">
              Short Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Automated crop triage using mobile camera feed"
              className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-extrabold text-[#122622] mb-1">
                GitHub Repository (Optional)
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-[#122622] mb-1">
                Live Web Demo URL (Optional)
              </label>
              <input
                type="text"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://myproject.vercel.app"
                className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#122622] mb-1">
              Tech Stack
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#e8f3f0] border border-[#d6e7e1] px-2.5 py-1 text-[11px] font-bold text-[#0f6b5c]"
                >
                  <span>{tech}</span>
                  <button
                    type="button"
                    onClick={() => setTechStack(techStack.filter((t) => t !== tech))}
                    className="hover:text-red-600 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tool/tech and press Enter..."
                className="flex-1 rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-2.5 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-2xl bg-[#e8f3f0] px-3.5 py-2.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#d6e7e1] cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#122622] mb-1">
              Problem & Solution Overview
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the core problem, target audience, and architecture..."
              className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
            />
          </div>

          <div className="mt-3 flex items-center justify-end gap-3 border-t border-[#d6e7e1] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-[#0f6b5c] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Creating Draft...</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Project Draft</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
