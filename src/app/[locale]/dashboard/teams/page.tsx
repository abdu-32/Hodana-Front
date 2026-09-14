"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FolderGit2,
  Briefcase,
  Bell,
  User,
  Rocket,
  Search,
  Cloud,
  Leaf,
  Shield,
  Pencil,
  LogOut,
  Plus,
  Mail,
  Check,
  X,
  Trash2,
  Edit3,
  UserPlus,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Info,
  Layers,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { useToast } from "@/components/ui";
import { Logomark } from "@/components/ui/Logomark";
import { listMyRegistrations } from "@/features/registrations/lib/registrations-client";
import {
  getHackathonTeamState,
  createTeam,
  updateTeam,
  deleteTeam,
  inviteMember,
  cancelInvitation,
  acceptInvitation,
  declineInvitation,
  createJoinRequest,
  cancelJoinRequest,
  reviewJoinRequest,
  leaveTeam,
  removeMember,
  updateRegistrationType,
  type HackathonTeamState,
} from "@/features/teams/lib/teams-client";
import { listHackathons } from "@/features/hackathons/lib/hackathons-client";
import { NotificationBellDropdown } from "@/features/notifications/components/NotificationBellDropdown";
import { PortalMobileNav } from "@/components/layout/PortalMobileNav";

