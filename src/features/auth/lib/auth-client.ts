import { apiFetch, ApiError } from "@/lib/api-client";
import type {
  LoginRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  ResendVerificationRequest,
  SessionResponse,
  SignupRequest,
  UserProfile,
  VerifyEmailRequest,
} from "@/lib/api-types-helpers";
import { clearSession, setSession, setSessionLoading } from "./session-store";

/**
 * Only login/refresh/logout touch tokens, so only those three go through
 * the same-origin `/api/auth/*` route handlers (which set/read/clear the
 * httpOnly refresh cookie). Signup and the rest of FR-AUTH-003/004 don't
 * return or need a token (signup's 201 body is a plain UserProfile per the
 * contract), so they call the backend directly through `apiFetch`, same as
 * any other public endpoint.
 */

async function parseLocalAuthRoute<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      res.status,
      body?.error?.message ?? `Request failed: ${res.status}`,
      body?.error?.fields,
    );
  }
  return res.json() as Promise<T>;
}

export async function login(payload: LoginRequest): Promise<UserProfile> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseLocalAuthRoute<SessionResponse>(res);
  setSession(data.accessToken, data.user);
  return data.user;
}

export async function signup(payload: SignupRequest): Promise<UserProfile> {
  // Deliberately not auto-signed-in here -- see the file-level note above.
  // The signup screen sends the person on to /login (or /verify-email,
  // per FR-AUTH-003) rather than establishing a session directly.
  return apiFetch<UserProfile>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  }).catch(() => undefined);
  clearSession();
}

/** Called once on app mount by SessionProvider to turn a surviving httpOnly
 * refresh cookie back into a usable in-memory access token. */
export async function restoreSession(): Promise<void> {
  setSessionLoading(true);
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      clearSession();
      return;
    }
    const data: SessionResponse = await res.json();
    setSession(data.accessToken, data.user);
  } catch {
    clearSession();
  }
}

export function verifyEmail(payload: VerifyEmailRequest): Promise<UserProfile> {
  return apiFetch<UserProfile>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resendVerification(
  payload: ResendVerificationRequest,
): Promise<void> {
  return apiFetch<void>("/auth/verify-email/resend", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function requestPasswordReset(
  payload: PasswordResetRequest,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/password-reset", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function confirmPasswordReset(
  payload: PasswordResetConfirmRequest,
): Promise<void> {
  return apiFetch<void>("/auth/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
