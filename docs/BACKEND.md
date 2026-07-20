# AgencyOS — Backend Architecture Blueprint

**Companion to:** `PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`
**Document version:** 1.0
**Status:** Draft for review
**Perspective:** Principal Backend / SaaS / API / Event-Driven / Distributed Systems / Security / DevOps Architect
**Last updated:** 2026-07-11

> **Scope:** the *backend blueprint* — structure, modules, API surface, realtime, events,
> jobs, security, and ops. **No implementation code, no controllers/services, no UI.**
> Code artifacts are produced only after this blueprint is ratified.

---

## 0. Stack & Cross-Cutting Decisions

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **NestJS + TypeScript** | Modular, DI-first, opinionated — maps 1:1 to our domain modules |
| DB | **PostgreSQL + Prisma** | Relational integrity + typed access; tenant-scoped |
| Auth | **Better Auth** (primary) | First-class multi-provider (Google/password/magic-link/OTP), session + JWT, framework-agnostic, self-hosted (no vendor lock, tenant data stays in our DB). Auth.js viable but Better Auth's DB-session + org model fits multi-tenant better |
| Cache | **Redis** | Sessions, cache, rate limits, pub/sub fan-out, BullMQ backing |
| Queue | **BullMQ** (on Redis) | Durable background jobs, retries, scheduling, priorities |
| Realtime | **WebSockets** (Socket.IO gateway) | Live tracking, notifications, presence |
| Storage | **Cloudflare R2** | S3-compatible, zero egress, CDN-adjacent |
| Email | **Resend** | Transactional + templated, good deliverability |
| Payments | **Razorpay + Stripe** | Razorpay (India/INR), Stripe (global) via one payment abstraction |

**Cross-cutting principles**
1. **Tenant isolation is a correctness property**, enforced centrally — never per-query discipline.
2. **Modular monolith**, service-extraction-ready. Modules talk via an internal event bus + typed contracts.
3. **Everything async that can be** — request path stays fast; side-effects go to BullMQ.
4. **API-first & versioned** — every capability has an internal contract before a UI.
5. **Secure & observable by default** — guards, validation, audit, tracing on every route.

---

## 1. Backend Folder Structure

```
src/
├── main.ts                       # bootstrap: helmet, cors, versioning, global pipes/filters
├── app.module.ts                 # root module wiring
│
├── modules/                      # DOMAIN modules (one folder per bounded context)
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── controllers/          # thin HTTP layer (design only, no impl here)
│   │   ├── services/             # domain logic
│   │   ├── dto/                  # request/response DTOs (class-validator)
│   │   ├── guards/               # module-specific guards
│   │   ├── events/               # events this module emits/handles
│   │   ├── strategies/           # passport/better-auth strategies
│   │   └── auth.contract.ts      # public interface other modules consume
│   ├── users/
│   ├── organizations/            # tenants + teams
│   ├── clients/
│   ├── employees/
│   ├── projects/
│   │   ├── phases/
│   │   ├── milestones/
│   │   ├── tasks/
│   │   └── time-logs/
│   ├── crm/                      # leads, contacts, pipeline
│   ├── proposals/                # proposals, quotations, contracts
│   ├── catalog/                  # services, packages, add-ons, pricing engine
│   ├── commerce/                 # checkout, orders, coupons
│   ├── billing/                  # invoices, payments, refunds, subscriptions
│   ├── files/                    # R2 storage, folders, media library
│   ├── collaboration/            # comments, activity feed, messages
│   ├── notifications/
│   ├── support/                  # tickets, knowledge base
│   ├── cms/                      # blog + portfolio
│   ├── analytics/                # event ingestion, reports
│   ├── ai/                       # agents, conversations, prompts, context builder
│   ├── integrations/             # provider connectors, webhooks (inbound/outbound)
│   ├── audit/                    # audit logs
│   ├── settings/                 # tenant config, feature flags, entitlements
│   └── platform/                 # super-admin, tenant mgmt, marketplace [future]
│
├── common/                       # shared, domain-agnostic building blocks
│   ├── decorators/               # @CurrentUser, @Tenant, @Roles, @Permissions, @Public
│   ├── guards/                   # JwtAuthGuard, RolesGuard, TenantGuard, PermissionGuard
│   ├── interceptors/             # logging, transform, timeout, tenant-context, cache
│   ├── filters/                  # global exception filter, prisma-error filter
│   ├── pipes/                    # global ValidationPipe config
│   ├── middlewares/              # request-id, tenant-resolver, raw-body (webhooks)
│   ├── dto/                      # PaginationDto, base response envelope
│   └── errors/                   # domain error classes → HTTP mapping
│
├── config/                       # typed config (env schema validated at boot)
│   ├── configuration.ts
│   ├── env.validation.ts
│   └── namespaces/               # db, redis, auth, storage, payments, ai configs
│
├── database/                     # Prisma client provider, tenant-scoped extension, migrations, seeds
│   ├── prisma.module.ts
│   ├── prisma.service.ts
│   └── tenant-scope.extension.ts # Prisma $extends: injects tenant_id + soft-delete filter
│
├── events/                       # event bus abstraction + global event catalog/types
│   ├── event-bus.module.ts
│   ├── domain-events.ts          # canonical event names + payload contracts
│   └── outbox/                   # transactional outbox pattern
│
├── jobs/                         # BullMQ queues, processors, schedulers
│   ├── queues/                   # queue definitions
│   ├── processors/               # worker processors (run in worker process)
│   └── schedulers/               # cron/repeatable jobs
│
├── realtime/                     # WebSocket gateway, rooms, presence, auth
│   ├── realtime.gateway.ts
│   └── rooms.ts                  # room naming: tenant:{id}, project:{id}, user:{id}
│
├── middlewares/                  # (app-level, if not in common)
├── guards/ interceptors/ filters/ decorators/  # (re-exported from common for ergonomics)
├── utils/                        # pure helpers (dates, money, slugs, ids)
├── types/                        # shared TS types, augmentations (Request.user/tenant)
├── constants/                    # enums, role keys, permission keys, queue names, event names
└── health/                       # health checks, readiness/liveness probes
```

