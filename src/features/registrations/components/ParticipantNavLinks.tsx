"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useSession, NAV_LINK_ACTIVE, NAV_LINK_INACTIVE } from "@/features/auth";

/**
 * Entry points for Doc 06 Sec 5.4 participant screens that otherwise have no
 * header nav — same pattern as OrganizationNavLinks.
 */
export function ParticipantNavLinks() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const { user, isLoading } = useSession();

  if (isLoading || !user) {
    return null;
  }

  const isRegistrationsActive = pathname === "/dashboard/registrations";
  const isInvitationsActive = pathname === "/dashboard/invitations";

  return (
    <nav
      className="hidden items-center gap-1 md:flex"
      aria-label={t("participantNavLabel")}
    >
      <Link
        href="/dashboard/registrations"
        aria-current={isRegistrationsActive ? "page" : undefined}
        className={isRegistrationsActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE}
      >
        {t("myRegistrations")}
      </Link>
      <Link
        href="/dashboard/invitations"
        aria-current={isInvitationsActive ? "page" : undefined}
        className={isInvitationsActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE}
      >
        {t("invitations")}
      </Link>
    </nav>
  );
}
