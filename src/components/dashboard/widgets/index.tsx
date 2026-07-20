/**
 * Widgets — PLACEHOLDER components (render children, no UI/styling).
 * Widgets are reusable, config-described tiles composed onto dashboard pages.
 */

import type { ReactNode } from "react";

/** A single widget tile — placeholder. */
export function Widget({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

/** The responsive widget grid — placeholder. */
export function WidgetGrid({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
