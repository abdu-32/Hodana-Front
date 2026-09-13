import { authFetch } from "@/lib/api-client";

export interface NotificationDeliveryItem {
  id: string;
  notificationId: string;
  hackathonId?: string | null;
  hackathonTitle?: string | null;
  title?: string;
  priority?: "INFO" | "IMPORTANT" | "URGENT";
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

export const INQUIRY_CATEGORIES: Record<string, string> = {
  technical: "Technical & Platform Bug",
  billing: "Payments, Prizes, Billing",
  general: "General Platform Questions",
  hackathon_specific: "Hackathon Rules & Judging",
};

export const CANONICAL_INQUIRY_MAP: Record<string, string> = {
  "technical & platform bug": "Technical & Platform Bug",
  "payments, prizes, billing": "Payments, Prizes, Billing",
  "payments, prizes & billing": "Payments, Prizes, Billing",
  "payments & prizes": "Payments, Prizes, Billing",
  "general platform questions": "General Platform Questions",
  "general platform question": "General Platform Questions",
  "hackathon rules & judging": "Hackathon Rules & Judging",
  "hackathon rules and judging": "Hackathon Rules & Judging",
};

export const INQUIRY_HEADLINES = new Set(Object.values(INQUIRY_CATEGORIES));

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
  let priority: "INFO" | "IMPORTANT" | "URGENT" = d.priority || "INFO";
  let category = d.category || "general";

  // Parse priority from tags or labeled text (e.g. [URGENT], [HIGH], Priority: URGENT)
  if (/priority:\s*urgent/i.test(rawMessage) || rawMessage.includes("[URGENT]")) {
    priority = "URGENT";
  } else if (
    /priority:\s*(high|important)/i.test(rawMessage) ||
    rawMessage.includes("[IMPORTANT]") ||
    rawMessage.includes("[HIGH]")
  ) {
    priority = "IMPORTANT";
  } else if (
    /priority:\s*(normal|low|info)/i.test(rawMessage) ||
    rawMessage.includes("[INFO]") ||
    rawMessage.includes("[NORMAL]") ||
    rawMessage.includes("[LOW]")
  ) {
    priority = "INFO";
  }

  // Clean brackets from rawMessage
  rawMessage = rawMessage
    .replace(/\[(URGENT|IMPORTANT|HIGH|NORMAL|INFO|LOW)\]\.?/gi, "")
    .trim();

  let title = (d.title || "").trim();
  if (title && CANONICAL_INQUIRY_MAP[title.toLowerCase()]) {
    title = CANONICAL_INQUIRY_MAP[title.toLowerCase()];
  }
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

  const lowerMsg = rawMessage.toLowerCase();
  const lowerCat = category.toLowerCase();

  // 2. Check if this is a support ticket / inquiry notification
  const isSupport =
    lowerCat.startsWith("support") ||
    lowerCat.includes("ticket") ||
    lowerMsg.includes("support ticket") ||
    lowerMsg.includes("ticket reference") ||
    lowerMsg.includes("support team") ||
    lowerMsg.includes("support specialist") ||
    lowerMsg.includes("replied to ticket") ||
    lowerMsg.includes("replied to") ||
    lowerMsg.includes("submitted by") ||
    lowerMsg.includes("my tickets") ||
    lowerMsg.includes("ticket:") ||
    lowerMsg.includes("ticket '") ||
    lowerMsg.includes("ticket \"") ||
    lowerMsg.includes("inquiry") ||
    lowerMsg.includes("category: technical") ||
    lowerMsg.includes("category: billing") ||
    lowerMsg.includes("category: general") ||
    lowerMsg.includes("category: hackathon") ||
    lowerMsg.includes("knowledge base");

  if (isSupport) {
    category = "support";

    // Format message cleanly matching Platform Admin format if raw email template was received
    if (
      rawMessage.includes("Thank you for contacting") ||
      rawMessage.includes("We have received your support ticket")
    ) {
      const subjMatch = rawMessage.match(/regarding '([^']+)'/i) || rawMessage.match(/ticket '([^']+)'/i);
      message = `Your support ticket '${subjMatch ? subjMatch[1] : "Inquiry"}' has been received and is under review.`;
    } else if (rawMessage.includes("A support specialist has replied to your ticket")) {
      const subjMatch = rawMessage.match(/to your ticket '([^']+)'/i);
      message = `Support specialist replied to ticket: '${subjMatch ? subjMatch[1] : "Inquiry"}'.`;
    }

    // If title is already a valid canonical Inquiry Category headline, use it directly
    if (title && INQUIRY_HEADLINES.has(title)) {
      return { title, message, priority, category };
    }

