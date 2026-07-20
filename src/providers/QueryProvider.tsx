/**
 * QueryProvider — PLACEHOLDER (pass-through, no implementation).
 * Real data-fetching cache (e.g. TanStack Query) is added in a later phase.
 * Intentionally adds NO dependency yet. Renders children unchanged.
 */

import type { ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
