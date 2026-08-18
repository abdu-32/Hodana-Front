"use client";

import { authFetch } from "@/lib/api-client";

export type SubmissionStatus = "NOT_SUBMITTED" | "DRAFT" | "SUBMITTED" | "EVALUATED";

export interface TeamMemberAttribution {
  id: string;
  fullName: string;
  role: string;
  email: string;
  avatar?: string;
}

export interface PitchDeckFile {
  name: string;
  size: string;
  url: string;
  uploadedAt: string;
}

export interface ParticipantSubmission {
  id: string;
  hackathonId: string;
  hackathonName: string;
  teamId: string;
  teamName: string;
  userId: string;
  title: string;
  tagline: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  liveDemoUrl?: string;
  videoDemoUrl?: string;
  pitchDeckPdf?: PitchDeckFile;
  status: SubmissionStatus;
  averageScore?: number;
  evaluationsCount?: number;
  feedbackNotes?: string;
  teamMembers: TeamMemberAttribution[];
  submittedAt?: string;
  updatedAt: string;
}

export interface RegisteredHackathonOption {
  id: string;
  title: string;
  slug: string;
  teamId: string;
  teamName: string;
  teamMembers: TeamMemberAttribution[];
  submissionDeadline: string; // ISO date string
  locationMode: "online" | "in_person" | "hybrid";
  tracks?: string[];
}

const PARTICIPANT_SUBMISSIONS_STORAGE_KEY = "hodana_participant_submissions_v2";

export const DEFAULT_REGISTERED_HACKATHONS: RegisteredHackathonOption[] = [
  {
    id: "hck-ethio-green",
    title: "Ethio-Green Tech Challenge 2024",
    slug: "ethio-green-tech-challenge-2024",
    teamId: "team-solar-ethio",
    teamName: "SunHarvest Solutions",
    submissionDeadline: new Date(Date.now() + 1.5 * 86400000 + 14 * 3600000).toISOString(), // ~1d 14h from now
    locationMode: "hybrid",
    tracks: ["Clean Energy & IoT", "Smart Agriculture", "Circular Economy"],
    teamMembers: [
      { id: "usr-me", fullName: "Abebe Bekele (You)", role: "Team Lead & ML Engineer", email: "abebe@hodana.et" },
      { id: "usr-2", fullName: "Bethlehem Tadesse", role: "Full-Stack Developer", email: "bethlehem.t@gmail.com" },
      { id: "usr-3", fullName: "Dawit Haile", role: "Hardware / IoT Specialist", email: "dawit.haile@aau.edu.et" },
    ],
  },
  {
    id: "hck-agritech",
    title: "AgriTech Hack 2024",
    slug: "agritech-hack-2024",
    teamId: "team-agri-vision",
    teamName: "CropShield AI",
    submissionDeadline: new Date(Date.now() + 4 * 86400000).toISOString(),
    locationMode: "hybrid",
    tracks: ["Computer Vision & AI", "Supply Chain", "USSD Diagnostics"],
    teamMembers: [
      { id: "usr-me", fullName: "Abebe Bekele (You)", role: "Lead AI Engineer", email: "abebe@hodana.et" },
      { id: "usr-4", fullName: "Selamawit Kebede", role: "Backend Architect", email: "selam.kebede@tech.et" },
      { id: "usr-5", fullName: "Yonas Alemu", role: "UI/UX Designer", email: "yonas.alemu@design.et" },
      { id: "usr-6", fullName: "Kidus Melaku", role: "Agronomy Data Specialist", email: "kidus.m@agri.gov.et" },
    ],
  },
  {
    id: "hck-fintech",
    title: "FinTech Frontier Ethiopia",
    slug: "fintech-frontier",
    teamId: "team-chapa-micro",
    teamName: "BirrPay Wallet",
    submissionDeadline: new Date(Date.now() + 18 * 86400000).toISOString(),
    locationMode: "online",
    tracks: ["Micro-Payments", "Offline NFC", "Digital Lending"],
    teamMembers: [
      { id: "usr-me", fullName: "Abebe Bekele (You)", role: "Smart Contracts & Backend", email: "abebe@hodana.et" },
      { id: "usr-7", fullName: "Hanna Worku", role: "Mobile App Engineer", email: "hanna.w@gmail.com" },
    ],
  },
];

