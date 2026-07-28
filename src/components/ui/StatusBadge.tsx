import type { ReactNode } from "react";

/**
 * Doc 06 Sec 7: "the single component used everywhere a verification_status,
 * eligibility_status, join_status, or hackathon.status value is displayed
 * ... so a status color/label mapping is defined once and cannot drift
 * between screens."
 *
 * Values below are the exact enum choices from the backend models (Doc 05
 * Sec 4): apps.organizations.VERIFICATION_STATUS_CHOICES,
 * apps.submissions.ELIGIBILITY_STATUS_CHOICES,
 * apps.teams.JOIN_STATUS_CHOICES, apps.hackathons.HACKATHON_STATUS_CHOICES.
 * "pending" appears in three of the four domains with different meanings
 * (awaiting review vs. awaiting a locked deadline vs. awaiting an invite
 * response), so the mapping is keyed by (domain, value), not value alone.
 */
export type StatusDomain =
  | "verification"
  | "eligibility"
  | "join"
  | "hackathon";

type Tone = "success" | "warning" | "danger" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  neutral: "bg-surface-alt text-text-muted",
};

const STATUS_TONES: Record<StatusDomain, Record<string, Tone>> = {
  verification: { unverified: "neutral", pending: "warning", verified: "success" },
  eligibility: { pending: "neutral", eligible: "success", disqualified: "danger" },
  join: { pending: "warning", accepted: "success", declined: "danger" },
  hackathon: { draft: "neutral", published: "success", archived: "neutral" },
};

export interface StatusBadgeProps {
  domain: StatusDomain;
  /** The raw enum value from the API, e.g. "eligible", "pending". */
  value: string;
  /** Translated label to display -- callers own the i18n lookup, this
   * component only owns the color mapping. */
  children: ReactNode;
}

export function StatusBadge({ domain, value, children }: StatusBadgeProps) {
  const tone = STATUS_TONES[domain][value] ?? "neutral";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}