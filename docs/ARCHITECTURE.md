# AgencyOS — System Architecture Blueprint

**Companion to:** `PRD.md`
**Document version:** 1.0
**Status:** Draft for review
**Perspective:** Senior Enterprise Architect / CTO / SaaS Product Designer
**Last updated:** 2026-07-11

> **Scope of this document:** the *architecture* — modules, boundaries, roles,
> flows, inter-module communication, and scaling strategy. It contains **no
> application code, no database schema, and no UI designs**. Those are downstream
> artifacts produced only after this blueprint is ratified.

---

## 0. Architectural Principles (the non-negotiables)

These principles govern every decision below. When a trade-off arises, resolve it in
favor of the earlier principle.

1. **Multi-tenant from line one.** Every domain record is scoped to a `tenant_id`
   (an Agency). There is no "single-tenant now, refactor later." The *product* ships
   single-tenant; the *architecture* is multi-tenant from day one.
2. **Modular monolith first, service-extraction later.** Start as one deployable with
   hard internal module boundaries. Extract services only when a module's scaling or
   team-ownership profile demands it. Avoid premature microservices.
3. **Domain-driven boundaries.** Modules map to business capabilities (Sales, Delivery,
   Finance), not technical layers. Each module owns its data and exposes a contract.
4. **Event-driven backbone.** Modules communicate synchronously via internal service
   contracts for reads/commands, and asynchronously via a domain **event bus** for
   side-effects (notifications, analytics, AI, automation). No module reaches into
   another module's tables.
5. **Security & isolation by default.** RBAC + tenant scoping enforced at every layer;
   least privilege; deny by default. Tenant data isolation is a correctness property,
   not a feature.
6. **AI as an augmentation layer, not a dependency.** The core system is fully
   functional if AI is offline. AI reads the same data and proposes actions through the
   same contracts humans use.
7. **Everything observable & auditable.** Every significant action emits an event and an
   audit record. Money, permissions, and client-visible changes are always traceable.
8. **API-first.** Every capability is available through an internal API before it has a
   UI. This makes the eventual public API and integrations a natural extension.

---

## 1. High-Level System Topology

```
                          ┌───────────────────────────────────────────┐
                          │                CLIENTS                     │
                          │  Marketing Web · Client Portal · Admin ·   │
                          │  Employee Portal · (future) Mobile · API   │
                          └───────────────────────────────────────────┘
                                            │  HTTPS / WSS
                                            ▼
                          ┌───────────────────────────────────────────┐
                          │        EDGE / API GATEWAY / BFF            │
                          │  Auth, tenant resolution, rate limiting,   │
                          │  routing, request context, CDN, WAF        │
                          └───────────────────────────────────────────┘
                                            │
                 ┌──────────────────────────┼──────────────────────────┐
                 ▼                          ▼                           ▼
        ┌─────────────────┐      ┌──────────────────────┐    ┌──────────────────┐
        │  APPLICATION    │      │   DOMAIN EVENT BUS    │    │  AI ORCHESTRATION │
        │  MODULES        │◄────►│  (async pub/sub)      │◄──►│  LAYER (Claude)   │
        │  (modular       │      │                       │    │  agents + tools   │
        │   monolith)     │      └──────────────────────┘    └──────────────────┘
        └─────────────────┘                 │
                 │                           ▼
                 │                 ┌──────────────────────┐
                 │                 │  BACKGROUND WORKERS   │
                 │                 │  jobs, schedulers,    │
                 │                 │  webhooks, emails     │
                 │                 └──────────────────────┘
                 ▼
   ┌───────────────────────────────────────────────────────────────────────┐
   │  DATA & INFRASTRUCTURE                                                  │
   │  Relational DB (tenant-scoped) · Object storage (files) · Cache ·      │
   │  Search index · Analytics store · Secrets · Queue                      │
   └───────────────────────────────────────────────────────────────────────┘
                 │
                 ▼
   ┌───────────────────────────────────────────────────────────────────────┐
   │  EXTERNAL PROVIDERS                                                     │
   │  Payments · E-sign · Email/SMS · Storage/CDN · Auth/SSO · AI · Webhooks│
   └───────────────────────────────────────────────────────────────────────┘
```

**Reading the topology**
- **BFF (Backend-for-Frontend)** per client surface keeps each portal's payloads lean
  and its permissions explicit.
- The **event bus** is the spine: modules stay decoupled by reacting to events rather
  than calling each other directly for side-effects.
- The **AI Orchestration Layer** is a *client* of the same module contracts — it has no
  privileged backdoor to data.

---

## 2. Module Catalog

Modules are grouped into **domains**. Each module lists: **Purpose · Features · Users ·
Dependencies · Future expansion**.

> "Users" uses the role names defined in Section 3. "Dependencies" lists modules this
> one relies on (→ = depends on / consumes).

### Domain A — Platform & Foundation

#### A1. Marketing Website
- **Purpose:** Public front door and lead engine; per-tenant marketing presence.
- **Features:** CMS-driven pages (home, services, work, pricing, blog, contact),
  lead-capture forms, SEO, analytics, portal login entry, per-tenant theming/domains **[SaaS]**.
