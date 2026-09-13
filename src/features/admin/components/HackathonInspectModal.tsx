"use client";

import { useState } from "react";
import {
  X,
  Trophy,
  Calendar,
  Users,
  Building2,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";
import { AdminHackathon } from "../lib/admin-client";

interface HackathonInspectModalProps {
  hackathon: AdminHackathon;
  onClose: () => void;
  onToggleSuspend: (id: string, reason?: string) => Promise<void>;
  onToggleFeatured: (id: string) => Promise<void>;
}

export function HackathonInspectModal({
  hackathon,
  onClose,
  onToggleSuspend,
  onToggleFeatured,
}: HackathonInspectModalProps) {
  const [suspendReason, setSuspendReason] = useState("");
  const [showSuspendInput, setShowSuspendInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSuspend = async () => {
    setIsProcessing(true);
    try {
      await onToggleSuspend(hackathon.id, suspendReason);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFeatured = async () => {
    setIsProcessing(true);
    try {
      await onToggleFeatured(hackathon.id);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="flex w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[92dvh] overflow-hidden">
        {/* Header Bar */}
        <div className="shrink-0 flex items-start justify-between gap-3 sm:gap-4 border-b border-[#d6e7e1] p-4 sm:p-6 pb-3 sm:pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c] border border-[#d6e7e1] font-display font-extrabold text-base shadow-xs">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-[#122622]">{hackathon.title}</h3>
                {hackathon.isFeatured && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 border border-amber-200">
                    FEATURED
                  </span>
                )}
                {hackathon.isSuspended && (
                  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-extrabold text-red-700 border border-red-200">
                    SUSPENDED
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-[#57685f]">
                Organized by <strong>{hackathon.hostOrgName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 text-xs">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="flex flex-col gap-1 rounded-2xl bg-[#f3f6f4] p-3 sm:p-3.5 border border-[#d6e7e1]">
              <span className="text-[11px] font-medium text-[#57685f]">Registered Devs</span>
              <span className="text-base font-extrabold text-[#122622]">{hackathon.participantsCount}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl bg-[#f3f6f4] p-3 sm:p-3.5 border border-[#d6e7e1]">
              <span className="text-[11px] font-medium text-[#57685f]">Formed Squads</span>
              <span className="text-base font-extrabold text-[#122622]">{hackathon.teamsCount}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl bg-[#f3f6f4] p-3 sm:p-3.5 border border-[#d6e7e1]">
              <span className="text-[11px] font-medium text-[#57685f]">Prize Pool</span>
              <span className="text-base font-extrabold text-[#0f6b5c]">{hackathon.prizePool}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl bg-[#f3f6f4] p-3 sm:p-3.5 border border-[#d6e7e1]">
              <span className="text-[11px] font-medium text-[#57685f]">Format</span>
              <span className="text-base font-extrabold text-[#122622] capitalize">{hackathon.locationMode}</span>
            </div>
          </div>

          {/* Schedule */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-[#f3f6f4] p-4 border border-[#d6e7e1]">
            <div className="flex items-center gap-2 text-[#57685f] text-xs">
              <Calendar className="h-4 w-4 text-[#0f6b5c] shrink-0" />
              <span>Timeline: <strong>{new Date(hackathon.startDate).toLocaleDateString()}</strong> &mdash; <strong>{new Date(hackathon.endDate).toLocaleDateString()}</strong></span>
            </div>
            <span className="rounded-xl bg-white px-3 py-1 font-bold text-[#122622] border border-[#d6e7e1] self-start sm:self-auto">
              Status: {hackathon.status.toUpperCase()}
            </span>
          </div>

          {/* Suspension reason display if suspended */}
          {hackathon.isSuspended && hackathon.suspendReason && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-red-50 p-4 border border-red-200 text-red-800">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-bold">Suspension Notice</p>
                <p className="text-[11px] leading-relaxed mt-0.5">{hackathon.suspendReason}</p>
              </div>
            </div>
          )}

          {/* Suspend Reason Form */}
          {showSuspendInput && (
            <div className="flex flex-col gap-2 rounded-2xl bg-red-50/70 p-4 border border-red-200">
              <label className="font-bold text-red-800">Provide suspension reason for organizers:</label>
              <textarea
                rows={2}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Terms violation or copyright issue..."
                className="w-full rounded-xl border border-red-200 bg-white p-2.5 text-xs text-[#122622] outline-none"
              />
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setShowSuspendInput(false)}
                  className="w-full sm:w-auto rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSuspend}
                  disabled={isProcessing}
                  className="w-full sm:w-auto rounded-xl bg-[#c4211c] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 text-center cursor-pointer"
                >
                  Confirm Suspension
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="shrink-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 border-t border-[#d6e7e1] p-4 sm:p-6 pt-3 sm:pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-center"
          >
            Close
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {/* Featured toggle */}
            <button
              type="button"
              onClick={handleFeatured}
              disabled={isProcessing}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition-colors cursor-pointer ${
                hackathon.isFeatured
                  ? "border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>{hackathon.isFeatured ? "Unfeature Event" : "Feature on Homepage"}</span>
            </button>

            {/* Suspend / Reactivate */}
            {hackathon.isSuspended ? (
              <button
                type="button"
                onClick={() => onToggleSuspend(hackathon.id)}
                disabled={isProcessing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#0b5347] transition-colors cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Reactivate Event</span>
              </button>
            ) : !showSuspendInput ? (
              <button
                type="button"
                onClick={() => setShowSuspendInput(true)}
                disabled={isProcessing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-xs font-extrabold text-[#c4211c] hover:bg-red-50 transition-colors cursor-pointer"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Suspend Event</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
