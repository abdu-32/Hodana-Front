import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE_MAX_AGE,
} from "@/features/auth/constants";
import type { AuthResponse } from "@/lib/api-types-helpers";
import { backendFetch } from "../lib/backend";

/**
 * FR-AUTH-002. Called two ways:
 *  - Once per app load, by SessionProvider on mount, to turn a surviving
 *    httpOnly cookie back into a usable in-memory access token.
 *  - By api-client.ts's authFetch, on any 401, to retry the failed request
 *    once.
 * The browser never sends the refresh token itself -- the cookie rides
 * along automatically (`credentials: "include"` on the caller's fetch),
 * and this route is the only code that ever reads it.
 */
export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: { message: "No active session" } },
      { status: 401 },
    );
  }

  const backendRes = await backendFetch("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  const data = await backendRes.json().catch(() => null);

  if (!backendRes.ok) {
    const response = NextResponse.json(
      data ?? { error: { message: "Session expired" } },
      { status: backendRes.status },
    );
    // The refresh token itself was rejected (expired/revoked) -- drop the
    // cookie only on 401 unauthorized rather than on transient 5xx server errors.
    if (backendRes.status === 401) {
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
    }
    return response;
  }

  // SimpleJWT rotates refresh tokens on use (see Doc 04 refresh endpoint
  // notes) -- the cookie has to be rewritten with the new one every time,
  // not just read.
  const { refreshToken: newRefreshToken, ...session } = data as AuthResponse;

  const response = NextResponse.json(session);
  response.cookies.set(REFRESH_TOKEN_COOKIE, newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
  });
  return response;
}