- **Users:** Visitors (public); edited by Admin/Marketing.
- **Dependencies:** → Service Catalog, Portfolio CMS, Blog CMS, CRM (lead capture),
  Analytics.
- **Future expansion:** A/B testing engine, landing-page builder, localization,
  personalization by segment, tenant custom domains + SSL automation.

#### A2. Authentication & Identity
- **Purpose:** Verify identity; issue tenant- and role-scoped sessions.
- **Features:** Email/password, magic link, OAuth/SSO, 2FA, session & device
  management, password reset, client invitations, impersonation (support, audited).
- **Users:** All.
- **Dependencies:** → User Management, Organizations; emits to Audit Logs, Notifications.
- **Future expansion:** SCIM provisioning, enterprise SSO (SAML), passkeys, step-up auth.

#### A3. User Management
- **Purpose:** Manage user accounts, profiles, memberships, and role assignments.
- **Features:** Invite/deactivate, profile, role & team assignment, per-tenant
  membership, contractor scoping, availability.
- **Users:** Super Admin, Agency Owner, Admin, HR.
- **Dependencies:** → Auth, Organizations; consumed by nearly every module for identity.
- **Future expansion:** Skills/competency matrix, capacity profiles, org chart, HRIS sync.

#### A4. Organizations (Tenancy & Teams)
- **Purpose:** The tenant boundary. Represents an Agency and its internal teams; also
  models Client companies as accounts.
- **Features:** Tenant lifecycle, teams/departments, branding, domains, plan & limits
  **[SaaS]**, feature flags per tenant.
- **Users:** Super Admin (across tenants), Agency Owner/Admin (own tenant).
- **Dependencies:** Foundational — everything is scoped to it.
- **Future expansion:** Sub-brands, multi-workspace per tenant, data residency regions,
  reseller/partner hierarchies.

#### A5. Settings & Configuration
- **Purpose:** Per-tenant configuration surface for all modules.
- **Features:** Branding, roles/permissions, integrations, billing config, notification
  preferences, automation & AI rules, templates.
- **Users:** Agency Owner, Admin (scoped by area).
- **Dependencies:** Reads/writes config consumed by all modules.
- **Future expansion:** Config versioning, environment cloning, policy-as-config.

#### A6. Audit Logs
- **Purpose:** Immutable record of security-, money-, and permission-relevant actions.
- **Features:** Who/what/when/where, before/after, filterable, exportable, tamper-evident.
- **Users:** Super Admin, Agency Owner, Admin (own tenant), Finance (financial subset).
- **Dependencies:** Subscribes to the event bus; every module emits audit events.
- **Future expansion:** SIEM export, anomaly detection, compliance reports (SOC2/GDPR).

---

### Domain B — Sales & Growth (CRM stack)

#### B1. CRM (Contacts & Accounts)
- **Purpose:** System of record for relationships (contacts, companies, activities).
- **Features:** Contact/company profiles, activity timeline, notes, tasks, segmentation.
- **Users:** Sales, Admin, Manager, Agency Owner.
- **Dependencies:** → User Management; feeds Leads, Proposals; emits to Analytics.
- **Future expansion:** Email sync, sequences, enrichment, lead scoring, marketing automation.

#### B2. Leads & Pipeline
- **Purpose:** Capture and progress opportunities from first touch to won/lost.
- **Features:** Lead inbox (from all site forms), source/UTM attribution, pipeline
  Kanban, stages, deal value & probability, SLA timers, win/loss reasons,
  **won → client + project** conversion.
- **Users:** Sales, Manager, Admin.
- **Dependencies:** → CRM, Marketing Website, Service Catalog; triggers Proposals,
  Projects, Onboarding.
- **Future expansion:** AI lead scoring, routing rules, forecasting, multi-pipeline.

#### B3. Proposal Generator
- **Purpose:** Turn a deal into a client-facing proposal.
- **Features:** Build from Service Catalog, scope/deliverables/price/timeline,
  client view with accept/decline + comments, versioning, templates.
- **Users:** Sales, Manager, Admin; viewed by Client.
- **Dependencies:** → Service Catalog, Pricing Engine, CRM; triggers Quotation, Contracts.
- **Future expansion:** AI-drafted proposals, interactive/branching scope, video intros.

#### B4. Quotation System
- **Purpose:** Formal priced quote with line items, taxes, discounts, validity.
- **Features:** Quote generation from proposal/catalog, versioning, approval, accept →
  order/invoice.
- **Users:** Sales, Finance, Admin; viewed by Client.
- **Dependencies:** → Pricing Engine, Service Catalog; triggers Orders/Checkout.
- **Future expansion:** Dynamic discounting rules, approval workflows, multi-currency.

#### B5. Contracts, E-Sign & Onboarding
- **Purpose:** Legally close the deal and kick off delivery.
- **Features:** SOW/contract generation, e-signature, deposit invoice on signature,
  onboarding checklist & intake forms, auto-project creation from template.
- **Users:** Admin, Manager, Finance; signed by Client.
- **Dependencies:** → Proposal, Quotation, Payments, Project Management, Files.
- **Future expansion:** Clause library, legal review workflow, template marketplace.

---

### Domain C — Commerce & Finance

