/**
 * Dashboard shell layout — PLACEHOLDER components (render children, no UI/styling).
 * The single shell shared by every dashboard surface. Composition is wired later.
 */

import type { ReactNode } from "react";

/** The outer shell wrapper (sidebar + topbar + content) — placeholder. */
export function DashboardShell({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

/** A page container inside the shell — placeholder. */
export function DashboardPageContainer({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
