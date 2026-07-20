/**
 * Permission guards — assert the caller holds a required (business or
 * organization-management) permission before proceeding. Framework-agnostic:
 * usable from Server Components, Server Actions, or Route Handlers.
 *
 * Custom (tenant-defined) role definitions are resolved automatically via the
 * existing organization architecture (`@/lib/rbac/context`
 * `getCustomRoleDefinitions`) so organization-specific roles are honored
 * without callers needing to pass them explicitly.
 */

import type { Permission } from "@/constants/permissions";
import type { OrganizationPermission } from "@/constants/organization-permissions";
import type { RequirementMode } from "@/types/rbac";
import { getAccessContext, getCustomRoleDefinitions } from "@/lib/rbac/context";
import { hasOrganizationPermission, hasPermission } from "@/lib/rbac/permissions";
import { ForbiddenError, UnauthorizedError } from "@/lib/rbac/errors";

/**
 * Require the caller to hold at least one (or all, per `mode`) of the given
 * business permissions. Throws UnauthorizedError if not authenticated, or
 * ForbiddenError if authenticated but lacking the permission.
 */
export async function requirePermission(
  permissions: Permission[],
  mode: RequirementMode = "any"
) {
  const context = await getAccessContext();
  if (!context) throw new UnauthorizedError();

  const customRoles = context.organizationId
    ? await getCustomRoleDefinitions()
    : [];

  if (!hasPermission(context, permissions, mode, customRoles)) {
    throw new ForbiddenError(`Requires permission: ${permissions.join(", ")}`);
  }
  return context;
}

/**
 * Require the caller to hold at least one (or all, per `mode`) of the given
 * organization-management permissions (settings/billing/members/branding).
 */
export async function requireOrganizationPermission(
  permissions: OrganizationPermission[],
  mode: RequirementMode = "any"
) {
  const context = await getAccessContext();
  if (!context) throw new UnauthorizedError();

  const customRoles = context.organizationId
    ? await getCustomRoleDefinitions()
    : [];

  if (!hasOrganizationPermission(context, permissions, mode, customRoles)) {
    throw new ForbiddenError(
      `Requires organization permission: ${permissions.join(", ")}`
    );
  }
  return context;
}
