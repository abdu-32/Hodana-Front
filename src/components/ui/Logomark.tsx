/**
 * Doc 06 Sec 7: feature-agnostic presentational primitive. A small
 * hub-and-spoke node mark -- a center point connected to five outer
 * points -- chosen because it's literally what the product name says
 * ("Hub") and what a hackathon does (people and teams connecting around a
 * shared center), rather than a generic abstract shape. Pure SVG, no
 * external asset, so it costs nothing on the 3G budget (Doc 06 Sec 2).
 * Renders in `currentColor` so callers control it with a text color class.
 */
export function Logomark({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="HODANA Logo"
      className={`object-contain transition-all select-none ${className}`}
    />
  );
}
