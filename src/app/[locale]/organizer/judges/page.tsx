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
  FileText,
  Megaphone,
  Briefcase,
  Bell,
  Search,
  Filter,
  Check,
  X,
  Hourglass,
  Sparkles,
  Mail,
  Plus,
  ChevronDown,
  Layers,
  Rocket,
  RotateCcw,
  Send,
  Trash2,
  Copy,
  Clock,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { Logomark } from "@/components/ui/Logomark";
import { judgesClient, type JudgeInvitation } from "@/features/judges/lib/judges-client";

interface HackathonOption {
  id: string;
  title: string;
}

const MANAGED_HACKATHONS: HackathonOption[] = [
  { id: "All", title: "All Hackathons" },
  { id: "hck-agritech", title: "AgriTech Hack 2024" },
  { id: "hck-fintech", title: "FinTech Frontier" },
  { id: "hck-ai-sprint", title: "Amharic NLP Sprint" },
];

export default function OrganizerJudgesPage() {
  const t = useTranslations("Organizer");
  const { user } = useSession();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("judging");
  const [invitations, setInvitations] = useState<JudgeInvitation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHackathon, setSelectedHackathon] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Popover state
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteHackathonId, setInviteHackathonId] = useState(MANAGED_HACKATHONS[1].id);
  const [inviteNote, setInviteNote] = useState("");
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  const organizerName = user?.fullName || "Abeba Selassie";
  const organizerTitle = "Lead Organizer";
  const userInitial = organizerName.charAt(0).toUpperCase();

  // Load Judges List
  const loadJudges = async () => {
    try {
      const res = await judgesClient.listJudges({
        hackathonId: selectedHackathon,
        status: statusFilter,
      });
      setInvitations(res.data);
    } catch (err) {
      console.error("Failed to load judges:", err);
    }
  };

  useEffect(() => {
    loadJudges();
  }, [selectedHackathon, statusFilter]);

  // Handle Send Invite
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsSubmittingInvite(true);
    try {
      const targetHackathon = MANAGED_HACKATHONS.find((h) => h.id === inviteHackathonId) || MANAGED_HACKATHONS[1];
      await judgesClient.inviteJudge({
        email: inviteEmail.trim(),
        hackathonId: targetHackathon.id,
        hackathonTitle: targetHackathon.title,
        note: inviteNote.trim(),
      });
      setInviteEmail("");
      setInviteNote("");
      setIsInviteModalOpen(false);
      await loadJudges();
    } catch (err) {
      console.error("Failed to send judge invite:", err);
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  // Handle Revoke Invitation
  const handleRevokeInvite = async (id: string) => {
    try {
      await judgesClient.revokeInvitation(id);
      await loadJudges();
    } catch (err) {
      console.error("Failed to revoke invitation:", err);
    }
  };

  // Copy Magic Link to Clipboard
  const handleCopyMagicLink = (token: string) => {
    const link = `${window.location.origin}/accept-judge-invite?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  // Scoped list calculations for header metrics
  const totalInvited = invitations.length;
  const pendingCount = invitations.filter((i) => i.status === "INVITED").length;
  const acceptedCount = invitations.filter((i) => i.status === "ACCEPTED").length;
  const expiredRevokedCount = invitations.filter((i) => i.status === "EXPIRED" || i.status === "REVOKED").length;

  // Filtered List based on Search Query
  const filteredInvitations = invitations.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.email.toLowerCase().includes(q) ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        item.hackathonTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

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
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <UserCheck className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Registrations</span>}
              </Link>

              <Link
                href="/organizer/judges"
                title={isSidebarCollapsed ? "Judging" : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } bg-[#0f6b5c] text-white shadow-md font-bold`}
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
                href="/dashboard/portfolio"
                title={isSidebarCollapsed ? "Portfolio" : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Briefcase className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Portfolio</span>}
              </Link>
            </nav>
          </div>

          {/* Sidebar Bottom CTA & User Footer */}
          <div className="flex flex-col gap-4 border-t border-[#d6e7e1] pt-4">
            <Link
              href="/hackathons"
              title={isSidebarCollapsed ? "+ Launch Project" : undefined}
              className={`flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#0b5347] ${
                isSidebarCollapsed ? "px-0" : "px-4"
              }`}
            >
              <Rocket className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span className="whitespace-nowrap">+ Launch Project</span>}
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
        <main className="flex min-w-0 flex-1 flex-col p-4 sm:p-6 lg:p-8 transition-all duration-300">
          {/* Top Bar Title & + Invite Judge Button */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6">
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#122622]">
                Judge Management & Invitations
              </h1>
              <p className="text-xs text-[#57685f] mt-1">
                Invite domain experts via email. Judges accept invitations to receive hackathon evaluation access.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Invite Judge</span>
            </button>
          </div>

          {/* 1. Header Metrics Cards Row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 pb-8">
            {/* Metric 1: Total Invited */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-2xs transition-all">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c]">
                  <Gavel className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-[#e8f3f0] px-2.5 py-0.5 text-[11px] font-extrabold text-[#0f6b5c]">
                  Pipeline
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#57685f]">
                  Total Invited Judges
                </p>
                <h3 className="font-display text-2xl font-extrabold text-[#122622] mt-1">
                  {totalInvited}
                </h3>
              </div>
            </div>

            {/* Metric 2: Pending Acceptance */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-2xs transition-all">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <Clock className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                  INVITED
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#57685f]">
                  Pending Acceptance
                </p>
                <h3 className="font-display text-2xl font-extrabold text-[#122622] mt-1">
                  {pendingCount}
                </h3>
              </div>
            </div>

            {/* Metric 3: Active Judges */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-2xs transition-all">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-[#16793d]">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[#16793d]">
                  <Check className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#57685f]">
                  Active Judges
                </p>
                <h3 className="font-display text-2xl font-extrabold text-[#122622] mt-1">
                  {acceptedCount}
                </h3>
              </div>
            </div>

            {/* Metric 4: Expired / Revoked */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-2xs transition-all">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
                  <ShieldAlert className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-extrabold text-gray-600">
                  INACTIVE
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#57685f]">
                  Expired / Revoked
                </p>
                <h3 className="font-display text-2xl font-extrabold text-[#122622] mt-1">
                  {expiredRevokedCount}
                </h3>
              </div>
            </div>
          </div>

          {/* 2. Judges List Table Card */}
          <div className="flex flex-col rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-sm">
            {/* Table Controls (Search + Side-by-Side Custom Filters) */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-6">
              <div className="relative w-full lg:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search judge email, name, hackathon..."
                  className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white pl-10 pr-4 text-xs font-medium text-[#122622] shadow-2xs outline-none placeholder:text-gray-400 focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#0f6b5c]/20"
                />
              </div>

              {/* Side-by-Side Custom Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Hackathon Event Custom Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEventDropdownOpen((prev) => !prev);
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2 text-xs font-bold shadow-2xs transition-all cursor-pointer ${
                      isEventDropdownOpen || selectedHackathon !== "All"
                        ? "border-[#0f6b5c] bg-[#e8f3f0] text-[#0f6b5c] ring-2 ring-[#0f6b5c]/10"
                        : "border-[#d6e7e1] bg-[#f3f6f4] text-[#122622] hover:bg-white hover:border-[#0f6b5c]"
                    }`}
                  >
                    <Layers className="h-4 w-4 text-[#0f6b5c] shrink-0" />
                    <span className="text-[#57685f] font-semibold">Event:</span>
                    <span>
                      {MANAGED_HACKATHONS.find((h) => h.id === selectedHackathon)?.title || "All Hackathons"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#57685f] transition-transform duration-200 ${
                        isEventDropdownOpen ? "rotate-180 text-[#0f6b5c]" : ""
                      }`}
                    />
                  </button>

                  {/* Popover Menu */}
                  {isEventDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[#d6e7e1] bg-white p-2 shadow-xl z-30 animate-in fade-in-50 zoom-in-95">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#57685f]">
                        Filter By Event
                      </div>
                      {MANAGED_HACKATHONS.map((hck) => (
                        <button
                          key={hck.id}
                          type="button"
                          onClick={() => {
                            setSelectedHackathon(hck.id);
                            setIsEventDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                            selectedHackathon === hck.id
                              ? "bg-[#0f6b5c] text-white shadow-xs"
                              : "text-[#122622] hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
                          }`}
                        >
                          <span>{hck.title}</span>
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
                    className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2 text-xs font-bold shadow-2xs transition-all cursor-pointer ${
                      isStatusDropdownOpen || statusFilter !== "All"
                        ? "border-[#0f6b5c] bg-[#e8f3f0] text-[#0f6b5c] ring-2 ring-[#0f6b5c]/10"
                        : "border-[#d6e7e1] bg-[#f3f6f4] text-[#122622] hover:bg-white hover:border-[#0f6b5c]"
                    }`}
                  >
                    <Filter className="h-4 w-4 text-[#0f6b5c] shrink-0" />
                    <span className="text-[#57685f] font-semibold">Status:</span>
                    <span>{statusFilter === "All" ? "All Statuses" : statusFilter}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#57685f] transition-transform duration-200 ${
                        isStatusDropdownOpen ? "rotate-180 text-[#0f6b5c]" : ""
                      }`}
                    />
                  </button>

                  {/* Popover Menu */}
                  {isStatusDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-[#d6e7e1] bg-white p-2 shadow-xl z-30 animate-in fade-in-50 zoom-in-95">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#57685f]">
                        Filter By Status
                      </div>
                      {[
                        { id: "All", label: "All Statuses" },
                        { id: "INVITED", label: "Invited (Pending)" },
                        { id: "ACCEPTED", label: "Accepted (Active)" },
                        { id: "EXPIRED", label: "Expired" },
                        { id: "REVOKED", label: "Revoked" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setStatusFilter(opt.id);
                            setIsStatusDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer ${
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
              </div>
            </div>

            {/* Judges Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#d6e7e1] text-[11px] font-extrabold uppercase tracking-wider text-[#57685f]">
                    <th className="pb-3 pr-4">Judge Email / Name</th>
                    <th className="pb-3 pr-4">Assigned Hackathon</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Date Invited</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d6e7e1] text-[#57685f]">
                  {filteredInvitations.length > 0 ? (
                    filteredInvitations.map((item) => (
                      <tr key={item.id} className="group transition-colors hover:bg-[#f3f6f4]">
                        {/* Email / Name Column */}
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e8f3f0] text-xs font-bold text-[#0f6b5c]">
                              {item.name ? item.name.charAt(0) : item.email.charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <p className="font-bold text-[#122622]">
                                {item.name || item.email.split("@")[0]}
                              </p>
                              <p className="text-[11px] text-[#57685f] mt-0.5">
                                {item.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Assigned Hackathon Column */}
                        <td className="py-4 pr-4">
                          <span className="inline-flex items-center rounded-xl bg-[#e8f3f0] border border-[#d6e7e1] px-3 py-1 text-[11px] font-bold text-[#0f6b5c]">
                            {item.hackathonTitle}
                          </span>
                        </td>

                        {/* Status Column */}
                        <td className="py-4 pr-4">
                          {item.status === "INVITED" && (
                            <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[11px] font-bold text-amber-800">
                              INVITED (Pending)
                            </span>
                          )}
                          {item.status === "ACCEPTED" && (
                            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-[#16793d]">
                              ACCEPTED (Active)
                            </span>
                          )}
                          {item.status === "EXPIRED" && (
                            <span className="rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-[11px] font-bold text-[#57685f]">
                              EXPIRED
                            </span>
                          )}
                          {item.status === "REVOKED" && (
                            <span className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-[11px] font-bold text-[#c4211c]">
                              REVOKED
                            </span>
                          )}
                        </td>

                        {/* Date Invited Column */}
                        <td className="py-4 pr-4 text-xs text-[#57685f]">
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        {/* Actions Column */}
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Copy Magic Link button */}
                            <button
                              type="button"
                              onClick={() => handleCopyMagicLink(item.token)}
                              className="flex items-center gap-1.5 rounded-xl border border-[#d6e7e1] bg-white px-3 py-1.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#e8f3f0] transition-all cursor-pointer"
                              title="Copy Magic Onboarding Link"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              <span>{copiedToken === item.token ? "Copied Link!" : "Copy Link"}</span>
                            </button>

                            {/* Revoke button */}
                            {item.status !== "REVOKED" && (
                              <button
                                type="button"
                                onClick={() => handleRevokeInvite(item.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl text-[#c4211c] hover:bg-red-50 transition-all cursor-pointer"
                                title="Revoke Invitation / Access"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-[#57685f]">
                        No judge invitations match the selected criteria. Click <strong>+ Invite Judge</strong> to send an invitation email.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Invite Judge Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#d6e7e1] text-[#122622]">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#d6e7e1]">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c]">
                <Send className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-xl font-extrabold text-[#122622]">
                  Invite Hackathon Judge
                </h2>
                <p className="text-xs text-[#57685f]">
                  Send a magic onboarding link to a domain expert to judge your event.
                </p>
              </div>
            </div>

            {/* Invite Form */}
            <form onSubmit={handleSendInvite} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Judge Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. dr.tadesse@university.edu.et"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] px-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white focus:ring-2 focus:ring-[#0f6b5c]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Hackathon Assignment *
                </label>
                <select
                  value={inviteHackathonId}
                  onChange={(e) => setInviteHackathonId(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] px-4 text-xs font-extrabold text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
                >
                  {MANAGED_HACKATHONS.filter((h) => h.id !== "All").map((hck) => (
                    <option key={hck.id} value={hck.id}>
                      {hck.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Personal Note / Message (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Include a message introducing the judging timeline or scoring criteria..."
                  value={inviteNote}
                  onChange={(e) => setInviteNote(e.target.value)}
                  className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white focus:ring-2 focus:ring-[#0f6b5c]/20"
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center justify-end gap-3 border-t border-[#d6e7e1] pt-4">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="rounded-2xl border border-[#d6e7e1] px-5 py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInvite}
                  className="flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmittingInvite ? "Sending..." : "Send Email Invitation"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
