import { NextResponse } from "next/server";
import {
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE_MAX_AGE,
} from "@/features/auth/constants";
import type { AuthResponse } from "@/lib/api-types-helpers";
import { backendFetch } from "../lib/backend";

/**
 * FR-AUTH-002. This is the only reason a proxy route exists at all: the
 * backend hands back both tokens in the JSON body (contracts/openapi.yaml
 * `AuthResponse`), so this is the one hop where the refresh token can be
 * lifted out of that body and set as an httpOnly cookie before it ever
 * reaches client-side JS. Every other request (hackathons, teams, ...)
 * still goes straight from the browser to NEXT_PUBLIC_API_URL, unchanged.
 */
export async function POST(request: Request) {
  const body = await request.json();

  const backendRes = await backendFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const data = await backendRes.json().catch(() => null);

  if (!backendRes.ok) {
    return NextResponse.json(
      data ?? { error: { message: "Login failed" } },
      { status: backendRes.status },
    );
  }

  const { refreshToken, ...session } = data as AuthResponse;

  const response = NextResponse.json(session);
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
  });
  return response;
}
