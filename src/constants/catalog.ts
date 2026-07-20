/**
 * Service Catalog constants for AgencyOS marketing.
 * Values only — aligned with docs/DATABASE.md (`services.pricingModel`,
 * `packages`) so this local module can later be swapped for an API response
 * without changing the shape consumers depend on.
 */

/** Package tier — literal Basic / Standard / Premium, per service. */
export const PACKAGE_TIERS = {
  BASIC: "basic",
  STANDARD: "standard",
  PREMIUM: "premium",
} as const;

export type PackageTier = (typeof PACKAGE_TIERS)[keyof typeof PACKAGE_TIERS];

/** How a service is priced — mirrors docs/DATABASE.md `services.pricingModel`. */
export const PRICING_MODELS = {
  FIXED: "fixed",
  TIERED: "tiered",
  RETAINER: "retainer",
  HOURLY: "hourly",
} as const;

export type PricingModel = (typeof PRICING_MODELS)[keyof typeof PRICING_MODELS];
