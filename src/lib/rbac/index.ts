/**
 * Barrel export for AgencyOS RBAC. Import from "@/lib/rbac".
 */

export { getServerSession } from "@/lib/rbac/session";
export { getAccessContext, getCustomRoleDefinitions } from "@/lib/rbac/context";
export { resolveRoleDefinitions } from "@/lib/rbac/registry";
export {
  isSuperAdmin,
  hasRole,
  hasPermission,
  hasOrganizationPermission,
  getEffectivePermissions,
  getEffectiveOrganizationPermissions,
} from "@/lib/rbac/permissions";
export { requireSession, requireRole } from "@/lib/rbac/role-guard";
export {
  requirePermission,
  requireOrganizationPermission,
} from "@/lib/rbac/permission-guard";
export { withApiRole, withApiPermission } from "@/lib/rbac/route-guard";
export { UnauthorizedError, ForbiddenError } from "@/lib/rbac/errors";
