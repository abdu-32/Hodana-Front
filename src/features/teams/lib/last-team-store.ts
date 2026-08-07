/**
 * CONTRACT GAP (same shape as organizations' last-organization-store.ts):
 * there is no `GET /teams/hackathons/{hackathonId}/me` — the contract only
 * has `POST /teams/hackathons/{hackathonId}` (create) and
 * `GET /teams/{teamId}` (fetch by id). So once a user creates a team, or
 * accepts an invitation onto one, the client is the only thing that knows
 * "the team for hackathon X is teamId Y" unless we remember it ourselves.
 *
 * This is a client-side cache only — every read still re-fetches
 * `GET /teams/{teamId}` and treats a 403/404 as "the remembered id is
 * stale" (falls back to the create-team view). Flag this in the PR
 * description as an actual contract gap: a `GET /teams/hackathons/{id}/me`
 * endpoint would remove the need for this file entirely.
 */

const STORAGE_KEY = "innovation-hub:last-team-by-hackathon";

type TeamByHackathon = Record<string, string>;

function readStore(): TeamByHackathon {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TeamByHackathon) : {};
  } catch {
    return {};
  }
}

function writeStore(store: TeamByHackathon) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage full or unavailable — non-fatal, the UI just re-derives state
    // from the create-team view on next load.
  }
}

export function rememberTeamId(hackathonId: string, teamId: string): void {
  const store = readStore();
  store[hackathonId] = teamId;
  writeStore(store);
}

export function getRememberedTeamId(hackathonId: string): string | null {
  return readStore()[hackathonId] ?? null;
}

export function forgetTeamId(hackathonId: string): void {
  const store = readStore();
  delete store[hackathonId];
  writeStore(store);
}
