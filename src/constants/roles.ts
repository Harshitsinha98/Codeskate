/**
 * Canonical user roles for AgencyOS RBAC.
 * Placeholder foundation — values only, no enforcement logic here.
 * Source of truth: docs/ARCHITECTURE.md §3 (User Roles & Permissions).
 */

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  AGENCY_OWNER: "agency_owner",
  ADMIN: "admin",
  PROJECT_MANAGER: "project_manager",
  DEVELOPER: "developer",
  DESIGNER: "designer",
  MARKETING_EXECUTIVE: "marketing_executive",
  SALES_EXECUTIVE: "sales_executive",
  FINANCE: "finance",
  HR: "hr",
  SUPPORT: "support",
  CONTRACTOR: "contractor",
  CLIENT_OWNER: "client_owner",
  CLIENT_COLLABORATOR: "client_collaborator",
  GUEST: "guest",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Roles that belong to the agency (internal) surface. */
export const INTERNAL_ROLES: Role[] = [
  ROLES.AGENCY_OWNER,
  ROLES.ADMIN,
  ROLES.PROJECT_MANAGER,
  ROLES.DEVELOPER,
  ROLES.DESIGNER,
  ROLES.MARKETING_EXECUTIVE,
  ROLES.SALES_EXECUTIVE,
  ROLES.FINANCE,
  ROLES.HR,
  ROLES.SUPPORT,
  ROLES.CONTRACTOR,
];

/** Roles that belong to the client surface. */
export const CLIENT_ROLES: Role[] = [
  ROLES.CLIENT_OWNER,
  ROLES.CLIENT_COLLABORATOR,
];
