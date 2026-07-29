import type { UserProfile } from "@/lib/api-types-helpers";

/**
 * The access token lives here and *only* here -- a plain module-level
 * variable, never `localStorage`/`sessionStorage`. That's deliberate: it's
 * the piece of the session an XSS payload would most want to read, and an
 * in-memory value disappears the moment the tab is gone rather than
 * sitting around indefinitely. The long-lived refresh token never comes
 * anywhere near this module; it lives only in the httpOnly cookie set by
 * `app/api/auth/*` route handlers.
 *
 * A hard reload loses this (by design), which is exactly why
 * `SessionProvider` calls `/api/auth/refresh` once on mount -- the httpOnly
 * cookie survives the reload and mints a fresh access token back into
 * this store.
 */

export interface SessionSnapshot {
  accessToken: string | null;
  user: UserProfile | null;
  /** True until the mount-time silent refresh has resolved one way or the other. */
  isLoading: boolean;
}

let snapshot: SessionSnapshot = {
  accessToken: null,
  user: null,
  isLoading: true,
};

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function getSessionSnapshot(): SessionSnapshot {
  return snapshot;
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setSession(accessToken: string, user: UserProfile) {
  snapshot = { accessToken, user, isLoading: false };
  emit();
}

export function clearSession() {
  snapshot = { accessToken: null, user: null, isLoading: false };
  emit();
}

/** Called after a successful `PUT /users/me` (FR-PROFILE-001/003) -- updates
 * the cached user without touching the access token, since editing a
 * profile never mints a new one. No-ops if called with no session (the
 * caller shouldn't be able to reach the profile form unauthenticated, but
 * this keeps the store itself safe regardless). */
export function updateSessionUser(user: UserProfile) {
  if (!snapshot.accessToken) return;
  snapshot = { ...snapshot, user };
  emit();
}

export function setSessionLoading(isLoading: boolean) {
  snapshot = { ...snapshot, isLoading };
  emit();
}

/** Read-only synchronous getter for non-React code (e.g. `api-client.ts`). */
export function getAccessToken(): string | null {
  return snapshot.accessToken;
}
