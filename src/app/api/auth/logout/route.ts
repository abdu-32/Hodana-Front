import { NextResponse } from "next/server";
import { REFRESH_TOKEN_COOKIE } from "@/features/auth/constants";

/**
 * There's no backend endpoint for this in the contract (no server-side
 * token revocation for MVP) -- logout is purely a client concern: drop the
 * httpOnly cookie here, and the caller (features/auth/lib/auth-client.ts)
 * clears the in-memory access token in the same breath. If/when the
 * backend adds a revoke-refresh-token endpoint, call it here too, before
 * clearing the cookie.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}
