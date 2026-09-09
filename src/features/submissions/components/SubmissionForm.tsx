"use client";

import { useState, FormEvent } from "react";
import {
  Globe,
  Video,
  FileText,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  Users,
  Eye,
  FileEdit,
  Sparkles,
  UserPlus,
  Pencil,
  Trash2,
  X,
  Check,
  Briefcase,
  UserCheck,
} from "lucide-react";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

import {
  ParticipantSubmission,
  PitchDeckFile,
  RegisteredHackathonOption,
  TeamMemberAttribution,
  participantSubmissionsClient,
} from "../lib/participant-submissions-client";
import { TechStackTagInput } from "./TechStackTagInput";
import { PdfUploadDropzone } from "./PdfUploadDropzone";

interface SubmissionFormProps {
  hackathon: RegisteredHackathonOption;
  initialSubmission?: ParticipantSubmission | null;
  onSaved: (submission: ParticipantSubmission) => void;
  onSubmitted: (submission: ParticipantSubmission) => void;
}

const ROLE_SUGGESTIONS = [
  "Lead AI / ML Engineer",
  "Full-Stack Developer",
  "Backend Architect",
  "UI/UX Designer",
  "Mobile App Specialist",
  "Hardware / IoT Lead",
  "Agronomy Advisor",
  "External Mentor",
];