#### C1. Service Catalog
- **Purpose:** Canonical list of sellable services/packages and their delivery templates.
- **Features:** Services, packages, add-ons, pricing models, deliverables, timelines,
  linked project templates, publish/unpublish.
- **Users:** Admin, Manager, Marketing; consumed by Website, Sales, Projects.
- **Dependencies:** → Pricing Engine; consumed widely.
- **Future expansion:** Productized-service store, bundles, regional catalogs, versioning.

#### C2. Pricing Engine
- **Purpose:** Compute prices consistently across quotes, checkout, and invoices.
- **Features:** Pricing models (fixed/tiered/retainer/hourly), add-ons, discounts,
  taxes, currency, promo codes, per-tenant rules.
- **Users:** System (called by others); configured by Admin/Finance.
- **Dependencies:** → Service Catalog; consumed by Proposal, Quotation, Checkout, Payments.
- **Future expansion:** Usage-based pricing, experiments, AI price optimization.

#### C3. Checkout
- **Purpose:** Convert an accepted quote/service into a paid order.
- **Features:** Cart/summary, tax & discount application, payment collection, deposits,
  self-serve purchase of productized services.
- **Users:** Client, Prospect (self-serve); Admin (assisted).
- **Dependencies:** → Pricing Engine, Payments, Orders.
- **Future expansion:** One-click reorder, saved payment methods, subscription checkout.

#### C4. Orders
- **Purpose:** System of record for purchases and their fulfillment state.
- **Features:** Order lifecycle, line items, status, links to project & invoices.
- **Users:** Admin, Finance, Manager; viewed by Client.
- **Dependencies:** → Checkout, Payments; triggers Project creation, Invoicing.
- **Future expansion:** Partial fulfillment, RMA/refund flows, order analytics.

#### C5. Payments & Billing
- **Purpose:** Collect money and track receivables.
- **Features:** Invoices (one-off, milestone, deposit, recurring/retainer), online
  payment, reminders, receipts, credit notes, taxes, multi-currency, AR reporting,
  **tenant subscription billing [SaaS]**.
- **Users:** Finance, Admin; paid by Client.
- **Dependencies:** → Pricing Engine, Orders, Project Management (milestones), provider webhooks.
- **Future expansion:** Dunning automation, revenue recognition, accounting sync, payouts to contractors.

---

### Domain D — Delivery (Project stack)

#### D1. Project Management
- **Purpose:** Delivery core connecting people, work, and clients.
- **Features:** Projects (from templates or blank), views (list/Kanban/timeline/calendar),
  budget & scope tracking, internal vs client-visible flags, templates.
- **Users:** Manager, Admin, Employees (assigned), Contractors (scoped); Client (curated view).
- **Dependencies:** → Service Catalog (templates), User Management; hosts Milestones, Tasks;
  feeds Live Tracking, AI PM, Billing, Analytics.
- **Future expansion:** Portfolio/program management, resource optimization, scenario planning.

#### D2. Milestones & Phases
- **Purpose:** Structure delivery into billable, trackable checkpoints.
- **Features:** Phases/milestones, client-visible flags, approval gates, milestone → invoice.
- **Users:** Manager, Admin; approved/viewed by Client.
- **Dependencies:** → Project Management; triggers Payments, Notifications.
- **Future expansion:** Milestone templates, dependency-driven scheduling.

#### D3. Tasks & Subtasks
- **Purpose:** Unit of work assignment and execution.
- **Features:** Assignments, priorities, estimates, dependencies, statuses, labels,
  subtasks, recurring tasks, comments, attachments.
- **Users:** Employees, Contractors, Manager, Admin.
- **Dependencies:** → Project Management, User Management; feeds Time Tracking, Live Tracking, AI PM.
- **Future expansion:** Automations/rules, workload balancing, sprint/agile boards.

#### D4. Time Tracking & Timesheets
- **Purpose:** Record effort for billing, costing, and capacity.
- **Features:** Timer + manual entry, weekly submission/approval, billable flags.
- **Users:** Employees, Contractors, Manager (approve), Finance (billing).
- **Dependencies:** → Tasks, Projects; feeds Payments, Analytics.
- **Future expansion:** Auto-tracking suggestions, utilization forecasting, cost rates.

#### D5. Live Progress Tracking
- **Purpose:** Real-time, data-driven project status for clients and internal teams.
- **Features:** % complete from tasks/milestones, current phase, blockers, ETA/health,
  client-safe narrative, real-time updates.
- **Users:** Client (curated), internal (full).
- **Dependencies:** → Tasks, Milestones, Projects; augmented by AI PM; emits Notifications.
- **Future expansion:** Predictive completion dates, risk heatmaps, live dashboards.

#### D6. File Manager & Assets
- **Purpose:** Central permissioned storage for all project artifacts.
- **Features:** Upload/version/organize by project/client/task, previews, brand asset
  library, deliverable hand-off, client-visible flags, expiring share links.
- **Users:** All (scoped to project permissions).
- **Dependencies:** → Object storage; linked from Projects, Tasks, Comments, Deliverables.
- **Future expansion:** Design-tool integrations, in-app annotation, DAM features.

#### D7. Comments & Collaboration
- **Purpose:** Contextual discussion attached to work items.
- **Features:** Threaded comments, @mentions, reactions, internal vs client-visible,
  attachments, resolution.
