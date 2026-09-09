import { authFetch } from "@/lib/api-client";
import type { OrganizerOnboardingData } from "./organizer-schema";
import type { UserProfile } from "@/lib/api-types-helpers";

export interface MyOrganization {
  id: string;
  name: string;
  type: string;
  contactEmail: string;
  primaryEmailDomain?: string | null;
  verificationStatus: "unverified" | "pending" | "verified";
  domainFastTracked: boolean;
  isSuspended: boolean;
  createdAt: string;
  verifiedAt?: string | null;
  latestReview?: {
    decision: "approved" | "rejected";
    rejectionReason?: string | null;
    reviewedAt: string;
  } | null;
  documentsCount: number;
}

export type OrganizerVerificationState = "approved" | "pending" | "rejected" | "none";

export const ACTIVE_ORG_KEY = "hodana_active_organization";

export function getCachedActiveOrganization(): MyOrganization | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_ORG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Fetches the authenticated user's registered organizations from backend.
 */
export async function fetchMyOrganizations(): Promise<MyOrganization[]> {
  try {
    const data = await authFetch<MyOrganization[]>("/organizations/mine");
    if (Array.isArray(data)) {
      if (typeof window !== "undefined" && data.length > 0) {
        const approved =
          data.find((o) => o.verificationStatus === "verified" || (o as any).status?.toUpperCase() === "APPROVED") ||
          data[0];
        if (approved) {
          try {
            localStorage.setItem(ACTIVE_ORG_KEY, JSON.stringify(approved));
          } catch {}
        }
      }
      return data;
    }
    return [];
  } catch (err) {
    console.warn("Could not fetch user organizations from backend:", err);
    return [];
  }
}

/**
 * Checks whether the user is an active, verified organizer.
 */
export function isApprovedOrganizer(user: UserProfile | null): boolean {
  if (!user) return false;
  const roles = user.roles || [];
  const role = ((user as any).role || "").toLowerCase().trim();
  return (
    roles.some((r) => r.toLowerCase().trim() === "organizer" || r.toLowerCase().trim() === "admin") ||
    role === "organizer" ||
    role === "admin"
  );
}

/**
 * Computes the overall organizer approval status based on backend user and organizations state.
 */
export function getOrganizerVerificationState(
  user: UserProfile | null,
  myOrgs: MyOrganization[] = []
): {
  status: OrganizerVerificationState;
  activeOrg: MyOrganization | null;
  rejectionReason?: string | null;
} {
  if (!user) {
    return { status: "none", activeOrg: null };
  }

  // 1. If user already has the active organizer role
  if (isApprovedOrganizer(user)) {
    const verifiedOrg = myOrgs.find((o) => o.verificationStatus === "verified") || myOrgs[0] || null;
    return { status: "approved", activeOrg: verifiedOrg };
  }

  // 2. Check user's organization application object or fetched organizations
  const org = myOrgs[0] || (user as any).organizerApplication || null;
  if (!org) {
    return { status: "none", activeOrg: null };
  }

  if (org.verificationStatus === "verified") {
    return { status: "approved", activeOrg: org };
  }

  // If latest review was specifically rejected
  if (org.latestReview?.decision === "rejected") {
    return {
      status: "rejected",
      activeOrg: org,
      rejectionReason:
        org.latestReview.rejectionReason ||
        (org as any).rejectionReason ||
        "Please verify institutional credentials and re-submit.",
    };
  }

  // Otherwise, application is pending review
  return {
    status: "pending",
    activeOrg: org,
  };
}

/**
 * Backward-compatible helper for legacy components.
 */
export function isOrganizerProfileComplete(user: UserProfile | null): boolean {
  return isApprovedOrganizer(user);
}

export function getStoredOrganizerProfile(): OrganizerOnboardingData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("hodana_organizer_profile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveOrganizerProfile(data: Partial<OrganizerOnboardingData>): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredOrganizerProfile() || ({} as OrganizerOnboardingData);
    localStorage.setItem("hodana_organizer_profile", JSON.stringify({ ...current, ...data }));
  } catch {}
}
