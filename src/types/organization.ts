/**
 * Organization (tenant) domain types for AgencyOS multi-tenant SaaS.
 * Placeholder foundation — INTERFACES ONLY, no implementation.
 *
 * Architectural notes:
 * - An `Organization` is the TENANT ROOT: it is NOT itself tenant-scoped
 *   (it does not extend BaseEntity / TenantScoped — everything else scopes TO it).
 * - Membership is many-to-many: a User belongs to many Organizations, an
 *   Organization has many Users, and roles are held PER (user, organization)
 *   pair — see `OrganizationMembership`.
 *
 * Source of truth: docs/DATABASE.md (Domain A), docs/ARCHITECTURE.md §Domain A.
 */

import type {
  BaseEntity,
  ID,
  ISODateString,
  Money,
  SoftDeletable,
  Timestamps,
} from "@/types/common";
import type { Role } from "@/constants/roles";
import type { OrganizationFeatureKey } from "@/constants/organization-features";

// Re-export the derived unions so consumers can import them from "@/types".
export type {
  OrganizationStatus,
  PlanTier,
  SubscriptionStatus,
  BillingInterval,
  MemberType,
  MembershipStatus,
} from "@/constants/organization";

import type {
  OrganizationStatus,
  PlanTier,
  SubscriptionStatus,
  BillingInterval,
  MemberType,
  MembershipStatus,
} from "@/constants/organization";

/** Visual identity + domain configuration for a tenant. */
export interface OrganizationBranding {
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  accentColor: string;
  customDomain: string | null;
  emailFromName: string | null;
}

/** Resource ceilings for a tenant (derived from its plan). -1 = unlimited. */
export interface OrganizationLimits {
  maxSeats: number;
  maxProjects: number;
  maxClients: number;
  maxStorageBytes: number;
  maxAiTokensPerMonth: number;
}

/** Per-tenant module entitlements (which features are enabled). */
export type OrganizationFeatures = Record<OrganizationFeatureKey, boolean>;

/** A purchasable plan definition. */
export interface OrganizationPlan {
  tier: PlanTier;
  name: string;
  price: Money;
  interval: BillingInterval;
  limits: OrganizationLimits;
  features: OrganizationFeatureKey[];
}

/** The tenant's active subscription (tenant-scoped). */
export interface OrganizationSubscription extends BaseEntity {
  planTier: PlanTier;
  status: SubscriptionStatus;
  provider: "stripe" | "razorpay" | null;
  providerRef: string | null;
  currentPeriodStart: ISODateString | null;
  currentPeriodEnd: ISODateString | null;
  trialEndsAt: ISODateString | null;
  cancelAt: ISODateString | null;
}

/** 1:1 configuration bundle for a tenant. */
export interface OrganizationSettings {
  organizationId: ID;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  limits: OrganizationLimits;
  locale: string;
  timezone: string;
  defaultCurrency: string;
}

/**
 * The Organization (tenant) root record.
 * Intentionally NOT extending BaseEntity — it is the tenancy boundary itself,
 * so it carries no `organizationId` pointing elsewhere.
 */
export interface Organization extends Timestamps, SoftDeletable {
  id: ID;
  name: string;
  slug: string;
  status: OrganizationStatus;
  planTier: PlanTier;
  ownerUserId: ID;
  branding: OrganizationBranding;
}

/**
 * Membership — the join between a User and an Organization.
 * Tenant-scoped (extends BaseEntity → carries `organizationId`). The same user
 * has one membership per organization they belong to, each with its own roles.
 */
export interface OrganizationMembership extends BaseEntity {
  userId: ID;
  roles: Role[];
  memberType: MemberType;
  status: MembershipStatus;
  invitedById: ID | null;
  joinedAt: ISODateString | null;
}

/**
 * Lightweight view of a user's organizations — powers the org switcher and
 * post-login routing. Derived from memberships; no persistence of its own.
 */
export interface UserOrganizationSummary {
  organizationId: ID;
  organizationName: string;
  organizationSlug: string;
  roles: Role[];
  memberType: MemberType;
  status: MembershipStatus;
}

/** Resolved tenant context for the current request/session (frontend view). */
export interface OrganizationContext {
  organization: Organization;
  membership: OrganizationMembership;
  features: OrganizationFeatures;
  limits: OrganizationLimits;
}
