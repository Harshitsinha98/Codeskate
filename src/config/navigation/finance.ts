/**
 * Finance dashboard navigation — PLACEHOLDER configuration (pure data).
 * Source of truth: docs/DESIGN_SYSTEM.md §10.4.
 */

import type { DashboardNavigationConfig } from "@/types/dashboard";
import { DASHBOARD_SURFACES } from "@/constants/dashboard";

const financeNavigation: DashboardNavigationConfig = {
  surface: DASHBOARD_SURFACES.FINANCE,
  groups: [
    {
      id: "main",
      items: [
        { id: "overview", label: "Overview", href: "/finance", icon: "layout-dashboard" },
        { id: "invoices", label: "Invoices", href: "/finance/invoices", icon: "receipt" },
        { id: "payments", label: "Payments", href: "/finance/payments", icon: "credit-card" },
        { id: "subscriptions", label: "Subscriptions", href: "/finance/subscriptions", icon: "repeat" },
        { id: "refunds", label: "Refunds", href: "/finance/refunds", icon: "rotate-ccw" },
        { id: "reports", label: "Reports", href: "/finance/reports", icon: "bar-chart-3" },
      ],
    },
  ],
  quickActions: [
    { id: "issue-invoice", label: "Issue invoice", icon: "plus", actionKey: "finance.issueInvoice" },
  ],
};

export default financeNavigation;
