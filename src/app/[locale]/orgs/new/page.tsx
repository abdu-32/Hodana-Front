import { setRequestLocale, getTranslations } from "next-intl/server";
import { RegisterOrganizationForm } from "@/features/organizations";

/**
 * Doc 06 Sec 5.2: `/orgs/new`, CSR, any authenticated user (registering an
 * org is what grants the Organizer role) -- FR-ORG-001. Covered by
 * `PROTECTED_PATH_PREFIXES` (`features/auth/constants.ts`); middleware
 * bounces a signed-out visitor to `/login?next=...` before this renders.
 * `setRequestLocale` runs for the static shell, same as `/settings/profile`
 * -- the form itself is the CSR part per Doc 06 Sec 7.1.
 */
export default async function RegisterOrganizationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Organizations");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-start gap-8 px-4 py-12 sm:px-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
          {t("registerHeading")}
        </h1>
        <p className="mt-2 text-sm text-text-muted">{t("registerIntro")}</p>
      </div>
      <RegisterOrganizationForm />
    </main>
  );
}
