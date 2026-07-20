# AgencyOS — Product Requirements Document (PRD)

**Product name (working):** AgencyOS
**Public brand:** Meridian Agency
**Document version:** 1.0
**Status:** Draft for review
**Last updated:** 2026-07-11
**Owner:** Founder / Product
**Author:** Product & Engineering

---

## 0. How to read this document

This PRD defines the **complete product vision** for AgencyOS. It is intentionally
comprehensive so it can act as the single source of truth for scope, roles, flows,
and roadmap. It does **not** contain code, schemas, or final UI designs — those live
in downstream design and technical specs.

Anything marked **[Phase 2+]** or **[SaaS]** is deliberately out of scope for the
first build and is captured here only so today's decisions don't block tomorrow's.

---

## 1. Vision & Positioning

### 1.1 One-line vision
> AgencyOS is the operating system that runs a digital agency end-to-end — from the
> first marketing click to the final invoice — replacing a stack of 8–10 disconnected
> SaaS tools with one connected, AI-assisted platform.

### 1.2 The problem
A modern agency today juggles a fragmented toolchain:

- Marketing site (Webflow / WordPress)
- CRM (HubSpot / Pipedrive)
- Project management (Notion / Asana / ClickUp / Jira)
- Client communication (Email / Slack / WhatsApp)
- File sharing (Google Drive / Dropbox)
- Proposals & contracts (PandaDoc / DocuSign)
- Invoicing & payments (Stripe / QuickBooks / Razorpay)
- Time tracking (Toggl / Harvest)
- Analytics (GA / spreadsheets)

The cost of this fragmentation: data silos, manual re-entry, no single view of a
client, poor client experience, revenue leakage, and hours lost to admin.

### 1.3 The solution
A single platform where a **lead** becomes a **deal**, a deal becomes a **signed
project**, a project runs through **live-tracked delivery** with an **AI Project
Manager** watching health, and delivery flows straight into **invoicing and payment**
— with every stakeholder (client, admin, employee) seeing exactly the view they need.

### 1.4 Why now
- AI can now meaningfully automate PM overhead (status, risk, summaries, next-actions).
- Clients expect a real-time, self-serve portal, not weekly status emails.
- The existing Meridian marketing site is the natural front door and proof point.
- A well-built internal OS is itself a productizable **SaaS** for other agencies.

