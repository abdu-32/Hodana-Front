"use client";

export interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  /** Label for the dismiss button's accessible name -- sourced from the
   * caller's translation catalog (Doc 06 Sec 3.1), no hardcoded English
   * default here. */
  dismissLabel?: string;
}

export function ErrorBanner({
  message,
  onDismiss,
  dismissLabel = "Dismiss",
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-danger/20 bg-danger/[0.06] px-4 py-3 text-sm text-danger"
    >
      <span aria-hidden="true" className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-danger/15 text-[11px] font-bold">
        !
      </span>
      <span className="flex-1 leading-snug">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="shrink-0 rounded p-0.5 text-danger/70 hover:text-danger focus-visible:outline focus-visible:outline-2
            focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          ✕
        </button>
      )}
    </div>
  );
}
