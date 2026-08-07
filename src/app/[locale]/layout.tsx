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
import { ParticipantNavLinks } from "@/features/registrations";
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
                <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur-md">
                  <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <Link
                      href="/"
                      className="flex items-center gap-2 text-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4338CA] text-white shadow-sm">
                        <Logomark className="h-5 w-5" />
                      </span>
                      <span className="font-display text-lg font-extrabold tracking-tight text-[#4338CA]">
                        EthioInnovate
                      </span>
                    </Link>
                    <div className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto sm:justify-center sm:gap-4 text-xs font-semibold text-[#52526B]">
                      <Link href="/" className="px-3 py-1.5 rounded-lg hover:text-[#4338CA] transition-colors">
                        Discover
                      </Link>
                      <Link href="/" className="px-3 py-1.5 rounded-lg hover:text-[#4338CA] transition-colors">
                        Startups
                      </Link>
                      <ParticipantNavLinks />
                      <OrganizationNavLinks />
                    </div>
                    <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                      <LanguageToggle />
                      <div className="hidden h-5 w-px bg-black/10 sm:block" aria-hidden="true" />
                      <HeaderAuthControl />
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
