import type { ReactNode } from "react";
import { Logomark } from "@/components/ui";

export interface AuthShellProps {
  /** Already-translated brand strings -- this stays a plain, i18n-free
   * presentational component (Doc 06 Sec 7); the pages that already call
   * `getTranslations` own the lookup and pass the result down. */
  brandTitle: string;
  brandTagline: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/**
 * Doc 06 Sec 5.1: shared layout for `/login`, `/signup`, `/forgot-password`,
 * `/reset-password`, `/verify-email` -- all public, SSR shell + CSR form
 * (Sec 7.1). A two-column split on `lg`+ (brand panel + form), collapsing to
 * a single column below `lg` per Sec 3.3's mobile-first breakpoints; the
 * brand panel is `hidden` rather than reflowed below the form on narrow
 * viewports, since it's decorative and would otherwise push the actual task
 * (the form) below the fold on the 360px minimum width.
 */
export function AuthShell({
  brandTitle,
  brandTagline,
  title,
  subtitle,
  children,
}: AuthShellProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-14">
        <div className="bg-hub-pattern pointer-events-none absolute inset-0" />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-primary/40 blur-3xl"
          aria-hidden="true"
        />

        <span className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F9F8F3] shadow-lg ring-1 ring-white/30 overflow-hidden p-2">
          <Logomark className="h-full w-full object-contain" />
        </span>

        <div className="relative z-10 flex max-w-md flex-col gap-4">
          <p className="font-display text-3xl leading-tight font-semibold tracking-tight text-white xl:text-4xl">
            {brandTitle}
          </p>
          <p className="text-base leading-relaxed text-white/70">
            {brandTagline}
          </p>
        </div>

        <p className="relative z-10 text-sm text-white/40">
          &copy; {new Date().getFullYear()} HODANA
        </p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-16">
        <div className="w-full max-w-sm">
          
          <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-text-muted">{subtitle}</p>
          )}

          <div className="mt-7">{children}</div>
        </div>
      </main>
    </div>
  );
}
