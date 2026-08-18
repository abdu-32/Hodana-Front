export type EvaluationStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface CriteriaScores {
  innovation: number; // 1 - 10
  technical: number; // 1 - 10
  design: number; // 1 - 10
  impact: number; // 1 - 10
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

const EVALUATIONS_STORAGE_KEY = "hodana_judge_evaluations_v1";

const INITIAL_ASSIGNED_HACKATHONS: JudgeAssignedHackathon[] = [
  {
    id: "hck-agritech",
    title: "AgriTech Hack 2024",
    organizerName: "Ministry of Innovation & Technology",
    deadline: "2026-08-25",
    totalSubmissions: 16,
    evaluatedSubmissions: 10,
    category: "Agriculture & AI",
  },
  {
    id: "hck-fintech",
    title: "FinTech Frontier",
    organizerName: "National Bank Innovation Lab",
    deadline: "2026-09-10",
    totalSubmissions: 12,
    evaluatedSubmissions: 4,
    category: "Financial Inclusion",
  },
];

const INITIAL_JUDGE_SUBMISSIONS: JudgeProjectSubmission[] = [
  {
    id: "sub-101",
    teamId: "team-agri-vision",
    teamName: "CropShield AI",
    teamMembersCount: 4,
    projectTitle: "AI Satellite Crop Blight Detector",
    tagline: "Early disease detection for Ethiopian smallholder farmers using computer vision.",
    description: "CropShield AI uses Sentinel-2 satellite imagery combined with drone camera uploads to detect rust and blight in teff and maize fields. Farmers receive USSD SMS warnings before crop loss occurs.",
    category: "AI/ML",
    hackathonId: "hck-agritech",
    hackathonName: "AgriTech Hack 2024",
    repoUrl: "https://github.com/cropshield/crop-vision-ai",
    demoUrl: "https://cropshield-ethiopia.vercel.app",
    videoUrl: "https://youtube.com/watch?v=demo-cropshield",
    pitchDeckUrl: "https://cropshield.et/deck.pdf",
    techStack: ["Python", "TensorFlow", "FastAPI", "React", "USSD Gateway"],
    evaluationStatus: "COMPLETED",
    myEvaluation: {
      id: "eval-1",
      submissionId: "sub-101",
      judgeId: "judge-cur",
      criteriaScores: {
        innovation: 9.5,
        technical: 9.8,
        design: 9.2,
        impact: 9.9,
      },
      overallScore: 9.6,
      feedback: "Exceptional technical execution and clear social impact for Ethiopian farmers.",
      status: "SUBMITTED",
      updatedAt: "2024-08-11T10:00:00Z",
    },
  },
  {
    id: "sub-102",
    teamId: "team-irrigate-smart",
    teamName: "HydroFlow IoT",
    teamMembersCount: 3,
    projectTitle: "Solar-Powered Smart Irrigation Valve",
    tagline: "Automated moisture sensors connected to mobile USSD alerts.",
    description: "An IoT valve controller powered by solar energy that monitors ground humidity levels and regulates water usage in dry highland regions.",
    category: "AgriTech",
    hackathonId: "hck-agritech",
    hackathonName: "AgriTech Hack 2024",
    repoUrl: "https://github.com/hydroflow/smart-valve",
    demoUrl: "https://hydroflow.et",
    videoUrl: "https://youtube.com/watch?v=demo-hydroflow",
    techStack: ["C++ / ESP32", "MQTT", "Node.js", "Chapa SMS"],
    evaluationStatus: "COMPLETED",
    myEvaluation: {
      id: "eval-2",
      submissionId: "sub-102",
      judgeId: "judge-cur",
      criteriaScores: {
        innovation: 9.0,
        technical: 9.2,
        design: 8.8,
        impact: 9.4,
      },
      overallScore: 9.1,
      feedback: "Strong hardware prototype with practical deployment strategy.",
      status: "SUBMITTED",
      updatedAt: "2024-08-11T11:15:00Z",
    },
  },
  {
    id: "sub-103",
    teamId: "team-coffee-chain",
    teamName: "OriginTrace",
    teamMembersCount: 5,
    projectTitle: "Coffee Export Traceability Protocol",
    tagline: "Transparent supply chain ledger from Yirgacheffe to international buyers.",
    description: "Blockchain ledger verifying organic coffee origin, fair trade wages for harvesters, and export batch authentication.",
    category: "Blockchain",
    hackathonId: "hck-agritech",
    hackathonName: "AgriTech Hack 2024",
    repoUrl: "https://github.com/origintrace/coffee-ledger",
    demoUrl: "https://origintrace.et",
    techStack: ["Solidity", "Next.js", "IPFS", "Ethers.js"],
    evaluationStatus: "IN_PROGRESS",
    myEvaluation: {
      id: "eval-3",
      submissionId: "sub-103",
      judgeId: "judge-cur",
      criteriaScores: {
        innovation: 8.5,
        technical: 8.9,
        design: 8.4,
        impact: 9.0,
      },
      overallScore: 8.7,
      feedback: "Draft review saved. Need to verify export regulation compliance.",
      status: "DRAFT",
      updatedAt: "2024-08-11T12:00:00Z",
    },
  },
  {
    id: "sub-104",
    teamId: "team-soil-check",
    teamName: "SoilScan Pro",
    teamMembersCount: 3,
    projectTitle: "Portable Soil NPK Analyzer App",
    tagline: "Instant soil nutrient diagnostics via mobile camera sensor processing.",
    description: "Mobile spectral colorimetry app analyzing soil test strip photos to estimate N-P-K nutrient deficiencies.",
    category: "AI/ML",
    hackathonId: "hck-agritech",
    hackathonName: "AgriTech Hack 2024",
    repoUrl: "https://github.com/soilscan/mobile-npk",
    techStack: ["OpenCV", "Python", "Flutter"],
    evaluationStatus: "NOT_STARTED",
  },
  {
    id: "sub-105",
    teamId: "team-chapa-micro",
    teamName: "BirrPay Wallet",
    teamMembersCount: 4,
    projectTitle: "Offline Merchant Micro-Payments",
    tagline: "NFC and soundwave offline digital wallet for rural trade.",
    description: "Encrypted offline audio frequency payment transfer working on feature phones without cellular internet.",
    category: "FinTech",
    hackathonId: "hck-fintech",
    hackathonName: "FinTech Frontier",
    repoUrl: "https://github.com/birrpay/offline-nfc",
    demoUrl: "https://birrpay.et",
    techStack: ["Android WebAudio", "Rust", "SQLite Mobile"],
    evaluationStatus: "COMPLETED",
    myEvaluation: {
      id: "eval-4",
      submissionId: "sub-105",
      judgeId: "judge-cur",
      criteriaScores: {
        innovation: 9.8,
        technical: 9.6,
        design: 9.1,
        impact: 9.5,
      },
      overallScore: 9.5,
      feedback: "Innovative solution for rural trade without cellular connectivity.",
      status: "SUBMITTED",
      updatedAt: "2024-08-10T16:00:00Z",
    },
  },
];

function getStoredEvaluations(): Record<string, EvaluationRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(EVALUATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredEvaluations(evals: Record<string, EvaluationRecord>) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(EVALUATIONS_STORAGE_KEY, JSON.stringify(evals));
    } catch (err) {
      console.error("Failed to persist evaluations:", err);
    }
  }
}

