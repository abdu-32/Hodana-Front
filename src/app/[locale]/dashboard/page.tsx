"use client";

import { useState, useEffect } from "react";
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
  Award,
  ChevronRight,
  ExternalLink,
  Plus,
  Clock,
  Sparkles,
  Search,
  Filter,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { Logomark } from "@/components/ui/Logomark";
import { announcementsClient, type Announcement } from "@/features/announcements/lib/announcements-client";

export default function ParticipantDashboardPage() {
  const t = useTranslations("Dashboard");
  const { user } = useSession();

  const userName = user?.fullName || "Abebe Kebede";
  const firstName = userName.split(" ")[0];
  const userTitle = "Lead Developer";
  const userInitial = firstName.charAt(0).toUpperCase();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [participantAnnouncements, setParticipantAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    async function loadNotifs() {
      const data = await announcementsClient.getParticipantAnnouncements("hck-agritech");
      setParticipantAnnouncements(data);
    }
    loadNotifs();
  }, []);

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
            {/* Brand Logo & Portal Tag (Click to Toggle Sidebar) */}
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
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
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
              </button>

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
                title={isSidebarCollapsed ? t("navMyProjects") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <FolderGit2 className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navMyProjects")}</span>}
              </Link>

              <Link
                href="/submissions"
                title={isSidebarCollapsed ? t("navSubmissions") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <UploadCloud className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navSubmissions")}</span>}
              </Link>

              <Link
                href="/dashboard/portfolio"
                title={isSidebarCollapsed ? t("navPortfolio") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Briefcase className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navPortfolio")}</span>}
              </Link>
            </nav>
          </div>

          {/* Sidebar Bottom CTA & User Footer */}
          <div className="flex flex-col gap-5 border-t border-[#d6e7e1] pt-5">
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
                    {userTitle}
                  </p>
                </div>
              )}
            </Link>
          </div>
        </aside>

        {/* ================= MAIN DASHBOARD CONTENT ================= */}
        <main className="flex min-w-0 flex-1 flex-col p-4 sm:p-6 lg:p-8 transition-all duration-300">
          {/* Welcome Header Bar */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-8 border-b border-[#d6e7e1]">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#122622]">
                {t("welcomeTitle", { name: firstName })}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#57685f] font-normal">
                {t("welcomeSubtitle")}
              </p>
            </div>

            {/* Header Right Action Icons */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen((prev) => !prev)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#d6e7e1] text-[#57685f] shadow-2xs hover:bg-[#e8f3f0] hover:text-[#0f6b5c] transition-all cursor-pointer"
                  aria-label="Notifications"
                  title="Notifications & Announcements"
                >
                  <Bell className="h-4 w-4" />
                  {participantAnnouncements.length > 0 && (
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-3xl border border-[#d6e7e1] bg-white p-4 shadow-2xl z-50 animate-in fade-in-50">
                    <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-3 mb-3">
                      <h4 className="font-display text-sm font-extrabold text-[#122622]">
                        Announcements & Alerts
                      </h4>
                      <span className="rounded-full bg-[#e8f3f0] px-2 py-0.5 text-[10px] font-extrabold text-[#0f6b5c]">
                        {participantAnnouncements.length} New
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto">
                      {participantAnnouncements.length === 0 ? (
                        <p className="py-6 text-center text-xs text-gray-500">
                          No recent announcements for your active hackathons.
                        </p>
                      ) : (
                        participantAnnouncements.map((item) => (
                          <div
                            key={item.id}
                            className={`rounded-2xl border p-3 text-xs transition-colors ${
                              item.priority === "URGENT"
                                ? "border-red-200 bg-red-50/40 text-red-900"
                                : item.priority === "IMPORTANT"
                                ? "border-amber-200 bg-amber-50/40 text-amber-900"
                                : "border-[#d6e7e1] bg-[#f3f6f4] text-[#122622]"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-extrabold text-[11px]">
                                {item.title}
                              </span>
                              <span className="text-[9px] font-bold opacity-75">
                                {item.priority}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#57685f] line-clamp-2">
                              {item.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

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

          {/* Grid Layout Rows */}
          <div className="flex flex-col gap-8 pt-8">
            {/* ROW 1: Featured Hackathons & My Teams */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Featured Hackathons Card */}
              <div className="flex flex-col gap-5 rounded-2xl border border-[#d6e7e1] bg-white p-6 shadow-xs lg:col-span-7">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#0f6b5c]" />
                    <h3 className="font-display text-lg font-bold text-[#122622]">
                      {t("featuredHackathons")}
                    </h3>
                  </div>
                  <Link
                    href="/hackathons"
                    className="text-xs font-bold text-[#0f6b5c] hover:underline"
                  >
                    {t("viewAll")}
                  </Link>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-[#d6e7e1] bg-[#f3f6f4] p-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#0f6b5c] text-white shadow-xs">
                    <Logomark className="h-10 w-10 object-contain text-white" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 text-center sm:text-left">
                    <h4 className="text-sm font-bold text-[#122622]">
                      Ethio-Green Tech Challenge
                    </h4>
                    <p className="text-xs text-[#57685f] font-medium">
                      Feb 24 - Feb 26, 2024 • Addis Ababa
                    </p>
                  </div>
                  <Link
                    href="/hackathons"
                    className="inline-flex min-h-[38px] items-center justify-center rounded-xl bg-[#0f6b5c] px-5 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-all"
                  >
                    Register
                  </Link>
                </div>
              </div>

              {/* My Teams Card */}
              <div className="flex flex-col gap-4 rounded-2xl border border-[#d6e7e1] bg-white p-6 shadow-xs lg:col-span-5">
                <div className="flex items-center gap-2 text-[#0f6b5c]">
                  <Users className="h-5 w-5" />
                  <h3 className="font-display text-lg font-bold text-[#122622]">
                    {t("myTeams")}
                  </h3>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    href="/dashboard/registrations"
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#FAFAFE] p-3.5 hover:border-[#d6e7e1] hover:bg-[#e8f3f0]/50 transition-all group"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#122622] group-hover:text-[#0f6b5c]">
                        Team Tech-Flow
                      </p>
                      <p className="text-[11px] text-[#57685f] font-medium mt-0.5">
                        {t("activeMembers", { count: 3 })}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#57685f] group-hover:text-[#0f6b5c]" />
                  </Link>

                  <Link
                    href="/dashboard/registrations"
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#FAFAFE] p-3.5 hover:border-[#d6e7e1] hover:bg-[#e8f3f0]/50 transition-all group"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#122622] group-hover:text-[#0f6b5c]">
                        Solar Solutions
                      </p>
                      <p className="text-[11px] text-[#57685f] font-medium mt-0.5">
                        {t("activeMembers", { count: 3 })}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#57685f] group-hover:text-[#0f6b5c]" />
                  </Link>
                </div>
              </div>
            </div>

            {/* ROW 2: Upcoming Deadlines, Badges, Registered Events */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Upcoming Deadlines Card */}
              <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#d6e7e1] bg-white p-6 shadow-xs">
                <div>
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#57685f]">
                    {t("upcomingDeadlines")}
                  </h4>
                  <div className="mt-4 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center rounded-xl bg-red-50 px-3 py-1.5 border border-red-100 text-center">
                        <span className="text-sm font-extrabold text-red-600">24</span>
                        <span className="text-[9px] font-bold uppercase text-red-500">JAN</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#122622]">
                          Prototype Submission
                        </p>
                        <p className="text-[11px] text-[#57685f]">
                          Submission Portal
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center rounded-xl bg-[#e8f3f0] px-3 py-1.5 border border-[#d6e7e1] text-center">
                        <span className="text-sm font-extrabold text-[#0f6b5c]">02</span>
                        <span className="text-[9px] font-bold uppercase text-[#0f6b5c]">FEB</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#122622]">
                          Final Pitch Deck
                        </p>
                        <p className="text-[11px] text-[#57685f]">
                          AgriTech Hub
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievement Badges Card */}
              <div className="relative overflow-hidden flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#0f6b5c] to-[#0e2b25] p-6 text-white shadow-md">
                <div>
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-200/90">
                    {t("achievementBadges")}
                  </h4>
                  <div className="mt-8 flex items-center gap-3">
                    <Award className="h-10 w-10 text-[#c68a00]" />
                    <div>
                      <p className="text-sm font-extrabold text-white">
                        {t("innovatorLevel")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-6 -bottom-6 opacity-20">
                  <Award className="h-32 w-32 text-emerald-200" />
                </div>
              </div>

              {/* Registered Events Card */}
              <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#d6e7e1] bg-white p-6 shadow-xs sm:col-span-2 lg:col-span-1">
                <div>
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#57685f]">
                    {t("registeredEvents")}
                  </h4>
                  <div className="mt-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#0f6b5c]" />
                        <span className="font-bold text-[#122622]">Smart City Addis</span>
                      </div>
                      <span className="text-[11px] font-medium text-[#57685f]">
                        {t("startsIn", { time: "3d" })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="font-bold text-[#122622]">National Innovation Summit</span>
                      </div>
                      <span className="text-[11px] font-medium text-emerald-600">
                        {t("attended")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 3: Project Tracking & Status Table */}
            <div className="flex flex-col gap-6 rounded-2xl border border-[#d6e7e1] bg-white p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-[#0f6b5c]" />
                  <h3 className="font-display text-lg font-bold text-[#122622]">
                    {t("projectTracking")}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-[#e8f3f0] px-3 py-1 text-[#0f6b5c]">
                    {t("active")}: 2
                  </span>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                    {t("underReview")}: 1
                  </span>
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
                    {/* Row 1 */}
                    <tr className="hover:bg-[#FAFAFE] transition-colors">
                      <td className="py-4 px-4 font-bold text-[#122622]">
                        Agri-Optimism App
                      </td>
                      <td className="py-4 px-4 font-medium text-[#57685f]">
                        Sustainable Agri-Fin
                      </td>
                      <td className="py-4 px-4 font-medium text-[#57685f]">
                        Dec 20, 2023
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex rounded-full bg-[#e8f3f0] px-3 py-1 text-[11px] font-bold text-[#0f6b5c]">
                          Finalist
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          href="/dashboard/registrations"
                          className="font-bold text-[#0f6b5c] hover:underline"
                        >
                          {t("manageTeam")}
                        </Link>
                      </td>
                    </tr>

                    {/* Row 2 */}
                    <tr className="hover:bg-[#FAFAFE] transition-colors">
                      <td className="py-4 px-4 font-bold text-[#122622]">
                        EcoCharge IoT
                      </td>
                      <td className="py-4 px-4 font-medium text-[#57685f]">
                        Ethio-Green Tech Challenge
                      </td>
                      <td className="py-4 px-4 font-medium text-[#57685f]">
                        Jan 15, 2024
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
                          Under Review
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          href="/dashboard/registrations"
                          className="font-bold text-[#0f6b5c] hover:underline"
                        >
                          {t("viewDetails")}
                        </Link>
                      </td>
                    </tr>

                    {/* Row 3 */}
                    <tr className="hover:bg-[#FAFAFE] transition-colors">
                      <td className="py-4 px-4 font-bold text-[#122622]">
                        HealthFlow AI
                      </td>
                      <td className="py-4 px-4 font-medium text-[#57685f]">
                        Ethio-Health AI Challenge
                      </td>
                      <td className="py-4 px-4 font-medium text-[#57685f]">
                        Feb 01, 2024
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-[#16793d]">
                          Accepted
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          href="/dashboard/registrations"
                          className="font-bold text-[#0f6b5c] hover:underline"
                        >
                          {t("viewDetails")}
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
