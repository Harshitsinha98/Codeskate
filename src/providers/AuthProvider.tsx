/**
 * AuthProvider — PLACEHOLDER (pass-through, no implementation).
 * Real session/identity context (Better Auth) is added in Phase 2.
 * Renders children unchanged; the marketing site remains auth-free.
 */

import type { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