export const judgeClient = {
  // POST /api/judges/accept-invite
  async acceptInvitation(token: string): Promise<{ success: boolean; hackathonId: string; hackathonTitle: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          hackathonId: "hck-agritech",
          hackathonTitle: "AgriTech Hack 2024",
        });
      }, 500);
    });
  },

  // GET /api/judge/hackathons
  async getAssignedHackathons(): Promise<JudgeAssignedHackathon[]> {
    return INITIAL_ASSIGNED_HACKATHONS;
  },

  // GET /api/judge/submissions?hackathonId={id}
  async getSubmissionsForJudge(
    hackathonId: string = "all",
    category: string = "all",
    status: string = "all"
  ): Promise<JudgeProjectSubmission[]> {
    const storedEvals = getStoredEvaluations();

    let list = INITIAL_JUDGE_SUBMISSIONS.map((sub) => {
      const myEval = storedEvals[sub.id] || sub.myEvaluation;
      let evalStatus = sub.evaluationStatus;
      if (myEval) {
        evalStatus = myEval.status === "SUBMITTED" ? "COMPLETED" : "IN_PROGRESS";
      }

      return {
        ...sub,
        myEvaluation: myEval,
        evaluationStatus: evalStatus,
      };
    });

    if (hackathonId !== "all") {
      list = list.filter((s) => s.hackathonId === hackathonId);
    }

    if (category !== "all") {
      list = list.filter(
        (s) => s.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (status !== "all") {
      if (status === "pending") {
        list = list.filter((s) => s.evaluationStatus !== "COMPLETED");
      } else if (status === "completed") {
        list = list.filter((s) => s.evaluationStatus === "COMPLETED");
      }
    }

    return list;
  },

  // POST /api/judge/evaluations
  async saveEvaluation(
    submissionId: string,
    criteriaScores: CriteriaScores,
    feedback: string,
    isFinalSubmit: boolean = false
  ): Promise<{ success: boolean; evaluation: EvaluationRecord }> {
    const overallScore = parseFloat(
      (
        (criteriaScores.innovation +
          criteriaScores.technical +
          criteriaScores.design +
          criteriaScores.impact) /
        4
      ).toFixed(2)
    );

    const record: EvaluationRecord = {
      id: `eval-${Date.now()}`,
      submissionId,
      judgeId: "judge-cur",
      criteriaScores,
      overallScore,
      feedback,
      status: isFinalSubmit ? "SUBMITTED" : "DRAFT",
      updatedAt: new Date().toISOString(),
    };

    const evals = getStoredEvaluations();
    evals[submissionId] = record;
    saveStoredEvaluations(evals);

    return { success: true, evaluation: record };
  },
};
