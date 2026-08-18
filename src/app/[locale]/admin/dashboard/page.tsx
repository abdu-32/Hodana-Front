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
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AdminShell } from "@/features/admin/components/AdminShell";
import {
  AdminMetrics,
  AdminOrganizationRequest,
  AdminHackathon,
  adminClient,
} from "@/features/admin/lib/admin-client";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [pendingRequests, setPendingRequests] = useState<AdminOrganizationRequest[]>([]);
  const [activeHackathons, setActiveHackathons] = useState<AdminHackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [m, reqs, hcks] = await Promise.all([
          adminClient.getMetrics(),
          adminClient.getOrganizationRequests("PENDING"),
          adminClient.getHackathons("ALL"),
        ]);
        setMetrics(m);
        setPendingRequests(reqs.slice(0, 3));
        setActiveHackathons(hcks.slice(0, 3));
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <AdminShell activeMenu="dashboard" pendingOrgCount={metrics?.pendingOrgRequestsCount}>
      {/* Overview Top Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-extrabold text-[#0f6b5c]">
          <ShieldCheck className="h-4 w-4" />
          <span>GOVERNANCE DASHBOARD</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#122622]">
          Platform Ecosystem Overview
        </h1>
        <p className="text-xs font-medium text-[#57685f]">
          Real-time metrics, verification queues, security status, and national hackathon health.
        </p>
      </div>

      {isLoading ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-3xl bg-white p-8 border border-[#d6e7e1]">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#0f6b5c] border-t-transparent" />
          <p className="text-xs font-bold text-[#57685f]">Loading ecosystem statistics...</p>
        </div>
      ) : metrics ? (
        <div className="flex flex-col gap-7">
          {/* Key Metric Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Stat 1: Total Registered Users */}
            <div className="flex flex-col gap-3 rounded-3xl bg-white p-6 border border-[#d6e7e1] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#57685f]">Total Users</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c]">
                  <Users className="h-5 w-5" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-extrabold text-[#122622]">
                  {metrics.totalUsers.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-[#16793d] flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +14% this month
                </span>
              </div>
              <p className="text-[11px] text-[#57685f]">
                {metrics.activeParticipants} Devs • {metrics.verifiedOrganizers} Orgs • {metrics.activeJudges} Judges
              </p>
            </div>

            {/* Stat 2: Active Hackathons */}
            <div className="flex flex-col gap-3 rounded-3xl bg-white p-6 border border-[#d6e7e1] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#57685f]">Active Events</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-[#c68a00]">
                  <Trophy className="h-5 w-5" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-extrabold text-[#122622]">
                  {metrics.activeHackathonsCount}
                </span>
                <span className="text-[11px] font-bold text-gray-500">
                  of {metrics.totalHackathons} Total Events
                </span>
              </div>
              <p className="text-[11px] text-[#57685f]">
                {metrics.flaggedEventsCount > 0 ? `${metrics.flaggedEventsCount} Flagged Event` : "0 Flagged Events"}
              </p>
            </div>

            {/* Stat 3: Total Prize Pool Volume */}
            <div className="flex flex-col gap-3 rounded-3xl bg-white p-6 border border-[#d6e7e1] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#57685f]">Total Prize Pool</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c]">
                  <CreditCard className="h-5 w-5" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-extrabold text-[#0f6b5c]">
                  {metrics.totalPrizePoolVolumeETB.toLocaleString()} ETB
                </span>
              </div>
              <p className="text-[11px] text-[#57685f]">
                {metrics.escrowBalanceETB.toLocaleString()} ETB in Secure Escrow
              </p>
            </div>

            {/* Stat 4: Pending Verification Queue */}
            <div className="flex flex-col gap-3 rounded-3xl bg-white p-6 border border-[#d6e7e1] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#57685f]">Pending Org Queue</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c]">
                  <Building2 className="h-5 w-5" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-extrabold text-amber-700">
                  {metrics.pendingOrgRequestsCount}
                </span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Requires Review
                </span>
              </div>
              <Link
                href="/admin/organization-requests"
                className="text-[11px] font-extrabold text-[#0f6b5c] hover:underline flex items-center gap-1"
              >
                <span>Open Approval Queue</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Pending Organization Queue Snapshot */}
          <div className="rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-7 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e8f3f0] text-[#0f6b5c]">
                  <Building2 className="h-4 w-4" />
                </div>
                <h3 className="text-base font-extrabold text-[#122622]">
                  Pending Organizer Verification Requests
                </h3>
              </div>
              <Link
                href="/admin/organization-requests"
                className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0f6b5c] hover:underline"
              >
                <span>View All ({pendingRequests.length})</span>
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
                          <span className="rounded-md bg-[#e8f3f0] text-[#0f6b5c] px-2 py-0.5 text-[10px] font-extrabold">
                            {req.orgType}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#57685f]">
                          Applicant: {req.applicantName} ({req.email}) • {req.location}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/admin/organization-requests"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f6b5c] px-4 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-[#0b5347] transition-colors shrink-0"
                    >
                      <span>Review Credentials</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Services & Infrastructure Health */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-6 rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-xs flex flex-col gap-4">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#122622]">
                <Server className="h-4 w-4 text-[#0f6b5c]" />
                Infrastructure & Service Status
              </h3>
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between rounded-xl bg-[#f3f6f4] p-3 border border-[#d6e7e1]">
                  <span className="font-bold text-[#122622]">PostgreSQL Cluster (Primary + Replica)</span>
                  <span className="font-extrabold text-[#16793d] flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Healthy (2ms latency)
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#f3f6f4] p-3 border border-[#d6e7e1]">
                  <span className="font-bold text-[#122622]">Authentication & JWT Token Rotation</span>
                  <span className="font-extrabold text-[#16793d] flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Operational
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#f3f6f4] p-3 border border-[#d6e7e1]">
                  <span className="font-bold text-[#122622]">Chapa / Telebirr Escrow Gateway</span>
                  <span className="font-extrabold text-[#16793d] flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active Webhooks
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#f3f6f4] p-3 border border-[#d6e7e1]">
                  <span className="font-bold text-[#122622]">S3 / Media Direct-Upload Bucket</span>
                  <span className="font-extrabold text-[#16793d] flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Online
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-xs flex flex-col gap-4">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#122622]">
                <Activity className="h-4 w-4 text-[#0f6b5c]" />
                Recent Platform Hackathons
              </h3>
              <div className="flex flex-col gap-2.5 text-xs">
                {activeHackathons.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between rounded-xl bg-[#f3f6f4] p-3 border border-[#d6e7e1]"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-[#122622] truncate">{h.title}</span>
                      <span className="text-[10px] text-[#57685f]">{h.hostOrgName} • {h.participantsCount} Devs</span>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                        h.isSuspended
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {h.isSuspended ? "SUSPENDED" : "ACTIVE"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
