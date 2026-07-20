/**
 * Dashboard shell constants for AgencyOS.
 * Placeholder foundation — values only. The shared shell serves every dashboard
 * surface; these constants identify the surfaces and gate shell capabilities.
 * Source of truth: docs/adr/ADR-002-Dashboard-Shell.md, docs/DESIGN_SYSTEM.md §10.
 */

/** The dashboard surfaces that share ONE shell. */
export const DASHBOARD_SURFACES = {
  CLIENT: "client",
  ADMIN: "admin",
  EMPLOYEE: "employee",
  FINANCE: "finance",
  SUPPORT: "support",
  SUPER_ADMIN: "super_admin",
} as const;

export type DashboardSurface =
  (typeof DASHBOARD_SURFACES)[keyof typeof DASHBOARD_SURFACES];

/**
 * Shell capability flags — toggle cross-cutting shell features per build/tenant.
 * Interactive/data features default OFF (built later); static chrome defaults ON.
 */
export const DASHBOARD_FEATURE_FLAGS = {
  collapsibleSidebar: true,
  breadcrumbs: true,
  commandPalette: false,
  notificationCenter: false,
  globalSearch: false,
  widgets: false,
  quickActions: false,
} as const;

export type DashboardFeatureFlag = keyof typeof DASHBOARD_FEATURE_FLAGS;

/** Widget size tokens used by the widget grid. */
export const WIDGET_SIZES = {
  SM: "sm",
  MD: "md",
  LG: "lg",
  FULL: "full",
} as const;

export type WidgetSize = (typeof WIDGET_SIZES)[keyof typeof WIDGET_SIZES];

/** Search scopes for the global dashboard search. */
export const SEARCH_SCOPES = {
  ALL: "all",
  PROJECTS: "projects",
  CLIENTS: "clients",
  INVOICES: "invoices",
  TASKS: "tasks",
  PEOPLE: "people",
  FILES: "files",
} as const;

export type SearchScope = (typeof SEARCH_SCOPES)[keyof typeof SEARCH_SCOPES];
