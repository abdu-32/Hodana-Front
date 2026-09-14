import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

import { Inter, Noto_Sans_Ethiopic, Space_Grotesk } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ToastProvider } from "@/components/ui";
import { Providers } from "../providers";
import { AppShell } from "@/components/AppShell";
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
        { url: "/logo.png", sizes: "512x512", type: "image/png" },
        {
          url: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          url: "/favicon-32x32.png",
          sizes: "32x32",
          type: "image/png",
        },
        { url: "/favicon.ico" },
      ],
      shortcut: "/logo.png",
      apple: [
        { url: "/logo.png", sizes: "180x180", type: "image/png" },
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
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
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
