/**
 * Per-ORGANIZATION feature flags (entitlements) for AgencyOS.
 *
 * Distinct from `@/constants/feature-flags` (global build-time flags): these are
 * per-tenant toggles that gate whole modules for a given organization/plan.
 * Placeholder foundation — values only; evaluation is added with the backend.
 * Source of truth: docs/ARCHITECTURE.md (entitlements engine), docs/EVOLUTION_ROADMAP.md.
 */

export const ORGANIZATION_FEATURES = {
  crm: "crm",
  ai: "ai",
  payments: "payments",
  blog: "blog",
  portfolio: "portfolio",
  clientPortal: "client_portal",
  employeePortal: "employee_portal",
  analytics: "analytics",
  support: "support",
  marketplace: "marketplace",
} as const;

export type OrganizationFeatureKey = keyof typeof ORGANIZATION_FEATURES;

/**
 * Default entitlement map for a new organization.
 * All OFF by default — a plan/entitlement grant turns them on. Nothing activates
 * implicitly. (Marketing site is global, not gated by org features.)
 */
export const DEFAULT_ORGANIZATION_FEATURES: Record<
  OrganizationFeatureKey,
  boolean
> = {
  crm: false,
  ai: false,
  payments: false,
  blog: false,
  portfolio: false,
  clientPortal: false,
  employeePortal: false,
  analytics: false,
  support: false,
  marketplace: false,
};
