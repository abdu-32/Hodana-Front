import type { components } from "./api-types";

/**
 * `api-types.ts` is regenerated from `contracts/openapi.yaml` and must
 * never be hand-edited (see README). This file is the opposite: a small,
 * hand-maintained set of convenience aliases over its `components.schemas`
 * shape, so feature code can `import type { UserProfile } from
 * "@/lib/api-types-helpers"` instead of the more verbose
 * `components["schemas"]["UserProfile"]` everywhere. Add to this file as
 * more features need named schema types.
 */
export type UserProfile = components["schemas"]["UserProfile"];
export type AuthResponse = components["schemas"]["AuthResponse"];
/**
 * What the browser actually gets back from `/api/auth/login|refresh` --
 * the Next.js route handlers strip `refreshToken` off `AuthResponse` before
 * it ever reaches client JS (see app/api/auth/*\/route.ts); it's set as an
 * httpOnly cookie instead. Client-side code should never expect this field.
 */
export type SessionResponse = Omit<AuthResponse, "refreshToken">;
export type LoginRequest = components["schemas"]["Login"];
export type SignupRequest = components["schemas"]["Signup"];
export type RefreshRequest = components["schemas"]["Refresh"];
export type VerifyEmailRequest = components["schemas"]["VerifyEmail"];
export type ResendVerificationRequest =
  components["schemas"]["ResendVerification"];
export type PasswordResetRequest =
  components["schemas"]["PasswordResetRequest"];
export type PasswordResetConfirmRequest =
  components["schemas"]["PasswordResetConfirm"];

export type PublicProfile = components["schemas"]["PublicProfile"];
export type UserUpdateRequest = components["schemas"]["UserUpdate"];


// Doc 06 Sec 5.2 (organization registration & verification, FR-ORG-001 --
// FR-ORG-003 / FR-ADMIN-001).
export type Organization = components["schemas"]["Organization"];
export type AdminOrganization = components["schemas"]["AdminOrganization"];
export type RegisterOrganizationRequest =
  components["schemas"]["RegisterOrganization"];
export type RegisterOrganizationType =
  components["schemas"]["RegisterOrganizationTypeEnum"];
export type SubmitVerificationDocumentsRequest =
  components["schemas"]["SubmitVerificationDocuments"];
export type OrgVerificationDocument =
  components["schemas"]["OrgVerificationDocument"];
export type ReviewOrganizationVerificationRequest =
  components["schemas"]["ReviewOrganizationVerification"];
export type OrgVerificationReview =
  components["schemas"]["OrgVerificationReview"];

// Doc 06 Sec 5.4 (registration & team formation).
export type Hackathon = components["schemas"]["Hackathon"];
export type PaginatedHackathons = components["schemas"]["PaginatedHackathons"];
export type Registration = components["schemas"]["Registration"];
export type RegisterForHackathonRequest =
  components["schemas"]["RegisterForHackathon"];
export type Team = components["schemas"]["Team"];
export type TeamMember = components["schemas"]["TeamMember"];
export type TeamRoster = components["schemas"]["TeamRoster"];
export type CreateTeamRequest = components["schemas"]["CreateTeam"];
export type InviteMemberRequest = components["schemas"]["InviteMember"];