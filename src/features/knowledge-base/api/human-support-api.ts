import { authFetch } from "@/lib/api-client";

export interface CreateSupportTicketPayload {
  subject: string;
  problem: string;
  description: string;
  priority?: "low" | "normal" | "high" | "urgent";
  scopeType?: "hackathon" | "organization";
  scopeId?: string;
  otherDetails?: string;
}

export interface SupportTicket {
  id: string;
  submitterId?: string;
  submitterName?: string;
  submitterEmail?: string;
  subject: string;
  status: "open" | "pending_staff" | "pending_user" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  category: string;
  scopeType?: string | null;
  scopeId?: string | null;
  messagesCount?: number;
  lastMessage?: {
    body: string;
    authorName: string;
    isStaffReply: boolean;
    createdAt: string | null;
  } | null;
  messages?: SupportTicketMessage[];
  conversationHistory?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketMessage {
  id: string;
  ticketId: string;
  authorId?: string;
  authorName?: string;
  authorEmail?: string;
  body: string;
  isStaffReply: boolean;
  createdAt: string;
}

export interface PaginatedSupportTickets {
  data: SupportTicket[];
  meta: {
    limit: number;
    offset: number;
    total: number;
  };
}

export async function createSupportTicket(
  payload: CreateSupportTicketPayload
): Promise<SupportTicket> {
  return authFetch<SupportTicket>("/support/tickets/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchMySupportTickets(
  statusFilter?: string,
  limit = 20,
  offset = 0
): Promise<PaginatedSupportTickets> {
  const query = new URLSearchParams();
  if (statusFilter) query.set("status", statusFilter);
  query.set("limit", limit.toString());
  query.set("offset", offset.toString());

  return authFetch<PaginatedSupportTickets>(`/support/tickets/?${query.toString()}`);
}

export async function fetchSupportTicketMessages(
  ticketId: string
): Promise<SupportTicketMessage[]> {
  return authFetch<SupportTicketMessage[]>(`/support/tickets/${ticketId}/messages/`);
}

export async function sendSupportTicketMessage(
  ticketId: string,
  body: string
): Promise<SupportTicketMessage> {
  return authFetch<SupportTicketMessage>(`/support/tickets/${ticketId}/messages/`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export async function fetchStaffTickets(
  statusFilter?: string,
  priorityFilter?: string,
  limit = 50,
  offset = 0
): Promise<PaginatedSupportTickets> {
  const query = new URLSearchParams();
  if (statusFilter && statusFilter !== "all") query.set("status", statusFilter);
  if (priorityFilter && priorityFilter !== "all") query.set("priority", priorityFilter);
  query.set("limit", limit.toString());
  query.set("offset", offset.toString());

  return authFetch<PaginatedSupportTickets>(`/support/staff/tickets/?${query.toString()}`);
}

export async function updateTicketStatus(
  ticketId: string,
  newStatus: "open" | "pending_staff" | "pending_user" | "resolved" | "closed"
): Promise<SupportTicket> {
  return authFetch<SupportTicket>(`/support/tickets/${ticketId}/status/`, {
    method: "PUT",
    body: JSON.stringify({ status: newStatus }),
  });
}

export interface InternalNote {
  id: string;
  ticketId: string;
  authorId?: string;
  authorName?: string;
  body: string;
  createdAt: string;
}

export async function fetchInternalNotes(ticketId: string): Promise<InternalNote[]> {
  return authFetch<InternalNote[]>(`/support/staff/notes/${ticketId}/`);
}

export async function createInternalNote(ticketId: string, body: string): Promise<InternalNote> {
  return authFetch<InternalNote>("/support/staff/notes/", {
    method: "POST",
    body: JSON.stringify({ ticketId, body }),
  });
}

