# AgencyOS — Database Architecture Blueprint

**Companion to:** `PRD.md`, `ARCHITECTURE.md`, `BACKEND.md`
**Document version:** 1.0
**Status:** Draft for review
**Perspective:** Principal Database Architect / Enterprise SaaS / PostgreSQL & Prisma Expert
**Last updated:** 2026-07-11

> **Scope:** the complete **data model design** — entities, columns, keys, relationships,
> constraints, indexing, and data-lifecycle strategy. **No `schema.prisma`, no migrations,
> no code.** This is the specification the Prisma schema will later be generated *from*.

---

## 0. Global Conventions (apply to EVERY table unless noted)

To keep 90+ tables consistent, the following are **implicit on every table** and are **not
repeated** in each spec. Per-table sections only note **deviations**.

### 0.1 Primary keys
- **`id`** — `UUID` (v7 recommended: time-ordered → index-friendly, avoids the random-UUID
  B-tree fragmentation that hurts inserts at scale). Primary key on every table.
- Prisma: `@id @default(...)` mapped to Postgres `uuid`.

### 0.2 Tenant scoping (multi-tenancy)
- **`organizationId`** — `UUID`, FK → `organizations.id`, **NOT NULL**, on **every tenant-owned
  table**. This is the isolation boundary.
- **Every index and unique constraint is prefixed with `organizationId`** (composite) so lookups
  are always tenant-local and no unique value collides across tenants.
- Exceptions (global, not tenant-scoped): `organizations`, `plans`, `feature_flags` (global
  defaults), `system_settings`, platform/marketplace tables. Noted per table.

### 0.3 Timestamps (audit fields)
- **`createdAt`** — `timestamptz`, NOT NULL, default now.
- **`updatedAt`** — `timestamptz`, NOT NULL, auto-updated.
- **`createdById` / `updatedById`** — `UUID`, nullable, FK → `users.id` (who performed the write;
  nullable for system/automated writes).

### 0.4 Soft delete
- **`deletedAt`** — `timestamptz`, **nullable**. NULL = active; non-null = soft-deleted.
- **`deletedById`** — `UUID`, nullable, FK → `users.id`.
- Enforced globally via the **Prisma tenant-scope extension** (see `BACKEND.md §7`): default
  queries auto-filter `deletedAt IS NULL`.
- **Partial indexes** use `WHERE deletedAt IS NULL` so soft-deleted rows don't bloat hot indexes.
- **Not soft-deleted** (hard-delete or append-only): `audit_logs`, `analytics_events`,
  `ai_messages`, `sessions`, `webhook_deliveries` (immutable/ephemeral). Noted per table.

### 0.5 Versioning
- Tables needing optimistic concurrency carry **`version`** (`int`, default 1, incremented on
  update) — noted where used (e.g., proposals, contracts, invoices, tasks).
- Tables needing **historical versions** use a companion `*_versions` table (e.g.,
  `proposal_versions`, `contract_versions`) rather than overwriting.

### 0.6 Naming & types
- Tables: `snake_case` plural. Columns: `camelCase` in Prisma → `snake_case` in Postgres via `@map`.
- Enums: Postgres native enums for stable small sets (status, role type); lookup tables for
  tenant-extensible sets (lead sources, tags).
- Money: **`amountMinor` (bigint, integer minor units) + `currency` (char(3))** — never float.
- Long text: `text`. Structured flexible data: `jsonb` (with GIN index where queried).

### 0.7 Referential integrity
- FKs `ON DELETE RESTRICT` by default (soft-delete is the norm). Child cleanup via application
  logic/events. `ON DELETE CASCADE` only for tightly-owned children (e.g., `invoice_items` →
  `invoices`), noted per table.

---

## 1. Multi-Tenancy Data Strategy

| Decision | Choice (v1) | Path to scale |
|---|---|---|
| Isolation model | **Shared database, shared schema, row-level** (`organizationId` on every row) | Schema-per-tenant or DB-per-whale for large tenants |
| Enforcement | Dual-layer: Prisma extension injects `organizationId` filter + app guards | + Postgres **Row-Level Security (RLS)** policies as a hard backstop |
| Uniqueness | All unique constraints composite with `organizationId` | unchanged |
| Noisy neighbor | Per-tenant quotas/rate limits | Dedicated pools / carve-out for whales |

**Why row-level first:** lowest operational cost, one migration path, fits Prisma cleanly, and
serves the first agency → thousands of agencies. RLS is added as a **defense-in-depth** hard
guarantee before public SaaS launch.

---

## 2. Entity Catalog

Grouped by domain. Per-table spec format:

> **Purpose** · **Key columns** (beyond global conventions) · **FKs** · **Relationships** ·
> **Indexes** · **Unique** · **Notable nullable** · **Deviations** (soft-delete/versioning/tenant)

Global fields (`id`, `organizationId`, `createdAt/updatedAt`, `createdById/updatedById`,
`deletedAt/deletedById`) are assumed present per §0 and **not relisted**.

---

### Domain A — Foundation & Tenancy

#### `organizations`
- **Purpose:** the tenant (an Agency). Root of all scoping.
- **Key columns:** `name`, `slug` (unique global), `logoUrl`, `websiteUrl`, `status` (enum: active/suspended/trial), `planId` (FK), `billingEmail`, `timezone`, `locale`, `customDomain`.
- **FKs:** `planId` → `plans.id`.
- **Relationships:** 1→M users(memberships), clients, projects, everything.
- **Indexes:** `slug` (unique), `status`, `customDomain` (unique, partial where not null).
- **Unique:** `slug`, `customDomain`.
- **Deviations:** **not** tenant-scoped (it *is* the tenant); soft-delete = tenant deactivation.

#### `organization_settings`
- **Purpose:** 1:1 per-tenant config (branding, defaults, automation/AI rules).
- **Key columns:** `branding` (jsonb), `notificationDefaults` (jsonb), `aiConfig` (jsonb), `billingConfig` (jsonb), `features` (jsonb overrides).
- **FKs:** `organizationId` → `organizations.id` (unique — 1:1).
- **Unique:** `organizationId`.
- **Deviations:** 1:1 with organization.

#### `plans` *(global)*
- **Purpose:** SaaS subscription tiers + entitlements. **[SaaS]**
- **Key columns:** `name`, `code` (unique), `priceMinor`, `currency`, `interval` (enum), `entitlements` (jsonb: limits/features), `isPublic`.
- **Unique:** `code`.
- **Deviations:** global (not tenant-scoped); no soft-delete (deprecate via `isActive`).

#### `users`
- **Purpose:** global identity (a person; may belong to multiple orgs).
- **Key columns:** `email` (unique global, citext), `emailVerifiedAt`, `passwordHash` (nullable — OAuth-only users), `name`, `avatarUrl`, `phone`, `locale`, `timezone`, `status`, `lastLoginAt`, `twoFactorEnabled`, `twoFactorSecret` (encrypted, nullable).
- **Relationships:** M:N with organizations via `memberships`; 1→M sessions, tasks(assigned), etc.
- **Indexes:** `email` (unique), `status`.
- **Unique:** `email`.
- **Deviations:** **not** tenant-scoped (identity is global; tenant link via `memberships`).

