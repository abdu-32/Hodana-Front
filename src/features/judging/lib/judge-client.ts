import { authFetch } from "@/lib/api-client";

export type EvaluationStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface CriteriaScores {
  innovation: number; // 1 - 10
  technical: number; // 1 - 10
  design: number; // 1 - 10
  impact: number; // 1 - 10
  [key: string]: number;
}

export interface EvaluationRecord {
  id: string;
  submissionId: string;
  judgeId: string;
  criteriaScores: CriteriaScores;
  overallScore: number; // 1.00 - 10.00
  feedback: string;
  status: "DRAFT" | "SUBMITTED";
  updatedAt: string;
}

export interface JudgeAssignedHackathon {
  id: string;
  title: string;
  slug?: string;
  organizerName: string;
  deadline: string;
  totalSubmissions: number;
  evaluatedSubmissions: number;
  category: string;
  bannerImage?: string;
}

export interface JudgeProjectSubmission {
  id: string;
  teamId: string;
  teamName: string;
  teamMembersCount: number;
  projectTitle: string;
  description: string;
  tagline: string;
  category: string;
  hackathonId: string;
  hackathonName: string;
  repoUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  pitchDeckUrl?: string;
  techStack: string[];
  evaluationStatus: EvaluationStatus;
  myEvaluation?: EvaluationRecord;
}

export const judgeClient = {
  // POST /api/v1/judging/judge/invitations/:token/accept
  async acceptInvitation(token: string): Promise<{ success: boolean; hackathonId: string; hackathonTitle: string }> {
    const res = await authFetch<any>(`/judging/judge/invitations/${token}/accept`, {
      method: "POST",
    });
    return {
      success: true,
      hackathonId: res.hackathonId || "",
      hackathonTitle: res.hackathonTitle || "",
    };
  },

  // GET /api/v1/judging/assigned-hackathons
  async getAssignedHackathons(): Promise<JudgeAssignedHackathon[]> {
    try {
      const data = await authFetch<JudgeAssignedHackathon[]>("/judging/assigned-hackathons");
      return data || [];
    } catch (err) {
      console.error("Failed to fetch assigned hackathons:", err);
      return [];
    }
  },

  // GET /api/v1/judging/hackathons/:hackathonId/submissions
  async getSubmissionsForJudge(
    hackathonId: string = "all",
    category: string = "all",
    status: string = "all"
  ): Promise<JudgeProjectSubmission[]> {
    try {
      let targetHackathonIds: string[] = [];

      if (hackathonId && hackathonId !== "all") {
        targetHackathonIds = [hackathonId];
      } else {
        const assigned = await this.getAssignedHackathons();
        targetHackathonIds = assigned.map((h) => h.id);
      }

      if (targetHackathonIds.length === 0) {
        return [];
      }

      const qp = new URLSearchParams();
      if (category && category !== "all") {
        qp.append("category", category);
      }
      if (status && status !== "all") {
        qp.append("status", status);
      }
      const queryStr = qp.toString() ? `?${qp.toString()}` : "";

      const fetchPromises = targetHackathonIds.map(async (hid) => {
        try {
          return await authFetch<JudgeProjectSubmission[]>(
            `/judging/hackathons/${hid}/submissions${queryStr}`
          );
        } catch (e) {
          console.warn(`Failed to fetch submissions for hackathon ${hid}:`, e);
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);
      return results.flat();
    } catch (err) {
      console.error("Failed to fetch submissions for judge:", err);
      return [];
    }
  },

  // POST /api/v1/judging/submissions/:submissionId/evaluate
  async saveEvaluation(
    submissionId: string,
    criteriaScores: CriteriaScores,
    feedback: string,
    isFinalSubmit: boolean = false,
    hackathonId?: string
  ): Promise<{ success: boolean; evaluation: EvaluationRecord }> {
    const res = await authFetch<any>(`/judging/submissions/${submissionId}/evaluate`, {
      method: "POST",
      body: JSON.stringify({
        hackathonId: hackathonId,
        criteriaScores,
        feedback,
        status: isFinalSubmit ? "final" : "draft",
      }),
    });

    return {
      success: true,
      evaluation: {
        id: res.id || `eval-${submissionId}`,
        submissionId: res.submissionId || submissionId,
        judgeId: res.judgeId || "",
        criteriaScores: res.criteriaScores || criteriaScores,
        overallScore: res.overallScore ?? 0,
        feedback: res.feedback || feedback,
        status: res.status || (isFinalSubmit ? "SUBMITTED" : "DRAFT"),
        updatedAt: res.updatedAt || new Date().toISOString(),
      },
    };
  },
};

