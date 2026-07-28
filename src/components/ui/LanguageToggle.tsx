"use client";

import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

/**
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
    <div role="group" aria-label={t("en") + " / " + t("am")} className="flex gap-1">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          aria-current={locale === loc ? "true" : undefined}
          className={`rounded px-2 py-1 text-sm font-medium
            focus-visible:outline focus-visible:outline-2
            focus-visible:outline-offset-2 focus-visible:outline-focus
            ${locale === loc ? "bg-primary text-white" : "text-text-muted hover:bg-surface-alt"}`}
        >
          {t(loc)}
        </button>
      ))}
    </div>
  );
}