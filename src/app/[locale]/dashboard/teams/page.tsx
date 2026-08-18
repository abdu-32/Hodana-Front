"use client";

import { useState } from "react";
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
  Cloud,
  Leaf,
  Shield,
  Pencil,
  LogOut,
  Plus,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { Logomark } from "@/components/ui/Logomark";

export default function MyTeamsPage() {
  const t = useTranslations("Teams");
  const tDash = useTranslations("Dashboard");
  const { user } = useSession();

  const userName = user?.fullName || "Abebe Kebede";
  const firstName = userName.split(" ")[0];
  const userTitle = "Lead Developer";
  const userInitial = firstName.charAt(0).toUpperCase();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("teams");
  const [filterMode, setFilterMode] = useState<"active" | "past">("active");

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
          {/* Top Bar with Search & Action Controls */}
          <div className="flex items-center justify-between gap-4 pb-6">
            {/* Search Input Bar */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white pl-10 pr-4 text-xs font-medium text-[#122622] shadow-2xs outline-none placeholder:text-gray-400 focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#0f6b5c]/20"
              />
            </div>

            {/* Right Action Icons */}
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

            {/* Active / Past Toggle Button Group */}
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

          {/* Cards Layout Container */}
          <div className="flex flex-col gap-6">
            {/* Top Row: Featured Active Team Card + Formation Card */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Featured Active Team Card (Large - 8 columns) */}
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
                        {t("inProgress")}
                      </span>
                    </div>

                    {/* Team Title & Hackathon Tag */}
                    <div>
                      <h2 className="font-display text-2xl font-bold tracking-tight text-[#122622]">
                        Skyline AI Architects
                      </h2>
                      <p className="mt-1 text-xs font-medium text-[#57685f]">
                        🏆 Urban Tech Hackathon 2024
                      </p>
                    </div>

                    {/* Members & User Role Metadata */}
                    <div className="flex items-center justify-between border-t border-b border-gray-100 py-4">
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#57685f]">
                          MEMBERS
                        </p>
                        <div className="mt-1.5 flex items-center -space-x-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8f3f0] text-[10px] font-bold text-[#0f6b5c] ring-2 ring-white">
                            AB
                          </span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f6b5c] text-[10px] font-bold text-white ring-2 ring-white">
                            SK
                          </span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-200 text-[10px] font-bold text-emerald-800 ring-2 ring-white">
                            TM
                          </span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8f3f0] text-[10px] font-bold text-[#0f6b5c] ring-2 ring-white">
                            +2
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#57685f]">
                          {t("myRole")}
                        </p>
                        <p className="mt-1 text-xs font-bold text-[#0f6b5c]">
                          Lead Developer
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="rounded-xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-all cursor-pointer"
                    >
                      {t("openTeam")}
                    </button>
                    <button
                      type="button"
                      className="rounded-xl bg-[#e8f3f0] px-5 py-2.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#d6e7e1] transition-all cursor-pointer"
                    >
                      {t("inviteMember")}
                    </button>
                    <button
                      type="button"
                      aria-label="Edit team"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d6e7e1] bg-white text-[#57685f] hover:border-[#0f6b5c] hover:text-[#0f6b5c] transition-all cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Leave team"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-white text-[#c4211c] hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
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

              {/* Formation Team Card (Right Side - 4 columns) */}
              <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-sm lg:col-span-4">
                <div className="flex flex-col gap-4">
                  {/* Icon & Category Tag */}
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                      <Leaf className="h-6 w-6" />
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-600">
                      {t("formation")}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-tight text-[#122622]">
                      GreenPulse Data
                    </h3>
                    <p className="mt-1 text-xs text-[#57685f]">
                      Sustainability Data Visualization...
                    </p>
                  </div>

                  {/* Metadata Pill */}
                  <div className="flex items-center gap-4 rounded-2xl bg-gray-50/80 p-3 text-xs font-semibold text-[#57685f]">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[#0f6b5c]" />
                      3 Members
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-[#0f6b5c]" />
                      Analyst
                    </span>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="rounded-xl bg-[#e8f3f0] py-2.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#d6e7e1] transition-all cursor-pointer text-center"
                  >
                    {t("view")}
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-[#d6e7e1] bg-white py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 transition-all cursor-pointer text-center"
                  >
                    {t("leave")}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Completed Team Card */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-sm lg:col-span-4">
                <div className="flex flex-col gap-4">
                  {/* Icon & Tag */}
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c]">
                      <Shield className="h-6 w-6" />
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-600">
                      {t("completed")}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-tight text-[#122622]">
                      CyberShield Node
                    </h3>
                    <p className="mt-1 text-xs text-[#57685f]">
                      Global Security Summit Capture...
                    </p>
                  </div>

                  {/* Metadata Pill */}
                  <div className="flex items-center gap-4 rounded-2xl bg-gray-50/80 p-3 text-xs font-semibold text-[#57685f]">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[#0f6b5c]" />
                      6 Members
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-[#0f6b5c]" />
                      Frontend
                    </span>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="rounded-xl bg-[#e8f3f0] py-2.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#d6e7e1] transition-all cursor-pointer text-center"
                  >
                    {t("portfolio")}
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-[#d6e7e1] bg-white py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 transition-all cursor-pointer text-center"
                  >
                    {t("archives")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
