/**
 * Super Admin (platform) navigation — PLACEHOLDER configuration (pure data).
 * Reserved for the future multi-tenant control plane [SaaS].
 * Source of truth: docs/ARCHITECTURE.md (A18 / Platform), docs/EVOLUTION_ROADMAP.md Phase 9.
 */

import type { DashboardNavigationConfig } from "@/types/dashboard";
import { DASHBOARD_SURFACES } from "@/constants/dashboard";

const superAdminNavigation: DashboardNavigationConfig = {
  surface: DASHBOARD_SURFACES.SUPER_ADMIN,
  groups: [
    {
      id: "platform",
      label: "Platform",
      items: [
        { id: "overview", label: "Overview", href: "/platform", icon: "layout-dashboard" },
        { id: "tenants", label: "Tenants", href: "/platform/tenants", icon: "building-2" },
        { id: "billing", label: "Billing", href: "/platform/billing", icon: "banknote" },
        { id: "feature-flags", label: "Feature Flags", href: "/platform/feature-flags", icon: "flag" },
        { id: "marketplace", label: "Marketplace", href: "/platform/marketplace", icon: "store", requiredFeature: "marketplace" },
        { id: "audit", label: "Audit Logs", href: "/platform/audit", icon: "scroll-text" },
      ],
    },
  ],
};

export default superAdminNavigation;