#### `memberships`
- **Purpose:** join user ↔ organization with tenant-scoped role(s). Core of multi-tenant identity.
- **Key columns:** `userId` (FK), `organizationId` (FK), `type` (enum: employee/client/contractor/owner), `status` (active/invited/suspended), `title`, `joinedAt`.
- **FKs:** `userId` → `users.id`; role via `membership_roles`.
- **Relationships:** M:N users↔orgs; 1→M membership_roles.
- **Indexes:** `(organizationId, userId)` unique, `(organizationId, type)`, `(userId)`.
- **Unique:** `(organizationId, userId)`.

#### `roles`
- **Purpose:** RBAC roles (system defaults + tenant custom roles).
- **Key columns:** `name`, `key` (e.g., `project_manager`), `isSystem` (bool), `description`.
- **Indexes:** `(organizationId, key)` unique.
- **Unique:** `(organizationId, key)`.
- **Deviations:** system roles may have `organizationId` NULL (global templates) — partial unique.

#### `permissions` *(global)*
- **Purpose:** atomic permission primitives (e.g., `project:create`).
- **Key columns:** `key` (unique), `resource`, `action`, `description`.
- **Unique:** `key`. **Deviations:** global, static seed, no soft-delete.

#### `role_permissions`
- **Purpose:** M:N roles ↔ permissions.
- **Key columns:** `roleId` (FK), `permissionId` (FK).
- **Indexes:** `(roleId, permissionId)` unique.
- **Unique:** `(roleId, permissionId)`. **Deviations:** join table, no soft-delete.

#### `membership_roles`
- **Purpose:** M:N membership ↔ roles (a user in a tenant can hold multiple roles).
- **Key columns:** `membershipId` (FK), `roleId` (FK).
- **Unique:** `(membershipId, roleId)`. **Deviations:** join table.

#### `sessions`
- **Purpose:** active auth sessions (Better Auth, DB-backed).
- **Key columns:** `userId`, `organizationId` (active tenant, nullable), `tokenHash`, `refreshTokenHash`, `refreshFamilyId`, `userAgent`, `ip`, `expiresAt`, `revokedAt`.
- **Indexes:** `userId`, `tokenHash` (unique), `expiresAt` (for cleanup).
- **Unique:** `tokenHash`. **Deviations:** ephemeral, hard-delete on expiry (cron), no soft-delete.

#### `invitations`
- **Purpose:** pending invites to join an org (employee/client).
- **Key columns:** `email`, `roleId`, `type`, `token` (unique), `invitedById`, `expiresAt`, `acceptedAt`.
- **Indexes:** `(organizationId, email)`, `token` (unique).
- **Unique:** `token`; `(organizationId, email)` partial where not accepted.

#### `feature_flags`
- **Purpose:** per-tenant + global feature toggles.
- **Key columns:** `key`, `enabled`, `rolloutPct` (nullable), `scope` (global/org).
- **Indexes:** `(organizationId, key)` unique (org NULL for global).
- **Unique:** `(organizationId, key)`.

#### `system_settings` *(global)*
- **Purpose:** platform-wide config. **[SaaS]**
- **Key columns:** `key` (unique), `value` (jsonb).
- **Unique:** `key`. **Deviations:** global.

#### `audit_logs`
- **Purpose:** immutable record of security/money/permission actions.
- **Key columns:** `actorUserId` (nullable — system), `action`, `resourceType`, `resourceId`, `before` (jsonb), `after` (jsonb), `ip`, `userAgent`, `traceId`, `occurredAt`.
- **Indexes:** `(organizationId, occurredAt)`, `(organizationId, resourceType, resourceId)`, `(organizationId, actorUserId)`.
- **Deviations:** **append-only** (no update, no soft-delete); **partitioned by month** (§6).

---

### Domain B — Clients, Employees, CRM

#### `clients`
- **Purpose:** client company/account of the agency.
- **Key columns:** `name`, `primaryContactId` (FK contacts, nullable), `industry`, `website`, `status`, `healthScore` (nullable), `ownerUserId` (account manager, FK).
- **Relationships:** 1→M projects, contacts, invoices; belongs to org.
- **Indexes:** `(organizationId, status)`, `(organizationId, ownerUserId)`, `(organizationId, name)`.

#### `employees`
- **Purpose:** internal person profile (extends a membership).
- **Key columns:** `membershipId` (FK, unique), `department`, `jobTitle`, `costRateMinor`, `billRateMinor`, `weeklyCapacityHours`, `availability` (jsonb), `skills` (jsonb/array).
- **Unique:** `membershipId` (1:1 with membership).
- **Indexes:** `(organizationId, department)`.

#### `contacts`
- **Purpose:** individual people in CRM (client-side or lead-side).
- **Key columns:** `firstName`, `lastName`, `email`, `phone`, `clientId` (nullable FK), `companyName`, `title`, `source`.
- **Indexes:** `(organizationId, email)`, `(organizationId, clientId)`.

#### `leads`
- **Purpose:** inbound opportunity before qualification.
- **Key columns:** `contactId` (nullable FK), `sourceId` (FK lead_sources), `status` (enum: new/qualified/proposal/negotiation/won/lost), `value` (amountMinor), `probability`, `ownerUserId`, `utm` (jsonb), `lostReason`, `slaDueAt`, `score` (AI, nullable).
- **Relationships:** →proposals, →client (on convert).
- **Indexes:** `(organizationId, status)`, `(organizationId, ownerUserId)`, `(organizationId, sourceId)`, `(organizationId, createdAt)`.

#### `lead_sources`
- **Purpose:** tenant-extensible source list (website, referral, ads…).
- **Key columns:** `name`, `key`, `isActive`.
- **Unique:** `(organizationId, key)`.

#### `pipelines` / `pipeline_stages`
- **Purpose:** configurable sales pipelines and their ordered stages.
- **Key columns (stages):** `pipelineId` (FK), `name`, `order`, `probability`, `isWon`, `isLost`.
- **Indexes:** `(organizationId, pipelineId, order)`.

#### `activities`
- **Purpose:** CRM timeline entries (calls, emails, notes, tasks).
- **Key columns:** `type` (enum), `subjectType`/`subjectId` (polymorphic: lead/contact/client/deal), `note` (text), `dueAt`, `completedAt`, `assigneeId`.
- **Indexes:** `(organizationId, subjectType, subjectId)`, `(organizationId, assigneeId, dueAt)`.

---

### Domain C — Sales Documents

#### `proposals`
- **Purpose:** client-facing proposal built from catalog.
- **Key columns:** `leadId` (nullable FK), `clientId` (nullable FK), `title`, `status` (draft/sent/accepted/declined), `currency`, `totalMinor`, `validUntil`, `sentAt`, `respondedAt`, `content` (jsonb: scope/deliverables), `version`.
- **Relationships:** 1→M proposal_versions, →quotations, →contracts.
- **Indexes:** `(organizationId, status)`, `(organizationId, clientId)`, `(organizationId, leadId)`.
- **Deviations:** `version` + companion `proposal_versions`.

#### `proposal_versions`
- **Purpose:** immutable snapshots of each proposal revision.
- **Key columns:** `proposalId` (FK), `versionNo`, `snapshot` (jsonb), `createdById`.
- **Unique:** `(proposalId, versionNo)`. **Deviations:** append-only.

