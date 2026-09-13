import { authFetch } from "@/lib/api-client";
import { notificationsClient } from "@/features/notifications/lib/notifications-client";

export type AnnouncementPriority = "INFO" | "IMPORTANT" | "URGENT";
export type AnnouncementStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED";

export interface Announcement {
  id: string;
  organizerId: string;
  hackathonId: string;
  hackathonName: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  channels: ("IN_APP" | "EMAIL" | "PUSH")[];
  status: AnnouncementStatus;
  recipientCount: number;
  createdAt: string;
  publishedAt?: string;
}

const ANNOUNCEMENTS_STORAGE_KEY = "hodana_organizer_announcements_v1";

const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

function getStoredAnnouncements(): Announcement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const legacyMockIds = new Set(["ann-101", "ann-102", "ann-103", "ann-104"]);
      return parsed.filter((item: Announcement) => !legacyMockIds.has(item.id));
    }
    return [];
  } catch {
    return [];
  }
}

function saveStoredAnnouncements(items: Announcement[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to persist announcements:", err);
    }
  }
}

export const announcementsClient = {
  // GET /api/organizer/announcements?hackathonId={id}
  async getAnnouncements(
    hackathonId: string = "all",
    statusFilter: string = "all"
  ): Promise<Announcement[]> {
    let list = getStoredAnnouncements();

    if (hackathonId !== "all") {
      list = list.filter((a) => a.hackathonId === hackathonId);
    }

    if (statusFilter !== "all") {
      list = list.filter(
        (a) => a.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // POST /api/organizer/announcements
  async createAnnouncement(
    data: Omit<Announcement, "id" | "createdAt" | "publishedAt" | "recipientCount">
  ): Promise<{ success: boolean; announcement: Announcement }> {
    const list = getStoredAnnouncements();

    const newAnnouncement: Announcement = {
      ...data,
      id: `ann-${Date.now()}`,
      recipientCount: data.status === "PUBLISHED" ? (data.hackathonId === "hck-fintech" ? 285 : 412) : 0,
      createdAt: new Date().toISOString(),
      publishedAt: data.status === "PUBLISHED" ? new Date().toISOString() : undefined,
    };

    // 1. Try dispatching to real backend notification broadcast
    if (data.status === "PUBLISHED") {
      try {
        const priorityTag = data.priority !== "INFO" ? `[${data.priority}] ` : "";
        const formattedMessage = `${priorityTag}${data.title}:\n${data.content}`;
        const targetHackathonId =
          data.hackathonId && data.hackathonId !== "all" ? data.hackathonId : null;

        await authFetch("/notifications/", {
          method: "POST",
          body: JSON.stringify({
            hackathonId: targetHackathonId,
            title: data.title,
            message: formattedMessage,
            channels: data.channels.map((c) => (c === "IN_APP" ? "in_portal" : c.toLowerCase())),
          }),
        });
      } catch (err) {
        console.warn("Backend announcement broadcast attempt:", err);
      }
    }

    // 2. Also record in notificationsClient for instant in-app delivery on participant devices
    if (data.status === "PUBLISHED") {
      notificationsClient.pushLocalNotification({
        id: newAnnouncement.id,
        title: newAnnouncement.title,
        message: newAnnouncement.content,
        priority: newAnnouncement.priority,
        hackathonId: newAnnouncement.hackathonId,
        hackathonTitle: newAnnouncement.hackathonName,
        createdAt: newAnnouncement.createdAt,
        read: false,
      });
    }

    const updated = [newAnnouncement, ...list];
    saveStoredAnnouncements(updated);

    return { success: true, announcement: newAnnouncement };
  },

  // DELETE /api/organizer/announcements/:id
  async deleteAnnouncement(id: string): Promise<{ success: boolean }> {
    const list = getStoredAnnouncements();
    const updated = list.filter((a) => a.id !== id);
    saveStoredAnnouncements(updated);
    return { success: true };
  },

  // GET /api/participant/hackathons/:id/announcements
  async getParticipantAnnouncements(hackathonId: string): Promise<Announcement[]> {
    const list = getStoredAnnouncements();
    return list.filter(
      (a) =>
        (a.hackathonId === hackathonId || a.hackathonId === "all") &&
        a.status === "PUBLISHED"
    );
  },
};
