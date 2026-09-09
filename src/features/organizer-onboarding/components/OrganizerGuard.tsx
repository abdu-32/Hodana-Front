"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname, Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import {
  fetchMyOrganizations,
  getOrganizerVerificationState,
  isApprovedOrganizer,
  type MyOrganization,
  type OrganizerVerificationState,
} from "../lib/organizer-store";
import {
  Clock,
  AlertTriangle,
  Building2,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  FileText,
  User,
  ExternalLink,
} from "lucide-react";
import { Logomark } from "@/components/ui/Logomark";

interface OrganizerGuardProps {
  children: ReactNode;
}

export function OrganizerGuard({ children }: OrganizerGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, refreshUser } = useSession();

  const [isChecking, setIsChecking] = useState(true);
  const [myOrgs, setMyOrgs] = useState<MyOrganization[]>([]);
  const [verificationState, setVerificationState] = useState<{
    status: OrganizerVerificationState;
    activeOrg: MyOrganization | null;
    rejectionReason?: string | null;
  }>({
    status: "none",
    activeOrg: null,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkStatus = async () => {
    setIsRefreshing(true);
    try {
      if (refreshUser) {
        await refreshUser();
      }
      const orgs = await fetchMyOrganizations();
      setMyOrgs(orgs);
      const state = getOrganizerVerificationState(user, orgs);
      setVerificationState(state);
    } catch (err) {
      console.error("Failed checking organizer verification status:", err);
    } finally {
      setIsChecking(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isApprovedOrganizer(user)) {
      setVerificationState({ status: "approved", activeOrg: null });
      setIsChecking(false);
      fetchMyOrganizations()
        .then((orgs) => {
          setMyOrgs(orgs);
          setVerificationState(getOrganizerVerificationState(user, orgs));
        })
        .catch(() => {});
      return;
    }

    checkStatus();
  }, [isLoading, isAuthenticated, user, pathname]);

  if (isLoading || isChecking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f3f6f4] p-4 text-[#122622]">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#d6e7e1] bg-white p-8 shadow-md">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0f6b5c] border-t-transparent" />
          <div className="text-center">
            <p className="font-display text-base font-extrabold text-[#122622]">
              Verifying Organizer Access
            </p>
            <p className="text-xs font-semibold text-[#57685f] mt-1">
              Checking institutional verification and role permissions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 1. APPROVED: Render dashboard content
  if (verificationState.status === "approved") {
    return <>{children}</>;
  }

  // 2. PENDING: Application submitted and awaiting admin approval
  if (verificationState.status === "pending") {
    const org = verificationState.activeOrg;
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f6f4] px-4 py-12 text-[#122622]">
        <div className="w-full max-w-xl rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-8 shadow-lg">
          {/* Header Badge */}
          <div className="flex items-center justify-between pb-6 border-b border-[#e8f3f0]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f3f0] border border-[#d6e7e1] p-2">
                <Logomark className="h-full w-full object-contain" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-0.5 text-[11px] font-extrabold text-amber-800">
                  <Clock className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                  APPLICATION UNDER REVIEW
                </span>
                <h1 className="font-display text-xl font-extrabold text-[#122622] mt-1">
                  Organizer Access Pending
                </h1>
              </div>
            </div>
            <button
              onClick={checkStatus}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-xl border border-[#d6e7e1] bg-[#f8faf9] px-3 py-1.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#e8f3f0] transition-colors disabled:opacity-50"
              title="Refresh status"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="mt-6 space-y-4 text-xs font-medium text-[#57685f]">
            <div className="rounded-2xl bg-[#f8faf9] border border-[#d6e7e1] p-4">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[#122622] mb-1">
                <Building2 className="h-4 w-4 text-[#0f6b5c]" />
                <span>{org?.name || "Your Organization"}</span>
              </div>
              <p className="text-[11px] text-[#57685f]">
                Registered Contact: <strong className="text-[#122622]">{org?.contactEmail || user?.email}</strong>
              </p>
              {org?.type && (
                <p className="text-[11px] text-[#57685f] capitalize">
                  Type: <strong className="text-[#122622]">{org.type}</strong>
                </p>
              )}
            </div>

            <div className="space-y-2 rounded-2xl bg-amber-50/60 border border-amber-200/80 p-4 text-amber-950">
              <p className="font-bold flex items-center gap-1.5 text-xs text-amber-900">
                <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
                Platform Verification in Progress
              </p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Thank you for applying to host hackathons on HODANA. Our platform administrators review institutional credentials to ensure event integrity and security.
              </p>
              <ul className="list-disc pl-4 text-[11px] space-y-1 text-amber-800 pt-1">
                <li>Reviews are completed within <strong>24–48 hours</strong>.</li>
                <li>Once approved, you will receive an email confirmation and this dashboard will unlock automatically.</li>
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
              onClick={checkStatus}
              disabled={isRefreshing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] px-5 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#0c574a] transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Check Verification Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. REJECTED: Application was reviewed and rejected with feedback
  if (verificationState.status === "rejected") {
    const org = verificationState.activeOrg;
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f6f4] px-4 py-12 text-[#122622]">
        <div className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-6 sm:p-8 shadow-lg">
          {/* Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-red-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 border border-red-200 p-2 text-red-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-0.5 text-[11px] font-extrabold text-red-800">
                APPLICATION REQUIRES UPDATES
              </span>
              <h1 className="font-display text-xl font-extrabold text-[#122622] mt-1">
                Verification Review Update
              </h1>
            </div>
          </div>

          {/* Feedback details */}
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-red-50/60 border border-red-200 p-4 text-xs">
              <p className="font-bold text-red-900 mb-1">Feedback from Platform Administrator:</p>
              <p className="text-red-800 leading-relaxed bg-white/80 p-3 rounded-xl border border-red-100 font-mono text-[11px]">
                {verificationState.rejectionReason || "Please provide valid institutional registration documents."}
              </p>
            </div>

            <p className="text-xs text-[#57685f]">
              You can update your organization details or attach the requested accreditation documentation and re-submit for expedited review.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#e8f3f0]">
            <Link
              href="/"
              className="w-full sm:w-auto text-center rounded-xl border border-[#d6e7e1] px-4 py-2 text-xs font-bold text-[#57685f] hover:bg-[#f3f6f4]"
            >
              Back to Home
            </Link>
            <Link
              href="/onboarding/organizer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] px-5 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#0c574a]"
            >
              <span>Update Application</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. NONE: User has never applied for organizer access -> Redirect to onboarding form
  useEffect(() => {
    if (!isLoading && !isChecking && verificationState.status === "none") {
      router.replace("/onboarding/organizer");
    }
  }, [isLoading, isChecking, verificationState.status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f6f4] px-4 py-12 text-[#122622]">
      <div className="w-full max-w-lg rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-8 shadow-lg text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-[#e8f3f0] border border-[#d6e7e1] p-3 mb-4">
          <Building2 className="h-full w-full text-[#0f6b5c]" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f3f0] border border-[#d6e7e1] px-3.5 py-1 text-xs font-extrabold text-[#0f6b5c]">
          ORGANIZER APPLICATION REQUIRED
        </span>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-[#122622]">
          Redirecting to Application...
        </h1>
        <p className="mt-2 text-xs font-medium text-[#57685f] leading-relaxed">
          Please complete your organizer verification application to host events on HODANA.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/onboarding/organizer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#0c574a]"
          >
            <span>Go to Organizer Application</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
