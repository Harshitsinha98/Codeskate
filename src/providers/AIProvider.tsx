/**
 * AIProvider — PLACEHOLDER (pass-through, no implementation).
 * Real AI context (docs/BACKEND.md §11, Layer 3) is added in Phase 6.
 * Renders children unchanged.
 */

import type { ReactNode } from "react";

export function AIProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
