"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  Gavel,
  Trophy,
  FileText,
  Megaphone,
  Briefcase,
  Search,
  Check,
  Plus,
  ChevronDown,
  Layers,
  Rocket,
  Bell,
  Mail,
  Smartphone,
  AlertCircle,
  Info,
  Clock,
  Trash2,
  Send,
  X,
  Users,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { Logomark } from "@/components/ui/Logomark";
import {
  announcementsClient,
  type Announcement,
  type AnnouncementPriority,
  type AnnouncementStatus,
} from "@/features/announcements/lib/announcements-client";

import { hackathonsClient } from "@/features/hackathons";
import { NotificationBellDropdown } from "@/features/notifications/components/NotificationBellDropdown";
import { PortalMobileNav } from "@/components/layout/PortalMobileNav";

interface HackathonOption {
  id: string;
  title: string;
}

export default function OrganizerAnnouncementsPage() {
  const t = useTranslations("Organizer");
  const { user } = useSession();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("announcements");

  // Dynamic Hackathons
  const [managedHackathons, setManagedHackathons] = useState<HackathonOption[]>([
    { id: "all", title: "All Hackathons" },
  ]);

  // Filters State
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Announcements Data
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formHackathonId, setFormHackathonId] = useState<string>("");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formPriority, setFormPriority] = useState<AnnouncementPriority>("IMPORTANT");
  const [formChannels, setFormChannels] = useState<("IN_APP" | "EMAIL" | "PUSH")[]>([
    "IN_APP",
    "EMAIL",
  ]);

  const [isSending, setIsSending] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const organizerName = user?.fullName || "Organizer";
  const organizerTitle = (user as any)?.organization || "Innovation Hub";
  const userInitial = organizerName.charAt(0).toUpperCase();

  // Load Managed Hackathons on Mount
  useEffect(() => {
    async function loadManaged() {
      try {
        const res = await hackathonsClient.listHackathons({ managed: true });
        if (res && res.data) {
          const list: HackathonOption[] = [
            { id: "all", title: "All Hackathons" },
            ...res.data.map((h: any) => ({ id: h.id, title: h.title })),
          ];
          setManagedHackathons(list);
          if (res.data.length > 0) {
            setFormHackathonId(res.data[0].id);
          }
        }
      } catch (err) {
        console.warn("Failed to load managed hackathons in announcements page:", err);
      }
    }
    loadManaged();
  }, []);

  // Load Announcements
  const loadAnnouncements = async () => {
    setIsLoading(true);
    try {
      const data = await announcementsClient.getAnnouncements(
        selectedHackathonId,
        selectedStatus
      );
      setAnnouncements(data);
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [selectedHackathonId, selectedStatus]);

  // Filtered List
  const filteredAnnouncements = useMemo(() => {
    let result = [...announcements];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q) ||
          a.hackathonName.toLowerCase().includes(q)
      );
    }

    return result;
  }, [announcements, searchQuery]);

  // Toggle Channel selection
  const handleToggleChannel = (channel: "IN_APP" | "EMAIL" | "PUSH") => {
    setFormChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  // Submit New Announcement
  const handleSaveAnnouncement = async (status: AnnouncementStatus) => {
    if (!formTitle.trim() || !formContent.trim()) return;

    setIsSending(true);
    try {
      const targetEventName =
        managedHackathons.find((h) => h.id === formHackathonId)?.title || "Hackathon";

      const res = await announcementsClient.createAnnouncement({
        organizerId: "org-1",
        hackathonId: formHackathonId,
        hackathonName: targetEventName,
        title: formTitle,
        content: formContent,
        priority: formPriority,
        channels: formChannels,
        status,
      });

      if (res.success) {
        setToastMsg(
          status === "PUBLISHED"
            ? `Successfully broadcast announcement to ${res.announcement.recipientCount} participants!`
            : "Announcement saved as draft."
        );
        setTimeout(() => setToastMsg(null), 4000);
        setIsCreateModalOpen(false);
        setFormTitle("");
        setFormContent("");
        loadAnnouncements();
      }
    } catch (err) {
      console.error("Failed to create announcement:", err);
    } finally {
      setIsSending(false);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await announcementsClient.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      setToastMsg("Announcement deleted.");
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err) {
      console.error("Failed to delete announcement:", err);
    }
  };

  const selectedHackathonTitle =
    managedHackathons.find((h) => h.id === selectedHackathonId)?.title || "All Hackathons";

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#122622]">
      {/* Mobile Sticky Navigation Bar & Slide-Out Drawer */}
      <PortalMobileNav portalType="organizer" activeItem="announcements" title="Announcements" />

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
              <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#e8f3f0] border border-[#d6e7e1] shadow-xs overflow-hidden p-1 transition-transform group-hover:scale-105">
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
            </Link>

            {/* Sidebar Navigation */}
            <nav className="flex flex-col gap-1 text-xs font-semibold text-[#57685f]">
              <Link
                href="/organizer/dashboard"
                title={isSidebarCollapsed ? t("navOverview") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navOverview")}</span>}
              </Link>

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
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } bg-[#0f6b5c] text-white shadow-md font-bold`}
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

          {/* Sidebar Bottom CTA & User Footer */}
          <div className="flex flex-col gap-4 border-t border-[#d6e7e1] pt-4">
            <Link
              href="/organizer/hackathons"
              title={isSidebarCollapsed ? t("launchProject") : undefined}
              className={`flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] hover:bg-[#0b5347] py-2.5 text-xs font-bold text-white shadow-md transition-all ${
                isSidebarCollapsed ? "px-0" : "px-4"
              }`}
            >
              <Rocket className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("launchProject")}</span>}
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
          {/* Header Title Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6">
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#122622]">
                Announcements & Broadcast Engine
              </h1>
              <p className="text-xs text-[#57685f] mt-1">
                Broadcast updates, schedule changes, and alerts to hackathon participants.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Create Announcement</span>
              </button>
              <NotificationBellDropdown />
            </div>
          </div>

          {/* Success Toast Banner */}
          {toastMsg && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 animate-fade-in shadow-xs">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* 1. Target Filter Bar */}
          <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search announcement subject or text..."
                className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0]/40 pl-10 pr-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Event Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsEventDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0]/50 px-3.5 py-2.5 text-xs font-bold text-[#122622] shadow-2xs hover:bg-white transition-all cursor-pointer"
                >
                  <Layers className="h-3.5 w-3.5 text-[#0f6b5c]" />
                  <span className="text-[#57685f]">Event:</span>
                  <span>{selectedHackathonTitle}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>

                {isEventDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[#d6e7e1] bg-white p-2 shadow-xl z-30">
                    {managedHackathons.map((hck) => (
                      <button
                        key={hck.id}
                        type="button"
                        onClick={() => {
                          setSelectedHackathonId(hck.id);
                          setIsEventDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                          selectedHackathonId === hck.id
                            ? "bg-[#0f6b5c] text-white"
                            : "text-[#122622] hover:bg-[#e8f3f0]"
                        }`}
                      >
                        <span>{hck.title}</span>
                        {selectedHackathonId === hck.id && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0]/50 px-3.5 py-2.5 text-xs font-bold text-[#122622] shadow-2xs hover:bg-white transition-all cursor-pointer"
                >
                  <Filter className="h-3.5 w-3.5 text-[#0f6b5c]" />
                  <span className="capitalize">{selectedStatus === "all" ? "All Statuses" : selectedStatus}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-[#d6e7e1] bg-white p-2 shadow-xl z-30">
                    {["all", "PUBLISHED", "DRAFT"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setSelectedStatus(st);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                          selectedStatus === st
                            ? "bg-[#0f6b5c] text-white"
                            : "text-[#122622] hover:bg-[#e8f3f0]"
                        }`}
                      >
                        <span className="capitalize">{st === "all" ? "All Statuses" : st}</span>
                        {selectedStatus === st && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 1. Announcements Feed / History List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0f6b5c] border-t-transparent" />
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-[#d6e7e1] bg-white p-12 text-center">
              <Megaphone className="h-10 w-10 text-[#0f6b5c]/40 mb-3" />
              <h3 className="font-display text-lg font-bold text-[#122622]">
                No Announcements Found
              </h3>
              <p className="text-xs text-[#57685f] mt-1 max-w-sm">
                No announcements match the selected filter criteria. Click "+ Create Announcement" to broadcast your first update.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredAnnouncements.map((item) => {
                const isUrgent = item.priority === "URGENT";
                const isImportant = item.priority === "IMPORTANT";
                const isPublished = item.status === "PUBLISHED";

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col justify-between rounded-3xl border p-6 transition-all hover:shadow-md ${
                      isUrgent
                        ? "border-red-200 bg-red-50/30"
                        : isImportant
                        ? "border-amber-200 bg-amber-50/20"
                        : "border-[#d6e7e1] bg-white"
                    }`}
                  >
                    {/* Card Top Meta */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#d6e7e1]/60">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Event Tag */}
                        <span className="rounded-lg bg-[#e8f3f0] border border-[#d6e7e1] px-2.5 py-0.5 text-[10px] font-bold text-[#0f6b5c]">
                          {item.hackathonName}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold shadow-2xs ${
                            isUrgent
                              ? "bg-red-500 text-white"
                              : isImportant
                              ? "bg-amber-500 text-white"
                              : "bg-[#0f6b5c] text-white"
                          }`}
                        >
                          {item.priority}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isPublished
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* Channels Indicator Icons & Recipient Count */}
                      <div className="flex items-center gap-3 text-xs text-[#57685f]">
                        {isPublished && (
                          <div className="flex items-center gap-1 font-bold text-[#0f6b5c]">
                            <Users className="h-3.5 w-3.5" />
                            <span>{item.recipientCount} Recipients</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-gray-400">
                          {item.channels.includes("IN_APP") && (
                            <span title="In-App Bell Alert">
                              <Bell className="h-4 w-4 text-[#0f6b5c]" />
                            </span>
                          )}
                          {item.channels.includes("EMAIL") && (
                            <span title="Email Broadcast">
                              <Mail className="h-4 w-4 text-emerald-600" />
                            </span>
                          )}
                          {item.channels.includes("PUSH") && (
                            <span title="Push Notification">
                              <Smartphone className="h-4 w-4 text-amber-600" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Announcement Content */}
                    <div className="py-4">
                      <h3 className="font-display text-base font-extrabold text-[#122622]">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#57685f] leading-relaxed mt-1.5 whitespace-pre-line">
                        {item.content}
                      </p>
                    </div>

                    {/* Card Footer Actions & Timestamp */}
                    <div className="flex items-center justify-between border-t border-[#d6e7e1]/60 pt-3 text-[11px] text-[#57685f]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span>
                          {isPublished
                            ? `Broadcast sent on ${new Date(item.publishedAt || item.createdAt).toLocaleDateString()} at ${new Date(item.publishedAt || item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : `Created on ${new Date(item.createdAt).toLocaleDateString()}`}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncement(item.id)}
                        className="flex items-center gap-1 text-red-500 font-bold hover:underline cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* 2. Create Announcement Modal Component */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in-50">
          <div className="w-full max-w-lg my-auto max-h-[92dvh] overflow-y-auto rounded-3xl border border-[#d6e7e1] bg-white p-5 sm:p-8 shadow-2xl animate-in zoom-in-95 flex flex-col gap-4 sm:gap-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c] shadow-2xs font-bold">
                  <Megaphone className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-base font-extrabold text-[#122622]">
                    Create & Broadcast Announcement
                  </h3>
                  <p className="text-[11px] font-semibold text-[#57685f]">
                    Send updates directly to participants' bells and inbox
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Target Hackathon Selector */}
            <div>
              <label className="block text-xs font-extrabold text-[#122622] mb-1">
                Target Hackathon Registered Participants *
              </label>
              <select
                value={formHackathonId}
                onChange={(e) => setFormHackathonId(e.target.value)}
                className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0]/30 px-4 text-xs font-bold text-[#122622] outline-none focus:border-[#0f6b5c]"
              >
                {managedHackathons.filter((h) => h.id !== "all").map((hck) => (
                  <option key={hck.id} value={hck.id}>
                    {hck.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Title / Subject Line */}
            <div>
              <label className="block text-xs font-extrabold text-[#122622] mb-1">
                Announcement Subject / Title *
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Submission Deadline Extended by 2 Hours!"
                className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0]/30 px-4 text-xs font-bold text-[#122622] outline-none focus:border-[#0f6b5c]"
              />
            </div>

            {/* Priority Level Radio Group */}
            <div>
              <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                Priority & Alert Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormPriority("INFO")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                    formPriority === "INFO"
                      ? "bg-[#0f6b5c] text-white shadow-xs"
                      : "bg-[#e8f3f0]/40 border border-[#d6e7e1] text-[#57685f]"
                  }`}
                >
                  <Info className="h-3.5 w-3.5" />
                  <span>INFO</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormPriority("IMPORTANT")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                    formPriority === "IMPORTANT"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-[#e8f3f0]/40 border border-[#d6e7e1] text-[#57685f]"
                  }`}
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>IMPORTANT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormPriority("URGENT")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                    formPriority === "URGENT"
                      ? "bg-red-500 text-white shadow-xs"
                      : "bg-[#e8f3f0]/40 border border-[#d6e7e1] text-[#57685f]"
                  }`}
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>URGENT</span>
                </button>
              </div>
            </div>

            {/* Message Content (Rich Text / Markdown area) */}
            <div>
              <label className="block text-xs font-extrabold text-[#122622] mb-1">
                Announcement Message Content *
              </label>
              <textarea
                rows={4}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Write message details (supports bold, links, code snippets)..."
                className="w-full rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0]/30 p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white"
              />
            </div>

            {/* Delivery Channels Checkboxes */}
            <div>
              <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                Delivery Channels
              </label>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#57685f]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formChannels.includes("IN_APP")}
                    onChange={() => handleToggleChannel("IN_APP")}
                    className="h-4 w-4 rounded border-gray-300 text-[#0f6b5c]"
                  />
                  <Bell className="h-3.5 w-3.5 text-[#0f6b5c]" />
                  <span>In-App Bell</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formChannels.includes("EMAIL")}
                    onChange={() => handleToggleChannel("EMAIL")}
                    className="h-4 w-4 rounded border-gray-300 text-[#0f6b5c]"
                  />
                  <Mail className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Email Broadcast</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formChannels.includes("PUSH")}
                    onChange={() => handleToggleChannel("PUSH")}
                    className="h-4 w-4 rounded border-gray-300 text-[#0f6b5c]"
                  />
                  <Smartphone className="h-3.5 w-3.5 text-amber-600" />
                  <span>Push Alert</span>
                </label>
              </div>
            </div>

            {/* Publish Actions Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 border-t border-[#d6e7e1] pt-3">
              <button
                type="button"
                onClick={() => handleSaveAnnouncement("DRAFT")}
                disabled={isSending}
                className="w-full sm:w-auto rounded-xl border border-[#d6e7e1] bg-white px-4 py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 transition-all cursor-pointer text-center"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSaveAnnouncement("PUBLISHED")}
                disabled={isSending || !formTitle.trim() || !formContent.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{isSending ? "Broadcasting..." : "Send Announcement Now"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
