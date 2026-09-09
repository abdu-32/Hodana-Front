"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { UserProfile } from "@/lib/api-types-helpers";
import { logout as logoutRequest, restoreSession } from "../lib/auth-client";
import {
  getSessionSnapshot,
  subscribeSession,
  updateSessionUser,
  type SessionSnapshot,
} from "../lib/session-store";

interface SessionContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  /** True until the mount-time silent refresh has resolved. Every consumer
   * should treat this as "session state not yet known" -- rendering
   * role-gated UI before it settles risks a flash of the wrong screen. */
  isLoading: boolean;
  logout: () => Promise<void>;
  /** FR-PROFILE-001/003: call after `PUT /users/me` resolves so the header
   * and any other consumer of `user` reflects the edit immediately, without
   * a full refetch. */
  updateUser: (user: UserProfile) => void;
  refreshUser: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

// A constant, never read from the mutable module state in session-store.
// Server-rendering a client component must never touch (or appear to
// touch) per-request session data through a process-wide singleton --
// this keeps the SSR pass fully inert with respect to session-store.
const SERVER_SNAPSHOT: SessionSnapshot = {
  accessToken: null,
  user: null,
  isLoading: true,
};

function getServerSnapshot(): SessionSnapshot {
  return SERVER_SNAPSHOT;
}

/**
 * Wrap the app once (see app/[locale]/layout.tsx). Doc 06 Sec 4.2: every
 * authenticated screen and role-gated nav section reads from here rather
 * than trusting a client-held flag on its own (Sec 2 "server is the source
 * of truth") -- `user` only ever reflects what the backend most recently
 * confirmed via login/refresh.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    // Runs once per page load, browser-side only (effects never run during
    // SSR). This is what turns a surviving httpOnly refresh cookie back
    // into a usable in-memory access token after a hard reload.
    restoreSession();
  }, []);

  const value: SessionContextValue = {
    user: snapshot.user,
    isAuthenticated: Boolean(snapshot.user),
    isLoading: snapshot.isLoading,
    logout: logoutRequest,
    updateUser: updateSessionUser,
    refreshUser: async () => {
      await restoreSession();
    },
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