#### `quotations`
- **Purpose:** formal priced quote with line items.
- **Key columns:** `proposalId` (nullable FK), `clientId`, `number` (unique per org), `status`, `currency`, `subtotalMinor`, `taxMinor`, `discountMinor`, `totalMinor`, `validUntil`, `acceptedAt`, `version`.
- **Relationships:** 1→M quotation_items.
- **Indexes:** `(organizationId, status)`, `(organizationId, number)` unique.
- **Unique:** `(organizationId, number)`.

#### `quotation_items`
- **Purpose:** line items of a quotation.
- **Key columns:** `quotationId` (FK), `serviceId`/`packageId`/`addonId` (nullable FKs), `description`, `qty`, `unitPriceMinor`, `lineTotalMinor`, `taxRate`.
- **FKs cascade:** `ON DELETE CASCADE` from quotation.
- **Indexes:** `(quotationId)`.

#### `contracts`
- **Purpose:** legal SOW/contract with e-signature.
- **Key columns:** `quotationId`/`proposalId` (nullable FKs), `clientId`, `number`, `status` (draft/sent/signed/expired), `documentFileId` (FK files), `esignProvider`, `esignRef`, `signedAt`, `expiresAt`, `version`.
- **Relationships:** 1→M contract_versions; →orders/projects on sign.
- **Indexes:** `(organizationId, status)`, `(organizationId, clientId)`.
- **Unique:** `(organizationId, number)`.

#### `contract_versions`
- **Purpose:** version history of contract documents.
- **Unique:** `(contractId, versionNo)`. **Deviations:** append-only.

---

### Domain D — Catalog, Pricing, Commerce, Billing

#### `services`
- **Purpose:** sellable service (web dev, SEO, branding…).
- **Key columns:** `name`, `slug`, `category`, `description`, `pricingModel` (enum: fixed/tiered/retainer/hourly), `basePriceMinor`, `currency`, `estimatedDurationDays`, `projectTemplateId` (FK, nullable), `isPublished`.
- **Indexes:** `(organizationId, slug)` unique, `(organizationId, isPublished)`.
- **Unique:** `(organizationId, slug)`.

#### `packages`
- **Purpose:** bundled offering (tiered service package).
- **Key columns:** `serviceId` (nullable FK), `name`, `slug`, `tier`, `priceMinor`, `billingInterval` (nullable — for retainers), `isPublished`.
- **Relationships:** 1→M package_features.
- **Unique:** `(organizationId, slug)`.

#### `package_features`
- **Purpose:** feature line items shown per package.
- **Key columns:** `packageId` (FK), `label`, `included` (bool), `order`.
- **Deviations:** cascade delete from package.

#### `addons`
- **Purpose:** optional extras attachable to services/packages.
- **Key columns:** `name`, `priceMinor`, `pricingModel`, `isPublished`.
- **Unique:** `(organizationId, slug)`.

#### `coupons`
- **Purpose:** discount codes.
- **Key columns:** `code`, `type` (percent/fixed), `value`, `currency`, `maxRedemptions`, `redeemedCount`, `startsAt`, `expiresAt`, `isActive`.
- **Indexes:** `(organizationId, code)` unique.
- **Unique:** `(organizationId, code)`.

#### `orders`
- **Purpose:** confirmed purchase record.
- **Key columns:** `clientId` (FK), `number` (unique per org), `status` (enum: pending/paid/fulfilled/cancelled/refunded), `currency`, `subtotalMinor`, `taxMinor`, `discountMinor`, `totalMinor`, `couponId` (nullable), `quotationId` (nullable), `projectId` (nullable — created after), `idempotencyKey`.
- **Relationships:** 1→M order_items, invoices; 1:1(→) project.
- **Indexes:** `(organizationId, status)`, `(organizationId, clientId)`, `(organizationId, number)` unique.
- **Unique:** `(organizationId, number)`, `idempotencyKey`.

#### `order_items`
- **Purpose:** purchased lines.
- **Key columns:** `orderId` (FK), `serviceId`/`packageId`/`addonId`, `description`, `qty`, `unitPriceMinor`, `lineTotalMinor`.
- **Deviations:** cascade delete from order.

#### `invoices`
- **Purpose:** billing document / AR record.
- **Key columns:** `clientId` (FK), `orderId` (nullable FK), `projectId` (nullable FK), `milestoneId` (nullable FK), `number` (unique per org), `type` (enum: deposit/milestone/one_off/recurring), `status` (draft/sent/partial/paid/overdue/void), `currency`, `subtotalMinor`, `taxMinor`, `discountMinor`, `totalMinor`, `amountPaidMinor`, `dueAt`, `issuedAt`, `paidAt`, `version`.
- **Relationships:** 1→M invoice_items, payments.
- **Indexes:** `(organizationId, status)`, `(organizationId, clientId)`, `(organizationId, dueAt)`, `(organizationId, number)` unique.
- **Unique:** `(organizationId, number)`.

#### `invoice_items`
- **Purpose:** invoice line items.
- **Key columns:** `invoiceId` (FK), `description`, `qty`, `unitPriceMinor`, `lineTotalMinor`, `taxRate`.
- **Deviations:** cascade delete from invoice.

#### `payments`
- **Purpose:** money received (or attempted) against an invoice/order.
- **Key columns:** `invoiceId` (nullable FK), `orderId` (nullable FK), `clientId`, `provider` (enum: stripe/razorpay), `providerRef` (unique), `status` (enum: created/authorized/captured/failed/refunded), `amountMinor`, `currency`, `method`, `capturedAt`, `failureReason`, `idempotencyKey`.
- **Indexes:** `(organizationId, status)`, `(organizationId, invoiceId)`, `providerRef` (unique).
- **Unique:** `providerRef`, `idempotencyKey`.
- **Deviations:** never hard-deleted; status transitions audited.

#### `refunds`
- **Purpose:** refund against a payment.
- **Key columns:** `paymentId` (FK), `amountMinor`, `currency`, `reason`, `status`, `providerRef`, `approvedById`, `processedAt`.
- **Indexes:** `(organizationId, paymentId)`, `providerRef` unique.

#### `subscriptions`
- **Purpose:** recurring billing (client retainers **and** tenant SaaS plan).
- **Key columns:** `clientId` (nullable — null when it's the tenant's own SaaS sub), `planId`/`packageId` (nullable), `provider`, `providerRef`, `status` (active/past_due/canceled/trialing), `currency`, `amountMinor`, `interval`, `currentPeriodStart/End`, `cancelAt`.
- **Indexes:** `(organizationId, status)`, `providerRef` unique.

#### `transactions` *(ledger, append-only)*
- **Purpose:** normalized financial ledger for reporting/reconciliation.
- **Key columns:** `type` (charge/refund/payout/fee/credit), `sourceType`/`sourceId`, `amountMinor`, `currency`, `direction` (debit/credit), `occurredAt`.
- **Indexes:** `(organizationId, occurredAt)`, `(organizationId, sourceType, sourceId)`.
- **Deviations:** append-only; partitioned by month.

---

### Domain E — Projects & Delivery

#### `project_templates`
- **Purpose:** reusable blueprint (phases/tasks/roles/milestone rules) per service.
- **Key columns:** `name`, `serviceType` (enum: website/app/seo/marketing/branding/ai_automation/custom), `definition` (jsonb: phases/tasks/roles/billing rules), `isActive`.
- **Indexes:** `(organizationId, serviceType)`.