**Structural rules**
- A module may depend on another **only through its `*.contract.ts`** — never reach into its services/DB.
- Cross-module side-effects go through **`events/`**, not direct calls.
- `common/`, `config/`, `database/`, `events/`, `jobs/` have **no domain knowledge**.
- **Two runtime entrypoints**, one codebase: the **API app** (`main.ts`) and the **worker** (BullMQ processors). They share modules but boot different providers.

---

## 2. Module Breakdown

Format: **Purpose · Responsibilities · Dependencies · Future expansion.** Modules mirror the
Architecture blueprint's domains. Every module is tenant-scoped and emits audit + analytics events.

### Foundation

**AuthModule** — *Purpose:* identity & session issuance. *Responsibilities:* login (password/Google/magic-link/OTP), registration, JWT + refresh rotation, session lifecycle, password reset, invitation acceptance, 2FA, impersonation (audited). *Dependencies:* Users, Organizations, Notifications (emails), Audit. *Future:* SAML/SCIM, passkeys, step-up auth.

**UsersModule** — *Purpose:* user accounts & memberships. *Responsibilities:* profiles, tenant memberships, role assignment, deactivation, availability. *Dependencies:* Auth, Organizations. *Future:* skills matrix, HRIS sync.

**OrganizationsModule** — *Purpose:* the tenant boundary + teams; client companies as accounts. *Responsibilities:* tenant lifecycle, teams/departments, branding, domains, plan/limits, feature flags. *Dependencies:* foundational (everything scopes to it). *Future:* sub-brands, multi-workspace, data residency.

**SettingsModule** — *Purpose:* per-tenant config + entitlements. *Responsibilities:* branding, integrations config, notification prefs, automation/AI rules, **entitlements engine** (plan-gating). *Dependencies:* Organizations. *Future:* config versioning, policy-as-config.

**AuditModule** — *Purpose:* immutable action log. *Responsibilities:* subscribe to event bus, persist who/what/when/before/after, expose filtered read. *Dependencies:* Event bus (consumer of all). *Future:* SIEM export, anomaly detection.

### Sales & Delivery

**ClientsModule** — *Purpose:* client accounts & portal identity. *Responsibilities:* client company/contacts, client-user provisioning, client-visibility settings. *Dependencies:* Organizations, CRM, Projects. *Future:* client health scores, CSAT.

**EmployeesModule** — *Purpose:* internal people & capacity. *Responsibilities:* employee records, teams, availability, cost/bill rates. *Dependencies:* Users. *Future:* utilization forecasting, org chart.

**CrmModule** — *Purpose:* leads → deals. *Responsibilities:* lead intake, contacts/companies, pipeline stages, activities, deal→client conversion. *Dependencies:* Marketing (leads), Catalog, Notifications, AI. *Future:* scoring, sequences, enrichment.

**ProposalsModule** — *Purpose:* proposals, quotations, contracts. *Responsibilities:* build from catalog, versioning, client accept/decline, e-sign, deposit trigger. *Dependencies:* Catalog, Pricing, Billing, Files, AI. *Future:* clause library, template marketplace.

**CatalogModule** — *Purpose:* services/packages + **pricing engine**. *Responsibilities:* services, packages, add-ons, coupons, pricing computation, project templates. *Dependencies:* consumed by Website, Sales, Commerce, Projects. *Future:* usage-based pricing, regional catalogs.

**CommerceModule** — *Purpose:* checkout & orders. *Responsibilities:* cart/summary, order lifecycle, coupon application, order→project link. *Dependencies:* Catalog, Pricing, Billing. *Future:* reorder, subscriptions checkout.

**BillingModule** — *Purpose:* money in. *Responsibilities:* invoices (one-off/milestone/deposit/recurring), payments via Razorpay+Stripe, refunds, taxes, AR, tenant subscription billing. *Dependencies:* Commerce, Projects (milestones), Integrations (webhooks). *Future:* dunning, revenue recognition, contractor payouts.

