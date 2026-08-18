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
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { Logomark } from "@/components/ui/Logomark";
import {
  prizesClient,
  type PrizePool,
  type PaymentMethodConfig,
} from "@/features/prizes/lib/prizes-client";

interface HackathonOption {
  id: string;
  title: string;
}

const MANAGED_HACKATHONS: HackathonOption[] = [
  { id: "hck-agritech", title: "AgriTech Hack 2024" },
  { id: "hck-fintech", title: "FinTech Frontier" },
  { id: "hck-ai-sprint", title: "Amharic NLP Sprint" },
];

export default function OrganizerPrizesPage() {
  const t = useTranslations("Organizer");
  const { user } = useSession();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("prizes");
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>("hck-agritech");
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);

  // Prize Pool State
  const [currency, setCurrency] = useState<"ETB" | "USD">("ETB");
  const [firstPlaceAmount, setFirstPlaceAmount] = useState<number>(1000000);
  const [firstPlacePerks, setFirstPlacePerks] = useState<string>("");
  const [firstPlaceBadge, setFirstPlaceBadge] = useState<string>("");

  const [secondPlaceAmount, setSecondPlaceAmount] = useState<number>(500000);
  const [secondPlacePerks, setSecondPlacePerks] = useState<string>("");
  const [secondPlaceBadge, setSecondPlaceBadge] = useState<string>("");

  const [thirdPlaceAmount, setThirdPlaceAmount] = useState<number>(250000);
  const [thirdPlacePerks, setThirdPlacePerks] = useState<string>("");
  const [thirdPlaceBadge, setThirdPlaceBadge] = useState<string>("");

  const [payoutTerms, setPayoutTerms] = useState<string>("");

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);

  // Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const organizerName = user?.fullName || "Abeba Selassie";
  const organizerTitle = "Lead Organizer";
  const userInitial = organizerName.charAt(0).toUpperCase();

  // Load prize & payment configuration for selected hackathon
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await prizesClient.getPrizeDetails(selectedHackathonId);
        if (res.prizePool) {
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

  // Aggregate Prize Pool Calculation
  const totalPrizePool =
    (Number(firstPlaceAmount) || 0) +
    (Number(secondPlaceAmount) || 0) +
    (Number(thirdPlaceAmount) || 0);

  // Handle Save
  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      await prizesClient.savePrizeDetails(
        selectedHackathonId,
        {
          currency,
          firstPlaceAmount: Number(firstPlaceAmount) || 0,
          firstPlacePerks,
          firstPlaceBadge,
          secondPlaceAmount: Number(secondPlaceAmount) || 0,
          secondPlacePerks,
          secondPlaceBadge,
          thirdPlaceAmount: Number(thirdPlaceAmount) || 0,
          thirdPlacePerks,
          thirdPlaceBadge,
          payoutTerms,
        },
        paymentMethods
      );
      setSaveSuccessMsg("Prize allocation & payment methods saved successfully!");
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err) {
      console.error("Failed to save prize configuration:", err);
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

  const selectedHackathonTitle =
    MANAGED_HACKATHONS.find((h) => h.id === selectedHackathonId)?.title || "AgriTech Hack 2024";

  return (
    <div className="min-h-screen bg-[#F4F3FF] text-[#1E1E38]">
      <div className="mx-auto flex w-full max-w-[1500px]">
        {/* ================= LEFT SIDEBAR (ORGANIZER CONTEXT) ================= */}
        <aside
          className={`sticky top-0 hidden h-screen flex-col justify-between border-r border-indigo-100/80 bg-white p-5 lg:flex shadow-2xs transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "w-20 px-3" : "w-64 px-5"
          }`}
        >
          <div className="flex flex-col gap-8">
            {/* Brand Logo & Portal Tag */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="flex items-center gap-3 cursor-pointer text-left group focus:outline-none"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label="Toggle Sidebar"
            >
              <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#F9F8F3] border border-[#E2DFD8] shadow-xs overflow-hidden p-1 transition-transform group-hover:scale-105">
                <Logomark className="h-full w-full object-contain" />
              </span>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                  isSidebarCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-xs opacity-100"
                }`}
              >
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#3B34D2]">
                  HODANA
                </h1>
                <p className="text-xs font-semibold text-[#6B6B80]">
                  Ecosystem Portal
                </p>
              </div>
            </button>

            {/* Sidebar Navigation */}
            <nav className="flex flex-col gap-1 text-xs font-semibold text-[#52526B]">
              <Link
                href="/organizer/dashboard"
                title={isSidebarCollapsed ? "Dashboard" : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-indigo-50 hover:text-[#3B34D2] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Dashboard</span>}
              </Link>

              <Link
                href="/organizer/hackathons"
                title={isSidebarCollapsed ? "Hackathons" : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-indigo-50 hover:text-[#3B34D2] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Calendar className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Hackathons</span>}
              </Link>

              <Link
                href="/organizer/registrations"
                title={isSidebarCollapsed ? "Registrations" : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-indigo-50 hover:text-[#3B34D2] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <UserCheck className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Registrations</span>}
              </Link>

              <Link
                href="/organizer/judges"
                title={isSidebarCollapsed ? "Judging" : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-indigo-50 hover:text-[#3B34D2] ${
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
                } bg-[#3B34D2] text-white shadow-md font-bold`}
              >
                <Trophy className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Prizes</span>}
              </Link>

              <Link
                href="/organizer/submissions"
                title={isSidebarCollapsed ? t("navAnalytics") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-indigo-50 hover:text-[#3B34D2] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <FileText className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navAnalytics")}</span>}
              </Link>

              <Link
                href="/organizer/announcements"
                title={isSidebarCollapsed ? t("navAnnouncements") : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-indigo-50 hover:text-[#3B34D2] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Megaphone className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{t("navAnnouncements")}</span>}
              </Link>

              <Link
                href="/dashboard/portfolio"
                title={isSidebarCollapsed ? "Portfolio" : undefined}
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-indigo-50 hover:text-[#3B34D2] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
              >
                <Briefcase className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap">Portfolio</span>}
              </Link>
            </nav>
          </div>

          {/* Sidebar Bottom CTA & User Footer */}
          <div className="flex flex-col gap-4 border-t border-indigo-100/80 pt-4">
            <Link
              href="/hackathons"
              title={isSidebarCollapsed ? "+ Launch Project" : undefined}
              className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#3B34D2] py-2.5 text-xs font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 ${
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
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3B34D2] text-xs font-extrabold text-white shadow-xs">
                {userInitial}
              </span>
              {!isSidebarCollapsed && (
                <div className="flex min-w-0 flex-1 flex-col whitespace-nowrap overflow-hidden">
                  <p className="truncate text-xs font-bold text-[#1E1E38]">
                    {organizerName}
                  </p>
                  <p className="truncate text-[11px] font-medium text-[#6B6B80]">
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
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#1E1E38]">
                Prizes & Payment Methods
              </h1>
              <p className="text-xs text-[#6B6B80] mt-1">
                Configure 1st, 2nd, and 3rd place cash awards, swag perks, and winner disbursement gateways.
              </p>
            </div>

            {/* Hackathon Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsEventDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-2xl border border-indigo-100/80 bg-white px-4 py-2.5 text-xs font-extrabold text-[#1E1E38] shadow-2xs hover:border-[#3B34D2]/40 transition-all cursor-pointer"
              >
                <Layers className="h-4 w-4 text-[#3B34D2] shrink-0" />
                <span className="text-[#6B6B80] font-semibold">Select Event:</span>
                <span>{selectedHackathonTitle}</span>
                <ChevronDown
                  className={`h-4 w-4 text-[#6B6B80] transition-transform duration-200 ${
                    isEventDropdownOpen ? "rotate-180 text-[#3B34D2]" : ""
                  }`}
                />
              </button>

              {isEventDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-indigo-100 bg-white p-2 shadow-xl z-30 animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#6B6B80]">
                    Select Hackathon
                  </div>
                  {MANAGED_HACKATHONS.map((hck) => (
                    <button
                      key={hck.id}
                      type="button"
                      onClick={() => {
                        setSelectedHackathonId(hck.id);
                        setIsEventDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                        selectedHackathonId === hck.id
                          ? "bg-[#3B34D2] text-white shadow-xs"
                          : "text-[#1E1E38] hover:bg-indigo-50 hover:text-[#3B34D2]"
                      }`}
                    >
                      <span>{hck.title}</span>
                      {selectedHackathonId === hck.id && (
                        <Check className="h-4 w-4 shrink-0 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Success Banner Feedback */}
          {saveSuccessMsg && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 animate-fade-in">
              <Check className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* 1. Total Prize Pool Summary Widget */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between rounded-3xl border border-indigo-100/80 bg-gradient-to-r from-[#3B34D2] to-[#4F46E5] p-6 sm:p-8 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-inner">
                <Trophy className="h-7 w-7 text-amber-300" />
              </span>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-200">
                  Total Prize Pool Summary • {selectedHackathonTitle}
                </span>
                <h2 className="font-display text-3xl font-extrabold mt-1">
                  {currency === "ETB"
                    ? `${totalPrizePool.toLocaleString()} ETB`
                    : `$${totalPrizePool.toLocaleString()} USD`}
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

          {/* Currency Toggle Selection Bar */}
          <div className="mb-6 flex items-center justify-between rounded-2xl bg-white border border-indigo-100 p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-[#3B34D2]" />
              <span className="text-xs font-extrabold text-[#1E1E38]">
                Prize Currency Designation
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[#F9F8FE] p-1 border border-indigo-100">
              <button
                type="button"
                onClick={() => setCurrency("ETB")}
                className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                  currency === "ETB"
                    ? "bg-[#3B34D2] text-white shadow-xs"
                    : "text-[#6B6B80] hover:text-[#1E1E38]"
                }`}
              >
                ETB (Ethiopian Birr)
              </button>
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                  currency === "USD"
                    ? "bg-[#3B34D2] text-white shadow-xs"
                    : "text-[#6B6B80] hover:text-[#1E1E38]"
                }`}
              >
                USD (US Dollars)
              </button>
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
                    <h3 className="font-display text-base font-extrabold text-[#1E1E38]">
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
                  <label className="block text-xs font-bold text-[#1E1E38] mb-1">
                    Cash Prize Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    value={firstPlaceAmount}
                    onChange={(e) => setFirstPlaceAmount(Number(e.target.value))}
                    className="h-10 w-full rounded-2xl border border-amber-200 bg-white px-4 text-xs font-extrabold text-[#1E1E38] outline-none focus:border-[#3B34D2] focus:ring-2 focus:ring-[#3B34D2]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1E38] mb-1">
                    Custom Trophy / Badge Name
                  </label>
                  <input
                    type="text"
                    value={firstPlaceBadge}
                    onChange={(e) => setFirstPlaceBadge(e.target.value)}
                    placeholder="e.g. Golden Harvester Trophy 🏆"
                    className="h-10 w-full rounded-2xl border border-amber-200 bg-white px-4 text-xs font-medium text-[#1E1E38] outline-none focus:border-[#3B34D2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1E38] mb-1">
                    Non-Monetary Perks & Swag
                  </label>
                  <textarea
                    rows={3}
                    value={firstPlacePerks}
                    onChange={(e) => setFirstPlacePerks(e.target.value)}
                    placeholder="Incubation credits, Cloud credits, Investor mentorship..."
                    className="w-full rounded-2xl border border-amber-200 bg-white p-3 text-xs font-medium text-[#1E1E38] outline-none focus:border-[#3B34D2]"
                  />
                </div>
              </div>
            </div>

            {/* 2nd Place Runner-Up Card (Silver Theme) */}
            <div className="flex flex-col rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-indigo-100">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 shadow-2xs font-extrabold text-sm">
                    🥈
                  </span>
                  <div>
                    <h3 className="font-display text-base font-extrabold text-[#1E1E38]">
                      2nd Place Runner-Up
                    </h3>
                    <p className="text-[11px] font-medium text-indigo-700">
                      Secondary Rank Allocation
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-extrabold text-indigo-800">
                  SILVER
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E1E38] mb-1">
                    Cash Prize Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    value={secondPlaceAmount}
                    onChange={(e) => setSecondPlaceAmount(Number(e.target.value))}
                    className="h-10 w-full rounded-2xl border border-indigo-100 bg-white px-4 text-xs font-extrabold text-[#1E1E38] outline-none focus:border-[#3B34D2] focus:ring-2 focus:ring-[#3B34D2]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1E38] mb-1">
                    Badge Description
                  </label>
                  <input
                    type="text"
                    value={secondPlaceBadge}
                    onChange={(e) => setSecondPlaceBadge(e.target.value)}
                    placeholder="e.g. Silver Seed Award 🥈"
                    className="h-10 w-full rounded-2xl border border-indigo-100 bg-white px-4 text-xs font-medium text-[#1E1E38] outline-none focus:border-[#3B34D2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1E38] mb-1">
                    Non-Monetary Perks & Swag
                  </label>
                  <textarea
                    rows={3}
                    value={secondPlacePerks}
                    onChange={(e) => setSecondPlacePerks(e.target.value)}
                    placeholder="Technical mentorship, tool subscriptions..."
                    className="w-full rounded-2xl border border-indigo-100 bg-white p-3 text-xs font-medium text-[#1E1E38] outline-none focus:border-[#3B34D2]"
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
                    <h3 className="font-display text-base font-extrabold text-[#1E1E38]">
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
                  <label className="block text-xs font-bold text-[#1E1E38] mb-1">
                    Cash Prize Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    value={thirdPlaceAmount}
                    onChange={(e) => setThirdPlaceAmount(Number(e.target.value))}
                    className="h-10 w-full rounded-2xl border border-orange-200 bg-white px-4 text-xs font-extrabold text-[#1E1E38] outline-none focus:border-[#3B34D2] focus:ring-2 focus:ring-[#3B34D2]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1E38] mb-1">
                    Badge Description
                  </label>
                  <input
                    type="text"
                    value={thirdPlaceBadge}
                    onChange={(e) => setThirdPlaceBadge(e.target.value)}
                    placeholder="e.g. Bronze Sprout Badge 🥉"
                    className="h-10 w-full rounded-2xl border border-orange-200 bg-white px-4 text-xs font-medium text-[#1E1E38] outline-none focus:border-[#3B34D2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1E38] mb-1">
                    Non-Monetary Perks & Swag
                  </label>
                  <textarea
                    rows={3}
                    value={thirdPlacePerks}
                    onChange={(e) => setThirdPlacePerks(e.target.value)}
                    placeholder="Co-working pass, certificate of excellence..."
                    className="w-full rounded-2xl border border-orange-200 bg-white p-3 text-xs font-medium text-[#1E1E38] outline-none focus:border-[#3B34D2]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Payment Methods Configuration Section */}
          <div className="flex flex-col gap-6 rounded-3xl border border-indigo-100/80 bg-white p-6 sm:p-8 shadow-sm pb-8 mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-indigo-100/80 pb-5">
              <div>
                <h3 className="font-display text-xl font-extrabold text-[#1E1E38]">
                  Supported Winner Payment Gateways
                </h3>
                <p className="text-xs text-[#6B6B80] mt-1">
                  Configure allowed disbursement methods for winners (Bank Direct Wire, Telebirr, CBE Birr, Chapa, Crypto).
                </p>
              </div>

              {/* Add Gateway Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddPaymentMethod("Chapa Gateway", "MOBILE_MONEY")}
                  className="flex items-center gap-1.5 rounded-2xl border border-indigo-200 bg-[#EEEDFD] px-3.5 py-2 text-xs font-extrabold text-[#3B34D2] hover:bg-indigo-100 transition-all cursor-pointer shadow-2xs"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>+ Add Chapa Gateway</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPaymentMethod("Cheche Pay (Kacha)", "MOBILE_MONEY")}
                  className="flex items-center gap-1.5 rounded-2xl border border-[#E2DFD8] bg-[#F9F8F3] px-3.5 py-2 text-xs font-extrabold text-[#1E1E38] hover:bg-white transition-all cursor-pointer shadow-2xs"
                >
                  <Smartphone className="h-3.5 w-3.5 text-amber-600" />
                  <span>+ Add Cheche Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPaymentMethod("Telebirr SuperApp", "MOBILE_MONEY")}
                  className="flex items-center gap-1.5 rounded-2xl border border-indigo-100 bg-[#F9F8FE] px-3 py-2 text-xs font-bold text-[#52526B] hover:bg-indigo-50 transition-all cursor-pointer"
                >
                  <Smartphone className="h-3.5 w-3.5 text-blue-600" />
                  <span>+ Add Telebirr</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPaymentMethod("Commercial Bank of Ethiopia", "BANK_TRANSFER")}
                  className="flex items-center gap-1.5 rounded-2xl border border-indigo-100 bg-[#F9F8FE] px-3 py-2 text-xs font-bold text-[#52526B] hover:bg-indigo-50 transition-all cursor-pointer"
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
                      ? "border-indigo-100 bg-[#F9F8FE]"
                      : "border-gray-200 bg-gray-50/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-indigo-100/60">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#3B34D2] shadow-2xs border border-indigo-100">
                        {pm.providerType === "BANK_TRANSFER" ? (
                          <Building2 className="h-4 w-4" />
                        ) : pm.providerType === "MOBILE_MONEY" ? (
                          <Smartphone className="h-4 w-4" />
                        ) : (
                          <Wallet className="h-4 w-4" />
                        )}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-[#1E1E38]">
                          {pm.providerName}
                        </h4>
                        <span className="text-[10px] font-semibold text-[#6B6B80]">
                          {pm.providerType}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePaymentMethod(pm.id)}
                        className="flex items-center gap-1 text-xs font-bold text-[#3B34D2] cursor-pointer"
                      >
                        {pm.isActive ? (
                          <ToggleRight className="h-6 w-6 text-[#3B34D2]" />
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
                  <div className="mt-3 flex flex-col gap-1.5 text-xs text-[#52526B]">
                    {pm.accountName && (
                      <p>
                        Account Holder: <strong>{pm.accountName}</strong>
                      </p>
                    )}
                    {pm.accountNumber && (
                      <p>
                        Account/IBAN No: <code className="bg-white px-2 py-0.5 rounded text-[11px] text-[#1E1E38] font-bold border border-indigo-100">{pm.accountNumber}</code>
                      </p>
                    )}
                    {pm.walletAddress && (
                      <p className="truncate">
                        Wallet Addr: <code className="bg-white px-2 py-0.5 rounded text-[10px] text-[#3B34D2] font-mono border border-indigo-100">{pm.walletAddress}</code>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Payout Instructions & Terms (Rich Text / Conditions) */}
            <div className="mt-4 pt-6 border-t border-indigo-100/80">
              <label className="block text-xs font-extrabold text-[#1E1E38] mb-1.5">
                Payout Instructions, Claims Timeline & KYC Terms
              </label>
              <textarea
                rows={4}
                value={payoutTerms}
                onChange={(e) => setPayoutTerms(e.target.value)}
                placeholder="Specify payout distribution conditions (e.g. 14 days payout timeline, required government ID / tax declaration, claims expiration date)..."
                className="w-full rounded-2xl border border-indigo-100 bg-[#F9F8FE] p-4 text-xs font-medium text-[#1E1E38] outline-none focus:border-[#3B34D2] focus:bg-white focus:ring-2 focus:ring-[#3B34D2]/20"
              />
            </div>
          </div>

          {/* Sticky Save Action Bar */}
          <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-2xl bg-[#1E1E38] p-4 text-white shadow-2xl">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-amber-300" />
              <div>
                <p className="text-xs font-bold">
                  Save Prize Allocation for {selectedHackathonTitle}
                </p>
                <p className="text-[11px] text-gray-300">
                  Total Prize Value: {currency === "ETB" ? `${totalPrizePool.toLocaleString()} ETB` : `$${totalPrizePool.toLocaleString()} USD`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveConfiguration}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-[#3B34D2] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#322BB8] transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving Config..." : "Save Changes"}</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