#### `projects`
- **Purpose:** delivery engagement — the core of the OS.
- **Key columns:** `clientId` (FK), `orderId` (nullable FK), `templateId` (nullable FK), `name`, `code`, `serviceType`, `status` (enum: planning/active/on_hold/delivered/closed/cancelled), `health` (enum: green/amber/red, nullable), `progressPct` (int, denormalized from tasks — see §5), `startDate`, `dueDate`, `deliveredAt`, `budgetMinor`, `spentMinor`, `managerId` (FK users), `currency`.
- **Relationships:** 1→M phases, milestones, tasks, files, comments, invoices, time_logs; M:N members via `project_members`.
- **Indexes:** `(organizationId, status)`, `(organizationId, clientId)`, `(organizationId, managerId)`, `(organizationId, health)`, `(organizationId, code)` unique.
- **Unique:** `(organizationId, code)`.
- **Deviations:** `version` for optimistic locking.

#### `project_members`
- **Purpose:** M:N users ↔ projects with project role.
- **Key columns:** `projectId` (FK), `userId` (FK), `projectRole` (enum: manager/member/contractor/viewer), `allocationPct`.
- **Unique:** `(projectId, userId)`.
- **Indexes:** `(organizationId, userId)`.

#### `project_phases`
- **Purpose:** ordered stage of a project (Discovery, Design…).
- **Key columns:** `projectId` (FK), `name`, `order`, `status`, `startDate`, `endDate`, `clientVisible` (bool).
- **Indexes:** `(organizationId, projectId, order)`.
- **Deviations:** cascade-ish (soft) with project.

#### `milestones`
- **Purpose:** billable/approval checkpoint.
- **Key columns:** `projectId` (FK), `phaseId` (nullable FK), `name`, `order`, `status` (enum: pending/in_progress/submitted/approved/changes_requested), `dueDate`, `clientVisible`, `triggersInvoice` (bool), `invoiceAmountMinor` (nullable), `approvedById`, `approvedAt`.
- **Relationships:** →invoices (on approval).
- **Indexes:** `(organizationId, projectId)`, `(organizationId, status)`.

#### `tasks`
- **Purpose:** unit of work.
- **Key columns:** `projectId` (FK), `phaseId` (nullable), `milestoneId` (nullable), `parentTaskId` (nullable FK — subtasks), `title`, `description` (text), `status` (enum: todo/in_progress/in_review/blocked/done), `priority` (enum), `assigneeId` (nullable FK), `estimateHours`, `dueDate`, `completedAt`, `order`, `clientVisible`, `labels` (jsonb/array), `version`.
- **Relationships:** self-ref (subtasks), 1→M comments, attachments, time_logs, dependencies.
- **Indexes:** `(organizationId, projectId, status)`, `(organizationId, assigneeId, status)`, `(organizationId, dueDate)`, `(organizationId, parentTaskId)`.
- **Deviations:** `version`; self-referential FK `parentTaskId`.

#### `task_dependencies`
- **Purpose:** M:N task blocks/blocked-by.
- **Key columns:** `taskId` (FK), `dependsOnTaskId` (FK), `type` (blocks/relates).
- **Unique:** `(taskId, dependsOnTaskId)`.
- **Deviations:** join table; guard against cycles in app layer.

#### `task_comments`
- **Purpose:** threaded discussion on a task (see also generic `comments`).
- **Note:** implemented via the **polymorphic `comments`** table below to avoid duplication; `task_comments` is a logical view, not a separate table.

#### `task_attachments`
- **Purpose:** M:N tasks ↔ files.
- **Key columns:** `taskId` (FK), `fileId` (FK).
- **Unique:** `(taskId, fileId)`. **Deviations:** join table.

#### `time_logs`
- **Purpose:** effort tracking for billing/costing/capacity.
- **Key columns:** `projectId` (FK), `taskId` (nullable FK), `userId` (FK), `startedAt`, `endedAt`, `durationMinutes`, `billable` (bool), `description`, `approvedById` (nullable), `approvedAt`.
- **Indexes:** `(organizationId, userId, startedAt)`, `(organizationId, projectId)`, `(organizationId, taskId)`.
- **Deviations:** high-volume → candidate for monthly partition at scale.

#### `work_logs`
- **Purpose:** narrative daily/standup log entries (distinct from timed `time_logs`).
- **Key columns:** `projectId` (nullable), `userId` (FK), `date`, `summary` (text), `blockers` (text).
- **Indexes:** `(organizationId, userId, date)`.

#### `approvals`
- **Purpose:** shared approval primitive (proposals, invoices, timesheets, deliverables, AI actions).
- **Key columns:** `subjectType`/`subjectId` (polymorphic), `type` (enum), `status` (pending/approved/rejected), `requestedById`, `approverId` (nullable), `decidedAt`, `note`.
- **Indexes:** `(organizationId, approverId, status)`, `(organizationId, subjectType, subjectId)`.

#### `reviews` / `ratings`
- **Purpose:** client feedback/CSAT and testimonials.
- **Key columns:** `subjectType`/`subjectId` (project/service/deliverable), `authorContactId`, `rating` (int 1–5), `title`, `body` (text), `isPublic`, `approvedAt`.
- **Indexes:** `(organizationId, subjectType, subjectId)`.

---

### Domain F — Files & Collaboration

#### `folders`
- **Purpose:** hierarchical organization of files.
- **Key columns:** `name`, `parentFolderId` (nullable self-FK), `projectId`/`clientId` (nullable scope), `path` (materialized path for fast subtree).
- **Indexes:** `(organizationId, parentFolderId)`, `(organizationId, projectId)`.
- **Deviations:** self-referential.

#### `files`
- **Purpose:** metadata for objects stored in Cloudflare R2.
- **Key columns:** `folderId` (nullable FK), `name`, `r2Key` (unique), `mimeType`, `sizeBytes` (bigint), `checksum`, `version`, `uploadedById`, `scanStatus` (enum: pending/clean/infected), `visibility` (enum: private/client/public), `entityType`/`entityId` (polymorphic link).
- **Indexes:** `(organizationId, entityType, entityId)`, `(organizationId, folderId)`, `r2Key` (unique).
- **Unique:** `r2Key`.
- **Deviations:** `version` for file versioning; companion `file_versions` optional.

#### `media_library`
- **Purpose:** curated reusable assets (brand kit, CMS media).
- **Key columns:** `fileId` (FK), `type`, `title`, `altText`, `tags` (jsonb), `usageCount`.
- **Indexes:** `(organizationId, type)`.

#### `comments`
- **Purpose:** polymorphic threaded comments (tasks, projects, deliverables, tickets, proposals).
- **Key columns:** `subjectType`/`subjectId`, `parentCommentId` (nullable self-FK — threads), `authorId`, `body` (text), `mentions` (jsonb userIds), `internalOnly` (bool — vs client-visible), `resolvedAt`.
- **Indexes:** `(organizationId, subjectType, subjectId, createdAt)`, `(organizationId, parentCommentId)`.
- **Deviations:** self-referential threads.

#### `messages`
- **Purpose:** direct/project conversational messages (distinct from comments).
- **Key columns:** `threadId` (FK message_threads), `senderId`, `body` (text), `attachments` (jsonb fileIds), `readBy` (jsonb), `sentAt`.
- **Indexes:** `(organizationId, threadId, sentAt)`.

