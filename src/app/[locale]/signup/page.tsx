import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AuthShell, SignupForm } from "@/features/auth";

export default async function SignupPage({
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
      title={t("signupHeading")}
    >
      <SignupForm />
      <p className="mt-6 text-sm text-text-muted">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("goToLogin")}
        </Link>
      </p>
    </AuthShell>
  );
}
