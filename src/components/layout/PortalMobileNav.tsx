"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  Users,
  FolderGit2,
  Layers,
  User,
  Rocket,
  Plus,
  Trophy,
  Megaphone,
  Gavel,
  FileText,
  Briefcase,
  UserCheck,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Logomark } from "@/components/ui/Logomark";
import { useSession } from "@/features/auth";
import { NotificationBellDropdown } from "@/features/notifications/components/NotificationBellDropdown";

export interface PortalMobileNavProps {
  portalType: "participant" | "organizer";
  activeItem?: string;
  onTabChange?: (tab: string) => void;
  title?: string;
}

export function PortalMobileNav({
  portalType,
  activeItem,
  onTabChange,
  title,
}: PortalMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useSession();

  const userName = user?.fullName || user?.email?.split("@")[0] || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const participantLinks = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      isTab: true,
    },
    {
      id: "hackathons",
      label: "Hackathons",
      icon: Calendar,
      href: "/hackathons",
      isTab: false,
    },
    {
      id: "teams",
      label: "My Teams",
      icon: Users,
      href: "/dashboard/teams",
      isTab: false,
    },
    {
      id: "projects",
      label: "My Projects",
      icon: FolderGit2,
      href: "/dashboard/projects",
      isTab: true,
    },
    {
      id: "registrations",
      label: "Registrations",
      icon: Layers,
      href: "/dashboard/registrations",
      isTab: false,
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      href: "/profile",
      isTab: false,
    },
  ];

  const organizerLinks = [
    {
      id: "dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      href: "/organizer/dashboard",
    },
    {
      id: "hackathons",
      label: "Hackathons",
      icon: Calendar,
      href: "/organizer/hackathons",
    },
    {
      id: "registrations",
      label: "Registrations",
      icon: UserCheck,
      href: "/organizer/registrations",
    },
    {
      id: "judges",
      label: "Judging",
      icon: Gavel,
      href: "/organizer/judges",
    },
    {
      id: "prizes",
      label: "Prizes",
      icon: Trophy,
      href: "/organizer/prizes",
    },
    {
      id: "submissions",
      label: "Analytics",
      icon: FileText,
      href: "/organizer/submissions",
    },
    {
      id: "announcements",
      label: "Announcements",
      icon: Megaphone,
      href: "/organizer/announcements",
    },
    {
      id: "portfolio",
      label: "Portfolio",
      icon: Briefcase,
      href: "/dashboard/portfolio",
    },
  ];

  const links = portalType === "participant" ? participantLinks : organizerLinks;

  return (
    <div className="block lg:hidden sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-[#d6e7e1] shadow-2xs">
      {/* Mobile Top App Bar */}
      <div className="flex h-16 items-center justify-between px-3 sm:px-6 gap-2">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d6e7e1] bg-white text-[#122622] hover:bg-[#e8f3f0] hover:text-[#0f6b5c] transition-colors cursor-pointer"
            aria-label="Open Navigation Menu"
            title="Open Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F9F8F3] border border-[#E2DFD8] p-0.5 shadow-2xs">
              <Logomark className="h-full w-full object-contain" />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-display text-sm font-extrabold text-[#0f6b5c] leading-tight truncate">
                HODANA
              </span>
              <span className="text-[10px] font-bold text-[#57685f] uppercase tracking-wider leading-none truncate max-w-[120px] sm:max-w-none">
                {title || (portalType === "participant" ? "Participant" : "Organizer")}
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Notifications & Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <NotificationBellDropdown />

          <Link
            href="/settings/profile"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f6b5c] text-xs font-bold text-white shadow-2xs hover:bg-[#0b5347] transition-all"
            title={userName}
          >
            {userInitial}
          </Link>
        </div>
      </div>

      {/* Slide-out Mobile Navigation Drawer & Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in-50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative flex w-[280px] max-w-[85vw] h-full max-h-dvh flex-col justify-between bg-white p-4 sm:p-5 shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            <div className="flex flex-col gap-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-4">
                <Link
                  href="/"
                  className="flex items-center gap-2.5"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F9F8F3] border border-[#E2DFD8] p-1 shadow-2xs">
                    <Logomark className="h-full w-full object-contain" />
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="font-display text-base font-extrabold text-[#0f6b5c] leading-tight">
                      HODANA
                    </span>
                    <span className="text-[10px] font-bold text-[#57685f] uppercase tracking-wider">
                      {portalType === "participant" ? "Participant Portal" : "Organizer Portal"}
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d6e7e1] text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                  aria-label="Close Navigation Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-240px)] pr-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    (activeItem && activeItem === link.id) ||
                    (!activeItem && pathname === link.href) ||
                    (link.id === "dashboard" && pathname === (portalType === "participant" ? "/dashboard" : "/organizer/dashboard"));

                  if ((link as any).isTab && onTabChange) {
                    return (
                      <button
                        key={link.id}
                        type="button"
                        onClick={() => {
                          onTabChange(link.id);
                          setIsOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-bold transition-all text-left cursor-pointer ${
                          isActive
                            ? "bg-[#0f6b5c] text-white shadow-xs"
                            : "text-[#57685f] hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{link.label}</span>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={link.id}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-bold transition-all ${
                        isActive
                          ? "bg-[#0f6b5c] text-white shadow-xs"
                          : "text-[#57685f] hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer Actions */}
            <div className="flex flex-col gap-3 border-t border-[#d6e7e1] pt-4">
              {portalType === "participant" ? (
                <Link
                  href="/hackathons"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all"
                >
                  <Rocket className="h-4 w-4 shrink-0" />
                  <span>Explore Hackathons</span>
                </Link>
              ) : (
                <Link
                  href="/organizer/hackathons"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span>Manage Events</span>
                </Link>
              )}

              <Link
                href="/settings/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-100"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0f6b5c] text-xs font-bold text-white shadow-xs">
                  {userInitial}
                </span>
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="truncate text-xs font-bold text-[#122622]">
                    {userName}
                  </span>
                  <span className="text-[10px] font-medium text-[#57685f] truncate">
                    {portalType === "participant" ? "Participant" : "Organizer"}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