    let inquiryTitle = "";

    // 1. Resolve from specific category string
    if (lowerCat.includes("billing") || lowerCat.includes("payment")) {
      inquiryTitle = INQUIRY_CATEGORIES.billing;
    } else if (lowerCat.includes("hackathon") || lowerCat.includes("judging")) {
      inquiryTitle = INQUIRY_CATEGORIES.hackathon_specific;
    } else if (lowerCat.includes("technical") || lowerCat.includes("bug")) {
      inquiryTitle = INQUIRY_CATEGORIES.technical;
    } else if (lowerCat.includes("general")) {
      inquiryTitle = INQUIRY_CATEGORIES.general;
    }

    // 2. Check message tags
    if (!inquiryTitle) {
      if (lowerMsg.includes("category: billing") || lowerMsg.includes("category: payments")) {
        inquiryTitle = INQUIRY_CATEGORIES.billing;
      } else if (lowerMsg.includes("category: hackathon")) {
        inquiryTitle = INQUIRY_CATEGORIES.hackathon_specific;
      } else if (lowerMsg.includes("category: technical")) {
        inquiryTitle = INQUIRY_CATEGORIES.technical;
      } else if (lowerMsg.includes("category: general")) {
        inquiryTitle = INQUIRY_CATEGORIES.general;
      }
    }

    // 3. Heuristic matching from message content (Billing first, Hackathon second, Technical third)
    if (!inquiryTitle) {
      if (
        lowerMsg.includes("payment") ||
        lowerMsg.includes("prize") ||
        lowerMsg.includes("payout") ||
        lowerMsg.includes("invoice") ||
        lowerMsg.includes("billing") ||
        lowerMsg.includes("refund") ||
        lowerMsg.includes("deposit") ||
        lowerMsg.includes("reward")
      ) {
        inquiryTitle = INQUIRY_CATEGORIES.billing;
      } else if (
        lowerMsg.includes("rules") ||
        lowerMsg.includes("judging criteria") ||
        lowerMsg.includes("judging") ||
        lowerMsg.includes("submission requirement")
      ) {
        inquiryTitle = INQUIRY_CATEGORIES.hackathon_specific;
      } else if (
        lowerMsg.includes("bug") ||
        lowerMsg.includes("error") ||
        lowerMsg.includes("broken") ||
        lowerMsg.includes("crash") ||
        lowerMsg.includes("technical") ||
        lowerMsg.includes("verification") ||
        lowerMsg.includes("login") ||
        lowerMsg.includes("fail") ||
        lowerMsg.includes("platform bug")
      ) {
        inquiryTitle = INQUIRY_CATEGORIES.technical;
      }
    }

    // 4. Default to General Platform Questions
    if (!inquiryTitle) {
      inquiryTitle = INQUIRY_CATEGORIES.general;
    }

