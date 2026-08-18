"use client";

import { authFetch } from "@/lib/api-client";

export type OrgRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type UserRole = "PARTICIPANT" | "ORGANIZER" | "JUDGE" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED";
export type HackathonAdminStatus = "published" | "draft" | "completed" | "suspended";

export interface VerificationDocument {
  name: string;
  type: string;
  size: string;
  url: string;
}

export interface AdminOrganizationRequest {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  orgType: "University" | "Tech Company" | "Non-Profit" | "Government / Public Sector" | "Incubator / Hub";
  applicantName: string;
  applicantRole: string;
  email: string;
  phone: string;
  location: string;
  websiteUrl?: string;
  socialUrl?: string;
  mission: string;
  plannedEventsDescription: string;
  documents: VerificationDocument[];
  status: OrgRequestStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerNotes?: string;
}

export interface AdminHackathon {
  id: string;
  title: string;
  slug: string;
  hostOrgId: string;
  hostOrgName: string;
  bannerUrl: string;
  locationMode: "online" | "in_person" | "hybrid";
  prizePool: string;
  participantsCount: number;
  teamsCount: number;
  status: HackathonAdminStatus;
  isFeatured: boolean;
  isSuspended: boolean;
  suspendReason?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  affiliation?: string;
  hackathonsCount: number;
  teamsCount: number;
  lastLoginAt: string;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  actorName: string;
  actorEmail: string;
  action: string;
  targetType: "ORGANIZATION" | "HACKATHON" | "USER" | "FINANCE" | "SYSTEM";
  targetName: string;
  details: string;
  timestamp: string;
}

export interface AdminFinancialRecord {
  id: string;
  hackathonId: string;
  hackathonTitle: string;
  hostOrgName: string;
  totalPrizePoolETB: number;
  escrowStatus: "ESCROWED" | "PARTIALLY_RELEASED" | "DISBURSED" | "PENDING_DEPOSIT";
  gateway: "Chapa" | "Telebirr" | "Bank Wire" | "ChechePay";
  disbursedAmountETB: number;
  lastUpdated: string;
}

export interface AdminMetrics {
  totalUsers: number;
  activeParticipants: number;
  verifiedOrganizers: number;
  activeJudges: number;
  totalHackathons: number;
  activeHackathonsCount: number;
  pendingOrgRequestsCount: number;
  totalPrizePoolVolumeETB: number;
  escrowBalanceETB: number;
  flaggedEventsCount: number;
}

const ADMIN_STORAGE_KEY = "hodana_admin_store_v2";

