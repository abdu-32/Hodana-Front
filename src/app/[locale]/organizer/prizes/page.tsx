"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  Gavel,
  Trophy,
  FileText,
  Megaphone,
  Briefcase,
  Bell,
  Search,
  Check,
  Plus,
  ChevronDown,
  Layers,
  Rocket,
  Save,
  DollarSign,
  Award,
  CreditCard,
  Building2,
  Smartphone,
  Wallet,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Download,
  Loader2,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { Logomark } from "@/components/ui/Logomark";
import { downloadHackathonExport } from "@/features/exports";
import {
  prizesClient,
  type PrizePool,
  type PaymentMethodConfig,
} from "@/features/prizes/lib/prizes-client";
import { listHackathons } from "@/features/hackathons/lib/hackathons-client";
import type { Hackathon } from "@/lib/api-types-helpers";
import { NotificationBellDropdown } from "@/features/notifications/components/NotificationBellDropdown";
import { PortalMobileNav } from "@/components/layout/PortalMobileNav";

export default function OrganizerPrizesPage() {
  const t = useTranslations("Organizer");
  const { user } = useSession();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("prizes");
  
  // Dynamic Hackathons State
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isLoadingHackathons, setIsLoadingHackathons] = useState(true);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>("");
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Prize Pool & Budget State
  const [totalPrizeBudget, setTotalPrizeBudget] = useState<number>(0);
  const [currency, setCurrency] = useState<"ETB" | "USD">("ETB");
  const [firstPlaceAmount, setFirstPlaceAmount] = useState<number>(0);
  const [firstPlacePerks, setFirstPlacePerks] = useState<string>("");
  const [firstPlaceBadge, setFirstPlaceBadge] = useState<string>("");

  const [secondPlaceAmount, setSecondPlaceAmount] = useState<number>(0);
  const [secondPlacePerks, setSecondPlacePerks] = useState<string>("");
  const [secondPlaceBadge, setSecondPlaceBadge] = useState<string>("");

  const [thirdPlaceAmount, setThirdPlaceAmount] = useState<number>(0);
  const [thirdPlacePerks, setThirdPlacePerks] = useState<string>("");
  const [thirdPlaceBadge, setThirdPlaceBadge] = useState<string>("");

  const [payoutTerms, setPayoutTerms] = useState<string>("");

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);

  // Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  const organizerName = user?.fullName || "Abeba Selassie";
  const organizerTitle = "Lead Organizer";
  const userInitial = organizerName.charAt(0).toUpperCase();

  // 1. Fetch dynamic hackathons on mount
  useEffect(() => {
    async function fetchOrganizerHackathons() {
      setIsLoadingHackathons(true);
      try {
        const res = await listHackathons({ managedOnly: true });
        const list = res.data || [];
        setHackathons(list);
        if (list.length > 0) {
          setSelectedHackathonId((prev) => {
            const exists = list.some((h) => h.id === prev);
            return exists ? prev : list[0].id;
          });
        }
      } catch (err) {
        console.error("Failed to load organizer hackathons:", err);
      } finally {
        setIsLoadingHackathons(false);
      }
    }
    fetchOrganizerHackathons();
  }, []);

  // 2. Load prize & payment configuration whenever selected hackathon changes
  useEffect(() => {
    if (!selectedHackathonId) return;

    async function loadConfig() {
      try {
        const res = await prizesClient.getPrizeDetails(selectedHackathonId);
        if (res.prizePool) {
          setTotalPrizeBudget(res.prizePool.totalPrizeBudget || 0);
          setCurrency(res.prizePool.currency || "ETB");
          setFirstPlaceAmount(res.prizePool.firstPlaceAmount || 0);
          setFirstPlacePerks(res.prizePool.firstPlacePerks || "");
          setFirstPlaceBadge(res.prizePool.firstPlaceBadge || "1st Place Winner Trophy 🏆");

          setSecondPlaceAmount(res.prizePool.secondPlaceAmount || 0);
          setSecondPlacePerks(res.prizePool.secondPlacePerks || "");
          setSecondPlaceBadge(res.prizePool.secondPlaceBadge || "2nd Place Runner-Up Badge 🥈");

          setThirdPlaceAmount(res.prizePool.thirdPlaceAmount || 0);
          setThirdPlacePerks(res.prizePool.thirdPlacePerks || "");
          setThirdPlaceBadge(res.prizePool.thirdPlaceBadge || "3rd Place Runner-Up Badge 🥉");

          setPayoutTerms(res.prizePool.payoutTerms || "");
        }
        if (res.paymentMethods) {
          setPaymentMethods(res.paymentMethods);
        }
      } catch (err) {
        console.error("Failed to load prize configuration:", err);
      }
    }
    loadConfig();
  }, [selectedHackathonId]);

  // Aggregate Prize Pool & Budget Calculations
  const totalTierAllocated =
    (Number(firstPlaceAmount) || 0) +
    (Number(secondPlaceAmount) || 0) +
    (Number(thirdPlaceAmount) || 0);

  const budgetRemaining = totalPrizeBudget - totalTierAllocated;
  const isOverBudget = totalPrizeBudget > 0 && totalTierAllocated > totalPrizeBudget;

  // Handle Save
  const handleSaveConfiguration = async () => {
    if (!selectedHackathonId) return;

    const budget = Number(totalPrizeBudget) || 0;
    const first = Number(firstPlaceAmount) || 0;
    const second = Number(secondPlaceAmount) || 0;
    const third = Number(thirdPlaceAmount) || 0;
    const tiersSum = first + second + third;

    if (budget < 0 || first < 0 || second < 0 || third < 0) {
      setSaveErrorMsg("Prize budget and tier prize amounts cannot be negative.");
      setTimeout(() => setSaveErrorMsg(null), 4000);
      return;
    }

    if (budget > 0 && tiersSum > budget) {
      setSaveErrorMsg(
        `Tier prize sum (${tiersSum.toLocaleString()} ${currency}) exceeds total prize budget (${budget.toLocaleString()} ${currency}). Please adjust the distribution.`
      );
      setTimeout(() => setSaveErrorMsg(null), 5000);
      return;
    }

    setIsSaving(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    try {
      await prizesClient.savePrizeDetails(
        selectedHackathonId,
        {
          totalPrizeBudget: budget,
          currency,
          firstPlaceAmount: first,
          firstPlacePerks,
          firstPlaceBadge,
          secondPlaceAmount: second,
          secondPlacePerks,
          secondPlaceBadge,
          thirdPlaceAmount: third,
          thirdPlacePerks,
          thirdPlaceBadge,
          payoutTerms,
        },
        paymentMethods
      );

      // Update local hackathon item state
      setHackathons((prev) =>
        prev.map((h) =>
          h.id === selectedHackathonId
            ? { ...h, totalPrizeBudget: String(budget) }
            : h
        )
      );

      setSaveSuccessMsg("Prize budget & tier distributions saved to database successfully!");
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err) {
      console.error("Failed to save prize configuration:", err);
      setSaveErrorMsg("Failed to save prize configuration. Please try again.");
      setTimeout(() => setSaveErrorMsg(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Payment Method Active
  const handleTogglePaymentMethod = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((pm) => (pm.id === id ? { ...pm, isActive: !pm.isActive } : pm))
    );
  };

  // Add New Payment Method
  const handleAddPaymentMethod = (
    providerName: string,
    type: "BANK_TRANSFER" | "MOBILE_MONEY" | "CRYPTO"
  ) => {
    const newMethod: PaymentMethodConfig = {
      id: `pm-${Date.now()}`,
      hackathonId: selectedHackathonId,
      providerType: type,
      providerName,
      accountName: `${providerName} Merchant Account`,
      accountNumber: providerName.toLowerCase().includes("chapa")
        ? "CHAPA-ORG-1001"
        : providerName.toLowerCase().includes("cheche")
        ? "CHECHE-ORG-2002"
        : providerName.toLowerCase().includes("telebirr")
        ? "+251911002233"
        : "100099887766",
      isActive: true,
    };
    setPaymentMethods((prev) => [...prev, newMethod]);
  };

  // Remove Payment Method
  const handleRemovePaymentMethod = (id: string) => {
    setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id));
  };

  // Export Prizes Current View Handler
  const handleExportPrizes = async () => {
    setIsExporting(true);
    try {
      await downloadHackathonExport({
        hackathonId: selectedHackathonId || "all",
        resource: "prizes",
        format: "xlsx",
      });
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const selectedHackathon = hackathons.find((h) => h.id === selectedHackathonId);
  const selectedHackathonTitle =
    selectedHackathon?.title || (isLoadingHackathons ? "Loading..." : "No Event Selected");

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#122622]">
      {/* Mobile Sticky Navigation Bar & Slide-Out Drawer */}
      <PortalMobileNav portalType="organizer" activeItem="prizes" title="Prizes" />

      <div className="mx-auto flex w-full max-w-[1500px]">
        {/* ================= LEFT SIDEBAR (ORGANIZER CONTEXT) ================= */}
        <aside
          className={`sticky top-0 hidden h-screen flex-col justify-between border-r border-[#d6e7e1] bg-white p-5 lg:flex shadow-2xs transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "w-20 px-3" : "w-64 px-5"
          }`}
        >
          <div className="flex flex-col gap-8">
            {/* Brand Logo & Portal Tag -> Navigates to Hero / Homepage */}
            <Link
              href="/"
              className="flex items-center gap-3 cursor-pointer text-left group focus:outline-none"
              title="Go to Home"
            >
              <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#e8f3f0] border border-[#d6e7e1] shadow-xs overflow-hidden p-1 transition-transform group-hover:scale-105">
                <Logomark className="h-full w-full object-contain" />
              </span>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                  isSidebarCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-xs opacity-100"
                }`}
              >
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#0f6b5c]">
                  HODANA
                </h1>
                <p className="text-xs font-semibold text-[#57685f]">
                  Ecosystem Portal
                </p>
              </div>
            </Link>

            {/* Sidebar Navigation */}
            <nav className="flex flex-col gap-1 text-xs font-semibold text-[#57685f]">
              <Link
                href="/organizer/dashboard"
                title={isSidebarCollapsed ? "Dashboard" : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Dashboard</span>}
              </Link>

              <Link
                href="/organizer/hackathons"
                title={isSidebarCollapsed ? "Hackathons" : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Calendar className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Hackathons</span>}
              </Link>

              <Link
                href="/organizer/registrations"
                title={isSidebarCollapsed ? "Registrations" : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <UserCheck className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Registrations</span>}
              </Link>

              <Link
                href="/organizer/judges"
                title={isSidebarCollapsed ? "Judging" : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Gavel className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Judging</span>}
              </Link>

              <Link
                href="/organizer/prizes"
                title={isSidebarCollapsed ? "Prizes" : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } bg-[#0f6b5c] text-white shadow-md font-bold`}
              >
                <Trophy className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Prizes</span>}
              </Link>

              <Link
                href="/organizer/submissions"
                title={isSidebarCollapsed ? t("navAnalytics") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <FileText className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navAnalytics")}</span>}
              </Link>

              <Link
                href="/organizer/announcements"
                title={isSidebarCollapsed ? t("navAnnouncements") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Megaphone className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navAnnouncements")}</span>}
              </Link>

              <Link
                href="/dashboard/portfolio"
                title={isSidebarCollapsed ? "Portfolio" : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Briefcase className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Portfolio</span>}
              </Link>
            </nav>
          </div>

          {/* Sidebar Bottom CTA & User Footer */}
          <div className="flex flex-col gap-4 border-t border-[#d6e7e1] pt-4">
            <Link
              href="/hackathons"
              title={isSidebarCollapsed ? "+ Launch Project" : undefined}
              className={`flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] hover:bg-[#0b5347] py-2.5 text-xs font-bold text-white shadow-md transition-all ${
                isSidebarCollapsed ? "px-0" : "px-4"
              }`}
            >
              <Rocket className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span className="whitespace-nowrap">+ Launch Project</span>}
            </Link>

            <Link
              href="/settings/profile"
              title={isSidebarCollapsed ? organizerName : undefined}
              className={`flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-100 ${
                isSidebarCollapsed ? "justify-center p-1" : ""
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0f6b5c] text-xs font-extrabold text-white shadow-xs">
                {userInitial}
              </span>
              {!isSidebarCollapsed && (
                <div className="flex min-w-0 flex-1 flex-col whitespace-nowrap overflow-hidden">
                  <p className="truncate text-xs font-bold text-[#122622]">
                    {organizerName}
                  </p>
                  <p className="truncate text-[11px] font-medium text-[#57685f]">
                    {organizerTitle}
                  </p>
                </div>
              )}
            </Link>
          </div>
        </aside>

        {/* ================= MAIN CONTENT AREA ================= */}
        <main className="flex min-w-0 flex-1 flex-col p-4 sm:p-6 lg:p-8 transition-all duration-300">
          {/* Top Bar Title & Event Scope Selector */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6">
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#122622]">
                Prizes & Budget Allocation
              </h1>
              <p className="text-xs text-[#57685f] mt-1">
                Configure total prize budget, 1st/2nd/3rd place distributions, and winner disbursement gateways.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              {/* Dynamic Hackathon Selector Dropdown */}
              <div className="relative w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsEventDropdownOpen((prev) => !prev)}
                  disabled={isLoadingHackathons || hackathons.length === 0}
                  className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2.5 rounded-2xl border border-[#d6e7e1] bg-white px-4 py-2.5 text-xs font-extrabold text-[#122622] shadow-2xs hover:border-[#0f6b5c]/40 transition-all cursor-pointer disabled:opacity-60"
                >
                  <Layers className="h-4 w-4 text-[#0f6b5c] shrink-0" />
                  <span className="text-[#57685f] font-semibold">Select Event:</span>
                  <span className="max-w-[140px] sm:max-w-[180px] truncate">{selectedHackathonTitle}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#57685f] transition-transform duration-200 ${
                      isEventDropdownOpen ? "rotate-180 text-[#0f6b5c]" : ""
                    }`}
                  />
                </button>

              {isEventDropdownOpen && hackathons.length > 0 && (
                <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-full sm:w-72 max-h-80 overflow-y-auto rounded-2xl border border-[#d6e7e1] bg-white p-2 shadow-xl z-30 animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#57685f]">
                    Managed Hackathons ({hackathons.length})
                  </div>
                  {hackathons.map((hck) => (
                    <button
                      key={hck.id}
                      type="button"
                      onClick={() => {
                        setSelectedHackathonId(hck.id);
                        setIsEventDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                        selectedHackathonId === hck.id
                          ? "bg-[#0f6b5c] text-white shadow-xs"
                          : "text-[#122622] hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
                      }`}
                    >
                      <div className="flex flex-col items-start truncate pr-2">
                        <span className="truncate">{hck.title}</span>
                        <span className={`text-[10px] font-medium ${selectedHackathonId === hck.id ? "text-emerald-100" : "text-[#57685f]"}`}>
                          Budget: {hck.totalPrizeBudget ? Number(hck.totalPrizeBudget).toLocaleString() : "0"} • {hck.status || "draft"}
                        </span>
                      </div>
                      {selectedHackathonId === hck.id && (
                        <Check className="h-4 w-4 shrink-0 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

              {/* Export Prizes Button */}
              <button
                type="button"
                onClick={handleExportPrizes}
                disabled={isExporting || isLoadingHackathons}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d6e7e1] bg-white px-4 py-2.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#e8f3f0] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                title="Export prize allocations and winners"
              >
                {isExporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0f6b5c]" />
                ) : (
                  <Download className="h-3.5 w-3.5 text-[#0f6b5c]" />
                )}
                <span>Export Prizes</span>
              </button>

              <NotificationBellDropdown />
            </div>
          </div>


          {/* Feedback Banners */}
          {saveSuccessMsg && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 animate-fade-in">
              <Check className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {saveErrorMsg && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-800 animate-fade-in">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{saveErrorMsg}</span>
            </div>
          )}

          {/* Empty State when no hackathons available */}
          {!isLoadingHackathons && hackathons.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#d6e7e1] bg-white p-12 text-center my-8">
              <Trophy className="h-12 w-12 text-[#0f6b5c]/40 mb-3" />
              <h3 className="text-base font-extrabold text-[#122622]">
                No Hackathons Created Yet
              </h3>
              <p className="text-xs text-[#57685f] max-w-sm mt-1 mb-5">
                Create your first hackathon to configure prize pools, cash budgets, and winner disbursement channels.
              </p>
              <Link
                href="/organizer/hackathons"
                className="flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Create Hackathon</span>
              </Link>
            </div>
          ) : (
            <>
              {/* 1. Total Prize Budget & Overview Banner */}
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between rounded-3xl border border-[#d6e7e1] bg-gradient-to-r from-[#0f6b5c] to-[#0b5347] p-6 sm:p-8 text-white shadow-lg">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-inner">
                    <Trophy className="h-7 w-7 text-amber-300" />
                  </span>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-100">
                      Total Prize Budget • {selectedHackathonTitle}
                    </span>
                    <h2 className="font-display text-3xl font-extrabold mt-1">
                      {currency === "ETB"
                        ? `${(totalPrizeBudget || 0).toLocaleString()} ETB`
                        : `$${(totalPrizeBudget || 0).toLocaleString()} USD`}
                    </h2>
                  </div>
                </div>

                {/* Rank Breakdown Badges */}
                <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-3">
                  <div className="flex flex-col items-center rounded-2xl bg-white/10 backdrop-blur-md px-3.5 py-2 border border-white/15">
                    <span className="text-[10px] font-bold text-amber-200">1st Place</span>
                    <span className="text-xs font-extrabold">
                      {currency === "ETB" ? `${(firstPlaceAmount || 0).toLocaleString()} ETB` : `$${(firstPlaceAmount || 0).toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex flex-col items-center rounded-2xl bg-white/10 backdrop-blur-md px-3.5 py-2 border border-white/15">
                    <span className="text-[10px] font-bold text-gray-200">2nd Place</span>
                    <span className="text-xs font-extrabold">
                      {currency === "ETB" ? `${(secondPlaceAmount || 0).toLocaleString()} ETB` : `$${(secondPlaceAmount || 0).toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex flex-col items-center rounded-2xl bg-white/10 backdrop-blur-md px-3.5 py-2 border border-white/15">
                    <span className="text-[10px] font-bold text-orange-200">3rd Place</span>
                    <span className="text-xs font-extrabold">
                      {currency === "ETB" ? `${(thirdPlaceAmount || 0).toLocaleString()} ETB` : `$${(thirdPlaceAmount || 0).toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Budget Setting & Currency Designation Panel */}
              <div className="mb-6 rounded-3xl bg-white border border-[#d6e7e1] p-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#d6e7e1]">
                  <div>
                    <h3 className="font-display text-base font-extrabold text-[#122622]">
                      Hackathon Prize Budget Setting
                    </h3>
                    <p className="text-xs text-[#57685f] mt-0.5">
                      Define the total allocated funds for this event and select default payout currency.
                    </p>
                  </div>

                  {/* Currency Toggle */}
                  <div className="flex items-center gap-2 rounded-xl bg-[#e8f3f0]/50 p-1 border border-[#d6e7e1] self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setCurrency("ETB")}
                      className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                        currency === "ETB"
                          ? "bg-[#0f6b5c] text-white shadow-xs"
                          : "text-[#57685f] hover:text-[#122622]"
                      }`}
                    >
                      ETB (Birr)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency("USD")}
                      className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                        currency === "USD"
                          ? "bg-[#0f6b5c] text-white shadow-xs"
                          : "text-[#57685f] hover:text-[#122622]"
                      }`}
                    >
                      USD ($)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                  <div>
                    <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                      Total Prize Budget ({currency}) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-[#0f6b5c]" />
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={totalPrizeBudget || ""}
                        onChange={(e) =>
                          setTotalPrizeBudget(Math.max(0, Number(e.target.value) || 0))
                        }
                        placeholder="e.g. 500000"
                        className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white pl-9 pr-4 text-xs font-bold text-[#122622] outline-none focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#0f6b5c]/20"
                      />
                    </div>
                  </div>

                  {/* Real-time Calculation Summary Box */}
                  <div
                    className={`flex flex-col justify-center rounded-2xl p-4 text-xs border transition-all ${
                      isOverBudget
                        ? "border-rose-200 bg-rose-50/70 text-rose-800"
                        : "border-[#d6e7e1] bg-[#e8f3f0]/40 text-[#122622]"
                    }`}
                  >
                    <div className="flex items-center justify-between font-extrabold mb-1">
                      <span>Tier Prizes Allocated:</span>
                      <span>{totalTierAllocated.toLocaleString()} {currency}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#57685f]">
                      <span>Remaining Unallocated:</span>
                      <span className={isOverBudget ? "font-bold text-rose-600" : "font-bold text-[#0f6b5c]"}>
                        {isOverBudget
                          ? `Exceeds budget by ${Math.abs(budgetRemaining).toLocaleString()} ${currency}`
                          : `${budgetRemaining.toLocaleString()} ${currency}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

          {/* 1. Prize Allocation Cards (1st, 2nd, 3rd Place Grid) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 pb-8">
            {/* 1st Place Winner Card (Gold Theme) */}
            <div className="flex flex-col rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50/60 to-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-amber-100">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-2xs font-extrabold text-sm">
                    🥇
                  </span>
                  <div>
                    <h3 className="font-display text-base font-extrabold text-[#122622]">
                      1st Place Winner
                    </h3>
                    <p className="text-[11px] font-medium text-amber-700">
                      Champion Rank Allocation
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-extrabold text-amber-800">
                  GOLD
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1">
                    Cash Prize Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    value={firstPlaceAmount}
                    onChange={(e) => setFirstPlaceAmount(Number(e.target.value))}
                    className="h-10 w-full rounded-2xl border border-amber-200 bg-white px-4 text-xs font-extrabold text-[#122622] outline-none focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#0f6b5c]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1">
                    Custom Trophy / Badge Name
                  </label>
                  <input
                    type="text"
                    value={firstPlaceBadge}
                    onChange={(e) => setFirstPlaceBadge(e.target.value)}
                    placeholder="e.g. Golden Harvester Trophy 🏆"
                    className="h-10 w-full rounded-2xl border border-amber-200 bg-white px-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1">
                    Non-Monetary Perks & Swag
                  </label>
                  <textarea
                    rows={3}
                    value={firstPlacePerks}
                    onChange={(e) => setFirstPlacePerks(e.target.value)}
                    placeholder="Incubation credits, Cloud credits, Investor mentorship..."
                    className="w-full rounded-2xl border border-amber-200 bg-white p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
                  />
                </div>
              </div>
            </div>

            {/* 2nd Place Runner-Up Card (Silver Theme) */}
            <div className="flex flex-col rounded-3xl border border-[#d6e7e1] bg-gradient-to-b from-[#e8f3f0]/50 to-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-[#d6e7e1]">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c] shadow-2xs font-extrabold text-sm">
                    🥈
                  </span>
                  <div>
                    <h3 className="font-display text-base font-extrabold text-[#122622]">
                      2nd Place Runner-Up
                    </h3>
                    <p className="text-[11px] font-medium text-[#0f6b5c]">
                      Secondary Rank Allocation
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#e8f3f0] px-3 py-1 text-[10px] font-extrabold text-[#0f6b5c]">
                  SILVER
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1">
                    Cash Prize Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    value={secondPlaceAmount}
                    onChange={(e) => setSecondPlaceAmount(Number(e.target.value))}
                    className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white px-4 text-xs font-extrabold text-[#122622] outline-none focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#0f6b5c]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1">
                    Badge Description
                  </label>
                  <input
                    type="text"
                    value={secondPlaceBadge}
                    onChange={(e) => setSecondPlaceBadge(e.target.value)}
                    placeholder="e.g. Silver Seed Award 🥈"
                    className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white px-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1">
                    Non-Monetary Perks & Swag
                  </label>
                  <textarea
                    rows={3}
                    value={secondPlacePerks}
                    onChange={(e) => setSecondPlacePerks(e.target.value)}
                    placeholder="Technical mentorship, tool subscriptions..."
                    className="w-full rounded-2xl border border-[#d6e7e1] bg-white p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
                  />
                </div>
              </div>
            </div>

            {/* 3rd Place Runner-Up Card (Bronze Theme) */}
            <div className="flex flex-col rounded-3xl border border-orange-200 bg-gradient-to-b from-orange-50/50 to-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-orange-100">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-700 shadow-2xs font-extrabold text-sm">
                    🥉
                  </span>
                  <div>
                    <h3 className="font-display text-base font-extrabold text-[#122622]">
                      3rd Place Runner-Up
                    </h3>
                    <p className="text-[11px] font-medium text-orange-700">
                      Tertiary Rank Allocation
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-extrabold text-orange-800">
                  BRONZE
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1">
                    Cash Prize Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    value={thirdPlaceAmount}
                    onChange={(e) => setThirdPlaceAmount(Number(e.target.value))}
                    className="h-10 w-full rounded-2xl border border-orange-200 bg-white px-4 text-xs font-extrabold text-[#122622] outline-none focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#0f6b5c]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1">
                    Badge Description
                  </label>
                  <input
                    type="text"
                    value={thirdPlaceBadge}
                    onChange={(e) => setThirdPlaceBadge(e.target.value)}
                    placeholder="e.g. Bronze Sprout Badge 🥉"
                    className="h-10 w-full rounded-2xl border border-orange-200 bg-white px-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1">
                    Non-Monetary Perks & Swag
                  </label>
                  <textarea
                    rows={3}
                    value={thirdPlacePerks}
                    onChange={(e) => setThirdPlacePerks(e.target.value)}
                    placeholder="Co-working pass, certificate of excellence..."
                    className="w-full rounded-2xl border border-orange-200 bg-white p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Payment Methods Configuration Section */}
          <div className="flex flex-col gap-6 rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-8 shadow-sm pb-8 mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#d6e7e1] pb-5">
              <div>
                <h3 className="font-display text-xl font-extrabold text-[#122622]">
                  Supported Winner Payment Gateways
                </h3>
                <p className="text-xs text-[#57685f] mt-1">
                  Configure allowed disbursement methods for winners (Bank Direct Wire, Telebirr, CBE Birr, Chapa, Crypto).
                </p>
              </div>

              {/* Add Gateway Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddPaymentMethod("Chapa Gateway", "MOBILE_MONEY")}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0] px-3.5 py-2 text-xs font-extrabold text-[#0f6b5c] hover:bg-[#d6e7e1] transition-all cursor-pointer shadow-2xs"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>+ Add Chapa Gateway</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPaymentMethod("Cheche Pay (Kacha)", "MOBILE_MONEY")}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#E2DFD8] bg-[#F9F8F3] px-3.5 py-2 text-xs font-extrabold text-[#122622] hover:bg-white transition-all cursor-pointer shadow-2xs"
                >
                  <Smartphone className="h-3.5 w-3.5 text-amber-600" />
                  <span>+ Add Cheche Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPaymentMethod("Telebirr SuperApp", "MOBILE_MONEY")}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0]/50 px-3 py-2 text-xs font-bold text-[#57685f] hover:bg-[#e8f3f0] transition-all cursor-pointer"
                >
                  <Smartphone className="h-3.5 w-3.5 text-blue-600" />
                  <span>+ Add Telebirr</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPaymentMethod("Commercial Bank of Ethiopia", "BANK_TRANSFER")}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0]/50 px-3 py-2 text-xs font-bold text-[#57685f] hover:bg-[#e8f3f0] transition-all cursor-pointer"
                >
                  <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>+ Add Bank Wire</span>
                </button>
              </div>
            </div>

            {/* List of Configured Payment Methods */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className={`flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                    pm.isActive
                      ? "border-[#d6e7e1] bg-[#e8f3f0]/40"
                      : "border-gray-200 bg-gray-50/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#d6e7e1]">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#0f6b5c] shadow-2xs border border-[#d6e7e1]">
                        {pm.providerType === "BANK_TRANSFER" ? (
                          <Building2 className="h-4 w-4" />
                        ) : pm.providerType === "MOBILE_MONEY" ? (
                          <Smartphone className="h-4 w-4" />
                        ) : (
                          <Wallet className="h-4 w-4" />
                        )}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-[#122622]">
                          {pm.providerName}
                        </h4>
                        <span className="text-[10px] font-semibold text-[#57685f]">
                          {pm.providerType}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePaymentMethod(pm.id)}
                        className="flex items-center gap-1 text-xs font-bold text-[#0f6b5c] cursor-pointer"
                      >
                        {pm.isActive ? (
                          <ToggleRight className="h-6 w-6 text-[#0f6b5c]" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-gray-400" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePaymentMethod(pm.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Configured Details */}
                  <div className="mt-3 flex flex-col gap-1.5 text-xs text-[#57685f]">
                    {pm.accountName && (
                      <p>
                        Account Holder: <strong>{pm.accountName}</strong>
                      </p>
                    )}
                    {pm.accountNumber && (
                      <p>
                        Account/IBAN No: <code className="bg-white px-2 py-0.5 rounded text-[11px] text-[#122622] font-bold border border-[#d6e7e1]">{pm.accountNumber}</code>
                      </p>
                    )}
                    {pm.walletAddress && (
                      <p className="truncate">
                        Wallet Addr: <code className="bg-white px-2 py-0.5 rounded text-[10px] text-[#0f6b5c] font-mono border border-[#d6e7e1]">{pm.walletAddress}</code>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Payout Instructions & Terms (Rich Text / Conditions) */}
            <div className="mt-4 pt-6 border-t border-[#d6e7e1]">
              <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                Payout Instructions, Claims Timeline & KYC Terms
              </label>
              <textarea
                rows={4}
                value={payoutTerms}
                onChange={(e) => setPayoutTerms(e.target.value)}
                placeholder="Specify payout distribution conditions (e.g. 14 days payout timeline, required government ID / tax declaration, claims expiration date)..."
                className="w-full rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0]/30 p-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:bg-white focus:ring-2 focus:ring-[#0f6b5c]/20"
              />
            </div>
          </div>

          {/* Sticky Save Action Bar */}
          <div className="sticky bottom-4 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl bg-[#122622] p-4 text-white shadow-2xl">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-amber-300 shrink-0" />
              <div>
                <p className="text-xs font-bold">
                  Save Prize Allocation for {selectedHackathonTitle}
                </p>
                <p className="text-[11px] text-gray-300">
                  Budget: {currency === "ETB" ? `${(totalPrizeBudget || 0).toLocaleString()} ETB` : `$${(totalPrizeBudget || 0).toLocaleString()} USD`} • Tiers Sum: {currency === "ETB" ? `${totalTierAllocated.toLocaleString()} ETB` : `$${totalTierAllocated.toLocaleString()} USD`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveConfiguration}
              disabled={isSaving || !selectedHackathonId}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] hover:bg-[#0b5347] px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving Config..." : "Save Changes"}</span>
            </button>
          </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
