export type ProjectStatus = "DRAFT" | "IN_PROGRESS" | "READY_TO_REVIEW" | "SUBMITTED" | "COMPLETED";

export interface ProjectCriteriaScores {
  innovation: number;
  technical: number;
  design: number;
  impact: number;
}

export interface ProjectEvaluation {
  id: string;
  projectId: string;
  projectTitle: string;
  hackathonName: string;
  teamName: string;
  overallScore: number;
  criteriaScores: ProjectCriteriaScores;
  feedback: string;
  evaluatedAt: string;
  judgeName?: string;
  judgeTitle?: string;
}

export interface UserProject {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  hackathonId: string;
  hackathonName: string;
  teamName: string;
  teamMembersCount: number;
  status: ProjectStatus;
  buildProgress: number; // 0 - 100
  repoUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  pitchDeckUrl?: string;
  techStack: string[];
  submittedAt?: string;
  evaluation?: ProjectEvaluation;
  isPriority?: boolean;
}

export interface SubmitProjectPayload {
  title: string;
  tagline: string;
  repoUrl: string;
  demoUrl?: string;
  videoUrl?: string;
  techStack: string[];
  description: string;
}

const USER_PROJECTS_STORAGE_KEY = "hodana_user_projects_v1";

const INITIAL_USER_PROJECTS: UserProject[] = [
  {
    id: "proj-ecopath",
    title: "EcoPath Optimizer",
    tagline: "Real-time carbon footprint tracking and logistics optimization for urban delivery networks.",
    description: "Real-time carbon footprint tracking and route optimization engine designed for urban delivery fleets in Addis Ababa. Reduces fuel consumption and carbon emissions using AI route clustering.",
    category: "Logistics & AI",
    hackathonId: "hck-global-ai",
    hackathonName: "Global AI 2024",
    teamName: "Team Alpha-8",
    teamMembersCount: 5,
    status: "IN_PROGRESS",
    buildProgress: 78,
    repoUrl: "https://github.com/alpha8/ecopath-optimizer",
    demoUrl: "https://ecopath.et",
    videoUrl: "https://youtube.com/watch?v=ecopath-demo",
    techStack: ["Python", "FastAPI", "React", "PostgreSQL", "Mapbox"],
    isPriority: true,
  },
  {
    id: "proj-finsecure",
    title: "FinSecure Ledger",
    tagline: "Blockchain audit tool for micro-finance institutions.",
    description: "Automated smart contract security scanner and transaction anomaly detector specifically built for Ethiopian SACCOs and micro-finance organizations.",
    category: "FinTech",
    hackathonId: "hck-fintech",
    hackathonName: "FinTech Frontier 2024",
    teamName: "LedgerLabs",
    teamMembersCount: 3,
    status: "DRAFT",
    buildProgress: 33,
    repoUrl: "https://github.com/ledgerlabs/finsecure",
    demoUrl: "https://finsecure.et",
    videoUrl: "https://youtube.com/watch?v=finsecure-pitch",
    techStack: ["Solidity", "Next.js", "Python", "FastAPI"],
  },
  {
    id: "proj-vitalsync",
    title: "VitalSync AI",
    tagline: "Patient monitoring system with automated pulse triage alerts.",
    description: "VitalSync AI connects low-cost wireless pulse oximeters and ECG sensors at rural health posts directly to a central triage model, providing instant medical alerts to district hospitals.",
    category: "HealthTech",
    hackathonId: "hck-agritech",
    hackathonName: "AgriTech & Health 2024",
    teamName: "HealthTech Vanguard",
    teamMembersCount: 4,
    status: "READY_TO_REVIEW",
    buildProgress: 100,
    repoUrl: "https://github.com/healthtech/vitalsync-ai",
    demoUrl: "https://vitalsync.vercel.app",
    videoUrl: "https://youtube.com/watch?v=vitalsync-demo",
    pitchDeckUrl: "https://vitalsync.et/deck.pdf",
    techStack: ["Python", "TensorFlow", "FastAPI", "React", "Node.js"],
    submittedAt: "2024-08-11T14:30:00Z",
    evaluation: {
      id: "eval-vitalsync",
      projectId: "proj-vitalsync",
      projectTitle: "VitalSync AI",
      hackathonName: "AgriTech & Health 2024",
      teamName: "HealthTech Vanguard",
      overallScore: 9.3,
      criteriaScores: {
        innovation: 9.5,
        technical: 9.2,
        design: 9.0,
        impact: 9.5,
      },
      feedback: "Exceptional healthcare application tailored for Ethiopian rural health posts. Technical execution is robust, and the UI/UX is clean, accessible, and highly responsive.",
      evaluatedAt: "2024-08-12T10:00:00Z",
      judgeName: "Dr. Almaz Abera",
      judgeTitle: "Senior HealthTech Judge",
    },
  },
  {
    id: "proj-cropshield",
    title: "CropShield AI",
    tagline: "Early disease detection for Ethiopian smallholder farmers using computer vision.",
    description: "CropShield AI combines drone imagery and mobile camera uploads to detect rust and blight in teff and maize crops before widespread agricultural loss occurs.",
    category: "AgriTech",
    hackathonId: "hck-agritech",
    hackathonName: "AgriTech Hack 2024",
    teamName: "CropShield AI Team",
    teamMembersCount: 4,
    status: "COMPLETED",
    buildProgress: 100,
    repoUrl: "https://github.com/cropshield/crop-vision-ai",
    demoUrl: "https://cropshield-ethiopia.vercel.app",
    videoUrl: "https://youtube.com/watch?v=demo-cropshield",
    pitchDeckUrl: "https://cropshield.et/deck.pdf",
    techStack: ["Python", "TensorFlow", "FastAPI", "React", "USSD Gateway"],
    submittedAt: "2024-08-10T09:00:00Z",
    evaluation: {
      id: "eval-cropshield",
      projectId: "proj-cropshield",
      projectTitle: "CropShield AI",
      hackathonName: "AgriTech Hack 2024",
      teamName: "CropShield AI Team",
      overallScore: 9.6,
      criteriaScores: {
        innovation: 9.5,
        technical: 9.8,
        design: 9.2,
        impact: 9.9,
      },
      feedback: "Exceptional technical execution and clear social impact for Ethiopian farmers. The computer vision model accuracy and USSD integration are top-tier.",
      evaluatedAt: "2024-08-11T16:00:00Z",
      judgeName: "Prof. Bekele Moges",
      judgeTitle: "AgriTech Advisory Board Lead",
    },
  },
];

