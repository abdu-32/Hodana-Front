"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  Users,
  Gavel,
  Trophy,
  BarChart3,
  Megaphone,
  Briefcase,
  Bell,
  Search,
  Download,
  Plus,
  FileText,
  ShieldCheck,
  Check,
  X,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Globe,
  Code,
  Mail,
  Send,
  Rocket,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { Logomark } from "@/components/ui/Logomark";
import { CreateHackathonModal } from "@/features/hackathons";
import { hackathonsClient } from "@/features/hackathons";
import type { Hackathon } from "@/lib/api-types-helpers";

export default function OrganizerDashboardPage() {
  const t = useTranslations("Organizer");
  const { user } = useSession();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedHackathonToEdit, setSelectedHackathonToEdit] = useState<Hackathon | null>(null);
  const [hackathonToDelete, setHackathonToDelete] = useState<Hackathon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [hackathonsList, setHackathonsList] = useState<Hackathon[]>([
    {
      id: "hck-agritech",
      title: "AgriTech Hack 2024",
      slug: "agritech-hack-2024",
      description: "Smart agriculture solutions for sustainable farming.",
      hostOrgId: "org-101",
      bannerUrl: "/futuristic_city_banner.png",
      registrationOpensAt: new Date().toISOString(),
      registrationClosesAt: new Date(Date.now() + 4 * 86400000).toISOString(),
      submissionOpensAt: new Date().toISOString(),
      submissionClosesAt: new Date(Date.now() + 4 * 86400000).toISOString(),
      rules: "Standard rules apply.",
      prizeInfo: "$20,000",
      locationMode: "hybrid",
      eligibilityRules: { maxTeamSize: 5 },
      tags: ["AgriTech", "Active"],
      status: "published" as any,
      showcasePublishedAt: null,
      createdByUserId: "usr-org",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSuspended: false,
    },
    {
      id: "hck-fintech",
      title: "FinTech Frontier",
      slug: "fintech-frontier",
      description: "Micro-payments and digital wallet innovations.",
      hostOrgId: "org-101",
      bannerUrl: "/project_preview_dashboard.png",
      registrationOpensAt: new Date(Date.now() + 5 * 86400000).toISOString(),
      registrationClosesAt: new Date(Date.now() + 20 * 86400000).toISOString(),
      submissionOpensAt: new Date(Date.now() + 10 * 86400000).toISOString(),
      submissionClosesAt: new Date(Date.now() + 25 * 86400000).toISOString(),
      rules: "Standard rules apply.",
      prizeInfo: "$15,000",
      locationMode: "online",
      eligibilityRules: { maxTeamSize: 5 },
      tags: ["FinTech", "Draft"],
      status: "draft" as any,
      showcasePublishedAt: null,
      createdByUserId: "usr-org",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSuspended: false,
    },
  ]);

  useEffect(() => {
    let isMounted = true;
    async function loadEvents() {
      try {
        const res = await hackathonsClient.listHackathons();
        if (isMounted && res.data && res.data.length > 0) {
          setHackathonsList(res.data);
        }
      } catch (err) {
        console.warn("Could not load backend hackathons, fallback to state list:", err);
      }
    }
    loadEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDeleteHackathon = async (id: string) => {
    setIsDeleting(true);
    try {
      await hackathonsClient.deleteHackathon(id);
      setHackathonsList((prev) => prev.filter((h) => h.id !== id && h.slug !== id));
      setHackathonToDelete(null);
    } catch (err) {
      console.error("Failed to delete hackathon:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublishHackathon = async (id: string) => {
    try {
      await hackathonsClient.updateHackathon(id, { status: "published" });
      setHackathonsList((prev) =>
        prev.map((item) =>
          item.id === id || item.slug === id ? { ...item, status: "published" as any } : item
        )
      );
    } catch (err) {
      console.error("Failed to publish hackathon:", err);
      setHackathonsList((prev) =>
        prev.map((item) =>
          item.id === id || item.slug === id ? { ...item, status: "published" as any } : item
        )
      );
    }
  };

  const handleModalSuccess = (saved: Hackathon) => {
    setHackathonsList((prev) => {
      const existsIndex = prev.findIndex((item) => item.id === saved.id || item.slug === saved.slug);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
  };

  const organizerName = user?.fullName || "Abeba Selassie";
  const organizerTitle = "Lead Organizer";
  const userInitial = organizerName.charAt(0).toUpperCase();

  // Verification state demo
  const [verifications, setVerifications] = useState([
    {
      id: 1,
      initials: "KA",
      name: "Kebede Alemu",
      details: "Addis Ababa University • CS Senior",
      color: "bg-[#e8f3f0] text-[#0f6b5c]",
    },
    {
      id: 2,
      initials: "MT",
      name: "Martha Tadesse",
      details: "ASTU • Mechanical Engineering",
      color: "bg-[#e8f3f0] text-[#0f6b5c]",
    },
    {
      id: 3,
      initials: "SD",
      name: "Samuel Desta",
      details: "Freelance Developer • 4yrs Exp",
      color: "bg-amber-100 text-amber-800",
    },
  ]);

  const handleAction = (id: number) => {
    setVerifications((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#122622]">
      <div className="mx-auto flex w-full max-w-[1500px]">
        {/* ================= LEFT SIDEBAR (ORGANIZER CONTEXT) ================= */}
        <aside
          className={`sticky top-0 hidden h-screen flex-col justify-between border-r border-[#d6e7e1] bg-white p-5 lg:flex shadow-2xs transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "w-20 px-3" : "w-64 px-5"
          }`}
        >
          <div className="flex flex-col gap-8">
            {/* Brand Logo & Ecosystem Portal Tag */}
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
                  {t("portalTag")}
                </p>
              </div>
            </button>

            {/* Sidebar Navigation - Organizer Options */}
            <nav className="flex flex-col gap-1 text-xs font-semibold text-[#57685f]">
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                title={isSidebarCollapsed ? t("navOverview") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all cursor-pointer ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } ${
                  activeTab === "dashboard"
                    ? "bg-[#0f6b5c] text-white shadow-md font-bold"
                    : "hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navOverview")}</span>}
              </button>

              <Link
                href="/organizer/hackathons"
                title={isSidebarCollapsed ? t("navHackathons") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Calendar className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navHackathons")}</span>}
              </Link>

              <Link
                href="/organizer/registrations"
                title={isSidebarCollapsed ? t("navRegistrations") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <UserCheck className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navRegistrations")}</span>}
              </Link>

              <Link
                href="/organizer/judges"
                title={isSidebarCollapsed ? t("navJudging") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Gavel className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navJudging")}</span>}
              </Link>

              <Link
                href="/organizer/prizes"
                title={isSidebarCollapsed ? t("navPrizes") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Trophy className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navPrizes")}</span>}
              </Link>

              <Link
                href="/organizer/submissions"
                title={isSidebarCollapsed ? t("navAnalytics") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <FileText className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navAnalytics")}</span>}
              </Link>

              <Link
                href="/organizer/announcements"
                title={isSidebarCollapsed ? t("navAnnouncements") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Megaphone className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navAnnouncements")}</span>}
              </Link>

              <Link
                href="/dashboard/portfolio"
                title={isSidebarCollapsed ? t("navPortfolio") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Briefcase className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navPortfolio")}</span>}
              </Link>
            </nav>
          </div>

          {/* Sidebar Bottom Actions & Profile Footer */}
          <div className="flex flex-col gap-4 border-t border-[#d6e7e1] pt-4">
            <button
              type="button"
              onClick={() => {
                setSelectedHackathonToEdit(null);
                setIsCreateModalOpen(true);
              }}
              title={isSidebarCollapsed ? t("launchProject") : undefined}
              className={`flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#0b5347] cursor-pointer ${
                isSidebarCollapsed ? "px-0" : "px-4"
              }`}
            >
              <Rocket className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("launchProject")}</span>}
            </button>

            <Link
              href="/settings/profile"
              title={isSidebarCollapsed ? organizerName : undefined}
              className={`flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-100 ${
                isSidebarCollapsed ? "justify-center p-1" : ""
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0f6b5c] text-xs font-extrabold text-white shadow-xs">
                {userInitial}
              </span>
              {!isSidebarCollapsed && (
                <div className="flex min-w-0 flex-1 flex-col whitespace-nowrap overflow-hidden">
                  <p className="truncate text-xs font-bold text-[#122622]">
                    {organizerName}
                  </p>
                  <p className="truncate text-[11px] font-medium text-[#57685f]">
                    {organizerTitle}
                  </p>
                </div>
              )}
            </Link>
          </div>
        </aside>

        {/* ================= MAIN DASHBOARD CONTENT ================= */}
        <main className="flex min-w-0 flex-1 flex-col p-4 sm:p-6 lg:p-8 transition-all duration-300">
          {/* Top Bar with Search & Quick Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-8">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search data, participants, events..."
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
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#c4211c] ring-2 ring-white" />
              </button>

              <button
                type="button"
                className="flex items-center gap-2 rounded-2xl bg-[#e8f3f0] px-4 py-2.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#d6e7e1] transition-all cursor-pointer shadow-2xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Data</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedHackathonToEdit(null);
                  setIsCreateModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ New Event</span>
              </button>
            </div>
          </div>

          {/* 4 Metric Summary Cards Row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 pb-8">
            {/* Card 1: Total Participants */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c]">
                  <Users className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-[#e8f3f0] px-2.5 py-0.5 text-[11px] font-extrabold text-[#0f6b5c]">
                  +12%
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#57685f]">
                  Total Participants
                </p>
                <h3 className="font-display text-2xl font-extrabold text-[#122622] mt-1">
                  2,482
                </h3>
              </div>
            </div>

            {/* Card 2: Teams Formed */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c]">
                  <Users className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-[#e8f3f0] px-2.5 py-0.5 text-[11px] font-extrabold text-[#0f6b5c]">
                  +5%
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#57685f]">
                  Teams Formed
                </p>
                <h3 className="font-display text-2xl font-extrabold text-[#122622] mt-1">
                  412
                </h3>
              </div>
            </div>

            {/* Card 3: Submission Counts */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <FileText className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-amber-100/80 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-800">
                  84%
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#57685f]">
                  Submission Counts
                </p>
                <h3 className="font-display text-2xl font-extrabold text-[#122622] mt-1">
                  348
                </h3>
              </div>
            </div>

            {/* Card 4: Verified Applicants */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-[#16793d]">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-[#16793d]">
                  92%
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#57685f]">
                  Verified Applicants
                </p>
                <h3 className="font-display text-2xl font-extrabold text-[#122622] mt-1">
                  1,920
                </h3>
              </div>
            </div>
          </div>

          {/* Analytics & Demographics Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 pb-8">
            {/* Registration Trends Chart Card (8 cols) */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-sm lg:col-span-8">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#122622]">
                    Registration Trends
                  </h3>
                  <p className="text-xs text-[#57685f] mt-0.5">
                    Cumulative applicants over the last 30 days
                  </p>
                </div>
                <select className="rounded-xl border border-[#d6e7e1] bg-[#f3f6f4] px-3 py-1.5 text-xs font-bold text-[#57685f] outline-none cursor-pointer">
                  <option>Last 30 Days</option>
                  <option>Last 60 Days</option>
                  <option>Last 90 Days</option>
                </select>
              </div>

              {/* Bar Chart Visualization */}
              <div className="mt-8 flex h-52 items-end justify-between gap-2 px-2">
                <div className="h-[25%] w-full rounded-t-lg bg-[#d6e7e1]" />
                <div className="h-[30%] w-full rounded-t-lg bg-[#d6e7e1]" />
                <div className="h-[35%] w-full rounded-t-lg bg-[#d6e7e1]" />
                <div className="h-[45%] w-full rounded-t-lg bg-[#b4d8cc]" />
                <div className="h-[52%] w-full rounded-t-lg bg-[#b4d8cc]" />
                <div className="h-[48%] w-full rounded-t-lg bg-[#b4d8cc]" />
                <div className="h-[62%] w-full rounded-t-lg bg-[#0f6b5c]/60" />
                <div className="h-[70%] w-full rounded-t-lg bg-[#0f6b5c]/70" />
                <div className="h-[65%] w-full rounded-t-lg bg-[#0f6b5c]/70" />
                <div className="h-[80%] w-full rounded-t-lg bg-[#0f6b5c]" />
                <div className="h-[76%] w-full rounded-t-lg bg-[#0f6b5c]" />
                <div className="h-[95%] w-full rounded-t-lg bg-[#0f6b5c]" />
              </div>
            </div>

            {/* Demographics Card (4 cols) */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-sm lg:col-span-4">
              <div>
                <h3 className="font-display text-lg font-bold text-[#122622]">
                  Demographics
                </h3>

                {/* Progress Bar Item 1 */}
                <div className="mt-6 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-[#122622]">
                      <GraduationCap className="h-4 w-4 text-[#0f6b5c]" />
                      University Students
                    </span>
                    <span className="font-extrabold text-[#122622]">64%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e8f3f0]">
                    <div className="h-full rounded-full bg-[#0f6b5c]" style={{ width: "64%" }} />
                  </div>
                </div>

                {/* Progress Bar Item 2 */}
                <div className="mt-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-[#122622]">
                      <Briefcase className="h-4 w-4 text-[#0b5347]" />
                      Professionals
                    </span>
                    <span className="font-extrabold text-[#122622]">28%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e8f3f0]">
                    <div className="h-full rounded-full bg-[#0b5347]" style={{ width: "28%" }} />
                  </div>
                </div>

                {/* Progress Bar Item 3 */}
                <div className="mt-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-[#122622]">
                      <Sparkles className="h-4 w-4 text-[#c68a00]" />
                      Independent Creators
                    </span>
                    <span className="font-extrabold text-[#122622]">8%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-amber-50">
                    <div className="h-full rounded-full bg-[#c68a00]" style={{ width: "8%" }} />
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-[#d6e7e1] pt-4 text-center">
                <a
                  href="#"
                  className="text-xs font-bold text-[#0f6b5c] hover:underline"
                >
                  View Detailed Report
                </a>
              </div>
            </div>
          </div>

          {/* Management Action Panels Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 pb-8">
            {/* Pending Verification List (6 cols) */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-sm lg:col-span-6">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#d6e7e1]">
                  <h3 className="font-display text-lg font-bold text-[#122622]">
                    Pending Verification
                  </h3>
                  <a href="#" className="text-xs font-bold text-[#0f6b5c] hover:underline">
                    View All
                  </a>
                </div>

                <div className="mt-4 flex flex-col divide-y divide-[#d6e7e1]">
                  {verifications.length > 0 ? (
                    verifications.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-3.5"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-bold ${item.color}`}
                          >
                            {item.initials}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-[#122622]">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-[#57685f] mt-0.5">
                              {item.details}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAction(item.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#c4211c] hover:bg-red-50 transition-colors cursor-pointer"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction(item.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#16793d] hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-6 text-center text-xs text-[#57685f]">
                      All pending verifications processed!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Active Events Panel (6 cols) */}
            <div className="flex flex-col gap-6 lg:col-span-6">
              <div className="flex flex-col gap-4 rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-[#122622]">
                    Active Events
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHackathonToEdit(null);
                      setIsCreateModalOpen(true);
                    }}
                    className="text-xs font-bold text-[#0f6b5c] hover:underline cursor-pointer"
                  >
                    + Create Event
                  </button>
                </div>

                {hackathonsList.map((hackathon) => {
                  const isPublished =
                    hackathon.status === "published" || hackathon.status === ("active" as any);

                  if (isPublished) {
                    return (
                      <div
                        key={hackathon.id}
                        className="flex flex-col gap-3 rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-4 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-display text-base font-bold text-[#122622]">
                              {hackathon.title}
                            </h4>
                            <p className="text-xs text-[#57685f] mt-0.5">
                              Ends in 14 days
                            </p>
                          </div>
                          <span className="rounded-full bg-[#e8f3f0] px-3 py-1 text-[11px] font-bold text-[#0f6b5c]">
                            Active
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-4">
                          <div className="flex items-center -space-x-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8f3f0] text-[10px] font-bold text-[#0f6b5c] ring-2 ring-white">
                              AG
                            </span>
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f6b5c] text-[10px] font-bold text-white ring-2 ring-white">
                              SK
                            </span>
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d6e7e1] text-[10px] font-bold text-[#0f6b5c] ring-2 ring-white">
                              +1.2k
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedHackathonToEdit(hackathon);
                                setIsCreateModalOpen(true);
                              }}
                              className="text-xs font-bold text-[#57685f] hover:text-[#0f6b5c] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setHackathonToDelete(hackathon)}
                              className="text-xs font-bold text-[#c4211c] hover:text-red-700 cursor-pointer flex items-center gap-1"
                              title="Delete Hackathon"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={hackathon.id}
                      className="flex flex-col gap-3 rounded-2xl border border-[#d6e7e1] bg-white p-4 shadow-2xs transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-display text-base font-bold text-[#122622]">
                            {hackathon.title}
                          </h4>
                          <p className="text-xs text-[#57685f] mt-0.5">
                            Draft • Scheduled
                          </p>
                        </div>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-[#57685f]">
                          Draft
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between border-t border-[#d6e7e1] pt-2">
                        <button
                          type="button"
                          onClick={() => setHackathonToDelete(hackathon)}
                          className="flex items-center gap-1 text-xs font-bold text-[#c4211c] hover:text-red-700 cursor-pointer"
                          title="Delete Hackathon"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedHackathonToEdit(hackathon);
                              setIsCreateModalOpen(true);
                            }}
                            className="text-xs font-bold text-[#57685f] hover:text-[#0f6b5c] cursor-pointer"
                          >
                            Edit Setup
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePublishHackathon(hackathon.id)}
                            className="rounded-xl bg-[#e8f3f0] px-4 py-1.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#d6e7e1] transition-all cursor-pointer"
                          >
                            Publish
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Delete Confirmation Modal Dialog */}
          {hackathonToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
              <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-red-100 text-[#122622]">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#c4211c]">
                    <AlertTriangle className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-red-950">
                      Delete Hackathon?
                    </h3>
                    <p className="text-xs text-[#57685f]">
                      Permanently remove this event.
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-[#57685f]">
                  Are you sure you want to delete <strong className="text-[#122622]">&quot;{hackathonToDelete.title}&quot;</strong>? This action cannot be undone.
                </p>

                <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setHackathonToDelete(null)}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-[#57685f] hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleDeleteHackathon(hackathonToDelete.id)}
                    className="flex items-center gap-1.5 rounded-2xl bg-[#c4211c] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{isDeleting ? "Deleting..." : "Yes, Delete Event"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create / Edit Hackathon Modal */}
          <CreateHackathonModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={handleModalSuccess}
            onDelete={handleDeleteHackathon}
            initialData={selectedHackathonToEdit}
          />

          {/* Sub-page Footer */}
          <footer className="mt-8 rounded-3xl border border-[#d6e7e1] bg-[#e8f3f0]/60 p-8 text-xs text-[#57685f]">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 pb-8 border-b border-[#d6e7e1]">
              {/* Column 1: EthioInnovate Summary */}
              <div>
                <h4 className="font-display text-base font-extrabold text-[#0f6b5c]">
                  EthioInnovate
                </h4>
                <p className="mt-3 text-xs leading-relaxed text-[#57685f]">
                  The national gateway for the Ethiopian innovation ecosystem, empowering students, startups, and investors through structured collaboration.
                </p>
                <div className="mt-4 flex items-center gap-3 text-[#0f6b5c]">
                  <a href="#" className="hover:opacity-80"><Globe className="h-4 w-4" /></a>
                  <a href="#" className="hover:opacity-80"><Code className="h-4 w-4" /></a>
                  <a href="#" className="hover:opacity-80"><Mail className="h-4 w-4" /></a>
                </div>
              </div>

              {/* Column 2: Resources */}
              <div>
                <h5 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#122622]">
                  RESOURCES
                </h5>
                <ul className="mt-3 flex flex-col gap-2.5 text-xs text-[#57685f]">
                  <li><a href="#" className="hover:text-[#0f6b5c]">Government Data</a></li>
                  <li><a href="#" className="hover:text-[#0f6b5c]">Impact Report</a></li>
                  <li><a href="#" className="hover:text-[#0f6b5c]">Media Kit</a></li>
                </ul>
              </div>

              {/* Column 3: Support */}
              <div>
                <h5 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#122622]">
                  SUPPORT
                </h5>
                <ul className="mt-3 flex flex-col gap-2.5 text-xs text-[#57685f]">
                  <li><a href="#" className="hover:text-[#0f6b5c]">Contact Support</a></li>
                  <li><a href="#" className="hover:text-[#0f6b5c]">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-[#0f6b5c]">Privacy Policy</a></li>
                </ul>
              </div>

              {/* Column 4: Newsletter */}
              <div>
                <h5 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#122622]">
                  NEWSLETTER
                </h5>
                <p className="mt-3 text-xs text-[#57685f]">
                  Stay updated with the latest innovation trends.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="Email"
                    className="h-9 w-full rounded-xl border border-[#d6e7e1] bg-white px-3 text-xs outline-none placeholder:text-gray-400 focus:border-[#0f6b5c]"
                  />
                  <button
                    type="button"
                    aria-label="Submit newsletter"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0f6b5c] text-white hover:bg-[#0b5347] transition-all cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-[11px] text-[#57685f]">
              © 2024 Ethiopia Innovation Portal. All rights reserved.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
