"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname, Link } from "@/i18n/navigation";
import { useSession } from "@/features/auth";
import { ShieldAlert, ShieldCheck, ArrowRight, Lock, Home, LayoutDashboard } from "lucide-react";
import { Logomark } from "@/components/ui/Logomark";

interface AdminGuardProps {
  children: ReactNode;
}

const PLATFORM_ADMIN_EMAIL = "abdulhalimaliyi54@gmail.com";

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useSession();
  const [countdown, setCountdown] = useState(3);

  const isPlatformAdmin = Boolean(
    isAuthenticated &&
      user &&
      (user.email?.toLowerCase() === PLATFORM_ADMIN_EMAIL ||
        user.roles?.some((r) => r.toLowerCase() === "admin" || r.toLowerCase() === "platform_admin") ||
        (user as any).role === "admin")
  );

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!isPlatformAdmin) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            router.replace("/dashboard");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLoading, isAuthenticated, isPlatformAdmin, pathname, router]);

  // 1. Loading state while verifying credentials
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f3f6f4] p-4 text-[#122622]">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#d6e7e1] bg-white p-8 shadow-md">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0f6b5c] border-t-transparent" />
          <div className="text-center">
            <p className="font-display text-base font-extrabold text-[#122622]">
              Verifying Platform Admin Credentials
            </p>
            <p className="text-xs font-semibold text-[#57685f] mt-1">
              Validating administrator authorization and role privileges...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: redirected to login (fallback skeleton)
  if (!isAuthenticated) {
    return null;
  }

  // 3. Unauthorized: Not platform admin -> show Access Denied & countdown to redirect
  if (!isPlatformAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f6f4] px-4 py-12 text-[#122622]">
        <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-6 sm:p-8 shadow-lg text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 border border-red-200 p-3 mb-4 text-red-600">
            <ShieldAlert className="h-full w-full" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3.5 py-1 text-xs font-extrabold text-red-800">
            RESTRICTED ACCESS
          </span>

          <h1 className="mt-3 font-display text-2xl font-extrabold text-[#122622]">
            Platform Admin Privileges Required
          </h1>

          <p className="mt-2 text-xs font-medium text-[#57685f] leading-relaxed">
            You are signed in as <strong className="text-[#122622]">{user?.email}</strong>. This section is strictly reserved for the authorized platform administrator.
          </p>

          <div className="mt-4 rounded-2xl bg-[#f8faf9] border border-[#d6e7e1] p-3 text-xs text-[#57685f]">
            <span>Redirecting to standard dashboard in </span>
            <strong className="text-[#0f6b5c] font-bold">{countdown}s</strong>...
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#d6e7e1] bg-white px-5 py-2.5 text-xs font-bold text-[#57685f] hover:bg-[#f3f6f4] transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Go to Home</span>
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#0c574a] transition-all"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Go to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Platform Admin: Render admin route content
  return <>{children}</>;
}
