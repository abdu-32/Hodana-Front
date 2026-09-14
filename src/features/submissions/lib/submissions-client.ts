import { authFetch } from "@/lib/api-client";

export type WinnerRank = "FIRST" | "SECOND" | "THIRD" | "NONE";

export type PayoutStatus = "NOT_REQUESTED" | "REQUESTED" | "SUBMITTED" | "PAID";

export interface PayoutDetails {
  beneficiaryName?: string;
  provider?: string;
  accountNumber?: string;
  phone?: string;
  notes?: string;
  submittedBy?: string;
  requestedAt?: string;
  submittedAt?: string;
  paidAt?: string;
  transactionRef?: string;
}

export interface ProjectSubmission {
  id: string;
  teamId: string;
  teamName: string;
  teamMembersCount: number;
  projectTitle: string;
  tagline: string;
  category: string;
  hackathonId: string;
  hackathonName: string;
  averageScore: number; // 1.00 - 10.00
  evaluationsCount: number;
  repoUrl?: string;
  demoUrl?: string;
  rank: WinnerRank;
  prizeAwardedAt?: string;
  winnerNotes?: string;
  payoutStatus?: PayoutStatus;
  payoutDetails?: PayoutDetails;
  deadlinePassed?: boolean;
  createdAt: string;
}

const SUBMISSIONS_STORAGE_KEY = "hodana_organizer_submissions_v1";

function getStoredSubmissions(): ProjectSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const legacyMockIds = new Set(["sub-101", "sub-102", "sub-103", "sub-104", "sub-105", "sub-106"]);
      return parsed.filter((item: ProjectSubmission) => !legacyMockIds.has(item.id));
    }
    return [];
  } catch {
    return [];
  }
}

function saveStoredSubmissions(items: ProjectSubmission[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to persist submissions:", err);
    }
  }
}

