"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  Users,
  Gavel,
  Trophy,
  FileText,
  Megaphone,
  Briefcase,
  Search,
  Filter,
  Check,
  X,
  Hourglass,
  Sparkles,
  Award,
  Mail,
  GraduationCap,
  ExternalLink,
  ChevronDown,
  RotateCcw,
  Layers,
  Download,
  Loader2,
  AlertCircle,
  Building,
  MapPin,
  Phone,
  Globe,
  Code,
  ShieldCheck,
  User,
  Rocket,
  Info,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { Logomark } from "@/components/ui/Logomark";
import { downloadHackathonExport } from "@/features/exports";
import { hackathonsClient } from "@/features/hackathons";
import {
  fetchOrganizerRegistrations,
  type OrganizerRegistration,
  type OrganizerRegistrationsStats,
} from "@/features/registrations";
import {
  fetchMyOrganizations,
  getCachedActiveOrganization,
  type MyOrganization,
} from "@/features/organizer-onboarding";
import type { Hackathon } from "@/lib/api-types-helpers";
import { PortalMobileNav } from "@/components/layout/PortalMobileNav";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

interface ManagedHackathonOption {
  id: string;
  title: string;
  slug?: string;
}

export default function OrganizerRegistrationsPage() {
  const t = useTranslations("Organizer");
  const { user } = useSession();

  const [activeOrg, setActiveOrg] = useState<MyOrganization | null>(getCachedActiveOrganization());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [managedHackathons, setManagedHackathons] = useState<ManagedHackathonOption[]>([]);
  const [isHackathonsLoading, setIsHackathonsLoading] = useState(true);

  // Registrations state
  const [registrations, setRegistrations] = useState<OrganizerRegistration[]>([]);
  const [stats, setStats] = useState<OrganizerRegistrationsStats>({
    totalRegistrations: 0,
    registeredCount: 0,
    withdrawnCount: 0,
    uniqueParticipants: 0,
    managedHackathonsCount: 0,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedHackathon, setSelectedHackathon] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // UI state
  const [selectedRegistration, setSelectedRegistration] = useState<OrganizerRegistration | null>(null);
  const [quickAvatarUser, setQuickAvatarUser] = useState<OrganizerRegistration | null>(null);
  const [modalTab, setModalTab] = useState<"profile" | "application">("profile");
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const organizerName = user?.fullName || "Lead Organizer";
  const organizerTitle = activeOrg?.name || (user as any)?.organization || "Innovation Hub";
  const userInitial = organizerName.charAt(0).toUpperCase();

  // Load Organization
  useEffect(() => {
    fetchMyOrganizations()
      .then((orgs) => {
        if (orgs.length > 0) {
          const approved =
            orgs.find(
              (o) =>
                o.verificationStatus === "verified" ||
                (o as any).status?.toUpperCase() === "APPROVED"
            ) || orgs[0];
          setActiveOrg(approved);
        }
      })
      .catch(() => {});
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load Organizer's Managed Hackathons dynamically from real database
  useEffect(() => {
    let isMounted = true;
    async function loadManagedHackathons() {
      setIsHackathonsLoading(true);
      try {
        const res = await hackathonsClient.listHackathons({ managed: true });
        if (isMounted) {
          const list = res.data || [];
          const options: ManagedHackathonOption[] = [
            { id: "All", title: "All Events" },
            ...list.map((h: Hackathon) => ({
              id: h.id,
              title: h.title,
              slug: h.slug,
            })),
          ];
          setManagedHackathons(options);
        }
      } catch (err) {
        console.warn("Could not load managed hackathons:", err);
      } finally {
        if (isMounted) setIsHackathonsLoading(false);
      }
    }
    loadManagedHackathons();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch real registrations from database
  const loadRegistrations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchOrganizerRegistrations({
        hackathonId: selectedHackathon === "All" ? undefined : selectedHackathon,
        status: statusFilter === "All" ? undefined : statusFilter,
        search: debouncedSearch.trim() || undefined,
        limit: 100,
      });
      setRegistrations(res.data || []);
      setStats(
        res.meta?.stats || {
          totalRegistrations: 0,
          registeredCount: 0,
          withdrawnCount: 0,
          uniqueParticipants: 0,
          managedHackathonsCount: 0,
        }
      );
      setTotalCount(res.meta?.total || 0);
    } catch (err: any) {
      console.error("Failed to fetch organizer registrations:", err);
      setError(err?.message || "Failed to load registrations from the database.");
      setRegistrations([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedHackathon, statusFilter, debouncedSearch]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  // Export handler
  const handleExportCurrentView = async () => {
    setIsExporting(true);
    try {
      await downloadHackathonExport({
        hackathonId: selectedHackathon === "All" ? "all" : selectedHackathon,
        resource: "participants",
        format: "xlsx",
        search: debouncedSearch.trim() || undefined,
        status: statusFilter === "All" ? undefined : statusFilter,
      });
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedHackathon("All");
    setStatusFilter("All");
    setSearchQuery("");
  };

  const selectedHackathonTitle = useMemo(() => {
    return (
      managedHackathons.find((h) => h.id === selectedHackathon)?.title ||
      "All Events"
    );
  }, [managedHackathons, selectedHackathon]);

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#122622]">
      {/* Mobile Sticky Navigation Bar & Slide-Out Drawer */}
      <PortalMobileNav portalType="organizer" activeItem="registrations" title="Registrations" />

      <div className="mx-auto flex w-full max-w-[1500px]">
        {/* ================= LEFT SIDEBAR (ORGANIZER CONTEXT) ================= */}
        <aside
          className={`sticky top-0 hidden h-screen flex-col justify-between border-r border-[#d6e7e1] bg-white p-5 lg:flex shadow-2xs transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "w-20 px-3" : "w-64 px-5"
          }`}
        >
          <div className="flex flex-col gap-8">
            {/* Brand Logo & Portal Tag -> Navigates to Hero / Homepage */}
            <Link
              href="/"
              className="flex items-center gap-3 cursor-pointer text-left group focus:outline-none"
              title="Go to Home"
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
                  Organizer Portal
                </p>
              </div>
            </Link>

            {/* Sidebar Navigation */}
            <nav className="flex flex-col gap-1 text-xs font-semibold text-[#57685f]">
              <Link
                href="/organizer/dashboard"
                title={isSidebarCollapsed ? "Dashboard" : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Dashboard</span>}
              </Link>

              <Link
                href="/organizer/hackathons"
                title={isSidebarCollapsed ? "Hackathons" : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Calendar className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Hackathons</span>}
              </Link>

              <Link
                href="/organizer/registrations"
                title={isSidebarCollapsed ? "Registrations" : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } bg-[#0f6b5c] text-white shadow-md font-bold`}
              >
                <UserCheck className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Registrations</span>}
              </Link>

              <Link
                href="/organizer/judges"
                title={isSidebarCollapsed ? "Judging" : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Gavel className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Judging</span>}
              </Link>

              <Link
                href="/organizer/prizes"
                title={isSidebarCollapsed ? "Prizes" : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Trophy className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Prizes</span>}
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
                href="/profile"
                title={isSidebarCollapsed ? "Profile" : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <User className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Profile</span>}
              </Link>
            </nav>
          </div>

          {/* Sidebar Bottom CTA & User Footer */}
          <div className="flex flex-col gap-4 border-t border-[#d6e7e1] pt-4">
            <Link
              href="/organizer/hackathons"
              title={isSidebarCollapsed ? "+ Create Hackathon" : undefined}
              className={`flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#0b5347] ${
                isSidebarCollapsed ? "px-0" : "px-4"
              }`}
            >
              <Rocket className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span className="whitespace-nowrap">+ Create Hackathon</span>}
            </Link>

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

        {/* ================= MAIN CONTENT AREA ================= */}
        <main className="flex min-w-0 flex-1 flex-col p-3 sm:p-6 lg:p-8 transition-all duration-300">
          {/* Top Bar Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#122622]">
                Participant Registrations
              </h1>
              <p className="text-xs text-[#57685f] mt-1">
                Real-time participant applications and profiles across your managed hackathons.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportCurrentView}
              disabled={isExporting || registrations.length === 0}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-[#d6e7e1] bg-white px-4 py-2.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#e8f3f0] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#0f6b5c]" />
              ) : (
                <Download className="h-4 w-4 text-[#0f6b5c]" />
              )}
              <span>Export {selectedHackathon === "All" ? "All Registrations" : "Event Data"}</span>
            </button>
          </div>

          {/* 1. Real Database Header Metrics Cards */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 pb-6 sm:pb-8">
            {/* Metric 1: Total Registrations */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-4 sm:p-5 shadow-2xs transition-all">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c]">
                  <Users className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-[#e8f3f0] px-2.5 py-0.5 text-[11px] font-extrabold text-[#0f6b5c]">
                  Live
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#57685f]">
                  Total Registrations
                </p>
                <h3 className="font-display text-2xl font-extrabold text-[#122622] mt-1">
                  {stats.totalRegistrations.toLocaleString()}
                </h3>
              </div>
            </div>

            {/* Metric 2: Active Participants */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-4 sm:p-5 shadow-2xs transition-all">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-[#16793d]">
                  <Check className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-[#16793d]">
                  Active
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#57685f]">
                  Active / Confirmed
                </p>
                <h3 className="font-display text-2xl font-extrabold text-[#122622] mt-1">
                  {stats.registeredCount.toLocaleString()}
                </h3>
              </div>
            </div>

            {/* Metric 3: Unique Participants */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-4 sm:p-5 shadow-2xs transition-all">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <UserCheck className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-700">
                  Unique
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#57685f]">
                  Unique Participants
                </p>
                <h3 className="font-display text-2xl font-extrabold text-[#122622] mt-1">
                  {stats.uniqueParticipants.toLocaleString()}
                </h3>
              </div>
            </div>

            {/* Metric 4: Withdrawn / Inactive */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-4 sm:p-5 shadow-2xs transition-all">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
                  <Hourglass className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-[#57685f]">
                  Withdrawn
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#57685f]">
                  Withdrawn
                </p>
                <h3 className="font-display text-2xl font-extrabold text-[#122622] mt-1">
                  {stats.withdrawnCount.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>

          {/* 2. Participant Review Table Card */}
          <div className="flex flex-col rounded-3xl border border-[#d6e7e1] bg-white p-4 sm:p-6 shadow-sm">
            {/* Table Controls: Search + Side-by-Side Dual Filters */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-6">
              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, university, organization, role, city..."
                  className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white pl-10 pr-4 text-xs font-medium text-[#122622] shadow-2xs outline-none placeholder:text-gray-400 focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#0f6b5c]/20"
                />
              </div>

              {/* Side-by-Side Custom Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Event Selector (Strictly Organizer's Real Hackathons) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEventDropdownOpen((prev) => !prev);
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-bold shadow-2xs transition-all cursor-pointer ${
                      isEventDropdownOpen || selectedHackathon !== "All"
                        ? "border-[#0f6b5c] bg-[#e8f3f0] text-[#0f6b5c] ring-2 ring-[#0f6b5c]/10"
                        : "border-[#d6e7e1] bg-[#f3f6f4] text-[#122622] hover:bg-white hover:border-[#0f6b5c]"
                    }`}
                  >
                    <Layers className="h-4 w-4 text-[#0f6b5c] shrink-0" />
                    <span className="text-[#57685f] font-semibold">Event:</span>
                    <span className="max-w-[160px] truncate">{selectedHackathonTitle}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#57685f] transition-transform duration-200 ${
                        isEventDropdownOpen ? "rotate-180 text-[#0f6b5c]" : ""
                      }`}
                    />
                  </button>

                  {/* Popover Menu */}
                  {isEventDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-[#d6e7e1] bg-white p-2 shadow-xl z-30 animate-in fade-in-50 zoom-in-95 max-h-72 overflow-y-auto">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#57685f]">
                        Your Managed Hackathons
                      </div>
                      {managedHackathons.map((hck) => (
                        <button
                          key={hck.id}
                          type="button"
                          onClick={() => {
                            setSelectedHackathon(hck.id);
                            setIsEventDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer text-left ${
                            selectedHackathon === hck.id
                              ? "bg-[#0f6b5c] text-white shadow-xs"
                              : "text-[#122622] hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
                          }`}
                        >
                          <span className="truncate pr-2">{hck.title}</span>
                          {selectedHackathon === hck.id && <Check className="h-4 w-4 shrink-0 text-white" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Custom Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsStatusDropdownOpen((prev) => !prev);
                      setIsEventDropdownOpen(false);
                    }}
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-bold shadow-2xs transition-all cursor-pointer ${
                      isStatusDropdownOpen || statusFilter !== "All"
                        ? "border-[#0f6b5c] bg-[#e8f3f0] text-[#0f6b5c] ring-2 ring-[#0f6b5c]/10"
                        : "border-[#d6e7e1] bg-[#f3f6f4] text-[#122622] hover:bg-white hover:border-[#0f6b5c]"
                    }`}
                  >
                    <Filter className="h-4 w-4 text-[#0f6b5c] shrink-0" />
                    <span className="text-[#57685f] font-semibold">Status:</span>
                    <span>{statusFilter === "All" ? "All Statuses" : statusFilter === "registered" ? "Active" : "Withdrawn"}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#57685f] transition-transform duration-200 ${
                        isStatusDropdownOpen ? "rotate-180 text-[#0f6b5c]" : ""
                      }`}
                    />
                  </button>

                  {/* Popover Menu */}
                  {isStatusDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-[#d6e7e1] bg-white p-2 shadow-xl z-30 animate-in fade-in-50 zoom-in-95">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#57685f]">
                        Filter By Status
                      </div>
                      {[
                        { id: "All", label: "All Statuses" },
                        { id: "registered", label: "Active / Registered" },
                        { id: "withdrawn", label: "Withdrawn" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setStatusFilter(opt.id);
                            setIsStatusDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                            statusFilter === opt.id
                              ? "bg-[#0f6b5c] text-white shadow-xs"
                              : "text-[#122622] hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {statusFilter === opt.id && <Check className="h-4 w-4 shrink-0 text-white" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reset Filters Button */}
                {(selectedHackathon !== "All" || statusFilter !== "All" || searchQuery) && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex items-center gap-1.5 rounded-2xl border border-[#d6e7e1] bg-white px-3 py-2 text-xs font-semibold text-[#57685f] hover:bg-[#f3f6f4] transition-all cursor-pointer"
                    title="Reset filters"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-[#c4211c] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => loadRegistrations()}
                  className="font-bold underline cursor-pointer hover:text-red-900"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Applicant Review Table */}
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full min-w-[850px] text-left text-xs">
                <thead>
                  <tr className="border-b border-[#d6e7e1] text-[11px] font-extrabold uppercase tracking-wider text-[#57685f]">
                    <th className="pb-3 pr-4">Participant</th>
                    <th className="pb-3 pr-4">Event</th>
                    <th className="pb-3 pr-4">Affiliation / Org</th>
                    <th className="pb-3 pr-4">Role & Skills</th>
                    <th className="pb-3 pr-4">Team</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d6e7e1] text-[#57685f]">
                  {isLoading ? (
                    // Skeleton loader rows
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200" />
                            <div className="space-y-1.5">
                              <div className="h-3.5 w-28 rounded-md bg-gray-200" />
                              <div className="h-2.5 w-36 rounded-md bg-gray-100" />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4"><div className="h-4 w-24 rounded bg-gray-200" /></td>
                        <td className="py-4 pr-4"><div className="h-4 w-32 rounded bg-gray-200" /></td>
                        <td className="py-4 pr-4"><div className="h-4 w-28 rounded bg-gray-200" /></td>
                        <td className="py-4 pr-4"><div className="h-4 w-20 rounded bg-gray-200" /></td>
                        <td className="py-4 pr-4"><div className="h-4 w-16 rounded bg-gray-200" /></td>
                        <td className="py-4 text-right"><div className="h-4 w-12 rounded bg-gray-200 ml-auto" /></td>
                      </tr>
                    ))
                  ) : registrations.length > 0 ? (
                    registrations.map((reg) => {
                      const pName = reg.participantName || "Participant";
                      const pInitial = pName.charAt(0).toUpperCase();
                      const orgText = reg.university || reg.organization || "Independent Innovator";
                      const locationText = [reg.city, reg.country].filter(Boolean).join(", ");
                      const isRegistered = !reg.withdrawnAt && reg.status !== "withdrawn";

                      return (
                        <tr
                          key={reg.id}
                          onClick={() => {
                            setSelectedRegistration(reg);
                            setModalTab("profile");
                          }}
                          className="group cursor-pointer transition-colors hover:bg-[#f3f6f4]"
                        >
                          {/* Participant Column */}
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              {/* Clickable Avatar Popup trigger */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQuickAvatarUser(reg);
                                }}
                                className="relative group/avatar cursor-pointer focus:outline-none"
                                title="Click to view quick profile"
                              >
                                {reg.avatarUrl ? (
                                  <img
                                    src={reg.avatarUrl}
                                    alt={pName}
                                    className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[#0f6b5c]/20 group-hover/avatar:ring-4 group-hover/avatar:ring-[#0f6b5c] transition-all"
                                  />
                                ) : (
                                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c] text-xs font-bold group-hover/avatar:bg-[#0f6b5c] group-hover/avatar:text-white transition-all">
                                    {pInitial}
                                  </span>
                                )}
                              </button>
                              <div className="min-w-0">
                                <p className="font-bold text-[#122622] group-hover:text-[#0f6b5c] transition-colors truncate">
                                  {pName}
                                </p>
                                <p className="text-[11px] text-[#57685f] mt-0.5 truncate">
                                  {reg.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Hackathon Name Column */}
                          <td className="py-4 pr-4">
                            <span className="inline-flex items-center rounded-xl bg-[#e8f3f0] border border-[#c4ded4] px-2.5 py-1 text-[11px] font-bold text-[#0f6b5c] max-w-[180px] truncate">
                              {reg.hackathonTitle}
                            </span>
                          </td>

                          {/* Affiliation / Org Column */}
                          <td className="py-4 pr-4">
                            <div className="min-w-0">
                              <p className="font-semibold text-[#122622] truncate">
                                {orgText}
                              </p>
                              {locationText && (
                                <p className="text-[10px] text-[#798e85] mt-0.5 truncate flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {locationText}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Role & Skills Column */}
                          <td className="py-4 pr-4">
                            <div className="flex flex-col gap-1 max-w-[200px]">
                              <span className="text-[11px] font-bold text-[#122622] truncate">
                                {reg.professionalTitle || reg.role || "Innovator"}
                              </span>
                              {reg.skills && reg.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {reg.skills.slice(0, 2).map((s) => (
                                    <span
                                      key={s}
                                      className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold text-[#57685f]"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                  {reg.skills.length > 2 && (
                                    <span className="text-[9px] text-[#798e85] font-semibold">
                                      +{reg.skills.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Team Column */}
                          <td className="py-4 pr-4">
                            {reg.team ? (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-[#e8f3f0] px-2 py-0.5 text-[11px] font-bold text-[#0f6b5c] border border-[#c4ded4]">
                                <Users className="h-3 w-3" />
                                <span className="truncate max-w-[120px]">{reg.team.name}</span>
                                {reg.team.isLeader && (
                                  <span className="text-[9px] bg-[#0f6b5c] text-white px-1 rounded">Lead</span>
                                )}
                              </span>
                            ) : reg.lookingForTeammates ? (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                                Seeking Team
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#798e85]">Individual</span>
                            )}
                          </td>

                          {/* Status Column */}
                          <td className="py-4 pr-4">
                            {isRegistered ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-[#16793d]">
                                <Check className="h-3 w-3" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-[10px] font-bold text-[#57685f]">
                                Withdrawn
                              </span>
                            )}
                          </td>

                          {/* Action Column */}
                          <td className="py-4 text-right">
                            <span className="text-xs font-bold text-[#0f6b5c] hover:underline cursor-pointer">
                              View Details →
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : null}
                </tbody>
              </table>

              {/* Empty States */}
              {!isLoading && registrations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#e8f3f0] text-[#0f6b5c] mb-4 shadow-xs">
                    {managedHackathons.length <= 1 ? (
                      <Calendar className="h-7 w-7" />
                    ) : (
                      <Filter className="h-7 w-7" />
                    )}
                  </div>
                  <h4 className="font-display text-lg font-extrabold text-[#122622]">
                    {managedHackathons.length <= 1
                      ? "No Hackathons Found"
                      : "No Registrations Found"}
                  </h4>
                  <p className="text-xs text-[#57685f] max-w-md mt-1 mb-6">
                    {managedHackathons.length <= 1
                      ? "You have not created any hackathons yet. Create your first event to start receiving participant registrations."
                      : "No registered participants match the selected event or search criteria in your database."}
                  </p>
                  {managedHackathons.length <= 1 ? (
                    <Link
                      href="/organizer/hackathons"
                      className="flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer"
                    >
                      <Rocket className="h-4 w-4" />
                      <span>+ Create Hackathon</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset Filters</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ================= 3. QUICK AVATAR INFO POPOVER ================= */}
      {quickAvatarUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setQuickAvatarUser(null)}
        >
          <div
            className="relative w-full max-w-sm my-auto max-h-[92dvh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-[#d6e7e1] text-[#122622] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setQuickAvatarUser(null)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              {quickAvatarUser.avatarUrl ? (
                <img
                  src={quickAvatarUser.avatarUrl}
                  alt={quickAvatarUser.participantName}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-[#0f6b5c]/20 shadow-md"
                />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0f6b5c] text-white text-2xl font-bold shadow-md">
                  {quickAvatarUser.participantName.charAt(0).toUpperCase()}
                </span>
              )}

              <h3 className="font-display text-lg font-extrabold text-[#122622] mt-3">
                {quickAvatarUser.participantName}
              </h3>
              <p className="text-xs font-semibold text-[#0f6b5c]">
                {quickAvatarUser.professionalTitle || quickAvatarUser.role || "Innovator"}
              </p>
              <p className="text-xs text-[#57685f] mt-1">
                {quickAvatarUser.university || quickAvatarUser.organization || "Independent Creator"}
              </p>

              {(quickAvatarUser.city || quickAvatarUser.country) && (
                <p className="text-[11px] text-[#798e85] mt-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[quickAvatarUser.city, quickAvatarUser.country].filter(Boolean).join(", ")}
                </p>
              )}

              {/* Social links */}
              <div className="flex items-center gap-2 mt-4">
                {quickAvatarUser.linkedinUrl && (
                  <a
                    href={quickAvatarUser.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-gray-100 text-[#0077b5] hover:bg-blue-50 transition-colors"
                  >
                    <LinkedinIcon className="h-4 w-4" />
                  </a>
                )}
                {quickAvatarUser.githubUrl && (
                  <a
                    href={quickAvatarUser.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-gray-100 text-[#122622] hover:bg-gray-200 transition-colors"
                  >
                    <GithubIcon className="h-4 w-4" />
                  </a>
                )}
                {quickAvatarUser.twitterUrl && (
                  <a
                    href={quickAvatarUser.twitterUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-gray-100 text-[#1da1f2] hover:bg-sky-50 transition-colors"
                  >
                    <TwitterIcon className="h-4 w-4" />
                  </a>
                )}
                <a
                  href={`mailto:${quickAvatarUser.email}`}
                  className="p-2 rounded-xl bg-gray-100 text-[#0f6b5c] hover:bg-emerald-50 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>

              {/* View Full Profile CTA */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRegistration(quickAvatarUser);
                  setQuickAvatarUser(null);
                  setModalTab("profile");
                }}
                className="w-full mt-5 rounded-2xl bg-[#0f6b5c] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer"
              >
                View Complete Application Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. RICH PARTICIPANT DETAILS MODAL ================= */}
      {selectedRegistration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setSelectedRegistration(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[92dvh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-[#d6e7e1] text-[#122622] my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#d6e7e1] p-4 sm:p-6 bg-[#f8faf9]">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                {selectedRegistration.avatarUrl ? (
                  <img
                    src={selectedRegistration.avatarUrl}
                    alt={selectedRegistration.participantName}
                    className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover ring-4 ring-[#0f6b5c]/20 shadow-sm shrink-0"
                  />
                ) : (
                  <span className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0f6b5c] text-white text-lg sm:text-xl font-bold shadow-sm">
                    {selectedRegistration.participantName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <h2 className="font-display text-lg sm:text-2xl font-extrabold text-[#122622] truncate">
                      {selectedRegistration.participantName}
                    </h2>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold text-[#16793d]">
                      {selectedRegistration.withdrawnAt ? "WITHDRAWN" : "REGISTERED"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#0f6b5c] mt-0.5 truncate">
                    {selectedRegistration.professionalTitle || selectedRegistration.role || "Innovator"}
                  </p>
                  <p className="text-xs text-[#57685f] truncate">
                    {selectedRegistration.university || selectedRegistration.organization || "Independent Creator"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRegistration(null)}
                className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all cursor-pointer ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tab navigation */}
            <div className="flex items-center gap-2 border-b border-[#d6e7e1] px-4 sm:px-6 pt-3 bg-white overflow-x-auto no-scrollbar whitespace-nowrap">
              <button
                type="button"
                onClick={() => setModalTab("profile")}
                className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
                  modalTab === "profile"
                    ? "border-[#0f6b5c] text-[#0f6b5c]"
                    : "border-transparent text-[#57685f] hover:text-[#122622]"
                }`}
              >
                Participant Profile Data
              </button>
              <button
                type="button"
                onClick={() => setModalTab("application")}
                className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
                  modalTab === "application"
                    ? "border-[#0f6b5c] text-[#0f6b5c]"
                    : "border-transparent text-[#57685f] hover:text-[#122622]"
                }`}
              >
                Hackathon Application Data
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-6">
              {modalTab === "profile" && (
                <div className="space-y-6">
                  {/* Bio */}
                  {selectedRegistration.bio && (
                    <div className="rounded-2xl bg-[#f8faf9] border border-[#e2ece7] p-4">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0f6b5c] mb-1.5">
                        About / Bio
                      </h4>
                      <p className="text-xs leading-relaxed text-[#122622]">
                        {selectedRegistration.bio}
                      </p>
                    </div>
                  )}

                  {/* Personal & Contact Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-[#d6e7e1] p-4 bg-white">
                      <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#57685f] mb-3 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-[#0f6b5c]" />
                        Contact & Location
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-[#798e85] block text-[10px]">Email Address</span>
                          <span className="font-semibold text-[#122622]">{selectedRegistration.email}</span>
                        </div>
                        {selectedRegistration.phoneNumber && (
                          <div>
                            <span className="text-[#798e85] block text-[10px]">Phone Number</span>
                            <span className="font-semibold text-[#122622]">{selectedRegistration.phoneNumber}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-[#798e85] block text-[10px]">Location</span>
                          <span className="font-semibold text-[#122622]">
                            {[selectedRegistration.city, selectedRegistration.country].filter(Boolean).join(", ") || "Ethiopia"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#d6e7e1] p-4 bg-white">
                      <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#57685f] mb-3 flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-[#0f6b5c]" />
                        Education & Organization
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-[#798e85] block text-[10px]">University / Institution</span>
                          <span className="font-semibold text-[#122622]">{selectedRegistration.university || "Not specified"}</span>
                        </div>
                        <div>
                          <span className="text-[#798e85] block text-[10px]">Organization / Workplace</span>
                          <span className="font-semibold text-[#122622]">{selectedRegistration.organization || "Not specified"}</span>
                        </div>
                        {selectedRegistration.department && (
                          <div>
                            <span className="text-[#798e85] block text-[10px]">Department / Faculty</span>
                            <span className="font-semibold text-[#122622]">{selectedRegistration.department}</span>
                          </div>
                        )}
                        {selectedRegistration.fieldOfStudy && (
                          <div>
                            <span className="text-[#798e85] block text-[10px]">Field of Study</span>
                            <span className="font-semibold text-[#122622]">{selectedRegistration.fieldOfStudy}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Professional & Skills */}
                  <div className="rounded-2xl border border-[#d6e7e1] p-4 bg-white">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#57685f] mb-3 flex items-center gap-1.5">
                      <Code className="h-3.5 w-3.5 text-[#0f6b5c]" />
                      Skills & Experience
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                      <div>
                        <span className="text-[#798e85] block text-[10px]">Experience Level</span>
                        <span className="font-semibold text-[#122622]">{selectedRegistration.experienceLevel || "Intermediate"}</span>
                      </div>
                      <div>
                        <span className="text-[#798e85] block text-[10px]">Years of Experience</span>
                        <span className="font-semibold text-[#122622]">{selectedRegistration.yearsOfExperience ?? "—"} Years</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[#798e85] block text-[10px] mb-1.5">Skills & Tech Stack</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedRegistration.skills && selectedRegistration.skills.length > 0 ? (
                          selectedRegistration.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-lg bg-[#e8f3f0] px-2.5 py-1 text-xs font-semibold text-[#0f6b5c] border border-[#c4ded4]"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#798e85]">No skills tagged</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Social Profiles */}
                  <div className="rounded-2xl border border-[#d6e7e1] p-4 bg-white">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#57685f] mb-3 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-[#0f6b5c]" />
                      Social & Online Profiles
                    </h4>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {selectedRegistration.linkedinUrl && (
                        <a
                          href={selectedRegistration.linkedinUrl.startsWith("http") ? selectedRegistration.linkedinUrl : `https://${selectedRegistration.linkedinUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#d6e7e1] px-3 py-1.5 text-xs font-bold text-[#0077b5] hover:bg-blue-50 transition-colors"
                        >
                          <LinkedinIcon className="h-4 w-4" />
                          <span>LinkedIn</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {selectedRegistration.githubUrl && (
                        <a
                          href={selectedRegistration.githubUrl.startsWith("http") ? selectedRegistration.githubUrl : `https://${selectedRegistration.githubUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#d6e7e1] px-3 py-1.5 text-xs font-bold text-[#122622] hover:bg-gray-100 transition-colors"
                        >
                          <GithubIcon className="h-4 w-4" />
                          <span>GitHub</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {selectedRegistration.websiteUrl && (
                        <a
                          href={selectedRegistration.websiteUrl.startsWith("http") ? selectedRegistration.websiteUrl : `https://${selectedRegistration.websiteUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#d6e7e1] px-3 py-1.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#e8f3f0] transition-colors"
                        >
                          <Globe className="h-4 w-4" />
                          <span>Website</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {selectedRegistration.twitterUrl && (
                        <a
                          href={selectedRegistration.twitterUrl.startsWith("http") ? selectedRegistration.twitterUrl : `https://${selectedRegistration.twitterUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#d6e7e1] px-3 py-1.5 text-xs font-bold text-[#1da1f2] hover:bg-sky-50 transition-colors"
                        >
                          <TwitterIcon className="h-4 w-4" />
                          <span>Twitter</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {modalTab === "application" && (
                <div className="space-y-6">
                  {/* Event & Registration Metadata */}
                  <div className="rounded-2xl bg-[#e8f3f0] border border-[#c4ded4] p-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0f6b5c] mb-2">
                      Registered Event
                    </h4>
                    <p className="font-bold text-base text-[#122622]">
                      {selectedRegistration.hackathonTitle}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                      <div>
                        <span className="text-[#57685f] block text-[10px]">Registration Date</span>
                        <span className="font-semibold text-[#122622]">
                          {new Date(selectedRegistration.registeredAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#57685f] block text-[10px]">Eligibility Status</span>
                        <span className="font-semibold text-[#16793d] flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {selectedRegistration.eligibilityConfirmed ? "Confirmed Eligible" : "Self-Reported"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Team in this Hackathon */}
                  <div className="rounded-2xl border border-[#d6e7e1] p-4 bg-white">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#57685f] mb-3 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[#0f6b5c]" />
                      Team Status for this Event
                    </h4>
                    {selectedRegistration.team ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8faf9] border border-[#e2ece7]">
                        <div>
                          <p className="font-bold text-sm text-[#122622]">
                            {selectedRegistration.team.name}
                          </p>
                          <p className="text-[11px] text-[#57685f]">
                            Role: {selectedRegistration.team.role}
                          </p>
                        </div>
                        <span className="rounded-lg bg-[#e8f3f0] px-2.5 py-1 text-xs font-bold text-[#0f6b5c]">
                          Formed Team
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                        <p className="font-semibold text-[#122622]">
                          {selectedRegistration.lookingForTeammates
                            ? "Looking for teammates"
                            : "Registered as Individual"}
                        </p>
                        {selectedRegistration.teamSeekingDescription && (
                          <p className="text-[11px] text-[#57685f] mt-1">
                            &quot;{selectedRegistration.teamSeekingDescription}&quot;
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Custom Questions / Answers */}
                  {selectedRegistration.customAnswers && Object.keys(selectedRegistration.customAnswers).length > 0 && (
                    <div className="rounded-2xl border border-[#d6e7e1] p-4 bg-white">
                      <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#57685f] mb-3 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-[#0f6b5c]" />
                        Application Responses & Questions
                      </h4>
                      <div className="space-y-3 text-xs">
                        {Object.entries(selectedRegistration.customAnswers).map(([key, value]) => {
                          if (typeof value === "object" && value !== null) {
                            return (
                              <div key={key} className="p-3 rounded-xl bg-[#f8faf9] border border-[#e2ece7]">
                                <span className="text-[#0f6b5c] font-bold uppercase text-[10px] block mb-1">
                                  {key}
                                </span>
                                <div className="space-y-1">
                                  {Object.entries(value).map(([subKey, subVal]) => (
                                    <div key={subKey} className="text-[11px]">
                                      <span className="text-[#798e85]">{subKey}: </span>
                                      <span className="font-medium text-[#122622]">{String(subVal)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div key={key} className="p-2.5 rounded-xl bg-[#f8faf9]">
                              <span className="text-[#798e85] text-[10px] block font-semibold uppercase">{key}</span>
                              <span className="font-medium text-[#122622]">{String(value)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#d6e7e1] p-4 sm:p-6 bg-[#f8faf9]">
              <a
                href={`mailto:${selectedRegistration.email}`}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-[#d6e7e1] bg-white px-4 py-2.5 text-xs font-bold text-[#122622] hover:bg-gray-100 transition-all cursor-pointer"
              >
                <Mail className="h-4 w-4 text-[#0f6b5c]" />
                <span>Contact {selectedRegistration.participantName}</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedRegistration(null)}
                className="w-full sm:w-auto justify-center rounded-2xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer"
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
