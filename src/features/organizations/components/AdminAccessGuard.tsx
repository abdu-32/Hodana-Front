"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ErrorBanner } from "@/components/ui";
import { useSession } from "@/features/auth";

/**
 * Doc 06 Sec 4.2's role table lists "Platform Admin Console" as visible
 * only to that role, global and not context-scoped -- unlike Organizer/
 * Sponsor/Judge/Mentor, which are all scoped to a specific hackathon or
 * org. `UserProfile.roles` (contracts/openapi.yaml) is an untyped
 * `string[]`; no enum of role-string values is published in the contract,
 * so `"platform_admin"` here mirrors the snake_case convention every other
 * enum in this contract already uses (e.g. `RegisterOrganizationTypeEnum`),
 * matching Doc 06 Sec 4.2's "Platform Admin" label. Flagging as a contract
 * gap: an explicit roles enum would remove this guess.
 *
 * This is a client-side UX nicety only, same caveat as
 * `PROTECTED_PATH_PREFIXES` in `features/auth/constants.ts` -- the actual
 * authority is the API: every admin write/read this screen makes 403s for
 * a non-admin regardless of what this guard renders.
 */
const PLATFORM_ADMIN_ROLE = "platform_admin";

export function AdminAccessGuard({ children }: { children: ReactNode }) {
  const t = useTranslations("AdminOrganizations");
  const { user, isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-3" aria-hidden="true">
        <div className="h-20 animate-pulse rounded-2xl bg-surface-alt" />
        <div className="h-20 animate-pulse rounded-2xl bg-surface-alt" />
      </div>
    );
  }

  const isPlatformAdmin =
    isAuthenticated && (user?.roles ?? []).includes(PLATFORM_ADMIN_ROLE);

  if (!isPlatformAdmin) {
    return <ErrorBanner message={t("accessDenied")} />;
  }

  return <>{children}</>;
}
