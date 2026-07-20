/**
 * Feature flags for AgencyOS — gate future modules safely.
 * Placeholder foundation — all future surfaces default OFF so nothing activates
 * until explicitly built and approved. The marketing site is always on.
 * Source of truth: docs/EVOLUTION_ROADMAP.md, docs/ARCHITECTURE.md (entitlements).
 */

export const FEATURE_FLAGS = {
  marketingSite: true,
  authentication: false,
  clientDashboard: false,
  adminDashboard: false,
  employeeDashboard: false,
  crm: false,
  projectManagement: false,
  payments: false,
  invoices: false,
  fileManager: false,
  notifications: false,
  realtime: false,
  aiPlatform: false,
  darkMode: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/** Placeholder reader — real evaluation (per-tenant) added in a later phase. */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag];
}
