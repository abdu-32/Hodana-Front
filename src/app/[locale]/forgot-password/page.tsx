import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AuthShell, ForgotPasswordForm } from "@/features/auth";

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth");
  const tHome = await getTranslations("Home");
  const tMeta = await getTranslations("Metadata");

  return (
    <AuthShell
      brandTitle={tHome("heading")}
      brandTagline={tMeta("description")}
      title={t("forgotPasswordHeading")}
      subtitle={t("forgotPasswordInstructions")}
    >
      <ForgotPasswordForm />
      <Link
        href="/login"
        className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
      >
        {t("goToLogin")}
      </Link>
    </AuthShell>
  );
}
