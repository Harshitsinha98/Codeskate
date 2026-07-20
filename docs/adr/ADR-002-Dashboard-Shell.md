# ADR-002 — Dashboard Shell: One Configuration-Driven Shell for Every Surface

**Status:** Accepted
**Date:** 2026-07-11
**Deciders:** Principal Architect (dashboard foundation phase)
**Context docs:** `DESIGN_SYSTEM.md §10`, `ARCHITECTURE.md`, `EVOLUTION_ROADMAP.md`, `ADR-001`

---

## Context

AgencyOS has six authenticated dashboard surfaces: **Client, Admin, Employee, Finance, Support,**
and future **Super Admin**. Each shows different data and navigation, but structurally they are the
same product: a sidebar + top bar (with breadcrumbs, ⌘K command palette, global search, notification
center) wrapping a content area of widgets, tables, charts, forms, dialogs, and drawers.

We must decide whether to build **one shared shell** parameterised per surface, or **separate shells**
per role — before any dashboard UI is written, so all surfaces are built on the same foundation.

---

## Decision

Build **ONE dashboard shell**, driven by **configuration**, reused by all surfaces.

- The shell is a set of shared placeholder components (`@/components/dashboard/*`): layout, sidebar,
  topbar, breadcrumbs, command-palette, widgets, tables, charts, forms, dialogs, drawers,
  notifications, search.
- Each surface supplies a **`DashboardNavigationConfig`** (pure data) — see
  `@/config/navigation/{client,admin,employee,finance,support,super-admin}.ts` and the
  `DASHBOARD_NAVIGATION` registry.
- Shell behaviour is described by **interfaces** (`@/types/dashboard`): `DashboardLayout`,
  `SidebarItem`, `NavigationGroup`, `Breadcrumb`, `Widget`, `DashboardPage`, `QuickAction`, plus
  `CommandPaletteConfig`, `NotificationCenterConfig`, `SearchConfig`.
- Surfaces and shell capabilities are enumerated in constants (`@/constants/dashboard`):
  `DASHBOARD_SURFACES`, `DASHBOARD_FEATURE_FLAGS`.
- Icons are referenced by **name** (Lucide key string), so navigation/command configs stay pure,
  serializable data (no component imports in config).

This phase delivers **architecture only** — every component renders `children` or `null`; no styling,
no logic, no wiring.

---

## Rationale

### Why every dashboard shares one shell
- **Consistency by construction.** A single shell guarantees identical layout, keyboard model,
  spacing, and interaction across surfaces — the "one product" feel from `DESIGN_SYSTEM.md`. Six
  shells would drift.
- **Build once, benefit everywhere.** Command palette, notifications, search, responsive behaviour,
  and accessibility are implemented **one time**. A fix or upgrade lands on all surfaces at once.
- **Density is a parameter, not a fork.** Surfaces differ mainly in *what* they show and *how dense*
  they are — expressible as config (nav + widgets + flags), not as separate codebases.
- **Cheaper new surfaces.** Adding Super Admin (or a future surface) is a new nav config + widget
  set, not a new shell. The registry pattern makes it a data change.

### Why navigation is configuration-driven
- **Data, not code, per role.** Nav is a `DashboardNavigationConfig` object. Reordering items,
  renaming, or gating by permission/feature is a data edit — no shell changes, low risk.
- **RBAC + entitlements integrate cleanly.** Each `SidebarItem`/`QuickAction` carries optional
  `requiredPermissions` and `requiredFeature`; the shell filters items against the resolved
  `OrganizationContext` (ADR-001) — one filtering rule for every surface.
- **Testable and serializable.** Pure-data configs (icons as names) are trivially unit-tested,
  diffable, and could later be tenant-customised or server-driven **[SaaS]** without refactoring.
- **No conditional spaghetti.** The alternative — `if (role === 'admin') …` scattered through a
  shell — is replaced by declarative config the shell simply renders.

### Why widgets are reusable
- **Compose dashboards from a catalog.** A `Widget` is a described tile (`type`, `title`, `size`,
  gating, `config`). Dashboards are *composed* from a shared widget registry, not hand-built per
  page — the same "stat"/"chart"/"activity" widget appears on many surfaces with different data.
- **Uniform gating & layout.** Every widget flows through the same permission/feature checks and the
  same responsive grid, so behaviour is consistent and safe by default.
- **Extensible without shell changes.** New widget types register into the catalog; pages reference
  them by `type`. Adding analytics later doesn't touch the shell.
- **Config-first = future tenant customization.** Because a `DashboardPage` is `Widget[]` data, tenants
  could one day rearrange their own dashboards — the model already supports it.

---

## Consequences

**Positive**
- One shell to build, test, secure, and make accessible — applied to all six surfaces.
- New surfaces/nav items/widgets are additive data changes, not new components.
- Permission/feature gating is centralized and uniform.
- Clean seam for future SaaS tenant customization and server-driven nav.

**Trade-offs**
- More upfront abstraction (types + registries) than hard-coding one dashboard. Deliberate: the
  six-surface requirement makes the abstraction pay for itself immediately.
- The shell must resolve config → UI generically (slightly more complex than a bespoke layout).
  Mitigated by keeping widgets/commands in registries the shell looks up.

**Neutral**
- No runtime impact this phase: placeholders render children/null, nothing is imported by any page,
  marketing site untouched, build green.

---

## Alternatives considered

1. **Separate shell per dashboard.** Rejected: guarantees drift, multiplies maintenance ×6,
   duplicates command palette/search/notifications, and makes cross-surface consistency manual.
2. **One shell, hard-coded per-role branches.** Rejected: `if role ===` conditionals sprawl through
   the shell, are hard to test, and don't support tenant customization or new surfaces cleanly.
3. **Config-driven shell (chosen).** Accepted: declarative nav/widgets/flags, centralized gating,
   additive extension, SaaS-ready.

---

## References
- `docs/DESIGN_SYSTEM.md` §7 (responsive), §8 (components), §10 (per-role dashboards).
- `docs/ARCHITECTURE.md` (experience layer owns no data), `docs/EVOLUTION_ROADMAP.md` §4 (navigation).
- `ADR-001` (identity/org context the shell filters against).
- `src/types/dashboard.ts`, `src/constants/dashboard.ts`, `src/config/navigation/*`,
  `src/components/dashboard/*`.
