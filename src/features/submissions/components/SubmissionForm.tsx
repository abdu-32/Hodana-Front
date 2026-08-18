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
  Code2,
  HelpCircle,
  Eye,
  FileEdit,
  Sparkles,
  Lock,
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

  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

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
      });
      onSaved(updated);
    } catch (err: any) {
      setValidationError(err?.message || "Failed to save draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

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
        }
      );
      onSubmitted(submitted);
    } catch (err: any) {
      setValidationError(err?.message || "Failed to submit project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleOpenSubmitModal} className="flex flex-col gap-8">
      {/* Validation alert if any */}
      {validationError && (
        <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-bold text-red-700 shadow-xs">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

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

      {/* Card 3: Team & Collaborators Attribution */}
      <div className="rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f3f0] text-[#0f6b5c] font-display font-extrabold text-sm border border-[#d6e7e1]">
              3
            </span>
            <div>
              <h3 className="text-base font-extrabold text-[#122622]">
                Team & Collaborators Attribution
              </h3>
              <p className="text-xs font-medium text-[#57685f]">
                Registered squad members credited for this project submission.
              </p>
            </div>
          </div>
          <span className="rounded-xl bg-[#e8f3f0] px-3 py-1 text-xs font-extrabold text-[#0f6b5c] border border-[#d6e7e1]">
            {hackathon.teamName}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hackathon.teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-2xl bg-[#f3f6f4] p-3.5 border border-[#d6e7e1]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f6b5c] text-xs font-extrabold text-white shadow-xs">
                {member.fullName[0]}
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-xs font-bold text-[#122622] truncate">{member.fullName}</p>
                <p className="text-[11px] font-medium text-[#57685f] truncate">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#d6e7e1] bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#57685f]">
          <Sparkles className="h-4 w-4 text-[#c68a00]" />
          <span>You can update deliverables any time prior to the official hackathon deadline.</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Save Draft Button */}
          <button
            type="button"
            disabled={isSavingDraft || isSubmitting}
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#d6e7e1] bg-white px-5 py-3 text-xs font-extrabold text-[#0f6b5c] hover:bg-[#e8f3f0] transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSavingDraft ? "Saving..." : "Save Draft"}</span>
          </button>

          {/* Submit Final Project Button */}
          <button
            type="submit"
            disabled={isSavingDraft || isSubmitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-6 py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#0b5347] transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span>{isSubmitting ? "Submitting..." : "Submit Final Project"}</span>
          </button>
        </div>
      </div>

      {/* Final Submission Confirmation Modal */}
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
                Deliverables Attached:
              </div>
              <ul className="list-disc list-inside text-[11px] text-[#57685f] pl-1">
                {githubUrl && <li>GitHub: {githubUrl}</li>}
                {liveDemoUrl && <li>Live Demo: {liveDemoUrl}</li>}
                {pitchDeckPdf && <li>Pitch Deck: {pitchDeckPdf.name} ({pitchDeckPdf.size})</li>}
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
