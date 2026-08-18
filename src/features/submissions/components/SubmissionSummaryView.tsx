"use client";

import {
  Globe,
  Video,
  FileText,
  Edit3,
  CheckCircle2,
  Clock,
  Award,
  Users,
  Code2,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}
import { ParticipantSubmission } from "../lib/participant-submissions-client";

interface SubmissionSummaryViewProps {
  submission: ParticipantSubmission;
  deadline: string;
  onEdit: () => void;
}

export function SubmissionSummaryView({
  submission,
  deadline,
  onEdit,
}: SubmissionSummaryViewProps) {
  const isDeadlinePassed = new Date(deadline).getTime() < Date.now();

  const getStatusBadge = () => {
    switch (submission.status) {
      case "EVALUATED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-extrabold text-purple-700 border border-purple-200 shadow-xs">
            <Award className="h-3.5 w-3.5" />
            Evaluated ({submission.averageScore ? `${submission.averageScore.toFixed(1)}/10` : "Complete"})
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 border border-emerald-200 shadow-xs">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Submitted (Pending Evaluation)
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700 border border-amber-200 shadow-xs">
            <Clock className="h-3.5 w-3.5" />
            Draft (Saved)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-extrabold text-gray-700">
            Not Submitted
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Submitted Project Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-8 shadow-sm">
        {/* Subtle background glow */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#e8f3f0]/70 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1 rounded-xl bg-[#e8f3f0] px-2.5 py-1 text-[11px] font-extrabold text-[#0f6b5c] border border-[#d6e7e1]">
                  <Sparkles className="h-3 w-3" />
                  {submission.hackathonName}
                </span>
                {getStatusBadge()}
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#122622]">
                {submission.title || "Untitled Project"}
              </h2>

              {submission.tagline && (
                <p className="text-sm font-medium text-[#57685f] leading-relaxed">
                  {submission.tagline}
                </p>
              )}
            </div>

            {/* Edit Deliverables Button */}
            {!isDeadlinePassed && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#0b5347] transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Deliverables</span>
              </button>
            )}
          </div>

          {/* Quick-Access Launch Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#d6e7e1]">
            {submission.githubUrl && (
              <a
                href={submission.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0e2b25] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#123b32] transition-all"
              >
                <GithubIcon className="h-4 w-4" />
                <span>View GitHub Repo</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-gray-400" />
              </a>
            )}

            {submission.liveDemoUrl && (
              <a
                href={submission.liveDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#e8f3f0] text-[#0f6b5c] border border-[#d6e7e1] px-4 py-2.5 text-xs font-bold hover:bg-[#d6e7e1] transition-all"
              >
                <Globe className="h-4 w-4" />
                <span>Open Live App</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}

            {submission.videoDemoUrl && (
              <a
                href={submission.videoDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 px-4 py-2.5 text-xs font-bold hover:bg-amber-100 transition-all"
              >
                <Video className="h-4 w-4 text-[#c68a00]" />
                <span>Watch Demo Video</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#c68a00]" />
              </a>
            )}

            {submission.pitchDeckPdf && (
              <a
                href={submission.pitchDeckPdf.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-red-50 text-red-700 border border-red-200 px-4 py-2.5 text-xs font-bold hover:bg-red-100 transition-all"
              >
                <FileText className="h-4 w-4 text-[#c4211c]" />
                <span>Download Pitch Deck ({submission.pitchDeckPdf.size})</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#c4211c]" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Description & Deliverables Metadata */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Project Description */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-7 shadow-xs">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#122622] mb-4">
              <Layers className="h-4 w-4 text-[#0f6b5c]" />
              Project Architecture & Description
            </h3>

            <div className="prose max-w-none text-xs leading-relaxed text-[#57685f] whitespace-pre-wrap">
              {submission.description || "No detailed description provided."}
            </div>
          </div>

          {/* Tech Stack Chips */}
          {submission.techStack && submission.techStack.length > 0 && (
            <div className="rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-7 shadow-xs">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#122622] mb-3">
                <Code2 className="h-4 w-4 text-[#0f6b5c]" />
                Technologies & Tools
              </h3>
              <div className="flex flex-wrap gap-2">
                {submission.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center rounded-xl bg-[#e8f3f0] border border-[#d6e7e1] px-3 py-1 text-xs font-bold text-[#0f6b5c]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Team & Evaluation Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Judging Evaluation Scorecard if available */}
          {submission.status === "EVALUATED" && submission.averageScore && (
            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-6 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-extrabold mb-3">
                <Award className="h-4 w-4 text-[#16793d]" />
                Judging Panel Evaluation
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-display text-4xl font-extrabold text-[#122622]">
                  {submission.averageScore.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-[#16793d]">/ 10.0 Average Score</span>
              </div>
              <p className="text-[11px] font-medium text-[#57685f] leading-relaxed">
                Evaluated by {submission.evaluationsCount || 3} verified industry judges.
              </p>
              {submission.feedbackNotes && (
                <div className="mt-3 rounded-2xl bg-white p-3 border border-emerald-100 text-xs font-medium text-[#57685f] italic">
                  &ldquo;{submission.feedbackNotes}&rdquo;
                </div>
              )}
            </div>
          )}

          {/* Team Attribution Card */}
          <div className="rounded-3xl border border-[#d6e7e1] bg-white p-6 shadow-xs">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#122622] mb-4">
              <Users className="h-4 w-4 text-[#0f6b5c]" />
              Team: {submission.teamName || "Registered Squad"}
            </h3>

            <div className="flex flex-col gap-3">
              {submission.teamMembers && submission.teamMembers.length > 0 ? (
                submission.teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-[#f3f6f4] p-3 border border-[#d6e7e1]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0f6b5c] text-xs font-extrabold text-white">
                        {member.fullName[0]}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-xs font-bold text-[#122622] truncate">{member.fullName}</p>
                        <p className="text-[11px] font-medium text-[#57685f] truncate">{member.role}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">Team members attached to submission.</p>
              )}
            </div>
          </div>

          {/* Submission Timestamp Meta */}
          <div className="rounded-3xl border border-[#d6e7e1] bg-[#f3f6f4] p-5 text-xs text-[#57685f] flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold text-[#122622]">
              <Calendar className="h-4 w-4 text-[#0f6b5c]" />
              Submission Log
            </div>
            {submission.submittedAt && (
              <p>Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
            )}
            <p>Last Saved: {new Date(submission.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
