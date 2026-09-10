import { apiFetch } from "@/lib/api-client";
import { SEED_CATEGORIES, SEED_FAQS, sortCategoriesByDisplayOrder } from "../data/faq-data";

export interface KBCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface KBFAQ {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  status: string;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedFAQs {
  data: KBFAQ[];
  meta: {
    limit: number;
    offset: number;
    total: number;
  };
}

export async function fetchKBCategories(): Promise<KBCategory[]> {
  try {
    const categories = await apiFetch<KBCategory[]>("/help/categories/");
    if (
      Array.isArray(categories) &&
      categories.length > 0 &&
      categories[0].name !== "string"
    ) {
      return sortCategoriesByDisplayOrder(categories);
    }
  } catch (error) {
    console.warn("API fetchKBCategories failed, using seed dataset:", error);
  }
  return sortCategoriesByDisplayOrder(SEED_CATEGORIES);
}

export async function fetchKBFAQs(params: {
  categorySlug?: string;
  keyword?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedFAQs> {
  const query = new URLSearchParams();
  if (params.categorySlug) query.set("categorySlug", params.categorySlug);
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.limit) query.set("limit", params.limit.toString());
  if (params.offset) query.set("offset", params.offset.toString());

  const queryString = query.toString();
  const path = `/help/faqs/${queryString ? `?${queryString}` : ""}`;

  try {
    const res = await apiFetch<PaginatedFAQs>(path);
    if (
      res &&
      Array.isArray(res.data) &&
      res.data.length > 0 &&
      res.data[0].question !== "string"
    ) {
      return res;
    }
  } catch (error) {
    console.warn("API fetchKBFAQs failed, using seed dataset:", error);
  }

  // Fallback filtering using SEED_FAQS
  let filtered = [...SEED_FAQS];

  if (params.categorySlug) {
    const category = SEED_CATEGORIES.find((c) => c.slug === params.categorySlug);
    if (category) {
      filtered = filtered.filter((f) => f.categoryId === category.id);
    }
  }

  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(
      (f) =>
        f.question.toLowerCase().includes(kw) ||
        f.answer.toLowerCase().includes(kw)
    );
  }

  const limit = params.limit || 100;
  const offset = params.offset || 0;
  const sliced = filtered.slice(offset, offset + limit);

  return {
    data: sliced,
    meta: {
      limit,
      offset,
      total: filtered.length,
    },
  };
}
