/**
 * SocketProvider — PLACEHOLDER (pass-through, no implementation).
 * Real WebSocket/realtime context (docs/BACKEND.md §4) is added in Phase 4.
 * Renders children unchanged.
 */

import type { ReactNode } from "react";

export function SocketProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
