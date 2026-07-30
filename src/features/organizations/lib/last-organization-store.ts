"use client";

import { useSyncExternalStore } from "react";

/**
 * Contract gap (see `organizations-client.ts`'s header comment): there is
 * no `GET /organizations/mine` -- an Organizer's own org id isn't
 * returned anywhere by the API once they navigate away from
 * `/orgs/{id}/verification` (`UserProfile.roles` is just `string[]`, no
 * org-scoping data attached). Until that endpoint exists, the only way to
 * offer a "back to my organization" link at all is to remember the id
 * client-side at the moment it's created. This is a plain org UUID, not a
 * credential, so `localStorage` (unlike the access token in
 * `session-store.ts`) is an acceptable place for it.
 *
 * This is deliberately a *cache*, not a source of truth: it only ever
 * points at the last org this browser registered, so a user who manages
 * an org from a second device/browser, or who has more than one org,
 * won't see it reflected here. A real "my organizations" list should
 * replace this the moment the API supports it.
 */
const STORAGE_KEY = "innovation-hub:last-registered-org-id";

function readStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function rememberRegisteredOrganizationId(id: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Storage can throw in private-browsing/quota-exceeded cases -- losing
    // the "my organization" shortcut isn't worth surfacing an error for.
  }
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** The last org id this browser registered, or `null` if none / not yet
 * mounted (SSR-safe: returns `null` on the server snapshot). */
export function useLastRegisteredOrganizationId(): string | null {
  return useSyncExternalStore(subscribe, readStorage, () => null);
}