const INITIAL_PARTICIPANT_SUBMISSIONS: Record<string, ParticipantSubmission> = {
  "hck-agritech": {
    id: "sub-crop-101",
    hackathonId: "hck-agritech",
    hackathonName: "AgriTech Hack 2024",
    teamId: "team-agri-vision",
    teamName: "CropShield AI",
    userId: "usr-me",
    title: "CropShield AI - Satellite Crop Blight Detector",
    tagline: "Early disease detection for Ethiopian smallholder farmers using computer vision and edge AI.",
    description: `## Problem Statement
Smallholder crop diseases such as wheat rust and maize streak virus cause up to 40% annual yield loss across rural Ethiopia. Early diagnosis remains inaccessible due to agrarian isolation and slow laboratory testing.

## Proposed Solution: CropShield AI
CropShield AI combines multispectral satellite imagery with offline-capable mobile computer vision to instantly identify crop infections.

### Key Architecture
- **Inference Engine**: PyTorch Mobile running lightweight MobileNetV4 models quantized for low-end Android devices.
- **Backend**: FastAPI REST API hosted with Redis caching and PostgreSQL spatial extension (PostGIS).
- **Communication Bridge**: Ethio Telecom SMS/USSD fallback gateway for non-smartphone farmers.

## How to Test & Run
1. Clone the repository \`git clone https://github.com/cropshield/crop-vision-ai\`
2. Follow installation instructions in \`README.md\`
3. Try our live demo app or scan sample leaf images.`,
    techStack: ["Python", "FastAPI", "React", "PyTorch", "TailwindCSS", "PostgreSQL", "Docker"],
    githubUrl: "https://github.com/cropshield/crop-vision-ai",
    liveDemoUrl: "https://cropshield-ethiopia.vercel.app",
    videoDemoUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    pitchDeckPdf: {
      name: "CropShield_AI_Pitch_Deck_2024.pdf",
      size: "4.8 MB",
      url: "https://storage.hodana.et/decks/CropShield_AI_Pitch_Deck.pdf",
      uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    status: "SUBMITTED",
    averageScore: 9.4,
    evaluationsCount: 4,
    feedbackNotes: "Impressive edge-AI implementation and practical rural connectivity focus.",
    teamMembers: [
      { id: "usr-me", fullName: "Abebe Bekele (You)", role: "Lead AI Engineer", email: "abebe@hodana.et" },
      { id: "usr-4", fullName: "Selamawit Kebede", role: "Backend Architect", email: "selam.kebede@tech.et" },
      { id: "usr-5", fullName: "Yonas Alemu", role: "UI/UX Designer", email: "yonas.alemu@design.et" },
      { id: "usr-6", fullName: "Kidus Melaku", role: "Agronomy Data Specialist", email: "kidus.m@agri.gov.et" },
    ],
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
};

function getStoredSubmissionsMap(): Record<string, ParticipantSubmission> {
  if (typeof window === "undefined") return INITIAL_PARTICIPANT_SUBMISSIONS;
  try {
    const raw = localStorage.getItem(PARTICIPANT_SUBMISSIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_PARTICIPANT_SUBMISSIONS;
  } catch {
    return INITIAL_PARTICIPANT_SUBMISSIONS;
  }
}

function saveStoredSubmissionsMap(map: Record<string, ParticipantSubmission>) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PARTICIPANT_SUBMISSIONS_STORAGE_KEY, JSON.stringify(map));
    } catch (err) {
      console.error("Failed to persist participant submissions:", err);
    }
  }
}

