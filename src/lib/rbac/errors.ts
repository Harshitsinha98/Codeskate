/**
 * Typed RBAC errors — framework-agnostic so they can be thrown from Server
 * Components, Server Actions, or Route Handlers and translated appropriately
 * by whichever layer catches them (e.g. `@/lib/rbac/route-guard` maps them to
 * 401/403 JSON responses for API routes).
 */

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "ForbiddenError";
  }
}
