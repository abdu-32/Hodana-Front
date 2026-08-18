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
} from "lucide-react";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminFinancialRecord, adminClient } from "@/features/admin/lib/admin-client";

export default function AdminFinancesPage() {
  const [financials, setFinancials] = useState<AdminFinancialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    adminClient.getFinancials().then((list) => {
      setFinancials(list);
      setIsLoading(false);
    });
  }, []);

  const totalVolume = financials.reduce((acc, f) => acc + f.totalPrizePoolETB, 0);
  const escrowedBalance = financials
    .filter((f) => f.escrowStatus === "ESCROWED")
    .reduce((acc, f) => acc + f.totalPrizePoolETB, 0);

  const handleReleaseEscrow = (id: string, title: string) => {
    setToastMessage(`Disbursement release authorization initiated for "${title}".`);
    setTimeout(() => setToastMessage(null), 4000);
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2 rounded-3xl bg-white p-6 border border-[#d6e7e1] shadow-xs">
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

        <div className="flex flex-col gap-2 rounded-3xl bg-white p-6 border border-[#d6e7e1] shadow-xs">
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

        <div className="flex flex-col gap-2 rounded-3xl bg-white p-6 border border-[#d6e7e1] shadow-xs">
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
        <div className="flex items-center justify-between p-6 border-b border-[#d6e7e1]">
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
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
                    </td>
                    <td className="py-4 px-6 text-[#57685f]">
                      {fin.disbursedAmountETB.toLocaleString()} ETB
                    </td>
                    <td className="py-4 px-6 text-right">
                      {fin.escrowStatus === "ESCROWED" ? (
                        <button
                          type="button"
                          onClick={() => handleReleaseEscrow(fin.id, fin.hackathonTitle)}
                          className="inline-flex items-center gap-1 rounded-xl bg-[#0f6b5c] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#0b5347] transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Authorize Release</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-gray-400">
                          Awaiting Funds
                        </span>
                      )}
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
