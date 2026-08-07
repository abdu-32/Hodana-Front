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

/**
 * Doc 06 Sec 5.4 / FR-DISC-001: public hackathon discovery.
 */

export async function listHackathons(): Promise<PaginatedHackathons> {
  try {
    const res = await apiFetch<PaginatedHackathons>("/hackathons/");
    if (res && Array.isArray(res.data) && res.data.length > 0) {
      return res;
    }
  } catch (err) {
    console.warn("API listHackathons failed, falling back to mock hackathons:", err);
  }
  return {
    data: MOCK_HACKATHONS,
    meta: {
      limit: 50,
      offset: 0,
      total: MOCK_HACKATHONS.length,
    },
  };
}

export async function getHackathon(id: string): Promise<Hackathon> {
  try {
    return await apiFetch<Hackathon>(`/hackathons/${id}`);
  } catch (err) {
    console.warn(`API getHackathon failed for id ${id}, returning mock hackathon:`, err);
    const mock = MOCK_HACKATHONS.find((h) => h.id === id);
    if (mock) return mock;
    return getMockHackathonBySlug(id);
  }
}

export async function getHackathonBySlug(slug: string): Promise<Hackathon> {
  try {
    const page = await listHackathons();
    const match = page.data?.find((hackathon) => hackathon.slug === slug);
    if (match) {
      return match;
    }
  } catch (err) {
    console.warn(`API getHackathonBySlug failed for slug ${slug}, returning mock:`, err);
  }
  return getMockHackathonBySlug(slug);
}