**ProjectsModule** (+ Phases, Milestones, Tasks, TimeLogs) — *Purpose:* delivery core. *Responsibilities:* projects from templates, phases/milestones (billable, approval gates), tasks/subtasks/dependencies, time tracking, budget/scope, **live tracking derivation**, internal-vs-client visibility. *Dependencies:* Catalog, Users, Files, AI, Billing. *Future:* program/portfolio mgmt, resource optimization.

### Engagement, Content, Platform

**FilesModule** — *Purpose:* R2 storage. *Responsibilities:* upload (presigned), folders, versioning, media library, deliverable hand-off, access control, virus scan hook. *Dependencies:* R2, Projects/Tasks/CMS (linked). *Future:* DAM, in-app annotation.

**CollaborationModule** — *Purpose:* comments, activity feed, messages. *Responsibilities:* threaded comments, @mentions, internal-vs-client, activity aggregation, direct/project messaging. *Dependencies:* event bus (feed), Notifications. *Future:* real-time co-edit, thread summarization.

**NotificationsModule** — *Purpose:* multi-channel delivery. *Responsibilities:* in-app + email (Resend), preferences, digests, channel routing; push/WhatsApp/SMS adapters (future-stubbed). *Dependencies:* event bus, Resend, Files (attachments). *Future:* smart batching, priority inbox.

**SupportModule** — *Purpose:* tickets + knowledge base. *Responsibilities:* ticket lifecycle, SLAs, change-order→quote, KB articles (AI grounding). *Dependencies:* Projects, CRM, AI, Notifications. *Future:* SLA automation, CSAT, maintenance retainers.

**CmsModule** — *Purpose:* blog + portfolio content. *Responsibilities:* posts/categories/tags/authors with draft→publish, case studies, media, SEO fields, generate-from-project. *Dependencies:* Files, Marketing site (read), AI (drafting). *Future:* content calendar, SEO scoring.

**AnalyticsModule** — *Purpose:* metrics + reports. *Responsibilities:* event ingestion, read projections, dashboards per role, report generation/scheduling, exports. *Dependencies:* event bus (universal consumer). *Future:* warehouse export, embedded analytics.

**AiModule** — *Purpose:* AI orchestration. *Responsibilities:* agents (PM/Sales/Support), conversation memory, prompt templates, context builder, model routing, token accounting, approvals queue. *Dependencies:* Projects, CRM, Support, Files (as tools), Settings (budgets). *Future:* agentic actions, predictive delivery.

**IntegrationsModule** — *Purpose:* external world. *Responsibilities:* OAuth connectors, inbound webhook receivers (payments, e-sign), outbound webhooks, sync jobs. *Dependencies:* providers, event bus. *Future:* marketplace, iPaaS.

**PlatformModule [future]** — *Purpose:* super-admin control plane + marketplace. *Responsibilities:* tenant mgmt, impersonation, feature flags, billing oversight, marketplace listings. *Dependencies:* all (read/oversight). *Future:* partner ecosystem, usage metering.

---

## 3. REST API Architecture

### 3.1 Conventions
- **Base:** `/api/v1`. **Versioning:** URI-based (`v1`, `v2`) — see §12.
- **Auth:** `Authorization: Bearer <access_token>`; tenant resolved from token/`X-Org-Id` and validated against membership.
- **Envelope:** `{ data, meta }` on success; `{ error: { code, message, details, traceId } }` on failure.
- **Pagination:** cursor-based (`?cursor=&limit=`) for large collections; `?page=&limit=` allowed for small admin lists.
- **Filtering/sort:** `?filter[status]=active&sort=-createdAt`.
- **Idempotency:** `Idempotency-Key` header required on POST for payments/orders.
- **Verbs:** `GET` read · `POST` create/action · `PUT` full replace · `PATCH` partial · `DELETE` soft-delete.

### 3.2 Endpoint surface (representative — not exhaustive)

**Auth** `/auth`
- `POST /auth/register` · `POST /auth/login` · `POST /auth/logout`
- `GET  /auth/google` · `GET /auth/google/callback`
- `POST /auth/magic-link` · `POST /auth/magic-link/verify`
- `POST /auth/otp/request` · `POST /auth/otp/verify`
- `POST /auth/refresh` · `POST /auth/password/forgot` · `POST /auth/password/reset`
- `POST /auth/2fa/enable` · `POST /auth/2fa/verify`
- `POST /auth/invitations/accept` · `GET /auth/me`

**Users** `/users`
- `GET /users` · `GET /users/:id` · `POST /users` (invite) · `PATCH /users/:id` · `DELETE /users/:id`
- `PATCH /users/:id/role` · `GET /users/me` · `PATCH /users/me`

**Organizations** `/organizations`
- `GET /organizations/current` · `PATCH /organizations/current`
- `GET /organizations/:id/members` · `POST /organizations/:id/invitations`
- `GET/POST/PATCH/DELETE /organizations/:id/teams`
- `GET/PATCH /organizations/:id/settings` · `GET/PATCH /organizations/:id/feature-flags`

**Clients** `/clients` — `GET · GET/:id · POST · PATCH/:id · DELETE/:id` + `GET /clients/:id/projects`, `GET /clients/:id/invoices`

