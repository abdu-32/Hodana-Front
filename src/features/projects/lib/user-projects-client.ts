import { authFetch } from "@/lib/api-client";
import { getAccessToken } from "@/features/auth/lib/session-store";
import { listHackathons } from "@/features/hackathons/lib/hackathons-client";
import {
  listMyRegistrations,
  registerForHackathon,
} from "@/features/registrations/lib/registrations-client";

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

export interface ProjectIntegrations {
  github?: {
    connected: boolean;
    repo?: string;
    branch?: string;
    lastSynced?: string;
    syncStatus?: "synced" | "pending" | "failed";
  };
  vercel?: {
    connected: boolean;
    deploymentUrl?: string;
    environment?: string;
    lastDeployed?: string;
    healthStatus?: "healthy" | "deploying" | "offline";
  };
  storage?: {
    connected: boolean;
    bucketUrl?: string;
    lastSynced?: string;
  };
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
  integrations?: ProjectIntegrations;
  rank?: "FIRST" | "SECOND" | "THIRD" | "NONE";
  payoutStatus?: "NOT_REQUESTED" | "REQUESTED" | "SUBMITTED" | "PAID";
  payoutDetails?: {
    beneficiaryName?: string;
    provider?: string;
    accountNumber?: string;
    phone?: string;
    notes?: string;
    submittedAt?: string;
    paidAt?: string;
  };
  updatedAt?: string;
}

export interface SubmitProjectPayload {
  title: string;
  tagline: string;
  repoUrl: string;
  demoUrl?: string;
  videoUrl?: string;
  pitchDeckUrl?: string;
  techStack: string[];
  description: string;
}

export interface CreateProjectPayload {
  title: string;
  tagline: string;
  category: string;
  hackathonId?: string;
  hackathonName?: string;
  teamName?: string;
  techStack: string[];
  description?: string;
  repoUrl?: string;
  demoUrl?: string;
}

const USER_PROJECTS_STORAGE_KEY = "hodana_user_projects_v2";

export const INITIAL_USER_PROJECTS: UserProject[] = [
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
    status: "DRAFT",
    buildProgress: 78,
    repoUrl: "https://github.com/alpha8/ecopath-optimizer",
    demoUrl: "https://ecopath.et",
    videoUrl: "https://youtube.com/watch?v=ecopath-demo",
    pitchDeckUrl: "https://storage.hodana.et/decks/EcoPath_Deck.pdf",
    techStack: ["Python", "FastAPI", "React", "PostgreSQL", "Mapbox"],
    isPriority: true,
    updatedAt: "2024-09-02T11:20:00Z",
    integrations: {
      github: {
        connected: true,
        repo: "alpha8/ecopath-optimizer",
        branch: "main",
        lastSynced: "Just now",
        syncStatus: "synced",
      },
      vercel: {
        connected: true,
        deploymentUrl: "https://ecopath.et",
        environment: "Production",
        lastDeployed: "2 hours ago",
        healthStatus: "healthy",
      },
      storage: {
        connected: true,
        bucketUrl: "s3://hodana-ethiopia-assets/ecopath",
        lastSynced: "1 day ago",
      },
    },
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
    updatedAt: "2024-09-01T08:15:00Z",
    integrations: {
      github: {
        connected: true,
        repo: "ledgerlabs/finsecure",
        branch: "dev",
        lastSynced: "3 days ago",
        syncStatus: "pending",
      },
      vercel: {
        connected: false,
        deploymentUrl: "",
        environment: "Preview",
        healthStatus: "offline",
      },
      storage: {
        connected: false,
      },
    },
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
    status: "SUBMITTED",
    buildProgress: 100,
    repoUrl: "https://github.com/healthtech/vitalsync-ai",
    demoUrl: "https://vitalsync.vercel.app",
    videoUrl: "https://youtube.com/watch?v=vitalsync-demo",
    pitchDeckUrl: "https://vitalsync.et/deck.pdf",
    techStack: ["Python", "TensorFlow", "FastAPI", "React", "Node.js"],
    submittedAt: "2024-08-11T14:30:00Z",
    updatedAt: "2024-08-12T10:00:00Z",
    integrations: {
      github: {
        connected: true,
        repo: "healthtech/vitalsync-ai",
        branch: "main",
        lastSynced: "1 day ago",
        syncStatus: "synced",
      },
      vercel: {
        connected: true,
        deploymentUrl: "https://vitalsync.vercel.app",
        environment: "Production",
        lastDeployed: "Yesterday",
        healthStatus: "healthy",
      },
      storage: {
        connected: true,
        bucketUrl: "s3://hodana-ethiopia-assets/vitalsync",
        lastSynced: "2 days ago",
      },
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
    updatedAt: "2024-08-11T16:00:00Z",
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
    integrations: {
      github: {
        connected: true,
        repo: "cropshield/crop-vision-ai",
        branch: "release/v1.0",
        lastSynced: "2 days ago",
        syncStatus: "synced",
      },
      vercel: {
        connected: true,
        deploymentUrl: "https://cropshield-ethiopia.vercel.app",
        environment: "Production",
        lastDeployed: "3 days ago",
        healthStatus: "healthy",
      },
      storage: {
        connected: true,
        bucketUrl: "s3://hodana-ethiopia-assets/cropshield",
        lastSynced: "3 days ago",
      },
    },
  },
];

