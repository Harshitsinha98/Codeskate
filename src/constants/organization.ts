/**
 * Organization (tenant) constants for AgencyOS multi-tenant SaaS.
 * Placeholder foundation — values only. These own the literal sets; the
 * Organization TYPES derive their unions from here (single source of truth).
 * Source of truth: docs/DATABASE.md (organizations, plans, subscriptions),
 * docs/ARCHITECTURE.md §Domain A (Organizations / Tenancy).
 */

/** Lifecycle state of an organization (tenant). */
export const ORGANIZATION_STATUS = {
  TRIAL: "trial",
  ACTIVE: "active",
  PAST_DUE: "past_due",
  SUSPENDED: "suspended",
  CANCELED: "canceled",
} as const;

export type OrganizationStatus =
  (typeof ORGANIZATION_STATUS)[keyof typeof ORGANIZATION_STATUS];

/** SaaS plan tiers. */
export const PLAN_TIERS = {
  FREE: "free",
  STARTER: "starter",
  GROWTH: "growth",
  SCALE: "scale",
  ENTERPRISE: "enterprise",
} as const;

export type PlanTier = (typeof PLAN_TIERS)[keyof typeof PLAN_TIERS];

/** Subscription state (mirrors provider states). */
export const SUBSCRIPTION_STATUS = {
  TRIALING: "trialing",
  ACTIVE: "active",
  PAST_DUE: "past_due",
  CANCELED: "canceled",
  PAUSED: "paused",
} as const;

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

/** Billing cadence. */
export const BILLING_INTERVALS = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

export type BillingInterval =
  (typeof BILLING_INTERVALS)[keyof typeof BILLING_INTERVALS];

/** Membership type of a user within an organization. */
export const MEMBER_TYPES = {
  OWNER: "owner",
  EMPLOYEE: "employee",
  CONTRACTOR: "contractor",
  CLIENT: "client",
} as const;

export type MemberType = (typeof MEMBER_TYPES)[keyof typeof MEMBER_TYPES];

/** Status of a single membership. */
export const MEMBERSHIP_STATUS = {
  ACTIVE: "active",
  INVITED: "invited",
  SUSPENDED: "suspended",
} as const;

export type MembershipStatus =
  (typeof MEMBERSHIP_STATUS)[keyof typeof MEMBERSHIP_STATUS];

/**
 * Default resource limits (used as a fallback when a plan doesn't override).
 * -1 denotes "unlimited". Placeholder numbers — tuned per plan later.
 */
export const DEFAULT_ORGANIZATION_LIMITS = {
  maxSeats: 5,
  maxProjects: 10,
  maxClients: 25,
  maxStorageBytes: 5 * 1024 * 1024 * 1024,
  maxAiTokensPerMonth: 100_000,
} as const;
