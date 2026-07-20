/**
 * Access-context composition — the bridge between Better Auth (identity) and
 * the existing Organization architecture (tenant + per-org roles).
 *
 * `AccessContext.userId` is Better Auth's `session.user.id` — the same person
 * as `@/types/identity` `Identity.id` once the identity/auth reconciliation
 * noted in ADR-001 lands. Organization membership resolution goes through the
 * EXISTING `organizationService` (still a placeholder pending the backend);
 * calls are wrapped so an unimplemented service degrades to "authenticated,
 * no organization context" rather than throwing — guards must never crash the
 * app because a downstream service isn't built yet.
 */

import type { ID } from "@/types/common";
import type { AccessContext, RoleDefinition } from "@/types/rbac";
import { getServerSession } from "@/lib/rbac/session";
import { organizationService } from "@/services/organization.service";

/**
 * Resolve the full access context for the current request, or null if the
 * caller is unauthenticated.
 */
export async function getAccessContext(): Promise<AccessContext | null> {
  const session = await getServerSession();
  if (!session?.user) return null;

  let organizationId: ID | null = null;
  let roles: AccessContext["roles"] = [];

  try {
    // Placeholder today — see services/organization.service.ts. Once
    // implemented, this resolves the caller's current OrganizationContext
    // (organization + membership.roles) for the active tenant.
    const current = await organizationService.getCurrent();
    if (current) {
      const ctx = current as unknown as {
        organization: { id: ID };
        membership: { roles: AccessContext["roles"] };
      };
      organizationId = ctx.organization.id;
      roles = ctx.membership.roles;
    }
  } catch {
    // organizationService not implemented yet — authenticated, no org context.
  }

  return { userId: session.user.id, organizationId, roles };
}

/**
 * Resolve an organization's custom (tenant-defined) role definitions.
 * Placeholder-safe: returns an empty list until the backend implements it,
 * so permission resolution simply falls back to system roles only.
 */
export async function getCustomRoleDefinitions(): Promise<RoleDefinition[]> {
  try {
    const roles = await organizationService.getCustomRoles();
    return roles as unknown as RoleDefinition[];
  } catch {
    return [];
  }
}
