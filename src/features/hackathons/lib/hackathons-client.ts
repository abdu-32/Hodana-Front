import { apiFetch } from "@/lib/api-client";
import type { Hackathon, PaginatedHackathons } from "@/lib/api-types-helpers";

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

export function getMockHackathonBySlug(slug: string): Hackathon {
  const found = MOCK_HACKATHONS.find((h) => h.slug === slug);
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

const HODANA_HACKATHONS_STORAGE_KEY = "hodana_organizer_hackathons_v1";

function getStoredHackathons(): Hackathon[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(HODANA_HACKATHONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
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
  if (stored && Array.isArray(stored)) {
    return stored;
  }
  return MOCK_HACKATHONS;
}

/**
 * Doc 06 Sec 5.4 / FR-DISC-001: public hackathon discovery.
 */

export async function listHackathons(): Promise<PaginatedHackathons> {
  try {
    const res = await apiFetch<PaginatedHackathons>("/hackathons/");
    if (res && Array.isArray(res.data) && res.data.length > 0) {
      // Merge with any client-stored custom hackathons if present
      const stored = getStoredHackathons();
      if (stored && stored.length > 0) {
        const existingIds = new Set(res.data.map((h) => h.id));
        const customOnly = stored.filter((h) => !existingIds.has(h.id));
        const merged = [...customOnly, ...res.data];
        return {
          data: merged,
          meta: {
            limit: Math.max(50, merged.length),
            offset: 0,
            total: merged.length,
          },
        };
      }
      return res;
    }
  } catch (err) {
    console.warn("API listHackathons failed, falling back to mock/stored hackathons:", err);
  }

  const items = getAllClientHackathons();
  return {
    data: items,
    meta: {
      limit: 50,
      offset: 0,
      total: items.length,
    },
  };
}

export async function getHackathon(id: string): Promise<Hackathon> {
  try {
    return await apiFetch<Hackathon>(`/hackathons/${id}`);
  } catch (err) {
    console.warn(`API getHackathon failed for id ${id}, returning local hackathon:`, err);
    const items = getAllClientHackathons();
    const mock = items.find((h) => h.id === id || h.slug === id);
    if (mock) return mock;
    return getMockHackathonBySlug(id);
  }
}

export async function getHackathonBySlug(slug: string): Promise<Hackathon> {
  try {
    const page = await listHackathons();
    const match = page.data?.find((hackathon) => hackathon.slug === slug || hackathon.id === slug);
    if (match) {
      return match;
    }
  } catch (err) {
    console.warn(`API getHackathonBySlug failed for slug ${slug}, returning mock:`, err);
  }
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
  locationMode?: string;
  tags?: string[];
  status?: "draft" | "published" | "archived";
  maxTeamSize?: number;
  hostOrgId?: string;
}

export async function createHackathon(input: CreateHackathonInput): Promise<Hackathon> {
  const payload = {
    title: input.title,
    description: input.description || input.tagline || "",
    hostOrgId: input.hostOrgId || "00000000-0000-0000-0000-000000000001",
    slug:
      input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Math.floor(Math.random() * 1000),
    bannerUrl: input.bannerUrl || "/futuristic_city_banner.png",
    registrationOpensAt: input.registrationOpensAt || new Date().toISOString(),
    registrationClosesAt: input.registrationClosesAt || new Date(Date.now() + 14 * 86400000).toISOString(),
    submissionOpensAt: input.submissionOpensAt || new Date(Date.now() + 7 * 86400000).toISOString(),
    submissionClosesAt: input.submissionClosesAt || new Date(Date.now() + 21 * 86400000).toISOString(),
    locationMode: input.locationMode || "online",
    tags: input.tags || ["Innovation"],
    status: input.status || "draft",
    rules: "Standard hackathon rules apply.",
    prizeInfo: "$15,000 Prize Pool",
  };

  let createdItem: Hackathon | null = null;
  try {
    const created = await apiFetch<Hackathon>("/hackathons/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (created && created.id) {
      createdItem = created;
    }
  } catch (err) {
    console.warn("API createHackathon failed, creating persistent item in client cache:", err);
  }

  if (!createdItem) {
    createdItem = {
      id: `hck-${Date.now()}`,
      title: payload.title,
      slug: payload.slug,
      description: payload.description,
      hostOrgId: payload.hostOrgId,
      bannerUrl: payload.bannerUrl,
      registrationOpensAt: payload.registrationOpensAt,
      registrationClosesAt: payload.registrationClosesAt,
      submissionOpensAt: payload.submissionOpensAt,
      submissionClosesAt: payload.submissionClosesAt,
      rules: payload.rules,
      prizeInfo: payload.prizeInfo,
      locationMode: payload.locationMode,
      eligibilityRules: { maxTeamSize: input.maxTeamSize || 5 },
      tags: payload.tags,
      status: payload.status as any,
      showcasePublishedAt: null,
      createdByUserId: "usr-organizer",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSuspended: false,
    };
  }

  MOCK_HACKATHONS.unshift(createdItem);
  const currentList = getAllClientHackathons();
  const updated = [createdItem, ...currentList.filter((h) => h.id !== createdItem!.id)];
  saveStoredHackathons(updated);

  return createdItem;
}

export async function updateHackathon(id: string, input: Partial<CreateHackathonInput>): Promise<Hackathon> {
  let updatedItem: Hackathon | null = null;
  try {
    const updated = await apiFetch<Hackathon>(`/hackathons/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    if (updated) {
      updatedItem = updated;
    }
  } catch (err) {
    console.warn(`API updateHackathon failed for id ${id}:`, err);
  }

  const items = getAllClientHackathons();
  const matchIndex = items.findIndex((h) => h.id === id || h.slug === id);
  if (matchIndex >= 0) {
    const current = { ...items[matchIndex] };
    if (input.title) current.title = input.title;
    if (input.description) current.description = input.description;
    if (input.status) current.status = input.status as any;
    if (input.bannerUrl) current.bannerUrl = input.bannerUrl;
    if (input.tags) current.tags = input.tags;
    current.updatedAt = new Date().toISOString();

    const merged = [...items];
    merged[matchIndex] = updatedItem || current;
    saveStoredHackathons(merged);

    const mockMatch = MOCK_HACKATHONS.find((h) => h.id === id || h.slug === id);
    if (mockMatch) {
      Object.assign(mockMatch, updatedItem || current);
    }

    return updatedItem || current;
  }

  if (updatedItem) return updatedItem;
  throw new Error("Hackathon not found");
}

export async function deleteHackathon(id: string): Promise<boolean> {
  try {
    await apiFetch(`/hackathons/${id}`, {
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

