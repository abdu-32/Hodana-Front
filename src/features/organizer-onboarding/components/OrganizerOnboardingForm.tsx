"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import {
  User,
  Mail,
  Briefcase,
  Phone,
  Building2,
  Globe,
  Users,
  Upload,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  X,
  FileImage,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useRouter, Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { Logomark } from "@/components/ui/Logomark";
import {
  type OrganizerOnboardingData,
  type FormErrors,
  validateOrganizerOnboardingForm,
  validateWorkEmail,
  validateWebsiteUrl,
} from "../lib/organizer-schema";
import {
  saveOrganizerProfile,
  fetchMyOrganizations,
  getOrganizerVerificationState,
  type MyOrganization,
} from "../lib/organizer-store";

const COUNTRY_CODES = [
  { code: "+251", country: "Ethiopia (🇪🇹)" },
  { code: "+1", country: "USA / Canada (🇺🇸)" },
  { code: "+44", country: "United Kingdom (🇬🇧)" },
  { code: "+49", country: "Germany (🇩🇪)" },
  { code: "+254", country: "Kenya (🇰🇪)" },
  { code: "+971", country: "UAE (🇦🇪)" },
  { code: "+91", country: "India (🇮🇳)" },
];

export function OrganizerOnboardingForm() {
  const router = useRouter();
  const { user, updateUser, refreshUser } = useSession();

  const [formData, setFormData] = useState<OrganizerOnboardingData>({
    firstName: "",
    lastName: "",
    jobTitle: "",
    workEmail: "",
    countryCode: "+251",
    phoneNumber: "",
    companyName: "",
    companyWebsite: "",
    teamSize: "",
    logoUrl: "",
    planningType: "",
    targetTimeline: "",
    estimatedParticipants: "",
    aboutEventGoals: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [submittedOrg, setSubmittedOrg] = useState<MyOrganization | null>(null);
  const [isCheckingInitialOrg, setIsCheckingInitialOrg] = useState(true);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Check initial organization status on mount
  useEffect(() => {
    let mounted = true;
    async function checkInitialOrg() {
      try {
        const orgs = await fetchMyOrganizations();
        if (!mounted) return;
        const state = getOrganizerVerificationState(user, orgs);
        if (state.status === "approved") {
          router.replace("/organizer/dashboard");
          return;
        }
        if (state.status === "pending") {
          setSubmittedOrg(state.activeOrg);
          setIsPendingApproval(true);
        }
      } catch (err) {
        console.warn("Could not check organization status:", err);
      } finally {
        if (mounted) {
          setIsCheckingInitialOrg(false);
        }
      }
    }

    if (user) {
      checkInitialOrg();
    } else {
      setIsCheckingInitialOrg(false);
    }

    return () => {
      mounted = false;
    };
  }, [user, router]);

  // Pre-fill first/last name & email from session if available
  useEffect(() => {
    if (user) {
      const names = (user.fullName || "").trim().split(" ");
      const first = names[0] || "";
      const last = names.slice(1).join(" ") || "";
      
      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || first,
        lastName: prev.lastName || last,
        workEmail: prev.workEmail || user.email || "",
      }));
    }
  }, [user]);

  // Handle Input Changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear inline error on edit
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle Logo Upload
  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size limit (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        logoFile: "Logo file exceeds the maximum 2MB size limit.",
      }));
      return;
    }

    setLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLogoPreviewUrl(objectUrl);
    setFormData((prev) => ({ ...prev, logoUrl: objectUrl }));
    setErrors((prev) => ({ ...prev, logoFile: undefined }));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreviewUrl(null);
  };

  // Check Status button handler
  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    try {
      if (refreshUser) {
        await refreshUser();
      }
      const orgs = await fetchMyOrganizations();
      const state = getOrganizerVerificationState(user, orgs);
      if (state.status === "approved") {
        router.replace("/organizer/dashboard");
        return;
      }
      if (state.activeOrg) {
        setSubmittedOrg(state.activeOrg);
      }
    } catch (err) {
      console.error("Failed checking verification status:", err);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = validateOrganizerOnboardingForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Scroll to first error field
      const firstErrorKey = Object.keys(validationErrors)[0];
      const element = document.getElementsByName(firstErrorKey)[0];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save local organizer profile for seamless frontend persistence
      saveOrganizerProfile(formData);

      // 2. Map form data to backend organization payload
      let orgType: "company" | "university" | "ngo" | "government" = "company";
      const pt = (formData.planningType || "").toLowerCase();
      if (pt.includes("university") || pt.includes("student") || pt.includes("academic")) {
        orgType = "university";
      } else if (pt.includes("non-profit") || pt.includes("ngo") || pt.includes("community")) {
        orgType = "ngo";
      } else if (pt.includes("government") || pt.includes("ministry")) {
        orgType = "government";
      }

      let domain: string | undefined = undefined;
      if (formData.companyWebsite) {
        try {
          const urlStr = formData.companyWebsite.startsWith("http")
            ? formData.companyWebsite
            : `https://${formData.companyWebsite}`;
          const urlObj = new URL(urlStr);
          domain = urlObj.hostname.replace(/^www\./, "").toLowerCase();
        } catch {}
      } else if (formData.workEmail && formData.workEmail.includes("@")) {
        domain = formData.workEmail.split("@")[1].toLowerCase();
      }

      // 3. Register Organization in backend
      const { authFetch } = await import("@/lib/api-client");
      const email = formData.workEmail || user?.email || "organizer@hodana.et";
      const orgPayload = {
        name: formData.companyName || `${formData.firstName}'s Organization`,
        type: orgType,
        contactEmail: email,
        contact_email: email,
        primaryEmailDomain: domain,
        primary_email_domain: domain,
      };

      const registeredOrg = await authFetch<MyOrganization>("/organizations/", {
        method: "POST",
        body: JSON.stringify(orgPayload),
      });

      // 4. Update session profile so UI reflects the pending application
      if (refreshUser) {
        await refreshUser();
      }

      setSubmittedOrg(registeredOrg);
      setIsPendingApproval(true);
      setShowSuccessToast(true);
    } catch (err: any) {
      console.error("Failed to register organization in backend:", err);
      const errMsg = err?.message || "Failed to submit application. Please check your inputs.";
      setErrors((prev) => ({ ...prev, companyName: errMsg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // WAITING FOR APPROVAL SCREEN
  if (isPendingApproval) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f6f4] px-4 py-12 text-[#122622]">
        <div className="w-full max-w-xl rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-8 shadow-lg animate-fade-in">
          {/* Header Badge */}
          <div className="flex items-center justify-between pb-6 border-b border-[#e8f3f0]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f3f0] border border-[#d6e7e1] p-2">
                <Logomark className="h-full w-full object-contain" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-0.5 text-[11px] font-extrabold text-amber-800">
                  <Clock className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                  APPLICATION SUBMITTED
                </span>
                <h1 className="font-display text-xl font-extrabold text-[#122622] mt-1">
                  Waiting for Approval
                </h1>
              </div>
            </div>
            <button
              onClick={handleCheckStatus}
              disabled={isCheckingStatus}
              className="flex items-center gap-1.5 rounded-xl border border-[#d6e7e1] bg-[#f8faf9] px-3 py-1.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#e8f3f0] transition-colors disabled:opacity-50"
              title="Refresh status"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isCheckingStatus ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Check Status</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="mt-6 space-y-4 text-xs font-medium text-[#57685f]">
            <div className="rounded-2xl bg-[#f8faf9] border border-[#d6e7e1] p-4">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[#122622] mb-1">
                <Building2 className="h-4 w-4 text-[#0f6b5c]" />
                <span>{submittedOrg?.name || formData.companyName || "Your Organization"}</span>
              </div>
              <p className="text-[11px] text-[#57685f]">
                Registered Contact: <strong className="text-[#122622]">{submittedOrg?.contactEmail || formData.workEmail || user?.email}</strong>
              </p>
              <p className="text-[11px] text-[#57685f] mt-1">
                Status: <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">Awaiting Platform Admin Approval</span>
              </p>
            </div>

            <div className="space-y-2 rounded-2xl bg-amber-50/60 border border-amber-200/80 p-4 text-amber-950">
              <p className="font-bold flex items-center gap-1.5 text-xs text-amber-900">
                <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
                Under Platform Administrator Review
              </p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Your application to become an organizer has been received and is currently under review by our platform administration team.
              </p>
              <ul className="list-disc pl-4 text-[11px] space-y-1 text-amber-800 pt-1">
                <li>Reviews are completed within <strong>24–48 hours</strong>.</li>
                <li>When approved, your <strong>Organizer Dashboard</strong> will unlock automatically.</li>
                <li>No email links or activation steps are needed — your existing login will have organizer access.</li>
              </ul>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#e8f3f0]">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href="/"
                className="w-full sm:w-auto text-center rounded-xl border border-[#d6e7e1] px-4 py-2 text-xs font-bold text-[#57685f] hover:bg-[#f3f6f4] transition-colors"
              >
                Back to Home
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto text-center rounded-xl border border-[#d6e7e1] px-4 py-2 text-xs font-bold text-[#57685f] hover:bg-[#f3f6f4] transition-colors"
              >
                Participant Dashboard
              </Link>
            </div>
            <button
              onClick={handleCheckStatus}
              disabled={isCheckingStatus}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] px-5 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#0c574a] transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isCheckingStatus ? "animate-spin" : ""}`} />
              Check Verification Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6f4] py-8 px-4 sm:px-6 lg:px-8 text-[#122622]">
      <div className="mx-auto max-w-4xl">
        {/* Top Header Card */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#e8f3f0] border border-[#d6e7e1] p-2 shadow-xs mb-4">
            <Logomark className="h-full w-full object-contain" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f3f0] border border-[#d6e7e1] px-3.5 py-1 text-xs font-extrabold text-[#0f6b5c] shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-[#0f6b5c]" />
            ORGANIZER VERIFICATION & ONBOARDING
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-[#122622]">
            Become an Event Organizer
          </h1>
          <p className="mt-2 max-w-xl text-xs sm:text-sm font-medium text-[#57685f]">
            Complete your organizer profile and organization details to unlock hackathon hosting, judging tools, and prize management.
          </p>
        </div>

        {/* Confirmation Success Toast */}
        {showSuccessToast && (
          <div className="mb-6 flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 shadow-md animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-extrabold">Organizer Verification Complete!</p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Your profile has been saved. Redirecting to your Organizer Dashboard...
                </p>
              </div>
            </div>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </div>
        )}

        {/* Main Onboarding Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-8 rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-10 shadow-sm"
        >
          {/* ================= SECTION 1: CONTACT DETAILS ================= */}
          <div className="flex flex-col gap-5 border-b border-[#d6e7e1] pb-8">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c] font-extrabold text-sm shadow-2xs">
                1
              </span>
              <div>
                <h2 className="font-display text-lg font-extrabold text-[#122622]">
                  Contact Details
                </h2>
                <p className="text-xs text-[#57685f]">
                  Primary contact person responsible for event coordination.
                </p>
              </div>
            </div>

            {/* 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* First Name */}
              <div>
                <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. Abeba"
                    className={`h-11 w-full rounded-2xl border bg-[#f3f6f4]/30 pl-10 pr-4 text-xs font-bold text-[#122622] outline-none transition-all focus:bg-white focus:ring-2 ${
                      errors.firstName
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                        : "border-[#d6e7e1] focus:border-[#0f6b5c] focus:ring-[#0f6b5c]/20"
                    }`}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-[11px] font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.firstName}</span>
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Selassie"
                    className={`h-11 w-full rounded-2xl border bg-[#f3f6f4]/30 pl-10 pr-4 text-xs font-bold text-[#122622] outline-none transition-all focus:bg-white focus:ring-2 ${
                      errors.lastName
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                        : "border-[#d6e7e1] focus:border-[#0f6b5c] focus:ring-[#0f6b5c]/20"
                    }`}
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-[11px] font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.lastName}</span>
                  </p>
                )}
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="e.g. Head of Innovation / Lead Organizer"
                    className={`h-11 w-full rounded-2xl border bg-[#f3f6f4]/30 pl-10 pr-4 text-xs font-bold text-[#122622] outline-none transition-all focus:bg-white focus:ring-2 ${
                      errors.jobTitle
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                        : "border-[#d6e7e1] focus:border-[#0f6b5c] focus:ring-[#0f6b5c]/20"
                    }`}
                  />
                </div>
                {errors.jobTitle && (
                  <p className="mt-1 text-[11px] font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.jobTitle}</span>
                  </p>
                )}
              </div>

              {/* Work Email */}
              <div>
                <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="workEmail"
                    value={formData.workEmail}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className={`h-11 w-full rounded-2xl border bg-[#f3f6f4]/30 pl-10 pr-4 text-xs font-bold text-[#122622] outline-none transition-all focus:bg-white focus:ring-2 ${
                      errors.workEmail
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                        : "border-[#d6e7e1] focus:border-[#0f6b5c] focus:ring-[#0f6b5c]/20"
                    }`}
                  />
                </div>
                {errors.workEmail ? (
                  <p className="mt-1 text-[11px] font-bold text-red-500 flex items-start gap-1">
                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>{errors.workEmail}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-[10px] font-semibold text-[#57685f]">
                    Must be your official work email (no free domains like Gmail/Yahoo).
                  </p>
                )}
              </div>

              {/* Phone Number with Country Code Selector */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="h-11 rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4]/40 px-3 text-xs font-extrabold text-[#122622] outline-none focus:border-[#0f6b5c]"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} {c.country}
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="911 234 567"
                      className={`h-11 w-full rounded-2xl border bg-[#f3f6f4]/30 pl-10 pr-4 text-xs font-bold text-[#122622] outline-none transition-all focus:bg-white focus:ring-2 ${
                        errors.phoneNumber
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                          : "border-[#d6e7e1] focus:border-[#0f6b5c] focus:ring-[#0f6b5c]/20"
                      }`}
                    />
                  </div>
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-[11px] font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.phoneNumber}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ================= SECTION 2: ORGANIZATION INFORMATION ================= */}
          <div className="flex flex-col gap-5 border-b border-[#d6e7e1] pb-8">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c] font-extrabold text-sm shadow-2xs">
                2
              </span>
              <div>
                <h2 className="font-display text-lg font-extrabold text-[#122622]">
                  Organization Information
                </h2>
                <p className="text-xs text-[#57685f]">
                  Tell us about the company or institution hosting the event.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Company Name */}
              <div>
                <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                  Company / Organization Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Ministry of Innovation & Tech"
                    className={`h-11 w-full rounded-2xl border bg-[#f3f6f4]/30 pl-10 pr-4 text-xs font-bold text-[#122622] outline-none transition-all focus:bg-white focus:ring-2 ${
                      errors.companyName
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                        : "border-[#d6e7e1] focus:border-[#0f6b5c] focus:ring-[#0f6b5c]/20"
                    }`}
                  />
                </div>
                {errors.companyName && (
                  <p className="mt-1 text-[11px] font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.companyName}</span>
                  </p>
                )}
              </div>

              {/* Company Website */}
              <div>
                <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                  Company Website <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className={`h-11 w-full rounded-2xl border bg-[#f3f6f4]/30 pl-10 pr-4 text-xs font-bold text-[#122622] outline-none transition-all focus:bg-white focus:ring-2 ${
                      errors.companyWebsite
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                        : "border-[#d6e7e1] focus:border-[#0f6b5c] focus:ring-[#0f6b5c]/20"
                    }`}
                  />
                </div>
                {errors.companyWebsite && (
                  <p className="mt-1 text-[11px] font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.companyWebsite}</span>
                  </p>
                )}
              </div>

              {/* Number of Employees / Team Size */}
              <div>
                <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                  Team / Employee Size <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleChange}
                    className={`h-11 w-full rounded-2xl border bg-[#f3f6f4]/30 pl-10 pr-4 text-xs font-bold text-[#122622] outline-none transition-all focus:bg-white focus:ring-2 ${
                      errors.teamSize
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                        : "border-[#d6e7e1] focus:border-[#0f6b5c] focus:ring-[#0f6b5c]/20"
                    }`}
                  >
                    <option value="">Select Employee Range...</option>
                    <option value="1-10">1 - 10 Employees</option>
                    <option value="11-50">11 - 50 Employees</option>
                    <option value="51-200">51 - 200 Employees</option>
                    <option value="201-1000">201 - 1,000 Employees</option>
                    <option value="1000+">1,000+ Employees</option>
                  </select>
                </div>
                {errors.teamSize && (
                  <p className="mt-1 text-[11px] font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.teamSize}</span>
                  </p>
                )}
              </div>

              {/* Organization Logo File Upload */}
              <div>
                <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                  Organization Logo (.png, .jpg, .svg, max 2MB)
                </label>
                {logoPreviewUrl ? (
                  <div className="flex items-center justify-between rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0]/30 p-2.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={logoPreviewUrl}
                        alt="Logo preview"
                        className="h-10 w-10 rounded-xl object-contain bg-white border border-[#d6e7e1] p-1"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#122622] truncate max-w-[180px]">
                          {logoFile?.name || "logo.png"}
                        </p>
                        <p className="text-[10px] text-[#57685f]">
                          {logoFile ? `${(logoFile.size / 1024).toFixed(1)} KB` : "Uploaded"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove Logo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <label className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#d6e7e1] bg-[#f3f6f4]/40 px-4 text-xs font-extrabold text-[#0f6b5c] hover:bg-[#e8f3f0] transition-all cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <span>Choose Logo File...</span>
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
                {errors.logoFile && (
                  <p className="mt-1 text-[11px] font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.logoFile}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ================= SECTION 3: EVENT & PLANNING DETAILS ================= */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#e8f3f0] text-[#0f6b5c] font-extrabold text-sm shadow-2xs">
                3
              </span>
              <div>
                <h2 className="font-display text-lg font-extrabold text-[#122622]">
                  Event & Planning Details
                </h2>
                <p className="text-xs text-[#57685f]">
                  Tell us about your upcoming hackathon or innovation challenge.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {/* Planning Type */}
              <div>
                <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                  What are you planning? <span className="text-red-500">*</span>
                </label>
                <select
                  name="planningType"
                  value={formData.planningType}
                  onChange={handleChange}
                  className={`h-11 w-full rounded-2xl border bg-[#f3f6f4]/30 px-4 text-xs font-bold text-[#122622] outline-none transition-all focus:bg-white focus:ring-2 ${
                    errors.planningType
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                      : "border-[#d6e7e1] focus:border-[#0f6b5c] focus:ring-[#0f6b5c]/20"
                  }`}
                >
                  <option value="">Select Event Type...</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Conference">Conference</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Hiring Challenge">Hiring Challenge</option>
                  <option value="Other">Other</option>
                </select>
                {errors.planningType && (
                  <p className="mt-1 text-[11px] font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.planningType}</span>
                  </p>
                )}
              </div>

              {/* Target Timeline */}
              <div>
                <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                  Target Launch Date <span className="text-red-500">*</span>
                </label>
                <select
                  name="targetTimeline"
                  value={formData.targetTimeline}
                  onChange={handleChange}
                  className={`h-11 w-full rounded-2xl border bg-[#f3f6f4]/30 px-4 text-xs font-bold text-[#122622] outline-none transition-all focus:bg-white focus:ring-2 ${
                    errors.targetTimeline
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                      : "border-[#d6e7e1] focus:border-[#0f6b5c] focus:ring-[#0f6b5c]/20"
                  }`}
                >
                  <option value="">Select Timeline...</option>
                  <option value="< 1 month">&lt; 1 month</option>
                  <option value="1-3 months">1 - 3 months</option>
                  <option value="3-6 months">3 - 6 months</option>
                  <option value="Flexible">Flexible</option>
                </select>
                {errors.targetTimeline && (
                  <p className="mt-1 text-[11px] font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.targetTimeline}</span>
                  </p>
                )}
              </div>

              {/* Estimated Participants */}
              <div>
                <label className="block text-xs font-extrabold text-[#122622] mb-1.5">
                  Estimated Participants <span className="text-red-500">*</span>
                </label>
                <select
                  name="estimatedParticipants"
                  value={formData.estimatedParticipants}
                  onChange={handleChange}
                  className={`h-11 w-full rounded-2xl border bg-[#f3f6f4]/30 px-4 text-xs font-bold text-[#122622] outline-none transition-all focus:bg-white focus:ring-2 ${
                    errors.estimatedParticipants
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                      : "border-[#d6e7e1] focus:border-[#0f6b5c] focus:ring-[#0f6b5c]/20"
                  }`}
                >
                  <option value="">Select Capacity...</option>
                  <option value="< 100">&lt; 100 participants</option>
                  <option value="100-500">100 - 500 participants</option>
                  <option value="500-2000">500 - 2,000 participants</option>
                  <option value="2000+">2,000+ participants</option>
                </select>
                {errors.estimatedParticipants && (
                  <p className="mt-1 text-[11px] font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.estimatedParticipants}</span>
                  </p>
                )}
              </div>
            </div>

            {/* About the Organization / Event Goals */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold text-[#122622]">
                  About the Organization / Event Goals <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] font-bold text-[#57685f]">
                  {formData.aboutEventGoals.trim().length} / 50 min chars
                </span>
              </div>
              <textarea
                name="aboutEventGoals"
                rows={4}
                value={formData.aboutEventGoals}
                onChange={handleChange}
                placeholder="Describe your organization's mission, target event objectives, prize scope, or ecosystem goals (minimum 50 characters required)..."
                className={`w-full rounded-2xl border bg-[#f3f6f4]/30 p-4 text-xs font-medium text-[#122622] outline-none transition-all focus:bg-white focus:ring-2 ${
                  errors.aboutEventGoals
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-[#d6e7e1] focus:border-[#0f6b5c] focus:ring-[#0f6b5c]/20"
                }`}
              />
              {errors.aboutEventGoals && (
                <p className="mt-1 text-[11px] font-bold text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.aboutEventGoals}</span>
                </p>
              )}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#d6e7e1] pt-6">
            <p className="text-xs font-semibold text-[#57685f]">
              By submitting, you agree to HODANA Ecosystem Organizer terms & guidelines.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-[#0f6b5c] hover:bg-[#0b5347] px-8 py-3 text-xs font-extrabold text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Verifying & Saving...</span>
                </>
              ) : (
                <>
                  <span>Complete Verification & Access Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