const INITIAL_ORG_REQUESTS: AdminOrganizationRequest[] = [
  {
    id: "org-req-101",
    name: "Addis Ababa University Innovation Lab",
    slug: "aau-innovation-lab",
    logoUrl: "/icons/aau_logo.png",
    orgType: "University",
    applicantName: "Dr. Yohannes Girma",
    applicantRole: "Director of Research & Incubation",
    email: "yohannes.girma@aau.edu.et",
    phone: "+251 91 123 4567",
    location: "Addis Ababa, Arat Kilo Campus",
    websiteUrl: "https://aau.edu.et/innovation",
    socialUrl: "https://linkedin.com/school/aau-ethiopia",
    mission: "Empowering university students, researchers, and engineers to build deep-tech solutions for national challenges.",
    plannedEventsDescription: "Bi-annual university tech hackathons, AI research sprints, and IoT hardware demo days.",
    documents: [
      {
        name: "AAU_Senate_Authorization_Letter.pdf",
        type: "Official University Accreditation Letter",
        size: "2.4 MB",
        url: "#",
      },
      {
        name: "Ministry_of_Education_Charter.pdf",
        type: "Charter & License",
        size: "4.1 MB",
        url: "#",
      },
    ],
    status: "PENDING",
    submittedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
  {
    id: "org-req-102",
    name: "FinTech Ethiopia Alliance",
    slug: "fintech-ethiopia-alliance",
    logoUrl: "/icons/fintech_eth.png",
    orgType: "Tech Company",
    applicantName: "Rahel Mengistu",
    applicantRole: "Chief Operations Officer",
    email: "rahel@fintechethiopia.org",
    phone: "+251 92 345 6789",
    location: "Bole Medhanialem, Addis Ababa",
    websiteUrl: "https://fintechethiopia.org",
    socialUrl: "https://twitter.com/FinTechEth",
    mission: "Accelerating financial inclusion, open banking APIs, and interoperable digital payments across East Africa.",
    plannedEventsDescription: "FinTech Frontier Ethiopia Hackathon 2024 with banking sponsors and cash grants.",
    documents: [
      {
        name: "Commercial_Registration_License.pdf",
        type: "Business Trade License",
        size: "1.8 MB",
        url: "#",
      },
      {
        name: "National_Bank_Pilot_Clearance.pdf",
        type: "NBE Regulatory Sandbox Approval",
        size: "3.2 MB",
        url: "#",
      },
    ],
    status: "PENDING",
    submittedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
  {
    id: "org-req-103",
    name: "GreenRoots AgriTech Foundation",
    slug: "greenroots-agritech",
    logoUrl: "/icons/greenroots.png",
    orgType: "Non-Profit",
    applicantName: "Tariku Teshome",
    applicantRole: "Program Lead",
    email: "tariku@greenroots.org.et",
    phone: "+251 94 567 8901",
    location: "Hawassa Tech Hub, Sidama",
    websiteUrl: "https://greenroots.org.et",
    mission: "Equipping rural farming communities with climate-smart technology, soil IoT sensors, and solar irrigation systems.",
    plannedEventsDescription: "Ethio-Green Tech Challenge focusing on renewable energy and agronomy startups.",
    documents: [
      {
        name: "Civil_Society_Organizations_Authority_Cert.pdf",
        type: "NGO Registration Certificate",
        size: "1.5 MB",
        url: "#",
      },
    ],
    status: "APPROVED",
    submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    reviewedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    reviewedBy: "Admin Superuser",
    reviewerNotes: "Verified official registry and valid NGO credentials.",
  },
];

const INITIAL_HACKATHONS: AdminHackathon[] = [
  {
    id: "hck-ethio-green",
    title: "Ethio-Green Tech Challenge 2024",
    slug: "ethio-green-tech-challenge-2024",
    hostOrgId: "org-req-103",
    hostOrgName: "GreenRoots AgriTech Foundation",
    bannerUrl: "/futuristic_city_banner.png",
    locationMode: "hybrid",
    prizePool: "500,000 ETB",
    participantsCount: 420,
    teamsCount: 94,
    status: "published",
    isFeatured: true,
    isSuspended: false,
    startDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: "hck-agritech",
    title: "AgriTech Hack 2024",
    slug: "agritech-hack-2024",
    hostOrgId: "org-101",
    hostOrgName: "Ministry of Innovation & Technology",
    bannerUrl: "/project_preview_dashboard.png",
    locationMode: "hybrid",
    prizePool: "1,200,000 ETB",
    participantsCount: 860,
    teamsCount: 172,
    status: "published",
    isFeatured: true,
    isSuspended: false,
    startDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: "hck-fintech",
    title: "FinTech Frontier Ethiopia",
    slug: "fintech-frontier",
    hostOrgId: "org-req-102",
    hostOrgName: "FinTech Ethiopia Alliance",
    bannerUrl: "/futuristic_city_banner.png",
    locationMode: "online",
    prizePool: "850,000 ETB",
    participantsCount: 310,
    teamsCount: 68,
    status: "draft",
    isFeatured: false,
    isSuspended: false,
    startDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 25).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "hck-urban-tech",
    title: "Smart Addis Urban Hackathon",
    slug: "smart-addis-urban-hackathon",
    hostOrgId: "org-addis-city",
    hostOrgName: "City Administration of Addis Ababa",
    bannerUrl: "/project_preview_dashboard.png",
    locationMode: "in_person",
    prizePool: "600,000 ETB",
    participantsCount: 150,
    teamsCount: 32,
    status: "suspended",
    isFeatured: false,
    isSuspended: true,
    suspendReason: "Pending updated city traffic API documentation and venue confirmation.",
    startDate: new Date(Date.now() + 86400000 * 15).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 22).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

const INITIAL_USERS: AdminUser[] = [
  {
    id: "usr-admin-1",
    fullName: "Kidus Worku",
    email: "kidus.admin@hodana.et",
    role: "ADMIN",
    status: "ACTIVE",
    affiliation: "Platform Governance Team",
    hackathonsCount: 8,
    teamsCount: 0,
    lastLoginAt: new Date().toISOString(),
    createdAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "usr-101",
    fullName: "Abebe Bekele",
    email: "abebe@hodana.et",
    role: "PARTICIPANT",
    status: "ACTIVE",
    affiliation: "Addis Ababa Institute of Technology",
    hackathonsCount: 3,
    teamsCount: 3,
    lastLoginAt: new Date(Date.now() - 1800000).toISOString(),
    createdAt: "2024-02-10T11:30:00Z",
  },
  {
    id: "usr-102",
    fullName: "Dr. Yohannes Girma",
    email: "yohannes.girma@aau.edu.et",
    role: "ORGANIZER",
    status: "ACTIVE",
    affiliation: "Addis Ababa University",
    hackathonsCount: 2,
    teamsCount: 0,
    lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: "2024-03-01T09:00:00Z",
  },
  {
    id: "usr-103",
    fullName: "Eng. Meron Fikre",
    email: "meron.judge@ethiopia.gov.et",
    role: "JUDGE",
    status: "ACTIVE",
    affiliation: "Ministry of Innovation & Technology",
    hackathonsCount: 5,
    teamsCount: 0,
    lastLoginAt: new Date(Date.now() - 43200000).toISOString(),
    createdAt: "2024-02-20T14:00:00Z",
  },
  {
    id: "usr-104",
    fullName: "Samson Desta",
    email: "samson.desta@spammer.net",
    role: "PARTICIPANT",
    status: "BANNED",
    affiliation: "Independent",
    hackathonsCount: 1,
    teamsCount: 0,
    lastLoginAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    createdAt: "2024-04-05T16:00:00Z",
  },
];

const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: "log-1",
    actorName: "Kidus Worku",
    actorEmail: "kidus.admin@hodana.et",
    action: "ORGANIZATION_APPROVED",
    targetType: "ORGANIZATION",
    targetName: "GreenRoots AgriTech Foundation",
    details: "Approved verification request after reviewing NGO license documents.",
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "log-2",
    actorName: "Kidus Worku",
    actorEmail: "kidus.admin@hodana.et",
    action: "HACKATHON_FLAGGED",
    targetType: "HACKATHON",
    targetName: "Smart Addis Urban Hackathon",
    details: "Suspended event pending city API documentation confirmation.",
    timestamp: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: "log-3",
    actorName: "Kidus Worku",
    actorEmail: "kidus.admin@hodana.et",
    action: "USER_BANNED",
    targetType: "USER",
    targetName: "Samson Desta",
    details: "Banned account for automated spam submission violation.",
    timestamp: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
];

const INITIAL_FINANCIALS: AdminFinancialRecord[] = [
  {
    id: "fin-101",
    hackathonId: "hck-agritech",
    hackathonTitle: "AgriTech Hack 2024",
    hostOrgName: "Ministry of Innovation & Technology",
    totalPrizePoolETB: 1200000,
    escrowStatus: "ESCROWED",
    gateway: "Chapa",
    disbursedAmountETB: 0,
    lastUpdated: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "fin-102",
    hackathonId: "hck-ethio-green",
    hackathonTitle: "Ethio-Green Tech Challenge 2024",
    hostOrgName: "GreenRoots AgriTech Foundation",
    totalPrizePoolETB: 500000,
    escrowStatus: "ESCROWED",
    gateway: "Telebirr",
    disbursedAmountETB: 0,
    lastUpdated: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "fin-103",
    hackathonId: "hck-fintech",
    hackathonTitle: "FinTech Frontier Ethiopia",
    hostOrgName: "FinTech Ethiopia Alliance",
    totalPrizePoolETB: 850000,
    escrowStatus: "PENDING_DEPOSIT",
    gateway: "Bank Wire",
    disbursedAmountETB: 0,
    lastUpdated: new Date().toISOString(),
  },
];

interface AdminStoreState {
  orgRequests: AdminOrganizationRequest[];
  hackathons: AdminHackathon[];
  users: AdminUser[];
  auditLogs: AdminAuditLog[];
  financials: AdminFinancialRecord[];
}

function getStoredState(): AdminStoreState {
  if (typeof window === "undefined") {
    return {
      orgRequests: INITIAL_ORG_REQUESTS,
      hackathons: INITIAL_HACKATHONS,
      users: INITIAL_USERS,
      auditLogs: INITIAL_AUDIT_LOGS,
      financials: INITIAL_FINANCIALS,
    };
  }
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    orgRequests: INITIAL_ORG_REQUESTS,
    hackathons: INITIAL_HACKATHONS,
    users: INITIAL_USERS,
    auditLogs: INITIAL_AUDIT_LOGS,
    financials: INITIAL_FINANCIALS,
  };
}

