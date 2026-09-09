"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Gavel,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Mail,
  Building2,
  XCircle,
  Clock,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Logomark } from "@/components/ui/Logomark";
import { useSession } from "@/features/auth";
import { judgesClient, type JudgeInvitation } from "@/features/judges/lib/judges-client";

function AcceptJudgeInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || searchParams.get("inviteToken") || "token_agri_tadesse_101";

  const { user, isAuthenticated, updateUser } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [invitation, setInvitation] = useState<JudgeInvitation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusState, setStatusState] = useState<"VIEWING" | "ACCEPTED" | "DECLINED" | "INVALID">("VIEWING");

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setStatusState("INVALID");
        setIsLoading(false);
        return;
      }

      try {
        const res = await judgesClient.validateToken(token);
        if (res.data) {
          setInvitation(res.data);
          if (res.data.status === "ACCEPTED") {
            setStatusState("ACCEPTED");
          } else if (res.data.status === "REVOKED" || res.data.status === "DECLINED") {
            setStatusState("DECLINED");
          } else if (res.data.status === "EXPIRED") {
            setStatusState("INVALID");
          } else {
            setStatusState("VIEWING");
          }
        } else {
          setStatusState("INVALID");
          setInvitation(null);
        }
      } catch (err) {
        console.error("Token validation error:", err);
        setStatusState("INVALID");
      } finally {
        setIsLoading(false);
      }
    }

    checkToken();
  }, [token]);

  // Handle Accept Action
  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      if (!isAuthenticated) {
        if (typeof window !== "undefined") {
          localStorage.setItem("hodana_pending_judge_token", token);
        }
        router.push(`/login?next=/accept-judge-invite?token=${encodeURIComponent(token)}`);
        return;
      }

      // Recipient is authenticated: accept invitation and elevate user role
      await judgesClient.acceptInvite({ token });

      if (user) {
        const currentRoles = Array.isArray(user.roles) ? user.roles : [];
        const hasJudgeRole = currentRoles.some((r) => r.toLowerCase().includes("judge"));
        const updatedRoles = hasJudgeRole ? currentRoles : [...currentRoles, "judge"];
        updateUser({
          ...user,
          roles: updatedRoles,
        });
      }

      setStatusState("ACCEPTED");
      setTimeout(() => {
        router.push("/judge/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Failed to accept invitation:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Decline Action
  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      if (!isAuthenticated) {
        router.push(`/login?next=/accept-judge-invite?token=${encodeURIComponent(token)}`);
        return;
      }
      await judgesClient.declineInvite(token);
      setStatusState("DECLINED");
    } catch (err) {
      console.error("Failed to decline invitation:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const recipientName = invitation?.name || user?.fullName || "Distinguished Expert";
  const recipientEmail = invitation?.email || user?.email || "";
  const hackathonTitle = invitation?.hackathonTitle || "Hackathon";
  const organizerNote = invitation?.note || "We would be honored by your participation as an official judge to evaluate innovative solutions.";


  return (
    <div className="min-h-screen bg-[#f3f6f4] flex flex-col justify-center items-center p-4 sm:p-6 text-[#122622]">
      <div className="w-full max-w-xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white border border-[#d6e7e1] shadow-md p-2">
            <Logomark className="h-full w-full object-contain" />
          </span>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#0f6b5c] mt-1">
            HODANA Judging Portal
          </h1>
          <p className="text-xs text-[#57685f]">
            Official Hackathon Judge Invitation
          </p>
        </div>

        {/* Content Card */}
        <div className="rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-8 shadow-xl">
          {isLoading ? (
            <div className="py-12 text-center text-xs font-semibold text-gray-500 flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0f6b5c] border-t-transparent" />
              <span>Validating invitation security token...</span>
            </div>
          ) : statusState === "INVALID" ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-extrabold text-[#122622]">
                  Invalid or Expired Invitation Token
                </h3>
                <p className="text-xs text-[#57685f] mt-1">
                  This invitation link is invalid or has expired. Please contact the hackathon organizer for a new invitation link.
                </p>
              </div>
              <Link
                href="/login"
                className="mt-2 text-xs font-bold text-[#0f6b5c] hover:underline"
              >
                Return to Login →
              </Link>
            </div>
          ) : statusState === "DECLINED" ? (
            <div className="flex flex-col items-center text-center gap-4 py-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-600 shadow-2xs">
                <XCircle className="h-8 w-8 text-gray-500" />
              </div>
              <div>
                <h3 className="font-display text-lg font-extrabold text-[#122622]">
                  Invitation Declined
                </h3>
                <p className="text-xs text-[#57685f] mt-1 max-w-sm">
                  You have declined the judging invitation for <strong>{hackathonTitle}</strong>. Thank you for letting the event organizers know.
                </p>
              </div>
              <Link
                href="/"
                className="mt-3 rounded-2xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b5347] transition-all"
              >
                Return to Home Page
              </Link>
            </div>
          ) : statusState === "ACCEPTED" ? (
            <div className="flex flex-col items-center text-center gap-4 py-6 animate-fade-in">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-2xs">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-display text-lg font-extrabold text-[#122622]">
                  Judge Access Confirmed! ⚖️
                </h3>
                <p className="text-xs text-[#57685f] mt-1">
                  Your account has been elevated as an Official Judge for <strong>{hackathonTitle}</strong>. Redirecting straight to your Judge Dashboard...
                </p>
              </div>
              <div className="h-1.5 w-full bg-[#e8f3f0] rounded-full overflow-hidden mt-2">
                <div className="h-full bg-[#0f6b5c] animate-pulse w-full" />
              </div>
            </div>
          ) : (
            /* ================= STANDARD INVITATION EMAIL VIEW ================= */
            <div className="flex flex-col gap-6">
              {/* Email Envelope Header */}
              <div className="rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4]/60 p-4">
                <div className="flex items-center justify-between border-b border-[#d6e7e1] pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#0f6b5c]" />
                    <span className="text-xs font-extrabold text-[#122622]">
                      Official Judge Invitation Email
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f3f0] px-2.5 py-0.5 text-[10px] font-extrabold text-[#0f6b5c] border border-[#d6e7e1]">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  <p className="text-[#57685f]">
                    <strong className="text-[#122622]">To:</strong> {recipientName} &lt;{recipientEmail}&gt;
                  </p>
                  <p className="text-[#57685f]">
                    <strong className="text-[#122622]">Subject:</strong> Invitation to serve as Official Judge for {hackathonTitle}
                  </p>
                </div>
              </div>

              {/* Email Body Letter Content */}
              <div className="flex flex-col gap-4 text-xs leading-relaxed text-[#122622] bg-white rounded-2xl p-2">
                <p className="font-bold text-sm text-[#0f6b5c]">
                  Dear {recipientName},
                </p>
                <p className="text-[#57685f]">
                  You have been cordially invited to serve as an <strong>Official Judge</strong> for <strong>{hackathonTitle}</strong> on the HODANA National Innovation Portal.
                </p>
                <p className="text-[#57685f]">
                  Your technical expertise, innovation insights, and domain knowledge will play a vital role in evaluating project submissions, providing feedback to participants, and selecting the top winning teams.
                </p>

                {/* Organizer's Personal Note */}
                <div className="rounded-2xl border border-[#d6e7e1] bg-[#e8f3f0]/40 p-4">
                  <p className="text-[11px] font-extrabold text-[#0f6b5c] uppercase tracking-wider mb-1">
                    Personalized Note from Organizer:
                  </p>
                  <p className="text-xs font-medium italic text-[#122622]">
                    &quot;{organizerNote}&quot;
                  </p>
                </div>

                <p className="text-[#57685f]">
                  Please review the invitation and select your response below:
                </p>
              </div>

              {/* Action Buttons: Accept & Decline */}
              <div className="flex flex-col sm:flex-row items-center gap-3 border-t border-[#d6e7e1] pt-5">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleDecline}
                  className="w-full sm:w-1/2 flex items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-5 py-3 text-xs font-bold text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Decline Invitation</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleAccept}
                  className="w-full sm:w-1/2 flex items-center justify-center gap-2 rounded-2xl bg-[#0f6b5c] px-5 py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      <span>Accept Invitation</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AcceptJudgeInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f3f6f4]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0f6b5c] border-t-transparent" />
        </div>
      }
    >
      <AcceptJudgeInviteContent />
    </Suspense>
  );
}