- **Users:** All (scoped).
- **Dependencies:** → Tasks, Projects, Deliverables, Files; emits Notifications, Activity Feed.
- **Future expansion:** Real-time co-editing, approval threads, AI summarization of threads.

#### D8. Activity Feed
- **Purpose:** Chronological stream of what happened, per scope (project/client/user).
- **Features:** Aggregated events, filters, per-role visibility.
- **Users:** All (scoped).
- **Dependencies:** Subscribes to event bus (nearly all modules emit).
- **Future expansion:** Digest summaries, saved views, cross-project timelines.

---

### Domain E — Engagement & Intelligence

#### E1. Notifications
- **Purpose:** Deliver the right message to the right person in the right channel.
- **Features:** In-app center, email; **[Phase 2]** Slack/WhatsApp/push; event-driven,
  per-user preferences, digests, role scoping.
- **Users:** All.
- **Dependencies:** Subscribes to event bus; uses Email/SMS providers.
- **Future expansion:** Smart batching, priority inbox, AI-summarized digests.

#### E2. AI Project Manager
- **Purpose:** Reduce PM overhead; monitor health; surface risk; draft comms.
- **Features:** Health/risk flags, status summaries, next-action suggestions, NL Q&A,
  client-comms drafting, meeting/notes summarization — human-in-the-loop.
- **Users:** Manager, Admin, Agency Owner (advisory); acts via approvals.
- **Dependencies:** → Projects, Tasks, Milestones, Time, Comments; via AI Orchestration Layer.
- **Future expansion:** Autonomous low-risk actions, resource optimization, predictive delivery.

#### E3. AI Sales Assistant
- **Purpose:** Accelerate the funnel — qualify, draft, recommend.
- **Features:** Lead scoring/qualification, proposal/quote drafting, next-best-action,
  reply drafting, catalog recommendations.
- **Users:** Sales, Manager, Admin.
- **Dependencies:** → CRM, Leads, Proposal, Service Catalog; via AI Orchestration Layer.
- **Future expansion:** Conversation intelligence, forecasting, automated nurture.

#### E4. AI Support Assistant
- **Purpose:** Deflect and accelerate client support.
- **Features:** Client-facing assistant grounded in project data + knowledge base,
  ticket triage/routing, response drafting, FAQ answers.
- **Users:** Client (self-serve), Support, Admin.
- **Dependencies:** → Support/Tickets, Projects, Files, Knowledge Base; via AI Orchestration Layer.
- **Future expansion:** Full agentic resolution for low-risk requests, multilingual support.

#### E5. Support & Tickets *(added — implied by "Support" role & flow)*
- **Purpose:** Post-delivery support, maintenance requests, and change orders.
- **Features:** Ticket lifecycle, SLAs, categories, linkage to projects, change-order → quote.
- **Users:** Client (raise), Support, Manager, Admin.
- **Dependencies:** → Projects, CRM, Notifications; feeds Quotation (change orders), Analytics.
- **Future expansion:** SLA automation, maintenance retainers, CSAT, knowledge base.

---

### Domain F — Content, Insight & Extensibility

#### F1. Portfolio CMS
- **Purpose:** Manage case studies powering the marketing site.
- **Features:** Case-study editor, categorization, featured ordering, draft/publish,
  generate-from-completed-project (with consent), SEO/media.
- **Users:** Admin, Manager, Marketing.
- **Dependencies:** → Marketing Website; optional source from Projects.
- **Future expansion:** Interactive case studies, results dashboards, video.

#### F2. Blog CMS
- **Purpose:** Content marketing engine.
- **Features:** Rich editor, categories/tags/authors, draft→review→schedule→publish,
  SEO, RSS/sitemap, AI-assisted drafting.
- **Users:** Admin, Manager, Marketing.
- **Dependencies:** → Marketing Website; optional AI Orchestration.
- **Future expansion:** Content calendar, SEO scoring, repurposing pipelines.

#### F3. Analytics
- **Purpose:** Operational metrics across marketing, sales, delivery, finance.
- **Features:** Event ingestion, dashboards per role, funnel/pipeline/delivery/financial
  lenses, drill-down.
- **Users:** Admin, Manager, Agency Owner, Finance; curated subset for Client.
- **Dependencies:** Subscribes to event bus; reads analytics store.
- **Future expansion:** Cohorts, custom metrics, warehouse export, embedded analytics **[SaaS]**.

#### F4. Reports
- **Purpose:** Curated, exportable/scheduled summaries for humans.
- **Features:** Client progress reports, financial statements, delivery reports,
  export (PDF/CSV), scheduling.
- **Users:** Admin, Manager, Finance; delivered to Client.
- **Dependencies:** → Analytics, Projects, Payments.
- **Future expansion:** Report builder, white-label reports, automated insights narration.

#### F5. Integrations
- **Purpose:** Connect AgencyOS to the outside world.
- **Features:** Provider connectors (payments, e-sign, email, storage, calendar, Slack),
  OAuth connection management, sync jobs, webhook receivers.
- **Users:** Admin, Agency Owner.
- **Dependencies:** → External providers; emits events into the bus.
- **Future expansion:** Integrations marketplace, Zapier/Make, iPaaS, partner apps.

