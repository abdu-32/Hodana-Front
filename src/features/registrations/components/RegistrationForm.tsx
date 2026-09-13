"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  User,
  Trophy,
  Users,
  Megaphone,
  ShieldCheck,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Info,
  Globe,
  CheckCircle2,
  Rocket,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { useToast } from "@/components/ui";
import { ApiError } from "@/lib/api-client";
import { registerForHackathon } from "../lib/registrations-client";
import type { Hackathon } from "@/lib/api-types-helpers";

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TelegramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function FacebookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

interface Track {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const DEFAULT_TRACKS: Track[] = [
  {
    id: "general",
    name: "General Innovation",
    description: "Open track for creative digital products, web apps, and tech solutions.",
    icon: "💡",
  },
  {
    id: "ai_ml",
    name: "AI & Machine Learning",
    description: "Solutions leveraging LLMs, computer vision, or predictive models for local impact.",
    icon: "🤖",
  },
  {
    id: "fintech_agri",
    name: "FinTech & AgriTech",
    description: "Applications driving financial inclusion or agricultural efficiency in Ethiopia.",
    icon: "🌾",
  },
];

const DISCOVERY_PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: InstagramIcon, color: "hover:text-pink-600 hover:border-pink-300" },
  { id: "telegram", label: "Telegram", icon: TelegramIcon, color: "hover:text-sky-500 hover:border-sky-300" },
  { id: "facebook", label: "Facebook", icon: FacebookIcon, color: "hover:text-blue-600 hover:border-blue-300" },
  { id: "linkedin", label: "LinkedIn", icon: LinkedinIcon, color: "hover:text-blue-700 hover:border-blue-300" },
  { id: "other", label: "Other / Web", icon: Globe, color: "hover:text-teal-600 hover:border-teal-300" },
];

interface RegistrationFormProps {
  hackathon: Hackathon;
}

