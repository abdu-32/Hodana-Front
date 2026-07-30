"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { useSession } from "./SessionProvider";

// Button (components/ui/Button.tsx) is a plain <button> wrapper with no
// Slot/asChild support, so a nav "button that's really a link" is styled
// directly rather than composed through it -- same visual language
// (Doc 06 Sec 3.2 --color-primary), just an <a> under the hood so it's a
// real navigation, not a button firing a router.push.
//
// Login and Signup share one base shape (same height, padding, radius) so
// they read as a matched pair of nav controls, not two different UI
// patterns -- they only differ in color treatment, and each one's active
// state is a filled pill so "which page am I on" is equally obvious for
// both, not just for Signup.
export const NAV_LINK_BASE =
  "inline-flex min-h-[36px] items-center justify-center rounded-lg px-3.5 text-sm font-medium tracking-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export const NAV_LINK_ACTIVE = `${NAV_LINK_BASE} bg-primary text-white shadow-sm hover:bg-primary-hover`;

export const NAV_LINK_INACTIVE = `${NAV_LINK_BASE} text-text hover:bg-primary/5 hover:text-primary`;
/*
 * Doc 06 Sec 4.1/4.2: the persistent header shows Login/Signup for
 * unauthenticated visitors, and switches to the signed-in identity once a
 * session exists -- driven entirely by SessionProvider's `user`, never a
 * locally-guessed flag (Sec 2 "server is the source of truth").
 *
 * Active-page highlighting: `usePathname` from `@/i18n/navigation` already
 * strips the locale segment, so it's `/login` / `/signup` / whatever else,
 * never `/en/login` -- an exact match is enough, no `.endsWith` needed.
 * Neither link is "on" for `/forgot-password`, `/reset-password`, or
 * `/verify-email`; they're auth-adjacent pages, not Login or Signup itself.
 */
export function HeaderAuthControl() {
  const t = useTranslations("Nav");
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useSession();

  // Avoid a flash of "Log in" before the mount-time silent refresh settles.
  if (isLoading) {
    return <div className="h-9 w-20" aria-hidden="true" />;
  }

  if (!user) {
    const isLoginActive = pathname === "/login";
    const isSignupActive = pathname === "/signup";

    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          aria-current={isLoginActive ? "page" : undefined}
          className={isLoginActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE}
        >
          {t("login")}
        </Link>
        <Link
          href="/signup"
          aria-current={isSignupActive ? "page" : undefined}
          className={isSignupActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE}
        >
          {t("signup")}
        </Link>
      </div>
    );
  }

  const initial = user.fullName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/settings/profile"
        className="flex items-center gap-2 rounded-md text-sm font-medium text-text hover:text-primary  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        {user.avatarUrl  ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar
          // comes from an arbitrary user-supplied URL.
          <img
            src={user.avatarUrl}
            alt=""
            className="h-7 w-7 rounded-full object-cover ring-1 ring-black/10"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
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
