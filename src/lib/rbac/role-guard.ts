/**
 * Role guards — assert the caller holds a required role (in their current
 * organization) before proceeding. Framework-agnostic: usable from Server
 * Components, Server Actions, or Route Handlers.
 */

import type { RequirementMode, RoleKey } from "@/types/rbac";
import { getAccessContext } from "@/lib/rbac/context";
import { hasRole } from "@/lib/rbac/permissions";
import { ForbiddenError, UnauthorizedError } from "@/lib/rbac/errors";

/** Resolve the current AccessContext or throw UnauthorizedError. */
export async function requireSession() {
  const context = await getAccessContext();
  if (!context) throw new UnauthorizedError();
  return context;
}

/**
 * Require the caller to hold at least one (or all, per `mode`) of the given
 * roles in their current organization. Throws ForbiddenError otherwise.
 */
export async function requireRole(roles: RoleKey[], mode: RequirementMode = "any") {
  const context = await requireSession();
  if (!hasRole(context, roles, mode)) {
    throw new ForbiddenError(`Requires role: ${roles.join(", ")}`);
  }
  return context;
}
