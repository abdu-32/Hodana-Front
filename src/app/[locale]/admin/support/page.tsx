"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LifeBuoy,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  MessageSquare,
  User,
  Mail,
  FileText,
  Sparkles,
  RefreshCw,
  ChevronRight,
  X,
  Lock,
  Tag,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { AdminShell } from "@/features/admin/components/AdminShell";
import {
  SupportTicket,
  SupportTicketMessage,
  InternalNote,
  fetchStaffTickets,
  fetchSupportTicketMessages,
  sendSupportTicketMessage,
  updateTicketStatus,
  fetchInternalNotes,
  createInternalNote,
} from "@/features/knowledge-base/api/human-support-api";

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  open: {
    label: "Open",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  pending_staff: {
    label: "Needs Staff Action",
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
  },
  pending_user: {
    label: "Waiting on User",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  resolved: {
    label: "Resolved",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  closed: {
    label: "Closed",
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
  },
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  urgent: {
    label: "Urgent",
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
  },
  high: {
    label: "High",
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-300",
  },
  normal: {
    label: "Normal",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  low: {
    label: "Low",
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
  },
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("all");
  const [activePriorityFilter, setActivePriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Detail panel states
  const [activeDetailTab, setActiveDetailTab] = useState<"thread" | "notes">("thread");
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchStaffTickets(
        activeStatusFilter,
        activePriorityFilter,
        100,
        0
      );
      setTickets(res.data || []);
    } catch (err: any) {
      console.error("Failed to load support tickets:", err);
      showToast(err?.message || "Failed to load support tickets.");
    } finally {
      setIsLoading(false);
    }
  }, [activeStatusFilter, activePriorityFilter]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Load ticket details when selected
  const handleSelectTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsLoadingDetails(true);
    try {
      const [msgs, notes] = await Promise.all([
        fetchSupportTicketMessages(ticket.id).catch(() => []),
        fetchInternalNotes(ticket.id).catch(() => []),
      ]);
      setMessages(msgs);
      setInternalNotes(notes);
    } catch (err: any) {
      console.error("Failed to load ticket details:", err);
      showToast("Failed to load ticket conversation.");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Reply as staff
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim() || isSendingReply) return;

    setIsSendingReply(true);
    try {
      const newMsg = await sendSupportTicketMessage(selectedTicket.id, replyText.trim());
      setMessages((prev) => [...prev, newMsg]);
      setReplyText("");

      // Automatically updates ticket to pending_user
      setSelectedTicket((prev) =>
        prev ? { ...prev, status: "pending_user" } : null
      );
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id ? { ...t, status: "pending_user" } : t
        )
      );
      showToast("Reply sent to user and ticket updated to Waiting on User.");
    } catch (err: any) {
      console.error("Failed to send staff reply:", err);
      showToast(err?.message || "Failed to send reply.");
    } finally {
      setIsSendingReply(false);
    }
  };

  // Add internal note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !noteText.trim() || isAddingNote) return;

    setIsAddingNote(true);
    try {
      const newNote = await createInternalNote(selectedTicket.id, noteText.trim());
      setInternalNotes((prev) => [...prev, newNote]);
      setNoteText("");
      showToast("Internal note logged.");
    } catch (err: any) {
      console.error("Failed to add internal note:", err);
      showToast(err?.message || "Failed to add internal note.");
    } finally {
      setIsAddingNote(false);
    }
  };

  // Change ticket status
  const handleStatusChange = async (
    newStatus: "open" | "pending_staff" | "pending_user" | "resolved" | "closed"
  ) => {
    if (!selectedTicket || isUpdatingStatus || selectedTicket.status === newStatus) return;

    setIsUpdatingStatus(true);
    try {
      const updated = await updateTicketStatus(selectedTicket.id, newStatus);
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: newStatus } : t))
      );
      showToast(`Ticket status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}.`);
    } catch (err: any) {
      console.error("Failed to update status:", err);
      showToast(err?.message || "Failed to update ticket status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.subject.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.submitterName && t.submitterName.toLowerCase().includes(q)) ||
        (t.submitterEmail && t.submitterEmail.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q);

      const matchesStatus =
        activeStatusFilter === "all" || t.status === activeStatusFilter;
      const matchesPriority =
        activePriorityFilter === "all" || t.priority === activePriorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchQuery, activeStatusFilter, activePriorityFilter]);

  // Counts for summary cards
  const stats = useMemo(() => {
    const total = tickets.length;
    const actionRequired = tickets.filter(
      (t) => t.status === "open" || t.status === "pending_staff"
    ).length;
    const waitingUser = tickets.filter((t) => t.status === "pending_user").length;
    const resolved = tickets.filter(
      (t) => t.status === "resolved" || t.status === "closed"
    ).length;
    return { total, actionRequired, waitingUser, resolved };
  }, [tickets]);

  return (
    <AdminShell activeMenu="support">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#0e2b25] px-5 py-3 text-xs font-extrabold text-white shadow-xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#0f6b5c]">
            <LifeBuoy className="h-4 w-4" />
            <span>SUPPORT & ESCALATION DESK</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#122622]">
            Support Ticket Management
          </h1>
          <p className="text-xs font-medium text-[#57685f]">
            Review user help requests, reply as official platform staff, track status transitions, and log internal team notes.
          </p>
        </div>

        <button
          type="button"
          onClick={loadTickets}
          className="self-start sm:self-auto flex items-center gap-2 rounded-2xl border border-[#d6e7e1] bg-white px-4 py-2.5 text-xs font-bold text-[#122622] hover:bg-[#e8f3f0] hover:text-[#0f6b5c] transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-white p-5 border border-[#d6e7e1] shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between text-[#57685f]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Tickets</span>
            <LifeBuoy className="h-4 w-4 text-[#0f6b5c]" />
          </div>
          <div className="font-display text-2xl font-extrabold text-[#122622]">
            {stats.total}
          </div>
          <span className="text-[11px] text-[#57685f]">Platform-wide inquiries</span>
        </div>

        <div className="rounded-3xl bg-rose-50/50 p-5 border border-rose-200 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-bold uppercase tracking-wider">Needs Action</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="font-display text-2xl font-extrabold text-rose-900">
            {stats.actionRequired}
          </div>
          <span className="text-[11px] text-rose-700">Open or waiting on staff reply</span>
        </div>

        <div className="rounded-3xl bg-blue-50/50 p-5 border border-blue-200 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-xs font-bold uppercase tracking-wider">Awaiting User</span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div className="font-display text-2xl font-extrabold text-blue-900">
            {stats.waitingUser}
          </div>
          <span className="text-[11px] text-blue-700">Staff reply provided</span>
        </div>

        <div className="rounded-3xl bg-emerald-50/50 p-5 border border-emerald-200 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider">Resolved / Closed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="font-display text-2xl font-extrabold text-emerald-900">
            {stats.resolved}
          </div>
          <span className="text-[11px] text-emerald-700">Successfully concluded</span>
        </div>
      </div>

      {/* Main Split Layout: Ticket List & Ticket Detail Modal/Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main: Ticket Table and Filters */}
        <div className={`${selectedTicket ? "lg:col-span-7" : "lg:col-span-12"} flex flex-col gap-4 transition-all duration-300`}>
          {/* Filter and Search Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl bg-white p-4 border border-[#d6e7e1] shadow-xs">
            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
              {[
                { key: "all", label: "All" },
                { key: "open", label: "Open" },
                { key: "pending_staff", label: "Needs Staff" },
                { key: "pending_user", label: "Waiting User" },
                { key: "resolved", label: "Resolved" },
                { key: "closed", label: "Closed" },
              ].map((tab) => {
                const isActive = activeStatusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveStatusFilter(tab.key)}
                    className={`rounded-2xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#0f6b5c] text-white shadow-2xs"
                        : "bg-[#f3f6f4] text-[#57685f] hover:text-[#122622]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative flex items-center min-w-[220px]">
              <Search className="pointer-events-none absolute left-3.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject, user, ID..."
                className="h-9 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] pl-9 pr-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
              />
            </div>
          </div>

          {/* Tickets Table Card */}
          <div className="rounded-3xl border border-[#d6e7e1] bg-white shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#0f6b5c] border-t-transparent" />
                <p className="text-xs font-bold text-[#57685f]">Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#e8f3f0] text-[#0f6b5c]">
                  <LifeBuoy className="h-7 w-7" />
                </div>
                <p className="text-sm font-extrabold text-[#122622]">No Tickets Found</p>
                <p className="text-xs text-[#57685f]">
                  No tickets matched the current filter or search criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#d6e7e1] bg-[#f3f6f4] text-[#57685f] font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-5">Ticket / Submitter</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Priority</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d6e7e1]/60 font-medium text-[#122622]">
                    {filteredTickets.map((ticket) => {
                      const isSelected = selectedTicket?.id === ticket.id;
                      const statusCfg = STATUS_CONFIG[ticket.status] || {
                        label: ticket.status,
                        bg: "bg-gray-100",
                        text: "text-gray-700",
                        border: "border-gray-200",
                      };
                      const priorityCfg = PRIORITY_CONFIG[ticket.priority] || {
                        label: ticket.priority,
                        bg: "bg-gray-100",
                        text: "text-gray-700",
                        border: "border-gray-200",
                      };

                      return (
                        <tr
                          key={ticket.id}
                          onClick={() => handleSelectTicket(ticket)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-[#e8f3f0]/80 font-bold"
                              : "hover:bg-[#f3f6f4]/60"
                          }`}
                        >
                          <td className="py-3.5 px-5">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-extrabold text-[#122622] line-clamp-1">
                                {ticket.subject}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] text-[#57685f]">
                                <span className="font-mono text-[10px] text-[#0f6b5c] font-bold">
                                  #{ticket.id.slice(0, 8)}
                                </span>
                                <span>•</span>
                                <span>{ticket.submitterName || "User"}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                            >
                              {statusCfg.label}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${priorityCfg.bg} ${priorityCfg.text} ${priorityCfg.border}`}
                            >
                              {priorityCfg.label}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-[#57685f] capitalize">
                            {ticket.category.replace(/_/g, " ")}
                          </td>

                          <td className="py-3.5 px-4 text-[11px] text-[#57685f] whitespace-nowrap">
                            {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectTicket(ticket);
                              }}
                              className="inline-flex items-center justify-center h-7 w-7 rounded-xl border border-[#d6e7e1] bg-white text-[#57685f] hover:text-[#0f6b5c] hover:bg-[#e8f3f0] transition-colors cursor-pointer"
                              title="View conversation and reply"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Pane (Visible when ticket selected) */}
        {selectedTicket && (
          <div className="lg:col-span-5 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-xs flex flex-col gap-4">
              {/* Detail Header with Close Button */}
              <div className="flex items-start justify-between gap-3 border-b border-[#d6e7e1] pb-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0f6b5c] bg-[#e8f3f0] px-2 py-0.5 rounded-md">
                      #{selectedTicket.id.slice(0, 8)}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold border ${
                        STATUS_CONFIG[selectedTicket.status]?.bg
                      } ${STATUS_CONFIG[selectedTicket.status]?.text} ${
                        STATUS_CONFIG[selectedTicket.status]?.border
                      }`}
                    >
                      {STATUS_CONFIG[selectedTicket.status]?.label || selectedTicket.status}
                    </span>
                  </div>
                  <h2 className="font-display text-base font-extrabold text-[#122622] leading-snug">
                    {selectedTicket.subject}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#122622] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Submitter Info Card */}
              <div className="rounded-2xl bg-[#f3f6f4] p-3.5 flex flex-col gap-1.5 text-xs text-[#57685f]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#122622]">
                    {selectedTicket.submitterName || "Registered User"}
                  </span>
                  <span className="text-[11px]">
                    {new Date(selectedTicket.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {selectedTicket.submitterEmail && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#57685f]">
                    <Mail className="h-3 w-3" />
                    <span>{selectedTicket.submitterEmail}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1 text-[11px]">
                  <span className="capitalize">
                    Category: <strong>{selectedTicket.category.replace(/_/g, " ")}</strong>
                  </span>
                  <span>•</span>
                  <span className="uppercase">
                    Priority: <strong>{selectedTicket.priority}</strong>
                  </span>
                </div>
              </div>

              {/* Status Update Quick Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-[#57685f] uppercase tracking-wider">
                  Update Ticket Status:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(["open", "pending_staff", "pending_user", "resolved", "closed"] as const).map(
                    (st) => {
                      const isCurrent = selectedTicket.status === st;
                      const cfg = STATUS_CONFIG[st];
                      return (
                        <button
                          key={st}
                          type="button"
                          disabled={isUpdatingStatus || isCurrent}
                          onClick={() => handleStatusChange(st)}
                          className={`rounded-xl px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                            isCurrent
                              ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-[#0f6b5c]/30 font-black`
                              : "border-[#d6e7e1] bg-white text-[#57685f] hover:bg-[#f3f6f4]"
                          }`}
                        >
                          {cfg.label}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Tabs: Public Conversation Thread vs Internal Staff Notes */}
              <div className="flex border-b border-[#d6e7e1] gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveDetailTab("thread")}
                  className={`pb-2 text-xs font-extrabold transition-all cursor-pointer relative ${
                    activeDetailTab === "thread"
                      ? "text-[#0f6b5c] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0f6b5c]"
                      : "text-[#57685f] hover:text-[#122622]"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Conversation Thread ({messages.length})</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDetailTab("notes")}
                  className={`pb-2 text-xs font-extrabold transition-all cursor-pointer relative ${
                    activeDetailTab === "notes"
                      ? "text-[#0f6b5c] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0f6b5c]"
                      : "text-[#57685f] hover:text-[#122622]"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-amber-600" />
                    <span>Internal Staff Notes ({internalNotes.length})</span>
                  </div>
                </button>
              </div>

              {/* Tab 1: Conversation Messages */}
              {activeDetailTab === "thread" && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                    {isLoadingDetails ? (
                      <div className="py-10 text-center text-xs text-[#57685f]">
                        Loading thread...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="py-6 text-center text-xs text-[#57685f]">
                        No messages recorded yet.
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isStaff = msg.isStaffReply;
                        return (
                          <div
                            key={msg.id}
                            className={`rounded-2xl p-3.5 text-xs flex flex-col gap-1.5 border ${
                              isStaff
                                ? "bg-emerald-50/60 border-emerald-200"
                                : "bg-white border-[#d6e7e1]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-[#122622]">
                                  {msg.authorName || (isStaff ? "Platform Staff" : "User")}
                                </span>
                                {isStaff && (
                                  <span className="rounded-md bg-emerald-200 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider text-emerald-900">
                                    Platform Staff
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#57685f]">
                                {new Date(msg.createdAt).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-[#334155] whitespace-pre-wrap leading-relaxed text-[12px]">
                              {msg.body}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Staff Reply Form */}
                  <form onSubmit={handleSendReply} className="flex flex-col gap-2 pt-2 border-t border-[#d6e7e1]">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#57685f]">
                      <span>Send Official Staff Reply:</span>
                      <span className="text-[10px] text-emerald-700">
                        Will notify user via email & in-portal
                      </span>
                    </div>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your response to the user here..."
                      rows={3}
                      className="w-full rounded-2xl border border-[#d6e7e1] p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] resize-none"
                    />
                    <button
                      type="submit"
                      disabled={isSendingReply || !replyText.trim()}
                      className="self-end flex items-center gap-2 rounded-xl bg-[#0f6b5c] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#0e2b25] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{isSendingReply ? "Sending..." : "Send Staff Reply"}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 2: Internal Staff Notes */}
              {activeDetailTab === "notes" && (
                <div className="flex flex-col gap-3">
                  <div className="rounded-xl bg-amber-50 p-2.5 text-[11px] text-amber-900 font-semibold border border-amber-200">
                    Staff Private: Notes logged here are never visible to the user.
                  </div>

                  <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {internalNotes.length === 0 ? (
                      <div className="py-6 text-center text-xs text-[#57685f]">
                        No internal notes recorded yet.
                      </div>
                    ) : (
                      internalNotes.map((note) => (
                        <div
                          key={note.id}
                          className="rounded-2xl bg-amber-50/40 border border-amber-200/80 p-3 text-xs flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between text-[10px] text-amber-900 font-bold">
                            <span>{note.authorName || "Staff Member"}</span>
                            <span>
                              {new Date(note.createdAt).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-[#334155] whitespace-pre-wrap">{note.body}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="flex flex-col gap-2 pt-2 border-t border-[#d6e7e1]">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add an internal note or context for team members..."
                      rows={2}
                      className="w-full rounded-2xl border border-[#d6e7e1] p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] resize-none"
                    />
                    <button
                      type="submit"
                      disabled={isAddingNote || !noteText.trim()}
                      className="self-end flex items-center gap-2 rounded-xl bg-[#122622] px-4 py-2 text-xs font-extrabold text-white hover:bg-black transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>{isAddingNote ? "Saving Note..." : "Add Private Note"}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
