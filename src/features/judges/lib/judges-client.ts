import { apiFetch, authFetch } from "@/lib/api-client";

export interface JudgeInvitation {
  id: string;
  email: string;
  name?: string;
  organizerId?: string;
  hackathonId: string;
  hackathonTitle: string;
  token: string;
  status: "INVITED" | "ACCEPTED" | "EXPIRED" | "REVOKED" | "DECLINED";
  note?: string;
  createdAt: string;
  expiresAt?: string;
  assignmentsCount?: number;
  scoredCount?: number;
}

export interface HackathonJudge {
  id: string;
  userId: string;
  hackathonId: string;
  createdAt: string;
}

function normalizeStatus(backendStatus: string): "INVITED" | "ACCEPTED" | "EXPIRED" | "REVOKED" | "DECLINED" {
  const upper = (backendStatus || "").toUpperCase();
  if (upper === "SENT") return "INVITED";
  if (upper === "ACCEPTED") return "ACCEPTED";
  if (upper === "REVOKED") return "REVOKED";
  if (upper === "DECLINED") return "DECLINED";
  if (upper === "EXPIRED") return "EXPIRED";
  return "INVITED";
}

export const judgesClient = {
  // POST /api/v1/judging/judge/invitations
  async inviteJudge(data: {
    email: string;
    hackathonId: string;
    hackathonTitle?: string;
    note?: string;
  }): Promise<{ data: JudgeInvitation }> {
    const res = await authFetch<any>("/judging/judge/invitations", {
      method: "POST",
      body: JSON.stringify({
        email: data.email.trim().toLowerCase(),
        hackathonId: data.hackathonId,
        note: data.note || "",
      }),
    });

    const item: JudgeInvitation = {
      id: res.id,
      email: res.email,
      name: res.name || res.email.split("@")[0],
      hackathonId: res.hackathonId || data.hackathonId,
      hackathonTitle: res.hackathonTitle || data.hackathonTitle || "Hackathon",
      token: res.id,
      status: normalizeStatus(res.status),
      note: res.note,
      createdAt: res.invitedAt || new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    };

    return { data: item };
  },

  // GET /api/v1/judging/organizer/judges
  async listJudges(params?: {
    hackathonId?: string;
    status?: string;
    validHackathonIds?: string[];
    organizerId?: string;
  }): Promise<{ data: JudgeInvitation[] }> {
    const qp = new URLSearchParams();
    if (params?.hackathonId && params.hackathonId !== "All") {
      qp.append("hackathonId", params.hackathonId);
    }
    if (params?.status && params.status !== "All") {
      qp.append("status", params.status.toLowerCase());
    }

    const queryStr = qp.toString() ? `?${qp.toString()}` : "";
    const list = await authFetch<any[]>(`/judging/organizer/judges${queryStr}`);

    const mapped: JudgeInvitation[] = list.map((item) => ({
      id: item.id,
      email: item.email,
      name: item.name || item.email.split("@")[0],
      hackathonId: item.hackathonId,
      hackathonTitle: item.hackathonTitle,
      token: item.id,
      status: normalizeStatus(item.status),
      note: item.note,
      createdAt: item.invitedAt || new Date().toISOString(),
      assignmentsCount: item.assignmentsCount,
      scoredCount: item.scoredCount,
    }));

    return { data: mapped };
  },

  // POST /api/v1/judging/judge/invitations/:id/revoke
  async revokeInvitation(id: string): Promise<{ success: boolean }> {
    await authFetch(`/judging/judge/invitations/${id}/revoke`, {
      method: "POST",
    });
    return { success: true };
  },

  // DELETE /api/organizer/judges/:id/permanent -> Revoke on backend
  async deleteInvitation(id: string): Promise<{ success: boolean }> {
    try {
      await authFetch(`/judging/judge/invitations/${id}/revoke`, {
        method: "POST",
      });
    } catch {
      // If already revoked, pass through
    }
    return { success: true };
  },

  // GET /api/v1/judging/judge/invitations/:token
  async validateToken(token: string): Promise<{ data: JudgeInvitation | null }> {
    try {
      const res = await apiFetch<any>(`/judging/judge/invitations/${token}`);
      if (!res || !res.id) return { data: null };

      const item: JudgeInvitation = {
        id: res.id,
        email: res.email,
        name: res.name || res.email.split("@")[0],
        hackathonId: res.hackathonId,
        hackathonTitle: res.hackathonTitle,
        token: res.id,
        status: normalizeStatus(res.status),
        note: res.note,
        createdAt: res.invitedAt,
      };
      return { data: item };
    } catch {
      return { data: null };
    }
  },

  // POST /api/v1/judging/judge/invitations/:token/accept
  async acceptInvite(data: {
    token: string;
    fullName?: string;
  }): Promise<{ success: boolean; hackathonJudge: HackathonJudge }> {
    const res = await authFetch<any>(`/judging/judge/invitations/${data.token}/accept`, {
      method: "POST",
    });

    const judgeRecord: HackathonJudge = {
      id: res.id,
      userId: res.email,
      hackathonId: res.hackathonId,
      createdAt: res.respondedAt || new Date().toISOString(),
    };

    return { success: true, hackathonJudge: judgeRecord };
  },

  // POST /api/v1/judging/judge/invitations/:token/decline
  async declineInvite(token: string): Promise<{ success: boolean }> {
    await authFetch(`/judging/judge/invitations/${token}/decline`, {
      method: "POST",
    });
    return { success: true };
  },
};

