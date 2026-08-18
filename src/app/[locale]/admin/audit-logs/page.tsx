"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Building2,
  Trophy,
  Shield,
} from "lucide-react";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminAuditLog, adminClient } from "@/features/admin/lib/admin-client";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminClient.getAuditLogs().then((list) => {
      setLogs(list);
      setIsLoading(false);
    });
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchesFilter = activeFilter === "ALL" || l.targetType === activeFilter;
    const matchesSearch =
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <AdminShell activeMenu="audit">
      {/* Header Bar */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-extrabold text-[#0f6b5c]">
          <ShieldAlert className="h-4 w-4" />
          <span>SECURITY & IMMUTABLE TRACEABILITY</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#122622]">
          Administrative Audit Logs
        </h1>
        <p className="text-xs font-medium text-[#57685f]">
          Chronological record of all administrative approvals, hackathon moderations, role reassignments, and security events.
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-white p-4 sm:p-5 border border-[#d6e7e1] shadow-xs">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "ALL", label: "All Audit Actions" },
            { key: "ORGANIZATION", label: "Organizations" },
            { key: "HACKATHON", label: "Hackathons" },
            { key: "USER", label: "Users & Roles" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveFilter(item.key)}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeFilter === item.key
                  ? "bg-[#0f6b5c] text-white shadow-xs"
                  : "bg-[#f3f6f4] text-[#57685f] hover:text-[#122622]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative flex items-center min-w-[280px]">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs by actor, action, or target..."
            className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] pl-10 pr-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl border border-[#d6e7e1] bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#0f6b5c] border-t-transparent" />
            <p className="text-xs font-bold text-[#57685f]">Loading audit records...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#e8f3f0] text-[#0f6b5c]">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <p className="text-sm font-extrabold text-[#122622]">No Audit Logs Found</p>
            <p className="text-xs text-[#57685f]">No security records match your filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#d6e7e1] bg-[#f3f6f4] text-[#57685f] font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Administrator</th>
                  <th className="py-4 px-6">Action Event</th>
                  <th className="py-4 px-6">Target Resource</th>
                  <th className="py-4 px-6">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d6e7e1]/60 font-medium text-[#122622]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#f3f6f4]/60 transition-colors">
                    <td className="py-4 px-6 text-[#57685f] whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-[#122622]">{log.actorName}</span>
                        <span className="text-[10px] text-[#57685f]">{log.actorEmail}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="rounded-md bg-[#e8f3f0] px-2 py-0.5 font-extrabold text-[#0f6b5c] text-[10px] border border-[#d6e7e1]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-[#122622]">
                      {log.targetName}
                    </td>
                    <td className="py-4 px-6 text-[#57685f] leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