export function RegistrationForm({ hackathon }: RegistrationFormProps) {
  const t = useTranslations("Registrations");
  const router = useRouter();
  const { user } = useSession();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form State
  const u = (user || {}) as any;
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: u.phoneNumber || "+251913636863",
    city: u.city || "Addis Ababa",
    organization: u.organization || user?.university || "ASTU",
    role: u.profession || u.professionalTitle || "Software Developer",

    // Step 2: Track
    selectedTrack: "general",

    // Step 3: Team Details (solo | looking_for_team | create_team)
    teamStatus: "solo",
    teamName: "",
    teamDescription: "",

    // Step 4: Discovery
    discoverySource: "hodana", // "hodana" | "friend" | "college" | "social" | "other"
    discoveryPlatform: "telegram", // "instagram" | "telegram" | "facebook" | "linkedin" | "other"
    otherDiscoveryText: "",

    // Step 5: Agreement
    agreeEligibility: true,
    agreeTerms: true,
  });

  useEffect(() => {
    if (user) {
      const curUser = user as any;
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || "",
        email: prev.email || user.email || "",
        phone: prev.phone || curUser.phoneNumber || "+251913636863",
        city: prev.city || curUser.city || "Addis Ababa",
        organization: prev.organization || curUser.organization || user.university || "ASTU",
        role: prev.role || curUser.profession || curUser.professionalTitle || "Software Developer",
      }));
    }
  }, [user]);

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      registerForHackathon(hackathon.slug || hackathon.id, {
        eligibilityConfirmed: formData.agreeEligibility && formData.agreeTerms,
        registrationType: (formData.teamStatus as any) || "solo",
        teamName: formData.teamStatus === "create_team" ? formData.teamName.trim() : undefined,
        teamDescription: formData.teamStatus === "create_team" ? formData.teamDescription.trim() : undefined,
        customAnswers: {
          personalInfo: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
            organization: formData.organization,
            role: formData.role,
          },
          selectedTrack: formData.selectedTrack,
          teamStatus: formData.teamStatus,
          discovery: {
            source: formData.discoverySource,
            platform: formData.discoverySource === "social" ? formData.discoveryPlatform : undefined,
            otherText: formData.discoverySource === "other" ? formData.otherDiscoveryText : undefined,
          },
        },
      } as any),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["registrations", "me"] });
      await queryClient.invalidateQueries({ queryKey: ["hackathons"] });
      showToast("Registration successful! Redirecting to Registrations...", "success");
      router.push("/dashboard/registrations");
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.fields) {
        setFieldErrors(
          Object.fromEntries(
            Object.entries(error.fields).map(([field, messages]) => [
              field,
              messages[0],
            ]),
          ),
        );
      } else {
        showToast(
          error instanceof Error ? error.message : "Registration failed. Please try again.",
          "danger"
        );
      }
    },
  });

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) errors.fullName = "Full name is required.";
      if (!formData.email.trim() || !formData.email.includes("@"))
        errors.email = "Valid email is required.";
      if (!formData.city.trim()) errors.city = "Country/City is required.";
    } else if (step === 2) {
      if (!formData.selectedTrack) errors.selectedTrack = "Please select a challenge track.";
    } else if (step === 3) {
      if (!formData.teamStatus) errors.teamStatus = "Please select your team mode.";
      if (formData.teamStatus === "create_team") {
        if (!formData.teamName.trim()) {
          errors.teamName = "Team name is required.";
        } else if (formData.teamName.trim().length < 3) {
          errors.teamName = "Team name must be at least 3 characters.";
        }
      }
    } else if (step === 4) {
      if (!formData.discoverySource) errors.discoverySource = "Please select how you heard about us.";
      if (formData.discoverySource === "other" && !formData.otherDiscoveryText.trim()) {
        errors.otherDiscoveryText = "Please tell us how you heard about this hackathon.";
      }
    } else if (step === 5) {
      if (!formData.agreeEligibility) errors.agreeEligibility = "You must agree to the eligibility requirements.";
      if (!formData.agreeTerms) errors.agreeTerms = "You must agree to the official rules and terms.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        mutation.mutate();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const stepsList = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Participation", icon: Trophy },
    { number: 3, title: "Team Details", icon: Users },
    { number: 4, title: "Discovery", icon: Megaphone },
    { number: 5, title: "Agreement", icon: ShieldCheck },
  ];

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "TBD";
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#122622] py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* ================= STEP NAVIGATOR (SIDEBAR ON LG, COMPACT STEPPER ON MOBILE) ================= */}
          <aside className="lg:col-span-4 flex flex-col gap-4">
            {/* Desktop Full Sidebar */}
            <div className="hidden lg:block rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-xs">
              <div className="mb-6">
                <h2 className="font-display text-lg font-bold text-[#122622]">Registration</h2>
                <p className="text-xs font-semibold text-[#57685f] mt-0.5">
                  Step {currentStep} of 5
                </p>
              </div>

              <nav className="flex flex-col gap-2">
                {stepsList.map((s) => {
                  const Icon = s.icon;
                  const isActive = currentStep === s.number;
                  const isCompleted = currentStep > s.number;

                  return (
                    <button
                      key={s.number}
                      type="button"
                      onClick={() => {
                        if (s.number < currentStep || validateStep(currentStep)) {
                          setCurrentStep(s.number);
                        }
                      }}
                      className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-xs font-bold transition-all text-left cursor-pointer ${
                        isActive
                          ? "bg-[#dcefe9] text-[#0f6b5c] shadow-xs"
                          : isCompleted
                          ? "text-[#122622] hover:bg-gray-100"
                          : "text-[#57685f] hover:bg-gray-50 opacity-80"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#0f6b5c]" : "text-[#57685f]"}`} />
                      <span className="flex-1 truncate">{s.title}</span>
                      {isCompleted && (
                        <Check className="h-3.5 w-3.5 text-[#0f6b5c] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Compact Progress Bar */}
            <div className="block lg:hidden rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f6b5c] text-[11px] font-extrabold text-white">
                    {currentStep}
                  </span>
                  <span className="text-xs font-bold text-[#122622]">
                    {stepsList[currentStep - 1]?.title}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#57685f]">
                  Step {currentStep} of 5
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {stepsList.map((s) => (
                  <div
                    key={s.number}
                    className={`h-1.5 rounded-full transition-all ${
                      s.number <= currentStep ? "bg-[#0f6b5c]" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </aside>

          {/* ================= RIGHT MAIN CONTENT ================= */}
          <main className="lg:col-span-8 flex flex-col gap-6">
            {/* Top Hackathon Banner / Metadata Card */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-700">
                  Hackathon
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {hackathon.status || "published"}
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#122622]">
                {hackathon.title}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[#57685f] leading-relaxed line-clamp-2">
                {hackathon.description || "Developing accessible solutions and breakthrough technologies."}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 text-xs">
                <div>
                  <p className="font-bold uppercase tracking-wider text-[#57685f] text-[11px]">
                    Registration Window
                  </p>
                  <p className="mt-1 font-semibold text-[#122622]">
                    {formatDate(hackathon.registrationOpensAt)} — {formatDate(hackathon.registrationClosesAt)}
                  </p>
                </div>
                <div>
                  <p className="font-bold uppercase tracking-wider text-[#57685f] text-[11px]">
                    Submission Window
                  </p>
                  <p className="mt-1 font-semibold text-[#122622]">
                    {formatDate(hackathon.submissionOpensAt)} — {formatDate(hackathon.submissionClosesAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Section Heading & Eligibility Notice */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold tracking-tight text-[#122622]">
                  Register for this hackathon
                </h2>
                {hackathon.openTo && (
                  <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
                    {hackathon.openTo.includes("ALL")
                      ? "Open to Everyone"
                      : hackathon.openTo.includes("UNIVERSITY_STUDENT")
                      ? "🎓 University Students Only"
                      : "🏛️ Government & Public Sector Only"}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[#57685f]">
                Confirm eligibility, then continue to the team hub to create or join a team.
              </p>
            </div>

            {/* If university students only, show notice */}
            {hackathon.openTo && hackathon.openTo.includes("UNIVERSITY_STUDENT") && !hackathon.openTo.includes("ALL") && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-2.5">
                <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Student Eligibility Required</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    This hackathon is restricted to enrolled university students and researchers. Please provide your university/college name in your personal information.
                  </p>
                </div>
              </div>
            )}

            {/* Form Step Card */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 sm:p-8 shadow-xs">
              {/* ================= STEP 1: PERSONAL INFORMATION ================= */}
              {currentStep === 1 && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f6b5c] text-xs font-extrabold text-white">
                      1
                    </span>
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#122622]">
                      Personal Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-[#122622] mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => updateField("fullName", e.target.value)}
                        placeholder="Your Full Name"
                        className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-xs text-[#122622] focus:border-[#0f6b5c] focus:bg-white focus:outline-none transition-all"
                      />
                      {fieldErrors.fullName && (
                        <p className="mt-1 text-[11px] font-semibold text-red-600">{fieldErrors.fullName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-[#122622] mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="jane@example.com"
                        className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-xs text-[#122622] focus:border-[#0f6b5c] focus:bg-white focus:outline-none transition-all"
                      />
                      {fieldErrors.email && (
                        <p className="mt-1 text-[11px] font-semibold text-red-600">{fieldErrors.email}</p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold text-[#122622] mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="+251913636863"
                        className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-xs text-[#122622] focus:border-[#0f6b5c] focus:bg-white focus:outline-none transition-all"
                      />
                    </div>

                    {/* Country/City */}
                    <div>
                      <label className="block text-xs font-bold text-[#122622] mb-1.5">
                        Country/City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="Addis Ababa"
                        className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-xs text-[#122622] focus:border-[#0f6b5c] focus:bg-white focus:outline-none transition-all"
                      />
                      {fieldErrors.city && (
                        <p className="mt-1 text-[11px] font-semibold text-red-600">{fieldErrors.city}</p>
                      )}
                    </div>

                    {/* University/Organization */}
                    <div>
                      <label className="block text-xs font-bold text-[#122622] mb-1.5">
                        University/Organization
                      </label>
                      <input
                        type="text"
                        value={formData.organization}
                        onChange={(e) => updateField("organization", e.target.value)}
                        placeholder="astu or Company Name"
                        className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-xs text-[#122622] focus:border-[#0f6b5c] focus:bg-white focus:outline-none transition-all"
                      />
                    </div>

                    {/* Role/Profession */}
                    <div>
                      <label className="block text-xs font-bold text-[#122622] mb-1.5">
                        Role/Profession
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => updateField("role", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-xs text-[#122622] focus:border-[#0f6b5c] focus:bg-white focus:outline-none transition-all"
                      >
                        <option value="Software Developer">Software Developer / Engineer</option>
                        <option value="UI/UX Designer">UI/UX Designer</option>
                        <option value="Data Scientist / AI">Data Scientist / AI Specialist</option>
                        <option value="Product Manager">Product Manager / Business</option>
                        <option value="Student / Researcher">Student / Researcher</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= STEP 2: PARTICIPATION (CHALLENGE TRACK) ================= */}
              {currentStep === 2 && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f6b5c] text-xs font-extrabold text-white">
                      2
                    </span>
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#122622]">
                      Select Your Preferred Challenge Track
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {DEFAULT_TRACKS.map((track) => {
                      const isSelected = formData.selectedTrack === track.id;
                      return (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => updateField("selectedTrack", track.id)}
                          className={`relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all cursor-pointer min-h-[180px] ${
                            isSelected
                              ? "border-[#0f6b5c] bg-[#f0f9f6] shadow-sm ring-1 ring-[#0f6b5c]"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-2xs"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-2xl">{track.icon}</span>
                              <div
                                className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                                  isSelected
                                    ? "border-[#0f6b5c] bg-[#0f6b5c] text-white"
                                    : "border-gray-300 bg-white"
                                }`}
                              >
                                {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>
                            </div>
                            <h4 className="font-display text-sm font-bold text-[#122622]">
                              {track.name}
                            </h4>
                            <p className="mt-1.5 text-[11px] leading-relaxed text-[#57685f]">
                              {track.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ================= STEP 3: TEAM PREFERENCE ================= */}
              {currentStep === 3 && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f6b5c] text-xs font-extrabold text-white">
                      3
                    </span>
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#122622]">
                      Team Preference
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#122622] mb-3">
                      How would you like to participate? <span className="text-red-500">*</span>
                    </label>

                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                      {[
                        {
                          id: "solo",
                          title: "Solo",
                          subtitle: "Participate individually without a team.",
                          icon: User,
                        },
                        {
                          id: "looking_for_team",
                          title: "Looking for a Team",
                          subtitle: "Find teammates or browse open teams in the hub.",
                          icon: Users,
                        },
                        {
                          id: "create_team",
                          title: "Create a Team",
                          subtitle: "Form a new team and invite collaborators.",
                          icon: Rocket,
                        },
                      ].map((opt) => {
                        const isSelected = formData.teamStatus === opt.id;
                        const IconComponent = opt.icon;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => updateField("teamStatus", opt.id)}
                            className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#0f6b5c] bg-[#f0f9f6] shadow-2xs ring-1 ring-[#0f6b5c]"
                                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-2xs"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${isSelected ? "bg-[#0f6b5c] text-white" : "bg-[#f3f6f4] text-[#57685f]"}`}>
                                  <IconComponent className="h-4 w-4" />
                                </span>
                                <div
                                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                    isSelected
                                      ? "border-[#0f6b5c] bg-[#0f6b5c] text-white"
                                      : "border-gray-300 bg-white"
                                  }`}
                                >
                                  {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                                </div>
                              </div>
                              <h4 className="font-display text-xs font-bold text-[#122622]">
                                {opt.title}
                              </h4>
                              <p className="mt-1 text-[11px] text-[#57685f] leading-snug">
                                {opt.subtitle}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Team Creation Fields */}
                  {formData.teamStatus === "create_team" && (
                    <div className="rounded-2xl border border-[#d6e7e1] bg-[#f8fafc] p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div>
                        <label className="block text-xs font-bold text-[#122622] mb-1.5">
                          Team Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.teamName}
                          onChange={(e) => updateField("teamName", e.target.value)}
                          placeholder="e.g. CyberNexus, FinTech Innovators"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-[#122622] focus:border-[#0f6b5c] focus:outline-none"
                        />
                        {fieldErrors.teamName && (
                          <p className="mt-1 text-[11px] text-red-500 font-medium">
                            {fieldErrors.teamName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#122622] mb-1.5">
                          Short Team Description <span className="text-xs font-normal text-[#57685f]">(Optional)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={formData.teamDescription}
                          onChange={(e) => updateField("teamDescription", e.target.value)}
                          placeholder="Briefly describe what your team is looking to build or specialize in..."
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-[#122622] focus:border-[#0f6b5c] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {formData.teamStatus === "solo" && (
                    <div className="rounded-xl bg-[#e8f3f0] p-4 text-xs text-[#0f6b5c]">
                      <p className="font-semibold">You are registering individually.</p>
                      <p className="text-[11px] text-[#57685f] mt-0.5">You can still create or join a team later anytime from your Participant Team dashboard.</p>
                    </div>
                  )}

                  {formData.teamStatus === "looking_for_team" && (
                    <div className="rounded-xl bg-[#e8f3f0] p-4 text-xs text-[#0f6b5c]">
                      <p className="font-semibold">You will be listed as Looking for a Team.</p>
                      <p className="text-[11px] text-[#57685f] mt-0.5">You can browse open teams, send join requests, and receive invites in the Team Hub.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ================= STEP 4: DISCOVERY ================= */}
              {currentStep === 4 && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f6b5c] text-xs font-extrabold text-white">
                      4
                    </span>
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#122622]">
                      Discovery
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#122622] mb-3">
                      Who told you about {hackathon.title}? <span className="text-red-500">*</span>
                    </label>

                    {/* Discovery Source Pills */}
                    <div className="flex flex-wrap gap-3">
                      {[
                        { id: "hodana", label: "Hodana" },
                        { id: "friend", label: "Friend" },
                        { id: "college", label: "My college" },
                        { id: "social", label: "Social Media" },
                        { id: "other", label: "Other" },
                      ].map((opt) => {
                        const isSelected = formData.discoverySource === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => updateField("discoverySource", opt.id)}
                            className={`flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#0f6b5c] bg-[#f0f9f6] text-[#0f6b5c] shadow-2xs ring-1 ring-[#0f6b5c]"
                                : "border-gray-200 bg-white text-[#57685f] hover:border-gray-300 hover:text-[#122622]"
                            }`}
                          >
                            <div
                              className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                isSelected
                                  ? "border-[#0f6b5c] bg-[#0f6b5c] text-white"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                            </div>
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Dynamic Sub-Options for Social Media */}
                    {formData.discoverySource === "social" && (
                      <div className="mt-5 rounded-2xl border border-emerald-100 bg-[#f8fafc] p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <p className="text-[11px] font-bold text-[#57685f] uppercase tracking-wider mb-2.5">
                          Select Platform (Instagram, Telegram, Facebook, LinkedIn, etc.):
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                          {DISCOVERY_PLATFORMS.map((platform) => {
                            const Icon = platform.icon;
                            const isPlatformActive = formData.discoveryPlatform === platform.id;
                            return (
                              <button
                                key={platform.id}
                                type="button"
                                onClick={() => updateField("discoveryPlatform", platform.id)}
                                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                                  isPlatformActive
                                    ? "border-[#0f6b5c] bg-white text-[#0f6b5c] shadow-xs"
                                    : `border-gray-200 bg-white text-gray-700 ${platform.color}`
                                }`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                                <span>{platform.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Custom Text for "Other" */}
                    {formData.discoverySource === "other" && (
                      <div className="mt-4 animate-in fade-in duration-200">
                        <input
                          type="text"
                          value={formData.otherDiscoveryText}
                          onChange={(e) => updateField("otherDiscoveryText", e.target.value)}
                          placeholder="Please specify where you heard about this hackathon..."
                          className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-xs text-[#122622] focus:border-[#0f6b5c] focus:bg-white focus:outline-none transition-all"
                        />
                        {fieldErrors.otherDiscoveryText && (
                          <p className="mt-1 text-[11px] font-semibold text-red-600">
                            {fieldErrors.otherDiscoveryText}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================= STEP 5: AGREEMENT (ELIGIBILITY) ================= */}
              {currentStep === 5 && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f6b5c] text-xs font-extrabold text-white">
                      5
                    </span>
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#122622]">
                      Eligibility requirements
                    </h3>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Checkbox 1 */}
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-200 p-4 transition-all hover:bg-[#f8fafc]">
                      <input
                        type="checkbox"
                        checked={formData.agreeEligibility}
                        onChange={(e) => updateField("agreeEligibility", e.target.checked)}
                        className="mt-1 h-4 w-4 shrink-0 rounded accent-[#0f6b5c]"
                      />
                      <div className="text-xs leading-relaxed text-[#122622]">
                        <p className="font-bold">
                          <span className="text-red-500">*</span> I have read and agree to the eligibility requirements for this hackathon:
                        </p>
                        <ul className="mt-1.5 list-disc pl-5 text-[#57685f] space-y-1 text-[11px]">
                          <li>Above legal age of majority in country of residence</li>
                          {hackathon.openTo && hackathon.openTo.includes("UNIVERSITY_STUDENT") && !hackathon.openTo.includes("ALL") ? (
                            <li className="font-bold text-amber-800">Must be an actively enrolled University / Higher Education Student or Academic Researcher</li>
                          ) : hackathon.openTo && hackathon.openTo.includes("GOVERNMENT_PUBLIC_SECTOR") && !hackathon.openTo.includes("ALL") ? (
                            <li className="font-bold text-amber-800">Must be affiliated with a Government Agency, Ministry, or Public Sector Organization</li>
                          ) : (
                            <li>Open to creators, developers, designers, and students worldwide</li>
                          )}
                          <li className="flex items-center gap-1">
                            <span>All countries/territories, excluding standard exceptions</span>
                            <Info className="h-3 w-3 text-gray-400" />
                          </li>
                        </ul>
                      </div>
                    </label>
                    {fieldErrors.agreeEligibility && (
                      <p className="text-[11px] font-semibold text-red-600">{fieldErrors.agreeEligibility}</p>
                    )}

                    {/* Checkbox 2 */}
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-200 p-4 transition-all hover:bg-[#f8fafc]">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={(e) => updateField("agreeTerms", e.target.checked)}
                        className="mt-1 h-4 w-4 shrink-0 rounded accent-[#0f6b5c]"
                      />
                      <p className="text-xs leading-relaxed text-[#122622] font-semibold">
                        <span className="text-red-500">*</span> I have read and agree to be bound by the{" "}
                        <span className="text-[#0f6b5c] underline">Official Rules</span> and the{" "}
                        <span className="text-[#0f6b5c] underline">Hodana Terms of Service</span>
                      </p>
                    </label>
                    {fieldErrors.agreeTerms && (
                      <p className="text-[11px] font-semibold text-red-600">{fieldErrors.agreeTerms}</p>
                    )}
                  </div>
                </div>
              )}

              {/* ================= STEP ACTION BUTTONS ================= */}
              <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-5">
                <div className="flex items-center gap-4">
                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-2 rounded-xl bg-[#0f6b5c] hover:bg-[#0b5347] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
                    >
                      <span>Continue</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={mutation.isPending}
                      className="flex items-center gap-2 rounded-xl bg-[#0f6b5c] hover:bg-[#0b5347] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span>{mutation.isPending ? "Registering..." : "Complete Registration"}</span>
                    </button>
                  )}

                  <Link
                    href={`/hackathons/${hackathon.slug || hackathon.id}`}
                    className="text-xs font-semibold text-[#57685f] hover:text-[#122622] transition-colors"
                  >
                    Cancel
                  </Link>
                </div>

                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-5 py-2.5 text-xs font-bold text-[#57685f] shadow-2xs transition-all cursor-pointer"
                  >
                    Back
                  </button>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* ================= FOOTER ================= */}
        <footer className="mt-16 border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#57685f]">
          <p>© 2026 {hackathon.title} Hackathon</p>
          <div className="flex items-center gap-6">
            <span className="hover:underline cursor-pointer">Community Guidelines</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Official Rules</span>
            <span className="hover:underline cursor-pointer">Help Center</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
