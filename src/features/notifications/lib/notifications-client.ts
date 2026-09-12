import { authFetch } from "@/lib/api-client";

export interface NotificationDeliveryItem {
  id: string;
  notificationId: string;
  hackathonId?: string | null;
  title?: string;
  category?: string;
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
  category?: string;
  type?: string;
}

const LOCAL_NOTIFS_STORAGE_KEY = "hodana_user_notifications_v1";

/**
 * Resolves contextually appropriate notification title and message based on
 * backend data, event categories, and content semantics.
 */
export function resolveNotificationDetails(d: NotificationDeliveryItem): {
  title: string;
  message: string;
  priority: "INFO" | "IMPORTANT" | "URGENT";
  category: string;
} {
  let rawMessage = (d.message || "").trim();
  let priority: "INFO" | "IMPORTANT" | "URGENT" = "INFO";
  let category = d.category || "general";

  // Parse priority tags if present
  if (rawMessage.startsWith("[URGENT]")) {
    priority = "URGENT";
    rawMessage = rawMessage.replace("[URGENT]", "").trim();
  } else if (rawMessage.startsWith("[IMPORTANT]")) {
    priority = "IMPORTANT";
    rawMessage = rawMessage.replace("[IMPORTANT]", "").trim();
  } else if (rawMessage.startsWith("[INFO]")) {
    rawMessage = rawMessage.replace("[INFO]", "").trim();
  }

  let title = (d.title || "").trim();
  let message = rawMessage;

  // 1. If message is formatted as "Title:\nContent" or "Title - Content"
  if (message.includes(":\n")) {
    const parts = message.split(":\n");
    const extractedTitle = parts[0].trim();
    if (extractedTitle && extractedTitle.length < 100) {
      if (!title || title.toLowerCase() === "hackathon announcement" || title.toLowerCase() === "notification") {
        title = extractedTitle;
      }
      message = parts.slice(1).join(":\n").trim();
    }
  } else if (message.includes(" - ")) {
    const parts = message.split(" - ");
    const extractedTitle = parts[0].trim();
    if (extractedTitle && extractedTitle.length < 80 && !extractedTitle.includes("\n")) {
      if (!title || title.toLowerCase() === "hackathon announcement" || title.toLowerCase() === "notification") {
        title = extractedTitle;
      }
      message = parts.slice(1).join(" - ").trim();
    }
  }

  // 2. If backend already returned a specific contextual title (not generic fallback)
  if (title && title.toLowerCase() !== "hackathon announcement" && title.toLowerCase() !== "notification") {
    return { title, message, priority, category };
  }

  const lowerMsg = rawMessage.toLowerCase();
  const lowerCat = category.toLowerCase();

  // 3. Support ticket notifications
  if (lowerMsg.includes("support ticket") || lowerCat.includes("support")) {
    category = "support";
    // Per Requirement 3: Use the actual notification message when descriptive
    if (
      lowerMsg.includes("status has been updated") ||
      lowerMsg.includes("has been received") ||
      lowerMsg.includes("ticket submitted")
    ) {
      title = rawMessage;
    } else if (lowerMsg.includes("replied") || lowerMsg.includes("response") || lowerMsg.includes("reply")) {
      title = "Support Ticket Reply";
    } else if (!title || title.toLowerCase() === "hackathon announcement" || title.toLowerCase() === "notification") {
      title = "Support Ticket Notice";
    }
    return { title, message, priority, category };
  }

  // 4. Team-related notifications
  if (lowerMsg.includes("team") || lowerCat.includes("team") || lowerMsg.includes("invitation to join")) {
    category = "team";
    if (lowerMsg.includes("invited to join") || lowerCat.includes("invitation")) {
      title = "Team Invitation";
    } else if (lowerMsg.includes("invitation") && (lowerMsg.includes("accepted") || lowerMsg.includes("declined"))) {
      title = "Team Invitation Update";
    } else if (!title || title.toLowerCase() === "hackathon announcement" || title.toLowerCase() === "notification") {
      title = "Team Update";
    }
    return { title, message, priority, category };
  }

  // 5. Account / Email verification notifications
  if (
    lowerMsg.includes("verify your email") ||
    lowerMsg.includes("verification") ||
    lowerMsg.includes("activate your account") ||
    lowerMsg.includes("confirm your email") ||
    lowerCat.includes("auth") ||
    lowerCat.includes("account")
  ) {
    category = "account";
    if (!title || title.toLowerCase() === "hackathon announcement" || title.toLowerCase() === "notification" || title.toLowerCase().includes("activate your account")) {
      title = "Account Verification";
    }
    return { title, message, priority, category };
  }

  if (lowerMsg.includes("password") && lowerMsg.includes("reset")) {
    category = "account";
    if (!title || title.toLowerCase() === "hackathon announcement" || title.toLowerCase() === "notification") {
      title = "Password Reset Notice";
    }
    return { title, message, priority, category };
  }

  // 6. Project submission notifications
  if (lowerMsg.includes("submission") || lowerCat.includes("submission") || lowerCat.includes("eligibility")) {
    category = "submission";
    if (lowerMsg.includes("eligibility")) {
      title = "Submission Eligibility Result";
    } else if (lowerMsg.includes("deadline") || lowerMsg.includes("close")) {
      title = "Submission Deadline Reminder";
    } else if (!title || title.toLowerCase() === "hackathon announcement" || title.toLowerCase() === "notification") {
      title = "Project Submission Update";
    }
    return { title, message, priority, category };
  }

  // 7. Judging-related notifications
  if (lowerMsg.includes("judging") || lowerCat.includes("judging") || lowerMsg.includes("evaluation")) {
    category = "judging";
    if (lowerMsg.includes("published") || lowerMsg.includes("result")) {
      title = "Judging Results Published";
    } else if (!title || title.toLowerCase() === "hackathon announcement" || title.toLowerCase() === "notification") {
      title = "Judging & Evaluation Notice";
    }
    return { title, message, priority, category };
  }

  // 8. Payment / Prize notifications
  if (
    lowerMsg.includes("prize") ||
    lowerMsg.includes("payout") ||
    lowerMsg.includes("payment") ||
    lowerMsg.includes("reward") ||
    lowerCat.includes("prize") ||
    lowerCat.includes("payment")
  ) {
    category = "prize";
    if (!title || title.toLowerCase() === "hackathon announcement" || title.toLowerCase() === "notification") {
      title = "Prize & Reward Notification";
    }
    return { title, message, priority, category };
  }

  // 9. Hackathon-related notifications (ONLY if hackathonId is present or explicitly refers to hackathons)
  if (d.hackathonId || lowerMsg.includes("hackathon") || lowerCat.includes("hackathon")) {
    category = "hackathon";
    if (lowerMsg.includes("registered for") || lowerCat.includes("registration")) {
      title = "Hackathon Registration Confirmed";
    } else if (lowerMsg.includes("schedule") || lowerMsg.includes("timeline") || lowerMsg.includes("dates")) {
      title = "Hackathon Schedule Update";
    } else if (!title || title.toLowerCase() === "hackathon announcement" || title.toLowerCase() === "notification") {
      title = "Hackathon Announcement";
    }
    return { title, message, priority, category };
  }

  // If title was explicitly set by backend or extracted from formatting
  if (title && title.toLowerCase() !== "hackathon announcement" && title.toLowerCase() !== "notification") {
    return { title, message, priority, category };
  }

  // 10. Meaningful descriptive message as title if short and clean
  if (rawMessage.length <= 80 && !rawMessage.includes("\n")) {
    title = rawMessage;
  } else {
    title = "Notification";
  }

  return { title, message, priority, category };
}

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
          const { title, message, priority, category } = resolveNotificationDetails(d);

          return {
            id: d.id,
            title,
            message,
            priority,
            category,
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
