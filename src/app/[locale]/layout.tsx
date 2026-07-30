import type { Metadata } from "next";
import { Inter, Noto_Sans_Ethiopic, Space_Grotesk } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LanguageToggle, Logomark, ToastProvider } from "@/components/ui";
import { Providers } from "../providers";
import { HeaderAuthControl } from "@/features/auth";
import { OrganizationNavLinks } from "@/features/organizations";
import { Link } from "@/i18n/navigation";
import "../globals.css";

// Doc 06 Sec 3.1: font-latin / font-ethiopic are CSS-variable fallback
// chains (globals.css); the actual faces are loaded once here via
// next/font (self-hosted, no runtime request to Google's font CDN) and
// exposed as CSS variables so every element on the page -- not just ones
// that opt in -- gets a real face instead of silently falling back to
// whatever sans-serif the OS ships.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const notoSansEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  variable: "--font-noto-ethiopic",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("title"),
    description: t("description"),
    icons: {
      icon: [
        { url: "/favicon.ico" },
        {
          url: "/favicon-16x16.png",
          sizes: "16x16",
          type: "image/png",
        },
        {
          url: "/favicon-32x32.png",
          sizes: "32x32",
          type: "image/png",
        },
      ],
      apple: "/apple-touch-icon.png",
    },

    manifest: "/site.webmanifest",
  };

}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations("Home");

  return (
    <html
      lang={locale}
      dir="ltr"
      className={`${inter.variable} ${spaceGrotesk.variable} ${notoSansEthiopic.variable}`}
    >
      <body className="min-h-dvh bg-surface">
        <NextIntlClientProvider>
          <Providers>
            <ToastProvider>
              <div className="flex min-h-dvh flex-col">
                <header className="sticky top-0 z-40 border-b border-black/6 bg-surface/85 backdrop-blur">
                  <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                    <Link
                      href="/"
                      className="flex items-center gap-2 rounded-md text-text focus-visible:outline-2  focus-visible:outline-offset-4 focus-visible:outline-focus"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                        <Logomark className="h-4.5 w-4.5" />
                      </span>
                      <span className="font-display text-[15px] font-semibold tracking-tight text-text sm:text-base">
                        {t("heading")}
                      </span>
                    </Link>
                    <OrganizationNavLinks />
                    <div className="flex items-center gap-3 sm:gap-4">
                      <HeaderAuthControl />
                      <div className="hidden h-6 w-px bg-black/10 sm:block" aria-hidden="true" />
                      <LanguageToggle />
                    </div>
                  </div>
                </header>
                <div className="flex-1">{children}</div>     
              </div>
            </ToastProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
