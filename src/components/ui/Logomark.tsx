/**
 * Doc 06 Sec 7: feature-agnostic presentational primitive. A small
 * hub-and-spoke node mark -- a center point connected to five outer
 * points -- chosen because it's literally what the product name says
 * ("Hub") and what a hackathon does (people and teams connecting around a
 * shared center), rather than a generic abstract shape. Pure SVG, no
 * external asset, so it costs nothing on the 3G budget (Doc 06 Sec 2).
 * Renders in `currentColor` so callers control it with a text color class.
 */
export function Logomark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 12L4.5 7.5M12 12l7.5-4.5M12 12v8.25M12 12l-7 4.2M12 12l7 4.2" />
      </g>
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
      <circle cx="4.5" cy="7.5" r="1.5" fill="currentColor" opacity="0.55" />
      <circle cx="19.5" cy="7.5" r="1.5" fill="currentColor" opacity="0.55" />
      <circle cx="5" cy="16.2" r="1.5" fill="currentColor" opacity="0.55" />
      <circle cx="19" cy="16.2" r="1.5" fill="currentColor" opacity="0.55" />
      <circle cx="12" cy="20.25" r="1.5" fill="currentColor" opacity="0.55" />
    </svg>
  );
}
