import { setRequestLocale, getTranslations } from "next-intl/server";
import { AuthShell, VerifyEmailPanel } from "@/features/auth";

export default async function VerifyEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { locale } = await params;
  const { token, email } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Auth");
  const tHome = await getTranslations("Home");
  const tMeta = await getTranslations("Metadata");

  return (
    <AuthShell
      brandTitle={tHome("heading")}
      brandTagline={tMeta("description")}
      title={t("verifyEmailHeading")}
    >
      <VerifyEmailPanel token={token} email={email} />
    </AuthShell>
  );
}
