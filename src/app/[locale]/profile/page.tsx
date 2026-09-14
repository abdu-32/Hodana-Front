"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FolderGit2,
  User,
  Bell,
  Rocket,
  Download,
  Layers,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { Logomark } from "@/components/ui/Logomark";
import { ParticipantProfileView } from "@/features/profile";
import { PortalMobileNav } from "@/components/layout/PortalMobileNav";

export default function ProfilePage() {
  const tDash = useTranslations("Dashboard");
  const { user } = useSession();

  const userName = user?.fullName || "Alex Rivera";
  const firstName = userName.split(" ")[0];
  const userInitial = firstName.charAt(0).toUpperCase();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#122622]">
      {/* Mobile Sticky Navigation Bar & Slide-Out Drawer */}
      <PortalMobileNav portalType="participant" activeItem="profile" title="Profile" />

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

              {/* Profile Item (Active) */}
              <Link
                href="/profile"
                title={isSidebarCollapsed ? tDash("navProfile") : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 font-bold bg-[#0f6b5c] text-white shadow-xs ${
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
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0f6b5c] text-xs font-bold text-white shadow-xs">
                {userInitial}
              </span>
              <div
                className={`flex flex-col overflow-hidden text-left transition-all duration-300 ease-in-out ${
                  isSidebarCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-xs opacity-100"
                }`}
              >
                <span className="truncate text-xs font-bold text-[#122622]">
                  {userName}
                </span>
                <span className="truncate text-[11px] font-medium text-[#57685f]">
                  Participant Profile
                </span>
              </div>
            </Link>
          </div>
        </aside>

        {/* ================= MAIN CONTENT AREA ================= */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 overflow-y-auto">
          <ParticipantProfileView />
        </main>
      </div>
    </div>
  );
}
