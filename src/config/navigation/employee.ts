/**
 * Employee dashboard navigation — PLACEHOLDER configuration (pure data).
 * Source of truth: docs/DESIGN_SYSTEM.md §10.3.
 */

import type { DashboardNavigationConfig } from "@/types/dashboard";
import { DASHBOARD_SURFACES } from "@/constants/dashboard";

const employeeNavigation: DashboardNavigationConfig = {
  surface: DASHBOARD_SURFACES.EMPLOYEE,
  groups: [
    {
      id: "main",
      items: [
        { id: "my-work", label: "My Work", href: "/employee", icon: "list-checks" },
        { id: "projects", label: "My Projects", href: "/employee/projects", icon: "folder-kanban" },
        { id: "calendar", label: "Calendar", href: "/employee/calendar", icon: "calendar" },
        { id: "timesheets", label: "Timesheets", href: "/employee/timesheets", icon: "clock" },
        { id: "notifications", label: "Notifications", href: "/employee/notifications", icon: "bell" },
      ],
    },
  ],
  quickActions: [
    { id: "start-timer", label: "Start timer", icon: "play", actionKey: "employee.startTimer" },
    { id: "log-time", label: "Log time", icon: "clock", actionKey: "employee.logTime" },
  ],
};

export default employeeNavigation;