#### F6. Public API & Webhooks
- **Purpose:** Programmatic access for customers and integrators.
- **Features:** REST/GraphQL API, API keys/OAuth, rate limits, outbound webhooks,
  versioning, docs.
- **Users:** Admin (keys), external developers **[SaaS]**.
- **Dependencies:** Exposes module contracts through the gateway.
- **Future expansion:** SDKs, developer portal, app platform, usage metering.

#### F7. Client / Admin / Employee Dashboards *(experience layer)*
- **Purpose:** Role-specific composed views over the modules — not data owners themselves.
- **Features:** Client (status, approvals, invoices, files); Admin (business command
  center, approvals, finance, people); Employee ("my work", time, calendar).
- **Users:** Client; Admin/Owner; Employees/Contractors.
- **Dependencies:** Read from many modules via their BFF; write via module contracts.
- **Future expansion:** Customizable widgets, saved layouts, mobile parity.

---

## 3. User Roles & Permissions

Roles combine a **scope** (platform vs tenant vs client) with a **capability set**.
Permissions are enforced by RBAC at the API layer plus **ownership/assignment** checks.

| Role | Scope | Core permissions | Cannot |
|------|-------|------------------|--------|
| **Super Admin** | Platform **[SaaS]** | Manage tenants, plans, platform config, impersonate (audited), platform-wide support | See tenant business data beyond support scope |
| **Agency Owner** | Tenant | Everything in own tenant: settings, roles, finance, people, delivery, sales | Cross-tenant access |
| **Admin** | Tenant | Operational admin: manage clients, projects, catalog, CMS, most settings | Change owner-only billing/plan, delete tenant |
| **Project Manager** | Tenant (assigned) | Own assigned clients/projects: plan, assign, track, approve, client comms, milestone invoices | Company-wide finance, HR, tenant settings |
| **Developer** | Tenant (assigned) | Work on assigned tasks/projects, log time, comment, upload deliverables | Manage clients/finance/other teams' work |
| **Designer** | Tenant (assigned) | Same as Developer, design-focused deliverables | Same exclusions as Developer |
| **Marketing Executive** | Tenant | Manage Blog/Portfolio CMS, marketing site content, campaigns, marketing analytics | Delivery internals, finance, client billing |
| **Sales Executive** | Tenant | CRM, leads, proposals, quotes; convert deals | Delivery execution, finance settings |
| **Finance** | Tenant | Invoices, payments, orders, financial reports, taxes | Delivery task management, CMS, HR beyond payroll data |
| **HR** | Tenant | User management, teams, availability, HR records | Client finance, delivery internals, sales data |
| **Support** | Tenant | Tickets, client comms, change-order intake, knowledge base | Finance, delivery admin, sales pipeline |
| **Contractor** | Tenant (scoped, time-boxed) | Only assigned tasks/projects + time | Everything else in the tenant |
| **Client Owner** | Client account | Full client-side: status, approvals, invoices/payment, requests, manage client collaborators | Any internal cost/margin/other clients |
| **Client Collaborator** | Client account | View/comment, limited approvals | Billing, managing users, internal data |
| **Guest / Prospect** | Public | Public site + shared links | Any authenticated data |

**Permission model notes**
- Roles are **composable**: a user may hold multiple roles (e.g., Manager + Designer).
- **Custom roles [SaaS]:** tenants can define roles from a permission primitive set.
- **Two enforcement axes:** *role* (what actions) × *scope/ownership* (which records).
- **Client-visibility flag** is an independent gate: even permitted internal users decide
  what a client sees per item; clients can never see internal-only content.

---

## 4. Complete User Flow (Master Lifecycle)

```
VISITOR ─▶ LEAD ─▶ QUALIFIED ─▶ PROPOSAL/QUOTE ─▶ CONTRACT+PAYMENT ─▶ CUSTOMER
   │         │         │              │                  │                │
 (Site)    (CRM)   (Pipeline)   (Proposal Gen)     (E-sign + Deposit)  (Onboarding)
                                                                          │
                                                                          ▼
                                                                  PROJECT CREATED
                                                                  (from template)
                                                                          │
                                                                          ▼
                                              PROJECT TRACKING ◀── AI PM monitors
                                              (tasks · milestones · time · live %)
                                                                          │
                                              milestone approved ─▶ MILESTONE INVOICE ─▶ PAID
                                                                          │
                                                                          ▼
                                                                     DELIVERY
                                                              (final approval + hand-off)
                                                                          │
                                                                          ▼
                                                                     SUPPORT
                                                              (tickets · change orders)
                                                                          │
                                                                          ▼
                                                                   MAINTENANCE
                                                          (retainer · recurring billing)
                                                                          │
                                                        change order ─▶ back to PROPOSAL/QUOTE (upsell loop)
```

**Stage-by-stage (what happens + which modules fire)**