#### `message_threads`
- **Purpose:** conversation container (project/client/DM).
- **Key columns:** `type`, `projectId`/`clientId` (nullable), `participantIds` (jsonb), `lastMessageAt`.
- **Indexes:** `(organizationId, projectId)`, `(organizationId, lastMessageAt)`.

#### `activity_logs`
- **Purpose:** user-facing activity feed (distinct from immutable `audit_logs`).
- **Key columns:** `actorId` (nullable), `verb`, `subjectType`/`subjectId`, `projectId` (nullable scope), `metadata` (jsonb), `clientVisible` (bool), `occurredAt`.
- **Indexes:** `(organizationId, projectId, occurredAt)`, `(organizationId, subjectType, subjectId)`.
- **Deviations:** high-volume → partitioned by month; append-only (no soft-delete).

---

### Domain G — Notifications, Support, Calendar

#### `notifications`
- **Purpose:** per-user notification records (in-app source of truth).
- **Key columns:** `userId` (FK), `type`, `title`, `body`, `data` (jsonb deep-link), `channel` (enum), `priority`, `readAt`, `sentAt`.
- **Indexes:** `(organizationId, userId, readAt)`, `(organizationId, userId, createdAt)`.
- **Deviations:** high-volume → partitioned by month; archived after N days.

#### `notification_preferences`
- **Purpose:** per-user channel/frequency settings.
- **Key columns:** `userId` (FK), `preferences` (jsonb: per-event-type × channel), `digestFrequency`, `mutedUntil`.
- **Unique:** `(organizationId, userId)`. **Deviations:** 1:1 per user per org.

#### `support_tickets`
- **Purpose:** post-delivery support / change requests.
- **Key columns:** `clientId` (FK), `projectId` (nullable FK), `number`, `subject`, `description` (text), `status` (enum: open/pending/resolved/closed), `priority`, `category`, `assigneeId` (nullable), `slaDueAt`, `resolvedAt`, `changeOrderQuotationId` (nullable FK).
- **Relationships:** 1→M ticket messages (via `comments`), →quotations (change order).
- **Indexes:** `(organizationId, status)`, `(organizationId, clientId)`, `(organizationId, assigneeId)`, `(organizationId, number)` unique.

#### `knowledge_base_articles`
- **Purpose:** KB content (also AI-support grounding).
- **Key columns:** `title`, `slug`, `body` (text), `category`, `tags` (jsonb), `status` (draft/published), `views`, `helpfulCount`, `embeddingId` (nullable → vector store ref).
- **Indexes:** `(organizationId, slug)` unique, `(organizationId, status)`, GIN on `tsvector(body)` for FTS.

#### `meetings`
- **Purpose:** scheduled meetings (client/internal).
- **Key columns:** `title`, `projectId`/`clientId` (nullable), `startAt`, `endAt`, `location`/`meetingUrl`, `organizerId`, `attendees` (jsonb), `notes` (text).
- **Indexes:** `(organizationId, startAt)`, `(organizationId, projectId)`.

#### `calendar_events`
- **Purpose:** generic calendar entries (deadlines, reminders, availability).
- **Key columns:** `type`, `title`, `startAt`, `endAt`, `allDay`, `ownerId`, `subjectType`/`subjectId` (nullable), `recurrenceRule` (nullable).
- **Indexes:** `(organizationId, ownerId, startAt)`.

---

### Domain H — CMS (Blog & Portfolio)

#### `blog_posts`
- **Purpose:** blog content.
- **Key columns:** `title`, `slug`, `excerpt`, `body` (text/jsonb rich), `authorId`, `categoryId` (FK), `status` (draft/review/scheduled/published), `coverFileId`, `seo` (jsonb), `publishedAt`, `scheduledAt`, `readingMinutes`.
- **Indexes:** `(organizationId, slug)` unique, `(organizationId, status, publishedAt)`, `(organizationId, categoryId)`.
- **Deviations:** `version` for draft history (optional companion table).

#### `blog_categories`
- **Purpose:** blog taxonomy.
- **Key columns:** `name`, `slug`, `description`, `parentCategoryId` (nullable).
- **Unique:** `(organizationId, slug)`.

#### `portfolio_projects`
- **Purpose:** case studies powering the marketing site.
- **Key columns:** `title`, `slug`, `clientName`, `sourceProjectId` (nullable FK — generated from delivery), `summary`, `content` (jsonb), `results` (jsonb metrics), `coverFileId`, `categoryId`, `status`, `featuredOrder` (nullable), `publishedAt`, `seo` (jsonb).
- **Indexes:** `(organizationId, slug)` unique, `(organizationId, status)`, `(organizationId, featuredOrder)`.

#### `portfolio_categories`
- **Purpose:** portfolio taxonomy (by industry/service).
- **Unique:** `(organizationId, slug)`.

#### `tags` / `taggables`
- **Purpose:** shared, polymorphic tagging.
- **`tags`:** `name`, `slug`, `type` (nullable). Unique `(organizationId, slug)`.
- **`taggables`:** M:N — `tagId` (FK), `taggableType`/`taggableId`. Unique `(tagId, taggableType, taggableId)`.

---

### Domain I — AI

#### `ai_agents`
- **Purpose:** configured agent personas (PM/Sales/Support).
- **Key columns:** `key` (pm/sales/support), `name`, `systemPromptTemplateId` (FK), `defaultModel`, `tools` (jsonb), `config` (jsonb: budgets, guardrails), `isEnabled`.
- **Unique:** `(organizationId, key)`.

#### `prompt_templates`
- **Purpose:** versioned prompt/system-message templates.
- **Key columns:** `key`, `name`, `content` (text), `variables` (jsonb), `versionNo`, `isActive`.
- **Indexes:** `(organizationId, key, versionNo)`.
- **Unique:** `(organizationId, key, versionNo)`.

#### `ai_conversations`
- **Purpose:** conversation container + rolling memory.
- **Key columns:** `agentId` (FK), `userId` (nullable — client vs internal), `subjectType`/`subjectId` (nullable: project/lead/ticket), `title`, `summary` (text — rolling), `model`, `status`, `lastMessageAt`.
- **Indexes:** `(organizationId, agentId)`, `(organizationId, subjectType, subjectId)`, `(organizationId, userId)`.

#### `ai_messages`
- **Purpose:** individual turns in a conversation.
- **Key columns:** `conversationId` (FK), `role` (system/user/assistant/tool), `content` (text), `toolCalls` (jsonb), `model`, `promptTokens`, `completionTokens`, `costMinor`, `latencyMs`.
- **Indexes:** `(organizationId, conversationId, createdAt)`.
- **Deviations:** append-only (no soft-delete); high-volume → partition by month.

#### `ai_usage`
- **Purpose:** aggregated token/cost accounting per tenant/agent/period (for budgets & billing).
- **Key columns:** `agentId`, `period` (date), `promptTokens`, `completionTokens`, `costMinor`, `requestCount`.
- **Indexes:** `(organizationId, period)`, `(organizationId, agentId, period)`.

#### `ai_prompts`
- **Purpose:** logged resolved prompts (audit/replay/debugging of what was actually sent).
- **Key columns:** `conversationId` (nullable), `templateId` (nullable), `resolvedPrompt` (text), `context` (jsonb), `model`.
- **Deviations:** append-only; retention-limited.

