import { apiFetch, authFetch } from "@/lib/api-client";
import type {
  AdminOrganization,
  Organization,
  OrgVerificationDocument,
  OrgVerificationReview,
  RegisterOrganizationRequest,
  ReviewOrganizationVerificationRequest,
  SubmitVerificationDocumentsRequest,
} from "@/lib/api-types-helpers";

/**
 * Doc 06 Sec 5.2 / Flow 6.4: organization registration and verification.
 *
 * - `registerOrganization` (FR-ORG-001) requires a signed-in caller --
 *   registering an org is what turns that account into an Organizer, so
 *   it goes through `authFetch` like any other authenticated write.
 * - `getOrganization` (FR-ORG-002's "verified badge on every public page")
 *   is `AllowAny` on the backend per contracts/openapi.yaml, so it uses the
 *   plain `apiFetch` -- the same lookup works for an anonymous visitor
 *   viewing a hackathon's host-org badge and for the organizer viewing
 *   their own `/orgs/{id}/verification` screen.
 * - `submitVerificationDocuments` (FR-ORG-003) is restricted server-side to
 *   an Organizer scoped to that specific org (HasScopedRole, re-checked in
 *   services.py) -- a 403 here means the signed-in user isn't that org's
 *   organizer, not that something is broken client-side.
 * - `listPendingOrganizations` / `reviewOrganizationVerification`
 *   (FR-ADMIN-001) are Platform Admin only.
 */

export function registerOrganization(
  payload: RegisterOrganizationRequest,
): Promise<Organization> {
  return authFetch<Organization>("/organizations/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getOrganization(id: string): Promise<Organization> {
  return apiFetch<Organization>(`/organizations/${id}`);
}

export function submitVerificationDocuments(
  id: string,
  payload: SubmitVerificationDocumentsRequest,
): Promise<OrgVerificationDocument[]> {
  return authFetch<OrgVerificationDocument[]>(
    `/organizations/${id}/verification-documents`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

/** FR-ADMIN-001's review-queue dashboard listing. */
export function listPendingOrganizations(): Promise<AdminOrganization[]> {
  return authFetch<AdminOrganization[]>("/admin/organizations/pending");
}

/** FR-ADMIN-001's decision action -- lives under `/organizations/{id}/...`
 * per the contract's own note (services.review_organization_verification
 * is owned by the organizations app, not platform_admin). */
export function reviewOrganizationVerification(
  id: string,
  payload: ReviewOrganizationVerificationRequest,
): Promise<OrgVerificationReview> {
  return authFetch<OrgVerificationReview>(
    `/organizations/${id}/verification-review`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
