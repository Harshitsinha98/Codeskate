/**
 * Client dashboard navigation — PLACEHOLDER configuration (pure data).
 * Routes are reserved; pages are built in a later phase.
 * Source of truth: docs/DESIGN_SYSTEM.md §10.1.
 */

import type { DashboardNavigationConfig } from "@/types/dashboard";
import { DASHBOARD_SURFACES } from "@/constants/dashboard";

const clientNavigation: DashboardNavigationConfig = {
  surface: DASHBOARD_SURFACES.CLIENT,
  groups: [
    {
      id: "main",
      items: [
        { id: "overview", label: "Overview", href: "/client", icon: "layout-dashboard" },
        { id: "projects", label: "Projects", href: "/client/projects", icon: "folder-kanban" },
        { id: "approvals", label: "Approvals", href: "/client/approvals", icon: "check-circle" },
        { id: "invoices", label: "Invoices", href: "/client/invoices", icon: "receipt" },
        { id: "files", label: "Files", href: "/client/files", icon: "file" },
        { id: "messages", label: "Messages", href: "/client/messages", icon: "message-square" },
        { id: "support", label: "Support", href: "/client/support", icon: "life-buoy" },
      ],
    },
  ],
  quickActions: [
    { id: "request-change", label: "Request a change", icon: "plus", actionKey: "client.requestChange" },
  ],
};

export default clientNavigation;
