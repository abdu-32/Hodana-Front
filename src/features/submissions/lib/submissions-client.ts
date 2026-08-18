export type WinnerRank = "FIRST" | "SECOND" | "THIRD" | "NONE";

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
  createdAt: string;
}

const SUBMISSIONS_STORAGE_KEY = "hodana_organizer_submissions_v1";

const INITIAL_SUBMISSIONS: ProjectSubmission[] = [
  {
    id: "sub-101",
    teamId: "team-agri-vision",
    teamName: "CropShield AI",
    teamMembersCount: 4,
    projectTitle: "AI Satellite Crop Blight Detector",
    tagline: "Early disease detection for Ethiopian smallholder farmers using computer vision.",
    category: "AI/ML",
    hackathonId: "hck-agritech",
    hackathonName: "AgriTech Hack 2024",
    averageScore: 9.6,
    evaluationsCount: 5,
    repoUrl: "https://github.com/cropshield/crop-vision-ai",
    demoUrl: "https://cropshield-ethiopia.vercel.app",
    rank: "FIRST",
    prizeAwardedAt: new Date(Date.now() - 86400000).toISOString(),
    winnerNotes: "Outstanding technical depth and direct agricultural impact.",
    createdAt: "2024-08-10T14:30:00Z",
  },
  {
    id: "sub-102",
    teamId: "team-irrigate-smart",
    teamName: "HydroFlow IoT",
    teamMembersCount: 3,
    projectTitle: "Solar-Powered Smart Irrigation Valve",
    tagline: "Automated moisture sensors connected to mobile USSD alerts.",
    category: "AgriTech",
    hackathonId: "hck-agritech",
    hackathonName: "AgriTech Hack 2024",
    averageScore: 9.1,
    evaluationsCount: 5,
    repoUrl: "https://github.com/hydroflow/smart-valve",
    demoUrl: "https://hydroflow.et",
    rank: "SECOND",
    prizeAwardedAt: new Date(Date.now() - 43200000).toISOString(),
    winnerNotes: "Great hardware prototype and working mobile integration.",
    createdAt: "2024-08-10T16:15:00Z",
  },
  {
    id: "sub-103",
    teamId: "team-coffee-chain",
    teamName: "OriginTrace",
    teamMembersCount: 5,
    projectTitle: "Coffee Export Traceability Protocol",
    tagline: "Transparent supply chain ledger from Yirgacheffe to international buyers.",
    category: "Blockchain",
    hackathonId: "hck-agritech",
    hackathonName: "AgriTech Hack 2024",
    averageScore: 8.7,
    evaluationsCount: 4,
    repoUrl: "https://github.com/origintrace/coffee-ledger",
    rank: "THIRD",
    prizeAwardedAt: new Date().toISOString(),
    winnerNotes: "Well architected smart contract for export compliance.",
    createdAt: "2024-08-11T09:00:00Z",
  },
  {
    id: "sub-104",
    teamId: "team-soil-check",
    teamName: "SoilScan Pro",
    teamMembersCount: 3,
    projectTitle: "Portable Soil NPK Analyzer App",
    tagline: "Instant soil nutrient diagnostics via mobile camera sensor processing.",
    category: "AI/ML",
    hackathonId: "hck-agritech",
    hackathonName: "AgriTech Hack 2024",
    averageScore: 8.3,
    evaluationsCount: 4,
    repoUrl: "https://github.com/soilscan/mobile-npk",
    rank: "NONE",
    createdAt: "2024-08-11T11:20:00Z",
  },
  {
    id: "sub-105",
    teamId: "team-chapa-micro",
    teamName: "BirrPay Wallet",
    teamMembersCount: 4,
    projectTitle: "Offline Merchant Micro-Payments",
    tagline: "NFC and soundwave offline digital wallet for rural trade.",
    category: "FinTech",
    hackathonId: "hck-fintech",
    hackathonName: "FinTech Frontier",
    averageScore: 9.5,
    evaluationsCount: 6,
    repoUrl: "https://github.com/birrpay/offline-nfc",
    demoUrl: "https://birrpay.et",
    rank: "FIRST",
    prizeAwardedAt: new Date().toISOString(),
    winnerNotes: "Solved offline connectivity gracefully for rural merchants.",
    createdAt: "2024-08-09T18:00:00Z",
  },
  {
    id: "sub-106",
    teamId: "team-credit-score",
    teamName: "EthioScore AI",
    teamMembersCount: 3,
    projectTitle: "Alternative Micro-Credit Scoring API",
    tagline: "Machine learning creditworthiness model built on mobile airtime history.",
    category: "AI/ML",
    hackathonId: "hck-fintech",
    hackathonName: "FinTech Frontier",
    averageScore: 8.9,
    evaluationsCount: 5,
    repoUrl: "https://github.com/ethioscore/ai-credit-model",
    rank: "NONE",
    createdAt: "2024-08-10T10:00:00Z",
  },
];

function getStoredSubmissions(): ProjectSubmission[] {
  if (typeof window === "undefined") return INITIAL_SUBMISSIONS;
  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_SUBMISSIONS;
  } catch {
    return INITIAL_SUBMISSIONS;
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
  // GET /api/organizer/submissions?hackathonId={id}&minScore={score}
  async getSubmissions(
    hackathonId: string = "all",
    minScore: number = 0,
    category: string = "all"
  ): Promise<ProjectSubmission[]> {
    let list = getStoredSubmissions();

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

  // POST /api/organizer/hackathons/:id/winners
  async assignWinnerRank(
    submissionId: string,
    rank: WinnerRank,
    winnerNotes?: string
  ): Promise<{ success: boolean; submission: ProjectSubmission }> {
    const list = getStoredSubmissions();
    const index = list.findIndex((s) => s.id === submissionId);

    if (index === -1) {
      throw new Error("Submission not found");
    }

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
  },

  // GET /api/organizer/hackathons/:id/leaderboard
  async getLeaderboard(hackathonId: string): Promise<ProjectSubmission[]> {
    const list = await this.getSubmissions(hackathonId);
    return list.sort((a, b) => b.averageScore - a.averageScore);
  },
};
