import { defineRouting } from "next-intl/routing";

/*
 * FR-I18N-001/002 (Doc 02) + Doc 06 Sec 9: English and Amharic, English as
 * the default so an unprefixed URL (`/`) still resolves rather than 404ing.
 * Locale is carried in the URL path (`/en/...`, `/am/...`) rather than a
 * cookie-only strategy, so public SSR pages (Doc 03 Sec 7.1) stay
 * crawlable/shareable per-language, which a cookie-based locale would break.
 */
export const routing = defineRouting({
  locales: ["en", "am"],
  defaultLocale: "en",
  localePrefix: "always",
  localeDetection: true,
});