1. **Visitor** — Marketing Website; Analytics captures behavior/source.
2. **Lead** — form → CRM/Leads with UTM; SLA timer starts; AI Sales Assistant scores.
3. **Qualified** — Sales works pipeline; activities logged in CRM.
4. **Proposal / Quote** — Proposal Generator + Pricing Engine + Quotation; client reviews.
5. **Contract + Payment** — Contracts/E-sign; deposit via Checkout/Payments; Order created.
6. **Customer** — Onboarding checklist; client account provisioned (Auth/User Mgmt).
7. **Project Created** — Project Management instantiates from Service Catalog template; team assigned.
8. **Project Tracking** — Tasks/Milestones/Time drive Live Tracking; AI PM watches health.
9. **Delivery** — Deliverables via Files; client approvals; milestone → invoice → paid.
10. **Support** — Support & Tickets; AI Support Assistant; change orders route to Quotation.
11. **Maintenance** — Retainers via recurring Payments; ongoing support; upsell loop back to Sales.

Throughout: **Notifications**, **Activity Feed**, **Audit Logs**, and **Analytics**
observe every transition.

---

## 5. Service-Specific Workflows

Each service reuses the master lifecycle but injects a **different project template**
(phases, milestones, roles, deliverables) at "Project Created."

### 5.1 Website Development
```
Discovery ─▶ Design (wireframe→UI) ─▶ Build (frontend/backend) ─▶ Content/SEO ─▶ QA ─▶ Launch ─▶ Support
```
- **Roles:** Manager, Designer, Developer, Marketing (SEO/content).
- **Milestones (billable):** Design sign-off · Development complete · Launch.
- **Client touchpoints:** wireframe approval, design approval, staging review, go-live.
- **Deliverables:** designs, staging URL, production site, handover docs.
- **Maintenance:** hosting/support retainer, iterative improvements.

### 5.2 App Development
```
Discovery/Specs ─▶ UX/UI Design ─▶ Architecture ─▶ Sprints (iterative build) ─▶ QA/Testing ─▶ Release ─▶ Support
```
- **Roles:** Manager, Designer, Developer(s), QA.
- **Milestones:** Spec sign-off · each Sprint/Release candidate · Store release.
- **Client touchpoints:** sprint demos, beta builds, release approval.
- **Deliverables:** designs, builds (iOS/Android/web), release notes, source hand-off.
- **Maintenance:** SLA support, version updates, feature retainers.

### 5.3 Digital Marketing
```
Audit/Strategy ─▶ Setup (channels/tracking) ─▶ Campaign Launch ─▶ Optimize (ongoing) ─▶ Report ─▶ Renew
```
- **Roles:** Manager, Marketing Executive(s), Designer (creatives).
- **Structure:** often **retainer** (recurring), not fixed milestones.
- **Client touchpoints:** strategy approval, creative approval, monthly reports.
- **Deliverables:** strategy docs, creatives, campaign dashboards, monthly reports.
- **Billing:** recurring monthly retainer + ad-spend pass-through.
- **AI leverage:** AI drafts content/reports; Analytics feeds performance.

### 5.4 Branding
```
Discovery/Research ─▶ Strategy ─▶ Identity Design ─▶ Guidelines ─▶ Asset Delivery ─▶ (optional) Rollout
```
- **Roles:** Manager, Designer(s), Strategist (Marketing).
- **Milestones:** Strategy sign-off · Concept approval · Final delivery.
- **Client touchpoints:** moodboard, concept presentations, revisions, final hand-off.
- **Deliverables:** brand strategy, logo suite, brand guidelines, asset kit.
- **Maintenance:** brand extensions, collateral requests (change orders).

### 5.5 AI Automation
```
Discovery/Process Audit ─▶ Solution Design ─▶ Build/Integrate ─▶ Test/Validate ─▶ Deploy ─▶ Monitor/Optimize
```
- **Roles:** Manager, Developer/AI Engineer, Analyst.
- **Milestones:** Solution design sign-off · Integration complete · Go-live.
- **Client touchpoints:** process mapping approval, pilot review, deployment approval.
- **Deliverables:** solution design, integrations/agents, documentation, monitoring dashboard.
- **Maintenance:** monitoring, tuning, usage-based or retainer billing.

> **Design implication:** the **Service Catalog** stores each of these as a reusable
> **project template** (phases, default tasks, roles, milestone→billing rules). Adding a
> new service = adding a template, not writing new code.

---

## 6. Inter-Module Communication

### 6.1 Communication patterns
AgencyOS uses **three** interaction styles, chosen deliberately per case:

1. **Synchronous contract calls (command/query):** when a caller needs an immediate
   result (e.g., Checkout asks Pricing Engine to compute a total). Module-to-module via
   published interfaces only — never direct table access.
2. **Asynchronous domain events (pub/sub):** when something *happened* and others may
   care but the emitter shouldn't wait (e.g., `InvoicePaid` → Notifications, Analytics,
   Live Tracking, Activity Feed, AI PM all react independently).
3. **Read models / projections:** dashboards and Analytics consume denormalized read
   projections built from events, so heavy read surfaces don't hammer write modules.

