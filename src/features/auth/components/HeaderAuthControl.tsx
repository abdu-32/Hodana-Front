"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { useSession } from "./SessionProvider";

export const NAV_LINK_BASE = "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors";
export const NAV_LINK_ACTIVE = "px-3 py-1.5 rounded-lg text-xs font-bold text-[#0f6b5c] bg-[#e8f3f0]";
export const NAV_LINK_INACTIVE = "px-3 py-1.5 rounded-lg text-xs font-semibold text-[#57685f] hover:text-[#0f6b5c] transition-colors";

export function HeaderAuthControl() {
  const t = useTranslations("Nav");
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useSession();

  if (isLoading) {
    return <div className="h-9 w-20 animate-pulse rounded-xl bg-gray-200" aria-hidden="true" />;
  }

  if (!user) {
    const isLoginActive = pathname === "/login";
    const isSignupActive = pathname === "/signup";

    return (
      <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2.5">
        <Link
          href="/login"
          className={`inline-flex min-h-[32px] sm:min-h-[38px] items-center justify-center rounded-xl px-2 xs:px-2.5 sm:px-3.5 text-xs sm:text-sm font-semibold transition-colors ${
            isLoginActive
              ? "text-[#0f6b5c] bg-[#e8f3f0]"
              : "text-[#122622] hover:text-[#0f6b5c] hover:bg-gray-100"
          }`}
        >
          {t("login")}
        </Link>
        <Link
          href="/signup"
          className="hidden xs:inline-flex min-h-[32px] sm:min-h-[38px] items-center justify-center rounded-xl bg-[#0f6b5c] px-2.5 xs:px-3 sm:px-4.5 text-xs sm:text-sm font-bold text-white shadow-xs transition-all hover:bg-[#0b5347] hover:shadow-md"
        >
          Register
        </Link>
      </div>
    );
  }

  const initial = user.fullName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-[#d6e7e1] bg-white px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#122622] shadow-2xs hover:border-[#b5d6cc] hover:bg-[#f3f6f4] hover:text-[#0f6b5c] transition-all"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="h-6 w-6 rounded-full object-cover ring-2 ring-[#0f6b5c]/20"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f6b5c] text-[11px] font-extrabold text-white shadow-xs"
          >
            {initial}
          </span>
        )}
        <span className="hidden sm:inline font-bold text-xs max-w-[120px] truncate">{user.fullName}</span>
      </Link>
      <button
        type="button"
        onClick={async () => {
          await logout();
          router.push("/");
        }}
        className="hidden xs:inline-flex sm:inline-flex min-h-[34px] sm:min-h-[38px] items-center justify-center rounded-xl border border-[#d6e7e1] bg-white px-2.5 sm:px-3.5 text-xs sm:text-sm font-semibold text-[#57685f] shadow-2xs hover:bg-gray-50 hover:text-[#122622] transition-colors cursor-pointer"
      >
        {t("logout")}
      </button>
    </div>
  );
}
