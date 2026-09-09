import { apiFetch, authFetch } from "@/lib/api-client";
import type { Hackathon, PaginatedHackathons } from "@/lib/api-types-helpers";
export type { Hackathon, PaginatedHackathons };

export const MOCK_HACKATHONS: Hackathon[] = [
  {
    id: "hck-101",
    title: "AgriStream 2024",
    slug: "agristream-2024",
    description:
      "Revolutionizing supply chain efficiency for smallholder farmers using blockchain and IoT.",
    hostOrgId: "org-101",
    bannerUrl:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80",
    registrationOpensAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    registrationClosesAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    submissionOpensAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    submissionClosesAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    rules:
      "1. All code must be written during the hackathon.\n2. Open source libraries are permitted.\n3. Team size 1-5 participants.",
    prizeInfo: "$15,000 Prize",
    totalPrizeBudget: "15000.00",
    prizeDistribution: {
      currency: "USD",
      firstPlaceAmount: "8000.00",
      secondPlaceAmount: "4000.00",
      thirdPlaceAmount: "3000.00",
    },
    locationMode: "Addis Ababa | Hybrid",
    eligibilityRules: { minAge: 18, openToAll: true },
    tags: ["AgriTech", "Blockchain", "IoT", "Featured"],
    status: "published" as any,
    showcasePublishedAt: null,
    createdByUserId: "usr-101",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isSuspended: false,
  },
  {
    id: "hck-102",
    title: "FinTech Frontier",
    slug: "fintech-frontier",
    description:
      "Developing accessible micro-payment solutions for local commerce and cross-border trade.",
    hostOrgId: "org-102",
    bannerUrl:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
    registrationOpensAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    registrationClosesAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    submissionOpensAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    submissionClosesAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    rules: "Build financial tools adhering to security best practices.",
    prizeInfo: "$25,000 Prize",
    totalPrizeBudget: "25000.00",
    prizeDistribution: {
      currency: "USD",
      firstPlaceAmount: "15000.00",
      secondPlaceAmount: "7000.00",
      thirdPlaceAmount: "3000.00",
    },
    locationMode: "Virtual",
    eligibilityRules: { minAge: 18, openToAll: true },
    tags: ["FinTech", "Micro-payments", "Trade"],
    status: "published" as any,
    showcasePublishedAt: null,
    createdByUserId: "usr-102",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isSuspended: false,
  },
  {
    id: "hck-103",
    title: "Ethio-Health AI",
    slug: "ethio-health-ai",
    description:
      "Leveraging machine learning to improve maternal health outcomes and diagnostic accuracy.",
    hostOrgId: "org-103",
    bannerUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    registrationOpensAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    registrationClosesAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    submissionOpensAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    submissionClosesAt: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    rules: "Focus on AI-driven health diagnostic tools.",
    prizeInfo: "$20,000 Prize",
    totalPrizeBudget: "20000.00",
    prizeDistribution: {
      currency: "USD",
      firstPlaceAmount: "10000.00",
      secondPlaceAmount: "6000.00",
      thirdPlaceAmount: "4000.00",
    },
    locationMode: "Bahir Dar | In-person",
    eligibilityRules: { minAge: 18, openToAll: true },
    tags: ["HealthTech", "AI", "Machine Learning"],
    status: "published" as any,
    showcasePublishedAt: null,
    createdByUserId: "usr-103",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isSuspended: false,
  },
];

const HODANA_HACKATHONS_STORAGE_KEY = "hodana_organizer_hackathons_v1";

function getStoredHackathons(): Hackathon[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(HODANA_HACKATHONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Failed reading custom hackathons from localStorage", e);
  }
  return null;
}

function saveStoredHackathons(items: Hackathon[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HODANA_HACKATHONS_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn("Failed saving hackathons to localStorage", e);
  }
}

