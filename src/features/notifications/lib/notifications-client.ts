import { authFetch } from "@/lib/api-client";

export interface NotificationDeliveryItem {
  id: string;
  notificationId: string;
  hackathonId?: string | null;
  message: string;
  channel: "in_portal" | "email" | "sms";
  status: "pending" | "sent" | "failed";
  createdAt: string;
  readAt?: string | null;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  priority: "INFO" | "IMPORTANT" | "URGENT";
  hackathonId?: string | null;
  hackathonTitle?: string;
  createdAt: string;
  read: boolean;
  type?: string;
}

const LOCAL_NOTIFS_STORAGE_KEY = "hodana_user_notifications_v1";

function getLocalNotifications(): InAppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_NOTIFS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalNotifications(list: InAppNotification[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_NOTIFS_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn("Failed to persist local notifications:", err);
  }
}

export const notificationsClient = {
  /**
   * Fetch list of user's notifications.
   * Merges real backend `/api/v1/notifications/me` with local storage announcements.
   */
  async getMyNotifications(unreadOnly = false): Promise<InAppNotification[]> {
    let backendItems: InAppNotification[] = [];

    try {
      const body = await authFetch<any>(`/notifications/me${unreadOnly ? "?unread=true" : ""}`, {
        method: "GET",
      });
      if (body) {
        const data: NotificationDeliveryItem[] = Array.isArray(body)
          ? body
          : Array.isArray(body.data)
          ? body.data
          : [];

        backendItems = data.map((d) => {
          let title = "Hackathon Announcement";
          let message = d.message || "";
          let priority: "INFO" | "IMPORTANT" | "URGENT" = "INFO";

          // Parse priority tag if formatted like [URGENT] or [IMPORTANT]
          if (message.startsWith("[URGENT]")) {
            priority = "URGENT";
            message = message.replace("[URGENT]", "").trim();
          } else if (message.startsWith("[IMPORTANT]")) {
            priority = "IMPORTANT";
            message = message.replace("[IMPORTANT]", "").trim();
          }

          // Split Title / Body if formatted as "Title: Content"
          if (message.includes(":\n")) {
            const parts = message.split(":\n");
            title = parts[0].trim();
            message = parts.slice(1).join(":\n").trim();
          } else if (message.includes(" - ")) {
            const parts = message.split(" - ");
            title = parts[0].trim();
            message = parts.slice(1).join(" - ").trim();
          }

          return {
            id: d.id,
            title: title || "Notification",
            message: message || d.message,
            priority,
            hackathonId: d.hackathonId,
            createdAt: d.createdAt,
            read: Boolean(d.readAt),
          };
        });
      }
    } catch (err) {
      console.warn("Could not reach backend /notifications/me, fallback to storage:", err);
    }

    // Also pull local announcements broadcasted on this machine
    const local = getLocalNotifications();

    // Deduplicate by ID
    const seenIds = new Set<string>();
    const merged: InAppNotification[] = [];

    for (const item of [...backendItems, ...local]) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        if (!unreadOnly || !item.read) {
          merged.push(item);
        }
      }
    }

    return merged.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  /**
   * Mark a single notification as read
   */
  async markRead(deliveryId: string): Promise<boolean> {
    try {
      await authFetch(`/notifications/me/${deliveryId}/read`, {
        method: "POST",
      });
    } catch (err) {
      console.warn("Backend markRead failed, updating local state:", err);
    }

    // Update local storage
    const local = getLocalNotifications();
    const updated = local.map((n) => (n.id === deliveryId ? { ...n, read: true } : n));
    saveLocalNotifications(updated);
    return true;
  },

  /**
   * Mark all notifications as read
   */
  async markAllRead(): Promise<boolean> {
    try {
      await authFetch("/notifications/me/read-all", {
        method: "POST",
      });
    } catch (err) {
      console.warn("Backend markAllRead failed, updating local state:", err);
    }

    // Update local storage
    const local = getLocalNotifications();
    const updated = local.map((n) => ({ ...n, read: true }));
    saveLocalNotifications(updated);
    return true;
  },

  /**
   * Add a local notification (e.g. from organizer broadcast or prize request)
   */
  pushLocalNotification(notification: InAppNotification): void {
    const local = getLocalNotifications();
    const updated = [notification, ...local.filter((n) => n.id !== notification.id)];
    saveLocalNotifications(updated);
  },
};
