import { setRequestLocale, getTranslations } from "next-intl/server";
import { OrganizationVerificationStatus } from "@/features/organizations";

/**
 * Doc 06 Sec 5.2: `/orgs/{id}/verification`, CSR, Organizer of that org --
 * FR-ORG-002 (status/decision display) and FR-ORG-003 (document upload).
 * Covered by `PROTECTED_PATH_PREFIXES` for the signed-out case; the
 * *scoped* check (this Organizer belongs to this specific org, not just
 * any org) is enforced by the API on every read/write this screen makes
 * (see `features/organizations/lib/organizations-client.ts`) -- a 403
 * surfaces as an inline error rather than the page pretending to know the
 * caller's org memberships itself.
 */
export default async function OrganizationVerificationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Organizations");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-start gap-8 px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
        {t("verificationHeading")}
      </h1>
      <OrganizationVerificationStatus organizationId={id} />
    </main>
  );
}
