"use client";

import { useState, useEffect, ReactNode } from "react";
import {
  LayoutDashboard,
  Building2,
  Trophy,
  Users,
  CreditCard,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Bell,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  Menu,
  X,
  LifeBuoy,
} from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Logomark } from "@/components/ui/Logomark";
import { useSession } from "@/features/auth";
import { adminClient } from "../lib/admin-client";
import { NotificationBellDropdown } from "@/features/notifications/components/NotificationBellDropdown";

interface AdminShellProps {
  children: ReactNode;
  activeMenu: "dashboard" | "organizations" | "hackathons" | "users" | "finances" | "audit" | "support";
  pendingOrgCount?: number;
}

export function AdminShell({ children, activeMenu, pendingOrgCount = 2 }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [livePendingCount, setLivePendingCount] = useState(pendingOrgCount);

  useEffect(() => {
    adminClient.getMetrics().then((m) => {
      setLivePendingCount(m.pendingOrgRequestsCount);
    });
  }, []);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearchQuery.trim()) {
      router.push(`/admin/users?q=${encodeURIComponent(globalSearchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#122622] font-sans antialiased">
      {/* Main Flex Layout Container */}
      <div className="mx-auto flex w-full max-w-[1680px]">
        {/* ================= LEFT ADMIN SIDEBAR (STICKY & UNMOVABLE) ================= */}
        <aside
          className={`sticky top-0 hidden h-screen flex-col justify-between border-r border-[#d6e7e1] bg-white p-5 lg:flex shadow-xs transition-all duration-300 ease-in-out shrink-0 z-30 ${
            isSidebarCollapsed ? "w-20 px-3" : "w-68 px-5"
          }`}
        >
          <div className="flex flex-col gap-8">
            {/* Brand Logo & Superuser Tag */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="flex items-center gap-3 cursor-pointer text-left group focus:outline-none"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label="Toggle Sidebar"
            >
              <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#d6e7e1] shadow-xs overflow-hidden p-1 transition-transform group-hover:scale-105">
                <Logomark className="h-full w-full object-contain" />
              </span>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                  isSidebarCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-xs opacity-100"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#0f6b5c]">
                    HODANA
                  </h1>
                  <span className="rounded-md bg-[#e8f3f0] px-1.5 py-0.5 text-[10px] font-black text-[#0f6b5c] tracking-wider">
                    ADMIN
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-[#57685f]">
                  Platform Control Plane
                </p>
              </div>
            </button>

            {/* Sidebar Navigation Items */}
            <nav className="flex flex-col gap-1.5 text-xs font-semibold text-[#57685f]">
              {/* 1. Dashboard / Overview */}
              <Link
                href="/admin/dashboard"
                title={isSidebarCollapsed ? "Dashboard / Overview" : undefined}
                className={`flex items-center gap-3 rounded-2xl py-3 transition-all ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } ${
                  activeMenu === "dashboard"
                    ? "bg-[#0f6b5c] text-white shadow-md font-bold"
                    : "hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Dashboard</span>}
              </Link>

              {/* 2. Organization Requests */}
              <Link
                href="/admin/organization-requests"
                title={isSidebarCollapsed ? "Organization Requests" : undefined}
                className={`flex items-center justify-between rounded-2xl py-3 transition-all ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } ${
                  activeMenu === "organizations"
                    ? "bg-[#0f6b5c] text-white shadow-md font-bold"
                    : "hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="whitespace-nowrap">Org Requests</span>}
                </div>
                {!isSidebarCollapsed && livePendingCount > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                      activeMenu === "organizations"
                        ? "bg-white text-[#0f6b5c]"
                        : "bg-amber-100 text-amber-900 border border-amber-200"
                    }`}
                  >
                    {livePendingCount}
                  </span>
                )}
              </Link>

              {/* 3. Hackathon Moderation */}
              <Link
                href="/admin/hackathons"
                title={isSidebarCollapsed ? "Hackathon Moderation" : undefined}
                className={`flex items-center gap-3 rounded-2xl py-3 transition-all ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } ${
                  activeMenu === "hackathons"
                    ? "bg-[#0f6b5c] text-white shadow-md font-bold"
                    : "hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
                }`}
              >
                <Trophy className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Hackathons</span>}
              </Link>

              {/* 4. User Management */}
              <Link
                href="/admin/users"
                title={isSidebarCollapsed ? "User Management" : undefined}
                className={`flex items-center gap-3 rounded-2xl py-3 transition-all ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } ${
                  activeMenu === "users"
                    ? "bg-[#0f6b5c] text-white shadow-md font-bold"
                    : "hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
                }`}
              >
                <Users className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">User Directory</span>}
              </Link>

              {/* 5. Financials & Prize Escrow */}
              <Link
                href="/admin/finances"
                title={isSidebarCollapsed ? "Financials & Escrow" : undefined}
                className={`flex items-center gap-3 rounded-2xl py-3 transition-all ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } ${
                  activeMenu === "finances"
                    ? "bg-[#0f6b5c] text-white shadow-md font-bold"
                    : "hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
                }`}
              >
                <CreditCard className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Financials & Escrow</span>}
              </Link>

              {/* 6. Security & Audit Logs */}
              <Link
                href="/admin/audit-logs"
                title={isSidebarCollapsed ? "Audit Logs" : undefined}
                className={`flex items-center gap-3 rounded-2xl py-3 transition-all ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } ${
                  activeMenu === "audit"
                    ? "bg-[#0f6b5c] text-white shadow-md font-bold"
                    : "hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
                }`}
              >
                <ShieldAlert className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Security Audit</span>}
              </Link>

              {/* 7. Support Tickets */}
              <Link
                href="/admin/support"
                title={isSidebarCollapsed ? "Support Tickets" : undefined}
                className={`flex items-center gap-3 rounded-2xl py-3 transition-all ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } ${
                  activeMenu === "support"
                    ? "bg-[#0f6b5c] text-white shadow-md font-bold"
                    : "hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
                }`}
              >
                <LifeBuoy className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Support Tickets</span>}
              </Link>
            </nav>
          </div>

          {/* Sidebar Bottom Status & Admin Badge */}
          <div className="flex flex-col gap-4 border-t border-[#d6e7e1] pt-5">
            <div className="flex items-center gap-3 rounded-2xl bg-[#e8f3f0] p-3 border border-[#d6e7e1]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0f6b5c] to-[#16793d] font-display text-xs font-bold text-white shadow-sm uppercase">
                {user?.fullName ? user.fullName[0] : "A"}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="truncate text-xs font-extrabold text-[#122622]">
                    {user?.fullName || "Platform Admin"}
                  </span>
                  <span className="text-[10px] text-[#0f6b5c] font-black uppercase tracking-wider">
                    Superuser Admin
                  </span>
                </div>
              )}
            </div>

            <Link
              href="/"
              title={isSidebarCollapsed ? "Exit to Main Site" : undefined}
              className={`flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2 text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-colors ${
                isSidebarCollapsed ? "px-0" : "px-3"
              }`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {!isSidebarCollapsed && <span>Public Portal</span>}
            </Link>
          </div>
        </aside>

        {/* Right Main Admin Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Top Admin Status & Search Bar */}
          <header className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d6e7e1] bg-[#f3f6f4]/90 backdrop-blur-md px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3 flex-1">
              {/* Mobile Hamburger Menu Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex lg:hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d6e7e1] bg-white text-[#122622] hover:bg-[#e8f3f0] hover:text-[#0f6b5c] transition-colors cursor-pointer"
                aria-label="Open Admin Menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Global Search Bar */}
              <form onSubmit={handleGlobalSearch} className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  placeholder="Search users, orgs, hackathons..."
                  className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white pl-10 pr-4 text-xs font-medium text-[#122622] shadow-xs outline-none focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#0f6b5c]/20 transition-all placeholder:text-gray-400"
                />
              </form>
            </div>

            {/* Right Status Badges */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-end sm:self-auto">
              {/* System Health Status Indicator */}
              <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-[11px] font-bold text-emerald-800 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Healthy • 99.98%</span>
              </div>

              {/* Superuser Mode Pill */}
              <div className="hidden sm:flex items-center gap-1.5 rounded-2xl bg-[#0e2b25] text-white px-3.5 py-1.5 text-[11px] font-black tracking-wide shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>ROOT</span>
              </div>

              <NotificationBellDropdown />
            </div>
          </header>

          {/* Admin Mobile Slide-out Drawer */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in-50"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="relative flex w-[280px] max-w-[85vw] flex-col justify-between bg-white p-5 shadow-2xl z-50 animate-in slide-in-from-left duration-200">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F9F8F3] border border-[#E2DFD8] p-0.5">
                        <Logomark className="h-full w-full object-contain" />
                      </span>
                      <div className="flex flex-col">
                        <span className="font-display text-base font-extrabold text-[#0f6b5c]">HODANA</span>
                        <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Superuser Admin</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d6e7e1] text-gray-500 hover:bg-gray-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <nav className="flex flex-col gap-1.5">
                    {[
                      { key: "dashboard", label: "Overview", icon: LayoutDashboard, href: "/admin" },
                      { key: "organizations", label: "Organizations", icon: Building2, href: "/admin/organizations", badge: livePendingCount > 0 ? livePendingCount : undefined },
                      { key: "hackathons", label: "Hackathons", icon: Trophy, href: "/admin/hackathons" },
                      { key: "users", label: "Users Directory", icon: Users, href: "/admin/users" },
                      { key: "finances", label: "Finances & Billing", icon: CreditCard, href: "/admin/finances" },
                      { key: "audit", label: "Security Audit", icon: ShieldAlert, href: "/admin/audit" },
                      { key: "support", label: "Support Tickets", icon: LifeBuoy, href: "/admin/support" },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = activeMenu === item.key;
                      return (
                        <Link
                          key={item.key}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all ${
                            isActive
                              ? "bg-[#0f6b5c] text-white shadow-xs"
                              : "text-[#57685f] hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="flex flex-col gap-3 border-t border-[#d6e7e1] pt-4">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Exit to Public Portal</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Page Body Content */}
          <main className="flex-1 p-5 lg:p-8 flex flex-col gap-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
