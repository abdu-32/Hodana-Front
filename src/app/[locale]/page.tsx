import { setRequestLocale, getTranslations } from "next-intl/server";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  return (
    <main className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl">
        {t("heading")}
      </h1>
      <p className="max-w-xl text-base text-text-muted">
        {t("subheading")}
      </p>
    </main>
  );
}
