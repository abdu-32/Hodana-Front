"use client";

import { useState, useEffect } from "react";
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
  Plus,
  Rocket,
  Edit,
  Globe,
  Sparkles,
  Layers,
  ArrowRight,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { Logomark } from "@/components/ui/Logomark";
import { CreateHackathonModal } from "@/features/hackathons";
import { hackathonsClient } from "@/features/hackathons";
import type { Hackathon } from "@/lib/api-types-helpers";

export default function OrganizerHackathonsPage() {
  const t = useTranslations("Organizer");
  const { user } = useSession();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("hackathons");
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Delete State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedHackathonToEdit, setSelectedHackathonToEdit] = useState<Hackathon | null>(null);
  const [hackathonToDelete, setHackathonToDelete] = useState<Hackathon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const organizerName = user?.fullName || "Abeba Selassie";
  const organizerTitle = "Lead Organizer";
  const userInitial = organizerName.charAt(0).toUpperCase();

  const loadOrganizerHackathons = async () => {
    setIsLoading(true);
    try {
      const res = await hackathonsClient.listHackathons();
      if (res.data) {
        setHackathons(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch organizer hackathons:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizerHackathons();
  }, []);

  const handleModalSuccess = (saved: Hackathon) => {
    setHackathons((prev) => {
      const index = prev.findIndex((item) => item.id === saved.id || item.slug === saved.slug);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteHackathon = async (id: string) => {
    setIsDeleting(true);
    try {
      await hackathonsClient.deleteHackathon(id);
      setHackathons((prev) => prev.filter((h) => h.id !== id && h.slug !== id));
      setHackathonToDelete(null);
    } catch (err) {
      console.error("Failed to delete hackathon:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublishToggle = async (id: string) => {
    try {
      await hackathonsClient.updateHackathon(id, { status: "published" });
      setHackathons((prev) =>
        prev.map((item) =>
          item.id === id || item.slug === id ? { ...item, status: "published" as any } : item
        )
      );
    } catch (err) {
      console.error("Failed to publish hackathon:", err);
    }
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
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } bg-[#0f6b5c] text-white shadow-md font-bold`}
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
            <button
              type="button"
              onClick={() => {
                setSelectedHackathonToEdit(null);
                setIsCreateModalOpen(true);
              }}
              title={isSidebarCollapsed ? "+ Launch Project" : undefined}
              className={`flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#0b5347] cursor-pointer ${
                isSidebarCollapsed ? "px-0" : "px-4"
              }`}
            >
              <Rocket className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span className="whitespace-nowrap">+ Launch Project</span>}
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

        {/* ================= MAIN CONTENT AREA ================= */}
        <main className="flex min-w-0 flex-1 flex-col p-4 sm:p-6 lg:p-8 transition-all duration-300">
          {/* Header Title Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-8">
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#122622]">
                {t("managedHackathonsTitle")}
              </h1>
              <p className="text-xs text-[#57685f] mt-1">
                {t("managedHackathonsSubtitle")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedHackathonToEdit(null);
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{t("createHackathonBtn")}</span>
            </button>
          </div>

          {/* Conditional Rendering: List vs Empty State Featured Card */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0f6b5c] border-t-transparent" />
            </div>
          ) : hackathons.length > 0 ? (
            /* Created Hackathons Grid */
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {hackathons.map((hackathon) => {
                const isPublished =
                  hackathon.status === "published" || hackathon.status === ("active" as any);

                return (
                  <div
                    key={hackathon.id}
                    className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-2xs transition-all hover:shadow-md"
                  >
                    <div>
                      {/* Banner Image */}
                      <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-[#e8f3f0] mb-4">
                        <img
                          src={hackathon.bannerUrl || "/futuristic_city_banner.png"}
                          alt={hackathon.title}
                          className="h-full w-full object-cover"
                        />
                        <span
                          className={`absolute top-3 right-3 rounded-full px-3 py-1 text-[10px] font-extrabold shadow-sm ${
                            isPublished
                              ? "bg-[#16793d] text-white"
                              : "bg-gray-900/80 text-white backdrop-blur-md"
                          }`}
                        >
                          {isPublished ? "PUBLISHED" : "DRAFT"}
                        </span>
                      </div>

                      {/* Hackathon Details */}
                      <h3 className="font-display text-lg font-extrabold text-[#122622]">
                        {hackathon.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#57685f] line-clamp-2">
                        {hackathon.description}
                      </p>

                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {hackathon.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-lg bg-[#e8f3f0] border border-[#d6e7e1] px-2.5 py-0.5 text-[10px] font-bold text-[#0f6b5c]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-6 flex items-center justify-between border-t border-[#d6e7e1] pt-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedHackathonToEdit(hackathon);
                            setIsCreateModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold text-[#57685f] hover:text-[#0f6b5c] transition-colors cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setHackathonToDelete(hackathon)}
                          className="flex items-center gap-1 text-xs font-bold text-[#c4211c] hover:text-red-700 transition-colors cursor-pointer"
                          title="Delete Hackathon"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>

                      {!isPublished ? (
                        <button
                          type="button"
                          onClick={() => handlePublishToggle(hackathon.id)}
                          className="rounded-xl bg-[#0f6b5c] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-all cursor-pointer"
                        >
                          Publish Now
                        </button>
                      ) : (
                        <Link
                          href={`/hackathons/${hackathon.slug || hackathon.id}`}
                          className="flex items-center gap-1 text-xs font-bold text-[#0f6b5c] hover:underline"
                        >
                          <span>Public Page</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Screenshot-Matched Empty State Featured Card */
            <div className="my-12 flex items-center justify-center">
              <div className="w-full max-w-lg rounded-3xl bg-[#0e2b25] p-8 sm:p-10 text-center text-white shadow-2xl flex flex-col items-center justify-center gap-4 border border-[#0f6b5c]/30">
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {t("hostingEventTitle")}
                </h2>
                <p className="text-xs text-emerald-100/80 max-w-md leading-relaxed">
                  {t("hostingEventSubtitle")}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedHackathonToEdit(null);
                    setIsCreateModalOpen(true);
                  }}
                  className="mt-2 rounded-full bg-[#0f6b5c] hover:bg-[#0b5347] text-white font-extrabold text-xs px-8 py-3.5 shadow-md border border-[#d6e7e1]/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  {t("getEventFeaturedBtn")}
                </button>
              </div>
            </div>
          )}
        </main>
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
                  This will permanently delete this event.
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-[#57685f]">
              Are you sure you want to delete <strong className="text-[#122622]">&quot;{hackathonToDelete.title}&quot;</strong>? All associated registrations, tracks, and settings will be permanently removed.
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
    </div>
  );
}
