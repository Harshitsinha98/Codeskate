/**
 * Dashboard navigation registry — maps each surface to its (placeholder) config.
 * Configuration-driven: the shared shell reads these; no bespoke nav per dashboard.
 */

import type { DashboardNavigationConfig } from "@/types/dashboard";
import type { DashboardSurface } from "@/constants/dashboard";
import { DASHBOARD_SURFACES } from "@/constants/dashboard";
import clientNavigation from "@/config/navigation/client";
import adminNavigation from "@/config/navigation/admin";
import employeeNavigation from "@/config/navigation/employee";
import financeNavigation from "@/config/navigation/finance";
import supportNavigation from "@/config/navigation/support";
import superAdminNavigation from "@/config/navigation/super-admin";

export {
  clientNavigation,
  adminNavigation,
  employeeNavigation,
  financeNavigation,
  supportNavigation,
  superAdminNavigation,
};

/** Lookup a surface's navigation config. */
export const DASHBOARD_NAVIGATION: Record<
  DashboardSurface,
  DashboardNavigationConfig
> = {
  [DASHBOARD_SURFACES.CLIENT]: clientNavigation,
  [DASHBOARD_SURFACES.ADMIN]: adminNavigation,
  [DASHBOARD_SURFACES.EMPLOYEE]: employeeNavigation,
  [DASHBOARD_SURFACES.FINANCE]: financeNavigation,
  [DASHBOARD_SURFACES.SUPPORT]: supportNavigation,
  [DASHBOARD_SURFACES.SUPER_ADMIN]: superAdminNavigation,
};
