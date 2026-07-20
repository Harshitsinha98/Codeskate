/**
 * Drawer / sheet — PLACEHOLDER (renders children, no UI/styling).
 * Slide-over detail/context panel per docs/DESIGN_SYSTEM.md §8 later.
 */

import type { ReactNode } from "react";

export function Drawer({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
