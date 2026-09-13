"use client";

import { useState, useEffect, useMemo } from "react";
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
  Award,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Plus,
  Clock,
  Sparkles,
  Search,
  Filter,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  CheckCircle2,
  AlertCircle,
  Star,
  Globe,
  Video,
  FileText,
  Layers,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Tag,
  Check,
  Megaphone,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { Logomark } from "@/components/ui/Logomark";
import {
  listHackathons,
  formatHackathonPrize,
  type Hackathon,
} from "@/features/hackathons/lib/hackathons-client";
import { NotificationBellDropdown } from "@/features/notifications/components/NotificationBellDropdown";
import {
  notificationsClient,
  type InAppNotification,
} from "@/features/notifications/lib/notifications-client";
import { PortalMobileNav } from "@/components/layout/PortalMobileNav";
import {
  listMyRegistrations,
  type Registration,
} from "@/features/registrations/lib/registrations-client";
import {
  userProjectsClient,
  type UserProject,
  type ProjectEvaluation,
} from "@/features/projects/lib/user-projects-client";
import { MyProjectsView } from "@/features/projects/components/MyProjectsView";

export function ParticipantDashboardContent({
  initialTab = "dashboard",
}: {
  initialTab?: string;
}) {
  const t = useTranslations("Dashboard");
  const { user, isAuthenticated } = useSession();

  const userName = user?.fullName || user?.email?.split("@")[0] || "Innovator";
  const firstName = userName.split(" ")[0];
  const userInitial = firstName.charAt(0).toUpperCase();

  // Sidebar & Layout state
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Real Backend / Client Data state
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Project Table Controls: Search, Filter, Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4; // 4 projects per page for clean layout

  // Modal inspection state
  const [selectedProject, setSelectedProject] = useState<UserProject | null>(null);

  // Load live data from all domain clients
  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [hackathonsRes, registrationsRes, projectsRes, notificationsRes] =
          await Promise.allSettled([
            listHackathons(),
            listMyRegistrations(),
            userProjectsClient.getUserProjects(),
            notificationsClient.getMyNotifications(),
          ]);

        if (isMounted) {
          if (hackathonsRes.status === "fulfilled" && hackathonsRes.value?.data) {
            setHackathons(hackathonsRes.value.data);
          }
          if (registrationsRes.status === "fulfilled" && Array.isArray(registrationsRes.value)) {
            setRegistrations(registrationsRes.value);
          }
          if (projectsRes.status === "fulfilled" && Array.isArray(projectsRes.value)) {
            setProjects(projectsRes.value);
          }
          if (notificationsRes.status === "fulfilled" && Array.isArray(notificationsRes.value)) {
            setNotifications(notificationsRes.value);
          }
        }
      } catch (err) {
        console.warn("Error loading dashboard data:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Featured Hackathon (Pick the nearest active/published hackathon)
  const featuredHackathon = useMemo(() => {
    if (!hackathons || hackathons.length === 0) return null;
    const now = Date.now();
    const active = hackathons.filter(
      (h) => !h.isSuspended && (h.status === "published" || !h.status)
    );
    if (active.length === 0) return hackathons[0];

    // Prefer hackathons where registration or submission closes in the future
    const upcoming = active.filter((h) => {
      const regClose = h.registrationClosesAt ? new Date(h.registrationClosesAt).getTime() : 0;
      const subClose = h.submissionClosesAt ? new Date(h.submissionClosesAt).getTime() : 0;
      return regClose > now || subClose > now;
    });

    return upcoming.length > 0 ? upcoming[0] : active[0];
  }, [hackathons]);

  // 2. User Teams derived from active projects and registrations
  const userTeams = useMemo(() => {
    const map = new Map<string, { teamName: string; hackathonName: string; membersCount: number; projectId?: string }>();

    // From projects
    projects.forEach((p) => {
      if (p.teamName && !map.has(p.teamName)) {
        map.set(p.teamName, {
          teamName: p.teamName,
          hackathonName: p.hackathonName || "National Innovation Challenge",
          membersCount: p.teamMembersCount || 3,
          projectId: p.id,
        });
      }
    });

    return Array.from(map.values()).slice(0, 3);
  }, [projects]);

  // 3. Upcoming Deadlines derived from hackathons
  const upcomingDeadlines = useMemo(() => {
    if (!hackathons || hackathons.length === 0) {
      return [
        {
          day: "24",
          month: "FEB",
          title: "Prototype Submission",
          event: "Ethio-Green Tech Challenge",
          isUrgent: true,
          link: "/submissions",
        },
        {
          day: "02",
          month: "MAR",
          title: "Final Pitch Deck",
          event: "AgriTech Hub",
          isUrgent: false,
          link: "/submissions",
        },
      ];
    }

    const now = Date.now();
    const list: Array<{
      day: string;
      month: string;
      title: string;
      event: string;
      isUrgent: boolean;
      link: string;
      rawDate: number;
    }> = [];

    hackathons.forEach((h) => {
      if (h.submissionClosesAt) {
        const d = new Date(h.submissionClosesAt);
        const time = d.getTime();
        if (time > now) {
          const diffDays = Math.ceil((time - now) / (1000 * 60 * 60 * 24));
          list.push({
            day: String(d.getDate()).padStart(2, "0"),
            month: d.toLocaleString("default", { month: "short" }).toUpperCase(),
            title: "Project Submission Closes",
            event: h.title,
            isUrgent: diffDays <= 3,
            link: `/submissions?hackathonId=${h.id}`,
            rawDate: time,
          });
        }
      }
      if (h.registrationClosesAt) {
        const d = new Date(h.registrationClosesAt);
        const time = d.getTime();
        if (time > now) {
          const diffDays = Math.ceil((time - now) / (1000 * 60 * 60 * 24));
          list.push({
            day: String(d.getDate()).padStart(2, "0"),
            month: d.toLocaleString("default", { month: "short" }).toUpperCase(),
            title: "Registration Closes",
            event: h.title,
            isUrgent: diffDays <= 3,
            link: `/hackathons/${h.slug || h.id}`,
            rawDate: time,
          });
        }
      }
    });

    list.sort((a, b) => a.rawDate - b.rawDate);
    return list.slice(0, 3);
  }, [hackathons]);

  // 4. Dynamic Achievements & XP Calculation
  const achievements = useMemo(() => {
    const regCount = registrations.length;
    const projCount = projects.length;
    const submittedCount = projects.filter(
      (p) => p.status === "SUBMITTED" || p.status === "COMPLETED" || p.status === "READY_TO_REVIEW"
    ).length;

    const totalXp = regCount * 250 + projCount * 400 + submittedCount * 600;
    const level = Math.max(1, Math.floor(totalXp / 800) + 1);

    return {
      level,
      totalXp,
      title: `Level ${level} Innovator • ${totalXp.toLocaleString()} XP`,
      badge: level > 1 ? "Active Contributor" : "New Innovator",
    };
  }, [registrations, projects]);

  // 5. Registered Events List
  const registeredEvents = useMemo(() => {
    if (registrations.length === 0) {
      return [];
    }

    return registrations.map((r) => {
      const matchHack = hackathons.find((h) => h.id === r.hackathonId);
      const title = matchHack?.title || `Hackathon #${r.hackathonId.slice(0, 8)}`;
      const isActive = r.status === "CONFIRMED" || r.status === "REGISTERED";
      return {
        id: r.id,
        title,
        statusText: isActive ? "Registered & Active" : r.status || "Completed",
        isActive,
        link: matchHack ? `/hackathons/${matchHack.slug || matchHack.id}` : "/hackathons",
      };
    });
  }, [registrations, hackathons]);

  // 6. Filtered & Paginated Projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tagline?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.hackathonName?.toLowerCase().includes(q) ||
          p.teamName?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter((p) => p.status === statusFilter);
    }

    return result;
  }, [projects, searchQuery, statusFilter]);

  // Reset to Page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  // Project Status Counts for Header Pills
  const counts = useMemo(() => {
    const active = projects.filter(
      (p) => p.status === "IN_PROGRESS" || p.status === "READY_TO_REVIEW"
    ).length;
    const underReview = projects.filter((p) => p.status === "SUBMITTED").length;
    const completed = projects.filter((p) => p.status === "COMPLETED").length;
    const drafts = projects.filter((p) => p.status === "DRAFT").length;
    return { active, underReview, completed, drafts, total: projects.length };
  }, [projects]);

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#122622]">
      {/* Responsive Mobile Sticky Navigation Bar & Slide-Out Drawer */}
      <PortalMobileNav
        portalType="participant"
        activeItem={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.history.pushState({}, "", tab === "projects" ? "/dashboard/projects" : "/dashboard");
        }}
        title="Participant Portal"
      />

      <div className="mx-auto flex w-full max-w-[1500px]">
        {/* ================= LEFT SIDEBAR ================= */}
        <aside
          className={`sticky top-0 hidden h-screen flex-col justify-between border-r border-[#d6e7e1] bg-white p-5 lg:flex shadow-2xs transition-all duration-300 ease-in-out z-20 ${
            isSidebarCollapsed ? "w-20 px-3" : "w-64 px-5"
          }`}
        >
          <div className="flex flex-col gap-8">
            {/* Brand Logo & Portal Tag -> Navigates to Hero / Homepage */}
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-3 cursor-pointer text-left group focus:outline-none"
                title="Go to Home"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F9F8F3] border border-[#E2DFD8] shadow-xs overflow-hidden p-1 transition-transform group-hover:scale-105">
                  <Logomark className="h-full w-full object-contain" />
                </span>
                {!isSidebarCollapsed && (
                  <div className="transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap">
                    <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#0f6b5c]">
                      HODANA
                    </h1>
                    <p className="text-[11px] font-bold text-[#57685f]">
                      Participant Portal
                    </p>
                  </div>
                )}
              </Link>

              {/* Sidebar Collapse/Expand Toggle Button */}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-[#57685f] hover:bg-[#e8f3f0] hover:text-[#0f6b5c] transition-colors"
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Sidebar Navigation */}
            <nav className="flex flex-col gap-1.5 text-xs font-semibold text-[#57685f]">
              <Link
                href="/dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("dashboard");
                  window.history.pushState({}, "", "/dashboard");
                }}
                title={isSidebarCollapsed ? t("navDashboard") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all cursor-pointer ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } ${
                  activeTab === "dashboard"
                    ? "bg-[#0f6b5c] text-white shadow-md font-bold"
                    : "hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navDashboard")}</span>}
              </Link>

              <Link
                href="/hackathons"
                title={isSidebarCollapsed ? t("navHackathons") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Calendar className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navHackathons")}</span>}
              </Link>

              <Link
                href="/dashboard/teams"
                title={isSidebarCollapsed ? t("navMyTeams") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Users className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navMyTeams")}</span>}
              </Link>

              <Link
                href="/dashboard/projects"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("projects");
                  window.history.pushState({}, "", "/dashboard/projects");
                }}
                title={isSidebarCollapsed ? t("navMyProjects") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all cursor-pointer ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } ${
                  activeTab === "projects"
                    ? "bg-[#0f6b5c] text-white shadow-md font-bold"
                    : "hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
                }`}
              >
                <FolderGit2 className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navMyProjects")}</span>}
              </Link>

              <Link
                href="/dashboard/registrations"
                title={isSidebarCollapsed ? t("navRegistrations") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Layers className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navRegistrations")}</span>}
              </Link>

              <Link
                href="/profile"
                title={isSidebarCollapsed ? t("navProfile") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <User className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navProfile")}</span>}
              </Link>
            </nav>
          </div>

          {/* Sidebar Bottom CTA & User Profile Footer */}
          <div className="flex flex-col gap-4 border-t border-[#d6e7e1] pt-5">
            <Link
              href="/hackathons"
              title={isSidebarCollapsed ? t("launchProject") : undefined}
              className={`flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[#0b5347] ${
                isSidebarCollapsed ? "px-0" : "px-4"
              }`}
            >
              <Rocket className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("launchProject")}</span>}
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
                    {user?.email || "Participant"}
                  </p>
                </div>
              )}
            </Link>
          </div>
        </aside>

        {/* ================= MAIN DASHBOARD CONTENT ================= */}
        <main className="flex min-w-0 flex-1 flex-col p-4 sm:p-6 lg:p-8 transition-all duration-300">
          {activeTab === "projects" ? (
            <MyProjectsView
              onBackToDashboard={() => {
                setActiveTab("dashboard");
                window.history.pushState({}, "", "/dashboard");
              }}
            />
          ) : (
            <>
              {/* Welcome Header Bar */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-8 border-b border-[#d6e7e1]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#122622]">
                  {t("welcomeTitle", { name: firstName })}
                </h2>
                {user?.verificationStatus === "verified" && (
                  <span
                    title="Verified Participant"
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Verified
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs sm:text-sm text-[#57685f] font-normal">
                {t("welcomeSubtitle")}
              </p>
            </div>

            {/* Header Right Action Icons */}
            <div className="flex items-center gap-3">
              {/* Universal Live Notifications & Broadcasts Dropdown */}
              <NotificationBellDropdown />

              {/* User Profile Shortcut */}
              <Link
                href="/settings/profile"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#d6e7e1] text-[#57685f] shadow-2xs hover:bg-[#e8f3f0] hover:text-[#0f6b5c] transition-all cursor-pointer"
                aria-label="User Profile"
                title="User Profile"
              >
                <User className="h-4 w-4" />
              </Link>
            </div>
          </header>

          {/* Bento Grid Rows */}
          <div className="flex flex-col gap-8 pt-8">
            {/* ================= NOTIFICATIONS & BROADCASTS FEED ================= */}
            {notifications.length > 0 && (
              <div className="rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-[#d6e7e1]">
                  <div className="flex items-center gap-2.5">
                    <Megaphone className="h-5 w-5 text-[#0f6b5c]" />
                    <h3 className="font-display text-lg font-extrabold text-[#122622]">
                      Notifications & Broadcasts
                    </h3>
                    {notifications.filter((n) => !n.read).length > 0 && (
                      <span className="rounded-full bg-red-100 text-red-700 px-2.5 py-0.5 text-xs font-extrabold">
                        {notifications.filter((n) => !n.read).length} new
                      </span>
                    )}
                  </div>
                  {notifications.some((n) => !n.read) && (
                    <button
                      type="button"
                      onClick={async () => {
                        await notificationsClient.markAllRead();
                        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                      }}
                      className="text-xs font-bold text-[#0f6b5c] hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                  {notifications.slice(0, 3).map((item) => {
                    const isUrgent = item.priority === "URGENT";
                    const isImportant = item.priority === "IMPORTANT";
                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border p-4 text-xs transition-all ${
                          !item.read
                            ? isUrgent
                              ? "border-red-300 bg-red-50/70 shadow-xs"
                              : isImportant
                              ? "border-amber-300 bg-amber-50/70 shadow-xs"
                              : "border-emerald-300 bg-emerald-50/50 shadow-xs"
                            : "border-[#d6e7e1] bg-white opacity-85 hover:opacity-100"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            {!item.read && (
                              <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                            )}
                            <span className="font-display font-extrabold text-xs text-[#122622] truncate" title={item.title}>
                              {item.title}
                            </span>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase shrink-0 ${
                              isUrgent
                                ? "bg-red-200 text-red-900"
                                : isImportant
                                ? "bg-amber-200 text-amber-900"
                                : "bg-[#e8f3f0] text-[#0f6b5c]"
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>
                        {item.message && item.message.trim() !== item.title.trim() && (
                          <p className="text-[11px] text-[#57685f] leading-relaxed line-clamp-2">
                            {item.message}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#d6e7e1]/50 text-[10px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(item.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })} at{" "}
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {!item.read && (
                            <button
                              type="button"
                              onClick={async () => {
                                await notificationsClient.markRead(item.id);
                                setNotifications((prev) =>
                                  prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
                                );
                              }}
                              className="text-[#0f6b5c] font-bold hover:underline"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= ROW 1: Featured Hackathon & My Teams ================= */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Featured Hackathons Bento Card */}
              <div className="flex flex-col justify-between gap-5 rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-xs lg:col-span-7">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#0f6b5c]" />
                    <h3 className="font-display text-lg font-extrabold text-[#122622]">
                      {t("featuredHackathons")}
                    </h3>
                  </div>
                  <Link
                    href="/hackathons"
                    className="text-xs font-bold text-[#0f6b5c] hover:underline inline-flex items-center gap-1"
                  >
                    <span>{t("viewAll")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {featuredHackathon ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-[#d6e7e1] bg-[#f8faf9] p-4 transition-all hover:border-[#0f6b5c]/40">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0f6b5c] text-white shadow-xs p-2">
                      <Logomark className="h-full w-full object-contain" />
                    </div>
                    <div className="flex flex-1 flex-col gap-1 text-center sm:text-left">
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        <h4 className="text-sm font-extrabold text-[#122622]">
                          {featuredHackathon.title}
                        </h4>
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                          {formatHackathonPrize(featuredHackathon)}
                        </span>
                      </div>
                      <p className="text-xs text-[#57685f] font-medium">
                        {featuredHackathon.locationMode || "Online"} •{" "}
                        {featuredHackathon.registrationClosesAt
                          ? `Closes ${new Date(featuredHackathon.registrationClosesAt).toLocaleDateString()}`
                          : "Registration Open"}
                      </p>
                    </div>
                    <Link
                      href={`/hackathons/${featuredHackathon.slug || featuredHackathon.id}`}
                      className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl bg-[#0f6b5c] px-6 text-xs font-extrabold text-white shadow-xs hover:bg-[#0b5347] transition-all shrink-0"
                    >
                      <span>Explore</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#d6e7e1] p-6 text-center text-xs text-[#57685f]">
                    No active hackathons currently open. Check back soon!
                  </div>
                )}
              </div>

              {/* My Teams Bento Card */}
              <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-xs lg:col-span-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#0f6b5c]">
                    <Users className="h-5 w-5" />
                    <h3 className="font-display text-lg font-extrabold text-[#122622]">
                      {t("myTeams")}
                    </h3>
                  </div>
                  <Link
                    href="/dashboard/teams"
                    className="text-xs font-bold text-[#0f6b5c] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Manage</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="flex flex-col gap-2.5">
                  {userTeams.length > 0 ? (
                    userTeams.map((team, idx) => (
                      <Link
                        key={idx}
                        href="/dashboard/teams"
                        className="flex items-center justify-between rounded-2xl border border-gray-100 bg-[#FAFAFE] p-3 hover:border-[#d6e7e1] hover:bg-[#e8f3f0]/50 transition-all group"
                      >
                        <div>
                          <p className="text-xs font-extrabold text-[#122622] group-hover:text-[#0f6b5c]">
                            {team.teamName}
                          </p>
                          <p className="text-[11px] text-[#57685f] font-medium mt-0.5">
                            {team.hackathonName} • {team.membersCount} Members
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#57685f] group-hover:text-[#0f6b5c]" />
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#d6e7e1] p-5 text-center text-xs text-[#57685f]">
                      <p>You haven&apos;t joined or formed any teams yet.</p>
                      <Link
                        href="/dashboard/teams"
                        className="mt-2 inline-flex items-center gap-1 font-bold text-[#0f6b5c] hover:underline"
                      >
                        <span>Find or form a team</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ================= ROW 2: Deadlines, Achievements, Registered Events ================= */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Upcoming Deadlines Bento Card */}
              <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#57685f]">
                      {t("upcomingDeadlines")}
                    </h4>
                    <Clock className="h-4 w-4 text-[#57685f]" />
                  </div>
                  <div className="mt-4 flex flex-col gap-3">
                    {upcomingDeadlines.map((dl, idx) => (
                      <Link
                        key={idx}
                        href={dl.link}
                        className="flex items-center gap-3 rounded-2xl border border-gray-100 p-2.5 hover:bg-[#f8faf9] transition-colors"
                      >
                        <div
                          className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1 text-center border ${
                            dl.isUrgent
                              ? "bg-red-50 border-red-200 text-red-600"
                              : "bg-[#e8f3f0] border-[#d6e7e1] text-[#0f6b5c]"
                          }`}
                        >
                          <span className="text-sm font-extrabold">{dl.day}</span>
                          <span className="text-[9px] font-bold uppercase">{dl.month}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#122622] truncate">
                            {dl.title}
                          </p>
                          <p className="text-[11px] text-[#57685f] truncate font-medium">
                            {dl.event}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Achievement Badges Bento Card */}
              <div className="relative overflow-hidden flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#0f6b5c] to-[#0e2b25] p-6 text-white shadow-md">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-200/90">
                      {t("achievementBadges")}
                    </h4>
                    <Award className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs">
                      <Award className="h-6 w-6 text-amber-300" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-white">
                        {achievements.title}
                      </p>
                      <p className="text-xs text-emerald-200/80 font-medium">
                        {achievements.badge}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between text-[10px] text-emerald-200 font-bold mb-1">
                    <span>Progress to Level {achievements.level + 1}</span>
                    <span>{(achievements.totalXp % 800) / 8}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((achievements.totalXp % 800) / 800) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Registered Events Bento Card */}
              <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-xs sm:col-span-2 lg:col-span-1">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#57685f]">
                      {t("registeredEvents")}
                    </h4>
                    <Layers className="h-4 w-4 text-[#57685f]" />
                  </div>
                  <div className="mt-4 flex flex-col gap-2.5">
                    {registeredEvents.length > 0 ? (
                      registeredEvents.map((ev) => (
                        <Link
                          key={ev.id}
                          href={ev.link}
                          className="flex items-center justify-between rounded-xl border border-gray-100 p-2.5 hover:bg-[#f8faf9] transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`h-2 w-2 rounded-full shrink-0 ${
                                ev.isActive ? "bg-[#0f6b5c]" : "bg-emerald-500"
                              }`}
                            />
                            <span className="font-bold text-[#122622] truncate">{ev.title}</span>
                          </div>
                          <span className="text-[11px] font-medium text-[#57685f] shrink-0 ml-2">
                            {ev.statusText}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-[#d6e7e1] p-4 text-center text-xs text-[#57685f]">
                        <p>No registered hackathons yet.</p>
                        <Link
                          href="/hackathons"
                          className="mt-1.5 inline-flex items-center gap-1 font-bold text-[#0f6b5c] hover:underline text-[11px]"
                        >
                          <span>Explore Hackathons</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ================= ROW 3: Project Tracking & Status (with Full Pagination) ================= */}
            <div className="flex flex-col gap-6 rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-xs">
              {/* Table Top Controls & Counters */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f3f0] text-[#0f6b5c]">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-[#122622]">
                      {t("projectTracking")}
                    </h3>
                    <p className="text-xs text-[#57685f] font-medium">
                      Real-time status, evaluations, and submission pipeline
                    </p>
                  </div>
                </div>

                {/* Status Counter Pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <button
                    onClick={() => setStatusFilter("ALL")}
                    className={`rounded-full px-3 py-1 transition-all cursor-pointer ${
                      statusFilter === "ALL"
                        ? "bg-[#0f6b5c] text-white font-bold shadow-xs"
                        : "bg-[#e8f3f0] text-[#0f6b5c] hover:bg-[#d6e7e1]"
                    }`}
                  >
                    All: {counts.total}
                  </button>
                  <button
                    onClick={() => setStatusFilter("IN_PROGRESS")}
                    className={`rounded-full px-3 py-1 transition-all cursor-pointer ${
                      statusFilter === "IN_PROGRESS"
                        ? "bg-[#0f6b5c] text-white font-bold shadow-xs"
                        : "bg-[#e8f3f0] text-[#0f6b5c] hover:bg-[#d6e7e1]"
                    }`}
                  >
                    {t("active")}: {counts.active}
                  </button>
                  <button
                    onClick={() => setStatusFilter("SUBMITTED")}
                    className={`rounded-full px-3 py-1 transition-all cursor-pointer ${
                      statusFilter === "SUBMITTED"
                        ? "bg-amber-600 text-white font-bold shadow-xs"
                        : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                    }`}
                  >
                    {t("underReview")}: {counts.underReview}
                  </button>
                  <button
                    onClick={() => setStatusFilter("DRAFT")}
                    className={`rounded-full px-3 py-1 transition-all cursor-pointer ${
                      statusFilter === "DRAFT"
                        ? "bg-gray-700 text-white font-bold shadow-xs"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Drafts: {counts.drafts}
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-y border-gray-100 py-3">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#57685f]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects, categories, teams..."
                    className="w-full rounded-xl border border-[#d6e7e1] bg-[#f8faf9] pl-9 pr-4 py-2 text-xs text-[#122622] placeholder:text-[#57685f] focus:border-[#0f6b5c] focus:bg-white focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("projects");
                      window.history.pushState({}, "", "/dashboard/projects");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b5c] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#0b5347] transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Project</span>
                  </button>
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#122622]">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-extrabold uppercase tracking-wider text-[#57685f]">
                      <th className="py-3 px-4">{t("tableProjectName")}</th>
                      <th className="py-3 px-4">{t("tableEvent")}</th>
                      <th className="py-3 px-4">{t("tableSubmissionDate")}</th>
                      <th className="py-3 px-4">{t("tableJudgingStatus")}</th>
                      <th className="py-3 px-4 text-right">{t("tableAction")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {projects.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-xs text-[#57685f]">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Briefcase className="h-8 w-8 text-gray-300" />
                            <p className="font-bold text-sm text-[#122622]">No projects started yet</p>
                            <p className="text-[#57685f] max-w-sm">
                              You haven&apos;t started any hackathon projects yet. Create a project to track milestones and submit deliverables.
                            </p>
                            <Link
                              href="/dashboard/projects"
                              className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b5c] px-4 py-2 text-xs font-bold text-white hover:bg-[#0b5347] transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Create a Project</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedProjects.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-xs text-[#57685f]">
                          No projects match your filter.{" "}
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              setStatusFilter("ALL");
                            }}
                            className="font-bold text-[#0f6b5c] underline cursor-pointer"
                          >
                            Reset filters
                          </button>
                        </td>
                      </tr>
                    ) : (
                      paginatedProjects.map((proj) => {
                        const isEvaluated = Boolean(proj.evaluation);
                        const isSubmitted =
                          proj.status === "SUBMITTED" || proj.status === "READY_TO_REVIEW";
                        const isDraft = proj.status === "DRAFT";

                        return (
                          <tr
                            key={proj.id}
                            className="hover:bg-[#f8faf9] transition-colors group cursor-pointer"
                            onClick={() => setSelectedProject(proj)}
                          >
                            <td className="py-4 px-4 font-bold text-[#122622]">
                              <div className="flex flex-col">
                                <span className="font-extrabold group-hover:text-[#0f6b5c] transition-colors">
                                  {proj.title}
                                </span>
                                {proj.tagline && (
                                  <span className="text-[11px] text-[#57685f] font-medium line-clamp-1">
                                    {proj.tagline}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 font-medium text-[#57685f]">
                              <div>
                                <p className="font-bold text-[#122622]">
                                  {proj.hackathonName || "National Innovation Hub"}
                                </p>
                                <p className="text-[10px] text-[#57685f]">
                                  Team: {proj.teamName || "Solo Innovator"}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-medium text-[#57685f]">
                              {proj.submittedAt
                                ? new Date(proj.submittedAt).toLocaleDateString()
                                : isDraft
                                ? "Draft In Progress"
                                : "Pending Submission"}
                            </td>
                            <td className="py-4 px-4">
                              {isEvaluated ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-extrabold text-emerald-800">
                                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                  Score: {proj.evaluation?.overallScore}/10
                                </span>
                              ) : isSubmitted ? (
                                <span className="inline-flex rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[11px] font-extrabold text-amber-800">
                                  Under Review
                                </span>
                              ) : isDraft ? (
                                <span className="inline-flex rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-[11px] font-extrabold text-gray-700">
                                  Draft ({proj.buildProgress || 30}%)
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-[#e8f3f0] border border-[#d6e7e1] px-3 py-1 text-[11px] font-extrabold text-[#0f6b5c]">
                                  In Progress ({proj.buildProgress || 50}%)
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedProject(proj)}
                                  className="font-bold text-[#0f6b5c] hover:underline px-2 py-1 text-xs"
                                >
                                  {t("viewDetails")}
                                </button>
                                <Link
                                  href={`/submissions?hackathonId=${proj.hackathonId}`}
                                  className="rounded-lg bg-[#e8f3f0] px-2.5 py-1 font-bold text-[#0f6b5c] hover:bg-[#d6e7e1] transition-colors text-[11px]"
                                >
                                  Submit
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* ================= PAGINATION CONTROLS ================= */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-4 text-xs text-[#57685f]">
                <p className="font-medium">
                  Showing{" "}
                  <strong className="text-[#122622]">
                    {filteredProjects.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                  </strong>{" "}
                  to{" "}
                  <strong className="text-[#122622]">
                    {Math.min(currentPage * pageSize, filteredProjects.length)}
                  </strong>{" "}
                  of <strong className="text-[#122622]">{filteredProjects.length}</strong> projects
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#d6e7e1] bg-white px-3 font-bold text-[#122622] shadow-2xs hover:bg-[#f8faf9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 rounded-lg font-extrabold transition-all ${
                          currentPage === pageNum
                            ? "bg-[#0f6b5c] text-white shadow-xs"
                            : "border border-[#d6e7e1] bg-white text-[#122622] hover:bg-[#f8faf9]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#d6e7e1] bg-white px-3 font-bold text-[#122622] shadow-2xs hover:bg-[#f8faf9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
            </>
          )}
        </main>
      </div>

      {/* ================= INTERACTIVE PROJECT DETAILS MODAL ================= */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-8 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="inline-flex items-center gap-1 rounded-md bg-[#e8f3f0] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0f6b5c]">
                  {selectedProject.category || "Technology"}
                </span>
                <h3 className="font-display text-2xl font-extrabold text-[#122622] mt-1.5">
                  {selectedProject.title}
                </h3>
                <p className="text-xs text-[#57685f] font-medium mt-0.5">
                  {selectedProject.hackathonName} • Team: {selectedProject.teamName}
                </p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 flex flex-col gap-5 text-xs text-[#122622]">
              {selectedProject.tagline && (
                <div className="rounded-2xl bg-[#f8faf9] p-4 border border-[#d6e7e1]">
                  <p className="font-extrabold text-sm text-[#122622]">
                    {selectedProject.tagline}
                  </p>
                  <p className="text-xs text-[#57685f] mt-2 leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>
              )}

              {/* Tech Stack */}
              {selectedProject.techStack && selectedProject.techStack.length > 0 && (
                <div>
                  <h5 className="font-extrabold text-xs text-[#57685f] uppercase tracking-wider mb-2">
                    Technologies Used
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.techStack.map((tech, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-800 border border-gray-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Evaluation Breakdown if Evaluated */}
              {selectedProject.evaluation && (
                <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-extrabold text-xs text-emerald-900 flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      Judge Evaluation Results
                    </span>
                    <span className="rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-extrabold text-white">
                      Overall: {selectedProject.evaluation.overallScore} / 10
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                    <div className="rounded-xl bg-white p-2 border border-emerald-100">
                      <p className="text-gray-500 font-medium">Innovation</p>
                      <p className="font-extrabold text-emerald-900 text-sm">
                        {selectedProject.evaluation.criteriaScores.innovation}/10
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-2 border border-emerald-100">
                      <p className="text-gray-500 font-medium">Technical</p>
                      <p className="font-extrabold text-emerald-900 text-sm">
                        {selectedProject.evaluation.criteriaScores.technical}/10
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-2 border border-emerald-100">
                      <p className="text-gray-500 font-medium">Design</p>
                      <p className="font-extrabold text-emerald-900 text-sm">
                        {selectedProject.evaluation.criteriaScores.design}/10
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-2 border border-emerald-100">
                      <p className="text-gray-500 font-medium">Impact</p>
                      <p className="font-extrabold text-emerald-900 text-sm">
                        {selectedProject.evaluation.criteriaScores.impact}/10
                      </p>
                    </div>
                  </div>

                  {selectedProject.evaluation.feedback && (
                    <div className="mt-3 rounded-xl bg-white p-3 border border-emerald-100">
                      <p className="text-[11px] font-bold text-gray-500 mb-1">
                        Feedback from {selectedProject.evaluation.judgeName || "Judges Panel"}:
                      </p>
                      <p className="text-xs text-gray-800 italic">
                        "{selectedProject.evaluation.feedback}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-3 pt-2">
                {selectedProject.repoUrl && (
                  <a
                    href={selectedProject.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#d6e7e1] bg-white px-3.5 py-2 font-bold text-[#122622] hover:bg-[#e8f3f0] transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-[#0f6b5c]" />
                    <span>Source Code</span>
                  </a>
                )}
                {selectedProject.demoUrl && (
                  <a
                    href={selectedProject.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#d6e7e1] bg-white px-3.5 py-2 font-bold text-[#122622] hover:bg-[#e8f3f0] transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5 text-[#0f6b5c]" />
                    <span>Live Demo</span>
                  </a>
                )}
                {selectedProject.videoUrl && (
                  <a
                    href={selectedProject.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#d6e7e1] bg-white px-3.5 py-2 font-bold text-[#122622] hover:bg-[#e8f3f0] transition-colors"
                  >
                    <Video className="h-3.5 w-3.5 text-[#0f6b5c]" />
                    <span>Video Pitch</span>
                  </a>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => setSelectedProject(null)}
                className="rounded-xl border border-[#d6e7e1] px-4 py-2 font-bold text-[#57685f] hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <Link
                href={`/submissions?hackathonId=${selectedProject.hackathonId}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b5c] px-5 py-2 font-extrabold text-white shadow-xs hover:bg-[#0b5347] transition-all"
              >
                <span>Edit Submission</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
