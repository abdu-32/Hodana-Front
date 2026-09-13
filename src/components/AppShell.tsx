"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Logomark } from "@/components/ui/Logomark";
import { HeaderNavLinks } from "@/components/HeaderNavLinks";
import { LanguageToggle } from "@/components/ui";
import { HeaderAuthControl, useSession } from "@/features/auth";
import { NotificationBellDropdown } from "@/features/notifications/components/NotificationBellDropdown";
import { Footer } from "@/components/ui/Footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const tNav = useTranslations("Nav");
  const pathname = usePathname();
  const { user } = useSession();

  // Role dashboard, app workspace routes & auth pages: no public header, no footer
  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/submissions") ||
    pathname.startsWith("/organizer") ||
    pathname.startsWith("/judge") ||
    pathname.startsWith("/organizations/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/orgs") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/portfolio") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");

  if (isDashboardRoute) {
    return <div className="min-h-dvh bg-[#f3f6f4]">{children}</div>;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#f3f6f4]">
      <header className="sticky top-0 z-40 bg-[#f3f6f4]/90 backdrop-blur-md border-b border-[#d6e7e1]/80">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3.5 text-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            <span className="flex h-11 w-11 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-white border border-[#d6e7e1] shadow-xs overflow-hidden p-1 transition-transform hover:scale-105 shrink-0">
              <Logomark className="h-full w-full object-contain" />
            </span>
            <span className="font-display text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[#122622] truncate">
              {tNav("brandName")}
            </span>
          </Link>
          <HeaderNavLinks />
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            {user && <NotificationBellDropdown />}
            <LanguageToggle />
            <div className="hidden h-5 w-px bg-black/10 sm:block" aria-hidden="true" />
            <HeaderAuthControl />
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
