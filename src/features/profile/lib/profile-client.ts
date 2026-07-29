import { apiFetch, authFetch } from "@/lib/api-client";
import type {
  PublicProfile,
  UserProfile,
  UserUpdateRequest,
} from "@/lib/api-types-helpers";

/**
 * Doc 06 Sec 5.1: FR-PROFILE-001 (my profile, authenticated) and
 * FR-PROFILE-002 (public profile, no auth required). Mirrors the split in
 * `features/auth/lib/auth-client.ts` -- authenticated reads/writes go
 * through `authFetch` (Bearer token, silent-refresh-on-401), the public
 * profile lookup is a plain `apiFetch` like any other unauthenticated
 * endpoint.
 */

export function getMyProfile(): Promise<UserProfile> {
  return authFetch<UserProfile>("/users/me");
}

/** FR-PROFILE-001/003. `UserUpdate` is a partial -- callers only need to
 * send the fields the form actually changed. */
export function updateMyProfile(
  payload: UserUpdateRequest,
): Promise<UserProfile> {
  return authFetch<UserProfile>("/users/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * FR-PROFILE-002. Note: Doc 06's route table says `/u/{username}`, but the
 * `Account`/`UserProfile` schema (contracts/openapi.yaml) has no username
 * field, only `id` and `email` -- the actual backend operation is
 * `GET /users/{id}`. The app's `/u/[id]` route uses the id, not a
 * username, until that's reconciled in the contract/design doc.
 */
export function getPublicProfile(id: string): Promise<PublicProfile> {
  return apiFetch<PublicProfile>(`/users/${id}`);
}
