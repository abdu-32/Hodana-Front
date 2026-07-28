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
      className="flex items-start justify-between gap-3 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="shrink-0 rounded focus-visible:outline focus-visible:outline-2
            focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          ✕
        </button>
      )}
    </div>
  );
}