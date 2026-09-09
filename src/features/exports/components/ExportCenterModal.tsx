"use client";

import React, { useState } from "react";
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  Users,
  Layers,
  Send,
  Gavel,
  Trophy,
  BarChart3,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
} from "lucide-react";
import {
  downloadHackathonExport,
  ExportFormatType,
  ExportResourceType,
} from "../lib/exports-client";

interface HackathonOption {
  id: string;
  title: string;
  slug?: string;
}

interface ExportCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  hackathons: HackathonOption[];
  initialHackathonId?: string;
  initialResource?: ExportResourceType;
}

interface ResourceOption {
  id: ExportResourceType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  recommended?: boolean;
}

const RESOURCE_OPTIONS: ResourceOption[] = [
  {
    id: "complete",
    title: "Complete Hackathon Report",
    description: "Multi-sheet workbook: Overview, Participants, Teams, Submissions, Judging, Prizes & Analytics.",
    icon: Sparkles,
    badge: "Recommended",
    recommended: true,
  },
  {
    id: "participants",
    title: "Participant Registrations",
    description: "Names, emails, university/org, roles, skills, eligibility, registration status & referral source.",
    icon: Users,
  },
  {
    id: "teams",
    title: "Teams & Member Rosters",
    description: "Team names, leader contact, member rosters, ideas, and team formation status.",
    icon: Layers,
  },
  {
    id: "submissions",
    title: "Project Submissions",
    description: "Projects, descriptions, technologies, GitHub repositories, demo links & submission dates.",
    icon: Send,
  },
  {
    id: "judging",
    title: "Judging Results & Feedback",
    description: "Scores by criterion, judges, total & average scores, rankings, and feedback comments.",
    icon: Gavel,
  },
  {
    id: "prizes",
    title: "Prize Allocations & Winners",
    description: "Prize tiers, amounts, currencies, winning teams, positions, and total event budget.",
    icon: Trophy,
  },
  {
    id: "analytics",
    title: "Analytics & Demographics",
    description: "Registration/submission rates, role demographics, geographic breakdown & popular tags.",
    icon: BarChart3,
  },
];

const FORMAT_OPTIONS: { id: ExportFormatType; label: string; ext: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  {
    id: "xlsx",
    label: "Excel Spreadsheet",
    ext: ".xlsx",
    icon: FileSpreadsheet,
    desc: "Formatted multi-sheet workbook with styled tables & auto-widths",
  },
  {
    id: "csv",
    label: "CSV Table",
    ext: ".csv",
    icon: FileText,
    desc: "Universal comma-separated data table for spreadsheet import",
  },
  {
    id: "pdf",
    label: "PDF Executive Report",
    ext: ".pdf",
    icon: FileCode,
    desc: "Formatted visual PDF summary for leadership & sponsors",
  },
];

