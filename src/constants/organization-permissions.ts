/**
 * Organization-level permission primitives — PLACEHOLDER.
 * Governs who can manage the tenant itself (settings, billing, members, branding).
 * Complements the app-wide `@/constants/permissions`. No enforcement logic here.
 * Source of truth: docs/ARCHITECTURE.md §3, docs/BACKEND.md §7.
 */

export const ORGANIZATION_PERMISSIONS = {
  ORG_VIEW: "org:view",
  ORG_UPDATE: "org:update",
  ORG_DELETE: "org:delete",
  ORG_SETTINGS_MANAGE: "org:settings:manage",
  ORG_BRANDING_MANAGE: "org:branding:manage",
  ORG_FEATURE_MANAGE: "org:feature:manage",
  ORG_BILLING_MANAGE: "org:billing:manage",
  ORG_MEMBER_INVITE: "org:member:invite",
  ORG_MEMBER_REMOVE: "org:member:remove",
  ORG_MEMBER_ROLE_MANAGE: "org:member:role:manage",
} as const;

export type OrganizationPermission =
  (typeof ORGANIZATION_PERMISSIONS)[keyof typeof ORGANIZATION_PERMISSIONS];
