"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { useSession } from "./SessionProvider";

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
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className={`inline-flex min-h-[38px] items-center justify-center rounded-xl px-3.5 text-xs sm:text-sm font-semibold transition-colors ${
            isLoginActive
              ? "text-[#4338CA] bg-indigo-50"
              : "text-[#1E1E38] hover:text-[#4338CA] hover:bg-gray-100"
          }`}
        >
          {t("login")}
        </Link>
        <Link
          href="/signup"
          className="inline-flex min-h-[38px] items-center justify-center rounded-xl bg-[#4338CA] px-4.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-[#3730A3] hover:shadow-md"
        >
          Register
        </Link>
      </div>
    );
  }

  const initial = user.fullName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/settings/profile"
        className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-[#1E1E38] hover:bg-gray-100 hover:text-[#4338CA] transition-colors"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="h-7 w-7 rounded-full object-cover ring-2 ring-[#4338CA]/20"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4338CA] text-xs font-bold text-white shadow-xs"
          >
            {initial}
          </span>
        )}
        <span className="hidden sm:inline">{user.fullName}</span>
      </Link>
      <Button
        variant="secondary"
        size="sm"
        onClick={async () => {
          await logout();
          router.push("/");
        }}
      >
        {t("logout")}
      </Button>
    </div>
  );
}
