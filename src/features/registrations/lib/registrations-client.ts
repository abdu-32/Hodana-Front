import { authFetch } from "@/lib/api-client";
import type {
  RegisterForHackathonRequest,
  Registration,
} from "@/lib/api-types-helpers";
export type { Registration, RegisterForHackathonRequest };

/**
 * Doc 06 Sec 5.4: Registration & Team Formation.
 * Includes mock fallbacks so user flows function even without live backend data.
 */

export async function registerForHackathon(
  hackathonId: string,
  payload: RegisterForHackathonRequest,
): Promise<Registration> {
  return await authFetch<Registration>(`/registrations/hackathons/${hackathonId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function withdrawRegistration(hackathonId: string): Promise<Registration> {
  return await authFetch<Registration>(
    `/registrations/hackathons/${hackathonId}/withdraw`,
    { method: "POST" },
  );
}

export async function listMyRegistrations(): Promise<Registration[]> {
  const res = await authFetch<any>("/registrations/me");
  if (res && Array.isArray(res.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
}

export interface OrganizerRegistration {
  id: string;
  hackathonId: string;
  hackathonTitle: string;
  hackathonSlug: string;
  userId: string;
  participantName: string;
  email: string;
  phoneNumber?: string | null;
  country?: string | null;
  city?: string | null;
  avatarUrl?: string | null;
  university?: string | null;
  organization?: string | null;
  department?: string | null;
  fieldOfStudy?: string | null;
  profession?: string | null;
  role: string;
  professionalTitle?: string | null;
  experienceLevel?: string | null;
  yearsOfExperience?: number | null;
  skills: string[];
  bio?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  interestedInTeams?: string | null;
  lookingForTeammates?: boolean;
  teamSeekingDescription?: string | null;
  preferredTeamRoles?: string[];
  team?: {
    id: string;
    name: string;
    isLeader: boolean;
    role: string;
  } | null;
  eligibilityConfirmed: boolean;
  verificationStatus: string;
  customAnswers?: Record<string, any> | null;
  registeredAt: string;
  withdrawnAt?: string | null;
  status: string;
}

export interface OrganizerRegistrationsStats {
  totalRegistrations: number;
  registeredCount: number;
  withdrawnCount: number;
  uniqueParticipants: number;
  managedHackathonsCount: number;
}

export interface OrganizerRegistrationsResponse {
  data: OrganizerRegistration[];
  meta: {
    limit: number;
    offset: number;
    total: number;
    stats: OrganizerRegistrationsStats;
  };
}

export interface FetchOrganizerRegistrationsParams {
  hackathonId?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function fetchOrganizerRegistrations(
  params: FetchOrganizerRegistrationsParams = {}
): Promise<OrganizerRegistrationsResponse> {
  const q = new URLSearchParams();
  if (params.hackathonId && params.hackathonId !== "All" && params.hackathonId !== "all") {
    q.set("hackathonId", params.hackathonId);
  }
  if (params.status && params.status !== "All" && params.status !== "all") {
    q.set("status", params.status);
  }
  if (params.search && params.search.trim()) {
    q.set("search", params.search.trim());
  }
  if (params.limit !== undefined) {
    q.set("limit", String(params.limit));
  }
  if (params.offset !== undefined) {
    q.set("offset", String(params.offset));
  }

  const queryStr = q.toString() ? `?${q.toString()}` : "";
  return authFetch<OrganizerRegistrationsResponse>(`/registrations/organizer${queryStr}`);
}
