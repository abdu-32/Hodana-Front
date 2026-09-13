"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  GraduationCap,
  Briefcase,
  Globe,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Edit3,
  ExternalLink,
  Share2,
  Trophy,
  Rocket,
  Award,
  Zap,
  Code,
  FolderGit2,
  ShieldCheck,
  Check,
} from "lucide-react";
import { useSession } from "@/features/auth";
import { useToast } from "@/components/ui";
import { EditProfileModal } from "./EditProfileModal";
import type { UserProfile } from "@/lib/api-types-helpers";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

interface ParticipantProfileViewProps {
  initialTab?: "overview" | "portfolio" | "hackathons";
}

export function ParticipantProfileView({
  initialTab = "overview",
}: ParticipantProfileViewProps) {
  const t = useTranslations("Portfolio");
  const { user } = useSession();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"overview" | "portfolio" | "hackathons">(
    initialTab
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Cast user data for extended fields
  const u = (user || {}) as any;

  const fullName = user?.fullName || "Alex Rivera";
  const firstName = fullName.split(" ")[0];
  const userInitial = firstName.charAt(0).toUpperCase();
  const email = user?.email || "innovator@hodana.org";
  const phone = u.phoneNumber || "+251 91 234 5678";
  const city = u.city || "Addis Ababa";
  const country = u.country || "ET";
  const organization = u.organization || "AAU Innovation Hub";
  const university = u.university || "Addis Ababa University";
  const department = u.department || "Software Engineering";
  const fieldOfStudy = u.fieldOfStudy || "Computer Science";
  const profession = u.profession || u.role || "Full-Stack Architect";
  const professionalTitle =
    u.professionalTitle || "Senior Full-Stack Architect & Product Innovator";
  const experienceLevel = u.experienceLevel || "Intermediate (3-5 yrs)";
  const yearsOfExperience = u.yearsOfExperience ?? 4;
  const bio =
    user?.bio ||
    "Passionate software architect and product builder focused on scalable African fintech, AI tools, and civic technology. Enthusiastic about hackathons and cross-functional team collaboration.";
  const skills: string[] =
    user?.skills && user.skills.length > 0
      ? user.skills
      : ["React", "Next.js", "TypeScript", "Python", "Django", "PostgreSQL", "Tailwind CSS", "Docker", "AI / ML"];

  const linkedinUrl = u.linkedinUrl || "https://linkedin.com";
  const githubUrl = u.githubUrl || "https://github.com";
  const websiteUrl = u.websiteUrl || user?.portfolioUrl || "https://hodana.org";
  const twitterUrl = u.twitterUrl || "";
  const instagramUrl = u.instagramUrl || "";

  const interestedInTeams = u.interestedInTeams || "yes";
  const lookingForTeammates = u.lookingForTeammates ?? true;
  const teamSeekingDescription =
    u.teamSeekingDescription ||
    "Looking for passionate UI/UX designers and backend developers to collaborate on fintech & AI solutions for Ethiopian communities.";
  const preferredTeamRoles: string[] =
    u.preferredTeamRoles && u.preferredTeamRoles.length > 0
      ? u.preferredTeamRoles
      : ["Full-Stack Developer", "Backend Developer", "Team Lead"];

  // Profile Completion Calculation
  const completionChecks = [
    { label: "Profile Name & Email", complete: Boolean(fullName && email), weight: 10 },
    { label: "Phone Number", complete: Boolean(u.phoneNumber), weight: 10 },
    { label: "Location (City & Country)", complete: Boolean(u.city && u.country), weight: 10 },
    { label: "Education / University", complete: Boolean(u.university), weight: 10 },
    { label: "Organization / Workplace", complete: Boolean(u.organization), weight: 10 },
    { label: "Professional Role & Title", complete: Boolean(u.profession || u.professionalTitle), weight: 15 },
    { label: "Biography / About", complete: Boolean(user?.bio && user.bio.length > 10), weight: 15 },
    { label: "Skills (3+ added)", complete: Boolean(skills.length >= 3), weight: 10 },
    { label: "Social Links (LinkedIn / GitHub)", complete: Boolean(u.linkedinUrl || u.githubUrl), weight: 5 },
    { label: "Team Preferences", complete: Boolean(preferredTeamRoles.length > 0), weight: 5 },
  ];

  const totalScore = completionChecks.reduce(
    (acc, cur) => (cur.complete ? acc + cur.weight : acc),
    0
  );
  const completionPercentage = Math.min(100, Math.max(10, totalScore));

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("Profile link copied to clipboard!", "success");
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= 1. PROFILE HEADER CARD ================= */}
      <div className="relative overflow-hidden rounded-2xl border border-[#d6e7e1] bg-white p-4 sm:p-8 shadow-xs">
        {/* Background gradient decor */}
        <div className="absolute top-0 right-0 h-40 w-96 bg-gradient-to-bl from-[#e8f3f0] to-transparent pointer-events-none rounded-bl-full opacity-70" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Avatar & Identifiers */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={fullName}
                  className="h-24 w-24 rounded-2xl object-cover border-2 border-[#0f6b5c] shadow-md"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f6b5c] to-[#0a483e] text-3xl font-extrabold text-white shadow-md">
                  {userInitial}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#10b981] text-white ring-2 ring-white" title="Verified Participant">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#122622]">
                  {fullName}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f3f0] px-3 py-0.5 text-xs font-bold text-[#0f6b5c] border border-[#c4ded4]">
                  <Sparkles className="h-3 w-3" />
                  Innovator Level 4
                </span>
                {lookingForTeammates && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3c7] px-2.5 py-0.5 text-xs font-semibold text-[#92400e] border border-[#fde68a]">
                    <Users className="h-3 w-3" />
                    Open to Teams
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-[#0f6b5c]">
                {professionalTitle}
              </p>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-medium text-[#57685f]">
                <span className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-[#798e85]" />
                  {organization || university}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#798e85]" />
                  {city}, {country}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-[#798e85]" />
                  {email}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 rounded-xl border border-[#d6e7e1] bg-white px-4 py-2.5 text-xs font-bold text-[#122622] hover:bg-[#f8faf9] transition-all shadow-2xs cursor-pointer"
            >
              <Share2 className="h-4 w-4 text-[#57685f]" />
              Share
            </button>

            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0d594c] transition-all cursor-pointer"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* ================= 2. PROFILE COMPLETION METER ================= */}
      <div className="rounded-2xl border border-[#d6e7e1] bg-gradient-to-r from-white via-[#fcfefd] to-[#f4f9f7] p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8f3f0] text-[#0f6b5c] font-bold text-xs">
                {completionPercentage}%
              </span>
              <h3 className="text-sm font-bold text-[#122622]">
                Profile Strength & Readiness
              </h3>
            </div>
            <p className="text-xs text-[#57685f] mt-0.5">
              Complete your profile details so hackathon organizers and teammates have accurate credentials.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="text-xs font-bold text-[#0f6b5c] hover:underline self-start sm:self-auto cursor-pointer"
          >
            + Complete Missing Fields →
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 w-full rounded-full bg-[#e2ece7] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0f6b5c] to-[#10b981] transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Dynamic Checklist Pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {completionChecks.map((item, idx) => (
            <span
              key={idx}
              onClick={() => !item.complete && setIsEditModalOpen(true)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition-all ${
                item.complete
                  ? "bg-[#e8f3f0] text-[#0f6b5c] border-[#c4ded4]"
                  : "bg-white text-[#798e85] border-[#d6e7e1] hover:border-[#0f6b5c] hover:text-[#122622] cursor-pointer"
              }`}
            >
              {item.complete ? (
                <CheckCircle2 className="h-3 w-3 text-[#10b981]" />
              ) : (
                <AlertCircle className="h-3 w-3 text-[#f59e0b]" />
              )}
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* ================= 3. NAVIGATION TABS ================= */}
      <div className="flex border-b border-[#d6e7e1] gap-6 text-xs sm:text-sm font-bold overflow-x-auto no-scrollbar whitespace-nowrap">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`border-b-2 pb-3 transition-colors ${
            activeTab === "overview"
              ? "border-[#0f6b5c] text-[#0f6b5c]"
              : "border-transparent text-[#57685f] hover:text-[#122622]"
          }`}
        >
          Participant Information
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("portfolio")}
          className={`border-b-2 pb-3 transition-colors ${
            activeTab === "portfolio"
              ? "border-[#0f6b5c] text-[#0f6b5c]"
              : "border-transparent text-[#57685f] hover:text-[#122622]"
          }`}
        >
          Projects & Submissions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("hackathons")}
          className={`border-b-2 pb-3 transition-colors ${
            activeTab === "hackathons"
              ? "border-[#0f6b5c] text-[#0f6b5c]"
              : "border-transparent text-[#57685f] hover:text-[#122622]"
          }`}
        >
          Hackathons & Achievements
        </button>
      </div>

      {/* ================= 4. TAB CONTENT: OVERVIEW ================= */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* CARD 1: Biography / About */}
            <div className="rounded-2xl border border-[#d6e7e1] bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-[#0f6b5c]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#122622]">
                    About & Bio
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs font-semibold text-[#0f6b5c] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
              <p className="text-sm leading-relaxed text-[#57685f]">
                {bio}
              </p>
            </div>

            {/* CARD 2: Personal & Contact Information */}
            <div className="rounded-2xl border border-[#d6e7e1] bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-[#0f6b5c]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#122622]">
                    Personal & Contact Information
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs font-semibold text-[#0f6b5c] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#f8faf9] p-3.5 border border-[#e2ece7]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#798e85]">
                    Full Name
                  </p>
                  <p className="text-sm font-semibold text-[#122622] mt-0.5">{fullName}</p>
                </div>

                <div className="rounded-xl bg-[#f8faf9] p-3.5 border border-[#e2ece7]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#798e85]">
                    Account Email
                  </p>
                  <p className="text-sm font-semibold text-[#122622] mt-0.5">{email}</p>
                </div>

                <div className="rounded-xl bg-[#f8faf9] p-3.5 border border-[#e2ece7]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#798e85]">
                    Phone Number
                  </p>
                  <p className="text-sm font-semibold text-[#122622] mt-0.5">{phone}</p>
                </div>

                <div className="rounded-xl bg-[#f8faf9] p-3.5 border border-[#e2ece7]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#798e85]">
                    Location (City / Country)
                  </p>
                  <p className="text-sm font-semibold text-[#122622] mt-0.5">{city}, {country}</p>
                </div>
              </div>
            </div>

            {/* CARD 3: Education & Organization */}
            <div className="rounded-2xl border border-[#d6e7e1] bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="h-4 w-4 text-[#0f6b5c]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#122622]">
                    Education & Organization
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs font-semibold text-[#0f6b5c] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#f8faf9] p-3.5 border border-[#e2ece7]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#798e85]">
                    University / College
                  </p>
                  <p className="text-sm font-semibold text-[#122622] mt-0.5">
                    {university || "Not Specified"}
                  </p>
                </div>

                <div className="rounded-xl bg-[#f8faf9] p-3.5 border border-[#e2ece7]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#798e85]">
                    Organization / Company
                  </p>
                  <p className="text-sm font-semibold text-[#122622] mt-0.5">
                    {organization || "Not Specified"}
                  </p>
                </div>

                <div className="rounded-xl bg-[#f8faf9] p-3.5 border border-[#e2ece7]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#798e85]">
                    Department / Faculty
                  </p>
                  <p className="text-sm font-semibold text-[#122622] mt-0.5">
                    {department || "Not Specified"}
                  </p>
                </div>

                <div className="rounded-xl bg-[#f8faf9] p-3.5 border border-[#e2ece7]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#798e85]">
                    Field of Study / Major
                  </p>
                  <p className="text-sm font-semibold text-[#122622] mt-0.5">
                    {fieldOfStudy || "Not Specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 4: Professional & Experience */}
            <div className="rounded-2xl border border-[#d6e7e1] bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Briefcase className="h-4 w-4 text-[#0f6b5c]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#122622]">
                    Professional Credentials
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs font-semibold text-[#0f6b5c] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-[#f8faf9] p-3.5 border border-[#e2ece7]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#798e85]">
                    Primary Role
                  </p>
                  <p className="text-sm font-semibold text-[#122622] mt-0.5">{profession}</p>
                </div>

                <div className="rounded-xl bg-[#f8faf9] p-3.5 border border-[#e2ece7]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#798e85]">
                    Experience Level
                  </p>
                  <p className="text-sm font-semibold text-[#122622] mt-0.5">{experienceLevel}</p>
                </div>

                <div className="rounded-xl bg-[#f8faf9] p-3.5 border border-[#e2ece7]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#798e85]">
                    Years in Tech
                  </p>
                  <p className="text-sm font-semibold text-[#122622] mt-0.5">
                    {yearsOfExperience} {yearsOfExperience === 1 ? "Year" : "Years"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* CARD 5: Skills & Expertise */}
            <div className="rounded-2xl border border-[#d6e7e1] bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Code className="h-4 w-4 text-[#0f6b5c]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#122622]">
                    Skills & Tech Stack
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs font-semibold text-[#0f6b5c] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#e8f3f0] px-3 py-1.5 text-xs font-semibold text-[#0f6b5c] border border-[#c4ded4]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* CARD 6: Social & Online Presence */}
            <div className="rounded-2xl border border-[#d6e7e1] bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Globe className="h-4 w-4 text-[#0f6b5c]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#122622]">
                    Social & Profiles
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs font-semibold text-[#0f6b5c] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-2.5">
                {linkedinUrl && (
                  <a
                    href={linkedinUrl.startsWith("http") ? linkedinUrl : `https://${linkedinUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-[#e2ece7] bg-[#f8faf9] p-3 text-xs font-semibold text-[#122622] hover:bg-[#e8f3f0] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <LinkedinIcon className="h-4 w-4 text-[#0077b5]" />
                      LinkedIn Profile
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-[#798e85]" />
                  </a>
                )}

                {githubUrl && (
                  <a
                    href={githubUrl.startsWith("http") ? githubUrl : `https://${githubUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-[#e2ece7] bg-[#f8faf9] p-3 text-xs font-semibold text-[#122622] hover:bg-[#e8f3f0] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <GithubIcon className="h-4 w-4 text-[#122622]" />
                      GitHub Profile
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-[#798e85]" />
                  </a>
                )}

                {websiteUrl && (
                  <a
                    href={websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-[#e2ece7] bg-[#f8faf9] p-3 text-xs font-semibold text-[#122622] hover:bg-[#e8f3f0] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-[#0f6b5c]" />
                      Portfolio / Website
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-[#798e85]" />
                  </a>
                )}

                {twitterUrl && (
                  <a
                    href={twitterUrl.startsWith("http") ? twitterUrl : `https://${twitterUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-[#e2ece7] bg-[#f8faf9] p-3 text-xs font-semibold text-[#122622] hover:bg-[#e8f3f0] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <TwitterIcon className="h-4 w-4 text-[#1da1f2]" />
                      X (Twitter)
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-[#798e85]" />
                  </a>
                )}
              </div>
            </div>

            {/* CARD 7: Team Collaboration Preferences */}
            <div className="rounded-2xl border border-[#d6e7e1] bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-[#0f6b5c]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#122622]">
                    Team Preferences
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs font-semibold text-[#0f6b5c] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-[#f8faf9] p-3 border border-[#e2ece7]">
                  <span className="text-xs font-medium text-[#57685f]">Interested in Teams</span>
                  <span className="text-xs font-bold text-[#0f6b5c] capitalize">{interestedInTeams}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-[#f8faf9] p-3 border border-[#e2ece7]">
                  <span className="text-xs font-medium text-[#57685f]">Looking for Teammates</span>
                  <span className={`text-xs font-bold ${lookingForTeammates ? "text-emerald-600" : "text-gray-500"}`}>
                    {lookingForTeammates ? "Yes (Active)" : "No"}
                  </span>
                </div>

                {preferredTeamRoles.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#798e85] mb-2">
                      Preferred Roles
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {preferredTeamRoles.map((r) => (
                        <span
                          key={r}
                          className="rounded-md bg-[#e8f3f0] px-2 py-1 text-[11px] font-semibold text-[#0f6b5c]"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {teamSeekingDescription && (
                  <div className="rounded-xl bg-[#f8faf9] p-3 border border-[#e2ece7]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#798e85] mb-1">
                      Seeking Pitch
                    </p>
                    <p className="text-xs text-[#57685f] italic leading-relaxed">
                      "{teamSeekingDescription}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. TAB CONTENT: PROJECTS & SUBMISSIONS ================= */}
      {activeTab === "portfolio" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#122622]">
                Portfolio Projects & Hackathon Builds
              </h3>
              <p className="text-xs text-[#57685f]">
                Showcase of completed submissions, live prototypes, and engineering solutions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project 1 */}
            <div className="rounded-2xl border border-[#d6e7e1] bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-lg bg-[#e8f3f0] px-2.5 py-1 text-[11px] font-bold text-[#0f6b5c]">
                    🏆 1st Place Winner
                  </span>
                  <span className="text-[11px] font-semibold text-[#798e85]">ET-Fintech 2026</span>
                </div>
                <h4 className="text-base font-bold text-[#122622]">AgriPay Mobile & USSD</h4>
                <p className="text-xs text-[#57685f] mt-1.5 leading-relaxed">
                  Decentralized micro-lending and crop insurance platform tailored for Ethiopian smallholder farmers via USSD and web dashboard.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {["React Native", "FastAPI", "PostgreSQL", "Telebirr"].map((tag) => (
                    <span key={tag} className="rounded-md bg-[#f3f6f4] px-2 py-0.5 text-[10px] font-semibold text-[#57685f]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-[#e2ece7] flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#0f6b5c]">Team: AgriInno</span>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-[#122622] hover:text-[#0f6b5c]"
                >
                  <GithubIcon className="h-3.5 w-3.5" /> Code <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Project 2 */}
            <div className="rounded-2xl border border-[#d6e7e1] bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-lg bg-[#fef3c7] px-2.5 py-1 text-[11px] font-bold text-[#92400e]">
                    🌟 Community Choice
                  </span>
                  <span className="text-[11px] font-semibold text-[#798e85]">EthioHealth 2025</span>
                </div>
                <h4 className="text-base font-bold text-[#122622]">TenaAI Diagnostic Assistant</h4>
                <p className="text-xs text-[#57685f] mt-1.5 leading-relaxed">
                  Offline-first Amharic and Afaan Oromoo medical triage symptom checker powered by quantized LLMs for rural clinics.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {["Next.js", "PyTorch", "Whisper", "Docker"].map((tag) => (
                    <span key={tag} className="rounded-md bg-[#f3f6f4] px-2 py-0.5 text-[10px] font-semibold text-[#57685f]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-[#e2ece7] flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#0f6b5c]">Team: TenaTech</span>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-[#122622] hover:text-[#0f6b5c]"
                >
                  <Globe className="h-3.5 w-3.5" /> Demo <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Project 3 */}
            <div className="rounded-2xl border border-[#d6e7e1] bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-lg bg-[#e8f3f0] px-2.5 py-1 text-[11px] font-bold text-[#0f6b5c]">
                    🚀 Active Project
                  </span>
                  <span className="text-[11px] font-semibold text-[#798e85]">National AI Hack</span>
                </div>
                <h4 className="text-base font-bold text-[#122622]">Kolo Logistics Optimizer</h4>
                <p className="text-xs text-[#57685f] mt-1.5 leading-relaxed">
                  Real-time routing and multi-modal fleet dispatch for Addis Ababa freight carriers reducing congestion and delivery times.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {["TypeScript", "Go", "Mapbox", "Redis"].map((tag) => (
                    <span key={tag} className="rounded-md bg-[#f3f6f4] px-2 py-0.5 text-[10px] font-semibold text-[#57685f]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-[#e2ece7] flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#0f6b5c]">Team: SwiftFreight</span>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-[#122622] hover:text-[#0f6b5c]"
                >
                  <GithubIcon className="h-3.5 w-3.5" /> Code <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 6. TAB CONTENT: HACKATHONS ================= */}
      {activeTab === "hackathons" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white border border-[#d6e7e1] p-5 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f3f0] text-[#0f6b5c]">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[#122622]">3</p>
                  <p className="text-xs font-semibold text-[#57685f]">Hackathons Won</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-[#d6e7e1] p-5 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f3f0] text-[#0f6b5c]">
                  <Rocket className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[#122622]">7</p>
                  <p className="text-xs font-semibold text-[#57685f]">Events Attended</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-[#d6e7e1] p-5 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f3f0] text-[#0f6b5c]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[#122622]">24</p>
                  <p className="text-xs font-semibold text-[#57685f]">Collaborators</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#d6e7e1] bg-white p-6 shadow-2xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#122622] mb-4">
              Registered Hackathon History
            </h3>
            <div className="space-y-3">
              {[
                {
                  title: "National Agritech Innovation Challenge 2026",
                  date: "March 15 - April 1, 2026",
                  status: "APPROVED",
                  team: "AgriInno",
                  prize: "1st Place ($5,000 USD)",
                },
                {
                  title: "Ethio AI & Machine Learning Hackathon",
                  date: "January 10 - 24, 2026",
                  status: "APPROVED",
                  team: "TenaTech",
                  prize: "Community Choice ($2,000 USD)",
                },
                {
                  title: "Addis Smart City Civic Tech Hack",
                  date: "November 5 - 18, 2025",
                  status: "APPROVED",
                  team: "SwiftFreight",
                  prize: "Finalist",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#f8faf9] border border-[#e2ece7] gap-3"
                >
                  <div>
                    <h4 className="text-sm font-bold text-[#122622]">{item.title}</h4>
                    <p className="text-xs text-[#57685f] mt-0.5">
                      {item.date} • Team: <span className="font-semibold text-[#0f6b5c]">{item.team}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-[#e8f3f0] px-2.5 py-1 text-xs font-bold text-[#0f6b5c]">
                      {item.prize}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