export const submissionsClient = {
  // GET /api/v1/submissions/organizer?hackathonId={id}&minScore={score}&category={category}
  async getSubmissions(
    hackathonId: string = "all",
    minScore: number = 0,
    category: string = "all",
    validHackathonIds?: string[]
  ): Promise<ProjectSubmission[]> {
    let list: ProjectSubmission[] = [];
    let backendSuccess = false;

    try {
      const params = new URLSearchParams();
      if (hackathonId && hackathonId !== "all") {
        params.set("hackathonId", hackathonId);
      }
      if (minScore > 0) {
        params.set("minScore", minScore.toString());
      }
      if (category && category !== "all") {
        params.set("category", category);
      }
      const qs = params.toString() ? `?${params.toString()}` : "";
      const apiData = await authFetch<ProjectSubmission[]>(`/submissions/organizer${qs}`);
      if (Array.isArray(apiData)) {
        list = apiData;
        backendSuccess = true;
        saveStoredSubmissions(list);
      }
    } catch (err) {
      console.warn("Could not fetch organizer submissions from backend, falling back to local cache:", err);
    }

    if (!backendSuccess) {
      list = getStoredSubmissions();
    }

    if (validHackathonIds !== undefined) {
      const allowedSet = new Set(validHackathonIds);
      list = list.filter((s) => allowedSet.has(s.hackathonId));
    }

    if (hackathonId !== "all") {
      list = list.filter((s) => s.hackathonId === hackathonId);
    }

    if (minScore > 0) {
      list = list.filter((s) => s.averageScore >= minScore);
    }

    if (category !== "all") {
      list = list.filter(
        (s) => s.category.toLowerCase() === category.toLowerCase()
      );
    }

    return list;
  },

  // POST /api/v1/submissions/organizer/winner
  async assignWinnerRank(
    submissionId: string,
    rank: WinnerRank,
    winnerNotes?: string
  ): Promise<{ success: boolean; submission: ProjectSubmission }> {
    try {
      await authFetch(`/submissions/organizer/winner`, {
        method: "POST",
        body: JSON.stringify({
          submissionId,
          rank,
          winnerNotes: winnerNotes || "",
        }),
      });
    } catch (err) {
      console.warn("Failed to persist winner assignment to backend:", err);
    }

    const list = getStoredSubmissions();
    const index = list.findIndex((s) => s.id === submissionId);

    if (index !== -1) {
      // If another team was assigned this same rank for the same hackathon, reset theirs to NONE
      const targetHackathonId = list[index].hackathonId;
      if (rank !== "NONE") {
        list.forEach((s) => {
          if (s.hackathonId === targetHackathonId && s.rank === rank) {
            s.rank = "NONE";
            s.prizeAwardedAt = undefined;
          }
        });
      }

      list[index] = {
        ...list[index],
        rank,
        winnerNotes,
        prizeAwardedAt: rank !== "NONE" ? new Date().toISOString() : undefined,
      };

      saveStoredSubmissions(list);
      return { success: true, submission: list[index] };
    }

    return {
      success: true,
      submission: {
        id: submissionId,
        teamId: "",
        teamName: "",
        teamMembersCount: 1,
        projectTitle: "",
        tagline: "",
        category: "",
        hackathonId: "",
        hackathonName: "",
        averageScore: 0,
        evaluationsCount: 0,
        rank,
        winnerNotes,
        prizeAwardedAt: rank !== "NONE" ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString(),
      },
    };
  },

  // POST /api/v1/submissions/organizer/request-payout
  async requestPayout(
    submissionId: string,
    message?: string
  ): Promise<{ success: boolean; submissionId: string; payoutStatus: PayoutStatus }> {
    try {
      await authFetch(`/submissions/organizer/request-payout`, {
        method: "POST",
        body: JSON.stringify({ submissionId, message: message || "" }),
      });
    } catch (err) {
      console.warn("Failed to request payout via backend API:", err);
    }

    // Update local cache
    const list = getStoredSubmissions();
    const idx = list.findIndex((s) => s.id === submissionId);
    if (idx !== -1) {
      list[idx].payoutStatus = "REQUESTED";
      list[idx].payoutDetails = {
        ...list[idx].payoutDetails,
        requestedAt: new Date().toISOString(),
      };
      saveStoredSubmissions(list);
    }

    return { success: true, submissionId, payoutStatus: "REQUESTED" };
  },

  // POST /api/v1/submissions/organizer/request-top-3-payouts
  async requestTop3Payouts(
    hackathonId: string,
    message?: string
  ): Promise<{ success: boolean; updatedCount: number; updatedIds: string[] }> {
    let result = { success: true, updatedCount: 0, updatedIds: [] as string[] };
    try {
      const res = await authFetch<{ success: boolean; updatedCount: number; updatedIds: string[] }>(
        `/submissions/organizer/request-top-3-payouts`,
        {
          method: "POST",
          body: JSON.stringify({ hackathonId, message: message || "" }),
        }
      );
      if (res && res.updatedIds) {
        result = res;
      }
    } catch (err) {
      console.warn("Failed to request Top 3 payouts via backend API:", err);
    }

    // Update local cache
    const list = getStoredSubmissions();
    list.forEach((s) => {
      if (s.hackathonId === hackathonId && (s.rank === "FIRST" || s.rank === "SECOND" || s.rank === "THIRD")) {
        s.payoutStatus = "REQUESTED";
        s.payoutDetails = {
          ...s.payoutDetails,
          requestedAt: new Date().toISOString(),
        };
      }
    });
    saveStoredSubmissions(list);

    return result;
  },

  // POST /api/v1/submissions/:id/payout-details
  async submitPayoutDetails(
    submissionId: string,
    details: PayoutDetails
  ): Promise<{ success: boolean; details: PayoutDetails }> {
    try {
      await authFetch(`/submissions/${submissionId}/payout-details`, {
        method: "POST",
        body: JSON.stringify(details),
      });
    } catch (err) {
      console.warn("Failed to submit payout details to backend API:", err);
    }

    // Update local cache
    const list = getStoredSubmissions();
    const idx = list.findIndex((s) => s.id === submissionId);
    if (idx !== -1) {
      list[idx].payoutStatus = "SUBMITTED";
      list[idx].payoutDetails = {
        ...details,
        submittedAt: new Date().toISOString(),
      };
      saveStoredSubmissions(list);
    }

    return { success: true, details };
  },

  // POST /api/v1/submissions/organizer/mark-payout-paid
  async markPayoutPaid(
    submissionId: string,
    transactionRef?: string
  ): Promise<{ success: boolean }> {
    try {
      await authFetch(`/submissions/organizer/mark-payout-paid`, {
        method: "POST",
        body: JSON.stringify({ submissionId, transactionRef: transactionRef || "" }),
      });
    } catch (err) {
      console.warn("Failed to mark payout paid via backend API:", err);
    }

    const list = getStoredSubmissions();
    const idx = list.findIndex((s) => s.id === submissionId);
    if (idx !== -1) {
      list[idx].payoutStatus = "PAID";
      if (list[idx].payoutDetails) {
        list[idx].payoutDetails = {
          ...list[idx].payoutDetails,
          paidAt: new Date().toISOString(),
          transactionRef,
        };
      }
      saveStoredSubmissions(list);
    }

    return { success: true };
  },

  // GET /api/organizer/hackathons/:id/leaderboard
  async getLeaderboard(hackathonId: string): Promise<ProjectSubmission[]> {
    const list = await this.getSubmissions(hackathonId);
    return list.sort((a, b) => b.averageScore - a.averageScore);
  },
};