export function ExportCenterModal({
  isOpen,
  onClose,
  hackathons,
  initialHackathonId = "all",
  initialResource = "complete",
}: ExportCenterModalProps) {
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>(initialHackathonId);
  const [selectedResource, setSelectedResource] = useState<ExportResourceType>(initialResource);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormatType>("xlsx");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await downloadHackathonExport({
        hackathonId: selectedHackathonId,
        resource: selectedResource,
        format: selectedFormat,
      });

      setSuccessMsg("Export prepared and downloaded successfully!");
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to download export. Please try again.");
      setIsLoading(false);
    }
  };

  const selectedHackathonObj = hackathons.find((h) => h.id === selectedHackathonId);
  const eventName = selectedHackathonId === "all" ? "All Managed Hackathons" : selectedHackathonObj?.title || "Selected Event";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white border border-[#d6e7e1] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8f3f0] px-6 py-5 bg-[#f8faf9]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f6b5c] text-white shadow-md">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#122622] font-display">
                Organizer Export Center
              </h2>
              <p className="text-xs font-medium text-[#57685f]">
                Export live verified database records across managed hackathons
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl p-2 text-[#57685f] hover:bg-[#e8f3f0] hover:text-[#122622] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Notifications */}
          {errorMsg && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-700 font-medium animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 font-medium animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Select Hackathon Scope */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#122622] mb-2">
              1. Hackathon Scope
            </label>
            <div className="relative">
              <select
                value={selectedHackathonId}
                onChange={(e) => setSelectedHackathonId(e.target.value)}
                disabled={isLoading}
                className="w-full appearance-none rounded-2xl border border-[#d6e7e1] bg-white px-4 py-3 text-xs font-semibold text-[#122622] shadow-2xs focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#0f6b5c]/20 outline-none transition-all cursor-pointer"
              >
                <option value="all">🌟 All Managed Hackathons (Full Portfolio)</option>
                {hackathons
                  .filter((h) => h.id !== "all" && h.id !== "All")
                  .map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.title}
                    </option>
                  ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#57685f]">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* 2. Select What to Export */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#122622] mb-2">
              2. What would you like to export?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {RESOURCE_OPTIONS.map((opt) => {
                const isSelected = selectedResource === opt.id;
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedResource(opt.id)}
                    disabled={isLoading}
                    className={`relative flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#e8f3f0] border-[#0f6b5c] ring-2 ring-[#0f6b5c]/20 shadow-xs"
                        : "bg-white border-[#d6e7e1] hover:border-[#0f6b5c]/40 hover:bg-[#f8faf9]"
                    } ${opt.recommended ? "md:col-span-2 bg-linear-to-r from-white to-[#f0f9f6]" : ""}`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        isSelected
                          ? "bg-[#0f6b5c] text-white"
                          : "bg-[#e8f3f0] text-[#0f6b5c]"
                      }`}
                    >
                      <IconComponent className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#122622]">
                          {opt.title}
                        </span>
                        {opt.badge && (
                          <span className="rounded-full bg-[#0f6b5c] px-2 py-0.5 text-[10px] font-extrabold text-white">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#57685f] mt-0.5 line-clamp-2">
                        {opt.description}
                      </p>
                    </div>
                    <div
                      className={`flex h-4 w-4 shrink-0 rounded-full border items-center justify-center mt-1 transition-all ${
                        isSelected
                          ? "border-[#0f6b5c] bg-[#0f6b5c] text-white"
                          : "border-[#d6e7e1] bg-white"
                      }`}
                    >
                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Export Format */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#122622] mb-2">
              3. Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {FORMAT_OPTIONS.map((fmt) => {
                const isSelected = selectedFormat === fmt.id;
                const FmtIcon = fmt.icon;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setSelectedFormat(fmt.id)}
                    disabled={isLoading}
                    className={`flex flex-col items-center justify-center text-center p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#e8f3f0] border-[#0f6b5c] ring-2 ring-[#0f6b5c]/20 shadow-xs"
                        : "bg-white border-[#d6e7e1] hover:border-[#0f6b5c]/40 hover:bg-[#f8faf9]"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl mb-1.5 transition-colors ${
                        isSelected
                          ? "bg-[#0f6b5c] text-white"
                          : "bg-[#e8f3f0] text-[#0f6b5c]"
                      }`}
                    >
                      <FmtIcon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-[#122622]">
                      {fmt.label}
                    </span>
                    <span className="text-[10px] text-[#57685f] font-medium mt-0.5">
                      {fmt.ext}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary Preview Banner */}
          <div className="rounded-2xl bg-[#f8faf9] border border-[#d6e7e1] p-3.5 text-xs text-[#57685f] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#122622]">Target:</span>
              <span className="truncate max-w-[280px] text-[#0f6b5c] font-semibold">{eventName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#122622]">Format:</span>
              <span className="font-semibold uppercase text-[#0f6b5c]">.{selectedFormat}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[#e8f3f0] px-6 py-4 bg-[#f8faf9]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-2xl border border-[#d6e7e1] bg-white px-5 py-2.5 text-xs font-bold text-[#57685f] hover:bg-[#e8f3f0] hover:text-[#122622] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Preparing your export...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Download Export</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
