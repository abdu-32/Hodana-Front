/**
 * The refresh token never reaches client-side JS -- it's set as an
 * httpOnly cookie by the Next.js route handlers under `app/api/auth/*`
 * and read back only by those same handlers (and `middleware.ts` for
 * route gating). Only the short-lived access token lives in the browser,
 * and only in memory (see `lib/session-store.ts`).
 */
export const REFRESH_TOKEN_COOKIE = "ihub_refresh_token";

/**
 * Upper bound on how long the browser keeps the cookie around. This is
 * not the source of truth for validity -- the backend's own refresh-token
 * TTL (SimpleJWT) decides that; a request with an expired-but-still-cookied
 * token simply gets a 401 from `/api/auth/refresh` and the session clears.
 * 30 days is a generous ceiling so a returning user doesn't need to log in
 * more often than the backend itself requires.
 */
export const REFRESH_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * Route prefixes (locale-stripped) that require an active session.
 * `middleware.ts` redirects to `/login` when none of these match a
 * refresh cookie. Extend this list as each authenticated feature ships --
 * per Doc 06 Sec 4.2, everything under the authenticated shell needs this,
 * but only `/settings/profile` (FR-PROFILE-001) exists today.
 */
export const PROTECTED_PATH_PREFIXES = ["/settings", "/orgs", "/admin"];
