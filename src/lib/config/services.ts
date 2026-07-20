/**
 * CENTRALIZED SERVICES → PLANS MAPPING.
 *
 * Each service references plan IDs (never duplicates plan details) plus its
 * own marketing "starting from" display price. `ServiceCard` and service
 * pages read from here instead of hardcoding rupee values.
 */

import { formatPriceWithCadence } from "./pricing";
import type { PlanId } from "./plans";

export type ServicePricing = {
  /** Numeric starting price in INR. */
  startingPrice: number;
  /** Cadence suffix, e.g. "/mo" for monthly retainers. */
  cadenceSuffix?: string;
  /** Plan tiers offered for this service. */
  plans: PlanId[];
};

/** Keyed by service slug (matches `src/config/catalog` slugs). */
export const SERVICE_PRICING: Record<string, ServicePricing> = {
  "web-development": { startingPrice: 5999, plans: ["starter", "growth", "business", "enterprise"] },
  "mobile-apps": { startingPrice: 24999, plans: ["growth", "business", "enterprise"] },
  "ui-ux-design": { startingPrice: 5999, plans: ["starter", "growth", "business"] },
  branding: { startingPrice: 4999, plans: ["starter", "growth"] },
  "digital-marketing": { startingPrice: 4999, cadenceSuffix: "/mo", plans: ["growth", "business", "enterprise"] },
  "paid-advertising": { startingPrice: 1999, cadenceSuffix: "/mo", plans: ["growth", "business"] },
  "ai-automation": { startingPrice: 9999, plans: ["growth", "business", "enterprise"] },
  "maintenance-growth": { startingPrice: 1999, cadenceSuffix: "/mo", plans: ["business", "enterprise"] },
};

/** Display-ready "starting from" label for a service slug, or null if unknown. */
export function serviceStartingLabel(slug: string): string | null {
  const p = SERVICE_PRICING[slug];
  if (!p) return null;
  return formatPriceWithCadence(p.startingPrice, p.cadenceSuffix);
}
