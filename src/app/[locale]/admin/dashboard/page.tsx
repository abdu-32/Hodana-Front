"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Trophy,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
  Server,
  Activity,
  Layers,
  RefreshCw,
  Eye,
  ShieldAlert,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { OrgReviewModal } from "@/features/admin/components/OrgReviewModal";
import { HackathonInspectModal } from "@/features/admin/components/HackathonInspectModal";
import {
  AdminMetrics,
  AdminOrganizationRequest,
  AdminHackathon,
  AdminSystemHealth,
  OrgRequestStatus,
  adminClient,
} from "@/features/admin/lib/admin-client";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [pendingRequests, setPendingRequests] = useState<AdminOrganizationRequest[]>([]);
  const [activeHackathons, setActiveHackathons] = useState<AdminHackathon[]>([]);
  const [health, setHealth] = useState<AdminSystemHealth | null>(null);
  const [isHealthRefreshing, setIsHealthRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AdminOrganizationRequest | null>(null);
  const [selectedHackathon, setSelectedHackathon] = useState<AdminHackathon | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [m, reqs, hcks, h] = await Promise.all([
        adminClient.getMetrics(),
        adminClient.getOrganizationRequests("PENDING"),
        adminClient.getHackathons("ALL"),
        adminClient.getSystemHealth(),
      ]);
      setMetrics(m);
      setPendingRequests(reqs.slice(0, 5));
      setActiveHackathons(hcks.slice(0, 5));
      setHealth(h);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshHealth = async () => {
    setIsHealthRefreshing(true);
    try {
      const h = await adminClient.getSystemHealth();
      setHealth(h);
    } catch (err) {
      console.warn("Failed to refresh system health:", err);
    } finally {
      setIsHealthRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-poll health telemetry every 20 seconds
    const interval = setInterval(async () => {
      try {
        const h = await adminClient.getSystemHealth();
        setHealth(h);
      } catch (e) {
        console.warn("Background health check polling failed:", e);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const handleDecision = async (status: OrgRequestStatus, notes?: string) => {
    if (!selectedRequest) return;
    try {
      await adminClient.reviewOrganization(selectedRequest.id, status, notes);
      await loadData();
      setToastMessage(
        status === "APPROVED"
          ? `Organization "${selectedRequest.name}" successfully approved!`
          : `Organization "${selectedRequest.name}" rejected with feedback.`
      );
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err: any) {
      console.error(err);
      setToastMessage(err?.message || "Failed to submit verification decision.");
      setTimeout(() => setToastMessage(null), 4500);
    }
  };

  const handleToggleSuspend = async (id: string, reason?: string) => {
    try {
      const updated = await adminClient.toggleHackathonSuspension(id, reason);
      await loadData();
      setToastMessage(
        updated.isSuspended
          ? `Hackathon "${updated.title}" suspended.`
          : `Hackathon "${updated.title}" reactivated.`
      );
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setToastMessage(err?.message || "Failed to update hackathon suspension status.");
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const updated = await adminClient.toggleHackathonFeatured(id);
      await loadData();
      setToastMessage(
        updated.isFeatured
          ? `Hackathon "${updated.title}" is now featured on the homepage.`
          : `Hackathon "${updated.title}" unfeatured.`
      );
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminShell activeMenu="dashboard" pendingOrgCount={metrics?.pendingOrgRequestsCount}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#0e2b25] px-5 py-3 text-xs font-extrabold text-white shadow-xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Overview Top Header with Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#0f6b5c]">
            <ShieldCheck className="h-4 w-4" />
            <span>GOVERNANCE DASHBOARD</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#122622]">
            Platform Ecosystem Overview
          </h1>
          <p className="text-xs font-medium text-[#57685f]">
            Real-time telemetry, verification queues, security status, and national hackathon health.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-2xl border border-[#d6e7e1] bg-white px-4 py-2 text-xs font-bold text-[#122622] hover:bg-[#f3f6f4] transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-[#0f6b5c] ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {isLoading && !metrics ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-3xl bg-white p-8 border border-[#d6e7e1]">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#0f6b5c] border-t-transparent" />
          <p className="text-xs font-bold text-[#57685f]">Loading live ecosystem telemetry...</p>
        </div>
      ) : metrics ? (
        <div className="flex flex-col gap-7">
          {/* Key Metric Stats Grid - Interactive Cards */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Stat 1: Total Registered Users */}
            <Link
              href="/admin/users"
              className="group flex flex-col gap-3 rounded-3xl bg-white p-4 sm:p-6 border border-[#d6e7e1] shadow-xs hover:border-[#0f6b5c] hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#57685f] group-hover:text-[#0f6b5c] transition-colors">
                  Total Users
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c] group-hover:bg-[#0f6b5c] group-hover:text-white transition-colors">
                  <Users className="h-5 w-5" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#122622]">
                  {metrics.totalUsers.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-[#16793d] flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> Live
                </span>
              </div>
              <p className="text-[11px] text-[#57685f]">
                {metrics.activeParticipants} Devs • {metrics.verifiedOrganizers} Orgs • {metrics.activeJudges} Judges
              </p>
            </Link>

            {/* Stat 2: Active Hackathons */}
            <Link
              href="/admin/hackathons"
              className="group flex flex-col gap-3 rounded-3xl bg-white p-4 sm:p-6 border border-[#d6e7e1] shadow-xs hover:border-amber-500 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#57685f] group-hover:text-amber-700 transition-colors">
                  Active Events
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-[#c68a00] group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Trophy className="h-5 w-5" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#122622]">
                  {metrics.activeHackathonsCount}
                </span>
                <span className="text-[11px] font-bold text-gray-500">
                  of {metrics.totalHackathons} Total Events
                </span>
              </div>
              <p className="text-[11px] text-[#57685f]">
                {metrics.flaggedEventsCount > 0 ? `${metrics.flaggedEventsCount} Flagged Event` : "0 Flagged Events"}
              </p>
            </Link>

            {/* Stat 3: Total Prize Pool Volume */}
            <Link
              href="/admin/finances"
              className="group flex flex-col gap-3 rounded-3xl bg-white p-4 sm:p-6 border border-[#d6e7e1] shadow-xs hover:border-[#0f6b5c] hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#57685f] group-hover:text-[#0f6b5c] transition-colors">
                  Total Prize Pool
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c] group-hover:bg-[#0f6b5c] group-hover:text-white transition-colors">
                  <CreditCard className="h-5 w-5" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-xl sm:text-2xl font-extrabold text-[#0f6b5c]">
                  {metrics.totalPrizePoolVolumeETB.toLocaleString()} ETB
                </span>
              </div>
              <p className="text-[11px] text-[#57685f]">
                {metrics.escrowBalanceETB.toLocaleString()} ETB in Secure Escrow
              </p>
            </Link>

            {/* Stat 4: Pending Verification Queue */}
            <Link
              href="/admin/organization-requests"
              className="group flex flex-col gap-3 rounded-3xl bg-white p-4 sm:p-6 border border-[#d6e7e1] shadow-xs hover:border-amber-600 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#57685f] group-hover:text-amber-800 transition-colors">
                  Pending Org Queue
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Building2 className="h-5 w-5" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-amber-700">
                  {metrics.pendingOrgRequestsCount}
                </span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {metrics.pendingOrgRequestsCount > 0 ? "Requires Review" : "Queue Cleared"}
                </span>
              </div>
              <span className="text-[11px] font-extrabold text-[#0f6b5c] group-hover:underline flex items-center gap-1">
                <span>Open Verification Queue</span>
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <Link
              href="/admin/organization-requests"
              className="flex items-center justify-between rounded-2xl bg-white p-3 sm:p-4 border border-[#d6e7e1] shadow-2xs hover:border-[#0f6b5c] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-[#0f6b5c]" />
                <span className="text-xs font-extrabold text-[#122622]">Verify Organizers</span>
              </div>
              {metrics.pendingOrgRequestsCount > 0 && (
                <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-black">
                  {metrics.pendingOrgRequestsCount}
                </span>
              )}
            </Link>

            <Link
              href="/admin/hackathons"
              className="flex items-center justify-between rounded-2xl bg-white p-4 border border-[#d6e7e1] shadow-2xs hover:border-[#0f6b5c] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Trophy className="h-4 w-4 text-[#0f6b5c]" />
                <span className="text-xs font-extrabold text-[#122622]">Moderate Events</span>
              </div>
              <span className="rounded-full bg-[#e8f3f0] text-[#0f6b5c] px-2 py-0.5 text-[10px] font-black">
                {metrics.activeHackathonsCount}
              </span>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center justify-between rounded-2xl bg-white p-4 border border-[#d6e7e1] shadow-2xs hover:border-[#0f6b5c] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-[#0f6b5c]" />
                <span className="text-xs font-extrabold text-[#122622]">User Directory</span>
              </div>
              <span className="rounded-full bg-[#e8f3f0] text-[#0f6b5c] px-2 py-0.5 text-[10px] font-black">
                {metrics.totalUsers}
              </span>
            </Link>

            <Link
              href="/admin/audit-logs"
              className="flex items-center justify-between rounded-2xl bg-white p-4 border border-[#d6e7e1] shadow-2xs hover:border-[#0f6b5c] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-4 w-4 text-[#0f6b5c]" />
                <span className="text-xs font-extrabold text-[#122622]">Security Audit</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-[#57685f]" />
            </Link>
          </div>

          {/* Pending Organization Queue Snapshot with Direct Modal Review */}
          <div className="rounded-3xl border border-[#d6e7e1] bg-white p-4 sm:p-7 shadow-xs flex flex-col gap-4 sm:gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-[#d6e7e1] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e8f3f0] text-[#0f6b5c] shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#122622]">
                    Pending Organizer Verification Requests
                  </h3>
                  <p className="text-xs text-[#57685f]">
                    Review institutional documents and grant Organizer portal privileges directly.
                  </p>
                </div>
              </div>
              <Link
                href="/admin/organization-requests"
                className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0f6b5c] hover:underline shrink-0"
              >
                <span>View Full Queue ({pendingRequests.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-xs text-gray-500">
                <CheckCircle2 className="h-4 w-4 text-[#16793d] mr-2" />
                All organizer verification applications have been reviewed.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-[#f3f6f4] p-4 border border-[#d6e7e1] transition-all hover:border-[#0f6b5c]/40"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0f6b5c] font-display font-extrabold text-sm border border-[#d6e7e1] shadow-xs">
                        {req.name[0]}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[#122622] truncate">{req.name}</h4>
                          <span className="rounded-md bg-[#e8f3f0] text-[#0f6b5c] px-2 py-0.5 text-[10px] font-extrabold shrink-0">
                            {req.orgType}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#57685f] truncate">
                          Applicant: {req.applicantName} ({req.email}) • {req.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(req)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f6b5c] px-4 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-[#0b5347] transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect & Review</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Services & Infrastructure Health + Live Hackathons */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-6 rounded-3xl border border-[#d6e7e1] bg-white p-4 sm:p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#122622]">
                    <Server className="h-4 w-4 text-[#0f6b5c]" />
                    Infrastructure & Service Status
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                      health?.status === "HEALTHY"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {health?.status || "HEALTHY"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={refreshHealth}
                  disabled={isHealthRefreshing}
                  title="Refresh system telemetry"
                  className="flex items-center gap-1 text-[11px] font-bold text-[#0f6b5c] hover:text-[#0b5347] transition-colors cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${isHealthRefreshing ? "animate-spin" : ""}`} />
                  <span>Check Now</span>
                </button>
              </div>

              <div className="flex flex-col gap-2.5 text-xs">
                {/* Database */}
                <div className="flex items-center justify-between rounded-xl bg-[#f3f6f4] p-3 border border-[#d6e7e1]">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#122622]">
                      {health?.services?.database?.name || "PostgreSQL Primary Cluster"}
                    </span>
                    <span className="text-[10px] text-[#57685f]">
                      Direct query validation (SELECT 1)
                    </span>
                  </div>
                  <span
                    className={`font-extrabold flex items-center gap-1 ${
                      health?.services?.database?.status === "HEALTHY" ? "text-[#16793d]" : "text-amber-700"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {health?.services?.database?.latencyMs != null
                      ? `Healthy (${health.services.database.latencyMs}ms)`
                      : health?.services?.database?.message || "Healthy"}
                  </span>
                </div>

                {/* Cache / Celery Broker */}
                <div className="flex items-center justify-between rounded-xl bg-[#f3f6f4] p-3 border border-[#d6e7e1]">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#122622]">
                      {health?.services?.cache?.name || "Redis & Celery Task Queue"}
                    </span>
                    <span className="text-[10px] text-[#57685f]">
                      Async worker queue & task broker ping
                    </span>
                  </div>
                  <span
                    className={`font-extrabold flex items-center gap-1 ${
                      health?.services?.cache?.status === "HEALTHY" ? "text-[#16793d]" : "text-amber-700"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {health?.services?.cache?.latencyMs != null
                      ? `Operational (${health.services.cache.latencyMs}ms)`
                      : health?.services?.cache?.message || "Operational"}
                  </span>
                </div>

                {/* Auth & Token Rotation */}
                <div className="flex items-center justify-between rounded-xl bg-[#f3f6f4] p-3 border border-[#d6e7e1]">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#122622]">
                      {health?.services?.auth?.name || "Authentication & JWT Token Rotation"}
                    </span>
                    <span className="text-[10px] text-[#57685f]">
                      Token rotation & blacklisting active
                    </span>
                  </div>
                  <span className="font-extrabold text-[#16793d] flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {health?.services?.auth?.message || "Operational"}
                  </span>
                </div>

                {/* Storage & Media Bucket */}
                <div className="flex items-center justify-between rounded-xl bg-[#f3f6f4] p-3 border border-[#d6e7e1]">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#122622]">
                      {health?.services?.storage?.name || "Media Direct-Upload & Storage Service"}
                    </span>
                    <span className="text-[10px] text-[#57685f]">
                      Direct-to-storage upload enabled
                    </span>
                  </div>
                  <span className="font-extrabold text-[#16793d] flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {health?.services?.storage?.message || "Online"}
                  </span>
                </div>
              </div>

              {/* Memory & Telemetry Metadata */}
              <div className="flex items-center justify-between pt-2 border-t border-[#d6e7e1]/80 text-[11px] text-[#57685f]">
                <span>
                  Process Memory: <strong className="text-[#122622]">{health?.system?.memoryMb ? `${health.system.memoryMb} MB RSS` : "Normal"}</strong>
                  {health?.system?.pythonVersion ? ` • Python ${health.system.pythonVersion}` : ""}
                </span>
                <span>
                  Updated: <strong className="text-[#122622]">{health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : "Live"}</strong>
                </span>
              </div>
            </div>

            <div className="lg:col-span-6 rounded-3xl border border-[#d6e7e1] bg-white p-4 sm:p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#122622]">
                  <Activity className="h-4 w-4 text-[#0f6b5c]" />
                  Recent Platform Hackathons
                </h3>
                <Link
                  href="/admin/hackathons"
                  className="text-xs font-extrabold text-[#0f6b5c] hover:underline"
                >
                  Manage All
                </Link>
              </div>
              <div className="flex flex-col gap-2.5 text-xs">
                {activeHackathons.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">No hackathons registered yet.</p>
                ) : (
                  activeHackathons.map((h) => (
                    <div
                      key={h.id}
                      onClick={() => setSelectedHackathon(h)}
                      className="flex items-center justify-between rounded-xl bg-[#f3f6f4] p-3 border border-[#d6e7e1] hover:border-[#0f6b5c] transition-all cursor-pointer"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[#122622] truncate">{h.title}</span>
                        <span className="text-[10px] text-[#57685f]">
                          {h.hostOrgName} • {h.participantsCount} Devs • {h.teamsCount} Teams
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold shrink-0 ${
                          h.isSuspended
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {h.isSuspended ? "SUSPENDED" : "ACTIVE"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Review Modal for Pending Organizations */}
      {selectedRequest && (
        <OrgReviewModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onDecide={handleDecision}
        />
      )}

      {/* Hackathon Inspect & Moderation Modal */}
      {selectedHackathon && (
        <HackathonInspectModal
          hackathon={selectedHackathon}
          onClose={() => setSelectedHackathon(null)}
          onToggleSuspend={handleToggleSuspend}
          onToggleFeatured={handleToggleFeatured}
        />
      )}
    </AdminShell>
  );
}

