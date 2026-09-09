import { getAccessToken, clearSession, setSession } from "@/features/auth/lib/session-store";
import type { SessionResponse } from "@/lib/api-types-helpers";

function getClientApiUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  if (typeof window !== "undefined" && base.includes("localhost") && window.location.hostname !== "localhost") {
    return base.replace("localhost", window.location.hostname);
  }
  return base;
}

let refreshInFlight: Promise<boolean> | null = null;
async function silentRefresh(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) {
          clearSession();
          return false;
        }
        const data: SessionResponse = await res.json();
        setSession(data.accessToken, data.user);
        return true;
      } catch {
        clearSession();
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

export type ExportResourceType =
  | "complete"
  | "participants"
  | "teams"
  | "submissions"
  | "judging"
  | "prizes"
  | "analytics";

export type ExportFormatType = "xlsx" | "csv" | "pdf";

export interface ExportParams {
  hackathonId?: string;
  resource?: ExportResourceType;
  format?: ExportFormatType;
  search?: string;
  status?: string;
  role?: string;
  city?: string;
  track?: string;
}

export async function downloadHackathonExport(params: ExportParams): Promise<void> {
  const apiUrl = getClientApiUrl();

  const query = new URLSearchParams();
  if (params.hackathonId) query.set("hackathonId", params.hackathonId);
  if (params.resource) query.set("resource", params.resource);
  if (params.format) query.set("format", params.format);
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.role) query.set("role", params.role);
  if (params.city) query.set("city", params.city);
  if (params.track) query.set("track", params.track);

  const doFetch = () => {
    const token = getAccessToken();
    return fetch(`${apiUrl}/api/v1/hackathons/export/?${query.toString()}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };

  let res = await doFetch();

  if (res.status === 401) {
    const refreshed = await silentRefresh();
    if (refreshed) {
      res = await doFetch();
    }
  }

  if (!res.ok) {
    let errorMsg = `Export request failed (HTTP ${res.status})`;
    try {
      const errBody = await res.json();
      errorMsg = errBody.detail || errBody.message || errBody.error?.message || errorMsg;
    } catch {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  // Extract filename from Content-Disposition header if provided
  let filename = `hackathon-export-${params.resource || "complete"}.${params.format || "xlsx"}`;
  const disposition = res.headers.get("content-disposition");
  if (disposition && disposition.includes("filename=")) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
