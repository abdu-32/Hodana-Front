"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Download,
  DollarSign,
  Lock,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminFinancialRecord, adminClient } from "@/features/admin/lib/admin-client";

export default function AdminFinancesPage() {
  const [financials, setFinancials] = useState<AdminFinancialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<AdminFinancialRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadFinancials = async () => {
    setIsLoading(true);
    try {
      const list = await adminClient.getFinancials();
      setFinancials(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFinancials();
  }, []);

  const totalVolume = financials.reduce((acc, f) => acc + f.totalPrizePoolETB, 0);
  const escrowedBalance = financials
    .filter((f) => f.escrowStatus === "ESCROWED")
    .reduce((acc, f) => acc + f.totalPrizePoolETB, 0);

  const handleReleaseEscrow = async (id: string, title: string) => {
    try {
      await adminClient.authorizeEscrowRelease(id);
      await loadFinancials();
      setToastMessage(`Disbursement release authorization granted for "${title}".`);
    } catch (e) {
      console.error(e);
      setToastMessage(`Failed to authorize release for "${title}".`);
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeleteRecord = async (id: string, title: string) => {
    setIsProcessing(true);
    try {
      await adminClient.deleteFinancialRecord(id);
      setRecordToDelete(null);
      await loadFinancials();
      setToastMessage(`Financial record for "${title}" has been deleted.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AdminShell activeMenu="finances">
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
          <CreditCard className="h-4 w-4" />
          <span>FINANCIAL AUDIT & ESCROW CONTROL</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#122622]">
          Financials & Prize Pool Escrow
        </h1>
        <p className="text-xs font-medium text-[#57685f]">
          Track hackathon prize pool commitments, escrow deposits via Chapa & Telebirr, and authorize grant disbursements.
        </p>
      </div>

      {/* Financial Summary Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2 rounded-3xl bg-white p-4 sm:p-6 border border-[#d6e7e1] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#57685f]">Total Prize Pool Committed</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c]">
              <DollarSign className="h-5 w-5" />
            </span>
          </div>
          <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#122622]">
            {totalVolume.toLocaleString()} ETB
          </span>
          <span className="text-[11px] font-bold text-[#16793d] flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> 100% Sponsor Backed
          </span>
        </div>

        <div className="flex flex-col gap-2 rounded-3xl bg-white p-4 sm:p-6 border border-[#d6e7e1] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#57685f]">Secured in Escrow</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c]">
              <Lock className="h-5 w-5" />
            </span>
          </div>
          <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#0f6b5c]">
            {escrowedBalance.toLocaleString()} ETB
          </span>
          <span className="text-[11px] text-[#57685f]">
            Held in National Bank & Chapa Escrow Vault
          </span>
        </div>

        <div className="flex flex-col gap-2 rounded-3xl bg-white p-4 sm:p-6 border border-[#d6e7e1] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#57685f]">Payment Gateways Active</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-[#0f6b5c]">
              <CreditCard className="h-5 w-5" />
            </span>
          </div>
          <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#0f6b5c]">
            Chapa • Telebirr
          </span>
          <span className="text-[11px] text-[#57685f]">
            Automated winner payout disbursement active
          </span>
        </div>
      </div>

      {/* Escrow Records Table */}
      <div className="rounded-3xl border border-[#d6e7e1] bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 sm:p-6 border-b border-[#d6e7e1]">
          <h3 className="text-base font-extrabold text-[#122622]">
            Hackathon Prize Escrow & Disbursement Schedule
          </h3>
          <span className="text-xs font-bold text-[#57685f]">
            {financials.length} Tracked Events
          </span>
        </div>

        {isLoading ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center gap-3 p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#0f6b5c] border-t-transparent" />
            <p className="text-xs font-bold text-[#57685f]">Loading escrow data...</p>
          </div>
        ) : financials.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#e8f3f0] text-[#0f6b5c]">
              <CreditCard className="h-7 w-7" />
            </div>
            <p className="text-sm font-extrabold text-[#122622]">No Escrow Records Found</p>
            <p className="text-xs text-[#57685f]">No hackathon prize pools or escrow deposits are currently active in the system.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[760px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#d6e7e1] bg-[#f3f6f4] text-[#57685f] font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-6">Event & Host</th>
                  <th className="py-4 px-6">Total Committed Pool</th>
                  <th className="py-4 px-6">Gateway</th>
                  <th className="py-4 px-6">Escrow Vault Status</th>
                  <th className="py-4 px-6">Disbursed Amount</th>
                  <th className="py-4 px-6 text-right">Escrow Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d6e7e1]/60 font-medium text-[#122622]">
                {financials.map((fin) => (
                  <tr key={fin.id} className="hover:bg-[#f3f6f4]/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-[#122622]">{fin.hackathonTitle}</span>
                        <span className="text-[11px] text-[#57685f]">{fin.hostOrgName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-extrabold text-[#122622]">
                      {fin.totalPrizePoolETB.toLocaleString()} ETB
                    </td>
                    <td className="py-4 px-6 font-bold text-[#57685f]">
                      {fin.gateway}
                    </td>
                    <td className="py-4 px-6">
                      {fin.escrowStatus === "ESCROWED" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-[#16793d] border border-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>100% Escrowed</span>
                        </span>
                      )}
                      {fin.escrowStatus === "PENDING_DEPOSIT" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-extrabold text-amber-800 border border-amber-200">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Pending Bank Deposit</span>
                        </span>
                      )}
                      {fin.escrowStatus === "DISBURSED" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold text-blue-700 border border-blue-200">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Released & Disbursed</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-[#57685f]">
                      {fin.disbursedAmountETB.toLocaleString()} ETB
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {fin.escrowStatus === "ESCROWED" ? (
                          <button
                            type="button"
                            onClick={() => handleReleaseEscrow(fin.hackathonId || fin.id, fin.hackathonTitle)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b5c] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#0b5347] transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Authorize Release</span>
                          </button>
                        ) : fin.escrowStatus === "DISBURSED" ? (
                          <span className="text-[11px] font-bold text-blue-700">
                            Completed
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-gray-400">
                            Awaiting Funds
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setRecordToDelete(fin)}
                          title={`Delete record for ${fin.hackathonTitle}`}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer shadow-2xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Financial Record Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="flex w-full max-w-md flex-col gap-5 rounded-3xl bg-white p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#122622]">Delete Financial Record</h3>
                <p className="text-xs font-medium text-[#57685f]">Remove prize pool & escrow tracking</p>
              </div>
            </div>

            <div className="rounded-2xl bg-red-50/70 border border-red-200/60 p-4 text-xs text-red-950">
              <p className="font-semibold">
                Are you sure you want to delete the financial record for{" "}
                <span className="font-bold underline">{recordToDelete.hackathonTitle}</span>?
              </p>
              <p className="mt-1.5 text-[11px] text-red-700">
                This will clear the prize budget ({recordToDelete.totalPrizePoolETB.toLocaleString()} ETB) and remove this escrow schedule from the audit ledger.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                disabled={isProcessing}
                className="w-full sm:w-auto rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleDeleteRecord(recordToDelete.hackathonId || recordToDelete.id, recordToDelete.hackathonTitle)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-2xl bg-red-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-red-700 transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isProcessing ? "Deleting..." : "Delete Record"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