function getInitials(nameOrEmail?: string): string {
  if (!nameOrEmail) return "?";
  const clean = nameOrEmail.split("@")[0].trim();
  const parts = clean.split(/[ ._-]+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.substring(0, 2).toUpperCase();
}

function MyTeamsContent() {
  const t = useTranslations("Teams");
  const tDash = useTranslations("Dashboard");
  const { user } = useSession();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const userName = user?.fullName || "Participant";
  const firstName = userName.split(" ")[0];
  const userTitle = (user as any)?.profession || (user as any)?.professionalTitle || "Developer";
  const userInitial = firstName.charAt(0).toUpperCase();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [filterMode, setFilterMode] = useState<"active" | "past">("active");
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTeamName, setCreateTeamName] = useState("");
  const [createTeamDesc, setCreateTeamDesc] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamDesc, setEditTeamDesc] = useState("");
  const [editOpenToMembers, setEditOpenToMembers] = useState(true);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);

  const [isJoinRequestModalOpen, setIsJoinRequestModalOpen] = useState(false);
  const [targetTeamId, setTargetTeamId] = useState<string>("");
  const [targetTeamName, setTargetTeamName] = useState<string>("");
  const [joinRequestMessage, setJoinRequestMessage] = useState("");

  // 1. Fetch user's registered hackathons & active hackathons
  const { data: myRegistrations = [] } = useQuery({
    queryKey: ["myRegistrations"],
    queryFn: listMyRegistrations,
  });

  const { data: hackathonsData } = useQuery({
    queryKey: ["allHackathons"],
    queryFn: () => listHackathons({ limit: 20 }),
  });
  const allHackathons = hackathonsData?.data || [];

  // Set initial selected hackathon
  useEffect(() => {
    const paramId = searchParams.get("hackathon_id") || searchParams.get("hackathonId");
    if (paramId) {
      setSelectedHackathonId(paramId);
    } else if (myRegistrations.length > 0) {
      const activeReg = myRegistrations.find((r) => !r.withdrawnAt) || myRegistrations[0];
      setSelectedHackathonId(activeReg.hackathonId);
    } else if (allHackathons.length > 0) {
      setSelectedHackathonId(allHackathons[0].id);
    }
  }, [searchParams, myRegistrations, allHackathons]);

  // 2. Fetch unified hackathon team state
  const {
    data: teamState,
    isLoading: isLoadingTeamState,
    refetch: refetchTeamState,
  } = useQuery({
    queryKey: ["hackathonTeamState", selectedHackathonId],
    queryFn: () => getHackathonTeamState(selectedHackathonId),
    enabled: Boolean(selectedHackathonId),
  });

  // Action Mutations
  const createTeamMutation = useMutation({
    mutationFn: () =>
      createTeam(selectedHackathonId, {
        teamName: createTeamName.trim(),
        description: createTeamDesc.trim(),
      }),
    onSuccess: () => {
      showToast("Team created successfully! You are now the Team Leader.", "success");
      setIsCreateModalOpen(false);
      setCreateTeamName("");
      setCreateTeamDesc("");
      refetchTeamState();
      queryClient.invalidateQueries({ queryKey: ["hackathonTeamState"] });
    },
    onError: (err: any) => {
      showToast(err?.message || "Failed to create team.", "danger");
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: () => {
      if (!teamState?.team?.id) throw new Error("No team found");
      return updateTeam(teamState.team.id, {
        teamName: editTeamName.trim(),
        description: editTeamDesc.trim(),
        openToMembers: editOpenToMembers,
      });
    },
    onSuccess: () => {
      showToast("Team settings updated successfully.", "success");
      setIsEditModalOpen(false);
      refetchTeamState();
    },
    onError: (err: any) => {
      showToast(err?.message || "Failed to update team.", "danger");
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: () => {
      if (!teamState?.team?.id) throw new Error("No team found");
      return deleteTeam(teamState.team.id);
    },
    onSuccess: () => {
      showToast("Team disbanded successfully.", "success");
      setIsRosterModalOpen(false);
      refetchTeamState();
    },
    onError: (err: any) => {
      showToast(err?.message || "Failed to disband team.", "danger");
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: () => {
      if (!teamState?.team?.id) throw new Error("No team found");
      return inviteMember(teamState.team.id, { inviteeEmail: inviteEmail.trim() });
    },
    onSuccess: () => {
      showToast("Invitation sent successfully!", "success");
      setIsInviteModalOpen(false);
      setInviteEmail("");
      refetchTeamState();
    },
    onError: (err: any) => {
      showToast(err?.message || "Failed to send invitation.", "danger");
    },
  });

  const cancelInviteMutation = useMutation({
    mutationFn: (invitationId: string) => cancelInvitation(invitationId),
    onSuccess: () => {
      showToast("Invitation cancelled.", "success");
      refetchTeamState();
    },
    onError: (err: any) => {
      showToast(err?.message || "Failed to cancel invitation.", "danger");
    },
  });

  const acceptInviteMutation = useMutation({
    mutationFn: (invitationId: string) => acceptInvitation(invitationId),
    onSuccess: () => {
      showToast("Invitation accepted! You have joined the team.", "success");
      refetchTeamState();
    },
    onError: (err: any) => {
      showToast(err?.message || "Failed to accept invitation.", "danger");
    },
  });

  const declineInviteMutation = useMutation({
    mutationFn: (invitationId: string) => declineInvitation(invitationId),
    onSuccess: () => {
      showToast("Invitation declined.", "success");
      refetchTeamState();
    },
    onError: (err: any) => {
      showToast(err?.message || "Failed to decline invitation.", "danger");
    },
  });

  const sendJoinRequestMutation = useMutation({
    mutationFn: () =>
      createJoinRequest(targetTeamId, { message: joinRequestMessage.trim() }),
    onSuccess: () => {
      showToast("Join request sent to team leader!", "success");
      setIsJoinRequestModalOpen(false);
      setJoinRequestMessage("");
      refetchTeamState();
    },
    onError: (err: any) => {
      showToast(err?.message || "Failed to send join request.", "danger");
    },
  });

  const cancelJoinRequestMutation = useMutation({
    mutationFn: (requestId: string) => cancelJoinRequest(requestId),
    onSuccess: () => {
      showToast("Join request cancelled.", "success");
      refetchTeamState();
    },
    onError: (err: any) => {
      showToast(err?.message || "Failed to cancel request.", "danger");
    },
  });

  const reviewJoinRequestMutation = useMutation({
    mutationFn: ({
      requestId,
      decision,
    }: {
      requestId: string;
      decision: "accepted" | "rejected";
    }) => reviewJoinRequest(requestId, { decision }),
    onSuccess: (_, vars) => {
      showToast(
        vars.decision === "accepted" ? "Member accepted into team!" : "Join request rejected.",
        "success"
      );
      refetchTeamState();
    },
    onError: (err: any) => {
      showToast(err?.message || "Failed to review join request.", "danger");
    },
  });

  const leaveTeamMutation = useMutation({
    mutationFn: () => {
      if (!teamState?.team?.id) throw new Error("No team found");
      return leaveTeam(teamState.team.id);
    },
    onSuccess: () => {
      showToast("You have left the team.", "success");
      setIsRosterModalOpen(false);
      refetchTeamState();
    },
    onError: (err: any) => {
      showToast(err?.message || "Failed to leave team.", "danger");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberUserId: string) => {
      if (!teamState?.team?.id) throw new Error("No team found");
      return removeMember(teamState.team.id, memberUserId);
    },
    onSuccess: () => {
      showToast("Team member removed.", "success");
      refetchTeamState();
    },
    onError: (err: any) => {
      showToast(err?.message || "Failed to remove member.", "danger");
    },
  });

  const switchRegistrationTypeMutation = useMutation({
    mutationFn: (newType: "solo" | "looking_for_team") =>
      updateRegistrationType(selectedHackathonId, newType),
    onSuccess: (_, newType) => {
      showToast(
        newType === "looking_for_team"
          ? "Status updated to Looking for a Team."
          : "Status updated to Solo.",
        "success"
      );
      refetchTeamState();
    },
    onError: (err: any) => {
      showToast(err?.message || "Failed to update status.", "danger");
    },
  });

  const isRegistered = Boolean(
    teamState?.registration && !teamState.registration.status?.toLowerCase().includes("withdrawn")
  );
  const hasTeam = Boolean(teamState?.team);
  const isLeader = Boolean(teamState?.isLeader);
  const registrationType = teamState?.registration?.registrationType || "solo";

  const currentRoleName = isLeader ? "Team Leader" : hasTeam ? "Team Member" : registrationType === "looking_for_team" ? "Looking for Team" : "Solo Hacker";

  // Filtered available teams
  const filteredOpenTeams = (teamState?.openTeams || []).filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.teamName.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.leaderName && t.leaderName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#122622]">
      {/* Mobile Sticky Navigation Bar & Slide-Out Drawer */}
      <PortalMobileNav portalType="participant" activeItem="teams" title="My Teams" />

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
                title={isSidebarCollapsed ? t("title") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } bg-[#0f6b5c] text-white shadow-md font-bold`}
              >
                <Users className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("title")}</span>}
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
              href="/profile"
              title={isSidebarCollapsed ? userName : undefined}
              className={`flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-100 ${
                isSidebarCollapsed ? "justify-center p-1" : ""
              }`}
            >
              {(user as any)?.avatarUrl ? (
                <img
                  src={(user as any).avatarUrl}
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
          {/* Top Bar with Search & Action Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-6">
            {/* Search Input Bar */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white pl-10 pr-4 text-xs font-medium text-[#122622] shadow-2xs outline-none placeholder:text-gray-400 focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#0f6b5c]/20"
              />
            </div>

            {/* Hackathon Selector & Action Icons */}
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="flex items-center gap-2 bg-white px-3 sm:px-3.5 py-2 rounded-2xl border border-[#d6e7e1] shadow-2xs flex-1 sm:flex-initial min-w-0">
                <Calendar className="h-4 w-4 text-[#0f6b5c] shrink-0" />
                <select
                  value={selectedHackathonId}
                  onChange={(e) => setSelectedHackathonId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#122622] focus:outline-none cursor-pointer w-full sm:max-w-[200px] truncate"
                >
                  {allHackathons.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <NotificationBellDropdown />

                <Link
                  href="/profile"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#d6e7e1] text-[#57685f] shadow-2xs hover:bg-[#e8f3f0] hover:text-[#0f6b5c] transition-all cursor-pointer"
                  aria-label="User Profile"
                  title="User Profile"
                >
                  {(user as any)?.avatarUrl ? (
                    <img
                      src={(user as any).avatarUrl}
                      alt=""
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Link>
              </div>
            </div>
          </div>

          {/* Title Header Bar with Active/Past Toggle */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-8">
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#122622]">
                {t("title")}
              </h1>
              <p className="mt-1 text-sm text-[#57685f] font-normal">
                {t("subtitle")}
              </p>
            </div>

            {/* Top Action & Filter Mode */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0b5347] transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Create Team</span>
              </button>

              <div className="flex items-center rounded-2xl bg-white p-1 shadow-2xs border border-[#d6e7e1]">
                <button
                  type="button"
                  onClick={() => setFilterMode("active")}
                  className={`rounded-xl px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
                    filterMode === "active"
                      ? "bg-[#0f6b5c] text-white shadow-xs"
                      : "text-[#57685f] hover:text-[#122622]"
                  }`}
                >
                  {t("active")}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode("past")}
                  className={`rounded-xl px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
                    filterMode === "past"
                      ? "bg-[#0f6b5c] text-white shadow-xs"
                      : "text-[#57685f] hover:text-[#122622]"
                  }`}
                >
                  {t("past")}
                </button>
              </div>
            </div>
          </div>

          {/* Cards Layout Container */}
          <div className="flex flex-col gap-6">
            {/* Top Row: Featured Active Team Card + Side State Card */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* ================= 1. FEATURED ACTIVE TEAM CARD (8 COLS) ================= */}
              {hasTeam && teamState?.team ? (
                <div className="flex flex-col overflow-hidden rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-sm sm:flex-row lg:col-span-8">
                  {/* Left Side Content (60%) */}
                  <div className="flex flex-1 flex-col justify-between gap-6 pr-0 sm:pr-6">
                    <div className="flex flex-col gap-4">
                      {/* Header Pill & Icon */}
                      <div className="flex items-center justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c]">
                          <Cloud className="h-6 w-6" />
                        </span>
                        <span className="rounded-full bg-[#e8f3f0] px-3 py-1 text-[11px] font-bold text-[#0f6b5c]">
                          {teamState.team.openToMembers ? t("inProgress") : "ROSTER FULL"}
                        </span>
                      </div>

                      {/* Team Title & Hackathon Tag */}
                      <div>
                        <h2 className="font-display text-2xl font-bold tracking-tight text-[#122622]">
                          {teamState.team.teamName}
                        </h2>
                        <p className="mt-1 text-xs font-medium text-[#57685f]">
                          🏆 {teamState.hackathon.title}
                        </p>
                        {teamState.team.description && (
                          <p className="mt-1.5 text-xs text-[#57685f] line-clamp-2">
                            {teamState.team.description}
                          </p>
                        )}
                      </div>

                      {/* Members & User Role Metadata */}
                      <div className="flex items-center justify-between border-t border-b border-gray-100 py-4">
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#57685f]">
                            MEMBERS ({teamState.members.length} / {teamState.team.maxSize})
                          </p>
                          <div className="mt-1.5 flex items-center -space-x-2">
                            {teamState.members.slice(0, 4).map((m, idx) => (
                              <span
                                key={m.id}
                                title={m.userName}
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-white ${
                                  idx === 0
                                    ? "bg-[#0f6b5c] text-white"
                                    : "bg-[#e8f3f0] text-[#0f6b5c]"
                                }`}
                              >
                                {getInitials(m.userName || m.inviteeEmail)}
                              </span>
                            ))}
                            {teamState.members.length > 4 && (
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800 ring-2 ring-white">
                                +{teamState.members.length - 4}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#57685f]">
                            {t("myRole")}
                          </p>
                          <p className="mt-1 text-xs font-bold text-[#0f6b5c]">
                            {currentRoleName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsRosterModalOpen(true)}
                        className="rounded-xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-all cursor-pointer"
                      >
                        {t("openTeam")}
                      </button>

                      {isLeader && teamState.members.length < teamState.team.maxSize && (
                        <button
                          type="button"
                          onClick={() => setIsInviteModalOpen(true)}
                          className="rounded-xl bg-[#e8f3f0] px-5 py-2.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#d6e7e1] transition-all cursor-pointer"
                        >
                          {t("inviteMember")}
                        </button>
                      )}

                      {isLeader && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditTeamName(teamState.team!.teamName);
                            setEditTeamDesc(teamState.team!.description || "");
                            setEditOpenToMembers(teamState.team!.openToMembers);
                            setIsEditModalOpen(true);
                          }}
                          aria-label="Edit team"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d6e7e1] bg-white text-[#57685f] hover:border-[#0f6b5c] hover:text-[#0f6b5c] transition-all cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (isLeader) {
                            if (confirm("Disband this team? All members will be detached.")) {
                              deleteTeamMutation.mutate();
                            }
                          } else {
                            if (confirm("Are you sure you want to leave this team?")) {
                              leaveTeamMutation.mutate();
                            }
                          }
                        }}
                        aria-label={isLeader ? "Disband team" : "Leave team"}
                        title={isLeader ? "Disband team" : "Leave team"}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-white text-[#c4211c] hover:bg-red-50 transition-all cursor-pointer"
                      >
                        {isLeader ? <Trash2 className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Right Side Banner Graphic */}
                  <div className="mt-6 flex-1 sm:mt-0 sm:max-w-[260px] lg:max-w-[300px]">
                    <div className="h-full min-h-[220px] w-full overflow-hidden rounded-2xl border border-[#d6e7e1] shadow-xs">
                      <img
                        src="/futuristic_city_banner.png"
                        alt="Skyline AI Architects project graphic"
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* SOLO / LOOKING FOR TEAM HERO CARD (8 COLS) */
                <div className="flex flex-col overflow-hidden rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-sm sm:flex-row lg:col-span-8">
                  <div className="flex flex-1 flex-col justify-between gap-6 pr-0 sm:pr-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c]">
                          {registrationType === "looking_for_team" ? (
                            <Users className="h-6 w-6" />
                          ) : (
                            <Leaf className="h-6 w-6" />
                          )}
                        </span>
                        <span className="rounded-full bg-[#e8f3f0] px-3 py-1 text-[11px] font-bold text-[#0f6b5c]">
                          {registrationType === "looking_for_team" ? "LOOKING FOR TEAM" : "SOLO HACKER"}
                        </span>
                      </div>

                      <div>
                        <h2 className="font-display text-2xl font-bold tracking-tight text-[#122622]">
                          {registrationType === "looking_for_team"
                            ? "Looking for Teammates"
                            : "Participating Solo"}
                        </h2>
                        <p className="mt-1 text-xs font-medium text-[#57685f]">
                          🏆 {teamState?.hackathon.title || "Innovation Hackathon"}
                        </p>
                        <p className="mt-1 text-xs text-[#57685f]">
                          {registrationType === "looking_for_team"
                            ? "Browse open teams, send join requests, or create your own team for this hackathon."
                            : "You are currently participating as an individual hacker. You can form or join a team anytime."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-b border-gray-100 py-4">
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#57685f]">
                            PARTICIPATION STATUS
                          </p>
                          <p className="mt-1 text-xs font-bold text-[#122622]">
                            {isRegistered ? "Registered Participant" : "Not Registered"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#57685f]">
                            {t("myRole")}
                          </p>
                          <p className="mt-1 text-xs font-bold text-[#0f6b5c]">
                            {currentRoleName}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="rounded-xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-all cursor-pointer"
                      >
                        {t("createTeamCta")}
                      </button>

                      {registrationType === "solo" ? (
                        <button
                          type="button"
                          onClick={() => switchRegistrationTypeMutation.mutate("looking_for_team")}
                          disabled={switchRegistrationTypeMutation.isPending}
                          className="rounded-xl bg-[#e8f3f0] px-5 py-2.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#d6e7e1] transition-all cursor-pointer"
                        >
                          Looking for Teammates
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => switchRegistrationTypeMutation.mutate("solo")}
                          disabled={switchRegistrationTypeMutation.isPending}
                          className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 transition-all cursor-pointer"
                        >
                          Set to Solo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex-1 sm:mt-0 sm:max-w-[260px] lg:max-w-[300px]">
                    <div className="h-full min-h-[220px] w-full overflow-hidden rounded-2xl border border-[#d6e7e1] shadow-xs">
                      <img
                        src="/futuristic_city_banner.png"
                        alt="Hackathon team banner"
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ================= 2. SIDE CARD: INVITATIONS OR FORMATION (4 COLS) ================= */}
              <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-sm lg:col-span-4">
                <div className="flex flex-col gap-4">
                  {/* Icon & Category Tag */}
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                      <Mail className="h-6 w-6" />
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-600">
                      INVITATIONS ({teamState?.myInvitations.length || 0})
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-tight text-[#122622]">
                      {teamState?.myInvitations.length ? "Team Invitations" : "No Pending Invites"}
                    </h3>
                    <p className="mt-1 text-xs text-[#57685f]">
                      {teamState?.myInvitations.length
                        ? `You have ${teamState.myInvitations.length} pending team invite(s).`
                        : "When a team leader invites you to collaborate, it will appear here."}
                    </p>
                  </div>

                  {/* First Invitation if any */}
                  {teamState?.myInvitations && teamState.myInvitations.length > 0 && (
                    <div className="rounded-2xl bg-[#f8fafc] border border-gray-100 p-3.5 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#122622]">
                          {teamState.myInvitations[0].teamName}
                        </span>
                        <span className="text-[10px] text-[#57685f]">
                          {new Date(teamState.myInvitations[0].invitedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => acceptInviteMutation.mutate(teamState.myInvitations[0].id)}
                          disabled={acceptInviteMutation.isPending}
                          className="flex-1 rounded-xl bg-[#0f6b5c] py-2 text-xs font-bold text-white hover:bg-[#0b5347] transition-all cursor-pointer text-center"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => declineInviteMutation.mutate(teamState.myInvitations[0].id)}
                          disabled={declineInviteMutation.isPending}
                          className="flex-1 rounded-xl border border-gray-200 bg-white py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer text-center"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Metadata Pill */}
                  <div className="flex items-center gap-4 rounded-2xl bg-gray-50/80 p-3 text-xs font-semibold text-[#57685f]">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[#0f6b5c]" />
                      {teamState?.openTeams.length || 0} Open Teams
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-[#0f6b5c]" />
                      {currentRoleName}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const element = document.getElementById("available-teams-section");
                      element?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="rounded-xl bg-[#e8f3f0] py-2.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#d6e7e1] transition-all cursor-pointer text-center"
                  >
                    Find Teams
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="rounded-xl border border-[#d6e7e1] bg-white py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 transition-all cursor-pointer text-center"
                  >
                    New Team
                  </button>
                </div>
              </div>
            </div>

            {/* ================= 3. AVAILABLE TEAMS SECTION (GRID) ================= */}
            <div id="available-teams-section" className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-xl font-bold tracking-tight text-[#122622]">
                    Available Teams ({filteredOpenTeams.length})
                  </h3>
                  <p className="text-xs text-[#57685f]">
                    Discover teams in {teamState?.hackathon.title || "this hackathon"} accepting collaborators.
                  </p>
                </div>
              </div>

              {filteredOpenTeams.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#d6e7e1] bg-white p-12 text-center text-xs text-[#57685f]">
                  <p className="font-bold text-sm text-[#122622]">No discoverable teams found.</p>
                  <p className="mt-1">Create your own team and invite peers to build together!</p>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Team</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOpenTeams.map((openTeam) => (
                    <div
                      key={openTeam.id}
                      className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-sm hover:border-[#0f6b5c]/40 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col gap-4">
                        {/* Tag */}
                        <div className="flex items-center justify-between">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f3f0] text-[#0f6b5c]">
                            <Shield className="h-5 w-5" />
                          </span>
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-600">
                            {openTeam.memberCount} / {openTeam.maxSize} Members
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="font-display text-lg font-bold tracking-tight text-[#122622]">
                            {openTeam.teamName}
                          </h4>
                          <p className="mt-1 text-xs text-[#57685f] line-clamp-2 min-h-[32px]">
                            {openTeam.description || "Building innovative solutions for this challenge."}
                          </p>
                        </div>

                        {/* Metadata Pill */}
                        <div className="flex items-center justify-between rounded-2xl bg-gray-50/80 p-3 text-xs font-semibold text-[#57685f]">
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-[#0f6b5c]" />
                            {openTeam.leaderName}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(openTeam.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        {openTeam.hasRequestedJoin ? (
                          <span className="block w-full text-center rounded-xl bg-amber-50 border border-amber-200 py-2.5 text-xs font-bold text-amber-700">
                            Request Pending Approval
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setTargetTeamId(openTeam.id);
                              setTargetTeamName(openTeam.teamName);
                              setIsJoinRequestModalOpen(true);
                            }}
                            className="w-full rounded-xl bg-[#e8f3f0] py-2.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#0f6b5c] hover:text-white transition-all cursor-pointer text-center"
                          >
                            Request to Join Team
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ================= MODAL: CREATE TEAM ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="w-full max-w-md my-auto max-h-[92dvh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-8 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-display text-lg font-bold text-[#122622]">
                Create a New Team
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!createTeamName.trim()) {
                  showToast("Team name is required.", "danger");
                  return;
                }
                createTeamMutation.mutate();
              }}
              className="mt-5 flex flex-col gap-4"
            >
              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createTeamName}
                  onChange={(e) => setCreateTeamName(e.target.value)}
                  placeholder="e.g. Skyline AI Architects"
                  className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-xs text-[#122622] focus:border-[#0f6b5c] focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Team Description <span className="text-xs font-normal text-[#57685f]">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={createTeamDesc}
                  onChange={(e) => setCreateTeamDesc(e.target.value)}
                  placeholder="Tell potential teammates about your project idea..."
                  className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-xs text-[#122622] focus:border-[#0f6b5c] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="mt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 cursor-pointer w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTeamMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0c564a] cursor-pointer w-full sm:w-auto"
                >
                  {createTeamMutation.isPending && (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  <span>Create Team</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT TEAM ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="w-full max-w-md my-auto max-h-[92dvh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-8 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-display text-lg font-bold text-[#122622]">
                Edit Team Settings
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editTeamName.trim()) {
                  showToast("Team name is required.", "danger");
                  return;
                }
                updateTeamMutation.mutate();
              }}
              className="mt-5 flex flex-col gap-4"
            >
              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-xs text-[#122622] focus:border-[#0f6b5c] focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Team Description
                </label>
                <textarea
                  rows={3}
                  value={editTeamDesc}
                  onChange={(e) => setEditTeamDesc(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-xs text-[#122622] focus:border-[#0f6b5c] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-gray-200">
                <div>
                  <p className="text-xs font-bold text-[#122622]">Open to New Members</p>
                  <p className="text-[11px] text-[#57685f]">Allow other participants to discover and request to join.</p>
                </div>
                <input
                  type="checkbox"
                  checked={editOpenToMembers}
                  onChange={(e) => setEditOpenToMembers(e.target.checked)}
                  className="h-4 w-4 rounded text-[#0f6b5c] focus:ring-[#0f6b5c] cursor-pointer"
                />
              </div>

              <div className="mt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 cursor-pointer w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateTeamMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0c564a] cursor-pointer w-full sm:w-auto"
                >
                  {updateTeamMutation.isPending && (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: INVITE MEMBER ================= */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="w-full max-w-md my-auto max-h-[92dvh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-8 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-display text-lg font-bold text-[#122622]">
                Invite Teammate
              </h3>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
                  showToast("Please provide a valid registered email.", "danger");
                  return;
                }
                inviteMemberMutation.mutate();
              }}
              className="mt-5 flex flex-col gap-4"
            >
              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Participant Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="collaborator@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-xs text-[#122622] focus:border-[#0f6b5c] focus:bg-white focus:outline-none"
                  required
                />
                <p className="mt-1 text-[11px] text-[#57685f]">
                  The participant must be registered for {teamState?.hackathon.title}.
                </p>
              </div>

              <div className="mt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 cursor-pointer w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteMemberMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0c564a] cursor-pointer w-full sm:w-auto"
                >
                  {inviteMemberMutation.isPending && (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  <span>Send Invite</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: JOIN REQUEST ================= */}
      {isJoinRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="w-full max-w-md my-auto max-h-[92dvh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-8 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="min-w-0 pr-2">
                <h3 className="font-display text-lg font-bold text-[#122622]">
                  Join Request
                </h3>
                <p className="text-xs text-[#57685f] truncate">{targetTeamName}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsJoinRequestModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:text-gray-600 cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendJoinRequestMutation.mutate();
              }}
              className="mt-5 flex flex-col gap-4"
            >
              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Message to Team Leader <span className="text-xs font-normal text-[#57685f]">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={joinRequestMessage}
                  onChange={(e) => setJoinRequestMessage(e.target.value)}
                  placeholder="Introduce yourself, your skills, or what you'd like to build..."
                  className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-xs text-[#122622] focus:border-[#0f6b5c] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="mt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsJoinRequestModalOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 cursor-pointer w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendJoinRequestMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0c564a] cursor-pointer w-full sm:w-auto"
                >
                  {sendJoinRequestMutation.isPending && (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  <span>Send Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TEAM ROSTER & MANAGEMENT ================= */}
      {isRosterModalOpen && teamState?.team && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="w-full max-w-2xl my-auto max-h-[92dvh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-8 shadow-xl flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="min-w-0 pr-2">
                <h3 className="font-display text-xl font-bold text-[#122622] truncate">
                  {teamState.team.teamName} - Roster
                </h3>
                <p className="text-xs text-[#57685f]">
                  {teamState.members.length} / {teamState.team.maxSize} Members
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRosterModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:text-gray-600 cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Members List */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#57685f] mb-3">
                Active Members
              </h4>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-[#f8fafc]">
                {teamState.members.map((member) => {
                  const isMemberLeader = member.userId === teamState.team?.leaderUserId;
                  const isSelf = member.userId === user?.id;

                  return (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8f3f0] text-xs font-bold text-[#0f6b5c]">
                          {getInitials(member.userName || member.inviteeEmail)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-[#122622] truncate">
                              {member.userName} {isSelf && "(You)"}
                            </span>
                            {isMemberLeader && (
                              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[9px] font-extrabold text-amber-800 uppercase shrink-0">
                                Leader
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#57685f] block truncate">{member.inviteeEmail}</span>
                        </div>
                      </div>

                      {isLeader && !isMemberLeader && member.userId && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove ${member.userName} from the team?`)) {
                              removeMemberMutation.mutate(member.userId!);
                            }
                          }}
                          disabled={removeMemberMutation.isPending}
                          className="rounded-lg border border-red-200 bg-red-50/60 px-3 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-100 transition-all cursor-pointer self-end sm:self-auto shrink-0"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leader Section: Pending Invites */}
            {isLeader && teamState.pendingInvitations.length > 0 && (
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#57685f] mb-3">
                  Pending Invitations ({teamState.pendingInvitations.length})
                </h4>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-[#f8fafc]">
                  {teamState.pendingInvitations.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between gap-3 p-3.5 bg-white">
                      <span className="text-xs font-medium text-[#122622] truncate">{inv.inviteeEmail}</span>
                      <button
                        type="button"
                        onClick={() => cancelInviteMutation.mutate(inv.id)}
                        className="text-xs font-bold text-red-600 hover:underline cursor-pointer shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leader Section: Incoming Join Requests */}
            {isLeader && teamState.pendingJoinRequests.length > 0 && (
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#57685f] mb-3">
                  Incoming Join Requests ({teamState.pendingJoinRequests.length})
                </h4>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-[#f8fafc]">
                  {teamState.pendingJoinRequests.map((req) => (
                    <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#122622] truncate">{req.userName} ({req.userEmail})</p>
                        {req.message && <p className="text-[11px] text-[#57685f] mt-0.5 break-words">"{req.message}"</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => reviewJoinRequestMutation.mutate({ requestId: req.id, decision: "accepted" })}
                          className="rounded-xl bg-[#0f6b5c] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0b5347] transition-all cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => reviewJoinRequestMutation.mutate({ requestId: req.id, decision: "rejected" })}
                          className="rounded-xl border border-gray-200 px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsRosterModalOpen(false)}
                className="inline-flex items-center justify-center rounded-xl bg-gray-100 px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-200 cursor-pointer w-full sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyTeamsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f3f6f4] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0f6b5c] border-t-transparent" />
        </div>
      }
    >
      <MyTeamsContent />
    </Suspense>
  );
}