export const participantSubmissionsClient = {
  // 1. Get List of Registered Hackathons for this Participant
  async getRegisteredHackathons(): Promise<RegisteredHackathonOption[]> {
    return DEFAULT_REGISTERED_HACKATHONS;
  },

  // 2. GET /api/participant/submissions?hackathonId={id}
  async getSubmissionForHackathon(hackathonId: string): Promise<ParticipantSubmission | null> {
    try {
      // Try backend endpoint
      const res = await authFetch<any>(`/submissions/hackathons/${hackathonId}/me`);
      if (res && res.id) {
        return {
          id: res.id,
          hackathonId,
          hackathonName: res.hackathon_title || "Hackathon",
          teamId: res.team_id || "team-1",
          teamName: res.team_name || "Team",
          userId: res.user_id || "usr-me",
          title: res.title || "",
          tagline: res.tagline || "",
          description: res.description || "",
          techStack: res.technologies || [],
          githubUrl: res.repo_link || "",
          liveDemoUrl: res.demo_url || "",
          videoDemoUrl: res.demo_video_url || "",
          pitchDeckPdf: res.attachment_urls?.[0]
            ? {
                name: "Pitch_Deck_Document.pdf",
                size: "3.2 MB",
                url: res.attachment_urls[0],
                uploadedAt: res.updated_at || new Date().toISOString(),
              }
            : undefined,
          status: res.is_finalized ? "SUBMITTED" : "DRAFT",
          teamMembers: [],
          submittedAt: res.submitted_at,
          updatedAt: res.updated_at || new Date().toISOString(),
        };
      }
    } catch (err) {
      // Fallback to local storage persistence
    }

    const map = getStoredSubmissionsMap();
    if (map[hackathonId]) {
      return map[hackathonId];
    }

    // If no existing submission draft exists, return a clean blank draft template
    const hackathon = DEFAULT_REGISTERED_HACKATHONS.find((h) => h.id === hackathonId);
    if (!hackathon) return null;

    return {
      id: `sub-${Date.now()}`,
      hackathonId: hackathon.id,
      hackathonName: hackathon.title,
      teamId: hackathon.teamId,
      teamName: hackathon.teamName,
      userId: "usr-me",
      title: "",
      tagline: "",
      description: "",
      techStack: [],
      githubUrl: "",
      liveDemoUrl: "",
      videoDemoUrl: "",
      status: "NOT_SUBMITTED",
      teamMembers: hackathon.teamMembers,
      updatedAt: new Date().toISOString(),
    };
  },

  // 3. POST /api/participant/submissions (Save Draft)
  async saveDraft(
    hackathonId: string,
    data: Partial<ParticipantSubmission>
  ): Promise<ParticipantSubmission> {
    const map = getStoredSubmissionsMap();
    const hackathon = DEFAULT_REGISTERED_HACKATHONS.find((h) => h.id === hackathonId);

    const existing = map[hackathonId] || {
      id: `sub-${Date.now()}`,
      hackathonId,
      hackathonName: hackathon?.title || "Hackathon",
      teamId: hackathon?.teamId || "team-1",
      teamName: hackathon?.teamName || "Team",
      userId: "usr-me",
      teamMembers: hackathon?.teamMembers || [],
    };

    const updated: ParticipantSubmission = {
      ...existing,
      ...data,
      status: "DRAFT",
      updatedAt: new Date().toISOString(),
    };

    map[hackathonId] = updated;
    saveStoredSubmissionsMap(map);

    // Also attempt backend synchronization asynchronously
    try {
      await authFetch(`/submissions/hackathons/${hackathonId}`, {
        method: "POST",
        body: JSON.stringify({
          title: updated.title,
          tagline: updated.tagline,
          description: updated.description,
          technologies: updated.techStack,
          repo_link: updated.githubUrl,
          demo_video_url: updated.videoDemoUrl,
          attachment_urls: updated.pitchDeckPdf ? [updated.pitchDeckPdf.url] : [],
        }),
      });
    } catch {}

    return updated;
  },

  // 4. POST /api/participant/submissions (Finalize Submission)
  async submitFinalProject(
    hackathonId: string,
    data: Partial<ParticipantSubmission>
  ): Promise<ParticipantSubmission> {
    const map = getStoredSubmissionsMap();
    const hackathon = DEFAULT_REGISTERED_HACKATHONS.find((h) => h.id === hackathonId);

    const existing = map[hackathonId] || {
      id: `sub-${Date.now()}`,
      hackathonId,
      hackathonName: hackathon?.title || "Hackathon",
      teamId: hackathon?.teamId || "team-1",
      teamName: hackathon?.teamName || "Team",
      userId: "usr-me",
      teamMembers: hackathon?.teamMembers || [],
    };

    const now = new Date().toISOString();
    const finalSubmission: ParticipantSubmission = {
      ...existing,
      ...data,
      status: "SUBMITTED",
      submittedAt: existing.submittedAt || now,
      updatedAt: now,
    };

    map[hackathonId] = finalSubmission;
    saveStoredSubmissionsMap(map);

    // Attempt backend upsert & finalize
    try {
      const res = await authFetch<any>(`/submissions/hackathons/${hackathonId}`, {
        method: "POST",
        body: JSON.stringify({
          title: finalSubmission.title,
          tagline: finalSubmission.tagline,
          description: finalSubmission.description,
          technologies: finalSubmission.techStack,
          repo_link: finalSubmission.githubUrl,
          demo_video_url: finalSubmission.videoDemoUrl,
          attachment_urls: finalSubmission.pitchDeckPdf ? [finalSubmission.pitchDeckPdf.url] : [],
        }),
      });
      if (res && res.id) {
        await authFetch(`/submissions/${res.id}/finalize`, { method: "POST" });
      }
    } catch {}

    return finalSubmission;
  },

  // 5. POST /api/participant/submissions/upload-pdf
  async uploadPitchDeckPdf(
    file: File,
    onProgress?: (progressPct: number) => void
  ): Promise<PitchDeckFile> {
    // Simulate upload progress
    if (onProgress) {
      onProgress(15);
      await new Promise((r) => setTimeout(r, 120));
      onProgress(45);
      await new Promise((r) => setTimeout(r, 150));
      onProgress(85);
      await new Promise((r) => setTimeout(r, 100));
      onProgress(100);
    }

    // Format file size nicely
    const bytes = file.size;
    const mb = bytes / (1024 * 1024);
    const sizeStr = mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;

    // Create a local blob or base64 URL
    const fileUrl = URL.createObjectURL(file);

    return {
      name: file.name,
      size: sizeStr,
      url: fileUrl,
      uploadedAt: new Date().toISOString(),
    };
  },
};