---

### Domain J — Analytics, Reports, Integrations, Platform

#### `analytics_events`
- **Purpose:** raw event stream for all analytics.
- **Key columns:** `name`, `userId` (nullable), `sessionId` (nullable), `properties` (jsonb), `context` (jsonb: utm/device), `occurredAt`.
- **Indexes:** `(organizationId, name, occurredAt)`, `(organizationId, occurredAt)`; GIN on `properties`.
- **Deviations:** append-only; **partitioned by day/week**; archived to cold storage; highest-volume table.

#### `reports`
- **Purpose:** report definitions + generated instances.
- **Key columns:** `type`, `name`, `config` (jsonb), `schedule` (cron, nullable), `lastRunAt`, `recipientIds` (jsonb).
- **Indexes:** `(organizationId, type)`.

#### `report_runs`
- **Purpose:** generated report artifacts.
- **Key columns:** `reportId` (FK), `status`, `fileId` (nullable), `periodStart/End`, `generatedAt`.
- **Indexes:** `(organizationId, reportId, generatedAt)`.

#### `metric_snapshots` *(read projection)*
- **Purpose:** pre-aggregated metrics for dashboards (avoid querying write path).
- **Key columns:** `key`, `dimension` (jsonb), `value` (numeric), `period`.
- **Indexes:** `(organizationId, key, period)`.

#### `integrations`
- **Purpose:** connected third-party providers per tenant.
- **Key columns:** `provider`, `status`, `credentials` (jsonb, **encrypted**), `config` (jsonb), `connectedById`, `lastSyncAt`.
- **Indexes:** `(organizationId, provider)` unique.
- **Unique:** `(organizationId, provider)`.

#### `api_keys`
- **Purpose:** programmatic access keys.
- **Key columns:** `name`, `keyHash` (unique), `prefix`, `scopes` (jsonb), `lastUsedAt`, `expiresAt`, `revokedAt`.
- **Unique:** `keyHash`.
- **Indexes:** `(organizationId, revokedAt)`.

#### `webhooks`
- **Purpose:** outbound webhook subscriptions.
- **Key columns:** `url`, `events` (jsonb), `secret` (encrypted), `isActive`, `failureCount`.
- **Indexes:** `(organizationId, isActive)`.

#### `webhook_deliveries`
- **Purpose:** delivery attempts + status.
- **Key columns:** `webhookId` (FK), `eventName`, `payload` (jsonb), `status`, `responseCode`, `attempts`, `deliveredAt`, `nextRetryAt`.
- **Indexes:** `(organizationId, webhookId, createdAt)`, `(status, nextRetryAt)`.
- **Deviations:** append-only; retention-limited; partition by week.

#### Platform (global) **[SaaS / future]**
- **`tenant_subscriptions`** — org ↔ plan billing (may reuse `subscriptions` with null client).
- **`marketplace_listings`** — `sellerOrgId`, `type` (template/integration/service), `title`, `price`, `status`, `installs`.
- **`marketplace_installs`** — M:N org ↔ listing, `installedAt`, `config`.
- **`white_label_configs`** — per-tenant domain/theme/email-sender branding.
- **`impersonation_logs`** — super-admin impersonation audit (append-only).

---

## 3. Relationship Map

### 3.1 One-to-One (1:1)
| A | B | Notes |
|---|---|---|
| `organizations` | `organization_settings` | settings unique on `organizationId` |
| `memberships` | `employees` | employee profile extends a membership |
| `users` | `notification_preferences` (per org) | unique `(organizationId, userId)` |
| `orders` | `projects` | an order spawns exactly one project (nullable until created) |
| `contracts` | `orders` | a signed contract yields one order |

*1:1 is implemented as a FK + **unique constraint** on the dependent side.*

### 3.2 One-to-Many (1:M)
| Parent | Children |
|---|---|
| `organizations` | ~everything (tenant root) |
| `clients` | projects, contacts, invoices, orders, tickets, subscriptions |
| `projects` | phases, milestones, tasks, time_logs, files, invoices, comments |
| `project_phases` | milestones, tasks |
| `milestones` | tasks, invoices |
| `tasks` | subtasks (self 1:M), comments, attachments, time_logs |
| `invoices` | invoice_items, payments |
| `orders` | order_items, invoices |
| `payments` | refunds |
| `ai_conversations` | ai_messages |
| `proposals` | proposal_versions, quotations |
| `quotations` | quotation_items |
| `blog_categories` | blog_posts |
| `webhooks` | webhook_deliveries |
| `folders` | files, subfolders (self 1:M) |

### 3.3 Many-to-Many (M:M) — via explicit join tables
| A | B | Join table | Extra columns |
|---|---|---|---|
| users | organizations | `memberships` | type, status, title |
| memberships | roles | `membership_roles` | — |
| roles | permissions | `role_permissions` | — |
| users | projects | `project_members` | projectRole, allocationPct |
| tasks | files | `task_attachments` | — |
| tasks | tasks | `task_dependencies` | type |
| tags | any entity | `taggables` | polymorphic |
| organizations | marketplace_listings | `marketplace_installs` | config |

### 3.4 Polymorphic associations (typed by `subjectType`/`entityType` + `id`)
`comments`, `activities`, `approvals`, `reviews`, `files` (link), `calendar_events`,
`taggables`, `ai_conversations`. **Rule:** polymorphic FKs are **not** DB-level foreign keys;
integrity is enforced in the application layer + covered by `(organizationId, type, id)` indexes.
Chosen over dozens of nullable FK columns to keep these high-fan-in tables lean.

---

## 4. Indexing Strategy

1. **Tenant-first composite indexes.** Every secondary index leads with `organizationId`
   (`(organizationId, status)`, `(organizationId, assigneeId, dueDate)`) so every query is a
   tenant-local index range scan.
2. **Foreign keys are indexed.** Postgres does not auto-index FKs; every FK column gets an index
   to keep joins and cascade checks fast.
3. **Partial indexes for soft delete.** Hot indexes include `WHERE deletedAt IS NULL` to exclude
   dead rows and stay small.
4. **Covering / included columns** for hot read paths (e.g., task board: `(organizationId,
   projectId, status) INCLUDE (title, assigneeId, dueDate)`).
5. **Unique constraints are tenant-composite** (`(organizationId, slug)`, `(organizationId,
   number)`) — never global except identity (`users.email`, `organizations.slug`).
6. **GIN indexes** on queried `jsonb` (`analytics_events.properties`, `metadata`) and on
   `tsvector` for full-text search (blog, KB, tasks).
7. **BRIN indexes** on append-only time-ordered columns (`analytics_events.occurredAt`,
   `audit_logs.occurredAt`) — tiny, ideal for range scans on huge tables.
8. **Vector index** (pgvector / external store) for KB & AI semantic retrieval (`embeddingId`).
9. **Avoid over-indexing** write-hot tables (tasks, notifications) — each index taxes writes;
   index only proven query patterns.
10. **UUID v7** keeps PK B-trees roughly insert-ordered, avoiding random-insert page splits.

---

## 5. Denormalization (deliberate, controlled)

Fully normalized by default; denormalize **only** for read performance, kept correct via events:
- `projects.progressPct` / `projects.spentMinor` — derived from tasks/time_logs, recomputed by a
  job on change (never on the read path). Live-tracking reads this, not aggregates.