### 1.5 What AgencyOS is *not*
- Not a generic no-code app builder.
- Not an accounting/ERP replacement (it integrates, it doesn't replace bookkeeping).
- Not a chat app — communication is contextual, attached to projects/tasks.

---

## 2. Business Goals & Success Metrics

### 2.1 Business goals
| # | Goal | Why it matters |
|---|------|----------------|
| B1 | Convert the marketing site into a measurable lead engine | Top of funnel drives revenue |
| B2 | Cut agency admin/PM overhead by 30%+ via automation & AI | Margin |
| B3 | Deliver a premium, real-time client experience | Retention, referrals, upsell |
| B4 | Create a single source of truth for clients, projects & money | Fewer errors, faster decisions |
| B5 | Reduce revenue leakage (missed invoices, scope creep) | Cash flow |
| B6 | Build on a multi-tenant foundation to later sell AgencyOS as SaaS | New revenue line |

### 2.2 Product success metrics (North Star + supporting)
- **North Star:** *Active projects delivered on-time & on-budget per quarter.*
- **Funnel:** visitor → lead → qualified → proposal → won conversion rates.
- **Time-to-first-value:** signup → first project live (client) / first task (employee).
- **Client engagement:** % of clients logging into the dashboard weekly.
- **Delivery health:** % projects "green" per AI PM; average slippage days.
- **Financial:** invoice cycle time, % invoices paid on time, MRR/ARR **[SaaS]**.
- **Adoption:** DAU/WAU of employee dashboard; automation actions accepted.

### 2.3 Non-goals for v1
- Native mobile apps (responsive web only in v1).
- Full accounting/ledger (integrate accounting, don't rebuild it).
- Public multi-tenant sign-up (architecture ready, not exposed).

---

## 3. Target Users & Personas

| Persona | Role | Primary jobs-to-be-done |
|---------|------|-------------------------|
| **Prospect / Visitor** | Potential client browsing the site | Understand offering, trust the agency, request a quote |
| **Client (Owner/Stakeholder)** | Paying customer | See progress, approve work, pay invoices, request changes |
| **Client Collaborator** | Client-side team member | View & comment, limited approvals |
| **Founder / Admin** | Agency owner/ops | Run the whole business: sales, delivery, finance, people |
| **Project Manager / Account Manager** | Delivery lead | Own projects, clients, timelines, communication |
| **Employee / Team Member** | Designer, dev, marketer | Do assigned work, log time, update tasks |
| **Contractor / Freelancer** | External team | Scoped access to specific projects/tasks |
| **AI Project Manager** | System agent | Monitor health, summarize, flag risk, suggest actions |
| **Super Admin** | Platform operator **[SaaS]** | Manage tenants, billing, platform config |

---

## 4. User Roles & Permissions (RBAC)

AgencyOS uses **role-based access control** with a future **tenant** boundary.

### 4.1 Roles
1. **Super Admin** *(platform)* **[SaaS]** — manages all tenants.
2. **Agency Admin / Owner** — full control within their agency (tenant).
3. **Manager (PM/AM)** — manage assigned clients, projects, teams.
4. **Employee** — work on assigned projects/tasks.
5. **Contractor** — scoped, time-boxed access.
6. **Client Owner** — full client-side visibility + approvals + billing.
7. **Client Collaborator** — read/comment, limited approvals.
8. **Guest / Prospect** — public + shared links only.

### 4.2 Permission matrix (representative, not exhaustive)
| Capability | Super Admin | Admin | Manager | Employee | Contractor | Client Owner | Client Collab |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Manage tenants/billing (platform) | ✅ | — | — | — | — | — | — |
| Manage agency settings & members | — | ✅ | — | — | — | — | — |
| View all clients & projects | — | ✅ | assigned | assigned | assigned | own | own |
| Create/edit projects | — | ✅ | ✅ | — | — | — | — |
| Assign tasks | — | ✅ | ✅ | self | — | — | — |
| Log time | — | ✅ | ✅ | ✅ | ✅ | — | — |
| Create invoices | — | ✅ | ✅ | — | — | — | — |
| Pay invoices | — | — | — | — | — | ✅ | — |
| Approve deliverables | — | ✅ | ✅ | — | — | ✅ | limited |
| Manage CMS (portfolio/blog) | — | ✅ | ✅ | contribute | — | — | — |
| View financial reports | — | ✅ | limited | — | — | own | — |
| Configure AI PM rules | — | ✅ | ✅ | — | — | — | — |

> Legend: ✅ full · limited/assigned/own = scoped · — = none.
> Final matrix to be ratified in the technical RBAC spec.

---

## 5. Product Scope — Modules Overview

AgencyOS is composed of the following modules. Each is detailed in Section 6.

| # | Module | Primary users | Phase |
|---|--------|---------------|:-----:|
| M1 | Marketing Website | Prospects | 1 |
| M2 | Authentication & Identity | All | 1 |
| M3 | CRM | Admin, Manager | 1 |
| M4 | Service Catalog | Admin, Prospect, Client | 1 |
| M5 | Proposals, Contracts & Onboarding | Admin, Manager, Client | 1–2 |
| M6 | Client Dashboard | Client | 1 |
| M7 | Admin Dashboard | Admin | 1 |
| M8 | Employee Dashboard | Employee, Manager | 1 |
| M9 | Project Management | All internal | 1 |
| M10 | Live Project Tracking | Client, internal | 1–2 |
| M11 | AI Project Manager | System, internal | 2 |
| M12 | Payments & Billing | Admin, Client | 1–2 |
| M13 | Portfolio CMS | Admin, Manager | 1 |
| M14 | Blog CMS | Admin, Manager | 1 |
| M15 | Notifications | All | 1 |
| M16 | Analytics & Reporting | Admin, Manager, Client | 1–2 |
| M17 | Files & Assets | All | 1 |
| M18 | Multi-tenant SaaS layer | Super Admin | 3 |

---

## 6. Module Requirements (Detailed)

### M1 — Marketing Website
**Purpose:** The public front door and lead engine. (Builds on the existing Meridian site.)

**Features**
- Home, Services, Work/Portfolio, Pricing, Process, Industries, About, Careers, Blog, Contact.
- Dynamic pages driven by **Service Catalog**, **Portfolio CMS**, and **Blog CMS**.
- Lead capture: contact form, quote request, newsletter, careers application.
- SEO: metadata, sitemap, robots, OpenGraph, structured data, performance budget.
- Analytics + conversion tracking; A/B-test-ready hero/CTA.
- Clear entry points to **Login / Client Portal**.

**Requirements**
- Every lead form writes directly into the **CRM** (no dead-end forms).
- Editable by non-devs via CMS where practical.
- Fast (Core Web Vitals green), accessible (WCAG 2.1 AA target).

---

### M2 — Authentication & Identity
**Purpose:** Secure sign-in and role-aware access for all portals.

**Features**
- Email/password + magic link; **SSO/OAuth** (Google) for internal team.
- Role-based redirect to the correct dashboard after login.
- Client invitation flow (admin invites → client sets password).
- 2FA (at least for Admin/Manager), session management, password reset.
- Audit log of security-relevant events.

**Requirements**
- Least-privilege by default; every route guarded by role + ownership.
- Tenant-aware from day one (single tenant now, many later) **[SaaS]**.

---

### M3 — CRM
**Purpose:** Manage the relationship from first touch to signed client.

**Entities:** Leads, Contacts, Companies/Accounts, Deals/Opportunities, Activities.

**Features**
- Lead inbox from all site forms; source & UTM attribution.
- Pipeline (Kanban) with stages: New → Qualified → Proposal → Negotiation → Won/Lost.
- Contact & company profiles with full activity timeline.
- Notes, tasks, reminders, follow-ups; email/activity logging.
- Deal value, probability, expected close; win/loss reasons.
- Conversion of a **Won** deal → **Client + Project** in one action.

**Requirements**
- No lead leakage: every inbound lands here with an owner and SLA timer.
- Reporting: pipeline value, conversion by stage/source, velocity.

---

### M4 — Service Catalog
**Purpose:** The definitive list of what the agency sells; powers site + proposals.

**Features**
- Services & packages with descriptions, deliverables, pricing models
  (fixed, tiered, retainer, hourly), add-ons, and estimated timelines.
- Reusable project templates linked to each service (tasks, milestones, roles).
- Publish/unpublish to marketing site; feature flags for promos.

**Requirements**
- Single source of truth reused by Marketing (M1), Proposals (M5), and Project templates (M9).

---

### M5 — Proposals, Contracts & Onboarding
**Purpose:** Turn a deal into a signed, paid, kicked-off project.

**Features**
- Proposal builder from Service Catalog (scope, deliverables, price, timeline).
- Client-facing proposal view with accept/decline + comments.
- Contracts / SOW with **e-signature**; versioning.
- Deposit/first invoice on signature.
- Onboarding checklist & intake forms (brand assets, access, questionnaires).

**Requirements**
- On acceptance: auto-create project from template, notify team, trigger deposit invoice.

---

### M6 — Client Dashboard
**Purpose:** The premium, real-time client experience.

**Features**
- Overview: project status, next milestone, pending approvals, outstanding invoices.
- **Live project tracking** (see M10): timeline, % complete, current phase.
- Deliverables review & approval; threaded feedback.
- Files & brand assets; shared documents.
- Invoices & payment history; pay online.
- Requests / change orders; support/messaging.
- Notifications & activity feed scoped to their account.

**Requirements**
- Client sees only their own data; zero internal noise (costs, margins, other clients).
- Mobile-responsive; feels like a product, not a spreadsheet.

---

### M7 — Admin Dashboard
**Purpose:** Command center for running the agency.

**Features**
- Business overview: revenue, pipeline, active projects, utilization, cash.
- Manage clients, projects, team, contractors, services, CMS, finance.
- Approvals queue (proposals, invoices, time, deliverables).
- Team capacity & resource planning; assign/reassign.
- Financials: invoices, payments, expenses, profitability per project/client.
- Settings: roles, permissions, integrations, branding, automation & AI rules.

**Requirements**
- Full visibility across every module; drill-down from KPI to record.
- Every destructive action is logged and reversible where feasible.

---

### M8 — Employee Dashboard
**Purpose:** A focused workspace for the people doing the work.

**Features**
- "My work": assigned tasks across projects, priorities, due dates.
- Task detail: subtasks, comments, files, dependencies, status.
- **Time tracking / timesheets** (timer + manual); weekly submission.
- Personal calendar & workload; availability.
- Notifications & mentions; personal productivity view.
- Limited client-safe communication (routed through project threads).

**Requirements**
- Employees see only assigned projects/clients (or per role).
- Time entries feed billing (M12) and analytics (M16).

---

### M9 — Project Management
**Purpose:** The delivery core connecting people, work, and clients.

**Entities:** Projects, Milestones/Phases, Tasks, Subtasks, Dependencies, Time entries, Comments, Files.

**Features**
- Projects created from Service Catalog templates or blank.
- Views: List, Kanban board, Timeline/Gantt, Calendar.
- Milestones/phases with client-visible vs internal flags.
- Assignments, priorities, estimates, dependencies, statuses, labels.
- Comments, @mentions, attachments, activity history.
- Recurring tasks; templates; bulk actions.
- Budget & scope tracking (hours/cost vs estimate).

**Requirements**
- Clear separation of **internal** vs **client-visible** content on every item.
- Data model powers Live Tracking (M10) and AI PM (M11).

---

### M10 — Live Project Tracking
**Purpose:** Real-time, transparent status for clients and internal teams.

**Features**
- Live progress (% complete) derived from tasks/milestones.
- Current phase, upcoming milestone, and what's blocking.
- Real-time updates (websockets/live refresh) without manual reports.
- Client-facing status view with a curated, jargon-free narrative.
- Activity stream; milestone celebrations; ETA/health indicator.

**Requirements**
- Never expose internal cost/margin/private notes to clients.
- "Truthful" status — driven by data, augmented (not fabricated) by AI PM.

---

### M11 — AI Project Manager
**Purpose:** Reduce PM overhead and catch risk early with an always-on assistant.
Built on the latest Claude models (e.g. Claude Opus / Sonnet family).

**Features**
- **Health monitoring:** flags at-risk projects (slippage, budget burn, stale tasks, blockers).
- **Status summaries:** auto-drafts client-safe updates & internal standup summaries.
- **Next actions:** suggests reassignments, deadline changes, follow-ups.
- **Q&A:** natural-language queries ("What's blocking Project X?", "Who's overloaded?").
- **Client comms drafting:** proposes replies/updates for human approval.
- **Meeting/notes summarization** and task extraction.
- Configurable rules & thresholds; human-in-the-loop approvals.

**Requirements**
- **Advisory, not autonomous** in v1 — humans approve external actions.
- Explainable: every flag links to the underlying data.
- Respects role boundaries and never leaks cross-client data.
- Guardrails, audit trail, and opt-out per project.

---

### M12 — Payments & Billing
**Purpose:** Get the agency paid, on time, with minimal manual work.

**Features**
- Invoices: one-off, milestone-based, deposits, recurring **retainers**.
- Online payment (cards, bank, wallets) via provider (e.g. Stripe / Razorpay).
- Auto-invoice on milestone completion or schedule; reminders for overdue.
- Client billing portal: view/pay/download invoices & receipts.
- Taxes, discounts, credit notes, multi-currency (basic).
- Financial reporting: AR, paid vs outstanding, revenue by client/project.
- **Subscription billing for tenants** **[SaaS, Phase 3]**.

**Requirements**
- Payment status syncs to Client & Admin dashboards in real time.
- Integrate with accounting export; do not become the ledger of record.
- PCI handled by provider; no raw card data stored.

---

### M13 — Portfolio CMS
**Purpose:** Manage case studies / work that power the marketing site.

**Features**
- Case study editor: hero, problem, solution, results/metrics, gallery, tech, testimonial.
- Categorization by industry/service; featured ordering; draft/publish.
- Optionally generate a case study from a **completed project** (with client consent).
- SEO fields; media management.

**Requirements**
- Publishing to the site is instant and non-technical.

---

### M14 — Blog CMS
**Purpose:** Content marketing engine.

**Features**
- Rich editor (headings, media, code, embeds); categories, tags, authors.
- Draft → review → schedule → publish workflow.
- SEO metadata, OG images, canonical URLs, related posts.
- Optional AI-assisted drafting/outlining and repurposing.

**Requirements**
- Powers `/blog` on the marketing site; RSS/sitemap included.

---

### M15 — Notifications
**Purpose:** Keep everyone informed at the right moment, in the right channel.

**Features**
- In-app notification center + activity feed.
- Email notifications; digest options; **[Phase 2]** Slack/WhatsApp/push.
- Event-driven: assignments, mentions, approvals, invoices, status changes, AI PM alerts.
- Per-user preferences (channel, frequency, mute).

**Requirements**
- Role-scoped; clients never receive internal events.
- Central, extensible event bus so any module can emit notifications.

---

### M16 — Analytics & Reporting
**Purpose:** Turn operational data into decisions.

**Features**
- **Marketing analytics:** traffic, sources, funnel, form conversion.
- **Sales analytics:** pipeline, conversion, win/loss, forecast.
- **Delivery analytics:** on-time %, utilization, throughput, cycle time, project health.
- **Financial analytics:** revenue, AR, profitability per project/client.
- **Client-facing reports:** progress & value summaries.
- Dashboards per role; export (CSV/PDF); scheduled reports **[Phase 2]**.

**Requirements**
- Every metric drills down to source records; consistent definitions.

---

### M17 — Files & Assets
**Purpose:** Central, permissioned storage for all project artifacts.

**Features**
- Upload/version/organize files by project, client, task.
- Brand asset library; deliverable hand-off; client-visible flag.
- Previews, comments, approvals on assets.

**Requirements**
- Access mirrors project permissions; secure, expiring share links.

---

### M18 — Multi-tenant SaaS Layer **[Phase 3]**
**Purpose:** Sell AgencyOS to other agencies.

**Features**
- Tenant isolation (agencies), per-tenant branding/domains.
- Tenant onboarding, plans, subscription billing, usage limits.
- Super Admin console: tenant management, feature flags, support.
- Data residency & isolation guarantees.

**Requirements**
- Architecture (tenant scoping, RBAC, data model) must be **designed for this from day one**,
  even though the layer ships last.

---

## 7. Key User Flows

### 7.1 Prospect → Client (Sales)
1. Visitor lands on marketing site → explores Services/Work/Pricing.
2. Submits **quote request** → creates a **Lead** in CRM (with source/UTM).
3. Manager qualifies → builds **Proposal** from Service Catalog.
4. Client reviews proposal → accepts + **e-signs** contract.
5. **Deposit invoice** auto-generated & paid.
6. System auto-creates **Project** from template; client account provisioned.
7. Client receives portal invite → onboarding checklist.

### 7.2 Project delivery (Internal)
1. Admin/Manager configures project (team, milestones, budget).
2. Tasks assigned → employees work, **log time**, update status.
3. **Live Tracking** reflects progress automatically.
4. **AI PM** monitors health, flags risks, drafts updates.
5. Milestone completed → deliverable submitted for **client approval**.
6. Approval triggers **milestone invoice**.

### 7.3 Client experience
1. Client logs in → sees status, next milestone, pending approvals, invoices.
2. Reviews deliverable → approves or requests changes (threaded feedback).
3. Pays invoice in-portal → status updates everywhere in real time.
4. Submits change request → routed to CRM/PM as scope item.

### 7.4 Employee daily flow
1. Login → "My Work" (tasks by priority/due date).
2. Start timer / update task / comment / attach files.
3. Submit weekly timesheet → feeds billing & analytics.

### 7.5 Admin oversight
1. Login → business overview (revenue, pipeline, project health, utilization).
2. Clears approvals queue; reassigns capacity; reviews AI PM flags.
3. Reviews financials & reports; manages team, services, CMS.

### 7.6 AI PM assist
1. AI PM detects slippage/blocker/budget burn → creates a **flag**.
2. Notifies Manager with explanation + suggested action.
3. Human accepts/edits/dismisses; external actions require approval.

---

## 8. Non-Functional Requirements

- **Security:** RBAC everywhere, least privilege, encryption in transit & at rest,
  audit logs, 2FA for privileged roles, secure file sharing, PCI via provider.
- **Privacy & compliance:** GDPR-aware data handling, consent for using client work
  in portfolio, data export/delete; region-aware **[SaaS]**.
- **Performance:** Marketing Core Web Vitals green; dashboard interactions < 300ms
  perceived; real-time updates for tracking/notifications.
- **Reliability:** target 99.9% uptime for portals; graceful degradation if AI is down.
- **Scalability:** tenant-scoped data model; horizontal scaling; background jobs/queues.
- **Accessibility:** WCAG 2.1 AA target across public + app.
- **Observability:** logging, metrics, error tracking, alerting.
- **AI safety:** human-in-the-loop, guardrails, no cross-client leakage, audit trail.
- **Maintainability:** modular architecture, clear module boundaries, documented APIs.

---

## 9. Assumptions, Constraints & Dependencies

- Builds on the existing **Next.js (App Router) + React + Tailwind** stack; the current
  Meridian marketing site becomes M1 — **no existing pages are removed or refactored** as
  part of this PRD.
- Third-party providers for **payments** (Stripe/Razorpay), **e-sign**, **email**, and
  **AI** (Claude) will be integrated rather than built.
- v1 is **web-responsive** (no native apps).
- Single agency (single tenant) in v1; multi-tenant is a Phase 3 expansion.

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope too large for one build | Delivery stalls | Strict phasing (Sec. 11); ship MVP per module |
| Multi-tenant retrofit is costly | Rework | Design tenant scoping into the data model on day one |
| AI PM gives wrong/risky advice | Trust, errors | Advisory-only, human approval, explainability |
| Client/internal data leakage | Severe | Enforce client-visible flags + RBAC tests |
| Payment/compliance complexity | Legal/financial | Use certified providers; don't store card data |
| Feature creep in dashboards | Slow, cluttered | Role-focused MVP views; measure before adding |

---

## 11. Release Plan & Roadmap

> Phasing is about **sequencing**, not commitment to dates. Each phase is shippable.

### Phase 0 — Foundation
- Finalize this PRD, information architecture, data model (tenant-aware), RBAC spec, design system.
- Keep existing marketing site live and untouched.

### Phase 1 — MVP: "Lead to Delivery to Paid"
- M1 Marketing (existing) wired to **M3 CRM** (lead capture, pipeline).
- **M2 Auth** + role-based portals.
- **M4 Service Catalog**, basic **M5 Proposals** (accept + deposit).
- **M6/M7/M8** Dashboards (core views).
- **M9 Project Management** + **M10 Live Tracking** (baseline).
- **M12 Payments** (invoices + online pay).
- **M13/M14 CMS**, **M15 Notifications** (in-app + email), **M17 Files**.

### Phase 2 — Intelligence & Depth
- **M11 AI Project Manager** (health, summaries, Q&A, comms drafting).
- Advanced **M10** real-time + **M16 Analytics** (all lenses).
- **M5** full contracts/e-sign/onboarding automation.
- Retainers & recurring billing; extended notifications (Slack/WhatsApp/push).
- Time tracking depth, capacity planning, forecasting.

### Phase 3 — Multi-tenant SaaS
- **M18** tenant isolation, Super Admin, subscription billing, per-tenant branding/domains.
- Public sign-up, plans, onboarding, usage limits.
- Marketplace of templates/integrations **[future]**.

### Phase 4+ — Future vision
- Native mobile apps; client mobile portal.
- Deeper AI (autonomous low-risk actions, predictive forecasting, resource optimization).
- Integrations marketplace (Slack, Google, accounting, design tools).
- White-label, API/webhooks platform, partner ecosystem.

---

## 12. Open Questions (to resolve before build)

1. **Payment provider(s)** and target market/currencies (Stripe vs Razorpay vs both)?
2. **Backend/data approach** (e.g., managed Postgres + Prisma, Supabase, or other) — to be decided in the technical spec.
3. E-signature and email providers?
4. Extent of AI PM autonomy acceptable in v1?
5. Which modules are truly must-have for the very first usable release vs fast-follow?
6. Branding: is the SaaS product name "AgencyOS" or does Meridian stay the umbrella brand?
7. Do we migrate existing marketing content into the new CMS, or keep as code initially?

---

## 13. Glossary

- **AgencyOS** — the platform product (internal + future SaaS).
- **Tenant** — an isolated agency account within the SaaS layer.
- **Client-visible flag** — marks whether a project item is exposed to clients.
- **AI PM** — the AI Project Manager agent.
- **Live Tracking** — real-time, data-driven project status.
- **Service Catalog** — canonical list of sellable services/packages and templates.

---

*End of PRD v1.0 — for review. Next steps: ratify scope for Phase 1, then produce the
Information Architecture, Data Model, RBAC spec, and UI/UX designs. No code until scope is signed off.*