function getStoredProjects(): UserProject[] {
  if (typeof window === "undefined") return INITIAL_USER_PROJECTS;
  try {
    const raw = localStorage.getItem(USER_PROJECTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_USER_PROJECTS;
  } catch {
    return INITIAL_USER_PROJECTS;
  }
}

function saveStoredProjects(items: UserProject[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(USER_PROJECTS_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to persist user projects:", err);
    }
  }
}

export const userProjectsClient = {
  // GET /api/v1/projects
  async getUserProjects(): Promise<UserProject[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getStoredProjects());
      }, 150);
    });
  },

  // GET /api/v1/projects/:id/evaluation
  async getProjectEvaluation(projectId: string): Promise<ProjectEvaluation | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = getStoredProjects();
        const project = list.find((p) => p.id === projectId);
        resolve(project?.evaluation || null);
      }, 200);
    });
  },

  // POST /api/v1/projects/:id/submit
  async submitProject(
    projectId: string,
    payload: SubmitProjectPayload
  ): Promise<{ success: boolean; project: UserProject }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const list = getStoredProjects();
        const index = list.findIndex((p) => p.id === projectId);

        if (index === -1) {
          reject(new Error(`Project with ID ${projectId} not found`));
          return;
        }

        const updated: UserProject = {
          ...list[index],
          title: payload.title || list[index].title,
          tagline: payload.tagline || list[index].tagline,
          description: payload.description || list[index].description,
          repoUrl: payload.repoUrl,
          demoUrl: payload.demoUrl,
          videoUrl: payload.videoUrl,
          techStack: payload.techStack.length > 0 ? payload.techStack : list[index].techStack,
          status: "READY_TO_REVIEW",
          buildProgress: 100,
          submittedAt: new Date().toISOString(),
        };

        list[index] = updated;
        saveStoredProjects(list);
        resolve({ success: true, project: updated });
      }, 400);
    });
  },
};
