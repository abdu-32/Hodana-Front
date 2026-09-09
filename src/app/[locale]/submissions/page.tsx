"use client";

import { useState, useEffect, useTransition } from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FolderGit2,
  Briefcase,
  UploadCloud,
  Rocket,
  ChevronDown,
  Clock,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  User,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Logomark } from "@/components/ui/Logomark";
import { useSession } from "@/features/auth";
import {
  ParticipantSubmission,
  RegisteredHackathonOption,
  participantSubmissionsClient,
} from "@/features/submissions/lib/participant-submissions-client";
import { SubmissionForm } from "@/features/submissions/components/SubmissionForm";
import { SubmissionSummaryView } from "@/features/submissions/components/SubmissionSummaryView";
import { NotificationBellDropdown } from "@/features/notifications/components/NotificationBellDropdown";
import { PortalMobileNav } from "@/components/layout/PortalMobileNav";

export default function ParticipantSubmissionsPage() {
  const tDash = useTranslations("Dashboard");
  const tSub = useTranslations("SubmissionsPage");
  const { user } = useSession();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [registeredHackathons, setRegisteredHackathons] = useState<RegisteredHackathonOption[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>("");
  const [currentSubmission, setCurrentSubmission] = useState<ParticipantSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load registered hackathons and initial submission
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const hackathons = await participantSubmissionsClient.getRegisteredHackathons();
        if (isMounted) {
          setRegisteredHackathons(hackathons);
          if (hackathons.length > 0) {
            const initialId = hackathons[0].id;
            setSelectedHackathonId(initialId);
            const sub = await participantSubmissionsClient.getSubmissionForHackathon(initialId);
            if (isMounted) {
              setCurrentSubmission(sub);
              setIsEditing(sub?.status === "NOT_SUBMITTED" || sub?.status === "DRAFT");
            }
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle switching hackathon from dropdown
  const handleSelectHackathon = async (hackathonId: string) => {
    setSelectedHackathonId(hackathonId);
    setIsLoading(true);
    try {
      const sub = await participantSubmissionsClient.getSubmissionForHackathon(hackathonId);
      setCurrentSubmission(sub);
      setIsEditing(sub?.status === "NOT_SUBMITTED" || sub?.status === "DRAFT");
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSavedDraft = (sub: ParticipantSubmission) => {
    setCurrentSubmission(sub);
    showToast(tSub("draftSavedToast"));
  };

  const handleSubmittedFinal = (sub: ParticipantSubmission) => {
    setCurrentSubmission(sub);
    setIsEditing(false);
    showToast(tSub("submittedToast"));
  };

  const selectedHackathon = registeredHackathons.find((h) => h.id === selectedHackathonId);

  // Compute deadline countdown
  const getDeadlineInfo = (deadlineStr?: string) => {
    if (!deadlineStr) return { text: "Active Event", isUrgent: false };
    const diff = new Date(deadlineStr).getTime() - Date.now();
    if (diff <= 0) return { text: "Submission Closed", isUrgent: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return {
        text: `Ends in ${days}d ${hours}h`,
        isUrgent: days < 2,
      };
    }
    return {
      text: `Ends in ${hours}h`,
      isUrgent: true,
    };
  };

  const deadlineInfo = getDeadlineInfo(selectedHackathon?.submissionDeadline);
  const userName = user?.fullName || "Abebe Bekele";

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#122622] font-sans antialiased">
      {/* Mobile Sticky Navigation Bar & Slide-Out Drawer */}
      <PortalMobileNav portalType="participant" title="Workspace" />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#0e2b25] px-5 py-3 text-xs font-extrabold text-white shadow-xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Layout Container */}
      <div className="mx-auto flex w-full max-w-[1600px]">
        {/* ================= LEFT SIDEBAR (STICKY & UNMOVABLE) ================= */}
        <aside
          className={`sticky top-0 hidden h-screen flex-col justify-between border-r border-[#d6e7e1] bg-white p-5 lg:flex shadow-2xs transition-all duration-300 ease-in-out shrink-0 z-30 ${
            isSidebarCollapsed ? "w-20 px-3" : "w-64 px-5"
          }`}
        >
          <div className="flex flex-col gap-8">
            {/* Brand Logo Header */}
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
            <nav className="flex flex-col gap-1 text-xs font-semibold text-[#57685f]">
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
                title={isSidebarCollapsed ? tDash("navMyProjects") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <FolderGit2 className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{tDash("navMyProjects")}</span>}
              </Link>

              <Link
                href="/dashboard/registrations"
                title={isSidebarCollapsed ? tDash("navRegistrations") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Layers className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{tDash("navRegistrations")}</span>}
              </Link>

              <Link
                href="/profile"
                title={isSidebarCollapsed ? tDash("navProfile") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <User className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{tDash("navProfile")}</span>}
              </Link>
            </nav>
          </div>

          {/* Sidebar Footer */}
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
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0f6b5c] font-display text-xs font-bold text-white shadow-sm">
                {userName[0]}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="truncate text-xs font-bold text-[#122622]">{userName}</span>
                  <span className="text-[10px] text-[#57685f] font-medium truncate">Participant</span>
                </div>
              )}
            </Link>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 min-w-0 p-5 lg:p-8 flex flex-col gap-6">
          {/* Top Header & Hackathon Selector Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl bg-white p-6 sm:p-7 border border-[#d6e7e1] shadow-xs">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#0f6b5c]">
                <UploadCloud className="h-4 w-4" />
                <span>PARTICIPANT WORKSPACE</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#122622]">
                {tSub("title")}
              </h1>
              <p className="text-xs font-medium text-[#57685f]">
                {tSub("subtitle")}
              </p>
            </div>

            {/* Hackathon Selector, Countdown Badge & Notifications */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              {registeredHackathons.length > 0 && (
                <>
                  {/* Active Hackathon Select Dropdown */}
                  <div className="relative flex items-center">
                    <select
                      value={selectedHackathonId}
                      onChange={(e) => handleSelectHackathon(e.target.value)}
                      className="h-11 appearance-none rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] pl-4 pr-10 text-xs font-extrabold text-[#122622] shadow-xs outline-none focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#e8f3f0] transition-all cursor-pointer"
                    >
                      {registeredHackathons.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-gray-400" />
                  </div>

                  {/* Deadline Countdown Badge */}
                  <div
                    className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2.5 text-xs font-extrabold shadow-xs ${
                      deadlineInfo.isUrgent
                        ? "bg-amber-50 text-amber-900 border border-amber-200"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>{tSub("deadlinePrefix")} {deadlineInfo.text}</span>
                  </div>
                </>
              )}
              <NotificationBellDropdown />
            </div>
          </div>

          {/* Body Section */}
          {isLoading ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-3xl bg-white p-8 border border-[#d6e7e1]">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#0f6b5c] border-t-transparent" />
              <p className="text-xs font-bold text-[#57685f]">Loading project deliverables...</p>
            </div>
          ) : registeredHackathons.length === 0 ? (
            /* Empty State: No Registered Hackathons */
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-3xl bg-white p-8 text-center border border-[#d6e7e1] shadow-xs">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#e8f3f0] text-[#0f6b5c]">
                <Calendar className="h-8 w-8" />
              </div>
              <div className="flex flex-col gap-1 max-w-sm">
                <h3 className="text-base font-extrabold text-[#122622]">
                  {tSub("noRegisteredHackathons")}
                </h3>
                <p className="text-xs font-medium text-[#57685f]">
                  Register for an upcoming hackathon to join a squad and submit your solution.
                </p>
              </div>
              <Link
                href="/hackathons"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-6 py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#0b5347] transition-all"
              >
                <span>{tSub("exploreHackathons")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : selectedHackathon ? (
            /* If submission is finalized and user is not in editing mode, show summary view */
            currentSubmission &&
            (currentSubmission.status === "SUBMITTED" || currentSubmission.status === "EVALUATED") &&
            !isEditing ? (
              <SubmissionSummaryView
                submission={currentSubmission}
                deadline={selectedHackathon.submissionDeadline}
                onEdit={() => setIsEditing(true)}
              />
            ) : (
              /* Deliverables Submission Form */
              <div className="flex flex-col gap-4">
                {/* Header state notice */}
                {currentSubmission?.status === "SUBMITTED" && isEditing && (
                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#e8f3f0] border border-[#d6e7e1] p-4 text-xs font-bold text-[#0f6b5c]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <span>You are editing an existing submission. Any saved changes will update your deliverables for the judging committee.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="text-xs underline font-extrabold text-[#0f6b5c] hover:text-[#122622] cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  </div>
                )}

                <SubmissionForm
                  key={selectedHackathon.id}
                  hackathon={selectedHackathon}
                  initialSubmission={currentSubmission}
                  onSaved={handleSavedDraft}
                  onSubmitted={handleSubmittedFinal}
                />
              </div>
            )
          ) : null}
        </main>
      </div>
    </div>
  );
}
