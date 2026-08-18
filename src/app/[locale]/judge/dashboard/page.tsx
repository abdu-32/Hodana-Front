"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Gavel,
  Calendar,
  UserCheck,
  Trophy,
  FileText,
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
  Sparkles,
  Send,
  X,
  Users,
  SlidersHorizontal,
  Bell,
  User,
  Save,
  BookOpen,
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

export default function JudgeDashboardPage() {
  const t = useTranslations("Organizer");
  const { user } = useSession();

  const judgeName = user?.fullName || "Dr. Almaz Abera";
  const judgeTitle = "AI & AgriTech Senior Judge";
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
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Scoring Modal State
  const [evaluatingSubmission, setEvaluatingSubmission] = useState<JudgeProjectSubmission | null>(null);
  const [criteriaScores, setCriteriaScores] = useState<CriteriaScores>({
    innovation: 8.5,
    technical: 8.5,
    design: 8.0,
    impact: 9.0,
  });
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load Assigned Hackathons & Queue
  const loadJudgeData = async () => {
    setIsLoading(true);
    try {
      const [hckData, subData] = await Promise.all([
        judgeClient.getAssignedHackathons(),
        judgeClient.getSubmissionsForJudge(
          selectedHackathonId,
          selectedCategory,
          selectedStatus
        ),
      ]);
      setAssignedHackathons(hckData);
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
    if (sub.myEvaluation) {
      setCriteriaScores(sub.myEvaluation.criteriaScores);
      setFeedbackText(sub.myEvaluation.feedback || "");
    } else {
      setCriteriaScores({
        innovation: 8.5,
        technical: 8.5,
        design: 8.0,
        impact: 9.0,
      });
      setFeedbackText("");
    }
  };

  // Real-time calculated overall score
  const computedOverallScore = useMemo(() => {
    const avg =
      (criteriaScores.innovation +
        criteriaScores.technical +
        criteriaScores.design +
        criteriaScores.impact) /
      4;
    return parseFloat(avg.toFixed(2));
  }, [criteriaScores]);

  // Submit evaluation (Draft or Final)
  const handleSaveEvaluation = async (isFinalSubmit: boolean) => {
    if (!evaluatingSubmission) return;
    setIsSubmittingEval(true);
    try {
      const res = await judgeClient.saveEvaluation(
        evaluatingSubmission.id,
        criteriaScores,
        feedbackText,
        isFinalSubmit
      );

      if (res.success) {
        setToastMsg(
          isFinalSubmit
            ? `Final score of ⭐ ${res.evaluation.overallScore} submitted for ${evaluatingSubmission.projectTitle}!`
            : `Draft evaluation saved for ${evaluatingSubmission.projectTitle}.`
        );
        setTimeout(() => setToastMsg(null), 4000);
        setEvaluatingSubmission(null);
        loadJudgeData();
      }
    } catch (err) {
      console.error("Failed to save evaluation:", err);
    } finally {
      setIsSubmittingEval(false);
    }
  };

  // Filtered submissions
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
    assignedHackathons.find((h) => h.id === selectedHackathonId)?.title || "All Assigned Hackathons";

  return (
    <div className="min-h-screen bg-[#F4F3FF] text-[#1E1E38]">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col p-4 sm:p-6 lg:p-8">
        {/* ================= HEADER & IDENTITY BAR ================= */}
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-indigo-100/80 bg-white p-6 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3B34D2] text-white shadow-md">
              <Gavel className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#1E1E38]">
                  Judge Evaluation Portal
                </h1>
                <span className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-900">
                  OFFICIAL JUDGE
                </span>
              </div>
              <p className="text-xs text-[#6B6B80] mt-0.5">
                Review assigned hackathons, inspect team demo repositories, and evaluate project rubrics.
              </p>
            </div>
          </div>

          {/* Judge Identity Pill */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-[#F9F8FE] p-2 pr-4 shadow-2xs">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3B34D2] text-xs font-extrabold text-white shadow-xs">
                {judgeInitial}
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-extrabold text-[#1E1E38]">{judgeName}</span>
                <span className="text-[10px] font-bold text-[#6B6B80]">{judgeTitle}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Success Toast Notification */}
        {toastMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 animate-fade-in shadow-xs">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* ================= 1. ASSIGNED HACKATHONS OVERVIEW GRID ================= */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-extrabold text-[#1E1E38]">
              Assigned Hackathons
            </h2>
            <span className="text-xs font-semibold text-[#6B6B80]">
              {assignedHackathons.length} Active Events
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedHackathons.map((hck) => {
              const progressPct = Math.round(
                (hck.evaluatedSubmissions / hck.totalSubmissions) * 100
              );

              return (
                <div
                  key={hck.id}
                  className="flex flex-col justify-between rounded-3xl border border-indigo-100/80 bg-white p-6 shadow-2xs hover:shadow-md transition-all"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-[#3B34D2]">
                        {hck.category}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#6B6B80]">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span>Deadline: {hck.deadline}</span>
                      </div>
                    </div>

                    <h3 className="font-display text-xl font-extrabold text-[#1E1E38] mt-1">
                      {hck.title}
                    </h3>
                    <p className="text-xs text-[#6B6B80]">
                      Organized by <strong>{hck.organizerName}</strong>
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-3 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#52526B]">
                        <span>Evaluation Progress</span>
                        <span>
                          {hck.evaluatedSubmissions} / {hck.totalSubmissions} Projects ({progressPct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-indigo-50 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#4F46E5] to-[#3B34D2] transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-indigo-100/60 pt-4 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#6B6B80]">
                      {hck.totalSubmissions - hck.evaluatedSubmissions} Submissions Pending Review
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedHackathonId(hck.id)}
                      className="flex items-center gap-2 rounded-xl bg-[#3B34D2] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#322BB8] transition-all cursor-pointer"
                    >
                      <span>Start Judging</span>
                      <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
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
          <div className="flex flex-col gap-4 rounded-3xl border border-indigo-100/80 bg-white p-5 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search project title, team, or tech stack..."
                className="h-10 w-full rounded-2xl border border-indigo-100/80 bg-[#F9F8FE] pl-10 pr-4 text-xs font-medium text-[#1E1E38] outline-none focus:border-[#3B34D2] focus:bg-white"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Event Filter */}
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
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHackathonId("all");
                        setIsEventDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${selectedHackathonId === "all"
                          ? "bg-[#3B34D2] text-white"
                          : "text-[#1E1E38] hover:bg-indigo-50"
                        }`}
                    >
                      <span>All Assigned Hackathons</span>
                      {selectedHackathonId === "all" && <Check className="h-3.5 w-3.5" />}
                    </button>
                    {assignedHackathons.map((hck) => (
                      <button
                        key={hck.id}
                        type="button"
                        onClick={() => {
                          setSelectedHackathonId(hck.id);
                          setIsEventDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${selectedHackathonId === hck.id
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

              {/* Status Filter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-2xl border border-indigo-100 bg-[#F9F8FE] px-3.5 py-2.5 text-xs font-bold text-[#1E1E38] shadow-2xs hover:bg-white transition-all cursor-pointer"
                >
                  <Filter className="h-3.5 w-3.5 text-[#3B34D2]" />
                  <span className="capitalize">
                    {selectedStatus === "all"
                      ? "All Statuses"
                      : selectedStatus === "pending"
                        ? "Pending Review"
                        : "Completed"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-indigo-100 bg-white p-2 shadow-xl z-30">
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
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${selectedStatus === st.key
                            ? "bg-[#3B34D2] text-white"
                            : "text-[#1E1E38] hover:bg-indigo-50"
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
          <div className="overflow-hidden rounded-3xl border border-indigo-100/80 bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-indigo-100/80 bg-[#F9F8FE] text-[11px] font-extrabold uppercase tracking-wider text-[#6B6B80]">
                    <th className="py-4 px-6">Project & Team Info</th>
                    <th className="py-4 px-6">Assets & Links</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Assigned Score</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500 font-semibold">
                        Loading assigned project submissions...
                      </td>
                    </tr>
                  ) : filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500 font-semibold">
                        No submissions match the selected judge filters.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => {
                      const isCompleted = sub.evaluationStatus === "COMPLETED";
                      const isInProgress = sub.evaluationStatus === "IN_PROGRESS";

                      return (
                        <tr key={sub.id} className="transition-colors hover:bg-indigo-50/40">
                          {/* Project Name & Info */}
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-1 max-w-md">
                              <div className="flex items-center gap-2">
                                <span className="font-display text-sm font-extrabold text-[#1E1E38]">
                                  {sub.projectTitle}
                                </span>
                                <span className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] font-bold text-[#3B34D2]">
                                  {sub.category}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#6B6B80] line-clamp-1">
                                {sub.tagline}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-[#52526B] mt-0.5">
                                <Users className="h-3 w-3 text-indigo-400" />
                                <span>{sub.teamName} ({sub.teamMembersCount} Members)</span>
                              </div>
                            </div>
                          </td>

                          {/* Submission Assets Quick Links */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {sub.repoUrl && (
                                <a
                                  href={sub.repoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Repository Source"
                                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-700 hover:bg-[#3B34D2] hover:text-white transition-all"
                                >
                                  <FolderGit2 className="h-4 w-4" />
                                </a>
                              )}
                              {sub.demoUrl && (
                                <a
                                  href={sub.demoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Live App Demo"
                                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-[#3B34D2] hover:bg-[#3B34D2] hover:text-white transition-all"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                              {sub.videoUrl && (
                                <a
                                  href={sub.videoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Video Presentation"
                                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                                >
                                  <Video className="h-4 w-4" />
                                </a>
                              )}
                              {sub.pitchDeckUrl && (
                                <a
                                  href={sub.pitchDeckUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Pitch Deck PDF"
                                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white transition-all"
                                >
                                  <FileSpreadsheet className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-6">
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-extrabold text-emerald-800 shadow-2xs">
                                <CheckCircle2 className="h-3 w-3" />
                                COMPLETED
                              </span>
                            ) : isInProgress ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-extrabold text-amber-800 shadow-2xs">
                                <Clock className="h-3 w-3" />
                                IN PROGRESS
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold text-gray-600">
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
                              <span className="text-gray-400 font-medium">—</span>
                            )}
                          </td>

                          {/* Review & Score Action */}
                          <td className="py-4 px-6 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenEvaluationModal(sub)}
                              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${isCompleted
                                  ? "bg-indigo-50 border border-indigo-100 text-[#3B34D2] hover:bg-indigo-100"
                                  : "bg-[#3B34D2] text-white shadow-xs hover:bg-[#322BB8]"
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

        {/* ================= 3. SUBMISSION EVALUATION MODAL (SCORING INTERFACE) ================= */}
        {evaluatingSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-indigo-100 bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 flex flex-col gap-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-indigo-100/80 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-[#3B34D2] shadow-2xs font-bold">
                    <Gavel className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-[#1E1E38]">
                      Evaluation Rubric: {evaluatingSubmission.projectTitle}
                    </h3>
                    <p className="text-xs text-[#6B6B80]">
                      Submitted to <strong>{evaluatingSubmission.hackathonName}</strong> ({evaluatingSubmission.teamName})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEvaluatingSubmission(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Split View Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side: Project Showcase & Submission Assets */}
                <div className="flex flex-col gap-4 rounded-2xl bg-[#F9F8FE] border border-indigo-100/80 p-5">
                  <h4 className="font-display text-sm font-extrabold text-[#1E1E38] border-b border-indigo-100/80 pb-2">
                    Project Overview & Showcase
                  </h4>

                  <p className="text-xs text-[#52526B] leading-relaxed">
                    {evaluatingSubmission.description}
                  </p>

                  {/* Tech Stack */}
                  <div>
                    <span className="block text-[11px] font-extrabold text-[#1E1E38] mb-1.5">
                      Technologies & Stack
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {evaluatingSubmission.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md bg-white border border-indigo-100 px-2.5 py-1 text-[10px] font-bold text-[#3B34D2]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Submission Links */}
                  <div>
                    <span className="block text-[11px] font-extrabold text-[#1E1E38] mb-2">
                      Review Deliverables & Source
                    </span>
                    <div className="flex flex-col gap-2">
                      {evaluatingSubmission.repoUrl && (
                        <a
                          href={evaluatingSubmission.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-xl bg-white border border-indigo-100 p-2.5 text-xs font-bold text-[#1E1E38] hover:border-[#3B34D2]"
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
                          className="flex items-center justify-between rounded-xl bg-white border border-indigo-100 p-2.5 text-xs font-bold text-[#1E1E38] hover:border-[#3B34D2]"
                        >
                          <span className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-[#3B34D2]" />
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
                          className="flex items-center justify-between rounded-xl bg-white border border-indigo-100 p-2.5 text-xs font-bold text-[#1E1E38] hover:border-[#3B34D2]"
                        >
                          <span className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-red-500" />
                            <span>Video Pitch & Demo Walkthrough</span>
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Scoring Rubric (1 - 10 Scale) */}
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-indigo-100/80 pb-2">
                    <h4 className="font-display text-sm font-extrabold text-[#1E1E38]">
                      Scoring Rubric (Scale 1.0 – 10.0)
                    </h4>
                    {/* Overall Calculated Score */}
                    <div className="flex items-center gap-1.5 rounded-2xl bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-extrabold text-amber-900 shadow-2xs">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                      <span>Total Score: {computedOverallScore} / 10.0</span>
                    </div>
                  </div>

                  {/* 1. Innovation & Originality */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1E1E38]">
                      <span>1. Innovation & Originality (1–10)</span>
                      <span className="text-[#3B34D2] font-extrabold">{criteriaScores.innovation}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={0.1}
                      value={criteriaScores.innovation}
                      onChange={(e) =>
                        setCriteriaScores((prev) => ({
                          ...prev,
                          innovation: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full accent-[#3B34D2] cursor-pointer"
                    />
                  </div>

                  {/* 2. Technical Complexity */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1E1E38]">
                      <span>2. Technical Complexity & Execution (1–10)</span>
                      <span className="text-[#3B34D2] font-extrabold">{criteriaScores.technical}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={0.1}
                      value={criteriaScores.technical}
                      onChange={(e) =>
                        setCriteriaScores((prev) => ({
                          ...prev,
                          technical: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full accent-[#3B34D2] cursor-pointer"
                    />
                  </div>

                  {/* 3. Design & User Experience */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1E1E38]">
                      <span>3. Design & User Experience (1–10)</span>
                      <span className="text-[#3B34D2] font-extrabold">{criteriaScores.design}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={0.1}
                      value={criteriaScores.design}
                      onChange={(e) =>
                        setCriteriaScores((prev) => ({
                          ...prev,
                          design: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full accent-[#3B34D2] cursor-pointer"
                    />
                  </div>

                  {/* 4. Impact & Feasibility */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1E1E38]">
                      <span>4. Impact & Local Feasibility (1–10)</span>
                      <span className="text-[#3B34D2] font-extrabold">{criteriaScores.impact}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={0.1}
                      value={criteriaScores.impact}
                      onChange={(e) =>
                        setCriteriaScores((prev) => ({
                          ...prev,
                          impact: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full accent-[#3B34D2] cursor-pointer"
                    />
                  </div>

                  {/* Feedback Field */}
                  <div>
                    <label className="block text-xs font-extrabold text-[#1E1E38] mb-1">
                      Constructive Feedback & Notes
                    </label>
                    <textarea
                      rows={3}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Write feedback for the submitting team or internal organizer notes..."
                      className="w-full rounded-2xl border border-indigo-100 bg-[#F9F8FE] p-3 text-xs font-medium text-[#1E1E38] outline-none focus:border-[#3B34D2] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-between border-t border-indigo-100/80 pt-4">
                <button
                  type="button"
                  onClick={() => handleSaveEvaluation(false)}
                  disabled={isSubmittingEval}
                  className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-white px-5 py-2.5 text-xs font-bold text-[#52526B] hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <Save className="h-4 w-4 text-gray-500" />
                  <span>Save Draft Score</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveEvaluation(true)}
                  disabled={isSubmittingEval}
                  className="flex items-center gap-2 rounded-xl bg-[#3B34D2] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#322BB8] transition-all cursor-pointer disabled:opacity-50"
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
