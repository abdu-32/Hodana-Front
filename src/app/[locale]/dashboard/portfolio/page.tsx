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
  Download,
  Mail,
  Globe,
  Code,
  Trophy,
  Award,
  Zap,
  ExternalLink,
  GitBranch,
  FileText,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { Logomark } from "@/components/ui/Logomark";

export default function PortfolioPage() {
  const t = useTranslations("Portfolio");
  const tDash = useTranslations("Dashboard");
  const { user } = useSession();

  const userName = user?.fullName || "Alex Rivera";
  const firstName = userName.split(" ")[0];
  const userTitle = "Senior Full-Stack Architect & Product Innovator";
  const userInitial = firstName.charAt(0).toUpperCase();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
                className={`flex items-center gap-3 rounded-xl py-3 transition-all ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } bg-[#0f6b5c] text-white shadow-md font-bold`}
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
          <div className="flex flex-col gap-6">
            {/* Profile Header Card */}
            <div className="relative flex flex-col justify-between gap-6 rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-sm lg:flex-row lg:items-center">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                {/* Profile Photo & Status Indicator */}
                <div className="relative">
                  <span className="flex h-24 w-24 overflow-hidden rounded-full bg-[#e8f3f0] p-1 shadow-md">
                    <img
                      src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                      alt={userName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </span>
                  <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#0f6b5c] text-white ring-4 ring-white">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                </div>

                {/* Name, Handle, Bio & Links */}
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#122622]">
                      {userName}
                    </h1>
                    <span className="text-xs font-semibold text-[#0f6b5c]">
                      @arivera_dev
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#57685f]">
                    Senior Full-Stack Architect & Product Innovator focused on building sovereign digital infrastructure and high-performance user interfaces for the next generation of institutional platforms.
                  </p>

                  {/* Social Media Links */}
                  <div className="mt-3 flex items-center gap-2 text-gray-400">
                    <a
                      href="#"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-[#e8f3f0] hover:text-[#0f6b5c] transition-colors"
                      aria-label="Website"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                    <a
                      href="#"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-[#e8f3f0] hover:text-[#0f6b5c] transition-colors"
                      aria-label="Code repository"
                    >
                      <Code className="h-4 w-4" />
                    </a>
                    <a
                      href="#"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-[#e8f3f0] hover:text-[#0f6b5c] transition-colors"
                      aria-label="Email"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Top Right) */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>{t("downloadCv")}</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-2xl border border-[#d6e7e1] bg-white px-5 py-2.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#e8f3f0] transition-all cursor-pointer"
                >
                  <Mail className="h-4 w-4" />
                  <span>{t("sendMessage")}</span>
                </button>
              </div>
            </div>

            {/* Metrics Row (3 Cards Grid) */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Card 1 */}
              <div className="flex items-center gap-4 rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-2xs">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c]">
                  <Trophy className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-[#57685f]">
                    {t("hackathonsWon")}
                  </p>
                  <h3 className="font-display text-2xl font-extrabold text-[#122622]">
                    12
                  </h3>
                </div>
              </div>

              {/* Card 2 */}
              <div className="flex items-center gap-4 rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-2xs">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c]">
                  <Rocket className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-[#57685f]">
                    {t("liveProjects")}
                  </p>
                  <h3 className="font-display text-2xl font-extrabold text-[#122622]">
                    28
                  </h3>
                </div>
              </div>

              {/* Card 3 */}
              <div className="flex items-center gap-4 rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-2xs">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <Users className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-[#57685f]">
                    {t("collaborators")}
                  </p>
                  <h3 className="font-display text-2xl font-extrabold text-[#122622]">
                    140+
                  </h3>
                </div>
              </div>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Column (4 cols): Technical Proficiency + Achievement Badges */}
              <div className="flex flex-col gap-6 lg:col-span-4">
                {/* Technical Proficiency Card */}
                <div className="flex flex-col gap-4 rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-[#0f6b5c]" />
                    <h2 className="font-display text-base font-bold text-[#122622]">
                      {t("technicalProficiency")}
                    </h2>
                  </div>

                  <div className="flex flex-col gap-3.5 pt-2">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#57685f]">Frontend (React/Next.js)</span>
                        <span className="text-[#0f6b5c] font-bold">95%</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#e8f3f0]">
                        <div className="h-full rounded-full bg-[#0f6b5c]" style={{ width: "95%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#57685f]">Backend (Go/Rust/Node)</span>
                        <span className="text-[#0f6b5c] font-bold">88%</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#e8f3f0]">
                        <div className="h-full rounded-full bg-[#0f6b5c]" style={{ width: "88%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#57685f]">UI/UX & Prototyping</span>
                        <span className="text-[#0f6b5c] font-bold">92%</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#e8f3f0]">
                        <div className="h-full rounded-full bg-[#0f6b5c]" style={{ width: "92%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#57685f]">Web3/Blockchain</span>
                        <span className="text-[#0f6b5c] font-bold">75%</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#e8f3f0]">
                        <div className="h-full rounded-full bg-[#0f6b5c]" style={{ width: "75%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievement Badges Card */}
                <div className="flex flex-col gap-4 rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#0f6b5c]" />
                    <h2 className="font-display text-base font-bold text-[#122622]">
                      {t("achievementBadges")}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {/* Badge 1 */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-[#FAFAFE] p-4 text-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <Trophy className="h-5 w-5" />
                      </span>
                      <p className="mt-2 text-xs font-extrabold text-[#122622]">
                        Global Winner
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#57685f]">
                        TechNexus 2024
                      </p>
                    </div>

                    {/* Badge 2 */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-[#FAFAFE] p-4 text-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f3f0] text-[#0f6b5c]">
                        <Award className="h-5 w-5" />
                      </span>
                      <p className="mt-2 text-xs font-extrabold text-[#122622]">
                        Best UI/UX
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#57685f]">
                        Design Conf 2023
                      </p>
                    </div>

                    {/* Badge 3 */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-[#FAFAFE] p-4 text-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-[#c68a00]">
                        <Zap className="h-5 w-5" />
                      </span>
                      <p className="mt-2 text-xs font-extrabold text-[#122622]">
                        Rapid Dev
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#57685f]">
                        HackFlow Elite
                      </p>
                    </div>

                    {/* Badge 4 */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-[#FAFAFE] p-4 text-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-[#16793d]">
                        <Globe className="h-5 w-5" />
                      </span>
                      <p className="mt-2 text-xs font-extrabold text-[#122622]">
                        Community Choice
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#57685f]">
                        OpenSource 2023
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (8 cols): Featured Projects + Professional Journey */}
              <div className="flex flex-col gap-6 lg:col-span-8">
                {/* Featured Projects Card Grid */}
                <div>
                  <div className="flex items-center justify-between pb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#0f6b5c]" />
                      <h2 className="font-display text-lg font-bold text-[#122622]">
                        {t("featuredProjects")}
                      </h2>
                    </div>
                    <Link
                      href="/dashboard/projects"
                      className="text-xs font-bold text-[#0f6b5c] hover:underline"
                    >
                      {t("viewAll")}
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Featured Card 1 */}
                    <div className="flex flex-col overflow-hidden rounded-3xl border border-[#d6e7e1] bg-white shadow-sm">
                      <div className="relative h-44 w-full overflow-hidden bg-gray-900">
                        <img
                          src="/project_preview_dashboard.png"
                          alt="Sovereign Financial UI"
                          className="h-full w-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
                        />
                        <span className="absolute top-3 left-3 rounded-full bg-[#c68a00] px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                          🏆 1ST PLACE
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-display text-base font-bold text-[#122622]">
                              Sovereign Financial UI
                            </h3>
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <ExternalLink className="h-3.5 w-3.5 hover:text-[#0f6b5c] cursor-pointer" />
                              <Code className="h-3.5 w-3.5 hover:text-[#0f6b5c] cursor-pointer" />
                            </div>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-[#57685f]">
                            A decentralized asset management portal for institutional investors featuring real-time risk analysis.
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-1.5">
                          <span className="rounded-md bg-[#e8f3f0] px-2 py-0.5 text-[10px] font-bold text-[#0f6b5c]">
                            Next.js
                          </span>
                          <span className="rounded-md bg-[#e8f3f0] px-2 py-0.5 text-[10px] font-bold text-[#0f6b5c]">
                            Three.js
                          </span>
                          <span className="rounded-md bg-[#e8f3f0] px-2 py-0.5 text-[10px] font-bold text-[#0f6b5c]">
                            Tailwind
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Featured Card 2 */}
                    <div className="flex flex-col overflow-hidden rounded-3xl border border-[#d6e7e1] bg-white shadow-sm">
                      <div className="relative h-44 w-full overflow-hidden bg-gray-900">
                        <img
                          src="/futuristic_city_banner.png"
                          alt="Nexus Core Engine"
                          className="h-full w-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
                        />
                        <span className="absolute top-3 left-3 rounded-full bg-[#0f6b5c] px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                          💎 BEST UI
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-display text-base font-bold text-[#122622]">
                              Nexus Core Engine
                            </h3>
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <ExternalLink className="h-3.5 w-3.5 hover:text-[#0f6b5c] cursor-pointer" />
                              <Code className="h-3.5 w-3.5 hover:text-[#0f6b5c] cursor-pointer" />
                            </div>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-[#57685f]">
                            Sub-millisecond latency messaging queue built with Rust for distributed enterprise systems.
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-1.5">
                          <span className="rounded-md bg-[#e8f3f0] px-2 py-0.5 text-[10px] font-bold text-[#0f6b5c]">
                            Rust
                          </span>
                          <span className="rounded-md bg-[#e8f3f0] px-2 py-0.5 text-[10px] font-bold text-[#0f6b5c]">
                            gRPC
                          </span>
                          <span className="rounded-md bg-[#e8f3f0] px-2 py-0.5 text-[10px] font-bold text-[#0f6b5c]">
                            Kubernetes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Journey Timeline Card */}
                <div className="flex flex-col gap-5 rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#0f6b5c]" />
                    <h2 className="font-display text-lg font-bold text-[#122622]">
                      {t("professionalJourney")}
                    </h2>
                  </div>

                  <div className="relative pl-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#d6e7e1]">
                    {/* Item 1 */}
                    <div className="relative pb-6">
                      <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-[#0f6b5c] ring-4 ring-white" />
                      <div>
                        <h3 className="text-sm font-bold text-[#122622]">
                          Senior Product Architect
                        </h3>
                        <p className="mt-0.5 text-xs font-semibold text-[#0f6b5c]">
                          Horizon Systems • 2022 - Present
                        </p>
                        <p className="mt-1.5 text-xs text-[#57685f]">
                          Leading the migration of legacy banking infrastructure to modern, reactive micro-frontends.
                        </p>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="relative pb-6">
                      <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-[#0f6b5c] ring-4 ring-white" />
                      <div>
                        <h3 className="text-sm font-bold text-[#122622]">
                          Full Stack Lead
                        </h3>
                        <p className="mt-0.5 text-xs font-semibold text-[#0f6b5c]">
                          InnovaSoft Studio • 2020 - 2022
                        </p>
                        <p className="mt-1.5 text-xs text-[#57685f]">
                          Spearheaded the development of 15+ high-traffic applications for government contractors.
                        </p>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="relative">
                      <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-emerald-300 ring-4 ring-white" />
                      <div>
                        <h3 className="text-sm font-bold text-[#122622]">
                          Junior UI Developer
                        </h3>
                        <p className="mt-0.5 text-xs font-semibold text-[#0f6b5c]">
                          Nexus Labs • 2018 - 2020
                        </p>
                        <p className="mt-1.5 text-xs text-[#57685f]">
                          Focused on implementing design systems and maintaining reusable component libraries.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Activity Feed Box */}
            <div className="flex flex-col gap-4 rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-2">
                <GitBranch className="h-4 w-4 text-[#0f6b5c]" />
                <h2 className="font-display text-lg font-bold text-[#122622]">
                  {t("recentActivity")}
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-extrabold uppercase text-[#57685f]">
                      <th className="pb-3 pr-4">Action</th>
                      <th className="pb-3 pr-4">Platform</th>
                      <th className="pb-3 pr-4">Subject</th>
                      <th className="pb-3 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[#57685f]">
                    <tr>
                      <td className="py-3.5 pr-4 font-bold text-[#122622]">
                        <span className="inline-flex items-center gap-2">
                          <Code className="h-3.5 w-3.5 text-[#0f6b5c]" />
                          Pushed Code
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-semibold">GitHub</td>
                      <td className="py-3.5 pr-4 text-[#57685f]">
                        refactor: optimized rendering engine in 'ui-core'
                      </td>
                      <td className="py-3.5 text-right font-medium text-gray-400">
                        2h ago
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 pr-4 font-bold text-[#122622]">
                        <span className="inline-flex items-center gap-2">
                          <Trophy className="h-3.5 w-3.5 text-amber-700" />
                          Awarded
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-semibold">TechNexus</td>
                      <td className="py-3.5 pr-4 text-[#57685f]">
                        Top 1% Innovator Badge - Q1 2024
                      </td>
                      <td className="py-3.5 text-right font-medium text-gray-400">
                        1d ago
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 pr-4 font-bold text-[#122622]">
                        <span className="inline-flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-[#0f6b5c]" />
                          Article
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-semibold">Medium</td>
                      <td className="py-3.5 pr-4 text-[#57685f]">
                        Published: "The Future of Institutional Design Systems"
                      </td>
                      <td className="py-3.5 text-right font-medium text-gray-400">
                        3d ago
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sub-page Footer */}
            <footer className="mt-8 border-t border-[#d6e7e1] pt-8 pb-4 text-center text-xs text-[#57685f]">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div>
                  <h4 className="font-display font-bold text-[#0f6b5c]">
                    HODANA Innovation Hub
                  </h4>
                  <p className="mt-0.5 text-[11px]">
                    Built with precision for the sovereign digital era.
                  </p>
                </div>

                <div className="flex items-center gap-4 font-semibold text-[#57685f]">
                  <a href="#" className="hover:text-[#0f6b5c]">Privacy Policy</a>
                  <a href="#" className="hover:text-[#0f6b5c]">Terms of Service</a>
                  <a href="#" className="hover:text-[#0f6b5c]">Support</a>
                </div>
              </div>

              <p className="mt-6 text-[11px] text-gray-400">
                © 2024 Innovation Hub Ecosystem. All rights reserved.
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