### 6.2 Canonical event examples (illustrative)
| Event | Emitted by | Reacted to by |
|-------|-----------|---------------|
| `LeadCaptured` | Marketing Website | CRM/Leads, Notifications, AI Sales, Analytics |
| `DealWon` | Leads | Contracts, Project Mgmt (create), Payments (deposit), Notifications |
| `ContractSigned` | Contracts | Payments, Project Mgmt, Onboarding, Audit |
| `ProjectCreated` | Project Mgmt | Notifications, Live Tracking, AI PM, Analytics, Activity Feed |
| `TaskUpdated` | Tasks | Live Tracking, AI PM, Activity Feed, Notifications |
| `MilestoneApproved` | Milestones | Payments (invoice), Notifications, Analytics |
| `InvoicePaid` | Payments | Orders, Live Tracking, Client Dashboard, Analytics, Audit |
| `TicketRaised` | Support | Notifications, AI Support, CRM, Analytics |
| `RiskFlagged` | AI PM | Notifications, Admin Dashboard, Activity Feed |

Every event also lands in **Audit Logs** (where security/finance-relevant) and the
**Analytics** ingestion pipeline.

### 6.3 The AI layer's place in communication
The **AI Orchestration Layer** subscribes to events (to know *when* to think) and calls
module **query/command contracts** (to *read* context and *propose* actions). Proposed
actions that affect clients or money are queued as **approvals**, not executed directly.

---

## 7. Module Dependency Diagram (text)

`A → B` reads "A depends on / consumes B". Foundation modules sit at the bottom.

```
                         ┌──────────────────────────────────────────────┐
   EXPERIENCE LAYER      │ Client DB · Admin DB · Employee DB · Reports  │
   (compose, own nothing)└──────────────────────────────────────────────┘
                                   │ read via BFF / write via contracts
      ┌────────────────────────────┼─────────────────────────────────────┐
      ▼                            ▼                                       ▼
 ┌─────────┐   ┌──────────────────────────────────┐   ┌────────────────────────────┐
 │  SALES  │   │           DELIVERY               │   │        AI LAYER            │
 │ CRM     │   │ Project Mgmt                     │   │ AI PM ──▶ Projects/Tasks   │
 │  └▶Leads│   │  ├▶ Milestones ──▶ Payments      │   │ AI Sales ─▶ CRM/Leads/Prop │
 │ Proposal│   │  ├▶ Tasks ──▶ Time Tracking      │   │ AI Support ─▶ Tickets/Files│
 │  ├▶Quote│   │  ├▶ Live Tracking (◀ AI PM)      │   │   (all via Orchestration)  │
 │  └▶Contract─▶ Onboarding ─▶ Project Mgmt        │   └────────────────────────────┘
 │         │   │  ├▶ Files · Comments · Activity   │
 └────┬────┘   └───────────────┬──────────────────┘
      │                        │
      ▼                        ▼
 ┌──────────────────────────────────────────────┐
 │              COMMERCE & FINANCE               │
 │ Service Catalog ─▶ Pricing Engine             │
 │ Checkout ─▶ Orders ─▶ Payments/Billing        │
 └───────────────────────┬──────────────────────┘
                         │
      ┌──────────────────┴───────────────────────────────────┐
      ▼                                                       ▼
 ┌──────────────────────────┐                    ┌──────────────────────────┐
 │  CONTENT & INSIGHT       │                    │   ENGAGEMENT             │
 │ Marketing Website ◀──────┼── Portfolio CMS    │ Notifications (◀ all)    │
 │  Blog CMS ─▶ Website      │   Analytics (◀ all)│ Activity Feed (◀ all)    │
 │ Integrations · Public API │   Reports ─▶Analytics│ Support & Tickets       │
 └──────────────────────────┘                    └──────────────────────────┘
      ▲                                                       ▲
      └───────────────────────────┬───────────────────────────┘
                                  │ everything depends on ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │  FOUNDATION (every module depends on these)                               │
 │  Organizations (Tenancy) · Auth · User Management · Settings · Audit Logs │
 │  Event Bus · Data/Storage · Notifications transport                       │
 └──────────────────────────────────────────────────────────────────────────┘
```

**Key dependency rules**
- Foundation modules depend on nothing above them (prevents cycles).
- Experience-layer dashboards **own no data** — they only compose other modules.
- The **event bus** breaks would-be cycles: e.g., Payments doesn't call Live Tracking;
  it emits `InvoicePaid` and Live Tracking reacts.
- **Analytics, Notifications, Activity Feed, Audit** are universal *subscribers* — many
  modules feed them, they feed back to almost none (no cycles).

---

## 8. Scalability Recommendations

1. **Tenant-scoped data by design.** Every table carries `tenant_id`; every query is
   tenant-filtered at the data-access layer (not per-query discipline). Start with a
   **shared database, shared schema, row-level isolation**; keep the door open to
   **schema-per-tenant** or **DB-per-large-tenant** for whales later.
2. **Stateless application tier.** Horizontal scaling behind the gateway; sessions/state
   in cache/DB, not in-process. Enables autoscaling and zero-downtime deploys.
3. **Read/write separation where it pays.** Heavy read surfaces (dashboards, analytics,
   live tracking) served from **read projections/caches**; writes go to owning modules.
4. **Async everything non-critical.** Emails, notifications, AI, analytics, webhooks,
   report generation run on **background workers** off a durable queue — the request path
   stays fast.
5. **Real-time via a dedicated channel.** Live Tracking/Notifications use websockets/SSE
   through a scalable pub/sub layer, decoupled from the request tier.
