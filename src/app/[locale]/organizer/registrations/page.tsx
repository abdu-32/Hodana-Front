"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  Users,
  Gavel,
  Trophy,
  FileText,
  Megaphone,
  Briefcase,
  Bell,
  Search,
  Filter,
  Check,
  X,
  Hourglass,
  Sparkles,
  Award,
  Mail,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  User,
  Rocket,
  ChevronDown,
  RotateCcw,
  Layers,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { Logomark } from "@/components/ui/Logomark";

interface HackathonOption {
  id: string;
  title: string;
}

const MANAGED_HACKATHONS: HackathonOption[] = [
  { id: "All", title: "All Hackathons" },
  { id: "hck-agritech", title: "AgriTech Hack 2024" },
  { id: "hck-fintech", title: "FinTech Frontier" },
  { id: "hck-ai-sprint", title: "Amharic NLP Sprint" },
];

interface Applicant {
  id: string;
  initials: string;
  name: string;
  email: string;
  affiliation: string;
  department: string;
  background: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "WAITLISTED";
  tags: string[];
  bio: string;
  achievements: string[];
  color: string;
  avatarUrl?: string;
  hackathonId: string;
  hackathonTitle: string;
}

const INITIAL_APPLICANTS: Applicant[] = [
  {
    id: "app-1",
    initials: "AC",
    name: "Alex Chen",
    email: "alex.chen@mit.edu",
    affiliation: "MIT",
    department: "Computer Science",
    background: "MIT • CS Senior",
    status: "PENDING",
    tags: ["Junior", "AI/ML", "Full-Stack"],
    bio: "Computer Science senior at MIT specializing in distributed machine learning pipelines and real-time computer vision systems. Active contributor to open-source developer tooling.",
    achievements: ["1st Place Global AI 2023", "Hackathon Top 1% Innovator", "MIT Dean's List 2023-2024"],
    color: "bg-[#e8f3f0] text-[#0f6b5c]",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    hackathonId: "hck-agritech",
    hackathonTitle: "AgriTech Hack 2024",
  },
  {
    id: "app-2",
    initials: "KA",
    name: "Kebede Alemu",
    email: "kebede.alemu@aau.edu.et",
    affiliation: "Addis Ababa University",
    department: "Software Engineering",
    background: "Addis Ababa University • CS Senior",
    status: "PENDING",
    tags: ["Senior", "AgriTech", "Backend"],
    bio: "Passionate about leveraging IoT and cloud infrastructure to optimize regional supply chains and agricultural yields across East Africa.",
    achievements: ["Winner Ethio-Green Challenge 2023", "AAU Innovation Grant Awardee"],
    color: "bg-[#e8f3f0] text-[#0f6b5c]",
    hackathonId: "hck-agritech",
    hackathonTitle: "AgriTech Hack 2024",
  },
  {
    id: "app-3",
    initials: "MT",
    name: "Martha Tadesse",
    email: "martha.t@astu.edu.et",
    affiliation: "ASTU",
    department: "Mechanical Engineering",
    background: "ASTU • Mechanical Engineering",
    status: "PENDING",
    tags: ["Senior", "Robotics", "Embedded Systems"],
    bio: "Mechatronics enthusiast building automated agricultural drone hardware for crop monitoring and precision pesticide deployment.",
    achievements: ["ASTU Robotics Competition Finalist", "National Tech Award 2023"],
    color: "bg-[#e8f3f0] text-[#0f6b5c]",
    hackathonId: "hck-fintech",
    hackathonTitle: "FinTech Frontier",
  },
  {
    id: "app-4",
    initials: "SD",
    name: "Samuel Desta",
    email: "samuel.desta@dev.et",
    affiliation: "Freelance",
    department: "Independent Creator",
    background: "Freelance Developer • 4yrs Exp",
    status: "PENDING",
    tags: ["Pro", "FinTech", "Rust & Go"],
    bio: "Full-stack software consultant with 4+ years building high-throughput financial microservices and mobile payment SDKs.",
    achievements: ["Built EthioPay Open SDK (2k+ stars)", "Horn Tech Summit Speaker"],
    color: "bg-emerald-100 text-emerald-800",
    hackathonId: "hck-fintech",
    hackathonTitle: "FinTech Frontier",
  },
  {
    id: "app-5",
    initials: "HR",
    name: "Helen Redda",
    email: "helen.redda@stanford.edu",
    affiliation: "Stanford University",
    department: "Bioengineering",
    background: "Stanford • BioMed Fellow",
    status: "APPROVED",
    tags: ["Fellow", "HealthTech", "AI Diagnostics"],
    bio: "Research fellow focusing on deep learning algorithms for accessible ultrasound screening in low-resource clinic environments.",
    achievements: ["Stanford BioDesign Fellow 2024", "Published in Journal of Medical AI"],
    color: "bg-[#e8f3f0] text-[#0f6b5c]",
    hackathonId: "hck-ai-sprint",
    hackathonTitle: "Amharic NLP Sprint",
  },
  {
    id: "app-6",
    initials: "YB",
    name: "Yared Berhane",
    email: "yared.b@bdu.edu.et",
    affiliation: "Bahir Dar University",
    department: "Information Technology",
    background: "Bahir Dar University • IT Junior",
    status: "WAITLISTED",
    tags: ["Junior", "GovTech", "Web3"],
    bio: "Building decentralized citizen identity verification systems and smart contract architecture for public service transparency.",
    achievements: ["BDU Hackathon 2nd Place", "Web3 Ethiopia Community Lead"],
    color: "bg-gray-100 text-gray-700",
    hackathonId: "hck-ai-sprint",
    hackathonTitle: "Amharic NLP Sprint",
  },
];

