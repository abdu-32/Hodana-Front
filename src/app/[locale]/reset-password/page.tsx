import { setRequestLocale, getTranslations } from "next-intl/server";
import { AuthShell, ResetPasswordForm } from "@/features/auth";

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  const { token } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Auth");
  const tHome = await getTranslations("Home");
  const tMeta = await getTranslations("Metadata");

  return (
    <AuthShell
      brandTitle={tHome("heading")}
      brandTagline={tMeta("description")}
      title={t("resetPasswordHeading")}
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
