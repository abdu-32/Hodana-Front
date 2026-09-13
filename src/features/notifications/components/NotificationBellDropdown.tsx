"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCheck,
  Check,
  Clock,
  Sparkles,
  AlertCircle,
  Info,
  X,
  Megaphone,
} from "lucide-react";
import {
  notificationsClient,
  type InAppNotification,
} from "@/features/notifications/lib/notifications-client";

interface NotificationBellDropdownProps {
  className?: string;
}

function resolveDisplayTitle(item: InAppNotification): string {
  const t = (item.title || "").trim();
  if (t && !t.toLowerCase().includes("hackathon announcement") && t.toLowerCase() !== "notification") {
    return t;
  }
  const m = (item.message || "").toLowerCase();
  if (m.includes("payment") || m.includes("prize") || m.includes("billing") || m.includes("payout")) {
    return "Payments, Prizes, Billing";
  }
  if (m.includes("rule") || m.includes("judg") || m.includes("criteria")) {
    return "Hackathon Rules & Judging";
  }
  if (m.includes("bug") || m.includes("technical") || m.includes("error") || m.includes("fail")) {
    return "Technical & Platform Bug";
  }
  if (m.includes("ticket") || m.includes("support") || m.includes("replied to") || m.includes("submitted by")) {
    return "General Platform Questions";
  }
  return item.hackathonTitle ? `${item.hackathonTitle} Update` : "Platform Announcement";
}

export function NotificationBellDropdown({
  className = "",
}: NotificationBellDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationsClient.getMyNotifications();
      setNotifications(data);
    } catch (err) {
      console.warn("Error loading notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Polling interval every 20 seconds for fresh announcements
    const interval = setInterval(() => {
      loadNotifications();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    await notificationsClient.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkRead = async (id: string) => {
    await notificationsClient.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const displayedNotifications = unreadOnly
    ? notifications.filter((n) => !n.read)
    : notifications;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) {
            loadNotifications();
          }
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#d6e7e1] text-[#57685f] shadow-2xs hover:bg-[#e8f3f0] hover:text-[#0f6b5c] transition-all cursor-pointer focus:outline-none"
        aria-label="Notifications"
        title="Announcements & Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-full mt-2 sm:w-96 max-w-sm sm:max-w-none mx-auto sm:mx-0 rounded-3xl border border-[#d6e7e1] bg-white p-4 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-[#0f6b5c]" />
              <h4 className="font-display text-sm font-extrabold text-[#122622]">
                Notifications & Broadcasts
              </h4>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-extrabold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-bold text-[#0f6b5c] hover:underline cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark read</span>
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#d6e7e1]/60 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUnreadOnly(false)}
                className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                  !unreadOnly
                    ? "bg-[#0f6b5c] text-white"
                    : "text-[#57685f] hover:bg-[#e8f3f0]"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setUnreadOnly(true)}
                className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                  unreadOnly
                    ? "bg-[#0f6b5c] text-white"
                    : "text-[#57685f] hover:bg-[#e8f3f0]"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
            {isLoading && notifications.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-500 font-medium">
                Loading notifications...
              </p>
            ) : displayedNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
                <Bell className="h-8 w-8 text-gray-300" />
                <span>
                  {unreadOnly
                    ? "You're all caught up! No unread notifications."
                    : "No notifications or announcements yet."}
                </span>
              </div>
            ) : (
              displayedNotifications.map((item) => {
                const isUrgent = item.priority === "URGENT";
                const isImportant = item.priority === "IMPORTANT";

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!item.read) handleMarkRead(item.id);
                    }}
                    className={`rounded-2xl border p-3.5 text-xs transition-all cursor-pointer ${
                      !item.read
                        ? isUrgent
                          ? "border-red-300 bg-red-50/70 shadow-xs"
                          : isImportant
                          ? "border-amber-300 bg-amber-50/70 shadow-xs"
                          : "border-emerald-300 bg-emerald-50/50 shadow-xs"
                        : "border-[#d6e7e1] bg-white opacity-85 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {!item.read && (
                          <span className="h-2 w-2 rounded-full bg-red-500 shrink-0 mt-0.5" />
                        )}
                        <span
                          className="font-display font-extrabold text-xs text-[#122622] line-clamp-2 leading-snug"
                          title={resolveDisplayTitle(item)}
                        >
                          {resolveDisplayTitle(item)}
                        </span>
                      </div>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase shrink-0 ${
                          isUrgent
                            ? "bg-red-200 text-red-900"
                            : isImportant
                            ? "bg-amber-200 text-amber-900"
                            : "bg-[#e8f3f0] text-[#0f6b5c]"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>

                    {item.message && item.message.trim() !== resolveDisplayTitle(item).trim() && (
                      <p className="text-[11px] text-[#57685f] leading-relaxed whitespace-pre-line mt-1">
                        {item.message}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#d6e7e1]/50 text-[10px] text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(item.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at{" "}
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {!item.read ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkRead(item.id);
                          }}
                          className="text-[#0f6b5c] font-bold hover:underline"
                        >
                          Mark as read
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <Check className="h-3 w-3" />
                          <span>Read</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
