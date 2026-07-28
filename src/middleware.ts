import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, and static/public files -- everything
  // else gets locale-detected/redirected (e.g. "/" -> "/en" on first visit,
  // based on Accept-Language, then persisted via the NEXT_LOCALE cookie).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};