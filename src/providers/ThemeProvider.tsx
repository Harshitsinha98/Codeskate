/**
 * ThemeProvider — PLACEHOLDER (pass-through, no implementation).
 * Real theming (light/dark tokens per docs/DESIGN_SYSTEM.md §1.6/§12) is added
 * in a later, opt-in phase. Renders children unchanged so nothing is affected.
 */

import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