export function getAllClientHackathons(): Hackathon[] {
  const stored = getStoredHackathons();
  if (stored && Array.isArray(stored) && stored.length > 0) {
    const validStored = stored.filter((h) => h && h.slug && !h.slug.startsWith("error-"));
    const storedIds = new Set(validStored.map((h) => h.id));
    const missingMocks = MOCK_HACKATHONS.filter((h) => !storedIds.has(h.id));
    return [...validStored, ...missingMocks];
  }
  return MOCK_HACKATHONS;
}

export function getMockHackathonBySlug(slug: string): Hackathon {
  const all = getAllClientHackathons();
  const found = all.find((h) => h.slug === slug || h.id === slug);
  if (found) return found;

  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    id: `hck-${slug}`,
    title: title || "Innovation Hackathon 2026",
    slug,
    description: `Welcome to ${
      title || "the hackathon"
    }! Join innovators across Ethiopia to build groundbreaking solutions.`,
    hostOrgId: "org-default",
    bannerUrl:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    registrationOpensAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    registrationClosesAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    submissionOpensAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    submissionClosesAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    rules: "Standard hackathon participation guidelines apply.",
    prizeInfo: "$15,000 Prize",
    totalPrizeBudget: "15000.00",
    prizeDistribution: null,
    locationMode: "HYBRID",
    eligibilityRules: { openToAll: true },
    tags: ["Innovation", "Ethiopia", "Technology"],
    status: "published" as any,
    showcasePublishedAt: null,
    createdByUserId: "usr-default",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSuspended: false,
  };
}

export interface ListHackathonsOptions {
  managedOnly?: boolean;
  managed?: boolean;
  keyword?: string;
  tag?: string;
  status?: string;
}

/**
 * Doc 06 Sec 5.4 / FR-DISC-001: public hackathon discovery or organizer managed listing.
 */
export async function listHackathons(
  options?: ListHackathonsOptions | Record<string, unknown>
): Promise<PaginatedHackathons> {
  const localItems = getAllClientHackathons();
  let apiItems: Hackathon[] = [];

  const opts = (options && typeof options === "object" && !("queryKey" in options))
    ? (options as ListHackathonsOptions)
    : undefined;

  const isManaged = Boolean(opts?.managedOnly || opts?.managed || (options as any)?.managed);

  const queryParams = new URLSearchParams();
  if (isManaged) queryParams.set("managed", "true");
  if (opts?.keyword) queryParams.set("keyword", opts.keyword);
  if (opts?.tag) queryParams.set("tag", opts.tag);
  if (opts?.status) queryParams.set("status", opts.status);
  const qs = queryParams.toString() ? `?${queryParams.toString()}` : "/";

  let apiSucceeded = false;
  try {
    const res = isManaged
      ? await authFetch<PaginatedHackathons>(`/hackathons/${qs.startsWith("?") ? qs : ""}`)
      : await apiFetch<PaginatedHackathons>(`/hackathons/${qs.startsWith("?") ? qs : ""}`);
    if (res && Array.isArray(res.data)) {
      apiItems = res.data;
      apiSucceeded = true;
    }
  } catch (err) {
    console.warn("API listHackathons failed, using local/cached hackathons:", err);
  }

  if (apiSucceeded) {
    return {
      data: apiItems,
      meta: {
        limit: Math.max(50, apiItems.length),
        offset: 0,
        total: apiItems.length,
      },
    };
  }

  // Fallback only when API is unavailable (offline mode)
  if (isManaged) {
    const mockIds = new Set(MOCK_HACKATHONS.map((m) => m.id));
    const customLocalOnly = localItems.filter((h) => !mockIds.has(h.id) && !h.slug.startsWith("error-"));
    return {
      data: customLocalOnly,
      meta: {
        limit: Math.max(50, customLocalOnly.length),
        offset: 0,
        total: customLocalOnly.length,
      },
    };
  }

  const validLocalItems = localItems.filter((h) => !h.slug.startsWith("error-"));
  return {
    data: validLocalItems,
    meta: {
      limit: Math.max(50, validLocalItems.length),
      offset: 0,
      total: validLocalItems.length,
    },
  };
}

