"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FolderGit2,
  Layers,
  User,
  Rocket,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { Logomark } from "@/components/ui/Logomark";
import { MyRegistrationsList } from "@/features/registrations";
import { PortalMobileNav } from "@/components/layout/PortalMobileNav";

export default function MyRegistrationsPage() {
  const t = useTranslations("Registrations");
  const tDash = useTranslations("Dashboard");
  const { user, isAuthenticated, isLoading: isSessionLoading } = useSession();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const userName = user?.fullName || "Abebe Bekele";

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#122622] font-sans antialiased">
      {/* Mobile Sticky Navigation Bar & Slide-Out Drawer */}
      <PortalMobileNav portalType="participant" activeItem="registrations" title="Registrations" />

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
                title={isSidebarCollapsed ? tDash("navMyProjects") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <FolderGit2 className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{tDash("navMyProjects")}</span>}
              </Link>

              {/* Registrations (Active) */}
              <Link
                href="/dashboard/registrations"
                title={isSidebarCollapsed ? tDash("navRegistrations") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 transition-all bg-[#0f6b5c] text-white shadow-md font-bold ${
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
                {userName[0]?.toUpperCase() || "U"}
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
          {/* Top Header Card */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl bg-white p-6 sm:p-7 border border-[#d6e7e1] shadow-xs">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#0f6b5c]">
                <Layers className="h-4 w-4" />
                <span>PARTICIPANT WORKSPACE</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#122622]">
                {t("myRegistrationsHeading")}
              </h1>
              <p className="text-xs font-medium text-[#57685f]">
                {t("myRegistrationsIntro")}
              </p>
            </div>

            <Link
              href="/hackathons"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#0b5347] transition-all self-start sm:self-auto"
            >
              <Calendar className="h-4 w-4" />
              <span>Explore More Events</span>
            </Link>
          </div>

          {/* Registrations List View */}
          {isSessionLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-3xl bg-white p-8 border border-[#d6e7e1]">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#0f6b5c] border-t-transparent" />
              <p className="text-xs font-bold text-[#57685f]">Loading registrations...</p>
            </div>
          ) : !isAuthenticated ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center gap-4 rounded-3xl bg-white p-8 text-center border border-[#d6e7e1] shadow-xs">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c]">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div className="flex flex-col gap-1 max-w-sm">
                <h3 className="text-base font-extrabold text-[#122622]">
                  Authentication Required
                </h3>
                <p className="text-xs font-medium text-[#57685f]">
                  Please log in to view and manage your hackathon registrations and team squad statuses.
                </p>
              </div>
              <Link
                href="/login?redirect=/dashboard/registrations"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#0b5347] transition-all"
              >
                <span>Log In</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="w-full">
              <MyRegistrationsList />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