    title = inquiryTitle;
    return { title, message, priority, category };
  }

  // Platform-wide announcements & broadcasts
  if (
    lowerCat.includes("platform") ||
    lowerCat.includes("broadcast") ||
    (!d.hackathonId && (lowerCat.includes("announcement") || lowerMsg.includes("announcement")))
  ) {
    category = "broadcast";
    if (!title || title.toLowerCase() === "hackathon announcement" || title.toLowerCase() === "notification") {
      title = "Platform Announcement";
    }
    return { title, message, priority, category };
  }

  // 3. If backend already returned a specific contextual title (not generic fallback)
  if (title && title.toLowerCase() !== "hackathon announcement" && title.toLowerCase() !== "notification") {
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
      title = d.hackathonTitle ? `${d.hackathonTitle} Update` : "Hackathon Update";
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
    title = "Platform Announcement";
  }

  // Universal safeguard: Under NO circumstances allow "Hackathon Announcement" or generic "Notification"
  if (!title || title.toLowerCase().trim() === "hackathon announcement" || title.toLowerCase().trim() === "notification") {
    if (
      lowerMsg.includes("ticket") ||
      lowerMsg.includes("support") ||
      lowerMsg.includes("replied to") ||
      lowerMsg.includes("submitted by") ||
      isSupport
    ) {
      if (lowerMsg.includes("payment") || lowerMsg.includes("prize") || lowerMsg.includes("billing")) {
        title = INQUIRY_CATEGORIES.billing;
      } else if (lowerMsg.includes("rule") || lowerMsg.includes("judg")) {
        title = INQUIRY_CATEGORIES.hackathon_specific;
      } else if (lowerMsg.includes("bug") || lowerMsg.includes("technical") || lowerMsg.includes("error")) {
        title = INQUIRY_CATEGORIES.technical;
      } else {
        title = INQUIRY_CATEGORIES.general;
      }
    } else if (d.hackathonId || lowerCat.includes("hackathon")) {
      title = d.hackathonTitle ? `${d.hackathonTitle} Update` : "Hackathon Update";
    } else {
      title = "Platform Announcement";
    }
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

    // Also pull local announcements broadcasted on this machine, repairing any stale generic titles
    const rawLocal = getLocalNotifications();
    let localModified = false;
    const local = rawLocal.map((item) => {
      const trimmedTitle = (item.title || "").trim();
      const canonical = trimmedTitle ? CANONICAL_INQUIRY_MAP[trimmedTitle.toLowerCase()] : null;
      let curTitle = canonical || trimmedTitle;
      const rawMsg = item.message || "";
      const cleanMsg = rawMsg.replace(/\[(URGENT|IMPORTANT|HIGH|NORMAL|INFO|LOW)\]\.?/gi, "").trim();

      let curPriority = item.priority || "INFO";
      if (/priority:\s*urgent/i.test(rawMsg) || rawMsg.includes("[URGENT]")) {
        curPriority = "URGENT";
      } else if (/priority:\s*(high|important)/i.test(rawMsg) || rawMsg.includes("[IMPORTANT]") || rawMsg.includes("[HIGH]")) {
        curPriority = "IMPORTANT";
      }

      const isGenericTitle =
        !curTitle ||
        curTitle.toLowerCase().includes("hackathon announcement") ||
        curTitle.toLowerCase() === "notification";

      if (isGenericTitle) {
        localModified = true;
        const resolved = resolveNotificationDetails({
          id: item.id,
          notificationId: item.id,
          title: "",
          message: item.message,
          priority: curPriority,
          category: item.category,
          channel: "in_portal",
          status: "sent",
          createdAt: item.createdAt,
        });
        return {
          ...item,
          title: resolved.title,
          priority: resolved.priority,
          message: resolved.message,
          category: resolved.category,
        };
      }

      if (curTitle !== item.title || cleanMsg !== item.message || curPriority !== item.priority) {
        localModified = true;
        return {
          ...item,
          title: curTitle,
          message: cleanMsg,
          priority: curPriority,
        };
      }

      return item;
    });

    if (localModified) {
      saveLocalNotifications(local);
    }

    // Deduplicate by ID
    const seenIds = new Set<string>();
    const merged: InAppNotification[] = [];

    for (let item of [...backendItems, ...local]) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);

        let finalTitle = (item.title || "").trim();
        if (CANONICAL_INQUIRY_MAP[finalTitle.toLowerCase()]) {
          finalTitle = CANONICAL_INQUIRY_MAP[finalTitle.toLowerCase()];
        }

        const lowerM = (item.message || "").toLowerCase();
        const isSupportMsg =
          lowerM.includes("ticket") ||
          lowerM.includes("support") ||
          lowerM.includes("replied to") ||
          lowerM.includes("submitted by") ||
          (item.category || "").toLowerCase().includes("support");

        if (
          !finalTitle ||
          finalTitle.toLowerCase().includes("hackathon announcement") ||
          finalTitle.toLowerCase() === "notification"
        ) {
          if (lowerM.includes("payment") || lowerM.includes("prize") || lowerM.includes("billing") || lowerM.includes("payout")) {
            finalTitle = INQUIRY_CATEGORIES.billing;
          } else if (lowerM.includes("rule") || lowerM.includes("judg") || lowerM.includes("criteria")) {
            finalTitle = INQUIRY_CATEGORIES.hackathon_specific;
          } else if (lowerM.includes("bug") || lowerM.includes("technical") || lowerM.includes("error") || lowerM.includes("fail")) {
            finalTitle = INQUIRY_CATEGORIES.technical;
          } else if (isSupportMsg) {
            finalTitle = INQUIRY_CATEGORIES.general;
          } else if (item.hackathonId || (item.category || "").toLowerCase().includes("hackathon")) {
            finalTitle = item.hackathonTitle ? `${item.hackathonTitle} Update` : "Hackathon Update";
          } else {
            finalTitle = "Platform Announcement";
          }
        }

        const cleanMessage = (item.message || "")
          .replace(/\[(URGENT|IMPORTANT|HIGH|NORMAL|INFO|LOW)\]\.?/gi, "")
          .trim();

        item = {
          ...item,
          title: finalTitle,
          message: cleanMessage,
        };

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