export async function getHackathon(id: string): Promise<Hackathon> {
  const localItems = getAllClientHackathons();
  const localMatch = localItems.find((h) => h.id === id || h.slug === id);

  try {
    const remote = await apiFetch<Hackathon>(`/hackathons/${id}`);
    if (remote && remote.id) {
      return remote;
    }
  } catch (err) {
    console.warn(`API getHackathon failed for id ${id}, returning local hackathon:`, err);
  }

  if (localMatch) return localMatch;
  return getMockHackathonBySlug(id);
}

export async function getHackathonBySlug(slug: string): Promise<Hackathon> {
  const localItems = getAllClientHackathons();
  const localMatch = localItems.find((h) => h.slug === slug || h.id === slug);

  try {
    const page = await listHackathons();
    const match = page.data?.find((hackathon) => hackathon.slug === slug || hackathon.id === slug);
    if (match) {
      return match;
    }
  } catch (err) {
    console.warn(`API getHackathonBySlug failed for slug ${slug}, returning mock:`, err);
  }

  if (localMatch) return localMatch;
  return getMockHackathonBySlug(slug);
}

export interface CreateHackathonInput {
  title: string;
  tagline?: string;
  description?: string;
  bannerUrl?: string;
  registrationOpensAt: string;
  registrationClosesAt: string;
  submissionOpensAt: string;
  submissionClosesAt: string;
  locationMode?: "online" | "in_person" | "hybrid" | string;
  locationName?: string;
  venue?: string;
  field?: string;
  openTo?: string[];
  tags?: string[];
  status?: "draft" | "published" | "archived";
  maxTeamSize?: number;
  hostOrgId?: string;
  totalPrizeBudget?: number | string;
  prizeDistribution?: any;
  currency?: string;
}

export function formatHackathonPrize(h?: Partial<Hackathon> | null): string {
  if (!h) return "$15,000";
  const budget =
    h.totalPrizeBudget !== undefined && h.totalPrizeBudget !== null
      ? Number(h.totalPrizeBudget)
      : 0;
  const dist = (h.prizeDistribution || {}) as any;
  const currency = dist?.currency || "ETB";

  if (budget > 0) {
    return currency === "ETB"
      ? `${budget.toLocaleString()} ETB`
      : `$${budget.toLocaleString()} USD`;
  }
  return h.prizeInfo || "$15,000";
}

export async function createHackathon(input: CreateHackathonInput): Promise<Hackathon> {
  const generatedSlug =
    input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Math.floor(Math.random() * 1000);

  const totalPrizeBudgetStr =
    input.totalPrizeBudget !== undefined ? String(input.totalPrizeBudget) : "0.00";
  const budgetNum = Number(totalPrizeBudgetStr) || 0;
  const dist = (input.prizeDistribution || {}) as any;
  const currency = input.currency || dist?.currency || "ETB";

  const computedPrizeInfo = budgetNum > 0
    ? (currency === "ETB" ? `${budgetNum.toLocaleString()} ETB Prize Pool` : `$${budgetNum.toLocaleString()} Prize Pool`)
    : "$15,000 Prize Pool";

  const resolvedOpenTo = input.openTo && input.openTo.length > 0 ? input.openTo : ["ALL"];

  const payload = {
    title: input.title,
    description: input.description || input.tagline || "",
    ...(input.hostOrgId ? { hostOrgId: input.hostOrgId } : {}),
    slug: generatedSlug,
    bannerUrl: input.bannerUrl || "/futuristic_city_banner.png",
    registrationOpensAt: input.registrationOpensAt || new Date().toISOString(),
    registrationClosesAt: input.registrationClosesAt || new Date(Date.now() + 14 * 86400000).toISOString(),
    submissionOpensAt: input.submissionOpensAt || new Date(Date.now() + 7 * 86400000).toISOString(),
    submissionClosesAt: input.submissionClosesAt || new Date(Date.now() + 21 * 86400000).toISOString(),
    locationMode: input.locationMode || "online",
    locationName: input.locationName || (input.locationMode === "in_person" || input.locationMode === "hybrid" ? "Addis Ababa, Ethiopia" : "Online / Virtual"),
    venue: input.venue || "",
    field: input.field || "Technology",
    openTo: resolvedOpenTo,
    tags: input.tags && input.tags.length > 0 ? input.tags : ["Innovation"],
    status: input.status || "draft",
    rules: "Standard hackathon rules apply.",
    prizeInfo: computedPrizeInfo,
    totalPrizeBudget: totalPrizeBudgetStr,
    prizeDistribution: input.prizeDistribution || null,
    eligibilityRules: { maxTeamSize: input.maxTeamSize || 5 },
  };

  const created = await authFetch<Hackathon>("/hackathons/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!created || !created.id) {
    throw new Error("Failed to create hackathon: Invalid response from server.");
  }

  // Ensure stored in localStorage cache reliably
  const currentList = getAllClientHackathons().filter((h) => !h.slug.startsWith("error-"));
  const updated = [created, ...currentList.filter((h) => h.id !== created.id && h.slug !== created.slug)];
  saveStoredHackathons(updated);

  // Also update MOCK_HACKATHONS in-memory cache
  const existingMockIdx = MOCK_HACKATHONS.findIndex((h) => h.id === created.id || h.slug === created.slug);
  if (existingMockIdx >= 0) {
    MOCK_HACKATHONS[existingMockIdx] = created;
  } else {
    MOCK_HACKATHONS.unshift(created);
  }

  return created;
}