**Employees** `/employees` — full CRUD + `GET /employees/:id/workload`, `GET /employees/:id/time-logs`

**CRM** `/crm`
- `GET/POST /crm/leads` · `GET/PATCH/DELETE /crm/leads/:id` · `POST /crm/leads/:id/convert`
- `GET/POST /crm/contacts` · `GET/POST /crm/companies`
- `GET /crm/pipeline` · `PATCH /crm/deals/:id/stage` · `POST /crm/activities`

**Proposals / Quotes / Contracts** `/proposals`
- `GET/POST /proposals` · `GET/PATCH/DELETE /proposals/:id` · `POST /proposals/:id/send`
- `POST /proposals/:id/accept` · `POST /proposals/:id/decline`
- `GET/POST /quotations` · `POST /quotations/:id/accept`
- `GET /contracts` · `POST /contracts/:id/sign` · `GET /contracts/:id/status`

**Catalog** `/catalog`
- `GET/POST /catalog/services` · `GET/PATCH/DELETE /catalog/services/:id`
- `GET/POST /catalog/packages` · `GET/POST /catalog/addons` · `GET/POST /catalog/coupons`
- `POST /catalog/price/quote` (pricing engine compute)

**Commerce / Orders** `/orders`
- `POST /checkout` · `GET/POST /orders` · `GET /orders/:id` · `PATCH /orders/:id/status`

**Billing** `/billing`
- `GET/POST /billing/invoices` · `GET /billing/invoices/:id` · `POST /billing/invoices/:id/send`
- `POST /billing/payments` · `GET /billing/payments/:id` · `POST /billing/refunds`
- `GET/POST /billing/subscriptions` · `POST /billing/webhooks/stripe` · `POST /billing/webhooks/razorpay`

**Projects** `/projects`
- `GET/POST /projects` · `GET/PATCH/DELETE /projects/:id`
- `GET /projects/:id/tracking` (live %) · `GET /projects/:id/activity`
- `GET/POST /projects/:id/phases` · `GET/POST /projects/:id/milestones`
- `POST /milestones/:id/approve` · `POST /milestones/:id/request-changes`

**Tasks** `/tasks`
- `GET/POST /tasks` · `GET/PATCH/DELETE /tasks/:id` · `PATCH /tasks/:id/status`
- `GET/POST /tasks/:id/subtasks` · `GET/POST /tasks/:id/comments` · `GET/POST /tasks/:id/attachments`
- `GET/POST /tasks/:id/time-logs`

**Files** `/files`
- `POST /files/presign` (upload URL) · `POST /files` (confirm) · `GET /files/:id`
- `DELETE /files/:id` · `GET/POST /folders` · `GET /media`

**Collaboration** `/comments`, `/messages`, `/activity` — CRUD + feed reads

**Notifications** `/notifications`
- `GET /notifications` · `PATCH /notifications/:id/read` · `POST /notifications/read-all`
- `GET/PATCH /notifications/preferences`

**Support** `/support`
- `GET/POST /support/tickets` · `GET/PATCH /support/tickets/:id` · `POST /support/tickets/:id/reply`
- `GET/POST /support/kb` (knowledge base)

**CMS** `/cms`
- `GET/POST /cms/blog/posts` · `GET/PATCH/DELETE /cms/blog/posts/:id` · `POST /cms/blog/posts/:id/publish`
- `GET/POST /cms/blog/categories` · `GET/POST /cms/portfolio` · `GET/POST /cms/tags`

**Analytics / Reports** `/analytics`, `/reports`
- `POST /analytics/events` (ingest) · `GET /analytics/dashboards/:key`
- `GET/POST /reports` · `POST /reports/:id/generate` · `GET /reports/:id/download`

**AI** `/ai`
- `GET/POST /ai/conversations` · `POST /ai/conversations/:id/messages`
- `GET /ai/agents` · `GET/POST /ai/prompt-templates`
- `POST /ai/pm/analyze/:projectId` · `POST /ai/sales/score/:leadId` · `POST /ai/support/suggest/:ticketId`

**Integrations / Webhooks / API Keys** `/integrations`
- `GET/POST /integrations` · `POST /integrations/:provider/connect`
- `GET/POST /webhooks` (outbound subscriptions) · `GET/POST/DELETE /api-keys`

**Audit** `/audit` — `GET /audit/logs` (filterable, read-only)

**Platform [future]** `/platform` — `GET/POST /platform/tenants`, `POST /platform/impersonate`, `GET/POST /platform/marketplace`

---

## 4. WebSocket Architecture

**Gateway:** Socket.IO, JWT-authenticated on `connection`, Redis adapter for horizontal fan-out.
**Rooms (namespacing):** `tenant:{orgId}`, `project:{projectId}`, `user:{userId}`, `ticket:{id}`.
Server authorizes room joins against RBAC + membership. Clients never join rooms outside their tenant.

