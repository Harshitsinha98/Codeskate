/**
 * CENTRALIZED COMPARISON MATRIX.
 *
 * Feature-by-plan comparison, defined once. Consumed by the pricing page,
 * landing pages and any sales/proposal surface via `ComparisonTable`.
 * Columns are derived from `plans.ts` so tier titles never drift.
 */

import { PLAN_LIST, type PlanId } from "./plans";

export type ComparisonValue = boolean | string;

export type ComparisonFeature = {
  feature: string;
  values: Record<PlanId, ComparisonValue>;
};

export const COMPARISON: ComparisonFeature[] = [
  { feature: "Custom design system", values: { starter: false, growth: true, business: true, enterprise: true } },
  { feature: "Headless CMS", values: { starter: false, growth: true, business: true, enterprise: true } },
  { feature: "Technical SEO", values: { starter: true, growth: true, business: true, enterprise: true } },
  { feature: "Web app / portal", values: { starter: false, growth: false, business: true, enterprise: true } },
  { feature: "API integrations", values: { starter: false, growth: "Add-on", business: true, enterprise: true } },
  { feature: "Mobile app", values: { starter: false, growth: false, business: "Add-on", enterprise: true } },
  { feature: "AI automation", values: { starter: false, growth: false, business: "Add-on", enterprise: true } },
  { feature: "Dedicated team", values: { starter: false, growth: false, business: false, enterprise: true } },
  { feature: "Priority SLA", values: { starter: false, growth: false, business: true, enterprise: true } },
  { feature: "Quarterly strategy", values: { starter: false, growth: false, business: false, enterprise: true } },
];

/** Column titles for the comparison table, sourced from the plan tiers. */
export const COMPARISON_COLUMNS: string[] = PLAN_LIST.map((p) => p.title);