export const MOCK_PROJECT_IDS = new Set([
  "proj-ecopath",
  "proj-finsecure",
  "proj-vitalsync",
  "proj-agripulse",
  "proj-cropshield",
]);

function getStorageKey(userId?: string): string {
  if (userId) return `hodana_user_projects_${userId}`;
  if (typeof window !== "undefined") {
    try {
      const authRaw = localStorage.getItem("hodana_session");
      if (authRaw) {
        const auth = JSON.parse(authRaw);
        if (auth?.user?.id) return `hodana_user_projects_${auth.user.id}`;
      }
    } catch {
      // ignore
    }
  }
  return USER_PROJECTS_STORAGE_KEY;
}

const DELETED_PROJECTS_KEY = "hodana_deleted_projects_v1";

function getDeletedProjectIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DELETED_PROJECTS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markProjectDeleted(id: string) {
  if (typeof window === "undefined") return;
  try {
    const set = getDeletedProjectIds();
    set.add(id);
    localStorage.setItem(DELETED_PROJECTS_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

function getStoredProjects(userId?: string): UserProject[] {
  if (typeof window === "undefined") return [];
  const deletedIds = getDeletedProjectIds();
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    let userList: UserProject[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        userList = parsed.filter((p) => p && p.id && !deletedIds.has(p.id));
      }
    }

    // Also pick up any submission drafts saved by participant in participantSubmissionsClient
    try {
      const subMapRaw = localStorage.getItem("hodana_participant_submissions_v2");
      if (subMapRaw) {
        const subMap = JSON.parse(subMapRaw);
        if (subMap && typeof subMap === "object") {
          Object.values(subMap).forEach((subItem: any) => {
            if (
              subItem &&
              subItem.id &&
              !deletedIds.has(subItem.id) &&
              !userList.some((p) => p.id === subItem.id || (subItem.hackathonId && p.hackathonId === subItem.hackathonId))
            ) {
              const isFinished = subItem.status === "EVALUATED" && subItem.averageScore;
              userList.push({
                id: subItem.id,
                title: subItem.title || "Untitled Draft",
                tagline: subItem.tagline || "Participant Hackathon Draft",
                description: subItem.description || "",
                category: "General",
                hackathonId: subItem.hackathonId || "hck-general",
                hackathonName: subItem.hackathonName || "Hackathon Challenge",
                teamName: subItem.teamName || "My Squad",
                teamMembersCount: (subItem.teamMembers?.length) || 1,
                status: isFinished ? "COMPLETED" : (subItem.status === "SUBMITTED" ? "SUBMITTED" : "DRAFT"),
                buildProgress: subItem.status === "SUBMITTED" || isFinished ? 100 : 45,
                repoUrl: subItem.githubUrl || "",
                demoUrl: subItem.liveDemoUrl || "",
                videoUrl: subItem.videoDemoUrl || "",
                pitchDeckUrl: subItem.pitchDeckPdf?.url || "",
                techStack: subItem.techStack || [],
                submittedAt: subItem.submittedAt,
                updatedAt: subItem.updatedAt || new Date().toISOString(),
                evaluation: isFinished
                  ? {
                      id: `eval-${subItem.id}`,
                      projectId: subItem.id,
                      projectTitle: subItem.title || "Evaluated Project",
                      hackathonName: subItem.hackathonName || "Hackathon Challenge",
                      teamName: subItem.teamName || "My Squad",
                      overallScore: Number(subItem.averageScore || 9.0),
                      criteriaScores: {
                        innovation: 9.0,
                        technical: 9.0,
                        design: 9.0,
                        impact: 9.0,
                      },
                      feedback: subItem.feedbackNotes || "Project deliverables officially evaluated and scored by judging panel.",
                      evaluatedAt: subItem.updatedAt || new Date().toISOString(),
                      judgeName: "Evaluation Committee",
                      judgeTitle: "Certified Judge",
                    }
                  : undefined,
              });
            }
          });
        }
      }
    } catch {
      // ignore
    }

    if (userList.length > 0) {
      return userList;
    }

    // Default seed fallback if no custom projects exist yet
    return INITIAL_USER_PROJECTS.filter((p) => !deletedIds.has(p.id));
  } catch {
    return INITIAL_USER_PROJECTS.filter((p) => !deletedIds.has(p.id));
  }
}

function saveStoredProjects(items: UserProject[], userId?: string) {
  if (typeof window !== "undefined") {
    try {
      const key = getStorageKey(userId);
      const deletedIds = getDeletedProjectIds();
      const cleanItems = items.filter((p) => p && p.id && !deletedIds.has(p.id));
      localStorage.setItem(key, JSON.stringify(cleanItems));
    } catch (err) {
      console.error("Failed to persist user projects:", err);
    }
  }
}

export const userProjectsClient = {
  // GET /api/v1/submissions/mine (Scoped strictly to submitted projects and reviews by this participant)
  async getUserProjects(userId?: string): Promise<UserProject[]> {
    let backendProjects: UserProject[] = [];
    const token = getAccessToken();
    if (!token && typeof window !== "undefined") {
      return getStoredProjects(userId);
    }
    try {
      const backendSubmissions = await authFetch<any[]>("/submissions/mine");
      if (Array.isArray(backendSubmissions) && backendSubmissions.length > 0) {
        const deletedIds = getDeletedProjectIds();
        backendProjects = backendSubmissions
          .filter((sub) => !deletedIds.has(sub.id))
          .map((sub) => {
            const hasFinalScore = Boolean(
              sub.review &&
              (sub.review.status === "COMPLETED" || (sub.review.overallScore !== undefined && sub.review.overallScore !== null))
            );
            const evalData: ProjectEvaluation | undefined = hasFinalScore
              ? {
                  id: `eval-${sub.id}`,
                  projectId: sub.id,
                  projectTitle: sub.title || "Submitted Project",
                  hackathonName: sub.hackathonTitle || "Hackathon",
                  teamName: sub.teamName || "Team",
                  overallScore: Number(sub.review.overallScore ?? 0),
                  criteriaScores: {
                    innovation: Number(sub.review.criteriaScores?.["Innovation"] ?? sub.review.overallScore ?? 0),
                    technical: Number(sub.review.criteriaScores?.["Technical Execution"] ?? sub.review.criteriaScores?.["Technical"] ?? sub.review.overallScore ?? 0),
                    design: Number(sub.review.criteriaScores?.["Design & UX"] ?? sub.review.criteriaScores?.["Design"] ?? sub.review.overallScore ?? 0),
                    impact: Number(sub.review.criteriaScores?.["Impact"] ?? sub.review.criteriaScores?.["Market Fit"] ?? sub.review.overallScore ?? 0),
                  },
                  feedback: sub.review.feedback || "Submission successfully reviewed by hackathon judges.",
                  evaluatedAt: sub.submittedAt || sub.createdAt || new Date().toISOString(),
                  judgeName: "Evaluation Committee",
                  judgeTitle: "Certified Judge",
                }
              : undefined;

            let projectStatus: ProjectStatus = "DRAFT";
            if (hasFinalScore) {
              projectStatus = "COMPLETED";
            } else if (sub.isFinalized) {
              projectStatus = "SUBMITTED";
            } else {
              projectStatus = "DRAFT";
            }

            const rawDemo = sub.attachmentUrls?.[0] || sub.liveDemoUrl || "";
            const cleanDemo = rawDemo && rawDemo !== "string" ? rawDemo : "";
            const cleanRepo = sub.repoLink && sub.repoLink !== "string" ? sub.repoLink : "";
            const cleanVideo = sub.demoVideoUrl && sub.demoVideoUrl !== "string" ? sub.demoVideoUrl : "";
            const cleanDeck = sub.attachmentUrls?.[0] && sub.attachmentUrls[0] !== "string" ? sub.attachmentUrls[0] : "";

            return {
              id: sub.id,
              title: sub.title && sub.title !== "string" ? sub.title : "Untitled Project",
              tagline: sub.tagline && sub.tagline !== "string" ? sub.tagline : (sub.description ? sub.description.slice(0, 90) + "..." : "Submitted Hackathon Project"),
              description: sub.description && sub.description !== "string" ? sub.description : "",
              category: sub.hackathonCategory && sub.hackathonCategory !== "string" ? sub.hackathonCategory : "General",
              hackathonId: sub.hackathonId,
              hackathonName: sub.hackathonTitle && sub.hackathonTitle !== "string" ? sub.hackathonTitle : "Hackathon",
              teamName: sub.teamName && sub.teamName !== "string" ? sub.teamName : "My Squad",
              teamMembersCount: 1,
              status: projectStatus,
              buildProgress: projectStatus === "COMPLETED" || projectStatus === "SUBMITTED" ? 100 : 45,
              repoUrl: cleanRepo,
              demoUrl: cleanDemo,
              videoUrl: cleanVideo,
              pitchDeckUrl: cleanDeck,
              techStack: Array.isArray(sub.technologies) ? sub.technologies.filter((t: string) => t !== "string") : [],
              submittedAt: sub.submittedAt,
              evaluation: evalData,
              rank: sub.rank || "NONE",
              payoutStatus: sub.payoutStatus || "NOT_REQUESTED",
              payoutDetails: sub.payoutDetails,
              updatedAt: sub.submittedAt || sub.createdAt || new Date().toISOString(),
            };
          });
      }
    } catch (err) {
      console.warn("Failed to fetch /submissions/mine from backend:", err);
    }

    const localProjects = getStoredProjects(userId);
    if (backendProjects.length > 0) {
      const backendIds = new Set(backendProjects.map((p) => p.id));
      const backendTitles = new Set(backendProjects.map((p) => p.title.toLowerCase().trim()));
      // Preserve local drafts that have not yet been submitted to the backend
      const unmergedDrafts = localProjects.filter(
        (p) => p.status === "DRAFT" && !backendIds.has(p.id) && !backendTitles.has(p.title.toLowerCase().trim())
      );
      return [...backendProjects, ...unmergedDrafts];
    }

    return localProjects;
  },

  // Showcase fallback projects for ecosystem showcase when platform has no public projects
  async getShowcaseProjects(): Promise<UserProject[]> {
    return INITIAL_USER_PROJECTS;
  },

  // GET /api/v1/projects/:id/evaluation
  async getProjectEvaluation(projectId: string): Promise<ProjectEvaluation | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = getStoredProjects();
        const project = list.find((p) => p.id === projectId);
        resolve(project?.evaluation || null);
      }, 150);
    });
  },

  // Helper: resolve or auto-register participant for a valid live hackathon
  async resolveParticipantHackathon(candidateHackathonId?: string): Promise<{ id: string; title: string } | null> {
    try {
      const regs = await listMyRegistrations().catch(() => []);
      const activeRegs = regs.filter((r) => !r.withdrawnAt);

      if (candidateHackathonId && !candidateHackathonId.startsWith("hck-")) {
        const matchedReg = activeRegs.find(
          (r) => r.hackathonId === candidateHackathonId || r.hackathonSlug === candidateHackathonId
        );
        if (matchedReg) {
          return { id: matchedReg.hackathonId, title: matchedReg.hackathonTitle || "Hackathon" };
        }
      }

      if (activeRegs.length > 0) {
        return { id: activeRegs[0].hackathonId, title: activeRegs[0].hackathonTitle || "Hackathon" };
      }

      // If no active registration, fetch live hackathons and register for the first available
      const liveRes = await listHackathons().catch(() => null);
      const list = liveRes?.data || (Array.isArray(liveRes) ? liveRes : []);
      if (list.length > 0) {
        const chosen = list.find((h: any) => h.id === candidateHackathonId || h.slug === candidateHackathonId) || list[0];
        await registerForHackathon(chosen.id, { eligibilityConfirmed: true }).catch(() => {});
        return { id: chosen.id, title: chosen.title || "Hackathon" };
      }
    } catch (e) {
      console.warn("Could not resolve participant hackathon:", e);
    }
    return null;
  },

  // Save Project as DRAFT (open/continue working on draft)
  async saveProjectDraft(
    projectId: string,
    updates: Partial<UserProject>
  ): Promise<UserProject> {
    const list = getStoredProjects();
    const index = list.findIndex((p) => p.id === projectId);
    const now = new Date().toISOString();

    let updated: UserProject;
    if (index !== -1) {
      updated = {
        ...list[index],
        ...updates,
        status: "DRAFT",
        updatedAt: now,
      };
      list[index] = updated;
    } else {
      const initial = INITIAL_USER_PROJECTS.find((p) => p.id === projectId);
      updated = {
        ...(initial || {
          id: projectId,
          title: updates.title || "Untitled Draft",
          tagline: updates.tagline || "",
          description: updates.description || "",
          category: "General",
          hackathonId: "hck-general",
          hackathonName: "Hackathon Challenge",
          teamName: "My Squad",
          teamMembersCount: 1,
          techStack: updates.techStack || ["Next.js", "Python"],
          buildProgress: 35,
        } as UserProject),
        ...updates,
        status: "DRAFT",
        updatedAt: now,
      };
      list.unshift(updated);
    }

    saveStoredProjects(list);

    // Also sync draft to backend if possible
    try {
      const resolved = await this.resolveParticipantHackathon(updated.hackathonId);
      if (resolved?.id) {
        const attachUrls = [updated.pitchDeckUrl, updated.demoUrl].filter(Boolean) as string[];
        await authFetch(`/submissions/hackathons/${resolved.id}`, {
          method: "POST",
          body: JSON.stringify({
            title: updated.title || "Draft Project",
            tagline: updated.tagline || "",
            description: updated.description || "",
            technologies: updated.techStack || [],
            repoLink: updated.repoUrl || "",
            repo_link: updated.repoUrl || "",
            demoVideoUrl: updated.videoUrl || "",
            demo_video_url: updated.videoUrl || "",
            attachmentUrls: attachUrls,
            attachment_urls: attachUrls,
          }),
        }).catch(() => {});
      }
    } catch {
      // Non-blocking draft sync
    }

    return updated;
  },

  // POST /api/v1/projects/:id/submit (Submit draft for Judge Review)
  async submitProject(
    projectId: string,
    payload: SubmitProjectPayload
  ): Promise<{ success: boolean; project: UserProject }> {
    const list = getStoredProjects();
    const index = list.findIndex((p) => p.id === projectId);
    const existing = index !== -1 ? list[index] : null;

    let targetHackathonId = existing?.hackathonId;
    let targetHackathonName = existing?.hackathonName;

    // 1. Resolve real hackathon and ensure registration
    const resolvedHck = await this.resolveParticipantHackathon(targetHackathonId);
    if (resolvedHck) {
      targetHackathonId = resolvedHck.id;
      targetHackathonName = resolvedHck.title;
    }

    // 2. Submit to backend API & finalize
    let backendId = projectId;
    const now = new Date().toISOString();

    if (targetHackathonId && !targetHackathonId.startsWith("hck-")) {
      try {
        const attachUrls = [payload.pitchDeckUrl, payload.demoUrl].filter(Boolean) as string[];
        const subRes = await authFetch<any>(`/submissions/hackathons/${targetHackathonId}`, {
          method: "POST",
          body: JSON.stringify({
            title: payload.title.trim(),
            tagline: payload.tagline.trim(),
            description: payload.description.trim(),
            technologies: payload.techStack.length > 0 ? payload.techStack : ["Next.js", "Python"],
            repoLink: payload.repoUrl.trim(),
            repo_link: payload.repoUrl.trim(),
            demoVideoUrl: payload.videoUrl?.trim() || "",
            demo_video_url: payload.videoUrl?.trim() || "",
            attachmentUrls: attachUrls,
            attachment_urls: attachUrls,
          }),
        });

        if (subRes && subRes.id) {
          backendId = subRes.id;
          // Finalize on backend so judge dashboard receives it immediately
          await authFetch(`/submissions/${subRes.id}/finalize`, {
            method: "POST",
          }).catch((err) => console.warn("Finalize warning:", err));
        }
      } catch (backendErr) {
        console.error("Backend submission upsert error:", backendErr);
      }
    }

    // 3. Update state & local storage
    const updated: UserProject = {
      ...(existing || {
        id: backendId,
        title: payload.title,
        tagline: payload.tagline,
        description: payload.description,
        category: "General",
        hackathonId: targetHackathonId || "hck-general",
        hackathonName: targetHackathonName || "Hackathon",
        teamName: "My Squad",
        teamMembersCount: 1,
        status: "SUBMITTED",
        buildProgress: 100,
        techStack: payload.techStack,
      } as UserProject),
      id: backendId,
      hackathonId: targetHackathonId || existing?.hackathonId || "hck-general",
      hackathonName: targetHackathonName || existing?.hackathonName || "Hackathon",
      title: payload.title || existing?.title || "Untitled Project",
      tagline: payload.tagline || existing?.tagline || "",
      description: payload.description || existing?.description || "",
      repoUrl: payload.repoUrl,
      demoUrl: payload.demoUrl,
      videoUrl: payload.videoUrl,
      pitchDeckUrl: payload.pitchDeckUrl || existing?.pitchDeckUrl,
      techStack: payload.techStack.length > 0 ? payload.techStack : (existing?.techStack || []),
      status: "SUBMITTED", // Awaiting Judge Review
      buildProgress: 100,
      submittedAt: existing?.submittedAt || now,
      updatedAt: now,
    };

    if (index !== -1) {
      list[index] = updated;
    } else {
      list.unshift(updated);
    }
    saveStoredProjects(list);

    return { success: true, project: updated };
  },

  // Simulate or Record Judge Review submission (transitions to Finished/Completed)
  async recordJudgeSubmission(
    projectId: string,
    evaluation: Partial<ProjectEvaluation> & {
      overallScore: number;
      criteriaScores: ProjectCriteriaScores;
    }
  ): Promise<UserProject> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const list = getStoredProjects();
        const index = list.findIndex((p) => p.id === projectId);

        if (index === -1) {
          reject(new Error(`Project with ID ${projectId} not found`));
          return;
        }

        const now = new Date().toISOString();
        const fullEval: ProjectEvaluation = {
          id: evaluation.id || `eval-${Date.now()}`,
          projectId,
          projectTitle: evaluation.projectTitle || list[index].title,
          hackathonName: evaluation.hackathonName || list[index].hackathonName,
          teamName: evaluation.teamName || list[index].teamName,
          overallScore: evaluation.overallScore,
          criteriaScores: evaluation.criteriaScores,
          feedback: evaluation.feedback || "Evaluation completed.",
          evaluatedAt: evaluation.evaluatedAt || now,
          judgeName: evaluation.judgeName,
          judgeTitle: evaluation.judgeTitle,
        };

        const updated: UserProject = {
          ...list[index],
          status: "COMPLETED", // Finished!
          evaluation: fullEval,
          updatedAt: now,
        };

        list[index] = updated;
        saveStoredProjects(list);
        resolve(updated);
      }, 200);
    });
  },

  // Submit draft for Judge Review
  async submitProjectForReview(
    projectId: string,
    payload: SubmitProjectPayload
  ): Promise<UserProject> {
    const res = await this.submitProject(projectId, payload);
    return res.project;
  },

  // POST /api/v1/projects (Create new project draft)
  async createProject(payload: CreateProjectPayload): Promise<UserProject> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = getStoredProjects();
        const newId = `proj-${Date.now().toString(36)}`;
        const newProject: UserProject = {
          id: newId,
          title: payload.title.trim(),
          tagline: payload.tagline.trim(),
          description: payload.description?.trim() || "Initial project architecture and problem statement.",
          category: payload.category || "Technology",
          hackathonId: payload.hackathonId || "hck-global-ai",
          hackathonName: payload.hackathonName || "Ethio-Tech Summit 2024",
          teamName: payload.teamName || "Founding Team",
          teamMembersCount: 1,
          status: "DRAFT",
          buildProgress: 20,
          techStack: payload.techStack.length > 0 ? payload.techStack : ["Next.js", "Python", "FastAPI"],
          repoUrl: payload.repoUrl?.trim() || undefined,
          demoUrl: payload.demoUrl?.trim() || undefined,
          updatedAt: new Date().toISOString(),
          integrations: {
            github: {
              connected: !!payload.repoUrl,
              repo: payload.repoUrl ? payload.repoUrl.replace("https://github.com/", "") : undefined,
              branch: "main",
              lastSynced: "Never",
              syncStatus: "pending",
            },
            vercel: {
              connected: !!payload.demoUrl,
              deploymentUrl: payload.demoUrl,
              environment: "Preview",
              healthStatus: payload.demoUrl ? "healthy" : "offline",
            },
            storage: {
              connected: false,
            },
          },
        };

        const updatedList = [newProject, ...list];
        saveStoredProjects(updatedList);
        resolve(newProject);
      }, 250);
    });
  },

  // PUT /api/v1/projects/:id (Update project details)
  async updateProject(projectId: string, updates: Partial<UserProject>): Promise<UserProject> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const list = getStoredProjects();
        const index = list.findIndex((p) => p.id === projectId);
        if (index === -1) {
          reject(new Error(`Project ${projectId} not found`));
          return;
        }

        const updated: UserProject = {
          ...list[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        list[index] = updated;
        saveStoredProjects(list);
        resolve(updated);
      }, 200);
    });
  },

  // DELETE /api/v1/projects/:id
  async deleteProject(projectId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const list = getStoredProjects();
        const target = list.find((p) => p.id === projectId);

        // Strict business rule: Finished/Completed projects cannot be deleted!
        if (target && (target.status === "COMPLETED" || target.evaluation)) {
          reject(new Error("Finished projects cannot be deleted."));
          return;
        }

        markProjectDeleted(projectId);

        const filtered = list.filter((p) => p.id !== projectId);
        saveStoredProjects(filtered);

        // Also purge from participant submissions store if applicable
        if (typeof window !== "undefined") {
          try {
            const rawSub = localStorage.getItem("hodana_participant_submissions_v2");
            if (rawSub) {
              const subMap = JSON.parse(rawSub);
              if (subMap && typeof subMap === "object") {
                let modified = false;
                for (const key of Object.keys(subMap)) {
                  if (subMap[key]?.id === projectId) {
                    delete subMap[key];
                    modified = true;
                  }
                }
                if (modified) {
                  localStorage.setItem("hodana_participant_submissions_v2", JSON.stringify(subMap));
                }
              }
            }
          } catch {
            // ignore
          }
        }

        resolve(true);
      }, 250);
    });
  },

  // POST /api/v1/projects/:id/sync
  async syncProjectRepository(
    projectId: string
  ): Promise<{ success: boolean; lastSynced: string; commitsCount: number }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const list = getStoredProjects();
        const index = list.findIndex((p) => p.id === projectId);
        if (index === -1) {
          reject(new Error(`Project ${projectId} not found`));
          return;
        }

        const now = "Just now";
        const currentIntegrations = list[index].integrations || {};
        const updatedIntegrations: ProjectIntegrations = {
          ...currentIntegrations,
          github: {
            ...(currentIntegrations.github || { connected: true }),
            connected: true,
            lastSynced: now,
            syncStatus: "synced",
          },
        };

        list[index] = {
          ...list[index],
          integrations: updatedIntegrations,
          updatedAt: new Date().toISOString(),
        };

        saveStoredProjects(list);
        resolve({
          success: true,
          lastSynced: now,
          commitsCount: 14 + Math.floor(Math.random() * 8),
        });
      }, 700);
    });
  },

  // PATCH /api/v1/projects/:id/integrations
  async updateProjectIntegration(
    projectId: string,
    integrationKey: "github" | "vercel" | "storage",
    config: { connected: boolean; [key: string]: any }
  ): Promise<UserProject> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const list = getStoredProjects();
        const index = list.findIndex((p) => p.id === projectId);
        if (index === -1) {
          reject(new Error(`Project ${projectId} not found`));
          return;
        }

        const existingIntegrations = list[index].integrations || {};
        const updatedIntegrations: ProjectIntegrations = {
          ...existingIntegrations,
          [integrationKey]: {
            ...existingIntegrations[integrationKey],
            ...config,
          },
        };

        const updated: UserProject = {
          ...list[index],
          integrations: updatedIntegrations,
          updatedAt: new Date().toISOString(),
        };

        list[index] = updated;
        saveStoredProjects(list);
        resolve(updated);
      }, 350);
    });
  },

  // PATCH /api/v1/projects/:id/priority
  async toggleProjectPriority(projectId: string): Promise<UserProject> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const list = getStoredProjects();
        const index = list.findIndex((p) => p.id === projectId);
        if (index === -1) {
          reject(new Error(`Project ${projectId} not found`));
          return;
        }

        const nextPriority = !list[index].isPriority;
        // If toggling ON, reset other projects' isPriority so only one is main spotlight
        const updatedList = list.map((p, idx) => ({
          ...p,
          isPriority: idx === index ? nextPriority : nextPriority ? false : p.isPriority,
        }));

        saveStoredProjects(updatedList);
        resolve(updatedList[index]);
      }, 200);
    });
  },

  // Client-side Excel export helper (.xls compatible with MS Excel, Sheets, Numbers)
  exportProjectExcel(project: UserProject): void {
    if (typeof window === "undefined") return;

    const evalData = project.evaluation;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>HODANA Innovation Hub for Ethiopia</Author>
  <Title>${escapeXml(project.title)} - Project Dossier</Title>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#122622"/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Font ss:FontName="Segoe UI" ss:Size="15" ss:Bold="1" ss:Color="#0F6B5C"/>
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="SubtitleStyle">
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Italic="1" ss:Color="#57685F"/>
  </Style>
  <Style ss:ID="SectionHeader">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#0F6B5C"/>
   <Interior ss:Color="#E8F3F0" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="KeyCell">
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#122622"/>
   <Interior ss:Color="#F8FAF9" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D6E7E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D6E7E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D6E7E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D6E7E1"/>
   </Borders>
  </Style>
  <Style ss:ID="ValueCell">
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#122622"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D6E7E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D6E7E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D6E7E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D6E7E1"/>
   </Borders>
  </Style>
  <Style ss:ID="ScoreCell">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#B45309"/>
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D6E7E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D6E7E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D6E7E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D6E7E1"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="Project Dossier">
  <Table ss:DefaultColumnWidth="160">
   <Column ss:Width="180"/>
   <Column ss:Width="420"/>
   <Row ss:Height="28">
    <Cell ss:MergeAcross="1" ss:StyleID="TitleStyle"><Data ss:Type="String">HODANA Innovation Hub - Project Dossier</Data></Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="1" ss:StyleID="SubtitleStyle"><Data ss:Type="String">Exported on ${new Date().toLocaleDateString()} for Ethiopian Ecosystem Innovation Pipeline</Data></Cell>
   </Row>
   <Row ss:Height="12"></Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="1" ss:StyleID="SectionHeader"><Data ss:Type="String">1. Core Information &amp; Pipeline Status</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">Project Title</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="String">${escapeXml(project.title)}</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">Project Identifier</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="String">${escapeXml(project.id)}</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">Short Tagline</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="String">${escapeXml(project.tagline)}</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">Category / Domain</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="String">${escapeXml(project.category)}</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">Registered Hackathon</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="String">${escapeXml(project.hackathonName)} (ID: ${escapeXml(project.hackathonId)})</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">Team Name &amp; Size</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="String">${escapeXml(project.teamName)} (${project.teamMembersCount} members)</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">Pipeline Status</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="String">${escapeXml(project.status)}</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">Build Progress</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="Number">${project.buildProgress}</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">Tech Stack</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="String">${escapeXml(project.techStack.join(", "))}</Data></Cell>
   </Row>
   <Row ss:Height="40">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">Solution Description</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="String">${escapeXml(project.description)}</Data></Cell>
   </Row>
   <Row ss:Height="12"></Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="1" ss:StyleID="SectionHeader"><Data ss:Type="String">2. Verified Deliverables &amp; Deployment URLs</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">Source Code Repository</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="String">${escapeXml(project.repoUrl || "N/A")}</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">Live Web Application</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="String">${escapeXml(project.demoUrl || "N/A")}</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">Video Pitch Walkthrough</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="String">${escapeXml(project.videoUrl || "N/A")}</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">Pitch Deck PDF</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="String">${escapeXml(project.pitchDeckUrl || "N/A")}</Data></Cell>
   </Row>
   <Row ss:Height="12"></Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="1" ss:StyleID="SectionHeader"><Data ss:Type="String">3. Judge Evaluation &amp; Rubric Scores</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">Overall Score</Data></Cell>
    <Cell ss:StyleID="ScoreCell"><Data ss:Type="String">${evalData ? `${evalData.overallScore.toFixed(1)} / 10.0` : "Pending Evaluation"}</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">1. Innovation &amp; Originality</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="String">${evalData ? `${evalData.criteriaScores.innovation} / 10.0` : "N/A"}</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">2. Technical Execution</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="String">${evalData ? `${evalData.criteriaScores.technical} / 10.0` : "N/A"}</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">3. Design &amp; UX</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="String">${evalData ? `${evalData.criteriaScores.design} / 10.0` : "N/A"}</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">4. Impact &amp; Local Feasibility</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="String">${evalData ? `${evalData.criteriaScores.impact} / 10.0` : "N/A"}</Data></Cell>
   </Row>
   <Row ss:Height="30">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">Judge Notes &amp; Feedback</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="String">${escapeXml(evalData?.feedback || "Evaluation in progress.")}</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="KeyCell"><Data ss:Type="String">Evaluator Attribution</Data></Cell>
    <Cell ss:StyleID="ValueCell"><Data ss:Type="String">${escapeXml(evalData ? `${evalData.judgeName || "Senior Judge"} (${evalData.judgeTitle || "Evaluation Committee"})` : "N/A")}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], {
      type: "application/vnd.ms-excel;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_dossier.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Alias for backward compatibility
  exportProjectDossier(project: UserProject): void {
    this.exportProjectExcel(project);
  },
};

function escapeXml(str: any): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
