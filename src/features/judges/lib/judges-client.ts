export interface JudgeInvitation {
  id: string;
  email: string;
  name?: string;
  organizerId: string;
  hackathonId: string;
  hackathonTitle: string;
  token: string;
  status: "INVITED" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  note?: string;
  createdAt: string;
  expiresAt: string;
}

export interface HackathonJudge {
  id: string;
  userId: string;
  hackathonId: string;
  createdAt: string;
}

const STORAGE_KEY = "hodana_judge_invitations_v1";

const INITIAL_INVITATIONS: JudgeInvitation[] = [
  {
    id: "inv-1",
    email: "dr.tadesse@aau.edu.et",
    name: "Dr. Tadesse Worku",
    organizerId: "org-1",
    hackathonId: "hck-agritech",
    hackathonTitle: "AgriTech Hack 2024",
    token: "token_agri_tadesse_101",
    status: "ACCEPTED",
    note: "Looking forward to your guidance on agricultural AI models.",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 4 * 86400000).toISOString(),
  },
  {
    id: "inv-2",
    email: "sara.kifle@fintech.et",
    name: "Sara Kifle",
    organizerId: "org-1",
    hackathonId: "hck-fintech",
    hackathonTitle: "FinTech Frontier",
    token: "token_fintech_sara_202",
    status: "INVITED",
    note: "We would love your expertise on digital wallets and micro-payments.",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 6 * 86400000).toISOString(),
  },
  {
    id: "inv-3",
    email: "prof.getachew@mit.edu",
    name: "Prof. Getachew Redda",
    organizerId: "org-1",
    hackathonId: "hck-ai-sprint",
    hackathonTitle: "Amharic NLP Sprint",
    token: "token_nlp_getachew_303",
    status: "INVITED",
    note: "Please evaluate LLM fine-tuning submissions for local Ethiopian languages.",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
  },
  {
    id: "inv-4",
    email: "old.judge@expired.org",
    organizerId: "org-1",
    hackathonId: "hck-agritech",
    hackathonTitle: "AgriTech Hack 2024",
    token: "token_expired_999",
    status: "EXPIRED",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

function getStoredInvitations(): JudgeInvitation[] {
  if (typeof window === "undefined") return INITIAL_INVITATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INVITATIONS));
      return INITIAL_INVITATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_INVITATIONS;
  }
}

function saveStoredInvitations(invites: JudgeInvitation[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invites));
  } catch (err) {
    console.error("Failed to persist invitations:", err);
  }
}

export const judgesClient = {
  // POST /api/organizer/judges/invite
  async inviteJudge(data: {
    email: string;
    hackathonId: string;
    hackathonTitle: string;
    note?: string;
  }): Promise<{ data: JudgeInvitation }> {
    const current = getStoredInvitations();
    const token = `token_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
    const newInvite: JudgeInvitation = {
      id: `inv-${Date.now()}`,
      email: data.email.trim().toLowerCase(),
      organizerId: "usr-org",
      hackathonId: data.hackathonId,
      hackathonTitle: data.hackathonTitle,
      token,
      status: "INVITED",
      note: data.note,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    };
    const updated = [newInvite, ...current];
    saveStoredInvitations(updated);
    return { data: newInvite };
  },

  // GET /api/organizer/judges?hackathonId={id}&status={status}
  async listJudges(params?: {
    hackathonId?: string;
    status?: string;
  }): Promise<{ data: JudgeInvitation[] }> {
    let list = getStoredInvitations();
    if (params?.hackathonId && params.hackathonId !== "All") {
      list = list.filter((i) => i.hackathonId === params.hackathonId);
    }
    if (params?.status && params.status !== "All") {
      list = list.filter((i) => i.status === params.status);
    }
    return { data: list };
  },

  // DELETE /api/organizer/judges/:id
  async revokeInvitation(id: string): Promise<{ success: boolean }> {
    const current = getStoredInvitations();
    const updated = current.map((item) =>
      item.id === id ? { ...item, status: "REVOKED" as const } : item
    );
    saveStoredInvitations(updated);
    return { success: true };
  },

  // GET /api/judges/invitation/:token
  async validateToken(token: string): Promise<{ data: JudgeInvitation | null }> {
    const current = getStoredInvitations();
    const found = current.find((i) => i.token === token);
    if (!found) return { data: null };

    // Check expiration
    if (new Date(found.expiresAt) < new Date() && found.status === "INVITED") {
      found.status = "EXPIRED";
      saveStoredInvitations(current);
    }
    return { data: found };
  },

  // POST /api/judges/accept-invite
  async acceptInvite(data: {
    token: string;
    fullName?: string;
    password?: string;
    bio?: string;
  }): Promise<{ success: boolean; hackathonJudge: HackathonJudge }> {
    const current = getStoredInvitations();
    const index = current.findIndex((i) => i.token === data.token);
    if (index === -1) {
      throw new Error("Invalid or expired invitation token.");
    }
    current[index].status = "ACCEPTED";
    if (data.fullName) {
      current[index].name = data.fullName;
    }
    saveStoredInvitations(current);

    const judgeRecord: HackathonJudge = {
      id: `hj-${Date.now()}`,
      userId: `usr-judge-${Date.now()}`,
      hackathonId: current[index].hackathonId,
      createdAt: new Date().toISOString(),
    };

    return { success: true, hackathonJudge: judgeRecord };
  },
};
