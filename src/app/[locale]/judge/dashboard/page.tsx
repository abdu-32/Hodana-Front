"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Gavel,
  Search,
  Check,
  ChevronDown,
  Layers,
  Star,
  Award,
  ExternalLink,
  FolderGit2,
  Video,
  FileSpreadsheet,
  Filter,
  CheckCircle2,
  Clock,
  Save,
  Users,
  X,
  Plus,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { Logomark } from "@/components/ui/Logomark";
import {
  judgeClient,
  type JudgeAssignedHackathon,
  type JudgeProjectSubmission,
  type CriteriaScores,
} from "@/features/judging/lib/judge-client";
import { NotificationBellDropdown } from "@/features/notifications/components/NotificationBellDropdown";

export default function JudgeDashboardPage() {
  const t = useTranslations("Organizer");
  const { user } = useSession();

  const judgeName = user?.fullName || user?.email?.split("@")[0] || "Distinguished Judge";
  const judgeInitial = judgeName.charAt(0).toUpperCase();

  // Data state
  const [assignedHackathons, setAssignedHackathons] = useState<JudgeAssignedHackathon[]>([]);
  const [submissions, setSubmissions] = useState<JudgeProjectSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Scoring Modal State
  const [evaluatingSubmission, setEvaluatingSubmission] = useState<JudgeProjectSubmission | null>(null);
  const [criteriaScores, setCriteriaScores] = useState<CriteriaScores>({
    innovation: 8.0,
    technical: 8.0,
    design: 8.0,
    impact: 8.0,
  });
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load Assigned Hackathons & Submissions
  const loadJudgeData = async () => {
    setIsLoading(true);
    try {
      const hckData = await judgeClient.getAssignedHackathons();
      setAssignedHackathons(hckData);

      if (hckData.length === 0) {
        setSubmissions([]);
        return;
      }

      // If currently selected hackathon is not in the assigned list, default to 'all' or first
      let activeHackId = selectedHackathonId;
      if (activeHackId !== "all" && !hckData.some((h) => h.id === activeHackId)) {
        activeHackId = "all";
        setSelectedHackathonId("all");
      }

      const subData = await judgeClient.getSubmissionsForJudge(
        activeHackId,
        selectedCategory,
        selectedStatus
      );
      setSubmissions(subData);
    } catch (err) {
      console.error("Failed to load judge dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJudgeData();
  }, [selectedHackathonId, selectedCategory, selectedStatus]);

  // Open modal & prepopulate scores if exists
  const handleOpenEvaluationModal = (sub: JudgeProjectSubmission) => {
    setEvaluatingSubmission(sub);
    if (sub.myEvaluation?.criteriaScores) {
      const existing = sub.myEvaluation.criteriaScores;
      setCriteriaScores({
        innovation: Number(existing.innovation) || 8.0,
        technical: Number(existing.technical) || 8.0,
        design: Number(existing.design) || 8.0,
        impact: Number(existing.impact) || 8.0,
      });
      setFeedbackText(sub.myEvaluation.feedback || "");
    } else {
      setCriteriaScores({
        innovation: 8.0,
        technical: 8.0,
        design: 8.0,
        impact: 8.0,
      });
      setFeedbackText("");
    }
  };

  // Real-time calculated overall score
  const computedOverallScore = useMemo(() => {
    const keys = Object.keys(criteriaScores);
    if (keys.length === 0) return 0;
    const sum = keys.reduce((acc, k) => acc + (Number(criteriaScores[k]) || 0), 0);
    return parseFloat((sum / keys.length).toFixed(2));
  }, [criteriaScores]);

  // Submit evaluation (Draft or Final)
  const handleSaveEvaluation = async (isFinalSubmit: boolean) => {
    if (!evaluatingSubmission) return;
    setIsSubmittingEval(true);
    try {
      const sanitizedScores: CriteriaScores = {
        innovation: Math.min(10, Math.max(1, Number(criteriaScores.innovation) || 1)),
        technical: Math.min(10, Math.max(1, Number(criteriaScores.technical) || 1)),
        design: Math.min(10, Math.max(1, Number(criteriaScores.design) || 1)),
        impact: Math.min(10, Math.max(1, Number(criteriaScores.impact) || 1)),
      };

      const res = await judgeClient.saveEvaluation(
        evaluatingSubmission.id,
        sanitizedScores,
        feedbackText,
        isFinalSubmit,
        evaluatingSubmission.hackathonId
      );

      if (res.success) {
        setToastMsg(
          isFinalSubmit
            ? `Final evaluation of ⭐ ${res.evaluation.overallScore} submitted for "${evaluatingSubmission.projectTitle}"!`
            : `Draft score saved for "${evaluatingSubmission.projectTitle}".`
        );
        setTimeout(() => setToastMsg(null), 4000);
        setEvaluatingSubmission(null);
        await loadJudgeData();
      }
    } catch (err) {
      console.error("Failed to save evaluation:", err);
    } finally {
      setIsSubmittingEval(false);
    }
  };

  // Filtered submissions based on search input
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.projectTitle.toLowerCase().includes(q) ||
          s.teamName.toLowerCase().includes(q) ||
          s.tagline.toLowerCase().includes(q) ||
          s.techStack.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [submissions, searchQuery]);

  const selectedHackathonTitle =
    selectedHackathonId === "all"
      ? "All Assigned Hackathons"
      : assignedHackathons.find((h) => h.id === selectedHackathonId)?.title || "Select Event";

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#122622]">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col p-3 sm:p-6 lg:p-8">
        {/* ================= HEADER & IDENTITY BAR ================= */}
        <header className="mb-6 sm:mb-8 flex flex-col gap-4 rounded-3xl border border-[#d6e7e1] bg-white p-4 sm:p-6 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0f6b5c] text-white shadow-md transition-transform hover:scale-105 p-2"
              title="Go to Home"
            >
              <Logomark className="h-full w-full object-contain" />
            </Link>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-[#122622]">
                  Judge Evaluation Portal
                </h1>
                <span className="rounded-full bg-[#e8f3f0] border border-[#d6e7e1] px-2.5 py-0.5 text-[10px] font-extrabold text-[#0f6b5c]">
                  OFFICIAL JUDGE
                </span>
              </div>
              <p className="text-xs text-[#57685f] mt-0.5 truncate">
                Review assigned hackathons, inspect team deliverables, and evaluate project rubrics.
              </p>
            </div>
          </div>

          {/* Judge Identity Badge & Notifications */}
          <div className="flex items-center gap-2 sm:gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-2 pr-3 sm:pr-4 shadow-2xs min-w-0">
              <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#0f6b5c] text-xs font-extrabold text-white shadow-xs">
                {judgeInitial}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-extrabold text-[#122622] truncate">{judgeName}</span>
                <span className="text-[10px] font-bold text-[#57685f] truncate">{user?.email || "Official Evaluation Panel"}</span>
              </div>
            </div>
            <NotificationBellDropdown />
          </div>
        </header>

        {/* Success Toast Notification */}
        {toastMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-900 animate-fade-in shadow-xs">
            <CheckCircle2 className="h-5 w-5 text-[#16793d] shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* ================= ZERO ASSIGNMENTS EMPTY STATE ================= */}
        {!isLoading && assignedHackathons.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#d6e7e1] bg-white p-12 text-center shadow-sm my-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#e8f3f0] text-[#0f6b5c] mb-4 shadow-xs">
              <Gavel className="h-8 w-8" />
            </div>
            <h2 className="font-display text-xl font-extrabold text-[#122622]">
              No hackathons assigned yet.
            </h2>
            <p className="mt-2 max-w-md text-xs text-[#57685f] leading-relaxed">
              You haven't been assigned to judge any hackathons yet, or your invitation is still pending acceptance. Once an organizer invites you and your invitation is accepted, your assigned hackathons and project submissions will appear here.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="rounded-2xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ================= 1. ASSIGNED HACKATHONS OVERVIEW GRID ================= */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-extrabold text-[#122622]">
                  Assigned Hackathons
                </h2>
                <span className="text-xs font-semibold text-[#57685f]">
                  {assignedHackathons.length} Active {assignedHackathons.length === 1 ? "Event" : "Events"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {assignedHackathons.map((hck) => {
                  const progressPct =
                    hck.totalSubmissions > 0
                      ? Math.round((hck.evaluatedSubmissions / hck.totalSubmissions) * 100)
                      : 0;

                  return (
                    <div
                      key={hck.id}
                      className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-4 sm:p-6 shadow-2xs hover:shadow-sm transition-all"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="rounded-lg bg-[#e8f3f0] border border-[#d6e7e1] px-2.5 py-0.5 text-[10px] font-bold text-[#0f6b5c]">
                            {hck.category || "Hackathon"}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-[#57685f]">
                            <Clock className="h-3.5 w-3.5 text-[#c68a00]" />
                            <span>Deadline: {hck.deadline}</span>
                          </div>
                        </div>

                        <h3 className="font-display text-xl font-extrabold text-[#122622] mt-1">
                          {hck.title}
                        </h3>
                        <p className="text-xs text-[#57685f]">
                          Organized by <strong>{hck.organizerName}</strong>
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-3 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#122622]">
                            <span>Evaluation Progress</span>
                            <span>
                              {hck.evaluatedSubmissions} / {hck.totalSubmissions} Projects ({progressPct}%)
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-[#f3f6f4] overflow-hidden border border-[#d6e7e1]">
                            <div
                              className="h-full bg-[#0f6b5c] transition-all duration-500 rounded-full"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-[#d6e7e1] pt-4 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#57685f]">
                          {Math.max(0, hck.totalSubmissions - hck.evaluatedSubmissions)} Submissions Pending Review
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedHackathonId(hck.id)}
                          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                            selectedHackathonId === hck.id
                              ? "bg-[#0f6b5c] text-white shadow-xs"
                              : "bg-[#e8f3f0] text-[#0f6b5c] hover:bg-[#0f6b5c] hover:text-white"
                          }`}
                        >
                          <span>{selectedHackathonId === hck.id ? "Viewing Queue" : "Filter Event"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ================= 2. EVALUATION QUEUE & FILTERS ================= */}
            <section className="flex flex-col gap-4">
              {/* Filters Bar */}
              <div className="flex flex-col gap-4 rounded-3xl border border-[#d6e7e1] bg-white p-4 sm:p-5 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
                {/* Search Input */}
                <div className="relative flex-1 w-full min-w-0 sm:min-w-[240px]">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#57685f]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search project title, team, or tech stack..."
                    className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] pl-10 pr-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
                  />
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Event Filter (strictly contains assigned hackathons) */}
                  <div className="relative w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setIsEventDropdownOpen((prev) => !prev)}
                      className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] px-3.5 py-2.5 text-xs font-bold text-[#122622] shadow-2xs hover:bg-white transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0 truncate">
                        <Layers className="h-3.5 w-3.5 text-[#0f6b5c] shrink-0" />
                        <span className="text-[#57685f]">Event:</span>
                        <span className="truncate">{selectedHackathonTitle}</span>
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-[#57685f] shrink-0" />
                    </button>

                    {isEventDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-full sm:w-64 rounded-2xl border border-[#d6e7e1] bg-white p-2 shadow-xl z-30">
                        {assignedHackathons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedHackathonId("all");
                              setIsEventDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                              selectedHackathonId === "all"
                                ? "bg-[#0f6b5c] text-white"
                                : "text-[#122622] hover:bg-[#e8f3f0]"
                            }`}
                          >
                            <span>All Assigned Hackathons</span>
                            {selectedHackathonId === "all" && <Check className="h-3.5 w-3.5" />}
                          </button>
                        )}
                        {assignedHackathons.map((hck) => (
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
                            <span className="truncate">{hck.title}</span>
                            {selectedHackathonId === hck.id && <Check className="h-3.5 w-3.5 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div className="relative w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
                      className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] px-3.5 py-2.5 text-xs font-bold text-[#122622] shadow-2xs hover:bg-white transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Filter className="h-3.5 w-3.5 text-[#0f6b5c] shrink-0" />
                        <span className="capitalize">
                          {selectedStatus === "all"
                            ? "All Statuses"
                            : selectedStatus === "pending"
                            ? "Pending Review"
                            : "Completed"}
                        </span>
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-[#57685f] shrink-0" />
                    </button>

                    {isStatusDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-full sm:w-48 rounded-2xl border border-[#d6e7e1] bg-white p-2 shadow-xl z-30">
                        {[
                          { key: "all", label: "All Statuses" },
                          { key: "pending", label: "Pending Review" },
                          { key: "completed", label: "Completed" },
                        ].map((st) => (
                          <button
                            key={st.key}
                            type="button"
                            onClick={() => {
                              setSelectedStatus(st.key);
                              setIsStatusDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                              selectedStatus === st.key
                                ? "bg-[#0f6b5c] text-white"
                                : "text-[#122622] hover:bg-[#e8f3f0]"
                            }`}
                          >
                            <span>{st.label}</span>
                            {selectedStatus === st.key && <Check className="h-3.5 w-3.5" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submissions Queue Table */}
              <div className="overflow-hidden rounded-3xl border border-[#d6e7e1] bg-white shadow-2xs">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full min-w-[720px] text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#d6e7e1] bg-[#f3f6f4] text-[11px] font-extrabold uppercase tracking-wider text-[#57685f]">
                        <th className="py-4 px-6">Project & Team Info</th>
                        <th className="py-4 px-6">Assets & Deliverables</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6">My Score</th>
                        <th className="py-4 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d6e7e1]">
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-[#57685f] font-semibold">
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-[#0f6b5c]" />
                              <span>Loading assigned project submissions...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredSubmissions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-[#57685f] font-semibold">
                            No submissions found for the selected filters.
                          </td>
                        </tr>
                      ) : (
                        filteredSubmissions.map((sub) => {
                          const isCompleted = sub.evaluationStatus === "COMPLETED";
                          const isInProgress = sub.evaluationStatus === "IN_PROGRESS";

                          return (
                            <tr key={sub.id} className="transition-colors hover:bg-[#f3f6f4]">
                              {/* Project Name & Info */}
                              <td className="py-4 px-6">
                                <div className="flex flex-col gap-1 max-w-md">
                                  <div className="flex items-center gap-2">
                                    <span className="font-display text-sm font-extrabold text-[#122622]">
                                      {sub.projectTitle}
                                    </span>
                                    <span className="rounded-md bg-[#e8f3f0] border border-[#d6e7e1] px-2 py-0.5 text-[10px] font-bold text-[#0f6b5c]">
                                      {sub.category || "General"}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#57685f] line-clamp-1">
                                    {sub.tagline || sub.description}
                                  </p>
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#57685f] mt-0.5">
                                    <Users className="h-3 w-3 text-[#0f6b5c]" />
                                    <span>{sub.teamName} ({sub.teamMembersCount} {sub.teamMembersCount === 1 ? "Member" : "Members"})</span>
                                    <span>•</span>
                                    <span>{sub.hackathonName}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Submission Assets Quick Links */}
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  {sub.repoUrl ? (
                                    <a
                                      href={sub.repoUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      title="Repository Source"
                                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-700 hover:bg-[#0f6b5c] hover:text-white transition-all shadow-2xs"
                                    >
                                      <FolderGit2 className="h-4 w-4" />
                                    </a>
                                  ) : null}
                                  {sub.demoUrl ? (
                                    <a
                                      href={sub.demoUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      title="Live App Demo"
                                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e8f3f0] text-[#0f6b5c] hover:bg-[#0f6b5c] hover:text-white transition-all shadow-2xs"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  ) : null}
                                  {sub.videoUrl ? (
                                    <a
                                      href={sub.videoUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      title="Video Presentation"
                                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-[#c4211c] hover:bg-[#c4211c] hover:text-white transition-all shadow-2xs"
                                    >
                                      <Video className="h-4 w-4" />
                                    </a>
                                  ) : null}
                                  {!sub.repoUrl && !sub.demoUrl && !sub.videoUrl && (
                                    <span className="text-[11px] text-[#57685f] italic">No links</span>
                                  )}
                                </div>
                              </td>

                              {/* Status Badge */}
                              <td className="py-4 px-6">
                                {isCompleted ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-extrabold text-[#16793d] shadow-2xs">
                                    <CheckCircle2 className="h-3 w-3" />
                                    COMPLETED
                                  </span>
                                ) : isInProgress ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[10px] font-extrabold text-amber-800 shadow-2xs">
                                    <Clock className="h-3 w-3" />
                                    IN PROGRESS
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-[10px] font-bold text-gray-600">
                                    NOT STARTED
                                  </span>
                                )}
                              </td>

                              {/* My Assigned Score */}
                              <td className="py-4 px-6">
                                {sub.myEvaluation ? (
                                  <div className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-extrabold text-amber-900 shadow-2xs">
                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                                    <span>{sub.myEvaluation.overallScore.toFixed(2)} / 10.0</span>
                                  </div>
                                ) : (
                                  <span className="text-[#57685f] font-medium">—</span>
                                )}
                              </td>

                              {/* Review & Score Action */}
                              <td className="py-4 px-6 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEvaluationModal(sub)}
                                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                                    isCompleted
                                      ? "bg-[#e8f3f0] border border-[#d6e7e1] text-[#0f6b5c] hover:bg-[#0f6b5c] hover:text-white"
                                      : "bg-[#0f6b5c] text-white shadow-xs hover:bg-[#0b5347]"
                                  }`}
                                >
                                  {isCompleted ? "Edit Score" : "Review & Score"}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ================= 3. SUBMISSION EVALUATION MODAL (SCORING INTERFACE) ================= */}
        {evaluatingSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in-50 overflow-y-auto">
            <div className="w-full max-w-4xl max-h-[92dvh] overflow-y-auto rounded-3xl border border-[#d6e7e1] bg-white p-4 sm:p-6 md:p-8 shadow-2xl animate-in zoom-in-95 flex flex-col gap-5 sm:gap-6 my-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c] shadow-2xs font-bold">
                    <Gavel className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-base sm:text-lg font-extrabold text-[#122622] truncate">
                      Evaluation Rubric: {evaluatingSubmission.projectTitle}
                    </h3>
                    <p className="text-xs text-[#57685f] truncate">
                      Submitted to <strong>{evaluatingSubmission.hackathonName}</strong> ({evaluatingSubmission.teamName})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEvaluatingSubmission(null)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#57685f] hover:bg-gray-100 transition-colors cursor-pointer ml-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Split View Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side: Project Showcase & Submission Deliverables */}
                <div className="flex flex-col gap-4 rounded-2xl bg-[#f3f6f4] border border-[#d6e7e1] p-5">
                  <h4 className="font-display text-sm font-extrabold text-[#122622] border-b border-[#d6e7e1] pb-2">
                    Project Overview & Details
                  </h4>

                  <p className="text-xs text-[#57685f] leading-relaxed">
                    {evaluatingSubmission.description || evaluatingSubmission.tagline || "No description provided."}
                  </p>

                  {/* Tech Stack */}
                  {evaluatingSubmission.techStack && evaluatingSubmission.techStack.length > 0 && (
                    <div>
                      <span className="block text-[11px] font-extrabold text-[#122622] mb-1.5">
                        Technologies & Frameworks
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {evaluatingSubmission.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-md bg-white border border-[#d6e7e1] px-2.5 py-1 text-[10px] font-bold text-[#0f6b5c]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submission Deliverables */}
                  <div>
                    <span className="block text-[11px] font-extrabold text-[#122622] mb-2">
                      Review Deliverables & Source
                    </span>
                    <div className="flex flex-col gap-2">
                      {evaluatingSubmission.repoUrl && (
                        <a
                          href={evaluatingSubmission.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-xl bg-white border border-[#d6e7e1] p-2.5 text-xs font-bold text-[#122622] hover:border-[#0f6b5c] transition-all"
                        >
                          <span className="flex items-center gap-2">
                            <FolderGit2 className="h-4 w-4 text-gray-600" />
                            <span>GitHub Source Repository</span>
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                        </a>
                      )}
                      {evaluatingSubmission.demoUrl && (
                        <a
                          href={evaluatingSubmission.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-xl bg-white border border-[#d6e7e1] p-2.5 text-xs font-bold text-[#122622] hover:border-[#0f6b5c] transition-all"
                        >
                          <span className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-[#0f6b5c]" />
                            <span>Live Product Web App</span>
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                        </a>
                      )}
                      {evaluatingSubmission.videoUrl && (
                        <a
                          href={evaluatingSubmission.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-xl bg-white border border-[#d6e7e1] p-2.5 text-xs font-bold text-[#122622] hover:border-[#0f6b5c] transition-all"
                        >
                          <span className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-[#c4211c]" />
                            <span>Video Pitch & Demo Walkthrough</span>
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                        </a>
                      )}
                      {!evaluatingSubmission.repoUrl && !evaluatingSubmission.demoUrl && !evaluatingSubmission.videoUrl && (
                        <p className="text-xs text-[#57685f] italic">
                          No direct links submitted. Review project description above.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Scoring Rubric (1 - 10 Scale) */}
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-2">
                    <h4 className="font-display text-sm font-extrabold text-[#122622]">
                      Scoring Rubric (Scale 1.0 – 10.0)
                    </h4>
                    {/* Overall Calculated Score */}
                    <div className="flex items-center gap-1.5 rounded-2xl bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-extrabold text-amber-900 shadow-2xs">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                      <span>Total Score: {computedOverallScore} / 10.0</span>
                    </div>
                  </div>

                  {/* Rubric Criteria List with Number Input & Range Slider */}
                  {[
                    {
                      key: "innovation" as const,
                      label: "1. Innovation & Originality",
                      desc: "Creativity, novelty, and uniqueness of the solution",
                    },
                    {
                      key: "technical" as const,
                      label: "2. Technical Complexity & Execution",
                      desc: "Code architecture, performance, implementation depth, and polish",
                    },
                    {
                      key: "design" as const,
                      label: "3. Design & User Experience",
                      desc: "UI aesthetics, intuitive navigation, accessibility, and responsiveness",
                    },
                    {
                      key: "impact" as const,
                      label: "4. Impact & Local Feasibility",
                      desc: "Relevance to local problem solving, utility, and scalability",
                    },
                  ].map((criterion) => {
                    const currentScore = criteriaScores[criterion.key];
                    return (
                      <div
                        key={criterion.key}
                        className="flex flex-col gap-2 rounded-2xl border border-[#d6e7e1] bg-white p-3.5 shadow-2xs hover:border-[#0f6b5c]/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-[#122622] truncate">
                              {criterion.label}
                            </span>
                            <span className="text-[10px] text-[#57685f] line-clamp-1">
                              {criterion.desc}
                            </span>
                          </div>

                          {/* Dual Input: Numeric Box */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <input
                              type="number"
                              min={1}
                              max={10}
                              step={0.1}
                              value={currentScore ?? ""}
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === "") {
                                  setCriteriaScores((prev) => ({
                                    ...prev,
                                    [criterion.key]: ("" as unknown as number),
                                  }));
                                  return;
                                }
                                const val = parseFloat(raw);
                                if (!isNaN(val)) {
                                  setCriteriaScores((prev) => ({
                                    ...prev,
                                    [criterion.key]: Math.min(10, Math.max(0, val)),
                                  }));
                                }
                              }}
                              onBlur={() => {
                                const val = Number(criteriaScores[criterion.key]);
                                const normalized =
                                  isNaN(val) || val < 1
                                    ? 1.0
                                    : Math.min(10, Math.round(val * 10) / 10);
                                setCriteriaScores((prev) => ({
                                  ...prev,
                                  [criterion.key]: normalized,
                                }));
                              }}
                              className="w-16 rounded-xl border border-[#d6e7e1] bg-[#f8faf9] px-2 py-1 text-center font-mono text-xs font-black text-[#0f6b5c] shadow-inner outline-none transition-all focus:border-[#0f6b5c] focus:bg-white focus:ring-2 focus:ring-[#0f6b5c]/20"
                              placeholder="1-10"
                            />
                            <span className="text-[11px] font-extrabold text-[#57685f]">
                              / 10
                            </span>
                          </div>
                        </div>

                        {/* Synchronized Range Slider */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[10px] font-bold text-gray-400">1</span>
                          <input
                            type="range"
                            min={1}
                            max={10}
                            step={0.1}
                            value={Number(currentScore) || 1}
                            onChange={(e) =>
                              setCriteriaScores((prev) => ({
                                ...prev,
                                [criterion.key]: parseFloat(e.target.value),
                              }))
                            }
                            className="w-full accent-[#0f6b5c] cursor-pointer"
                          />
                          <span className="text-[10px] font-bold text-gray-400">10</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Feedback Field */}
                  <div>
                    <label className="block text-xs font-extrabold text-[#122622] mb-1">
                      Constructive Feedback & Notes
                    </label>
                    <textarea
                      rows={3}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Write feedback for the submitting team or internal organizer notes..."
                      className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#d6e7e1] pt-4">
                <button
                  type="button"
                  onClick={() => handleSaveEvaluation(false)}
                  disabled={isSubmittingEval}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#d6e7e1] bg-white px-5 py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 transition-all cursor-pointer w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 text-[#57685f]" />
                  <span>Save Draft Score</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveEvaluation(true)}
                  disabled={isSubmittingEval}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer disabled:opacity-50 w-full sm:w-auto"
                >
                  <Award className="h-4 w-4" />
                  <span>{isSubmittingEval ? "Submitting..." : "Submit Final Evaluation"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
