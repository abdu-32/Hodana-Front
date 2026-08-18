"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Gavel,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Lock,
  Mail,
  Sparkles,
  Award,
  BookOpen,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Logomark } from "@/components/ui/Logomark";
import { useSession } from "@/features/auth";
import { judgeClient } from "@/features/judging/lib/judge-client";

function AcceptJudgeInviteContent() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "jinv_agri_2024";

  const { user } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form inputs for non-authenticated or onboarding judges
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "judge.expert@ethiopia.gov.et");
  const [expertise, setExpertise] = useState("AI/ML & AgriTech Systems");
  const [bio, setBio] = useState("Senior AI Researcher specializing in computer vision for agriculture.");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Validate token
    if (!token) {
      setIsValidToken(false);
    }
    setIsLoading(false);
  }, [token]);

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await judgeClient.acceptInvitation(token);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/judge/dashboard");
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to accept judge invitation:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6f4] flex flex-col justify-center items-center p-4 sm:p-6 text-[#122622]">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white border border-[#d6e7e1] shadow-md p-2">
            <Logomark className="h-full w-full object-contain" />
          </span>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#0f6b5c] mt-1">
            HODANA Judging Portal
          </h1>
          <p className="text-xs text-[#57685f]">
            National Innovation Framework Judging Invitation
          </p>
        </div>

        {/* Content Card */}
        <div className="rounded-3xl border border-[#d6e7e1] bg-white p-6 sm:p-8 shadow-xl">
          {isLoading ? (
            <div className="py-12 text-center text-xs font-semibold text-gray-500">
              Validating invitation security token...
            </div>
          ) : !isValidToken ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-extrabold text-[#122622]">
                  Invalid or Expired Invitation Token
                </h3>
                <p className="text-xs text-[#57685f] mt-1">
                  This invitation link is invalid or has already been used. Please contact the hackathon organizer to issue a new invite link.
                </p>
              </div>
              <Link
                href="/login"
                className="mt-2 text-xs font-bold text-[#0f6b5c] hover:underline"
              >
                Return to Login →
              </Link>
            </div>
          ) : isSuccess ? (
            <div className="flex flex-col items-center text-center gap-4 py-6 animate-in fade-in-50">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-2xs">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-display text-lg font-extrabold text-[#122622]">
                  Judge Access Confirmed! ⚖️
                </h3>
                <p className="text-xs text-[#57685f] mt-1">
                  Your account is now elevated as an Official Judge for <strong>AgriTech Hack 2024</strong>. Redirecting to your dashboard...
                </p>
              </div>
              <div className="h-1.5 w-full bg-[#e8f3f0] rounded-full overflow-hidden mt-2">
                <div className="h-full bg-[#0f6b5c] animate-pulse w-full" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleAcceptInvite} className="flex flex-col gap-5">
              {/* Event Badge */}
              <div className="flex items-center gap-3 rounded-2xl bg-[#e8f3f0] border border-[#d6e7e1] p-3.5">
                <Gavel className="h-5 w-5 text-[#0f6b5c] shrink-0" />
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#0f6b5c]">
                    Official Hackathon Invitation
                  </span>
                  <h4 className="font-display text-sm font-extrabold text-[#122622]">
                    AgriTech Hack 2024
                  </h4>
                </div>
              </div>

              {/* Account Setup Fields */}
              <div>
                <label className="block text-xs font-extrabold text-[#122622] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Almaz Abera"
                  className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] px-4 text-xs font-bold text-[#122622] outline-none focus:border-[#0f6b5c]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#122622] mb-1">
                  Target Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] px-4 text-xs font-bold text-[#122622] outline-none focus:border-[#0f6b5c]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#122622] mb-1">
                  Primary Domain Expertise *
                </label>
                <input
                  type="text"
                  required
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  placeholder="e.g. AI/ML, Satellite IoT, FinTech Regulations"
                  className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] px-4 text-xs font-bold text-[#122622] outline-none focus:border-[#0f6b5c]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#122622] mb-1">
                  Brief Bio / Background
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell organizers and participants about your background..."
                  className="w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-3 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
                />
              </div>

              {!user && (
                <div>
                  <label className="block text-xs font-extrabold text-[#122622] mb-1">
                    Set Judge Account Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] px-4 text-xs font-bold text-[#122622] outline-none focus:border-[#0f6b5c]"
                  />
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#0f6b5c] py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer disabled:opacity-50 mt-1"
              >
                <UserCheck className="h-4 w-4" />
                <span>{isProcessing ? "Elevating Role..." : "Accept Invitation & Open Portal"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
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
