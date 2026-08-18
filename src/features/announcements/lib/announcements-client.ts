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

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-101",
    organizerId: "org-1",
    hackathonId: "hck-agritech",
    hackathonName: "AgriTech Hack 2024",
    title: "Submission Deadline Extended by 2 Hours!",
    content: "Due to high traffic on our code evaluation servers, we are extending the final project repository submission deadline to 6:00 PM EAT today. Make sure your GitHub links are public!",
    priority: "URGENT",
    channels: ["IN_APP", "EMAIL", "PUSH"],
    status: "PUBLISHED",
    recipientCount: 412,
    createdAt: "2024-08-11T11:30:00Z",
    publishedAt: "2024-08-11T11:30:00Z",
  },
  {
    id: "ann-102",
    organizerId: "org-1",
    hackathonId: "hck-agritech",
    hackathonName: "AgriTech Hack 2024",
    title: "Live Q&A Session with Ministry Mentors at 4:00 PM",
    content: "Join us in the virtual main hall for an interactive technical Q&A session with CTOs from the Ministry of Agriculture. Bring your questions about satellite API endpoints.",
    priority: "IMPORTANT",
    channels: ["IN_APP", "EMAIL"],
    status: "PUBLISHED",
    recipientCount: 412,
    createdAt: "2024-08-10T14:00:00Z",
    publishedAt: "2024-08-10T14:00:00Z",
  },
  {
    id: "ann-103",
    organizerId: "org-1",
    hackathonId: "hck-fintech",
    hackathonName: "FinTech Frontier",
    title: "Chapa Payment Sandbox Credentials Released",
    content: "Test API keys and merchant sandbox tokens for Chapa and Telebirr digital wallet integrations have been posted in the developer resources portal.",
    priority: "INFO",
    channels: ["IN_APP"],
    status: "PUBLISHED",
    recipientCount: 285,
    createdAt: "2024-08-09T09:15:00Z",
    publishedAt: "2024-08-09T09:15:00Z",
  },
  {
    id: "ann-104",
    organizerId: "org-1",
    hackathonId: "hck-fintech",
    hackathonName: "FinTech Frontier",
    title: "Draft: Final Judging Panel Schedule & Criteria",
    content: "Draft announcement outlining presentation time slots per team.",
    priority: "INFO",
    channels: ["IN_APP", "EMAIL"],
    status: "DRAFT",
    recipientCount: 0,
    createdAt: "2024-08-11T13:00:00Z",
  },
];

function getStoredAnnouncements(): Announcement[] {
  if (typeof window === "undefined") return INITIAL_ANNOUNCEMENTS;
  try {
    const raw = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_ANNOUNCEMENTS;
  } catch {
    return INITIAL_ANNOUNCEMENTS;
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
