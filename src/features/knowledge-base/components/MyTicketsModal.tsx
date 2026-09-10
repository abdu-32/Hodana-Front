"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LifeBuoy,
  X,
  Send,
  Loader2,
  AlertCircle,
  MessageSquare,
  Clock,
  CheckCircle2,
  ChevronLeft,
  User,
  ShieldCheck,
  RefreshCw,
  Search,
  Copy,
  Check,
  Tag,
  Ticket as TicketIcon,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  fetchMySupportTickets,
  fetchSupportTicketMessages,
  sendSupportTicketMessage,
  SupportTicket,
  SupportTicketMessage,
} from "../api/human-support-api";

interface MyTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewTicketModal?: () => void;
}

type StatusFilterTab = "ALL" | "OPEN" | "PENDING_STAFF" | "PENDING_USER" | "RESOLVED";

export function MyTicketsModal({
  isOpen,
  onClose,
  onOpenNewTicketModal,
}: MyTicketsModalProps) {
  const t = useTranslations("KnowledgeBase");

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [replyText, setReplyText] = useState("");

  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<StatusFilterTab>("ALL");
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [copiedId, setCopiedId] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadTickets = async () => {
    setLoadingTickets(true);
    setError(null);
    try {
      const res = await fetchMySupportTickets();
      const list = res.data || [];
      setTickets(list);

      // If user had selected ticket, update reference; otherwise pick first if on desktop
      if (selectedTicket) {
        const updated = list.find((item) => item.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      } else if (list.length > 0 && typeof window !== "undefined" && window.innerWidth >= 768) {
        setSelectedTicket(list[0]);
      }
    } catch (err: any) {
      console.error("Error loading support tickets:", err);
      setError("Unable to load support tickets. Please sign in to view your tickets.");
    } finally {
      setLoadingTickets(false);
    }
  };

  const loadTicketMessages = async (ticketId: string) => {
    setLoadingMessages(true);
    try {
      const msgs = await fetchSupportTicketMessages(ticketId);
      setMessages(msgs || []);
    } catch (err: any) {
      console.error("Error loading ticket messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTickets();
      setMobileView("list");
      setSuccessToast(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTicket) {
      loadTicketMessages(selectedTicket.id);
    } else {
      setMessages([]);
    }
  }, [selectedTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !sendingReply) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, sendingReply, onClose]);

  if (!isOpen) return null;

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setMobileView("detail");
  };

  const handleCopyTicketId = () => {
    if (!selectedTicket?.id) return;
    navigator.clipboard.writeText(selectedTicket.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim() || sendingReply) return;

    setSendingReply(true);
    try {
      const newMsg = await sendSupportTicketMessage(selectedTicket.id, replyText.trim());
      setMessages((prev) => [...prev, newMsg]);
      setReplyText("");
      setSuccessToast("Reply dispatched to support team!");
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      console.error("Failed to send message:", err);
      setError("Failed to send message reply. Please try again.");
    } finally {
      setSendingReply(false);
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    // Status filter
    if (activeTab === "OPEN" && t.status !== "open") return false;
    if (activeTab === "PENDING_STAFF" && t.status !== "pending_staff") return false;
    if (activeTab === "PENDING_USER" && t.status !== "pending_user") return false;
    if (activeTab === "RESOLVED" && t.status !== "resolved" && t.status !== "closed") return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSubject = t.subject.toLowerCase().includes(q);
      const matchCategory = t.category.toLowerCase().includes(q);
      const matchId = t.id.toLowerCase().includes(q);
      if (!matchSubject && !matchCategory && !matchId) return false;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
      case "closed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Resolved</span>
          </span>
        );
      case "pending_staff":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning/10 text-warning border border-warning/20">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </span>
        );
      case "pending_user":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <MessageSquare className="w-3 h-3" />
            <span>Needs Reply</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Open</span>
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-danger/10 text-danger border border-danger/20">
            Urgent
          </span>
        );
      case "high":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-warning/10 text-warning border border-warning/20">
            High
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-surface-alt text-text-muted border border-black/10">
            {priority}
          </span>
        );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-tickets-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-surface border border-black/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[88vh] sm:h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Alert */}
        {successToast && (
          <div className="absolute top-4 right-14 z-50 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-lg animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-200" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-black/10 bg-surface-alt/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <LifeBuoy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2
                id="support-tickets-modal-title"
                className="font-display text-lg sm:text-xl font-bold tracking-tight text-text"
              >
                {t("myTicketsBtn")}
              </h2>
              <p className="text-xs text-text-muted hidden sm:block">
                Track your active support requests, view staff replies, and follow up.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenNewTicketModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNewTicketModal();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Ticket</span>
              </button>
            )}

            <button
              onClick={loadTickets}
              className="p-2 text-text-muted hover:text-text hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
              title="Refresh Tickets"
              aria-label="Refresh Tickets"
            >
              <RefreshCw className={`w-4 h-4 ${loadingTickets ? "animate-spin text-primary" : ""}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Layout: 2 Columns on desktop; switchable on mobile */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-black/10">
          {/* Left Column: Tickets List & Filter Bar (hidden on mobile when viewing detail) */}
          <div
            className={`flex flex-col h-full bg-surface-alt/40 overflow-hidden md:col-span-5 ${
              mobileView === "detail" ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Search Bar */}
            <div className="p-3.5 border-b border-black/10 bg-surface">
              <div className="relative">
                <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search tickets by subject, category, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-surface-alt border border-black/10 text-xs text-text placeholder:text-text-muted/60 focus-visible:outline-2 focus-visible:outline-focus focus:border-primary transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 p-2 px-3 overflow-x-auto border-b border-black/10 bg-surface/60 no-scrollbar">
              {[
                { id: "ALL", label: "All", count: tickets.length },
                {
                  id: "OPEN",
                  label: "Open",
                  count: tickets.filter((t) => t.status === "open").length,
                },
                {
                  id: "PENDING_STAFF",
                  label: "Pending",
                  count: tickets.filter((t) => t.status === "pending_staff").length,
                },
                {
                  id: "PENDING_USER",
                  label: "Needs Reply",
                  count: tickets.filter((t) => t.status === "pending_user").length,
                },
                {
                  id: "RESOLVED",
                  label: "Resolved",
                  count: tickets.filter((t) => t.status === "resolved" || t.status === "closed")
                    .length,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as StatusFilterTab)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-2xs"
                      : "text-text-muted hover:bg-black/5 hover:text-text"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      activeTab === tab.id ? "bg-white/20 text-white" : "bg-black/5 text-text-muted"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 m-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Tickets Feed */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
              {loadingTickets ? (
                <div className="flex flex-col items-center justify-center py-16 text-text-muted gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-xs">Loading your tickets...</span>
                </div>
              ) : tickets.length === 0 ? (
                /* Zero tickets submitted */
                <div className="text-center py-12 px-4 space-y-3 bg-surface rounded-2xl border border-black/10 my-4">
                  <div className="inline-flex p-3.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                    <TicketIcon className="w-6 h-6" />
                  </div>
                  <h4 className="font-display text-sm font-bold text-text">
                    No support tickets yet
                  </h4>
                  <p className="text-xs text-text-muted leading-relaxed max-w-xs mx-auto">
                    Have an issue with registration, submissions, or payments? Submit a support request and our team will get in touch.
                  </p>
                  {onOpenNewTicketModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenNewTicketModal();
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Submit a Support Request</span>
                    </button>
                  )}
                </div>
              ) : filteredTickets.length === 0 ? (
                /* No tickets matching filter/search */
                <div className="text-center py-12 text-text-muted space-y-2">
                  <Search className="w-6 h-6 mx-auto opacity-40" />
                  <p className="text-xs">No tickets match your filter criteria.</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveTab("ALL");
                    }}
                    className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filteredTickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id;
                  const isNeedsReply = t.status === "pending_user";

                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTicket(t)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                        isSelected
                          ? "bg-primary/5 border-primary/50 ring-1 ring-primary/20"
                          : "bg-surface border-black/10 hover:border-black/20 hover:bg-surface-alt/70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-xs sm:text-sm font-semibold text-text line-clamp-1">
                          {t.subject}
                        </span>
                        {getStatusBadge(t.status)}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-primary font-bold">
                            #{t.id.slice(0, 8)}
                          </span>
                          <span className="capitalize">{t.category.replace("_", " ")}</span>
                        </div>
                        {getPriorityBadge(t.priority)}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-text-muted/80 pt-2 mt-2 border-t border-black/5">
                        <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                        {isNeedsReply ? (
                          <span className="inline-flex items-center gap-1 font-bold text-primary animate-pulse">
                            <MessageSquare className="w-3 h-3" />
                            <span>Action needed</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{t.messagesCount ?? 1}</span>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Ticket Details & Messages Thread */}
          <div
            className={`flex flex-col h-full bg-surface md:col-span-7 ${
              mobileView === "list" ? "hidden md:flex" : "flex"
            }`}
          >
            {selectedTicket ? (
              <>
                {/* Detail Top Subheader */}
                <div className="p-4 border-b border-black/10 bg-surface-alt/50 flex flex-col gap-2 shrink-0">
                  {/* Mobile Back Button */}
                  <div className="flex md:hidden items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setMobileView("list")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back to tickets</span>
                    </button>
                    {getStatusBadge(selectedTicket.status)}
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <h3 className="font-display text-sm sm:text-base font-bold text-text truncate">
                        {selectedTicket.subject}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-primary">
                            #{selectedTicket.id}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyTicketId}
                            className="p-1 text-text-muted hover:text-text hover:bg-black/5 rounded-md transition-colors cursor-pointer"
                            title="Copy Ticket ID"
                          >
                            {copiedId ? (
                              <Check className="w-3 h-3 text-success" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <span>•</span>
                        <span className="capitalize flex items-center gap-1">
                          <Tag className="w-3 h-3 text-text-muted" />
                          {selectedTicket.category.replace("_", " ")}
                        </span>
                        <span>•</span>
                        <span>{getPriorityBadge(selectedTicket.priority)}</span>
                      </div>
                    </div>

                    <div className="hidden md:block shrink-0">
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-surface-alt/20">
                  {loadingMessages ? (
                    <div className="flex flex-col items-center justify-center py-16 text-text-muted gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-xs">Loading conversation history...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-text-muted text-xs">
                      No messages recorded in this conversation yet.
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isStaff = m.isStaffReply;
                      const authorTitle = isStaff
                        ? `Platform Support Specialist${m.authorName ? ` (${m.authorName})` : ""}`
                        : m.authorName || "You";
                      const dateStr = new Date(m.createdAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <div
                          key={m.id}
                          className={`flex gap-3 max-w-[88%] ${
                            isStaff ? "mr-auto" : "ml-auto flex-row-reverse"
                          }`}
                        >
                          {/* Avatar */}
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 mt-1 ${
                              isStaff
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "bg-primary text-white"
                            }`}
                          >
                            {isStaff ? (
                              <ShieldCheck className="w-4 h-4" />
                            ) : (
                              <User className="w-3.5 h-3.5" />
                            )}
                          </div>

                          {/* Bubble */}
                          <div
                            className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm space-y-1.5 shadow-2xs ${
                              isStaff
                                ? "bg-surface border border-black/10 text-text rounded-tl-none"
                                : "bg-primary text-white rounded-tr-none"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4 pb-1 border-b border-black/5 text-[11px]">
                              <span
                                className={`font-semibold ${
                                  isStaff ? "text-primary" : "text-emerald-100"
                                }`}
                              >
                                {authorTitle}
                              </span>
                              <span className={isStaff ? "text-text-muted" : "text-emerald-200"}>
                                {dateStr}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Resolved Banner */}
                  {(selectedTicket.status === "resolved" || selectedTicket.status === "closed") && (
                    <div className="p-3.5 rounded-xl bg-success/10 border border-success/20 text-success text-xs text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        This ticket has been marked as resolved. You can still send a follow-up reply below if you need further help.
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Form */}
                <form
                  onSubmit={handleSendReply}
                  className="p-3 sm:p-4 border-t border-black/10 bg-surface flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a reply to Platform Support..."
                    disabled={sendingReply}
                    className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl border border-black/12 bg-surface text-xs sm:text-sm text-text placeholder:text-text-muted/60 focus-visible:outline-2 focus-visible:outline-focus focus:border-primary transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="min-h-[44px] px-4 sm:px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                  >
                    {sendingReply ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </>
            ) : (
              /* No ticket selected on desktop */
              <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-8 text-center space-y-3">
                <div className="p-4 rounded-2xl bg-surface-alt border border-black/10">
                  <TicketIcon className="w-8 h-8 text-text-muted opacity-60" />
                </div>
                <h4 className="font-display text-base font-bold text-text">
                  No ticket selected
                </h4>
                <p className="text-xs text-text-muted max-w-xs leading-relaxed">
                  Choose a support ticket from the list on the left to view messages and reply to platform staff.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

