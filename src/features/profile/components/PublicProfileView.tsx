import { useTranslations } from "next-intl";
import type { PublicProfile } from "@/lib/api-types-helpers";

/**
 * Doc 06 Sec 5.1: `/u/{id}`, SSR, public (FR-PROFILE-002 -- "reachable
 * without authentication"). Purely presentational: the page component does
 * the `getPublicProfile` fetch server-side and passes the result down, so
 * this stays a plain server component with no client-side data fetching of
 * its own.
 */
export function PublicProfileView({ profile }: { profile: PublicProfile }) {
  const t = useTranslations("PublicProfile");

  return (
    <div className="w-full">
      {/* Decorative cover -- Doc 06 Sec 2 "low-bandwidth first": a CSS
       * gradient, not an image, so this costs nothing on the 3G budget. */}
      <div className="h-32 w-full bg-gradient-to-r from-ink via-ink-alt to-primary sm:h-40" />

      <div className="mx-auto -mt-12 flex w-full max-w-2xl flex-col gap-6 px-4 pb-16 sm:px-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- avatar
              // comes from arbitrary user-supplied URLs, not next/image's
              // static/remote-pattern-configured domains.
              <img
                src={profile.avatarUrl}
                alt=""
                className="h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-surface"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-3xl font-semibold text-primary ring-4 ring-surface"
              >
                {profile.fullName.trim().charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <div className="pb-1 min-w-0">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-text break-words">
                {profile.fullName}
              </h1>
              {profile.university && (
                <p className="text-sm text-text-muted">{profile.university}</p>
              )}
            </div>
          </div>

          {profile.portfolioUrl && (
            <a
              href={profile.portfolioUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-lg border border-black/10 bg-surface px-4 text-sm font-medium text-text shadow-sm transition-colors hover:bg-surface-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus w-full sm:w-auto"
            >
              {t("portfolioLink")}
            </a>
          )}
        </div>

        {profile.badges.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {profile.badges.map((badge) => (
              <li
                key={badge.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent ring-1 ring-inset ring-accent/20"
              >
                <span aria-hidden="true">★</span>
                {t(`badgeType.${badge.type}`)}
              </li>
            ))}
          </ul>
        )}

        {profile.bio && (
          <p className="max-w-xl text-[15px] leading-relaxed text-text">
            {profile.bio}
          </p>
        )}

        {profile.skills.length > 0 && (
          <div className="flex flex-col gap-2.5 rounded-2xl border border-black/[0.07] bg-surface p-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t("skillsHeading")}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full bg-surface-alt px-2.5 py-1 text-sm text-text ring-1 ring-inset ring-black/5"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