export function SubmissionForm({
  hackathon,
  initialSubmission,
  onSaved,
  onSubmitted,
}: SubmissionFormProps) {
  const [title, setTitle] = useState(initialSubmission?.title || "");
  const [tagline, setTagline] = useState(initialSubmission?.tagline || "");
  const [techStack, setTechStack] = useState<string[]>(
    initialSubmission?.techStack || ["Python", "FastAPI", "React"]
  );
  const [description, setDescription] = useState(
    initialSubmission?.description || ""
  );
  const [githubUrl, setGithubUrl] = useState(initialSubmission?.githubUrl || "");
  const [liveDemoUrl, setLiveDemoUrl] = useState(
    initialSubmission?.liveDemoUrl || ""
  );
  const [videoDemoUrl, setVideoDemoUrl] = useState(
    initialSubmission?.videoDemoUrl || ""
  );
  const [pitchDeckPdf, setPitchDeckPdf] = useState<PitchDeckFile | undefined>(
    initialSubmission?.pitchDeckPdf
  );

  // Contributor / Team Member State
  const [teamMembers, setTeamMembers] = useState<TeamMemberAttribution[]>(() => {
    if (initialSubmission?.teamMembers && initialSubmission.teamMembers.length > 0) {
      return initialSubmission.teamMembers;
    }
    return hackathon.teamMembers || [];
  });

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberAttribution | null>(null);
  const [memberFullName, setMemberFullName] = useState("");
  const [memberRole, setMemberRole] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberIsCollaborator, setMemberIsCollaborator] = useState(false);
  const [memberFormError, setMemberFormError] = useState<string | null>(null);

  const [deleteTargetMember, setDeleteTargetMember] = useState<TeamMemberAttribution | null>(null);

  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Open Add Contributor Modal
  const handleOpenAddModal = () => {
    setEditingMember(null);
    setMemberFullName("");
    setMemberRole("");
    setMemberEmail("");
    setMemberIsCollaborator(false);
    setMemberFormError(null);
    setIsAddEditModalOpen(true);
  };

  // Open Edit Contributor Modal
  const handleOpenEditModal = (member: TeamMemberAttribution) => {
    setEditingMember(member);
    setMemberFullName(member.fullName);
    setMemberRole(member.role);
    setMemberEmail(member.email || "");
    setMemberIsCollaborator(!!member.isCollaborator);
    setMemberFormError(null);
    setIsAddEditModalOpen(true);
  };

  // Save Add/Edit Contributor
  const handleSaveMember = (e: FormEvent) => {
    e.preventDefault();
    setMemberFormError(null);

    if (!memberFullName.trim()) {
      setMemberFormError("Full name is required.");
      return;
    }
    if (!memberRole.trim()) {
      setMemberFormError("Role or contribution title is required.");
      return;
    }
    if (memberEmail.trim() && !memberEmail.includes("@")) {
      setMemberFormError("Please enter a valid email address.");
      return;
    }

    if (editingMember) {
      // Update existing
      setTeamMembers((prev) =>
        prev.map((m) =>
          m.id === editingMember.id
            ? {
                ...m,
                fullName: memberFullName.trim(),
                role: memberRole.trim(),
                email: memberEmail.trim(),
                isCollaborator: memberIsCollaborator,
              }
            : m
        )
      );
    } else {
      // Add new
      const newContributor: TeamMemberAttribution = {
        id: `contributor-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        fullName: memberFullName.trim(),
        role: memberRole.trim(),
        email: memberEmail.trim(),
        isCollaborator: memberIsCollaborator,
      };
      setTeamMembers((prev) => [...prev, newContributor]);
    }

    setIsAddEditModalOpen(false);
  };

  // Confirm Delete Contributor
  const handleConfirmDeleteMember = () => {
    if (deleteTargetMember) {
      setTeamMembers((prev) => prev.filter((m) => m.id !== deleteTargetMember.id));
      setDeleteTargetMember(null);
    }
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setValidationError(null);
    setIsSavingDraft(true);

    try {
      const updated = await participantSubmissionsClient.saveDraft(hackathon.id, {
        title,
        tagline,
        techStack,
        description,
        githubUrl,
        liveDemoUrl,
        videoDemoUrl,
        pitchDeckPdf,
        teamMembers,
      });
      onSaved(updated);
    } catch (err: any) {
      setValidationError(err?.message || "Failed to save draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Final Submit Modal Trigger
  const handleOpenSubmitModal = (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate required fields for final submission
    if (!title.trim()) {
      setValidationError("Project Title is required.");
      return;
    }
    if (!githubUrl.trim() && !liveDemoUrl.trim() && !pitchDeckPdf) {
      setValidationError(
        "At least one core deliverable is required (GitHub Repository, Live Demo URL, or Pitch Deck PDF)."
      );
      return;
    }
    if (githubUrl.trim() && !githubUrl.includes("github.com")) {
      setValidationError("Please enter a valid GitHub repository URL (e.g. https://github.com/username/repo).");
      return;
    }

    setShowConfirmModal(true);
  };

  // Confirm Final Submit
  const handleConfirmFinalSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const submitted = await participantSubmissionsClient.submitFinalProject(
        hackathon.id,
        {
          title,
          tagline,
          techStack,
          description,
          githubUrl,
          liveDemoUrl,
          videoDemoUrl,
          pitchDeckPdf,
          teamMembers,
        }
      );
      onSubmitted(submitted);
    } catch (err: any) {
      setValidationError(err?.message || "Failed to submit project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deliverables completeness calculation
  const coreDeliverablesCount = [
    !!title.trim(),
    !!tagline.trim(),
    techStack.length > 0,
    !!description.trim(),
    !!githubUrl.trim(),
    !!liveDemoUrl.trim() || !!videoDemoUrl.trim(),
    !!pitchDeckPdf,
    teamMembers.length > 0,
  ].filter(Boolean).length;

  const progressPercent = Math.round((coreDeliverablesCount / 8) * 100);

  const squadMembersCount = teamMembers.filter((m) => !m.isCollaborator).length;
  const collaboratorsCount = teamMembers.filter((m) => m.isCollaborator).length;

  return (
    <form onSubmit={handleOpenSubmitModal} className="flex flex-col gap-8">
      {/* Validation alert if any */}
      {validationError && (
        <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-bold text-red-700 shadow-xs animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Two-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT MAIN CONTENT: DELIVERABLES FORM (lg:col-span-8) ================= */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Card 1: Basic Project Information */}
          <div className="rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f3f0] text-[#0f6b5c] font-display font-extrabold text-sm border border-[#d6e7e1]">
                  1
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-[#122622]">
                    Basic Project Information
                  </h3>
                  <p className="text-xs font-medium text-[#57685f]">
                    Introduce your project title, brief summary, and underlying technical stack.
                  </p>
                </div>
              </div>
            </div>

            {/* Project Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-[#122622]">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CropShield AI"
                className="h-12 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] px-4 text-xs font-bold text-[#122622] outline-none focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#e8f3f0] transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Short Tagline / Summary */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-[#122622]">
                Short Tagline / Summary
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Explain the core solution in one compelling sentence..."
                className="h-12 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] px-4 text-xs font-bold text-[#122622] outline-none focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#e8f3f0] transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Tech Stack Multi-Tag Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-[#122622]">
                Tech Stack / Technologies Used
              </label>
              <TechStackTagInput
                tags={techStack}
                onChange={setTechStack}
                placeholder="Type technology and press Enter (e.g. Python, React, PyTorch)..."
              />
            </div>

            {/* Detailed Description with Tabbed Preview */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#122622]">
                  Detailed Project Description & Architecture
                </label>
                <div className="flex items-center rounded-xl bg-gray-100 p-1 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("write")}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
                      activeTab === "write" ? "bg-white text-[#0f6b5c] shadow-xs" : "text-[#57685f]"
                    }`}
                  >
                    <FileEdit className="h-3 w-3" />
                    <span>Write (Markdown)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
                      activeTab === "preview" ? "bg-white text-[#0f6b5c] shadow-xs" : "text-[#57685f]"
                    }`}
                  >
                    <Eye className="h-3 w-3" />
                    <span>Live Preview</span>
                  </button>
                </div>
              </div>

              {activeTab === "write" ? (
                <textarea
                  rows={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the background problem, solution architecture, technical novelty, and step-by-step setup or evaluation instructions..."
                  className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#e8f3f0] transition-all placeholder:text-gray-400 resize-y leading-relaxed"
                />
              ) : (
                <div className="min-h-[190px] rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-5 text-xs text-[#57685f] leading-relaxed whitespace-pre-wrap">
                  {description ? (
                    description
                  ) : (
                    <span className="text-gray-400 italic">No description entered yet. Switch to &lsquo;Write&rsquo; tab to add content.</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Core Deliverable Links & Media */}
          <div className="rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f3f0] text-[#0f6b5c] font-display font-extrabold text-sm border border-[#d6e7e1]">
                  2
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-[#122622]">
                    Core Deliverable Links & Assets
                  </h3>
                  <p className="text-xs font-medium text-[#57685f]">
                    Provide your code repository, deployed prototype, demo video walkthrough, and pitch deck PDF.
                  </p>
                </div>
              </div>
            </div>

            {/* GitHub Repository URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-[#122622] flex items-center gap-1.5">
                <GithubIcon className="h-3.5 w-3.5 text-[#122622]" />
                GitHub Source Repository URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/repo-name"
                className="h-12 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] px-4 text-xs font-bold text-[#122622] outline-none focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#e8f3f0] transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Live Product / Demo URL & Video URL Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-[#122622] flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-[#0f6b5c]" />
                  Live Product / Demo Web App URL
                </label>
                <input
                  type="url"
                  value={liveDemoUrl}
                  onChange={(e) => setLiveDemoUrl(e.target.value)}
                  placeholder="https://project-demo.vercel.app"
                  className="h-12 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] px-4 text-xs font-bold text-[#122622] outline-none focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#e8f3f0] transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-[#122622] flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 text-[#c68a00]" />
                  Video Presentation / Walkthrough URL
                </label>
                <input
                  type="url"
                  value={videoDemoUrl}
                  onChange={(e) => setVideoDemoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or Loom"
                  className="h-12 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] px-4 text-xs font-bold text-[#122622] outline-none focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#e8f3f0] transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Pitch Deck PDF File Upload Dropzone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-[#122622] flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-[#c4211c]" />
                Pitch Deck / Documentation (PDF Upload)
              </label>
              <PdfUploadDropzone
                value={pitchDeckPdf}
                onChange={setPitchDeckPdf}
                maxSizeMB={25}
              />
            </div>
          </div>

          {/* Bottom Informational Notice */}
          <div className="flex items-center gap-3 rounded-3xl border border-[#d6e7e1] bg-white p-5 sm:p-6 shadow-xs text-xs font-semibold text-[#57685f]">
            <Sparkles className="h-4 w-4 text-[#c68a00] shrink-0" />
            <span>You can refine project deliverables and contributor attribution anytime before the official deadline. Use the actions panel in the sidebar to save your progress or submit.</span>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: SUBMISSION SIDEBAR (lg:col-span-4) ================= */}
        <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-6">
          {/* Deliverables Readiness Meter */}
          <div className="rounded-3xl border border-[#d6e7e1] bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#122622]">
                Deliverables Readiness
              </span>
              <span className="text-xs font-extrabold text-[#0f6b5c] bg-[#e8f3f0] px-2.5 py-0.5 rounded-xl border border-[#d6e7e1]">
                {progressPercent}% Complete
              </span>
            </div>
            {/* Progress Bar */}
            <div className="h-2 w-full rounded-full bg-[#f3f6f4] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0f6b5c] to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] font-medium text-[#57685f]">
              {progressPercent === 100
                ? "✨ All required deliverables and team members are ready to submit!"
                : "Attach title, repo or demo URL, and review attribution before submission."}
            </p>
          </div>

          {/* Submission Sidebar: Team & Collaborators Attribution Card */}
          <div className="rounded-3xl border border-[#d6e7e1] bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e8f3f0] text-[#0f6b5c] border border-[#d6e7e1]">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#122622]">
                    Team & Collaborators
                  </h4>
                  <p className="text-[11px] font-medium text-[#57685f]">
                    Attributed to {hackathon.teamName}
                  </p>
                </div>
              </div>

              {/* Add Member / Collaborator Button */}
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b5c] px-3 py-1.5 text-xs font-extrabold text-white shadow-xs hover:bg-[#0b5347] transition-all cursor-pointer"
                title="Add new member or collaborator"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Counts breakdown */}
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#57685f]">
              <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-emerald-800 border border-emerald-200">
                {squadMembersCount} Squad Member{squadMembersCount !== 1 ? "s" : ""}
              </span>
              <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-indigo-800 border border-indigo-200">
                {collaboratorsCount} Collaborator{collaboratorsCount !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Contributors List */}
            <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
              {teamMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-[#f8fafc] p-6 text-center">
                  <Users className="h-8 w-8 text-gray-400" />
                  <p className="text-xs font-bold text-[#122622]">No Contributors Yet</p>
                  <p className="text-[11px] text-[#57685f]">
                    Add your team members and external collaborators to credit them.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="mt-1 inline-flex items-center gap-1 rounded-xl bg-[#0f6b5c] px-3 py-1.5 text-xs font-extrabold text-white shadow-xs hover:bg-[#0b5347] cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Add First Contributor</span>
                  </button>
                </div>
              ) : (
                teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="group relative flex items-start justify-between gap-3 rounded-2xl bg-[#f3f6f4] p-3.5 border border-[#d6e7e1] hover:border-[#0f6b5c]/40 hover:bg-white hover:shadow-xs transition-all"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold text-white shadow-xs ${
                          member.isCollaborator ? "bg-indigo-600" : "bg-[#0f6b5c]"
                        }`}
                      >
                        {member.fullName[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-bold text-[#122622] truncate">
                            {member.fullName}
                          </p>
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold border ${
                              member.isCollaborator
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                : "bg-[#e8f3f0] text-[#0f6b5c] border-[#d6e7e1]"
                            }`}
                          >
                            {member.isCollaborator ? "Collaborator" : "Member"}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-[#57685f] truncate">
                          {member.role}
                        </p>
                        {member.email && (
                          <p className="text-[10px] text-gray-400 truncate">
                            {member.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(member)}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-200 hover:text-[#0f6b5c] transition-colors cursor-pointer"
                        title={`Edit ${member.fullName}`}
                        aria-label={`Edit ${member.fullName}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetMember(member)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                        title={`Remove ${member.fullName}`}
                        aria-label={`Remove ${member.fullName}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Submission Actions Widget in Sidebar */}
          <div className="rounded-3xl border border-[#d6e7e1] bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-3">
            <h4 className="text-xs font-extrabold text-[#122622]">
              Submission Actions
            </h4>
            <p className="text-[11px] font-medium text-[#57685f]">
              Save draft to continue later, or submit deliverables directly for judges.
            </p>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="submit"
                disabled={isSavingDraft || isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#0f6b5c] py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#0b5347] transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? "Submitting..." : "Submit Final Project"}</span>
              </button>

              <button
                type="button"
                disabled={isSavingDraft || isSubmitting}
                onClick={handleSaveDraft}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-[#d6e7e1] bg-white py-2.5 text-xs font-extrabold text-[#0f6b5c] hover:bg-[#e8f3f0] transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isSavingDraft ? "Saving..." : "Save Draft"}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ================= MODAL: ADD / EDIT CONTRIBUTOR ================= */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="flex w-full max-w-lg flex-col gap-5 rounded-3xl bg-white p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 border border-[#d6e7e1]">
            <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c] border border-[#d6e7e1]">
                  {editingMember ? <Pencil className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-[#122622]">
                    {editingMember ? "Edit Contributor Attribution" : "Add Contributor Attribution"}
                  </h4>
                  <p className="text-xs font-medium text-[#57685f]">
                    {editingMember
                      ? "Update member details credited on this submission."
                      : "Credit a team member or collaborator on this project."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {memberFormError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{memberFormError}</span>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {/* Attribution Type Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-[#122622]">
                  Attribution Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMemberIsCollaborator(false)}
                    className={`flex flex-col items-start gap-1 rounded-2xl p-3 text-left border transition-all cursor-pointer ${
                      !memberIsCollaborator
                        ? "border-[#0f6b5c] bg-[#e8f3f0] text-[#0f6b5c] shadow-xs"
                        : "border-gray-200 bg-[#f8fafc] text-[#57685f] hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Team Member</span>
                    </div>
                    <span className="text-[10px] opacity-80">
                      Core squad builder
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMemberIsCollaborator(true)}
                    className={`flex flex-col items-start gap-1 rounded-2xl p-3 text-left border transition-all cursor-pointer ${
                      memberIsCollaborator
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs"
                        : "border-gray-200 bg-[#f8fafc] text-[#57685f] hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>Collaborator</span>
                    </div>
                    <span className="text-[10px] opacity-80">
                      Advisor, mentor, external
                    </span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-[#122622]">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={memberFullName}
                  onChange={(e) => setMemberFullName(e.target.value)}
                  placeholder="e.g. Bethlehem Tadesse"
                  className="h-11 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] px-4 text-xs font-bold text-[#122622] outline-none focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#e8f3f0] transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Role / Contribution Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-[#122622]">
                  Role / Specialty <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  placeholder="e.g. Full-Stack Developer or Research Mentor"
                  className="h-11 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] px-4 text-xs font-bold text-[#122622] outline-none focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#e8f3f0] transition-all placeholder:text-gray-400"
                />

                {/* Quick Role Suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ROLE_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setMemberRole(suggestion)}
                      className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-[#57685f] hover:bg-[#e8f3f0] hover:text-[#0f6b5c] transition-colors cursor-pointer"
                    >
                      +{suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-[#122622]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="e.g. contributor@example.com"
                  className="h-11 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] px-4 text-xs font-bold text-[#122622] outline-none focus:border-[#0f6b5c] focus:ring-2 focus:ring-[#e8f3f0] transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#d6e7e1] pt-4">
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMember}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>{editingMember ? "Save Changes" : "Add Contributor"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deleteTargetMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="flex w-full max-w-md flex-col gap-5 rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-[#d6e7e1]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
              <Trash2 className="h-6 w-6" />
            </div>

            <div className="flex flex-col gap-1.5">
              <h4 className="text-base font-extrabold text-[#122622]">
                Remove Contributor?
              </h4>
              <p className="text-xs font-medium text-[#57685f] leading-relaxed">
                Are you sure you want to remove{" "}
                <span className="font-bold text-[#122622]">
                  {deleteTargetMember.fullName}
                </span>{" "}
                ({deleteTargetMember.role}) from this project&apos;s submission attribution?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#d6e7e1]">
              <button
                type="button"
                onClick={() => setDeleteTargetMember(null)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMember}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-red-700 transition-all cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Remove Contributor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: FINAL SUBMISSION CONFIRMATION ================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="flex w-full max-w-md flex-col gap-5 rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c] border border-[#d6e7e1]">
              <Send className="h-6 w-6" />
            </div>

            <div className="flex flex-col gap-1.5">
              <h4 className="text-base font-extrabold text-[#122622]">
                Confirm Project Submission
              </h4>
              <p className="text-xs font-medium text-[#57685f] leading-relaxed">
                Ready to submit <span className="font-bold text-[#122622]">&ldquo;{title || "your project"}&rdquo;</span> to the judging committee for <span className="font-bold text-[#0f6b5c]">{hackathon.title}</span>?
              </p>
            </div>

            <div className="rounded-2xl bg-[#f3f6f4] p-3.5 border border-[#d6e7e1] text-xs font-semibold text-[#57685f] flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-[#16793d] font-bold">
                <CheckCircle2 className="h-4 w-4" />
                Deliverables & Attribution Summary:
              </div>
              <ul className="list-disc list-inside text-[11px] text-[#57685f] pl-1">
                {githubUrl && <li>GitHub: {githubUrl}</li>}
                {liveDemoUrl && <li>Live Demo: {liveDemoUrl}</li>}
                {pitchDeckPdf && <li>Pitch Deck: {pitchDeckPdf.name} ({pitchDeckPdf.size})</li>}
                <li>Contributors Credited: {teamMembers.length} ({squadMembersCount} squad, {collaboratorsCount} collaborator{collaboratorsCount !== 1 ? "s" : ""})</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmFinalSubmit}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Yes, Submit Deliverables</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