**Emitted events (server → client)**
| Event | Room | Trigger |
|---|---|---|
| `project.updated` | `project:{id}` | project fields change |
| `project.progress` | `project:{id}` | live % recomputed |
| `phase.updated` / `milestone.updated` | `project:{id}` | phase/milestone change |
| `milestone.approval_requested` | `project:{id}`, `user:{pm}` | client/PM approval needed |
| `task.created/updated/completed` | `project:{id}` | task lifecycle |
| `comment.added` | `project:{id}`/`ticket:{id}` | new comment/@mention |
| `notification.created` | `user:{id}` | any user-targeted notification |
| `payment.received` | `tenant:{id}`, `user:{owner}` | payment webhook confirmed |
| `invoice.updated` | `user:{client}` | invoice status change |
| `approval.requested` / `approval.resolved` | `user:{approver}` | approval workflow |
| `message.sent` | `project:{id}`/`user:{id}` | new message |
| `presence.updated` | `project:{id}` | user online/typing |
| `ai.suggestion` | `user:{pm}` | AI PM flag/suggestion |

**Client → server:** `join`, `leave`, `typing`, `presence.ping` (all authorized).
**Delivery guarantee:** WS is best-effort UI freshness; **the durable source of truth is the DB + notification records** — clients reconcile on reconnect via REST.

---

## 5. Event-Driven Architecture

### 5.1 Mechanics
- **Transactional outbox:** domain writes + event row committed in one DB transaction; a relay publishes to the bus (Redis/BullMQ). Guarantees **no lost events**.
- **Event names** live in `constants/`; **payload contracts** in `events/domain-events.ts`.
- Consumers are **idempotent** (dedupe on event id). At-least-once delivery.
- Every event also feeds **Audit** and **Analytics** (universal subscribers).

### 5.2 Master chain — Order → Delivery
```
order.checkout.completed
  → payment.authorized → payment.captured
    → order.created
      → project.created (from catalog template)
        → ai.project.plan_requested
          → phases.generated → milestones.generated → tasks.generated
            → employees.assigned (capacity-aware suggestion → human confirm)
              → notifications.dispatched (team + client)
                → dashboard.projection.updated (live tracking)
                  → activity.logged + audit.recorded
```

### 5.3 Service-specific chains
All reuse the master chain but branch at `project.created` via the **service template** and diverge in milestone→billing rules.

**Website Development**
```
project.created(website) → phases[Discovery,Design,Build,Content/SEO,QA,Launch]
  → design.approval_requested → design.approved → milestone.invoice(Design)
  → build.completed → staging.ready → client.review → launch.approved
  → milestone.invoice(Launch) → project.delivered → support.window.opened
```

**App Development**
```
project.created(app) → spec.signed_off → sprint.started (repeat)
  → sprint.demo_ready → sprint.approved → (loop)
  → release.candidate → qa.passed → store.release → milestone.invoice(Release)
  → project.delivered → sla.support.activated
```

**SEO**
```
project.created(seo) → audit.completed → strategy.approved → tracking.configured
  → campaign.live → [recurring] optimization.cycle → monthly.report.generated
  → retainer.invoice.issued(monthly) → renewal.checkpoint
```

**Digital Marketing**
```
project.created(marketing) → strategy.approved → creatives.approved → campaign.launched
  → [recurring] performance.synced(analytics) → monthly.report.generated
  → ad_spend.reconciled → retainer.invoice.issued → optimize.loop
```

**Branding**
```
project.created(branding) → research.done → strategy.signed_off
  → concepts.presented → concept.approved → revisions.loop
  → assets.finalized → milestone.invoice(Final) → brandkit.delivered
```

**AI Automation**
```
project.created(ai-automation) → process.audit.done → solution.design.signed_off
  → build.integrated → pilot.validated → deploy.approved → go_live
  → monitoring.enabled → [recurring] usage.metered → usage.invoice.issued
```

**Maintenance (retainer)**
```
maintenance.retainer.activated → [cron] retainer.cycle.started
  → work.performed(time-logged) → cycle.report → recurring.invoice.issued
  → payment.captured → cycle.closed
```

**Support Tickets**
```
ticket.raised → ai.support.triage → ticket.routed(assignee)
  → (if change) change_order.created → quotation.generated → [into sales loop]
  → (if support) ticket.resolved → csat.requested → ticket.closed
```

**Refunds**
```
refund.requested → refund.approval_requested → refund.approved
  → payment.refund.initiated(provider) → refund.provider.confirmed(webhook)
  → invoice.credit_note.issued → notifications.dispatched → audit.recorded
```

---

## 6. Background Jobs (BullMQ)

Queues run in a **separate worker process**. Each queue: concurrency, retry (exp backoff), DLQ, idempotency.

