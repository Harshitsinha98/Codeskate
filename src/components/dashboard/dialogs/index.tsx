/**
 * Dialog (modal) — PLACEHOLDER (renders children, no UI/styling).
 * Focus-trapped modal per docs/DESIGN_SYSTEM.md §8 is implemented later.
 */

import type { ReactNode } from "react";

export function Dialog({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
