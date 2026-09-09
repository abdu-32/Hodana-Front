"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  GraduationCap,
  Briefcase,
  Globe,
  Users,
  Check,
  Plus,
  Sparkles,
  Loader2,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { useSession } from "@/features/auth";
import { useToast } from "@/components/ui";
import { updateMyProfile } from "../lib/profile-client";
import type { UserProfile, UserUpdateRequest } from "@/lib/api-types-helpers";
import { ApiError } from "@/lib/api-client";

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

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (updated: UserProfile) => void;
}

const POPULAR_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "Django",
  "FastAPI",
  "Node.js",
  "Express",
  "PostgreSQL",
  "MongoDB",
  "Flutter",
  "React Native",
  "AI / ML",
  "TensorFlow",
  "PyTorch",
  "UI / UX Design",
  "Figma",
  "Docker",
  "Kubernetes",
  "AWS",
  "Google Cloud",
  "Solidity / Web3",
  "Product Management",
];

const PREFERRED_ROLES_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "Mobile Developer",
  "AI / ML Engineer",
  "Data Scientist",
  "UI / UX Designer",
  "Product Manager",
  "DevOps Engineer",
  "Team Lead / Project Manager",
  "Pitch / Presenter",
  "Researcher / Domain Expert",
];

export function EditProfileModal({
  isOpen,
  onClose,
  onProfileUpdated,
}: EditProfileModalProps) {
  const { user, updateUser } = useSession();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "personal" | "education" | "professional" | "skills" | "social" | "team"
  >("personal");

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [university, setUniversity] = useState("");
  const [organization, setOrganization] = useState("");
  const [department, setDepartment] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");

  const [profession, setProfession] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Intermediate");
  const [yearsOfExperience, setYearsOfExperience] = useState<string>("");
  const [bio, setBio] = useState("");

  const [skills, setSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");

  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  const [interestedInTeams, setInterestedInTeams] = useState("yes");
  const [lookingForTeammates, setLookingForTeammates] = useState(false);
  const [teamSeekingDescription, setTeamSeekingDescription] = useState("");
  const [preferredTeamRoles, setPreferredTeamRoles] = useState<string[]>([]);

  const [profileVisibility, setProfileVisibility] = useState<"public" | "private">("public");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Populate initial state when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setPhoneNumber((user as any).phoneNumber || "");
      setCountry((user as any).country || "ET");
      setCity((user as any).city || "");
      setContactEmail((user as any).contactEmail || "");
      setAvatarUrl(user.avatarUrl || "");

      setUniversity(user.university || "");
      setOrganization((user as any).organization || "");
      setDepartment((user as any).department || "");
      setFieldOfStudy((user as any).fieldOfStudy || "");

      setProfession((user as any).profession || (user as any).role || "");
      setProfessionalTitle((user as any).professionalTitle || "");
      setExperienceLevel((user as any).experienceLevel || "Intermediate");
      setYearsOfExperience(
        (user as any).yearsOfExperience !== null && (user as any).yearsOfExperience !== undefined
          ? String((user as any).yearsOfExperience)
          : ""
      );
      setBio(user.bio || "");

      setSkills(user.skills || []);

      setLinkedinUrl((user as any).linkedinUrl || "");
      setGithubUrl((user as any).githubUrl || "");
      setWebsiteUrl((user as any).websiteUrl || user.portfolioUrl || "");
      setTwitterUrl((user as any).twitterUrl || "");
      setInstagramUrl((user as any).instagramUrl || "");

      setInterestedInTeams((user as any).interestedInTeams || "yes");
      setLookingForTeammates(Boolean((user as any).lookingForTeammates));
      setTeamSeekingDescription((user as any).teamSeekingDescription || "");
      setPreferredTeamRoles((user as any).preferredTeamRoles || []);

      setProfileVisibility(((user as any).profileVisibility as "public" | "private") || "public");
      setFieldErrors({});
    }
  }, [isOpen, user]);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    if (skills.length >= 30) {
      showToast("Maximum 30 skills allowed", "danger");
      return;
    }
    setSkills([...skills, trimmed]);
    setCustomSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const togglePreferredRole = (role: string) => {
    if (preferredTeamRoles.includes(role)) {
      setPreferredTeamRoles(preferredTeamRoles.filter((r) => r !== role));
    } else {
      setPreferredTeamRoles([...preferredTeamRoles, role]);
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: UserUpdateRequest = {
        fullName: fullName.trim(),
        bio: bio.trim().slice(0, 500),
        university: university.trim(),
        organization: organization.trim(),
        department: department.trim(),
        fieldOfStudy: fieldOfStudy.trim(),
        profession: profession.trim(),
        role: profession.trim(),
        professionalTitle: professionalTitle.trim(),
        experienceLevel,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience, 10) : null,
        skills,
        country: country.trim().toUpperCase().slice(0, 2) || "ET",
        city: city.trim(),
        phoneNumber: phoneNumber.trim(),
        contactEmail: contactEmail.trim() || null,
        avatarUrl: avatarUrl.trim() || undefined,
        portfolioUrl: websiteUrl.trim() || undefined,
        websiteUrl: websiteUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        githubUrl: githubUrl.trim(),
        twitterUrl: twitterUrl.trim(),
        instagramUrl: instagramUrl.trim(),
        interestedInTeams,
        lookingForTeammates,
        teamSeekingDescription: teamSeekingDescription.trim(),
        preferredTeamRoles,
        profileVisibility,
      };

      return updateMyProfile(payload);
    },
    onSuccess: (updated) => {
      updateUser(updated);
      if (onProfileUpdated) onProfileUpdated(updated);
      showToast("Profile successfully updated!", "success");
      onClose();
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(
          Object.fromEntries(
            Object.entries(err.fields).map(([k, v]) => [k, v[0]])
          )
        );
        showToast("Please fix the validation errors marked in red.", "danger");
      } else {
        const msg = err instanceof Error ? err.message : "Failed to update profile";
        showToast(msg, "danger");
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-[#d6e7e1] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2ece7] px-6 py-4 bg-[#f8faf9]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f6b5c] text-white shadow-xs">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#122622]">Edit Participant Profile</h2>
              <p className="text-xs text-[#57685f]">
                Manage your public information, credentials, and hackathon preferences
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#57685f] hover:bg-[#e8f3f0] hover:text-[#122622] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e2ece7] bg-white px-6 overflow-x-auto gap-2">
          {[
            { id: "personal", label: "Personal & Contact", icon: User },
            { id: "education", label: "Education & Org", icon: GraduationCap },
            { id: "professional", label: "Professional & Bio", icon: Briefcase },
            { id: "skills", label: "Skills & Tech", icon: Sparkles },
            { id: "social", label: "Social & Links", icon: Globe },
            { id: "team", label: "Team Preferences", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-[#0f6b5c] text-[#0f6b5c]"
                    : "border-transparent text-[#57685f] hover:text-[#122622]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <div className="p-6 max-h-[68vh] overflow-y-auto space-y-6">
          {/* TAB 1: PERSONAL & CONTACT */}
          {activeTab === "personal" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-[#798e85]" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Abebe Bekele"
                      className="w-full rounded-xl border border-[#c4ded4] bg-white pl-9 pr-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    Account Email (Read-Only)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#798e85]" />
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full rounded-xl border border-[#d6e7e1] bg-[#f5f7f6] pl-9 pr-3 py-2 text-sm text-[#57685f] cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-[#798e85]" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+251 91 234 5678"
                      className="w-full rounded-xl border border-[#c4ded4] bg-white pl-9 pr-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                    />
                  </div>
                  {fieldErrors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    Contact / Secondary Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#798e85]" />
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="alternative@example.com"
                      className="w-full rounded-xl border border-[#c4ded4] bg-white pl-9 pr-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                    />
                  </div>
                  {fieldErrors.contactEmail && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.contactEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    Country Code (2-letter ISO)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-[#798e85]" />
                    <input
                      type="text"
                      maxLength={2}
                      value={country}
                      onChange={(e) => setCountry(e.target.value.toUpperCase())}
                      placeholder="ET"
                      className="w-full rounded-xl border border-[#c4ded4] bg-white pl-9 pr-3 py-2 text-sm text-[#122622] uppercase focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                    />
                  </div>
                  {fieldErrors.country && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.country}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    City / Region
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-[#798e85]" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Addis Ababa, Adama, Hawassa, etc."
                      className="w-full rounded-xl border border-[#c4ded4] bg-white pl-9 pr-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                    />
                  </div>
                  {fieldErrors.city && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Avatar Image URL
                </label>
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full rounded-xl border border-[#c4ded4] bg-white px-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                    />
                  </div>
                  {avatarUrl && (
                    <img
                      src={avatarUrl}
                      alt="Avatar preview"
                      className="h-10 w-10 rounded-full object-cover border border-[#c4ded4]"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                </div>
                {fieldErrors.avatarUrl && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.avatarUrl}</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EDUCATION & ORGANIZATION */}
          {activeTab === "education" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    University / College / School
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-[#798e85]" />
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="e.g. Addis Ababa University (AAU)"
                      className="w-full rounded-xl border border-[#c4ded4] bg-white pl-9 pr-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    Organization / Company
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-[#798e85]" />
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Ethio Telecom / Tech Startup / Self-Employed"
                      className="w-full rounded-xl border border-[#c4ded4] bg-white pl-9 pr-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    Department / Faculty
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full rounded-xl border border-[#c4ded4] bg-white px-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    Field of Study / Major
                  </label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="e.g. Software Engineering / Information Systems"
                    className="w-full rounded-xl border border-[#c4ded4] bg-white px-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROFESSIONAL & BIO */}
          {activeTab === "professional" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    Primary Role / Profession
                  </label>
                  <select
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full rounded-xl border border-[#c4ded4] bg-white px-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                  >
                    <option value="">Select your primary role...</option>
                    <option value="Software Developer">Software Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full-Stack Developer">Full-Stack Developer</option>
                    <option value="Mobile App Developer">Mobile App Developer</option>
                    <option value="AI / ML Engineer">AI / ML Engineer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Student">Student / Academic</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Researcher">Researcher</option>
                    <option value="Entrepreneur / Founder">Entrepreneur / Founder</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full rounded-xl border border-[#c4ded4] bg-white px-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                  >
                    <option value="Beginner">Beginner (0-1 yrs)</option>
                    <option value="Intermediate">Intermediate (1-3 yrs)</option>
                    <option value="Advanced">Advanced (3-5 yrs)</option>
                    <option value="Expert">Expert (5+ yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    Professional Title / Headline
                  </label>
                  <input
                    type="text"
                    value={professionalTitle}
                    onChange={(e) => setProfessionalTitle(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Architect & AI Enthusiast"
                    className="w-full rounded-xl border border-[#c4ded4] bg-white px-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    placeholder="e.g. 3"
                    className="w-full rounded-xl border border-[#c4ded4] bg-white px-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-[#122622]">
                    About / Biography
                  </label>
                  <span className="text-[11px] text-[#798e85]">
                    {bio.length}/500 chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell organizers and fellow innovators about your background, interests, and what you love building..."
                  className="w-full rounded-xl border border-[#c4ded4] bg-white p-3 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none resize-none"
                />
                {fieldErrors.bio && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.bio}</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS & TECH */}
          {activeTab === "skills" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Add Custom Skill (Press Enter or Click +)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill(customSkillInput);
                      }
                    }}
                    placeholder="e.g. PyTorch, Rust, Solidity, Tailwind..."
                    className="flex-1 rounded-xl border border-[#c4ded4] bg-white px-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addSkill(customSkillInput)}
                    className="flex items-center gap-1.5 rounded-xl bg-[#0f6b5c] px-4 py-2 text-xs font-bold text-white hover:bg-[#0d594c] transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
              </div>

              {/* Selected Skills */}
              <div>
                <label className="block text-xs font-bold text-[#122622] mb-2">
                  Selected Skills ({skills.length}/30)
                </label>
                {skills.length === 0 ? (
                  <p className="text-xs text-[#798e85] italic">
                    No skills added yet. Select from the recommendations below or type above.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#e8f3f0] px-3 py-1 text-xs font-semibold text-[#0f6b5c] border border-[#c4ded4]"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-[#57685f] hover:text-red-500 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Popular Suggestions */}
              <div>
                <label className="block text-xs font-bold text-[#57685f] uppercase tracking-wider mb-2">
                  Popular Suggestions (Click to Add)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SKILLS.map((skill) => {
                    const isSelected = skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => (isSelected ? removeSkill(skill) : addSkill(skill))}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-[#0f6b5c] text-white"
                            : "bg-[#f3f6f4] text-[#57685f] hover:bg-[#e2ece7] hover:text-[#122622]"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SOCIAL & LINKS */}
          {activeTab === "social" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    LinkedIn Profile URL
                  </label>
                  <div className="relative">
                    <LinkedinIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#0077b5]" />
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full rounded-xl border border-[#c4ded4] bg-white pl-9 pr-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    GitHub Profile URL
                  </label>
                  <div className="relative">
                    <GithubIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#122622]" />
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full rounded-xl border border-[#c4ded4] bg-white pl-9 pr-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    Personal Portfolio / Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-[#0f6b5c]" />
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourportfolio.dev"
                      className="w-full rounded-xl border border-[#c4ded4] bg-white pl-9 pr-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    X (Twitter) Profile URL
                  </label>
                  <div className="relative">
                    <TwitterIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#1da1f2]" />
                    <input
                      type="url"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      placeholder="https://twitter.com/username"
                      className="w-full rounded-xl border border-[#c4ded4] bg-white pl-9 pr-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    Instagram Profile URL
                  </label>
                  <div className="relative">
                    <InstagramIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#e1306c]" />
                    <input
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/username"
                      className="w-full rounded-xl border border-[#c4ded4] bg-white pl-9 pr-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TEAM PREFERENCES */}
          {activeTab === "team" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    Interested in Joining a Team?
                  </label>
                  <select
                    value={interestedInTeams}
                    onChange={(e) => setInterestedInTeams(e.target.value)}
                    className="w-full rounded-xl border border-[#c4ded4] bg-white px-3 py-2 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none"
                  >
                    <option value="yes">Yes, definitely</option>
                    <option value="maybe">Maybe / Open to invitations</option>
                    <option value="no">No, prefer solo participation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122622] mb-1.5">
                    Actively Looking for Teammates?
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#122622] cursor-pointer">
                      <input
                        type="radio"
                        name="lookingTeammates"
                        checked={lookingForTeammates === true}
                        onChange={() => setLookingForTeammates(true)}
                        className="text-[#0f6b5c] focus:ring-[#0f6b5c]"
                      />
                      Yes, looking
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#122622] cursor-pointer">
                      <input
                        type="radio"
                        name="lookingTeammates"
                        checked={lookingForTeammates === false}
                        onChange={() => setLookingForTeammates(false)}
                        className="text-[#0f6b5c] focus:ring-[#0f6b5c]"
                      />
                      No, not currently
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#122622] mb-2">
                  Preferred Team Roles (What roles do you want to play?)
                </label>
                <div className="flex flex-wrap gap-2">
                  {PREFERRED_ROLES_OPTIONS.map((role) => {
                    const isSelected = preferredTeamRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => togglePreferredRole(role)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                          isSelected
                            ? "border-[#0f6b5c] bg-[#e8f3f0] text-[#0f6b5c]"
                            : "border-[#d6e7e1] bg-white text-[#57685f] hover:border-[#c4ded4]"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#122622] mb-1.5">
                  Teammate Seeking Pitch / Idea Description
                </label>
                <textarea
                  rows={3}
                  value={teamSeekingDescription}
                  onChange={(e) => setTeamSeekingDescription(e.target.value)}
                  placeholder="Describe what kind of teammates or projects you are looking for (e.g. 'Looking for a UI/UX designer and a backend engineer to build an AI agritech solution')."
                  className="w-full rounded-xl border border-[#c4ded4] bg-white p-3 text-sm text-[#122622] focus:border-[#0f6b5c] focus:ring-1 focus:ring-[#0f6b5c] outline-none resize-none"
                />
              </div>

              {/* Profile Visibility */}
              <div className="rounded-xl border border-[#d6e7e1] bg-[#f8faf9] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {profileVisibility === "public" ? (
                    <Eye className="h-5 w-5 text-[#0f6b5c]" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-[#798e85]" />
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-[#122622]">Profile Visibility</h4>
                    <p className="text-[11px] text-[#57685f]">
                      {profileVisibility === "public"
                        ? "Public: Visible to organizers, judges, and potential teammates"
                        : "Private: Hidden from public searches and matchmaking"}
                    </p>
                  </div>
                </div>
                <select
                  value={profileVisibility}
                  onChange={(e) => setProfileVisibility(e.target.value as any)}
                  className="rounded-lg border border-[#c4ded4] bg-white px-2.5 py-1 text-xs font-semibold text-[#122622] outline-none"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#e2ece7] px-6 py-4 bg-[#f8faf9]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-[#57685f] hover:bg-[#e8f3f0] hover:text-[#122622] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
            className="flex items-center gap-2 rounded-xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0d594c] transition-all disabled:opacity-50 cursor-pointer"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