| Queue | Trigger | Work | Notes |
|---|---|---|---|
| `email` | events | Render + send via Resend | retries; suppress on bounce |
| `notifications` | events | Persist + fan-out (in-app/WS/email) | dedupe per user+event |
| `invoice-generation` | milestone/schedule | Build invoice, PDF, notify | idempotent per milestone |
| `payment-verification` | webhook/poll | Reconcile provider status | idempotency key |
| `reports-weekly` | cron | Aggregate + render + deliver | per-tenant, off-peak |
| `ai-summary` | events/cron | Project health, standup, digests | token-budgeted, batched |
| `reminders` | cron | Overdue invoices, tasks, follow-ups | timezone-aware |
| `backups` | cron | Snapshot + R2 export verify | alert on failure |
| `analytics-rollup` | cron/stream | Materialize projections | incremental |
| `webhooks-outbound` | events | Deliver to tenant endpoints | signed, retried, DLQ |
| `file-postprocess` | upload | Virus scan, thumbnails, transcode | R2 lifecycle |
| `search-index` | events | Sync to search index | debounce |
| `contract-status` | poll | E-sign provider polling | until signed/expired |
| `subscription-billing` | cron | Retainer/SaaS recurring charges | dunning on fail |

**Cross-cutting:** every job carries `tenantId` + `traceId`; failures alert; DLQ inspected by ops; schedulers use jittered cron to avoid thundering herds.

---

## 7. Permission & Tenant Isolation Middleware

**Layered enforcement (defense in depth):**
1. **`TenantResolverMiddleware`** — derives `tenantId` from JWT/`X-Org-Id`, validates active membership, attaches `req.tenant`.
2. **`JwtAuthGuard`** — validates access token; `@Public()` opts out.
3. **`RolesGuard`** — checks `@Roles(...)` against user's roles in this tenant.
4. **`PermissionGuard`** — fine-grained `@Permissions('project:create')` against role→permission mapping (RBAC matrix from Architecture §3).
5. **Ownership/scope checks** — in-service assertions (e.g., employee sees only assigned projects; client sees only own account).
6. **Prisma tenant-scope extension** — every query auto-injects `tenantId` filter + `deletedAt: null`; a **defense-in-depth net** so a forgotten `where` can't leak cross-tenant data.
7. **Client-visibility gate** — independent flag; client-scoped reads filter `clientVisible: true`.

**Key rule:** tenant isolation is enforced at **both** the app guard layer **and** the data layer — never trust a single point.

---

## 8. Validation, Errors, Rate Limiting

- **DTOs:** `class-validator` + `class-transformer`; global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, `transform`. Separate `Create*`/`Update*`/`Query*` DTOs; response DTOs for serialization (strip internal fields).
- **Error model:** domain error classes → mapped to HTTP by a **global exception filter**; consistent `{ error: { code, message, details, traceId } }`. Prisma errors caught by a dedicated filter (unique/foreign-key → 409/422).
- **Rate limiting:** Redis-backed; tiers — global per-IP, per-user, per-tenant, and per-sensitive-route (auth, payments, AI). Return `429` + `Retry-After`. Entitlement-based quotas for AI/API [SaaS].
- **Logging:** structured JSON (pino), `requestId`/`traceId`/`tenantId` on every line; PII redaction; separate audit log stream.
- **Exception filters:** global catch-all + specialized (validation, prisma, auth, payment-webhook). Never leak stack traces to clients.

---

## 9. File Upload Architecture (Cloudflare R2)

- **Presigned direct-to-R2 uploads:** client requests `POST /files/presign` → server returns scoped presigned PUT URL + object key → client uploads directly (offloads app tier) → `POST /files` confirms & persists metadata.
- **Key layout:** `tenant/{tenantId}/{domain}/{entityId}/{uuid}-{filename}` — tenant-partitioned for isolation, lifecycle, and easy per-tenant export/delete.
- **Types & rules:** images (thumbnail/resize), documents (invoices/contracts — private, signed access only), videos (transcode job), project assets, portfolio media (CDN-public), blog images (CDN-public). Validated by MIME + magic-byte + size caps per type.
- **Access:** private by default; **short-lived signed URLs** for downloads; public bucket only for CDN-served marketing/CMS assets. Access mirrors project/RBAC permissions.
- **Post-processing queue:** virus scan → thumbnails/transcode → search index. R2 lifecycle rules for versioning/expiry of temp objects.
- **Never** proxy large files through the app tier; app only issues URLs + metadata.

---

## 10. Notification System

**Pipeline:** event → `NotificationsModule` resolves recipients (RBAC-scoped) → checks per-user **preferences** → renders per channel → dispatches via **channel adapters** → persists in-app record → WS push.

| Channel | v1 | Transport | Notes |
|---|---|---|---|
| In-app | ✅ | DB record + WS | source of truth; badge counts |
| Email | ✅ | Resend | templated, digestable, unsubscribe |
| Push | adapter-stubbed | (FCM/APNs later) | interface defined now |
| WhatsApp | future | (BSP later) | opt-in, template messages |
| SMS | future | (provider later) | OTP/critical only |

**Guarantees:** clients never receive internal-only events; preferences honor channel + frequency + mute; digests batch low-priority; every notification carries deep-link + `traceId`. Adapter pattern means new channels don't touch producers.

---

## 11. AI Backend

