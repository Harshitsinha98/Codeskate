/**
 * Route (API) guards — wrap a Next.js Route Handler so it only runs when the
 * caller satisfies a role/permission requirement, translating RBAC errors into
 * standard 401/403 JSON responses. This is the concrete "protect routes based
 * on permissions" mechanism for `src/app/api/**` route handlers; no UI involved.
 *
 * Usage (future route handler):
 *   export const POST = withApiPermission([PERMISSIONS.PROJECT_CREATE], async (req, ctx) => { ... });
 */

import { NextResponse, type NextRequest } from "next/server";
import type { Permission } from "@/constants/permissions";
import type { AccessContext, RequirementMode, RoleKey } from "@/types/rbac";
import { requireRole } from "@/lib/rbac/role-guard";
import { requirePermission } from "@/lib/rbac/permission-guard";
import { ForbiddenError, UnauthorizedError } from "@/lib/rbac/errors";

type RouteHandler = (
  request: NextRequest,
  context: AccessContext
) => Promise<Response> | Response;

function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: error.message } },
      { status: 401 }
    );
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: error.message } },
      { status: 403 }
    );
  }
  throw error;
}

/** Protect a Route Handler behind a role requirement. */
export function withApiRole(
  roles: RoleKey[],
  handler: RouteHandler,
  mode: RequirementMode = "any"
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      const context = await requireRole(roles, mode);
      return await handler(request, context);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

/** Protect a Route Handler behind a permission requirement. */
export function withApiPermission(
  permissions: Permission[],
  handler: RouteHandler,
  mode: RequirementMode = "any"
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      const context = await requirePermission(permissions, mode);
      return await handler(request, context);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}