- `invoices.amountPaidMinor` — maintained on payment capture.
- `clients.healthScore`, `projects.health` — computed by AI/analytics jobs.
- `message_threads.lastMessageAt`, `ai_conversations.lastMessageAt` — for cheap sorting.
- `metric_snapshots` — pre-aggregated dashboard projections.
**Rule:** every denormalized field has a single writer (a job/event handler) and is reconstructable
from source tables.

---

## 6. Partitioning Strategy

High-volume, time-series, append-only tables are **range-partitioned by time** (monthly, or daily
for the largest), enabling cheap pruning and archival by dropping old partitions.

| Table | Partition | Key |
|---|---|---|
| `analytics_events` | daily/weekly | `occurredAt` |
| `audit_logs` | monthly | `occurredAt` |
| `activity_logs` | monthly | `occurredAt` |
| `notifications` | monthly | `createdAt` |
| `ai_messages` | monthly | `createdAt` |
| `ai_prompts` | monthly | `createdAt` |
| `webhook_deliveries` | weekly | `createdAt` |
| `time_logs` | monthly (at scale) | `startedAt` |
| `transactions` | monthly | `occurredAt` |

- **Sub-partition by hash(`organizationId`)** for the very largest tables once tenants grow, to
  bound partition size and isolate whales.
- Retention: drop/detach partitions past the archival window (§10) instead of costly `DELETE`s.

---

## 7. Caching Strategy (Redis)

| Layer | What | Invalidation |
|---|---|---|
| **Session/auth** | sessions, permission sets per (user,org) | on role/membership change |
| **Entity cache** | hot lookups: org settings, feature flags, catalog, project meta | event-driven (write emits invalidate) |
| **Read projections** | dashboard/live-tracking aggregates, metric_snapshots | recomputed by jobs; short TTL |
| **Rate limiting** | counters per IP/user/tenant/route | TTL windows |
| **Idempotency** | payment/order idempotency keys | TTL 24–48h |
| **Public/CMS** | marketing pages, published blog/portfolio | on publish + CDN purge |
| **AI context** | summarized conversation context, embeddings cache | on new message/summary |

**Patterns:** cache-aside for entities; write-through for counters; **event-driven invalidation**
(a module emits `entity.updated` → cache layer evicts). Never cache cross-tenant; keys are
namespaced `org:{id}:...`.

---

## 8. Backup & Disaster Recovery

- **Automated managed backups** + **Point-in-Time Recovery (PITR)** via WAL archiving.
- **Targets:** RPO ≤ 5 min (PITR), RTO ≤ 1 hour (documented, **tested** restores quarterly).
- **Frequency:** continuous WAL + daily full snapshot; snapshots replicated cross-region.
- **R2 object storage:** bucket versioning + lifecycle; file metadata (Postgres) and objects (R2)
  backed up in lockstep; periodic **integrity verification** job (checksum vs `files.checksum`).
- **Logical exports** per tenant for GDPR export/delete and per-tenant restore.
- **Immutability:** audit/financial partitions backed up before any archival drop.
- **DR runbook:** documented failover, backup restore drills, and provider-outage playbooks.

---

## 9. Scaling Strategy

1. **Connection pooling** via PgBouncer (transaction mode) — Prisma + serverless/autoscale-safe.
2. **Read replicas** for analytics, reporting, dashboards, and heavy list reads (route read-only
   queries to replicas; writes to primary).
3. **Partitioning** (§6) keeps hot tables small and prunable.
4. **Vertical then horizontal:** scale primary up first; extract read load to replicas; shard by
   `organizationId` only when a single primary is exhausted.
5. **Tenant sharding path:** because every row carries `organizationId` and uniqueness is
   tenant-composite, tenants can later be distributed across shards (or Citus-style distribution)
   with minimal model change. Whales get dedicated shards/DBs.
6. **Separate stores for specialized load:** search (Meilisearch/OpenSearch), vectors (pgvector or
   dedicated), analytics warehouse (later) — offload from OLTP Postgres.
7. **Denormalized projections** (§5) mean dashboards never scan write-path tables.
8. **Backpressure via queues** — spiky writes (analytics, notifications, webhooks) buffered through
   BullMQ, not synchronous inserts.

---

## 10. Archival Strategy

- **Hot (0–3 months):** live partitions, fully indexed, on primary.
- **Warm (3–12 months):** detach partitions to cheaper storage/replica; read-only.
- **Cold (12+ months):** export to object storage (Parquet in R2) for analytics_events, audit,
  activity; queryable on demand, dropped from OLTP.
- **Financial/audit retention:** governed by legal/compliance (often 7 years) → archived, never
  hard-deleted; kept immutable.
- **Soft-deleted rows:** a purge job hard-deletes rows `deletedAt < now - retention` (except
  financial/audit) to reclaim space.
- **Per-tenant offboarding:** on tenant deletion, export then purge tenant data within SLA (GDPR).
- **Mechanism:** archival = **detach/drop partition** (instant) rather than row-by-row `DELETE`.

---

## 11. Database Module Diagram (ownership & flow)

```
                             ORGANIZATIONS (tenant root)
                                       │
        ┌──────────────┬──────────────┼──────────────┬──────────────┐
        ▼              ▼              ▼              ▼              ▼
    SETTINGS        USERS         PLANS         FEATURE_FLAGS    AUDIT_LOGS
                      │
                 MEMBERSHIPS ──── ROLES ── ROLE_PERMISSIONS ── PERMISSIONS
                   │      │
             EMPLOYEES  (client users)
                                       │
   ┌───────────────────────────────────┼───────────────────────────────────┐
   ▼                                   ▼                                     ▼
  CRM                              COMMERCE/FINANCE                       DELIVERY
  leads → activities            services → packages/addons             project_templates
  contacts                       pricing/coupons                             │
     │                                │                                   PROJECTS
  proposals → proposal_versions   orders → order_items                  ├─ project_members
     │                                │                                  ├─ project_phases
  quotations → quotation_items    invoices → invoice_items              ├─ milestones ──┐
     │                                │                                  ├─ TASKS ◄──────┘ (→invoices)
  contracts → contract_versions   payments → refunds                    │   ├─ subtasks (self)
     │                            subscriptions                          │   ├─ task_dependencies
     └────────── (won) ──────────► CLIENTS ◄──────────────────────────  │   ├─ task_attachments →FILES
                                       ▲                                 │   └─ comments (poly)
                                       │                                 ├─ time_logs / work_logs
                                   SUPPORT                               └─ approvals / reviews
                                   tickets → (change order) → quotations
                                   knowledge_base
                                       │
   ┌───────────────┬───────────────────┼───────────────┬──────────────────┐
   ▼               ▼                   ▼               ▼                  ▼
 FILES/FOLDERS  COLLABORATION      NOTIFICATIONS      CMS                 AI
 media_library  comments (poly)    notifications      blog_posts/cats     ai_agents
                messages/threads   preferences        portfolio/cats      prompt_templates
                activity_logs                          tags/taggables      ai_conversations
                                                                           └─ ai_messages
                                                                           ai_usage / ai_prompts
   ┌───────────────────────────────────┼───────────────────────────────────┐
   ▼                                   ▼                                     ▼
 ANALYTICS                         INTEGRATIONS                          PLATFORM [SaaS]
 analytics_events                  integrations / api_keys              tenant_subscriptions
 reports / report_runs             webhooks / webhook_deliveries        marketplace_listings/installs
 metric_snapshots                                                       white_label_configs
                                                                        impersonation_logs

  ── Everything above emits → AUDIT_LOGS (immutable) and ANALYTICS_EVENTS (stream) ──
```

