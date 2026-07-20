/**
 * Dashboard shell types for AgencyOS.
 * Placeholder foundation — INTERFACES ONLY, no implementation.
 *
 * One shell, many surfaces: these types describe a CONFIGURATION-DRIVEN shell so
 * Client/Admin/Employee/Finance/Support/Super-Admin dashboards are the SAME code
 * fed different data. Nav, widgets, commands, and search are all data, not bespoke
 * components. Source of truth: docs/adr/ADR-002-Dashboard-Shell.md.
 *
 * Design note: icons are referenced by NAME (Lucide icon key string), not by
 * component, so navigation/command configs stay pure serializable data.
 */

import type { DashboardSurface, WidgetSize, SearchScope } from "@/constants/dashboard";
import type { Permission } from "@/constants/permissions";
import type { OrganizationFeatureKey } from "@/constants/organization-features";
import type { NotificationChannel } from "@/types/notification";

// Re-export shell unions so consumers can import from "@/types".
export type { DashboardSurface, WidgetSize, SearchScope } from "@/constants/dashboard";

/** A single navigable item in the sidebar (may nest). */
export interface SidebarItem {
  id: string;
  label: string;
  /** Target route (reserved routes; pages built later). */
  href: string;
  /** Lucide icon name (string key), resolved at render time. */
  icon?: string;
  /** Dynamic badge source key (e.g. "unreadCount"); resolved later. */
  badgeKey?: string;
  requiredPermissions?: Permission[];
  requiredFeature?: OrganizationFeatureKey;
  children?: SidebarItem[];
}

/** A labelled group of sidebar items. */
export interface NavigationGroup {
  id: string;
  label?: string;
  items: SidebarItem[];
}

/** A primary action surfaced in the shell (e.g. "New project"). */
export interface QuickAction {
  id: string;
  label: string;
  icon?: string;
  /** Maps to a handler in a later phase. */
  actionKey: string;
  requiredPermissions?: Permission[];
}

/** Per-surface navigation configuration. */
export interface DashboardNavigationConfig {
  surface: DashboardSurface;
  groups: NavigationGroup[];
  quickActions?: QuickAction[];
}

/** A single breadcrumb segment. */
export interface Breadcrumb {
  label: string;
  href?: string;
}

/** A dashboard widget descriptor (rendered by a widget registry later). */
export interface Widget {
  id: string;
  /** Widget kind key (e.g. "stat", "chart", "activity", "list"). */
  type: string;
  title: string;
  size: WidgetSize;
  requiredPermissions?: Permission[];
  requiredFeature?: OrganizationFeatureKey;
  /** Free-form widget configuration, validated by the widget later. */
  config?: Record<string, unknown>;
}

/** A composed dashboard page (widgets + context), driven by config. */
export interface DashboardPage {
  id: string;
  surface: DashboardSurface;
  title: string;
  path: string;
  breadcrumbs?: Breadcrumb[];
  widgets?: Widget[];
  quickActions?: QuickAction[];
}

/** The resolved shell layout for a surface — what the shell renders. */
export interface DashboardLayout {
  surface: DashboardSurface;
  navigation: DashboardNavigationConfig;
  showSidebar: boolean;
  showTopbar: boolean;
  showBreadcrumbs: boolean;
  showCommandPalette: boolean;
  showNotifications: boolean;
  showSearch: boolean;
}

/* ── Command palette architecture (no implementation) ───────────────────────── */

export interface Command {
  id: string;
  label: string;
  hint?: string;
  icon?: string;
  group: string;
  keywords?: string[];
  /** Maps to a handler (navigate/create/run) in a later phase. */
  actionKey: string;
  requiredPermissions?: Permission[];
}

export interface CommandGroup {
  id: string;
  label: string;
  commands: Command[];
}

export interface CommandPaletteConfig {
  enabled: boolean;
  placeholder: string;
  groups: CommandGroup[];
}

/* ── Notification center architecture (no implementation) ───────────────────── */

export interface NotificationCenterConfig {
  enabled: boolean;
  channels: NotificationChannel[];
  groupByDay: boolean;
  pageSize: number;
}

/* ── Dashboard search architecture (no implementation) ──────────────────────── */

export interface SearchResultItem {
  id: string;
  scope: SearchScope;
  title: string;
  subtitle?: string;
  href: string;
  icon?: string;
}

export interface SearchConfig {
  enabled: boolean;
  placeholder: string;
  scopes: SearchScope[];
  debounceMs: number;
}
