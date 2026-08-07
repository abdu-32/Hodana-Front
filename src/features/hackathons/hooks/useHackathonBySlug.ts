"use client";

import { useQuery } from "@tanstack/react-query";
import { getHackathonBySlug } from "../lib/hackathons-client";

/** Resolves a published hackathon by URL slug for register/team screens. */
export function useHackathonBySlug(slug: string) {
  return useQuery({
    queryKey: ["hackathons", "slug", slug],
    queryFn: () => getHackathonBySlug(slug),
    enabled: Boolean(slug),
    retry: false,
  });
}
