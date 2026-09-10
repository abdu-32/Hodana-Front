"use client";

import React, { useState, useEffect } from "react";
import {
  LifeBuoy,
  X,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Tag,
  ShieldAlert,
  Sparkles,
  Copy,
  Check,
  Ticket as TicketIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { createSupportTicket, SupportTicket } from "../api/human-support-api";

interface HumanSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated?: (ticket: SupportTicket) => void;
  initialSubject?: string;
  initialDescription?: string;
  initialOtherDetails?: string;
}

export function HumanSupportModal({
  isOpen,
  onClose,
  onTicketCreated,
  initialSubject = "",
  initialDescription = "",
  initialOtherDetails = "",
}: HumanSupportModalProps) {
  const t = useTranslations("KnowledgeBase");

  const [subject, setSubject] = useState(initialSubject);
  const [problem, setProblem] = useState("technical");
  const [description, setDescription] = useState(initialDescription);
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [otherDetails, setOtherDetails] = useState(initialOtherDetails);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialSubject) setSubject(initialSubject);
      if (initialDescription) setDescription(initialDescription);
      if (initialOtherDetails) setOtherDetails(initialOtherDetails);
      setError(null);
      setCreatedTicket(null);
      setCopiedId(false);
    }
  }, [isOpen, initialSubject, initialDescription, initialOtherDetails]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        handleReset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError(t("descriptionPlaceholder") || "Subject and Description are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ticket = await createSupportTicket({
        subject: subject.trim(),
        problem,
        description: description.trim(),
        priority,
        otherDetails: otherDetails.trim() || undefined,
      });

      setCreatedTicket(ticket);
    } catch (err: any) {
      console.error("Failed to submit support ticket:", err);
      setError(
        err?.message || "Failed to submit support ticket. Please check your authentication status."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubject("");
    setProblem("technical");
    setDescription("");
    setPriority("normal");
    setOtherDetails("");
    setError(null);
    setCreatedTicket(null);
    setCopiedId(false);
    onClose();
  };

  const handleCopyTicketId = () => {
    if (!createdTicket?.id) return;
    navigator.clipboard.writeText(createdTicket.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleViewTickets = () => {
    const ticket = createdTicket;
    handleReset();
    if (ticket && onTicketCreated) {
      onTicketCreated(ticket);
    }
  };

  const isPrefilledFromAi = Boolean(initialSubject || initialDescription || initialOtherDetails);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-request-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleReset}
    >
      <div
        className="relative w-full max-w-2xl bg-surface border border-black/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-black/10 bg-surface-alt/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <LifeBuoy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2
                id="support-request-modal-title"
                className="font-display text-lg sm:text-xl font-bold tracking-tight text-text"
              >
                {t("humanSupportModalTitle")}
              </h2>
              <p className="text-xs text-text-muted">
                {t("humanSupportModalSubtitle")}
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="p-2 text-text-muted hover:text-text hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {createdTicket ? (
            /* Success confirmation screen */
            <div className="py-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="inline-flex p-4 rounded-2xl bg-success/10 text-success border border-success/20">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-text">
                  {t("ticketSuccessTitle")}
                </h3>
                <p className="text-sm text-text-muted max-w-md mx-auto leading-relaxed">
                  {t("ticketSuccessSubtitle")}
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-4.5 bg-surface-alt rounded-2xl border border-black/10 max-w-md mx-auto text-left space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs pb-2.5 border-b border-black/10">
                  <span className="font-medium text-text-muted">Ticket ID:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-primary">{createdTicket.id}</span>
                    <button
                      type="button"
                      onClick={handleCopyTicketId}
                      className="p-1 text-text-muted hover:text-text hover:bg-black/5 rounded-md transition-colors cursor-pointer"
                      title="Copy Ticket ID"
                    >
                      {copiedId ? (
                        <Check className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-text-muted">Subject:</span>
                  <span className="font-semibold text-text max-w-[220px] truncate">
                    {createdTicket.subject}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-text-muted">Category:</span>
                  <span className="capitalize font-medium text-text">
                    {createdTicket.category.replace("_", " ")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-text-muted">Priority:</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                      createdTicket.priority === "urgent"
                        ? "bg-danger/10 text-danger border border-danger/20"
                        : createdTicket.priority === "high"
                        ? "bg-warning/10 text-warning border border-warning/20"
                        : "bg-primary/10 text-primary border border-primary/20"
                    }`}
                  >
                    {createdTicket.priority}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-text-muted">Status:</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    Open
                  </span>
                </div>
              </div>

              {/* Success CTAs */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                {onTicketCreated && (
                  <button
                    type="button"
                    onClick={handleViewTickets}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    <TicketIcon className="w-4 h-4" />
                    <span>{t("viewTicketBtn") || "View My Tickets"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl border border-black/10 bg-surface text-text hover:bg-surface-alt text-sm font-medium transition-colors cursor-pointer"
                >
                  {t("closeBtn")}
                </button>
              </div>
            </div>
          ) : (
            /* Main Form */
            <form onSubmit={handleSubmit} className="space-y-4.5">
              {isPrefilledFromAi && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-accent" />
                  <span>
                    Context and summary prefilled from your conversation with the AI Support Assistant.
                  </span>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs sm:text-sm flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text flex items-center justify-between">
                  <span>
                    {t("subjectLabel")} <span className="text-danger">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t("subjectPlaceholder")}
                  className="w-full min-h-[44px] rounded-xl border border-black/12 bg-surface px-3.5 py-2 text-sm text-text placeholder:text-text-muted/60 shadow-2xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus focus:border-primary"
                  required
                />
              </div>

              {/* Category & Priority Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">
                    {t("problemLabel")}
                  </label>
                  <div className="relative">
                    <select
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-black/12 bg-surface px-3.5 pr-9 py-2 text-sm text-text shadow-2xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus focus:border-primary appearance-none cursor-pointer"
                    >
                      <option value="technical">{t("categoryTechnical")}</option>
                      <option value="billing">{t("categoryBilling")}</option>
                      <option value="general">{t("categoryGeneral")}</option>
                      <option value="hackathon_specific">{t("categoryHackathon")}</option>
                    </select>
                    <Tag className="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">
                    {t("priorityLabel")}
                  </label>
                  <div className="relative">
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full min-h-[44px] rounded-xl border border-black/12 bg-surface px-3.5 pr-9 py-2 text-sm text-text shadow-2xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus focus:border-primary appearance-none cursor-pointer"
                    >
                      <option value="low">{t("priorityLow")}</option>
                      <option value="normal">{t("priorityNormal")}</option>
                      <option value="high">{t("priorityHigh")}</option>
                      <option value="urgent">{t("priorityUrgent")}</option>
                    </select>
                    <ShieldAlert className="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text flex items-center justify-between">
                  <span>
                    {t("descriptionLabel")} <span className="text-danger">*</span>
                  </span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("descriptionPlaceholder")}
                  rows={4}
                  className="w-full rounded-xl border border-black/12 bg-surface p-3.5 text-sm text-text placeholder:text-text-muted/60 shadow-2xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus focus:border-primary resize-none min-h-[110px]"
                  required
                />
              </div>

              {/* Other Details */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text">
                  {t("otherDetailsLabel")}
                </label>
                <textarea
                  rows={3}
                  value={otherDetails}
                  onChange={(e) => setOtherDetails(e.target.value)}
                  placeholder={t("otherDetailsPlaceholder")}
                  className="w-full rounded-xl border border-black/12 bg-surface p-3.5 text-sm text-text placeholder:text-text-muted/60 shadow-2xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus focus:border-primary resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={handleReset}
                  className="min-h-[44px] px-4.5 py-2 rounded-xl border border-black/10 bg-surface text-text hover:bg-surface-alt font-medium text-sm transition-colors cursor-pointer"
                >
                  {t("closeBtn")}
                </button>

                <button
                  type="submit"
                  disabled={loading || !subject.trim() || !description.trim()}
                  className="min-h-[44px] px-6 py-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t("submittingTicket")}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t("submitTicketBtn")}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
