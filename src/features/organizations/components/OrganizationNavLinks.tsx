"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useSession, NAV_LINK_ACTIVE, NAV_LINK_INACTIVE } from "@/features/auth";
import { useLastRegisteredOrganizationId } from "../lib/last-organization-store";

const PLATFORM_ADMIN_ROLE = "platform_admin";

/**
 * Doc 06 Sec 5.2's three org screens (`/orgs/new`, `/orgs/{id}/verification`,
 * `/admin/organizations`) previously had no entry point in the UI at all --
 * this is what makes them reachable from the persistent header instead of
 * only by typing the URL directly, same spot `HeaderAuthControl` already
 * renders the signed-in identity link.
 *
 * Nothing shows for a signed-out visitor (registering an org requires an
 * account already). Signed-in users always see "Register organization";
 * "My organization" only appears once `last-organization-store` has
 * something to point at (see that file's contract-gap note -- there's no
 * API-backed "my orgs" list yet, so this is a same-browser cache, not a
 * durable per-account list); the admin link is further gated on the
 * `platform_admin` role guess already used by `AdminAccessGuard`.
 */
export function OrganizationNavLinks() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const { user, isLoading } = useSession();
  const lastOrgId = useLastRegisteredOrganizationId();

  if (isLoading || !user) {
    return null;
  }

  const isPlatformAdmin = user.roles.includes(PLATFORM_ADMIN_ROLE);
  const isRegisterActive = pathname === "/orgs/new";
  const isMyOrgActive = pathname === `/orgs/${lastOrgId}/verification`;
  const isAdminActive = pathname === "/admin/organizations";

  return (
    <nav className="hidden items-center gap-1 sm:flex" aria-label={t("organizationsNavLabel")}>
      <Link
        href="/orgs/new"
        aria-current={isRegisterActive ? "page" : undefined}
        className={isRegisterActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE}
      >
        {t("registerOrganization")}
      </Link>

      {lastOrgId && (
        <Link
          href={`/orgs/${lastOrgId}/verification`}
          aria-current={isMyOrgActive ? "page" : undefined}
          className={isMyOrgActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE}
        >
          {t("myOrganization")}
        </Link>
      )}

      {isPlatformAdmin && (
        <Link
          href="/admin/organizations"
          aria-current={isAdminActive ? "page" : undefined}
          className={isAdminActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE}
        >
          {t("adminQueue")}
        </Link>
      )}
    </nav>
  );
}
