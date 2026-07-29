import { setRequestLocale, getTranslations } from "next-intl/server";
import { ProfileForm } from "@/features/profile";

/**
 * Doc 06 Sec 5.1: `/settings/profile`, CSR, all authenticated roles.
 * Already covered by `PROTECTED_PATH_PREFIXES` (`features/auth/constants.ts`)
 * -- middleware bounces a signed-out visitor to `/login?next=...` before
 * this ever renders. `setRequestLocale` still runs for the static shell
 * (heading), the same as every other locale-aware page; the form itself is
 * the CSR part per Doc 06 Sec 7.1.
 */
export default async function ProfileSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Profile");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-start gap-8 px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
        {t("heading")}
      </h1>
      <ProfileForm />
    </main>
  );
}
