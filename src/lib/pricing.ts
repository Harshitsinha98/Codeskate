/**
 * Sitewide engagement tiers — now DERIVED from the centralized config.
 *
 * The `Plan` type and `plans`/`comparison` exports are preserved verbatim so
 * existing consumers (`@/config/catalog/adapters`, `PricingCards`,
 * `ComparisonTable`) keep compiling unchanged. The DATA is projected from
 * `@/lib/config` — the single source of truth. Change prices there, not here.
 */

import {
  PLAN_LIST,
  planPriceLabel,
  type CentralPlan,
} from "@/lib/config/plans";
import { COMPARISON } from "@/lib/config/comparison";

export type Plan = {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  featured?: boolean;
  features: string[];
  cta: string;
  ctaHref: string;
};

function toPlan(p: CentralPlan): Plan {
  return {
    name: p.title,
    price: planPriceLabel(p),
    cadence: p.cadence,
    tagline: p.subtitle,
    featured: p.popular,
    features: p.includedFeatures,
    cta: p.ctaText,
    ctaHref: p.ctaLink,
  };
}

export const plans: Plan[] = PLAN_LIST.map(toPlan);

export const comparison = COMPARISON.map((row) => ({
  feature: row.feature,
  starter: row.values.starter,
  growth: row.values.growth,
  business: row.values.business,
  enterprise: row.values.enterprise,
}));