- **Agents:** `AI-PM`, `AI-Sales`, `AI-Support` — each a configured persona + tool set + guardrails. Built on latest Claude models (Opus for complex reasoning/synthesis, Sonnet for routine drafting, Haiku for cheap classification/routing).
- **Model routing:** route by task complexity + tenant budget + latency need → cheapest model that satisfies quality. Fallback chain on provider error; graceful degrade (feature offline) if all fail.
- **Context builder:** assembles tenant-scoped, RBAC-filtered context (project/task/CRM data) into token-budgeted prompts; **never** crosses tenant boundaries; summarizes long histories to control cost.
- **Conversation memory:** stored as `AiConversation` + `AiMessage` (tenant-scoped, soft-delete); rolling summaries for long threads; retrieval of relevant prior context.
- **Prompt templates:** versioned `PromptTemplate` records (system prompts, tool descriptions) — editable config, not code; A/B-able.
- **Tools:** agents call the same **module contracts** humans use (read context, propose actions). Actions affecting money/clients enqueue **approvals**, never auto-execute (v1).
- **Token accounting:** every call logs tokens/cost per tenant/agent/conversation → Analytics + per-tenant **budgets/quotas** enforced via rate limiter.
- **Safety:** input/output guardrails, PII handling, prompt-injection defenses (treat retrieved content as untrusted), full audit trail, per-project opt-out.

---

## 12. API Versioning Strategy

- **URI versioning:** `/api/v1/...` (NestJS `VersioningType.URI`). Public and internal share the scheme.
- **v1 → v2:** additive changes stay in v1 (new optional fields, new endpoints). **Breaking** changes (removed/renamed fields, changed semantics) require v2.
- **Coexistence:** v1 and v2 run simultaneously; controllers versioned per-route so only changed endpoints fork — no wholesale duplication.
- **Deprecation policy:** announce → `Deprecation` + `Sunset` headers + docs → minimum **6-month** window (longer for public/SaaS) → remove. Deprecations logged/metered to see who still calls them.
- **Webhooks & events** are versioned independently (payload `schemaVersion`).

---

## 13. Security

| Area | Approach |
|---|---|
| **JWT** | Short-lived access (~15m), signed (rotating keys/JWKS); minimal claims (userId, tenantId, roles) |
| **Refresh tokens** | Long-lived, **rotated on use**, hashed at rest, family-based reuse detection → revoke on theft |
| **Sessions** | Better Auth DB sessions; device list; revoke-all; idle + absolute timeout |
| **CSRF** | SameSite cookies + CSRF token for cookie-based flows; bearer tokens for API |
| **XSS** | Output encoding, CSP headers, sanitize rich text (CMS/comments), no `dangerouslySet*` on untrusted |
| **SQL injection** | Prisma parameterized queries only; no raw string SQL; validated inputs |
| **Rate limiting** | Redis tiers (IP/user/tenant/route); strict on auth/payment/AI |
| **Password** | Argon2id hashing; breach-list check; strength policy; no plaintext logs |
| **Secrets** | Secret manager (not env files in prod); rotated; least-privilege per service |
| **API keys** | Hashed at rest, scoped, revocable, per-key rate limits, last-used tracking |
| **Webhooks** | Signature verification (Stripe/Razorpay), raw-body middleware, replay protection, idempotency |
| **Transport** | TLS everywhere, HSTS, helmet security headers |
| **Tenant isolation** | Dual-layer (guard + Prisma extension); tested as a security invariant |
| **Audit** | All auth, money, permission, impersonation events immutably logged |
| **Data** | Encryption at rest (DB/R2), field-level encryption for sensitive PII, GDPR export/delete |

---

## 14. Monitoring & Observability

- **Logging:** structured JSON (pino), centralized (e.g., Loki/ELK), correlation via `traceId`/`requestId`/`tenantId`, PII-redacted.
- **Metrics:** Prometheus-style — RED (rate/errors/duration) per route, queue depth/latency, DB pool, cache hit ratio, WS connections, AI tokens/cost, payment success rate. Per-tenant dimensions for noisy-neighbor detection.
- **Tracing:** OpenTelemetry distributed traces across API → jobs → DB → providers.
- **Health checks:** `/health/live` (process) + `/health/ready` (DB, Redis, R2, providers) for LB/orchestrator probes.
- **Error tracking:** Sentry — grouped, released-tagged, alerting on new/spiking errors.
- **Performance:** APM on p95/p99 latency, slow-query log, N+1 detection, budget alerts.
- **Business SLOs:** uptime, invoice cycle time, webhook delivery success, AI availability — with alert thresholds and a status page [SaaS].

---

## 15. Scaling Strategy

1. **Stateless API tier** behind a load balancer → horizontal autoscaling; sessions/state in Redis/DB.
2. **Load balancer** with health-check-aware routing, TLS termination, sticky-less (WS via Redis adapter).
3. **Redis** for cache, rate limits, sessions, BullMQ, WS pub/sub — clustered for HA.
4. **Caching layers:** entity cache (hot reads), computed read-projections (dashboards/live-tracking), HTTP cache for public CMS/marketing (CDN). Cache-aside + event-driven invalidation.
5. **CDN** (Cloudflare) for static, CMS media, and R2 assets — offload edge.
6. **Queues** absorb spikes; scale workers independently of API.
7. **DB scaling:** connection pooling (PgBouncer), read replicas for analytics/reporting, partitioning for high-volume tables (events, notifications, audit, activity, ai_messages), archival of cold data.
8. **Microservices readiness:** modules already isolated behind contracts + events → extract the highest-load domains (AI, Analytics, Notifications, Files) into services **only when metrics justify it**, communicating over the same event contracts.
9. **Per-tenant fairness:** quotas, rate limits, and (for whales) dedicated resources/DB carve-outs.