export default function OrganizerRegistrationsPage() {
  const t = useTranslations("Organizer");
  const { user } = useSession();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("registrations");
  const [applicants, setApplicants] = useState<Applicant[]>(INITIAL_APPLICANTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHackathon, setSelectedHackathon] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const organizerName = user?.fullName || "Abeba Selassie";
  const organizerTitle = "Lead Organizer";
  const userInitial = organizerName.charAt(0).toUpperCase();

  // Simulated API Query Fetcher
  useEffect(() => {
    async function fetchOrganizerRegistrations() {
      try {
        const queryParams = new URLSearchParams();
        if (selectedHackathon !== "All") queryParams.append("hackathonId", selectedHackathon);
        if (statusFilter !== "All") queryParams.append("status", statusFilter);
      } catch (err) {
        console.warn("Could not fetch remote registrations:", err);
      }
    }
    fetchOrganizerRegistrations();
  }, [selectedHackathon, statusFilter]);

  // Status Mutation Handler
  const updateApplicantStatus = async (id: string, newStatus: "APPROVED" | "REJECTED" | "WAITLISTED") => {
    try {
      setApplicants((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Helper for Hackathon Filter Scoping
  const scopeApplicantsByHackathon = applicants.filter((app) => {
    if (selectedHackathon !== "All" && app.hackathonId !== selectedHackathon) return false;
    return true;
  });

  // Dynamic Header Metrics Calculation
  const totalRegistrations = scopeApplicantsByHackathon.length * 180 + scopeApplicantsByHackathon.length;
  const pendingCount = scopeApplicantsByHackathon.filter((a) => a.status === "PENDING").length;
  const approvedCount = scopeApplicantsByHackathon.filter((a) => a.status === "APPROVED").length;
  const waitlistedCount = scopeApplicantsByHackathon.filter((a) => a.status === "WAITLISTED").length;

  // Fully Filtered Applicants List for Table Display
  const filteredApplicants = scopeApplicantsByHackathon.filter((app) => {
    if (statusFilter !== "All" && app.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        app.name.toLowerCase().includes(q) ||
        app.affiliation.toLowerCase().includes(q) ||
        app.background.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        app.hackathonTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleResetFilters = () => {
    setSelectedHackathon("All");
    setStatusFilter("All");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#122622]">
      <div className="mx-auto flex w-full max-w-[1500px]">
        {/* ================= LEFT SIDEBAR (ORGANIZER CONTEXT) ================= */}
        <aside
          className={`sticky top-0 hidden h-screen flex-col justify-between border-r border-[#d6e7e1] bg-white p-5 lg:flex shadow-2xs transition-all duration-300 ease-in-out ${
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
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#0f6b5c]">
                  HODANA
                </h1>
                <p className="text-xs font-semibold text-[#57685f]">
                  Ecosystem Portal
                </p>
              </div>
            </button>

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
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                } bg-[#0f6b5c] text-white shadow-md font-bold`}
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
                className={`flex items-center gap-3 rounded-xl py-2.5 transition-all hover:bg-[#e8f3f0] hover:text-[#0f6b5c] ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
                }`}
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
              className={`flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#0b5347] ${
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
          {/* Top Bar Title */}
          <div className="pb-6">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#122622]">
              Registrations & Applicant Review
            </h1>
            <p className="text-xs text-[#57685f] mt-1">
              Filter applicant credentials by hackathon event and status to verify background details.
            </p>
          </div>

          {/* 1. Dynamic Header Metrics Cards Row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 pb-8">
            {/* Metric 1: Total Registrations */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-2xs transition-all">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c]">
                  <Users className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-[#e8f3f0] px-2.5 py-0.5 text-[11px] font-extrabold text-[#0f6b5c]">
                  +12%
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#57685f]">
                  Total Registrations
                </p>
                <h3 className="font-display text-2xl font-extrabold text-[#122622] mt-1">
                  {totalRegistrations.toLocaleString()}
                </h3>
              </div>
            </div>

            {/* Metric 2: Pending Review */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-2xs transition-all">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <UserCheck className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#c4211c]">
                  REQUIRED
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#57685f]">
                  Pending Review
                </p>
                <h3 className="font-display text-2xl font-extrabold text-[#122622] mt-1">
                  {pendingCount}
                </h3>
              </div>
            </div>

            {/* Metric 3: Approved */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-2xs transition-all">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-[#16793d]">
                  <Check className="h-5 w-5" />
                </span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[#16793d]">
                  <Check className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#57685f]">
                  Approved
                </p>
                <h3 className="font-display text-2xl font-extrabold text-[#122622] mt-1">
                  {approvedCount}
                </h3>
              </div>
            </div>

            {/* Metric 4: Waitlisted */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d6e7e1] bg-white p-5 shadow-2xs transition-all">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
                  <Hourglass className="h-5 w-5" />
                </span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                  <Hourglass className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#57685f]">
                  Waitlisted
                </p>
                <h3 className="font-display text-2xl font-extrabold text-[#122622] mt-1">
                  {waitlistedCount}
                </h3>
              </div>
            </div>
          </div>

          {/* 2. Participant Review Table Card */}
          <div className="flex flex-col rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-sm">
            {/* Table Controls: Search + Side-by-Side Dual Filters */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-6">
              <div className="relative w-full lg:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search participants, emails, background..."
                  className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-white pl-10 pr-4 text-xs font-medium text-[#122622] shadow-2xs outline-none placeholder:text-gray-400 focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#0f6b5c]/20"
                />
              </div>

              {/* Side-by-Side Custom Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Hackathon Event Custom Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEventDropdownOpen((prev) => !prev);
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2 text-xs font-bold shadow-2xs transition-all cursor-pointer ${
                      isEventDropdownOpen || selectedHackathon !== "All"
                        ? "border-[#0f6b5c] bg-[#e8f3f0] text-[#0f6b5c] ring-2 ring-[#0f6b5c]/10"
                        : "border-[#d6e7e1] bg-[#f3f6f4] text-[#122622] hover:bg-white hover:border-[#0f6b5c]"
                    }`}
                  >
                    <Layers className="h-4 w-4 text-[#0f6b5c] shrink-0" />
                    <span className="text-[#57685f] font-semibold">Event:</span>
                    <span>
                      {MANAGED_HACKATHONS.find((h) => h.id === selectedHackathon)?.title || "All Hackathons"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#57685f] transition-transform duration-200 ${
                        isEventDropdownOpen ? "rotate-180 text-[#0f6b5c]" : ""
                      }`}
                    />
                  </button>

                  {/* Popover Menu */}
                  {isEventDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[#d6e7e1] bg-white p-2 shadow-xl z-30 animate-in fade-in-50 zoom-in-95">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#57685f]">
                        Filter By Event
                      </div>
                      {MANAGED_HACKATHONS.map((hck) => (
                        <button
                          key={hck.id}
                          type="button"
                          onClick={() => {
                            setSelectedHackathon(hck.id);
                            setIsEventDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                            selectedHackathon === hck.id
                              ? "bg-[#0f6b5c] text-white shadow-xs"
                              : "text-[#122622] hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
                          }`}
                        >
                          <span>{hck.title}</span>
                          {selectedHackathon === hck.id && <Check className="h-4 w-4 shrink-0 text-white" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Custom Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsStatusDropdownOpen((prev) => !prev);
                      setIsEventDropdownOpen(false);
                    }}
                    className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2 text-xs font-bold shadow-2xs transition-all cursor-pointer ${
                      isStatusDropdownOpen || statusFilter !== "All"
                        ? "border-[#0f6b5c] bg-[#e8f3f0] text-[#0f6b5c] ring-2 ring-[#0f6b5c]/10"
                        : "border-[#d6e7e1] bg-[#f3f6f4] text-[#122622] hover:bg-white hover:border-[#0f6b5c]"
                    }`}
                  >
                    <Filter className="h-4 w-4 text-[#0f6b5c] shrink-0" />
                    <span className="text-[#57685f] font-semibold">Status:</span>
                    <span>{statusFilter === "All" ? "All Statuses" : statusFilter}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#57685f] transition-transform duration-200 ${
                        isStatusDropdownOpen ? "rotate-180 text-[#0f6b5c]" : ""
                      }`}
                    />
                  </button>

                  {/* Popover Menu */}
                  {isStatusDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-[#d6e7e1] bg-white p-2 shadow-xl z-30 animate-in fade-in-50 zoom-in-95">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#57685f]">
                        Filter By Status
                      </div>
                      {[
                        { id: "All", label: "All Statuses" },
                        { id: "PENDING", label: "Pending" },
                        { id: "APPROVED", label: "Approved" },
                        { id: "REJECTED", label: "Rejected" },
                        { id: "WAITLISTED", label: "Waitlisted" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setStatusFilter(opt.id);
                            setIsStatusDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                            statusFilter === opt.id
                              ? "bg-[#0f6b5c] text-white shadow-xs"
                              : "text-[#122622] hover:bg-[#e8f3f0] hover:text-[#0f6b5c]"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {statusFilter === opt.id && <Check className="h-4 w-4 shrink-0 text-white" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Applicant Review Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#d6e7e1] text-[11px] font-extrabold uppercase tracking-wider text-[#57685f]">
                    <th className="pb-3 pr-4">Participant</th>
                    <th className="pb-3 pr-4">Hackathon Event</th>
                    <th className="pb-3 pr-4">Affiliation</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 text-right">Verify Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d6e7e1] text-[#57685f]">
                  {filteredApplicants.length > 0 ? (
                    filteredApplicants.map((app) => (
                      <tr
                        key={app.id}
                        onClick={() => setSelectedApplicant(app)}
                        className="group cursor-pointer transition-colors hover:bg-[#f3f6f4]"
                      >
                        {/* Participant Column */}
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            {app.avatarUrl ? (
                              <img
                                src={app.avatarUrl}
                                alt={app.name}
                                className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[#0f6b5c]/20"
                              />
                            ) : (
                              <span
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-bold ${app.color}`}
                              >
                                {app.initials}
                              </span>
                            )}
                            <div>
                              <p className="font-bold text-[#122622] group-hover:text-[#0f6b5c] transition-colors">
                                {app.name}
                              </p>
                              <p className="text-[11px] text-[#57685f] mt-0.5">
                                {app.background}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Hackathon Name Column */}
                        <td className="py-4 pr-4">
                          <span className="inline-flex items-center rounded-xl bg-[#e8f3f0] border border-[#d6e7e1] px-3 py-1 text-[11px] font-bold text-[#0f6b5c]">
                            {app.hackathonTitle}
                          </span>
                        </td>

                        {/* Affiliation Column */}
                        <td className="py-4 pr-4">
                          <span className="font-semibold text-[#122622]">
                            {app.affiliation}
                          </span>
                        </td>

                        {/* Status Column */}
                        <td className="py-4 pr-4">
                          {app.status === "PENDING" && (
                            <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[11px] font-bold text-amber-800">
                              PENDING
                            </span>
                          )}
                          {app.status === "APPROVED" && (
                            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-[#16793d]">
                              APPROVED
                            </span>
                          )}
                          {app.status === "REJECTED" && (
                            <span className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-[11px] font-bold text-[#c4211c]">
                              REJECTED
                            </span>
                          )}
                          {app.status === "WAITLISTED" && (
                            <span className="rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-[11px] font-bold text-[#57685f]">
                              WAITLISTED
                            </span>
                          )}
                        </td>

                        {/* Quick Actions Column */}
                        <td className="py-4 text-right">
                          <div
                            className="flex items-center justify-end gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => updateApplicantStatus(app.id, "REJECTED")}
                              className="flex h-8 w-8 items-center justify-center rounded-xl text-[#c4211c] hover:bg-red-50 transition-all cursor-pointer"
                              title="Reject Applicant"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => updateApplicantStatus(app.id, "APPROVED")}
                              className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e8f3f0] text-[#0f6b5c] hover:bg-[#0f6b5c] hover:text-white transition-all cursor-pointer shadow-2xs"
                              title="Approve Applicant"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : null}
                </tbody>
              </table>

              {/* Empty State Component with "Reset Filters" Button */}
              {filteredApplicants.length === 0 && (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#e8f3f0] text-[#0f6b5c] mb-3">
                    <Filter className="h-6 w-6" />
                  </div>
                  <h4 className="font-display text-base font-extrabold text-[#122622]">
                    No Participants Match Your Filter
                  </h4>
                  <p className="text-xs text-[#57685f] max-w-sm mt-1 mb-5">
                    No registered applicants match the selected combination of event scope and status criteria.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Filters</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* 3. Participant Profile Modal / Popup */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#d6e7e1] text-[#122622]">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedApplicant(null)}
              className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 pb-6 border-b border-[#d6e7e1]">
              {selectedApplicant.avatarUrl ? (
                <img
                  src={selectedApplicant.avatarUrl}
                  alt={selectedApplicant.name}
                  className="h-16 w-16 rounded-full object-cover ring-4 ring-[#0f6b5c]/20"
                />
              ) : (
                <span
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${selectedApplicant.color}`}
                >
                  {selectedApplicant.initials}
                </span>
              )}

              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-2xl font-extrabold text-[#122622]">
                    {selectedApplicant.name}
                  </h2>
                  <span className="rounded-full bg-[#e8f3f0] border border-[#d6e7e1] px-3 py-0.5 text-[10px] font-extrabold text-[#0f6b5c]">
                    {selectedApplicant.status}
                  </span>
                </div>
                <p className="text-xs font-medium text-[#57685f] mt-1">
                  Registered for: <strong className="text-[#0f6b5c]">{selectedApplicant.hackathonTitle}</strong>
                </p>
                <p className="text-xs font-medium text-[#57685f]">
                  {selectedApplicant.affiliation} • {selectedApplicant.department}
                </p>

                {/* Skill & Role Tags */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {selectedApplicant.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-[#57685f]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Content Sections */}
            <div className="mt-6 flex flex-col gap-6">
              {/* Background & Bio */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0f6b5c] mb-2">
                  Background & Competencies
                </h3>
                <p className="text-xs leading-relaxed text-[#57685f]">
                  {selectedApplicant.bio}
                </p>
              </div>

              {/* Achievements */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0f6b5c] mb-2">
                  Achievements & Ranks
                </h3>
                <ul className="flex flex-col gap-2">
                  {selectedApplicant.achievements.map((ach) => (
                    <li key={ach} className="flex items-center gap-2 text-xs font-semibold text-[#122622]">
                      <Award className="h-4 w-4 text-amber-500 shrink-0" />
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Footer */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#d6e7e1] pt-6">
              <a
                href={`mailto:${selectedApplicant.email}`}
                className="flex items-center gap-2 rounded-2xl border border-[#d6e7e1] bg-white px-4 py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 transition-all cursor-pointer"
              >
                <Mail className="h-4 w-4" />
                <span>Contact Participant</span>
              </a>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    updateApplicantStatus(selectedApplicant.id, "REJECTED");
                    setSelectedApplicant(null);
                  }}
                  className="rounded-2xl border border-red-200 bg-white px-5 py-2.5 text-xs font-bold text-[#c4211c] hover:bg-red-50 transition-all cursor-pointer"
                >
                  Reject
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateApplicantStatus(selectedApplicant.id, "APPROVED");
                    setSelectedApplicant(null);
                  }}
                  className="flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Approve Applicant</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
