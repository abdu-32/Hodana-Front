"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Users,
  Calendar,
  Layers,
  Trash2,
} from "lucide-react";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { HackathonInspectModal } from "@/features/admin/components/HackathonInspectModal";
import { AdminHackathon, adminClient } from "@/features/admin/lib/admin-client";

export default function AdminHackathonsPage() {
  const [hackathons, setHackathons] = useState<AdminHackathon[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHackathon, setSelectedHackathon] = useState<AdminHackathon | null>(null);
  const [hackathonToDelete, setHackathonToDelete] = useState<AdminHackathon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadHackathons = async () => {
    setIsLoading(true);
    try {
      const list = await adminClient.getHackathons("ALL");
      setHackathons(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHackathons();
  }, []);

  const handleToggleSuspend = async (id: string, reason?: string) => {
    try {
      const updated = await adminClient.toggleHackathonSuspension(id, reason);
      await loadHackathons();
      setToastMessage(
        updated.isSuspended
          ? `Hackathon "${updated.title}" suspended.`
          : `Hackathon "${updated.title}" reactivated.`
      );
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setToastMessage(err?.message || "Failed to update hackathon suspension status.");
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const updated = await adminClient.toggleHackathonFeatured(id);
      await loadHackathons();
      setToastMessage(
        updated.isFeatured
          ? `Hackathon "${updated.title}" is now featured on the homepage.`
          : `Hackathon "${updated.title}" unfeatured.`
      );
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHackathon = async (id: string, title?: string) => {
    setIsDeleting(true);
    try {
      await adminClient.deleteHackathon(id);
      setHackathonToDelete(null);
      if (selectedHackathon?.id === id) {
        setSelectedHackathon(null);
      }
      await loadHackathons();
      setToastMessage(`Hackathon "${title || "Event"}" has been permanently deleted.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error("Failed to delete hackathon:", err);
      alert(err?.message || "Failed to delete hackathon. You must be an authorized platform administrator.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredHackathons = hackathons.filter((h) => {
    const matchesFilter =
      activeFilter === "ALL"
        ? true
        : activeFilter === "FLAGGED"
        ? h.isSuspended
        : h.status === activeFilter.toLowerCase();
    const matchesSearch =
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.hostOrgName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <AdminShell activeMenu="hackathons">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#0e2b25] px-5 py-3 text-xs font-extrabold text-white shadow-xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-extrabold text-[#0f6b5c]">
          <Trophy className="h-4 w-4" />
          <span>GLOBAL EVENT OVERSIGHT</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#122622]">
          Hackathon Moderation & Governance
        </h1>
        <p className="text-xs font-medium text-[#57685f]">
          Monitor nationwide hackathons, manage public feature status, and enforce platform compliance rules.
        </p>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-white p-4 sm:p-5 border border-[#d6e7e1] shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "PUBLISHED", "DRAFT", "FLAGGED"].map((tab) => {
            const count =
              tab === "ALL"
                ? hackathons.length
                : tab === "FLAGGED"
                ? hackathons.filter((h) => h.isSuspended).length
                : hackathons.filter((h) => h.status === tab.toLowerCase()).length;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === tab
                    ? "bg-[#0f6b5c] text-white shadow-xs"
                    : "bg-[#f3f6f4] text-[#57685f] hover:text-[#122622]"
                }`}
              >
                <span>
                  {tab === "ALL"
                    ? "All Events"
                    : tab === "PUBLISHED"
                    ? "Active Published"
                    : tab === "FLAGGED"
                    ? "Flagged / Suspended"
                    : "Drafts"}
                </span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                    activeFilter === tab ? "bg-white/20 text-white" : "bg-[#e8f3f0] text-[#0f6b5c]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Field */}
        <div className="relative flex items-center w-full sm:w-auto sm:min-w-[260px]">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event or host org..."
            className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] pl-10 pr-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
          />
        </div>
      </div>

      {/* Hackathons Table */}
      <div className="rounded-3xl border border-[#d6e7e1] bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#0f6b5c] border-t-transparent" />
            <p className="text-xs font-bold text-[#57685f]">Loading hackathons...</p>
          </div>
        ) : filteredHackathons.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#e8f3f0] text-[#0f6b5c]">
              <Trophy className="h-7 w-7" />
            </div>
            <p className="text-sm font-extrabold text-[#122622]">No Hackathons Found</p>
            <p className="text-xs text-[#57685f]">No events match the selected criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[760px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#d6e7e1] bg-[#f3f6f4] text-[#57685f] font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-6">Hackathon</th>
                  <th className="py-4 px-6">Host Organization</th>
                  <th className="py-4 px-6">Devs & Squads</th>
                  <th className="py-4 px-6">Prize Pool</th>
                  <th className="py-4 px-6">Status & Features</th>
                  <th className="py-4 px-6 text-right">Moderation Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d6e7e1]/60 font-medium text-[#122622]">
                {filteredHackathons.map((h) => (
                  <tr key={h.id} className="hover:bg-[#f3f6f4]/60 transition-colors">
                    {/* Event Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-[#c68a00] font-display font-extrabold text-sm border border-amber-100 shadow-2xs">
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-[#122622]">{h.title}</span>
                          <span className="text-[11px] text-[#57685f] capitalize">Format: {h.locationMode}</span>
                        </div>
                      </div>
                    </td>

                    {/* Host Org */}
                    <td className="py-4 px-6 text-[#57685f] font-bold">
                      {h.hostOrgName}
                    </td>

                    {/* Devs & Squads */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#122622]">{h.participantsCount} Devs</span>
                        <span className="text-[#57685f]">•</span>
                        <span className="text-[#57685f]">{h.teamsCount} Squads</span>
                      </div>
                    </td>

                    {/* Prize Pool */}
                    <td className="py-4 px-6 font-extrabold text-[#0f6b5c]">
                      {h.prizePool}
                    </td>

                    {/* Status & Featured */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {h.isSuspended ? (
                          <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-extrabold text-[#c4211c] border border-red-200">
                            SUSPENDED
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-[#16793d] border border-emerald-200 uppercase">
                            {h.status}
                          </span>
                        )}

                        {h.isFeatured && (
                          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-[#c68a00]" />
                            Featured
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Moderation Controls */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedHackathon(h)}
                          className="inline-flex items-center gap-1 rounded-xl bg-[#0f6b5c] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#0b5347] transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Inspect</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(h.id)}
                          title={h.isFeatured ? "Unfeature from homepage" : "Feature on homepage"}
                          className={`rounded-xl p-1.5 border transition-colors cursor-pointer ${
                            h.isFeatured
                              ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                              : "bg-white text-gray-400 border-gray-200 hover:text-[#c68a00] hover:bg-gray-50"
                          }`}
                        >
                          <Sparkles className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setHackathonToDelete(h)}
                          title="Delete Hackathon"
                          className="rounded-xl p-1.5 border border-red-100 bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Modal */}
      {selectedHackathon && (
        <HackathonInspectModal
          hackathon={selectedHackathon}
          onClose={() => setSelectedHackathon(null)}
          onToggleSuspend={handleToggleSuspend}
          onToggleFeatured={handleToggleFeatured}
        />
      )}

      {/* Delete Confirmation Modal */}
      {hackathonToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="flex w-full max-w-md flex-col gap-4 rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#122622]">Delete Hackathon</h3>
                <p className="text-xs text-[#57685f]">Irreversible Administrative Action</p>
              </div>
            </div>

            <div className="rounded-2xl bg-red-50/70 border border-red-200/60 p-4 text-xs text-red-950">
              <p className="font-semibold">
                Are you sure you want to permanently delete hackathon{" "}
                <span className="font-bold underline">{hackathonToDelete.title}</span>?
              </p>
              <p className="mt-1.5 text-[11px] text-red-700">
                This will remove the event, its registrations, tracks, and associated data from the platform.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setHackathonToDelete(null)}
                disabled={isDeleting}
                className="w-full sm:w-auto rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeleteHackathon(hackathonToDelete.id, hackathonToDelete.title)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-2xl bg-red-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-red-700 transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isDeleting ? "Deleting..." : "Delete Hackathon"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
