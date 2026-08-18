"use client";

import { useState } from "react";
import {
  X,
  Building2,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Globe,
  AlertTriangle,
  Send,
  ShieldCheck,
} from "lucide-react";
import { AdminOrganizationRequest, OrgRequestStatus } from "../lib/admin-client";

interface OrgReviewModalProps {
  request: AdminOrganizationRequest;
  onClose: () => void;
  onDecide: (status: OrgRequestStatus, notes?: string) => Promise<void>;
}

export function OrgReviewModal({ request, onClose, onDecide }: OrgReviewModalProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onDecide("APPROVED", "Official accreditation and business registration verified.");
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;

    setIsProcessing(true);
    try {
      await onDecide("REJECTED", rejectReason);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="flex w-full max-w-2xl flex-col gap-6 rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b border-[#d6e7e1] pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c] border border-[#d6e7e1] font-display font-extrabold text-base shadow-xs">
              {request.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-[#122622]">{request.name}</h3>
                <span className="rounded-full bg-[#e8f3f0] px-2.5 py-0.5 text-[10px] font-extrabold text-[#0f6b5c] border border-[#d6e7e1]">
                  {request.orgType}
                </span>
              </div>
              <p className="text-xs font-medium text-[#57685f]">
                Submitted: {new Date(request.submittedAt).toLocaleDateString()} by {request.applicantName} ({request.applicantRole})
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

        {/* Modal Body Info Sections */}
        <div className="flex flex-col gap-5 text-xs">
          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-2xl bg-[#f3f6f4] p-4 border border-[#d6e7e1]">
            <div className="flex items-center gap-2 text-[#57685f]">
              <Mail className="h-4 w-4 text-[#0f6b5c]" />
              <span>Email: <strong>{request.email}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-[#57685f]">
              <Phone className="h-4 w-4 text-[#0f6b5c]" />
              <span>Phone: <strong>{request.phone}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-[#57685f]">
              <MapPin className="h-4 w-4 text-[#0f6b5c]" />
              <span>Location: <strong>{request.location}</strong></span>
            </div>
            {request.websiteUrl && (
              <div className="flex items-center gap-2 text-[#0f6b5c]">
                <Globe className="h-4 w-4" />
                <a href={request.websiteUrl} target="_blank" rel="noreferrer" className="underline font-bold">
                  {request.websiteUrl}
                </a>
              </div>
            )}
          </div>

          {/* Mission & Purpose */}
          <div className="flex flex-col gap-1.5">
            <h4 className="font-extrabold text-[#122622] uppercase tracking-wider text-[11px]">
              Mission Statement & Ecosystem Goals
            </h4>
            <p className="rounded-2xl bg-[#f3f6f4] p-3.5 border border-[#d6e7e1] leading-relaxed text-[#57685f]">
              {request.mission}
            </p>
          </div>

          {/* Planned Events Description */}
          <div className="flex flex-col gap-1.5">
            <h4 className="font-extrabold text-[#122622] uppercase tracking-wider text-[11px]">
              Planned Hackathons & Initiatives
            </h4>
            <p className="rounded-2xl bg-[#f3f6f4] p-3.5 border border-[#d6e7e1] leading-relaxed text-[#57685f]">
              {request.plannedEventsDescription}
            </p>
          </div>

          {/* Uploaded Verification Documents */}
          <div className="flex flex-col gap-2">
            <h4 className="font-extrabold text-[#122622] uppercase tracking-wider text-[11px]">
              Verification Credentials ({request.documents.length})
            </h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {request.documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 border border-[#d6e7e1] shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="font-bold text-[#122622] truncate">{doc.name}</p>
                      <p className="text-[10px] text-[#57685f]">{doc.type} • {doc.size}</p>
                    </div>
                  </div>
                  <span className="rounded-xl bg-[#e8f3f0] text-[#0f6b5c] px-2.5 py-1 text-[11px] font-bold">
                    Verified PDF
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rejection Form Drawer if toggled */}
          {showRejectForm && (
            <form onSubmit={handleReject} className="flex flex-col gap-3 rounded-2xl bg-red-50/70 border border-red-200 p-4">
              <div className="flex items-center gap-2 text-red-800 font-bold">
                <AlertTriangle className="h-4 w-4" />
                <span>Specify Rejection Reason & Feedback</span>
              </div>
              <textarea
                required
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Incomplete trade license documentation. Please re-upload verified Ministry credentials."
                className="w-full rounded-xl border border-red-200 bg-white p-3 text-xs text-[#122622] outline-none focus:border-red-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#c4211c] px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer"
                >
                  <XCircle className="h-4 w-4" />
                  <span>{isProcessing ? "Rejecting..." : "Confirm Rejection"}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer Actions */}
        {!showRejectForm && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d6e7e1] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Close
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-red-200 bg-white px-4 py-2.5 text-xs font-extrabold text-[#c4211c] hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject Application</span>
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#0b5347] transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isProcessing ? "Approving..." : "Approve & Grant Organizer Access"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
