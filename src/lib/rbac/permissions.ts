/**
 * Pure RBAC permission resolution — no I/O, no framework dependency.
 * Operates on an already-resolved `AccessContext` (see `@/lib/rbac/context`).
 *
 * Super-admin roles (`SUPER_ROLES`) bypass every check: this is a PLATFORM-level
 * override, not an organization-membership grant, so it is checked before any
 * per-organization role/permission lookup.
 */

import { SUPER_ROLES } from "@/constants/role-permissions";
import type { Permission } from "@/constants/permissions";
import type { OrganizationPermission } from "@/constants/organization-permissions";
import type {
  AccessContext,
  RequirementMode,
  RoleDefinition,
  RoleKey,
} from "@/types/rbac";
import { resolveRoleDefinitions } from "@/lib/rbac/registry";

const SUPER_ROLE_SET = new Set<string>(SUPER_ROLES);

/** True if the context holds a platform-level super role (bypasses all checks). */
export function isSuperAdmin(context: AccessContext): boolean {
  return context.roles.some((role) => SUPER_ROLE_SET.has(role));
}

/** True if the context holds at least one (or all, per `mode`) of the given roles. */
export function hasRole(
  context: AccessContext,
  roles: RoleKey[],
  mode: RequirementMode = "any"
): boolean {
  if (isSuperAdmin(context)) return true;
  const held = new Set(context.roles);
  return mode === "all"
    ? roles.every((r) => held.has(r))
    : roles.some((r) => held.has(r));
}

/** All business permissions granted to the context via its held roles. */
export function getEffectivePermissions(
  context: AccessContext,
  customRoles: RoleDefinition[] = []
): Set<Permission> {
  const defs = resolveRoleDefinitions(context.roles, customRoles);
  return new Set(defs.flatMap((d) => d.permissions));
}

/** All organization (tenant-management) permissions granted via held roles. */
export function getEffectiveOrganizationPermissions(
  context: AccessContext,
  customRoles: RoleDefinition[] = []
): Set<OrganizationPermission> {
  const defs = resolveRoleDefinitions(context.roles, customRoles);
  return new Set(defs.flatMap((d) => d.organizationPermissions));
}

export function hasPermission(
  context: AccessContext,
  permissions: Permission[],
  mode: RequirementMode = "any",
  customRoles: RoleDefinition[] = []
): boolean {
  if (isSuperAdmin(context)) return true;
  const granted = getEffectivePermissions(context, customRoles);
  return mode === "all"
    ? permissions.every((p) => granted.has(p))
    : permissions.some((p) => granted.has(p));
}

export function hasOrganizationPermission(
  context: AccessContext,
  permissions: OrganizationPermission[],
  mode: RequirementMode = "any",
  customRoles: RoleDefinition[] = []
): boolean {
  if (isSuperAdmin(context)) return true;
  const granted = getEffectiveOrganizationPermissions(context, customRoles);
  return mode === "all"
    ? permissions.every((p) => granted.has(p))
    : permissions.some((p) => granted.has(p));
}
