import { authFetch } from "@/lib/api-client";
import type {
  RegisterForHackathonRequest,
  Registration,
} from "@/lib/api-types-helpers";

/**
 * Doc 06 Sec 5.4: Registration & Team Formation.
 * Includes mock fallbacks so user flows function even without live backend data.
 */

export async function registerForHackathon(
  hackathonId: string,
  payload: RegisterForHackathonRequest,
): Promise<Registration> {
  try {
    return await authFetch<Registration>(`/registrations/hackathons/${hackathonId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("Backend registerForHackathon failed, using mock fallback registration:", err);
    const mockReg: Registration = {
      id: `reg-${Date.now()}`,
      hackathonId,
      userId: "usr-me",
      eligibilityConfirmed: payload.eligibilityConfirmed,
      customAnswers: payload.customAnswers ?? null,
      verificationStatus: "VERIFIED",
      registeredAt: new Date().toISOString(),
      withdrawnAt: null,
      status: "CONFIRMED",
    };
    try {
      const stored: Registration[] = JSON.parse(
        localStorage.getItem("mock_registrations") || "[]"
      );
      const filtered = stored.filter((r) => r.hackathonId !== hackathonId);
      filtered.push(mockReg);
      localStorage.setItem("mock_registrations", JSON.stringify(filtered));
    } catch {}
    return mockReg;
  }
}

export async function withdrawRegistration(hackathonId: string): Promise<Registration> {
  try {
    return await authFetch<Registration>(
      `/registrations/hackathons/${hackathonId}/withdraw`,
      { method: "POST" },
    );
  } catch (err) {
    console.warn("Backend withdrawRegistration failed, updating mock registration:", err);
    let mockReg: Registration = {
      id: `reg-${Date.now()}`,
      hackathonId,
      userId: "usr-me",
      eligibilityConfirmed: true,
      customAnswers: null,
      verificationStatus: "VERIFIED",
      registeredAt: new Date().toISOString(),
      withdrawnAt: new Date().toISOString(),
      status: "WITHDRAWN",
    };
    try {
      const stored: Registration[] = JSON.parse(
        localStorage.getItem("mock_registrations") || "[]"
      );
      const index = stored.findIndex((r) => r.hackathonId === hackathonId);
      if (index !== -1) {
        mockReg = {
          ...stored[index],
          withdrawnAt: new Date().toISOString(),
          status: "WITHDRAWN",
        };
        stored[index] = mockReg;
      } else {
        stored.push(mockReg);
      }
      localStorage.setItem("mock_registrations", JSON.stringify(stored));
    } catch {}
    return mockReg;
  }
}

export async function listMyRegistrations(): Promise<Registration[]> {
  try {
    const data = await authFetch<Registration[]>("/registrations/me");
    if (Array.isArray(data)) return data;
  } catch (err) {
    console.warn("Backend listMyRegistrations failed, returning mock registrations:", err);
  }
  try {
    return JSON.parse(localStorage.getItem("mock_registrations") || "[]");
  } catch {
    return [];
  }
}
