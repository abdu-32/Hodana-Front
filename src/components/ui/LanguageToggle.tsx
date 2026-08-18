"use client";

import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

/*
 * Doc 06 Sec 4: "not a standalone screen; it is a persistent control in the
 * global header, present on every screen in this inventory" (FR-I18N-001,
 * FR-I18N-002). Swaps the locale segment of the current path rather than
 * navigating home, so the user stays on the same screen after toggling.
 */
export function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("LanguageToggle");

  return (
    <div
      role="group"
      aria-label={t("en") + " / " + t("am")}
      className="flex items-center gap-0.5 rounded-full bg-surface-alt p-0.5 ring-1 ring-black/5"
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => {
            if (typeof document !== "undefined") {
              document.cookie = `NEXT_LOCALE=${loc}; path=/; max-age=31536000; SameSite=Lax`;
            }
            router.replace(pathname, { locale: loc });
          }}
          aria-current={locale === loc ? "true" : undefined}
          className={`rounded-full px-2.5 py-1 text-sm font-medium transition-colors
            focus-visible:outline-2
            focus-visible:outline-offset-2 focus-visible:outline-focus
            ${locale === loc ? "bg-surface text-primary shadow-sm" : "text-text-muted hover:text-text"}`}
        >
          {t(loc)}
        </button>
      ))}
    </div>
  );
}
