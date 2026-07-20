/**
 * RBAC (role-based access control) types for AgencyOS.
 * Interfaces only here; resolution logic lives in "@/lib/rbac".
 *
 * Reuses the existing domain: roles come from `@/constants/roles`, business
 * permissions from `@/constants/permissions`, tenant-management permissions from
 * `@/constants/organization-permissions`, and org scoping from
 * `@/types/organization` (`OrganizationMembership`, `OrganizationContext`).
 *
 * Source of truth: docs/ARCHITECTURE.md §3–4, ADR-001 (Identity), ADR-002 (Dashboard shell).
 */

import type { ID } from "@/types/common";
import type { Role } from "@/constants/roles";
import type { Permission } from "@/constants/permissions";
import type { OrganizationPermission } from "@/constants/organization-permissions";

/**
 * A role key: one of the known system roles, OR a future tenant-defined custom
 * role key (string). This widening (rather than a closed union) is what lets
 * an organization define its own roles later without changing this type —
 * only the resolver needs to learn about new keys via `RoleDefinition`s.
 */
export type RoleKey = Role | (string & {});

/**
 * A role's permission grant — either a built-in system role (seeded from
 * `@/constants/role-permissions`) or a future custom, tenant-defined role
 * (resolved per-organization by a `CustomRoleResolver`).
 */
export interface RoleDefinition {
  key: RoleKey;
  label: string;
  isSystem: boolean;
  permissions: Permission[];
  organizationPermissions: OrganizationPermission[];
}

/**
 * The resolved access context for the current request: which identity, in
 * which organization, holding which roles THERE (roles are always evaluated
 * per-organization — the same user can hold different roles in different
 * organizations; see `OrganizationMembership` in `@/types/organization`).
 */
export interface AccessContext {
  userId: ID;
  organizationId: ID | null;
  roles: RoleKey[];
}

/** Uniform result of a guard/permission evaluation. */
export interface AccessDecision {
  allowed: boolean;
  reason?: string;
}

/** How multiple required items combine: any one is enough, or all are required. */
export type RequirementMode = "any" | "all";

/**
 * Loads an organization's custom (tenant-defined) role definitions.
 * Placeholder-compatible: a later phase implements this against real data;
 * until then, resolvers that accept one default to an empty list (no custom
 * roles), so behavior degrades to "system roles only" rather than failing.
 */
export type CustomRoleResolver = (organizationId: ID) => Promise<RoleDefinition[]>;
