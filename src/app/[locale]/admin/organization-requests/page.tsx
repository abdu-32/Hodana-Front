"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { OrgReviewModal } from "@/features/admin/components/OrgReviewModal";
import {
  AdminOrganizationRequest,
  OrgRequestStatus,
  adminClient,
} from "@/features/admin/lib/admin-client";

export default function AdminOrganizationRequestsPage() {
  const [requests, setRequests] = useState<AdminOrganizationRequest[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<AdminOrganizationRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const list = await adminClient.getOrganizationRequests("ALL");
      setRequests(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleDecision = async (status: OrgRequestStatus, notes?: string) => {
    if (!selectedRequest) return;
    try {
      await adminClient.reviewOrganization(selectedRequest.id, status, notes);
      await loadRequests();
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


  const filteredRequests = requests.filter((r) => {
    const matchesFilter = activeFilter === "ALL" || r.status === activeFilter;
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.orgType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <AdminShell activeMenu="organizations" pendingOrgCount={pendingCount}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#0e2b25] px-5 py-3 text-xs font-extrabold text-white shadow-xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-extrabold text-[#0f6b5c]">
          <Building2 className="h-4 w-4" />
          <span>VERIFICATION & ONBOARDING</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#122622]">
          Organization Verification Queue
        </h1>
        <p className="text-xs font-medium text-[#57685f]">
          Review incoming host applications, verify institutional credentials, and grant official Organizer portal access.
        </p>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-white p-4 sm:p-5 border border-[#d6e7e1] shadow-xs">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => {
            const count =
              tab === "ALL"
                ? requests.length
                : requests.filter((r) => r.status === tab).length;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === tab
                    ? "bg-[#0f6b5c] text-white shadow-xs"
                    : "bg-[#f3f6f4] text-[#57685f] hover:text-[#122622]"
                }`}
              >
                <span>
                  {tab === "ALL"
                    ? "All Applications"
                    : tab === "PENDING"
                    ? "Pending Review"
                    : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                    activeFilter === tab ? "bg-white/20 text-white" : "bg-[#e8f3f0] text-[#0f6b5c]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Field */}
        <div className="relative flex items-center w-full sm:w-auto sm:min-w-[260px]">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, type..."
            className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] pl-10 pr-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-3xl border border-[#d6e7e1] bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#0f6b5c] border-t-transparent" />
            <p className="text-xs font-bold text-[#57685f]">Loading applications...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#e8f3f0] text-[#0f6b5c]">
              <Building2 className="h-7 w-7" />
            </div>
            <p className="text-sm font-extrabold text-[#122622]">No Organization Requests Found</p>
            <p className="text-xs text-[#57685f]">
              No applications match the selected filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[760px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#d6e7e1] bg-[#f3f6f4] text-[#57685f] font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-6">Organization</th>
                  <th className="py-4 px-6">Applicant & Contact</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Submitted</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d6e7e1]/60 font-medium text-[#122622]">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#f3f6f4]/60 transition-colors">
                    {/* Organization Name & Logo */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c] font-display font-extrabold text-sm border border-[#d6e7e1] shadow-2xs">
                          {req.name[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-[#122622]">{req.name}</span>
                          <span className="text-[11px] text-[#57685f]">{req.location}</span>
                        </div>
                      </div>
                    </td>

                    {/* Applicant Info */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#122622]">{req.applicantName}</span>
                        <span className="text-[11px] text-[#57685f]">{req.email}</span>
                        <span className="text-[10px] text-[#0f6b5c]">{req.applicantRole}</span>
                      </div>
                    </td>

                    {/* Category / Type */}
                    <td className="py-4 px-6">
                      <span className="rounded-xl bg-[#e8f3f0] px-2.5 py-1 text-[11px] font-extrabold text-[#0f6b5c] border border-[#d6e7e1]">
                        {req.orgType}
                      </span>
                    </td>

                    {/* Submission Date */}
                    <td className="py-4 px-6 text-[#57685f] text-[11px]">
                      {new Date(req.submittedAt).toLocaleDateString()}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      {req.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-extrabold text-amber-800 border border-amber-200">
                          <Clock className="h-3 w-3" />
                          <span>Pending Review</span>
                        </span>
                      )}
                      {req.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-[#16793d] border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Approved</span>
                        </span>
                      )}
                      {req.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[11px] font-extrabold text-[#c4211c] border border-red-200">
                          <XCircle className="h-3 w-3" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(req)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b5c] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#0b5347] transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect Credentials</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Drawer Modal */}
      {selectedRequest && (
        <OrgReviewModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onDecide={handleDecision}
        />
      )}
    </AdminShell>
  );
}
