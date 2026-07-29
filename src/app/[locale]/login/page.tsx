import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AuthShell, LoginForm } from "@/features/auth";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  const { next } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Auth");
  const tHome = await getTranslations("Home");
  const tMeta = await getTranslations("Metadata");

  return (
    <AuthShell
      brandTitle={tHome("heading")}
      brandTagline={tMeta("description")}
      title={t("loginHeading")}
    >
      <LoginForm next={next} />
      <p className="mt-6 text-sm text-text-muted">
        {t("noAccount")}{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          {t("goToSignup")}
        </Link>
      </p>
    </AuthShell>
  );
}