export async function updateHackathon(id: string, input: Partial<CreateHackathonInput>): Promise<Hackathon> {
  let updatedItem: Hackathon | null = null;
  const payload: any = { ...input };
  if (input.totalPrizeBudget !== undefined) {
    payload.totalPrizeBudget = String(input.totalPrizeBudget);
  }

  const items = getAllClientHackathons();
  const matchIndex = items.findIndex((h) => h.id === id || h.slug === id);
  const current = matchIndex >= 0 ? { ...items[matchIndex] } : null;

  if (input.totalPrizeBudget !== undefined || input.prizeDistribution !== undefined) {
    const budgetNum =
      input.totalPrizeBudget !== undefined
        ? Number(input.totalPrizeBudget)
        : Number(current?.totalPrizeBudget || 0);
    const dist = (input.prizeDistribution || current?.prizeDistribution || {}) as any;
    const currency = dist?.currency || "ETB";
    const formattedPrize = budgetNum > 0
      ? (currency === "ETB" ? `${budgetNum.toLocaleString()} ETB Prize Pool` : `$${budgetNum.toLocaleString()} Prize Pool`)
      : (current?.prizeInfo || "$15,000 Prize Pool");
    payload.prizeInfo = formattedPrize;
  }

  try {
    const updated = await authFetch<Hackathon>(`/hackathons/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (updated) {
      updatedItem = updated;
    }
  } catch (err) {
    console.warn(`API updateHackathon failed for id ${id}:`, err);
  }

  if (matchIndex >= 0 && current) {
    if (input.title !== undefined) current.title = input.title;
    if (input.description !== undefined) current.description = input.description;
    if (input.status !== undefined) current.status = input.status as any;
    if (input.bannerUrl !== undefined) current.bannerUrl = input.bannerUrl;
    if (input.tags !== undefined) current.tags = input.tags;
    if (input.registrationOpensAt !== undefined) current.registrationOpensAt = input.registrationOpensAt;
    if (input.registrationClosesAt !== undefined) current.registrationClosesAt = input.registrationClosesAt;
    if (input.submissionOpensAt !== undefined) current.submissionOpensAt = input.submissionOpensAt;
    if (input.submissionClosesAt !== undefined) current.submissionClosesAt = input.submissionClosesAt;
    if (input.locationMode !== undefined) current.locationMode = input.locationMode;
    if (input.locationName !== undefined) current.locationName = input.locationName;
    if (input.venue !== undefined) current.venue = input.venue;
    if (input.field !== undefined) current.field = input.field;
    if (input.openTo !== undefined) current.openTo = input.openTo;
    if (input.totalPrizeBudget !== undefined) current.totalPrizeBudget = String(input.totalPrizeBudget);
    if (input.prizeDistribution !== undefined) current.prizeDistribution = input.prizeDistribution;
    if (payload.prizeInfo !== undefined) current.prizeInfo = payload.prizeInfo;
    current.updatedAt = new Date().toISOString();

    const merged = [...items];
    const finalItem = { ...(updatedItem || current), ...(payload.prizeInfo ? { prizeInfo: payload.prizeInfo } : {}) };
    merged[matchIndex] = finalItem;
    saveStoredHackathons(merged);

    const mockMatch = MOCK_HACKATHONS.findIndex((h) => h.id === id || h.slug === id);
    if (mockMatch >= 0) {
      MOCK_HACKATHONS[mockMatch] = finalItem;
    } else {
      MOCK_HACKATHONS.unshift(finalItem);
    }

    return finalItem;
  }

  if (updatedItem) {
    const items = getAllClientHackathons();
    saveStoredHackathons([updatedItem, ...items.filter((h) => h.id !== updatedItem!.id)]);
    return updatedItem;
  }

  // If not found in existing items, create it
  const fallbackItem: Hackathon = {
    id,
    title: input.title || "Hackathon",
    slug: id,
    description: input.description || "",
    hostOrgId: input.hostOrgId || "org-default",
    bannerUrl: input.bannerUrl || "/futuristic_city_banner.png",
    registrationOpensAt: input.registrationOpensAt || new Date().toISOString(),
    registrationClosesAt: input.registrationClosesAt || new Date(Date.now() + 14 * 86400000).toISOString(),
    submissionOpensAt: input.submissionOpensAt || new Date(Date.now() + 7 * 86400000).toISOString(),
    submissionClosesAt: input.submissionClosesAt || new Date(Date.now() + 21 * 86400000).toISOString(),
    rules: "Standard rules apply.",
    prizeInfo: "$15,000 Prize",
    totalPrizeBudget: input.totalPrizeBudget !== undefined ? String(input.totalPrizeBudget) : "0.00",
    prizeDistribution: input.prizeDistribution || null,
    locationMode: input.locationMode || "HYBRID",
    eligibilityRules: { maxTeamSize: input.maxTeamSize || 5 },
    tags: input.tags || ["Innovation"],
    status: (input.status as any) || "published",
    showcasePublishedAt: null,
    createdByUserId: "usr-organizer",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSuspended: false,
  };

  const currentList = getAllClientHackathons();
  saveStoredHackathons([fallbackItem, ...currentList]);
  MOCK_HACKATHONS.unshift(fallbackItem);
  return fallbackItem;
}

export async function deleteHackathon(id: string): Promise<boolean> {
  try {
    await authFetch(`/hackathons/${id}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.warn(`API deleteHackathon failed for id ${id}:`, err);
  }

  // Remove from MOCK_HACKATHONS
  const mockIndex = MOCK_HACKATHONS.findIndex((h) => h.id === id || h.slug === id);
  if (mockIndex >= 0) {
    MOCK_HACKATHONS.splice(mockIndex, 1);
  }

  // Remove from localStorage
  const items = getAllClientHackathons();
  const filtered = items.filter((h) => h.id !== id && h.slug !== id);
  saveStoredHackathons(filtered);

  return true;
}

export interface PlatformStats {
  activeDevelopers: number;
  totalRegistrations: number;
  totalHackathons: number;
  totalPrizeVolumeETB: number;
  totalProjects: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    return await apiFetch<PlatformStats>("/api/v1/analytics/platform-stats");
  } catch (err) {
    console.warn("Failed to fetch live platform stats, using fallback:", err);
    return {
      activeDevelopers: 8,
      totalRegistrations: 4,
      totalHackathons: 12,
      totalPrizeVolumeETB: 3120000,
      totalProjects: 0,
    };
  }
}


