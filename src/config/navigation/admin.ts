/**
 * Admin dashboard navigation — PLACEHOLDER configuration (pure data).
 * Source of truth: docs/DESIGN_SYSTEM.md §10.2.
 */

import type { DashboardNavigationConfig } from "@/types/dashboard";
import { DASHBOARD_SURFACES } from "@/constants/dashboard";

const adminNavigation: DashboardNavigationConfig = {
  surface: DASHBOARD_SURFACES.ADMIN,
  groups: [
    {
      id: "overview",
      items: [
        { id: "overview", label: "Overview", href: "/admin", icon: "layout-dashboard" },
        { id: "clients", label: "Clients", href: "/admin/clients", icon: "users" },
        { id: "projects", label: "Projects", href: "/admin/projects", icon: "folder-kanban" },
        { id: "crm", label: "CRM", href: "/admin/crm", icon: "target", requiredFeature: "crm" },
      ],
    },
    {
      id: "business",
      label: "Business",
      items: [
        { id: "finance", label: "Finance", href: "/admin/finance", icon: "banknote", requiredFeature: "payments" },
        { id: "team", label: "Team", href: "/admin/team", icon: "user-cog" },
        { id: "catalog", label: "Catalog", href: "/admin/catalog", icon: "package" },
        { id: "cms", label: "CMS", href: "/admin/cms", icon: "newspaper" },
        { id: "analytics", label: "Analytics", href: "/admin/analytics", icon: "bar-chart-3", requiredFeature: "analytics" },
      ],
    },
    {
      id: "system",
      label: "System",
      items: [
        { id: "settings", label: "Settings", href: "/admin/settings", icon: "settings" },
      ],
    },
  ],
  quickActions: [
    { id: "new-project", label: "New project", icon: "plus", actionKey: "admin.newProject" },
    { id: "new-invoice", label: "Create invoice", icon: "receipt", actionKey: "admin.newInvoice" },
  ],
};

export default adminNavigation;
