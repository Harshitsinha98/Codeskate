/**
 * Support dashboard navigation — PLACEHOLDER configuration (pure data).
 * Source of truth: docs/DESIGN_SYSTEM.md §10.5.
 */

import type { DashboardNavigationConfig } from "@/types/dashboard";
import { DASHBOARD_SURFACES } from "@/constants/dashboard";

const supportNavigation: DashboardNavigationConfig = {
  surface: DASHBOARD_SURFACES.SUPPORT,
  groups: [
    {
      id: "main",
      items: [
        { id: "tickets", label: "Tickets", href: "/support/tickets", icon: "ticket" },
        { id: "queue", label: "Queue", href: "/support/queue", icon: "inbox" },
        { id: "kb", label: "Knowledge Base", href: "/support/kb", icon: "book-open" },
        { id: "clients", label: "Clients", href: "/support/clients", icon: "users" },
        { id: "reports", label: "Reports", href: "/support/reports", icon: "bar-chart-3" },
      ],
    },
  ],
  quickActions: [
    { id: "new-ticket", label: "New ticket", icon: "plus", actionKey: "support.newTicket" },
  ],
};

export default supportNavigation;