function saveStoredState(state: AdminStoreState) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Failed to persist admin state:", err);
    }
  }
}

export const adminClient = {
  // 1. Metrics & Overview
  async getMetrics(): Promise<AdminMetrics> {
    const state = getStoredState();
    const activeHackathons = state.hackathons.filter((h) => h.status === "published" && !h.isSuspended).length;
    const pendingOrgRequests = state.orgRequests.filter((r) => r.status === "PENDING").length;
    const flaggedEvents = state.hackathons.filter((h) => h.isSuspended).length;
    const totalPrizePool = state.financials.reduce((sum, f) => sum + f.totalPrizePoolETB, 0);
    const escrowBalance = state.financials
      .filter((f) => f.escrowStatus === "ESCROWED")
      .reduce((sum, f) => sum + f.totalPrizePoolETB, 0);

    return {
      totalUsers: state.users.length + 1840,
      activeParticipants: state.users.filter((u) => u.role === "PARTICIPANT").length + 1720,
      verifiedOrganizers: state.users.filter((u) => u.role === "ORGANIZER").length + 42,
      activeJudges: state.users.filter((u) => u.role === "JUDGE").length + 38,
      totalHackathons: state.hackathons.length + 14,
      activeHackathonsCount: activeHackathons,
      pendingOrgRequestsCount: pendingOrgRequests,
      totalPrizePoolVolumeETB: totalPrizePool + 4500000,
      escrowBalanceETB: escrowBalance + 3800000,
      flaggedEventsCount: flaggedEvents,
    };
  },

  // 2. Organization Verification Queue
  async getOrganizationRequests(statusFilter: string = "ALL"): Promise<AdminOrganizationRequest[]> {
    const state = getStoredState();
    if (statusFilter === "ALL") return state.orgRequests;
    return state.orgRequests.filter((r) => r.status === statusFilter);
  },

  async reviewOrganization(
    id: string,
    status: OrgRequestStatus,
    notes?: string
  ): Promise<AdminOrganizationRequest> {
    const state = getStoredState();
    const index = state.orgRequests.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Organization request not found");

    const req = state.orgRequests[index];
    const updated: AdminOrganizationRequest = {
      ...req,
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: "Admin Superuser",
      reviewerNotes: notes,
    };

    state.orgRequests[index] = updated;

    // Append Audit Log
    state.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorName: "Admin Superuser",
      actorEmail: "admin@hodana.et",
      action: status === "APPROVED" ? "ORGANIZATION_APPROVED" : "ORGANIZATION_REJECTED",
      targetType: "ORGANIZATION",
      targetName: req.name,
      details: notes || `Organization verification request marked as ${status}.`,
      timestamp: new Date().toISOString(),
    });

    saveStoredState(state);
    return updated;
  },

  // 3. Global Hackathon Moderation
  async getHackathons(filterStatus: string = "ALL"): Promise<AdminHackathon[]> {
    const state = getStoredState();
    if (filterStatus === "ALL") return state.hackathons;
    if (filterStatus === "FLAGGED") return state.hackathons.filter((h) => h.isSuspended);
    return state.hackathons.filter((h) => h.status === filterStatus.toLowerCase());
  },

  async toggleHackathonSuspension(id: string, reason?: string): Promise<AdminHackathon> {
    const state = getStoredState();
    const index = state.hackathons.findIndex((h) => h.id === id);
    if (index === -1) throw new Error("Hackathon not found");

    const h = state.hackathons[index];
    const newSuspendedState = !h.isSuspended;

    state.hackathons[index] = {
      ...h,
      isSuspended: newSuspendedState,
      status: newSuspendedState ? "suspended" : "published",
      suspendReason: newSuspendedState ? reason || "Suspended by platform administrator." : undefined,
    };

    state.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorName: "Admin Superuser",
      actorEmail: "admin@hodana.et",
      action: newSuspendedState ? "HACKATHON_SUSPENDED" : "HACKATHON_REACTIVATED",
      targetType: "HACKATHON",
      targetName: h.title,
      details: newSuspendedState ? `Event suspended: ${reason || "Policy moderation"}` : "Event reactivated to active status.",
      timestamp: new Date().toISOString(),
    });

    saveStoredState(state);
    return state.hackathons[index];
  },

  async toggleHackathonFeatured(id: string): Promise<AdminHackathon> {
    const state = getStoredState();
    const index = state.hackathons.findIndex((h) => h.id === id);
    if (index === -1) throw new Error("Hackathon not found");

    const h = state.hackathons[index];
    state.hackathons[index] = {
      ...h,
      isFeatured: !h.isFeatured,
    };

    saveStoredState(state);
    return state.hackathons[index];
  },

  // 4. Global User Management
  async getUsers(search: string = "", roleFilter: string = "ALL"): Promise<AdminUser[]> {
    const state = getStoredState();
    let list = state.users;

    if (roleFilter !== "ALL") {
      list = list.filter((u) => u.role === roleFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.affiliation && u.affiliation.toLowerCase().includes(q))
      );
    }

    return list;
  },

  async updateUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    const state = getStoredState();
    const index = state.users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("User not found");

    const user = state.users[index];
    state.users[index] = { ...user, ...updates };

    state.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorName: "Admin Superuser",
      actorEmail: "admin@hodana.et",
      action: "USER_MODIFIED",
      targetType: "USER",
      targetName: user.fullName,
      details: `Updated attributes: ${Object.keys(updates).join(", ")}`,
      timestamp: new Date().toISOString(),
    });

    saveStoredState(state);
    return state.users[index];
  },

  // 5. Audit Logs
  async getAuditLogs(): Promise<AdminAuditLog[]> {
    const state = getStoredState();
    return state.auditLogs;
  },

  // 6. Financials
  async getFinancials(): Promise<AdminFinancialRecord[]> {
    const state = getStoredState();
    return state.financials;
  },
};
