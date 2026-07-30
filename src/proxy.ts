import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import {
  PROTECTED_PATH_PREFIXES,
  REFRESH_TOKEN_COOKIE,
} from "./features/auth/constants";

const intlMiddleware = createMiddleware(routing);

/**
 * Strips the locale segment ("/en/settings/profile" -> "/settings/profile")
 * so route-gating logic doesn't need to know about locales at all.
 */
function withoutLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  if (match && (routing.locales as readonly string[]).includes(match[1])) {
    return match[2] ?? "/";
  }
  return pathname;
}

function isProtectedPath(pathname: string): boolean {
  const path = withoutLocalePrefix(pathname);
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/**
 * This is a coarse, cookie-*presence* check only -- it doesn't validate the
 * refresh token itself (middleware can't call the backend synchronously on
 * every request without real cost). It exists to stop an obviously-signed-
 * out visitor from ever seeing an authenticated page's shell, per Doc 06
 * Sec 4.2. The actual authority is still the API: every authenticated
 * screen's data fetch will 401 (and authFetch will attempt a refresh, then
 * surface the failure) if the cookie turns out to be stale or forged.
 */
export default function middleware(request: NextRequest) {
  if (
    isProtectedPath(request.nextUrl.pathname) &&
    !request.cookies.get(REFRESH_TOKEN_COOKIE)
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", withoutLocalePrefix(request.nextUrl.pathname),);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  // Skip API routes, Next internals, and static/public files -- everything
  // else gets locale-detected/redirected (e.g. "/" -> "/en" on first visit,
  // based on Accept-Language, then persisted via the NEXT_LOCALE cookie)
  // and, where applicable, the protected-route check above.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};