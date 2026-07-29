/**
 * Same base-URL logic as src/lib/api-client.ts, duplicated (not imported)
 * deliberately: api-client.ts pulls in features/auth/lib/session-store.ts,
 * a browser-only in-memory singleton that has no business being touched
 * from a server-side route handler. Keeping this tiny helper separate
 * avoids that import ever happening by accident.
 */
export const API_BASE_URL =
  process.env.BACKEND_INTERNAL_URL ?? "http://localhost:4010";

export function backendFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE_URL}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}
