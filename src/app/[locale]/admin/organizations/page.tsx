import { setRequestLocale, getTranslations } from "next-intl/server";
import { AdminAccessGuard, AdminOrganizationQueue } from "@/features/organizations";

/**
 * Doc 06 Sec 5.2: `/admin/organizations`, CSR, Platform Admin --
 * FR-ORG-003 (decision action) and FR-ADMIN-001 (review-queue dashboard).
 * Covered by `PROTECTED_PATH_PREFIXES` for the signed-out case;
 * `AdminAccessGuard` additionally hides the queue from a signed-in
 * non-admin (the API itself is still the real gate on every request the
 * queue makes).
 */
export default async function AdminOrganizationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("AdminOrganizations");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-8 px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
        {t("heading")}
      </h1>
      <AdminAccessGuard>
        <AdminOrganizationQueue />
      </AdminAccessGuard>
    </main>
  );
}