6. **Provider isolation via adapters.** Payments/e-sign/email/AI sit behind **adapter
   interfaces** so a provider can be swapped or regionalized without touching modules.
7. **Object storage + CDN for files.** Never serve large assets from the app tier; use
   signed URLs and edge caching.
8. **AI cost & latency controls.** Cache/summarize context, batch background AI work,
   set per-tenant usage budgets, and degrade gracefully when AI is slow/unavailable.
9. **Capacity guardrails per tenant [SaaS].** Rate limits, quotas, and fair-use policies
   prevent a noisy tenant from degrading others.

---

## 9. Maintainability Recommendations

1. **Modular monolith with enforced boundaries.** One deployable, but modules only touch
   each other through published contracts. Lint/architecture tests fail the build on
   boundary violations. This buys microservice-like decoupling without the ops tax.
2. **Contracts before code.** Each module publishes an interface + event catalog; teams
   integrate against contracts. This is what makes later **service extraction** cheap.
3. **Ubiquitous language / DDD.** Names in code = names in this doc = names sales/ops use.
   Reduces translation errors across teams.
4. **Templates over hard-coding.** Services, projects, proposals, emails, reports are
   **data-driven templates** — new offerings ship as configuration, not deployments.
5. **Feature flags + config-as-data.** Roll out per tenant/role safely; decouple deploy
   from release.
6. **Test pyramid + contract tests.** Unit for logic, contract tests at module seams,
   a thin layer of end-to-end for the master lifecycle. Prioritize money/permission paths.
7. **Observability as a feature.** Structured logs, traces, metrics, and the Audit Log
   are first-class; every event is traceable end-to-end.
8. **Documentation lives with the module.** Each module owns its README/contract/runbook;
   this blueprint is the map, modules hold the detail.

---

## 10. Future SaaS Expansion Recommendations

1. **Flip the tenancy switch, don't rebuild it.** Because tenancy is baked in, going
   public means enabling **self-serve tenant sign-up**, plan selection, and subscription
   billing — not re-architecting.
2. **Tiered plans + entitlements engine.** Gate modules/limits by plan via a central
   entitlements service reading Settings/Organizations. Upsell = flip an entitlement.
3. **Per-tenant branding & custom domains.** White-label marketing sites and portals;
   automated SSL; theme tokens per tenant.
4. **Onboarding & activation funnel.** Guided tenant onboarding, sample data, time-to-
   value instrumentation — critical for SaaS retention.
5. **Super Admin control plane.** Tenant management, impersonation (audited), feature
   flags, usage/billing oversight, health monitoring, support tooling.
6. **Public API + Integrations marketplace.** Turn F5/F6 into an ecosystem: partner apps,
   Zapier/Make, developer portal, SDKs, usage metering.
7. **Template & service marketplace.** Let agencies buy/sell project templates, proposal
   templates, and automations — network effects.
8. **Data isolation & compliance posture.** SOC2/GDPR readiness, regional data residency,
   DPA tooling, per-tenant export/delete — table stakes for enterprise SaaS.
9. **Usage-based & seat-based billing.** Meter AI usage, storage, seats; support hybrid
   pricing as the product grows.
10. **Platform reliability SLOs.** Formal SLAs, status page, incident process, backup/DR
    per region — what enterprise buyers demand.

---

## 11. Product Improvement Opportunities (architect's additions)

Beyond the requested scope, these strengthen the product and were folded into the design:

- **Support & Tickets module (E5)** — the flow demands a "Support" and "Maintenance"
  stage and a Support role, but no ticketing module was listed. Added explicitly.
- **Onboarding as a first-class step** — the gap between "paid" and "project running"
  is where agencies lose momentum; modeled as a checklist + intake, not an afterthought.
- **Change-order upsell loop** — Support change requests route back into Quotation,
  turning maintenance into recurring revenue.
- **Read-projection experience layer** — dashboards own no data, which keeps modules
  clean and dashboards fast.
- **Entitlements engine** — introduced now so plan-gating (SaaS) is trivial later.
- **Knowledge Base** (implied by AI Support) — grounds the AI assistants and deflects
  support load; recommended as a light content store within Content & Insight.
- **Approvals as a shared primitive** — proposals, invoices, timesheets, deliverables,
  and AI-suggested actions all use one **approval** concept, reducing bespoke workflows.

---

## 12. Open Architectural Decisions (to ratify next)

1. **Tenancy isolation tier for v1** — shared-schema row-level (recommended start) vs
   schema-per-tenant. (Row-level now; large-tenant carve-outs later.)
2. **Sync vs async boundaries** — confirm which cross-module calls are commands vs events.
3. **Real-time transport** — websockets vs SSE vs managed pub/sub.
4. **AI autonomy ceiling for v1** — advisory-only (recommended) vs limited auto-actions.
5. **Build vs buy** per provider category (payments, e-sign, email, search, analytics).
6. **Deployment target & regions** — single region v1; multi-region readiness for SaaS.

---

*End of Architecture Blueprint v1.0. Next artifacts (only after sign-off): Information
Architecture & navigation map, Data Model / schema, RBAC permission specification, and
the module contract/event catalog. No code until this blueprint is approved.*