---

## 16. Deployment Architecture

| Env | Purpose | Notes |
|---|---|---|
| **Development** | local | Docker Compose (Postgres, Redis, MinIO-as-R2); seeded tenants |
| **Staging** | pre-prod mirror | prod-like, sanitized data, runs full CI + smoke/e2e |
| **Production** | live | autoscaled API + worker fleets, HA Redis/Postgres, managed backups |

- **Containers:** multi-stage Docker; separate **API** and **worker** images from one codebase; distroless runtime; non-root.
- **CI/CD:** lint → typecheck → unit → contract/integration tests → build → migrate (safe, backward-compatible) → deploy → smoke. **Prisma migrations** gated and reversible; expand-then-contract for schema changes. Blue-green / rolling with health-gated cutover.
- **Config:** 12-factor env via secret manager; per-env config validated at boot.
- **Future Kubernetes:** HPA on CPU/queue-depth, separate deployments for api/worker/websocket, pod disruption budgets, network policies for tenant/service isolation, service mesh when microservices emerge.
- **DR:** automated Postgres backups + PITR, R2 versioning, tested restores, documented RPO/RTO, multi-AZ (multi-region for SaaS growth).

---

## 17. Architecture Review — Bottlenecks, Risks & Improvements

**Bottlenecks identified & mitigations**
1. **Live tracking recompute on every task change** → don't recompute synchronously; debounce + compute in `analytics-rollup`/projection, push via WS. Store denormalized progress on the project.
2. **AI on the request path** → all non-interactive AI is queued; interactive AI streamed with strict token/latency budgets + fallback models.
3. **Notification fan-out storms** (large tenants) → batch + rate-limit per user, digest low-priority, cap fan-out per event.
4. **Webhook processing blocking** → thin receiver verifies signature + enqueues; heavy work in `payment-verification`/`webhooks-outbound`. Idempotent by provider event id.
5. **Hot tables** (audit, activity, notifications, ai_messages, analytics_events) → time-partition + archive; never join large event tables in hot reads — use projections.
6. **Prisma connection exhaustion** under autoscale → PgBouncer + tuned pool per instance; read replicas for reports.
7. **N+1 on nested project/task reads** → explicit `include`/selection + DataLoader-style batching at the resolver/service edge.

**Security hardening beyond baseline**
- Treat **AI-retrieved content as untrusted** (prompt-injection); tool calls re-checked against RBAC at execution, not just at planning.
- **Impersonation** always audited, time-boxed, banner-flagged.
- **Idempotency keys mandatory** on all money-moving endpoints; refunds/payouts double-approval.
- Regular **tenant-isolation fuzz tests** in CI (attempt cross-tenant access → must fail).

**Maintainability improvements**
- **Contract tests at every module seam** — the thing that makes future service extraction cheap.
- **Transactional outbox** (not naive event emit) so events never diverge from DB state.
- **Templates as data** (services, projects, prompts, emails, reports) — new offerings = config, not deploys.
- **Entitlements engine now** so SaaS plan-gating is a flag flip later.
- **Two-process model (api/worker)** documented so scaling is independent from day one.

**Scalability improvements**
- Read/write split with **projections for all dashboards** (no dashboard queries the write path directly).
- **Per-tenant usage metering** built in from v1 → enables fair-use, billing, and whale carve-outs later.
- **Event schema versioning** so consumers evolve independently.

**Net assessment:** the design is a **modular monolith with microservice-grade seams** — it will serve the first agency on a small footprint yet scale to thousands of tenants and millions of records by extracting only the domains that metrics prove need it, without re-architecting. This is the Stripe/Linear/GitHub playbook: strong boundaries + events + async + observability first, distributed systems only where earned.

---

## 18. Open Backend Decisions (to ratify next)

1. **Better Auth vs Auth.js** — recommend **Better Auth** (DB sessions + org model + self-hosted). Confirm.
2. **Socket.IO vs raw WS/uWebSockets** — Socket.IO for rooms/reconnection ergonomics; revisit if scale demands.
3. **Search engine** — Postgres FTS for v1 vs dedicated (Meilisearch/OpenSearch) for scale.
4. **Payments abstraction shape** — single `PaymentProvider` interface over Razorpay+Stripe; routing by tenant region/currency.
5. **Read-projection store** — same Postgres (materialized) v1 vs separate analytics store later.
6. **Service-extraction order** — likely AI → Notifications → Analytics → Files when triggered.

---

*End of Backend Blueprint v1.0. Prerequisite gap: `DATABASE.md` (entity/schema design) is
referenced throughout but not yet written — recommend generating it before implementation.
Next artifacts (after sign-off): module contract & event catalog, DTO/validation spec,
OpenAPI definition, and the infra/IaC plan. No implementation code until ratified.*