**Canonical drill-down (your example, realized):**
`Organization → Users(memberships) → Projects → Tasks → Comments → Files → Activity Logs` —
every arrow is a tenant-scoped FK; every node carries the global audit + soft-delete fields.

---

## 12. Complete Prisma Model List

Every model that will eventually exist (grouped; ~95 models). Join/lookup models included.

**Foundation & Tenancy (18)**
`Organization`, `OrganizationSettings`, `Plan`, `User`, `Membership`, `MembershipRole`,
`Role`, `Permission`, `RolePermission`, `Session`, `Invitation`, `FeatureFlag`,
`SystemSetting`, `AuditLog`, `ApiKey`, `Webhook`, `WebhookDelivery`, `Integration`

**Clients, People, CRM (11)**
`Client`, `Employee`, `Contact`, `Lead`, `LeadSource`, `Pipeline`, `PipelineStage`,
`Activity`, `Meeting`, `CalendarEvent`, `Review`

**Sales Documents (6)**
`Proposal`, `ProposalVersion`, `Quotation`, `QuotationItem`, `Contract`, `ContractVersion`

**Catalog, Commerce, Billing (16)**
`Service`, `Package`, `PackageFeature`, `Addon`, `Coupon`, `ProjectTemplate`,
`Order`, `OrderItem`, `Invoice`, `InvoiceItem`, `Payment`, `Refund`, `Subscription`,
`Transaction`, `Rating`, `Approval`

**Projects & Delivery (10)**
`Project`, `ProjectMember`, `ProjectPhase`, `Milestone`, `Task`, `TaskDependency`,
`TaskAttachment`, `TimeLog`, `WorkLog`, `File`

**Files & Collaboration (6)**
`Folder`, `MediaLibrary`, `Comment`, `Message`, `MessageThread`, `ActivityLog`

**Notifications & Support (4)**
`Notification`, `NotificationPreference`, `SupportTicket`, `KnowledgeBaseArticle`

**CMS (6)**
`BlogPost`, `BlogCategory`, `PortfolioProject`, `PortfolioCategory`, `Tag`, `Taggable`

**AI (6)**
`AiAgent`, `PromptTemplate`, `AiConversation`, `AiMessage`, `AiUsage`, `AiPrompt`

**Analytics & Reports (4)**
`AnalyticsEvent`, `Report`, `ReportRun`, `MetricSnapshot`

**Platform / Future (5) [SaaS]**
`TenantSubscription`, `MarketplaceListing`, `MarketplaceInstall`, `WhiteLabelConfig`,
`ImpersonationLog`

> Enums (native Postgres): `OrgStatus`, `MembershipType`, `LeadStatus`, `ProjectStatus`,
> `ProjectHealth`, `TaskStatus`, `TaskPriority`, `MilestoneStatus`, `InvoiceStatus`,
> `InvoiceType`, `PaymentStatus`, `PaymentProvider`, `OrderStatus`, `TicketStatus`,
> `ApprovalStatus`, `NotificationChannel`, `FileVisibility`, `ServiceType`, `PricingModel`,
> `SubscriptionStatus`, `ContentStatus`, `AiRole`.

---

## 13. Architecture Review — Weaknesses Found & Improvements Applied

**Weaknesses identified and resolved in this design:**

1. **Polymorphic sprawl vs FK integrity.** `comments`/`activities`/`approvals` linking to many
   parents risks orphans (no DB FK).
   → **Mitigation:** enforce integrity in the app layer + emit cleanup events; index
   `(organizationId, subjectType, subjectId)`; keep polymorphism only for genuinely cross-cutting
   tables. Everything else uses real FKs.

2. **Cross-tenant leakage risk.** Row-level tenancy depends on never forgetting a `where`.
   → **Dual guard** (Prisma extension) **+ Postgres RLS** as a hard backstop before SaaS launch.

3. **Hot-table write amplification.** `tasks`/`notifications` over-indexed would slow writes.
   → Index only proven paths; partial indexes; partition notifications; denormalize progress
   instead of aggregating on read.

4. **Money correctness.** Floats and multi-currency mixing cause rounding bugs.
   → Integer **minor units + explicit currency** everywhere; a normalized `transactions` ledger
   for reconciliation; payments/refunds append-only with idempotency keys.

5. **Unbounded growth of event/audit/AI tables.** Would eventually dominate the DB.
   → Time partitioning + BRIN + tiered archival (hot/warm/cold) + partition-drop retention.

6. **Invoice/number races under concurrency.** Sequential numbers can collide.
   → Per-tenant numbering via a dedicated counter table/sequence + unique
   `(organizationId, number)`; generation inside a transaction.

7. **Soft-delete uniqueness collisions.** A soft-deleted `slug` blocks reuse.
   → Unique constraints as **partial** (`WHERE deletedAt IS NULL`) so deleted rows free their keys.

8. **AI cost blindness.** Token spend can silently explode.
   → `ai_messages` per-call token/cost + `ai_usage` rollups + per-tenant budgets enforced upstream.

9. **N+1 on nested project reads.** Deep task/comment trees.
   → Explicit selection contracts + denormalized counters + read projections for boards/dashboards.

10. **Versioning ambiguity.** Mixing optimistic locking with historical versions.
    → Two distinct mechanisms: `version` int (concurrency) **and** `*_versions` tables (history),
    applied only where each is needed.

**Net assessment (Stripe/Linear/GitHub lens):** the model is **normalized where integrity matters,
denormalized where reads demand it, tenant-scoped on every row, time-partitioned on every firehose,
and money-safe by construction.** It serves one agency on a single Postgres instance today and
scales — via replicas → partitions → `organizationId` sharding — to thousands of tenants and
millions of records **without a schema rewrite**. The path to hard multi-tenant isolation (RLS),
horizontal sharding, and specialized stores (search/vector/warehouse) is designed-in, not bolted-on.

---

## 14. Open Data Decisions (to ratify before schema generation)

1. **UUID v7 vs v4** — recommend **v7** (index locality). Confirm Prisma/Postgres generation approach.
2. **RLS now vs pre-SaaS** — recommend app-layer dual-guard now, **RLS before public multi-tenant**.
3. **Vector store** — pgvector (in-DB, simpler) vs external (scale). Start pgvector.
4. **Search** — Postgres FTS (GIN/tsvector) for v1 vs Meilisearch/OpenSearch at scale.
5. **Partition timing** — partition firehose tables from day one, or add when volume warrants?
   (Recommend: create partitioned from the start for `analytics_events`, `audit_logs`.)
6. **`transactions` ledger** — adopt double-entry now or defer? (Recommend lightweight ledger v1.)

---

*End of Database Blueprint v1.0. This specification is the source of truth for the eventual
`schema.prisma`. Next artifacts (after sign-off): the Prisma schema, migration plan
(expand→contract), seed data, and RLS policy definitions. No code until ratified.*
