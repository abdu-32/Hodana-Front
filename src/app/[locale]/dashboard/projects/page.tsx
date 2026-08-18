"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FolderGit2,
  Briefcase,
  UploadCloud,
  Bell,
  User,
  Rocket,
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  Trash2,
  MoreHorizontal,
  Sparkles,
  Shield,
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
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { Logomark } from "@/components/ui/Logomark";
import {
  userProjectsClient,
  type UserProject,
  type ProjectEvaluation,
  type SubmitProjectPayload,
} from "@/features/projects/lib/user-projects-client";

export default function MyProjectsPage() {
  const t = useTranslations("Projects");
  const tDash = useTranslations("Dashboard");
  const { user } = useSession();

  const userName = user?.fullName || "Abebe Kebede";
  const firstName = userName.split(" ")[0];
  const userTitle = "Lead Developer";
  const userInitial = firstName.charAt(0).toUpperCase();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  // Modals state
  const [submittingProject, setSubmittingProject] = useState<UserProject | null>(null);
  const [reviewingProject, setReviewingProject] = useState<UserProject | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load Projects on Mount
  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const data = await userProjectsClient.getUserProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load user projects:", err);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Find draft & completed projects for widgets
  const featuredProject = useMemo(
    () => projects.find((p) => p.isPriority) || projects[0],
    [projects]
  );
  const draftProjects = useMemo(
    () => projects.filter((p) => p.status === "DRAFT"),
    [projects]
  );
  const reviewProjects = useMemo(
    () => projects.filter((p) => p.status === "READY_TO_REVIEW" || p.status === "COMPLETED" || p.status === "SUBMITTED"),
    [projects]
  );

  const handleSubmissionSuccess = (updatedProject: UserProject) => {
    setToastMessage(`✓ "${updatedProject.title}" submitted successfully for review!`);
    setTimeout(() => setToastMessage(null), 5000);
    setSubmittingProject(null);
    loadProjects();
  };

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#122622]">
      <div className="mx-auto flex w-full max-w-[1500px]">
        {/* ================= LEFT SIDEBAR ================= */}
        <aside
          className={`sticky top-0 hidden h-screen flex-col justify-between border-r border-[#d6e7e1] bg-white p-5 lg:flex shadow-2xs transition-all duration-300 ease-in-out ${
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
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#0f6b5c]">
                  HODANA
                </h1>
                <p className="text-xs font-semibold text-[#57685f]">
                  Ecosystem Portal
                </p>
              </div>
            </button>

            {/* Sidebar Navigation */}
            <nav className="flex flex-col gap-1.5 text-xs font-semibold text-[#57685f]">
              <Link
                href="/dashboard"
                title={isSidebarCollapsed ? tDash("navDashboard") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{tDash("navDashboard")}</span>}
              </Link>

              <Link
                href="/hackathons"
                title={isSidebarCollapsed ? tDash("navHackathons") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Calendar className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{tDash("navHackathons")}</span>}
              </Link>

              <Link
                href="/dashboard/teams"
                title={isSidebarCollapsed ? tDash("navMyTeams") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Users className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{tDash("navMyTeams")}</span>}
              </Link>

              <Link
                href="/dashboard/projects"
                title={isSidebarCollapsed ? t("title") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } bg-[#0f6b5c] text-white shadow-md font-bold`}
              >
                <FolderGit2 className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("title")}</span>}
              </Link>

              <Link
                href="/submissions"
                title={isSidebarCollapsed ? tDash("navSubmissions") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <UploadCloud className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{tDash("navSubmissions")}</span>}
              </Link>

              <Link
                href="/dashboard/portfolio"
                title={isSidebarCollapsed ? tDash("navPortfolio") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Briefcase className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{tDash("navPortfolio")}</span>}
              </Link>
            </nav>
          </div>

          {/* Sidebar Bottom CTA & User Footer */}
          <div className="flex flex-col gap-5 border-t border-[#d6e7e1] pt-5">
            <Link
              href="/hackathons"
              title={isSidebarCollapsed ? tDash("launchProject") : undefined}
              className={`flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[#0b5347] ${
                isSidebarCollapsed ? "px-0" : "px-4"
              }`}
            >
              <Rocket className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span className="whitespace-nowrap">{tDash("launchProject")}</span>}
            </Link>

            <Link
              href="/settings/profile"
              title={isSidebarCollapsed ? userName : undefined}
              className={`flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-100 ${
                isSidebarCollapsed ? "justify-center p-1" : ""
              }`}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={userName}
                  className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-[#0f6b5c]/20"
                />
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0f6b5c] text-xs font-extrabold text-white shadow-xs">
                  {userInitial}
                </span>
              )}
              {!isSidebarCollapsed && (
                <div className="flex min-w-0 flex-1 flex-col whitespace-nowrap overflow-hidden">
                  <p className="truncate text-xs font-bold text-[#122622]">
                    {userName}
                  </p>
                  <p className="truncate text-[11px] font-medium text-[#57685f]">
                    {userTitle}
                  </p>
                </div>
              )}
            </Link>
          </div>
        </aside>

        {/* ================= MAIN CONTENT AREA ================= */}
        <main className="flex min-w-0 flex-1 flex-col p-4 sm:p-6 lg:p-8 transition-all duration-300">
          {/* Search Header Bar */}
          <div className="flex items-center justify-between gap-4 pb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white pl-10 pr-4 text-xs font-medium text-[#122622] shadow-2xs outline-none placeholder:text-gray-400 focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#0f6b5c]/20"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#d6e7e1] text-[#57685f] shadow-2xs hover:bg-[#e8f3f0] hover:text-[#0f6b5c] transition-all cursor-pointer"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              <Link
                href="/settings/profile"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#d6e7e1] text-[#57685f] shadow-2xs hover:bg-[#e8f3f0] hover:text-[#0f6b5c] transition-all cursor-pointer"
                aria-label="User Profile"
                title="User Profile"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </Link>
            </div>
          </div>

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 animate-fade-in shadow-xs">
              <CheckCircle2 className="h-5 w-5 text-[#16793d] shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-medium text-[#57685f] pb-2">
            <Link href="/dashboard" className="hover:text-[#0f6b5c]">
              {t("breadcrumbDashboard")}
            </Link>
            <span>&gt;</span>
            <span className="text-[#0f6b5c] font-semibold">{t("breadcrumbProjects")}</span>
          </div>

          {/* Title Bar with Filter & Sorting Controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-8">
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#122622]">
                {t("title")}
              </h1>
              <p className="mt-1 text-sm text-[#57685f] font-normal">
                {t("subtitle")}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded-2xl border border-[#d6e7e1] bg-white px-4 py-2.5 text-xs font-bold text-[#57685f] shadow-2xs hover:border-[#0f6b5c] hover:text-[#0f6b5c] transition-all cursor-pointer"
              >
                <Filter className="h-3.5 w-3.5" />
                <span>{t("filter")}</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-2 rounded-2xl border border-[#d6e7e1] bg-white px-4 py-2.5 text-xs font-bold text-[#57685f] shadow-2xs hover:border-[#0f6b5c] hover:text-[#0f6b5c] transition-all cursor-pointer"
              >
                <span>{t("recentlyUpdated")}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Main Grid: Featured Project (Left 8 cols) + Sidebar Widgets (Right 4 cols) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Featured Project Card (Large - 8 columns) */}
            {featuredProject && (
              <div className="flex flex-col overflow-hidden rounded-3xl border border-[#d6e7e1] bg-white shadow-sm lg:col-span-8">
                {/* Top Banner Graphic & Badges */}
                <div className="relative h-64 w-full overflow-hidden bg-gray-900">
                  <img
                    src="/project_preview_dashboard.png"
                    alt={featuredProject.title}
                    className="h-full w-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#0f6b5c]/90 backdrop-blur-md px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                      HACKATHON: {featuredProject.hackathonName.toUpperCase()}
                    </span>
                    <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                      {t("priority")}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="flex flex-col gap-6 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="font-display text-2xl font-bold tracking-tight text-[#122622]">
                          {featuredProject.title}
                        </h2>
                        <span className="rounded-full bg-[#e8f3f0] px-3 py-1 text-[11px] font-bold text-[#0f6b5c]">
                          {featuredProject.status === "DRAFT"
                            ? "Draft"
                            : featuredProject.status === "READY_TO_REVIEW"
                            ? "Ready to Review"
                            : featuredProject.status === "COMPLETED"
                            ? "Evaluated"
                            : t("inProgress")}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-[#57685f]">
                        {featuredProject.tagline}
                      </p>
                    </div>
                    {featuredProject.repoUrl && (
                      <a
                        href={featuredProject.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="External repository link"
                        title="GitHub Repository"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#d6e7e1] bg-white text-[#0f6b5c] hover:bg-[#e8f3f0] transition-all cursor-pointer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  {/* Progress Bar Section */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#57685f]">{t("buildProgress")}</span>
                      <span className="text-[#0f6b5c]">{featuredProject.buildProgress}%</span>
                    </div>
                    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#e8f3f0]">
                      <div
                        className="h-full rounded-full bg-[#0f6b5c] transition-all duration-500"
                        style={{ width: `${featuredProject.buildProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Collaborators & Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center -space-x-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f3f0] text-xs font-bold text-[#0f6b5c] ring-2 ring-white">
                          AR
                        </span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f6b5c] text-xs font-bold text-white ring-2 ring-white">
                          SK
                        </span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-800 ring-2 ring-white">
                          +{featuredProject.teamMembersCount - 2}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[#57685f]">
                        {featuredProject.teamName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {featuredProject.status === "DRAFT" ? (
                        <button
                          type="button"
                          onClick={() => setSubmittingProject(featuredProject)}
                          className="rounded-xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-all cursor-pointer"
                        >
                          {t("submitNow")}
                        </button>
                      ) : featuredProject.status === "COMPLETED" || featuredProject.status === "READY_TO_REVIEW" ? (
                        <button
                          type="button"
                          onClick={() => setReviewingProject(featuredProject)}
                          className="rounded-xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-all cursor-pointer"
                        >
                          {t("finalReview")}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSubmittingProject(featuredProject)}
                          className="rounded-xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-all cursor-pointer"
                        >
                          {t("continueEditing")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sidebar Project Widgets (Right 4 columns) */}
            <div className="flex flex-col gap-6 lg:col-span-4">
              {/* Draft Project Cards List */}
              {draftProjects.map((draft) => (
                <div
                  key={draft.id}
                  className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-bold tracking-tight text-[#122622]">
                        {draft.title}
                      </h3>
                      <p className="text-xs font-medium text-[#57685f]">
                        {draft.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#57685f]">
                        Submission
                      </span>
                      <span className="font-bold text-amber-700">Draft</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-300"
                        style={{ width: `${draft.buildProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      aria-label="Delete draft"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:text-red-500 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {/* Functional "Submit Now" Trigger */}
                    <button
                      type="button"
                      onClick={() => setSubmittingProject(draft)}
                      className="rounded-xl border border-[#0f6b5c] bg-white px-4 py-2 text-xs font-bold text-[#0f6b5c] hover:bg-[#e8f3f0] transition-all cursor-pointer"
                    >
                      {t("submitNow")}
                    </button>
                  </div>
                </div>
              ))}

              {/* Ready to Review / Completed Project Cards List */}
              {reviewProjects.map((rev) => (
                <div
                  key={rev.id}
                  className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c]">
                        <Shield className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-display text-base font-bold tracking-tight text-[#122622]">
                          {rev.title}
                        </h3>
                        <p className="text-xs font-medium text-[#57685f]">
                          {rev.tagline}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#57685f]">
                        {rev.status === "COMPLETED" ? "Evaluated" : "Ready to Review"}
                      </span>
                      <span className="text-[#0f6b5c]">100%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#e8f3f0]">
                      <div className="h-full w-full rounded-full bg-[#0f6b5c]" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      aria-label="More options"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d6e7e1] bg-white text-[#57685f] hover:text-[#0f6b5c] transition-all cursor-pointer"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {/* Functional "Final Review" Trigger */}
                    <button
                      type="button"
                      onClick={() => setReviewingProject(rev)}
                      className="rounded-xl bg-[#0f6b5c] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-all cursor-pointer"
                    >
                      {t("finalReview")}
                    </button>
                  </div>
                </div>
              ))}

              {/* Portfolio Health Summary Box */}
              <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#0f6b5c] to-[#0e2b25] p-6 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-200">
                    {t("portfolioHealth")}
                  </span>
                  <Sparkles className="h-5 w-5 text-emerald-200" />
                </div>

                <div className="mt-6">
                  <h4 className="font-display text-3xl font-extrabold">
                    {projects.length} Projects
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#e8f3f0]">
                    {projects.filter((p) => p.status !== "DRAFT").length} Active/Submitted,{" "}
                    {projects.filter((p) => p.status === "DRAFT").length} Drafted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ================= 1. SUBMIT NOW PROJECT SUBMISSION MODAL ================= */}
      {submittingProject && (
        <ProjectSubmissionModal
          project={submittingProject}
          onClose={() => setSubmittingProject(null)}
          onSuccess={handleSubmissionSuccess}
        />
      )}

      {/* ================= 2. FINAL REVIEW JUDGE EVALUATION MODAL ================= */}
      {reviewingProject && (
        <EvaluationReviewModal
          project={reviewingProject}
          onClose={() => setReviewingProject(null)}
        />
      )}
    </div>
  );
}

/* ============================================================================
 * 1. PROJECT SUBMISSION FORM MODAL COMPONENT
 * ============================================================================ */
function ProjectSubmissionModal({
  project,
  onClose,
  onSuccess,
}: {
  project: UserProject;
  onClose: () => void;
  onSuccess: (updated: UserProject) => void;
}) {
  const [title, setTitle] = useState(project.title || "");
  const [tagline, setTagline] = useState(project.tagline || "");
  const [repoUrl, setRepoUrl] = useState(project.repoUrl || "");
  const [demoUrl, setDemoUrl] = useState(project.demoUrl || "");
  const [videoUrl, setVideoUrl] = useState(project.videoUrl || "");
  const [description, setDescription] = useState(project.description || "");

  const [techStack, setTechStack] = useState<string[]>(
    project.techStack?.length > 0
      ? project.techStack
      : ["Python", "FastAPI", "React", "Next.js"]
  );
  const [newTagInput, setNewTagInput] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Project name is required.";
    }

    if (!repoUrl.trim()) {
      newErrors.repoUrl = "GitHub Repository URL is required.";
    } else if (
      !repoUrl.startsWith("http://") &&
      !repoUrl.startsWith("https://") &&
      !repoUrl.startsWith("github.com")
    ) {
      newErrors.repoUrl = "Please enter a valid URL (e.g., https://github.com/org/repo).";
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
        techStack,
        description: description.trim(),
      };

      const res = await userProjectsClient.submitProject(project.id, payload);
      if (res.success) {
        onSuccess(res.project);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setErrors({ form: "Failed to submit project. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 flex flex-col gap-6">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#d6e7e1] pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c] shadow-2xs font-bold">
              <Rocket className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-xl font-extrabold text-[#122622]">
                Submit Project for Review
              </h3>
              <p className="text-xs font-semibold text-[#0f6b5c] mt-0.5">
                Submitted to <strong>{project.hackathonName}</strong>
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

        {/* Global Error Banner */}
        {errors.form && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs font-bold text-[#c4211c]">
            <AlertCircle className="h-4 w-4 text-[#c4211c] shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Project Name & Tagline */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                Project Name <span className="text-[#c4211c]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. FinSecure Ledger"
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
                placeholder="e.g. Blockchain audit tool"
                className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
              />
            </div>
          </div>

          {/* GitHub Repository URL (Required) */}
          <div>
            <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
              GitHub Repository URL <span className="text-[#c4211c]">*</span>
            </label>
            <div className="relative">
              <FolderGit2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/org/repository"
                className={`w-full rounded-2xl border bg-[#f3f6f4] pl-10 pr-4 py-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white ${
                  errors.repoUrl ? "border-red-400 bg-red-50/20" : "border-[#d6e7e1]"
                }`}
              />
            </div>
            {errors.repoUrl && (
              <p className="mt-1 text-[11px] font-bold text-[#c4211c]">{errors.repoUrl}</p>
            )}
          </div>

          {/* Live Demo & Video Pitch URL */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                Live Demo / Deployed Web App URL
              </label>
              <div className="relative">
                <ExternalLink className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                Video Pitch Walkthrough URL
              </label>
              <div className="relative">
                <Video className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=demo"
                  className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] pl-10 pr-4 py-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Tech Stack Tags Manager */}
          <div>
            <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
              Tech Stack & Key Tools Used
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {techStack.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#e8f3f0] border border-[#d6e7e1] px-3 py-1 text-xs font-bold text-[#0f6b5c]"
                >
                  <Tag className="h-3 w-3" />
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 rounded-full p-0.5 hover:bg-[#d6e7e1] transition-colors cursor-pointer"
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
                placeholder="Add technology (e.g. PyTorch, FastAPI) and press Enter..."
                className="flex-1 rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="flex items-center gap-1 rounded-2xl bg-[#e8f3f0] px-4 py-3 text-xs font-bold text-[#0f6b5c] hover:bg-[#d6e7e1] transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Detailed Overview / Description */}
          <div>
            <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
              Overview & Detailed Solution Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem scope, solution architecture, and key features..."
              className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
            />
          </div>

          {/* Form Actions */}
          <div className="mt-4 flex items-center justify-end gap-3 border-t border-[#d6e7e1] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-200 px-5 py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Project...</span>
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  <span>Submit for Review</span>
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
 * 2. FINAL REVIEW JUDGE EVALUATION MODAL COMPONENT
 * ============================================================================ */
function EvaluationReviewModal({
  project,
  onClose,
}: {
  project: UserProject;
  onClose: () => void;
}) {
  const [evaluation, setEvaluation] = useState<ProjectEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEval = async () => {
      setIsLoading(true);
      try {
        const data = await userProjectsClient.getProjectEvaluation(project.id);
        setEvaluation(data || project.evaluation || null);
      } catch (err) {
        console.error("Failed to load project evaluation:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEval();
  }, [project]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 flex flex-col gap-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 shadow-2xs font-bold">
              <Gavel className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-extrabold text-[#122622]">
                Evaluation Rubric: {project.title}
              </h3>
              <p className="text-xs text-[#57685f]">
                Submitted to <strong>{project.hackathonName}</strong> ({project.teamName})
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

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-[#0f6b5c]" />
            <span className="text-xs font-bold">Loading judge evaluation scores & rubric...</span>
          </div>
        ) : (
          /* Split View Layout */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side: Project Summary & Deliverables */}
            <div className="flex flex-col gap-4 rounded-2xl bg-[#f3f6f4] border border-[#d6e7e1] p-5">
              <h4 className="font-display text-sm font-extrabold text-[#122622] border-b border-[#d6e7e1] pb-2">
                Project Summary & Deliverables
              </h4>

              <p className="text-xs text-[#57685f] leading-relaxed">
                {project.description}
              </p>

              {/* Tech Stack Badges */}
              <div>
                <span className="block text-[11px] font-extrabold text-[#122622] mb-1.5">
                  Tech Stack Badges
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md bg-white border border-[#d6e7e1] px-2.5 py-1 text-[10px] font-bold text-[#0f6b5c]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Deliverable Link Cards */}
              <div>
                <span className="block text-[11px] font-extrabold text-[#122622] mb-2">
                  Review Deliverables & Source
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
                        <span>GitHub Source Repository</span>
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
                        <ExternalLink className="h-4 w-4 text-[#0f6b5c]" />
                        <span>Live Product Web App</span>
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
                        <Video className="h-4 w-4 text-[#c4211c]" />
                        <span>Video Pitch & Demo Walkthrough</span>
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
                        <span>Pitch Deck PDF</span>
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Judge Evaluation Results */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-2">
                <h4 className="font-display text-sm font-extrabold text-[#122622]">
                  Judge Evaluation Results
                </h4>
                {/* Overall Calculated Score Badge */}
                <div className="flex items-center gap-1.5 rounded-2xl bg-amber-50 border border-amber-200 px-3.5 py-1.5 text-xs font-extrabold text-amber-900 shadow-2xs">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                  <span>
                    ⭐ {evaluation?.overallScore.toFixed(1) || "9.3"} / 10.0
                  </span>
                </div>
              </div>

              {/* Score Breakdown (1 - 10 Rating Scale) */}
              <div className="flex flex-col gap-3">
                {/* 1. Innovation & Originality */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#122622]">
                    <span>1. Innovation & Originality</span>
                    <span className="text-[#0f6b5c] font-extrabold">
                      {evaluation?.criteriaScores.innovation || 9.5} / 10.0
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#e8f3f0] overflow-hidden">
                    <div
                      className="h-full bg-[#0f6b5c] rounded-full"
                      style={{
                        width: `${((evaluation?.criteriaScores.innovation || 9.5) / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 2. Technical Complexity */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#122622]">
                    <span>2. Technical Complexity & Execution</span>
                    <span className="text-[#0f6b5c] font-extrabold">
                      {evaluation?.criteriaScores.technical || 9.2} / 10.0
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#e8f3f0] overflow-hidden">
                    <div
                      className="h-full bg-[#0f6b5c] rounded-full"
                      style={{
                        width: `${((evaluation?.criteriaScores.technical || 9.2) / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 3. Design & UX */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#122622]">
                    <span>3. Design & User Experience</span>
                    <span className="text-[#0f6b5c] font-extrabold">
                      {evaluation?.criteriaScores.design || 9.0} / 10.0
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#e8f3f0] overflow-hidden">
                    <div
                      className="h-full bg-[#0f6b5c] rounded-full"
                      style={{
                        width: `${((evaluation?.criteriaScores.design || 9.0) / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 4. Impact & Local Feasibility */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#122622]">
                    <span>4. Impact & Local Feasibility</span>
                    <span className="text-[#0f6b5c] font-extrabold">
                      {evaluation?.criteriaScores.impact || 9.5} / 10.0
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#e8f3f0] overflow-hidden">
                    <div
                      className="h-full bg-[#0f6b5c] rounded-full"
                      style={{
                        width: `${((evaluation?.criteriaScores.impact || 9.5) / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Qualitative Feedback Box */}
              <div className="rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-4 flex flex-col gap-2">
                <span className="text-xs font-extrabold text-[#122622]">
                  Official Judge Feedback & Notes
                </span>
                <p className="text-xs text-[#57685f] leading-relaxed italic">
                  "{evaluation?.feedback || "Exceptional technical execution and clear social impact."}"
                </p>
                {evaluation?.judgeName && (
                  <span className="text-[11px] font-extrabold text-[#0f6b5c] mt-1">
                    — {evaluation.judgeName} ({evaluation.judgeTitle})
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
