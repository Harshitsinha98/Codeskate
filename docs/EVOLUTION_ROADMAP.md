# AgencyOS — Evolution & Implementation Roadmap

**Companion to:** `PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`, `BACKEND.md`, `DESIGN_SYSTEM.md`, `FRONTEND_AUDIT_AND_MIGRATION.md`
**Document version:** 1.0
**Status:** Draft for review — **NO CODE, NO FILE MODIFICATIONS**
**Perspective:** Principal Architect · Staff Frontend Engineer · Product Strategy
**Last updated:** 2026-07-11

> **Prime directive (unchanged):** the existing premium marketing site is **extended, never
> replaced**. This document designs *how* it grows — layer by layer, route by route — into the full
> AgencyOS platform, with the marketing site preserved intact as Layer 1.

---

## 1. The Three-Layer Model

AgencyOS is one product composed of three layers that share a design system, a domain model, and
an API — but serve different users and load different shells.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ LAYER 1 — MARKETING WEBSITE        (public · exists today · preserved)     │
│   Home · About · Services · Portfolio · Blog · Pricing · Contact           │
│   Shell: Lenis + Cursor + Nav + Footer  ·  Motion-rich, conversion-focused │
└───────────────┬──────────────────────────────────────────────────────────┘
                │ lead capture · checkout entry · login link
                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ LAYER 2 — BUSINESS PLATFORM        (authenticated · to build)              │
│   Auth · Client / Admin / Employee dashboards · Projects · CRM · Catalog   │
│   Payments · Invoices · Files · Notifications                              │
│   Shell: lean app shell (NO Lenis/Cursor) · fast, keyboard-first           │
└───────────────┬──────────────────────────────────────────────────────────┘
                │ reads context · proposes actions · human approves
                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ LAYER 3 — AI PLATFORM              (augmentation · to build)               │
│   AI PM · AI Sales · AI Proposal Gen · AI Pricing · AI Support · KB AI      │
│   Surface: embedded panels + command palette · advisory, human-in-the-loop │
└──────────────────────────────────────────────────────────────────────────┘
```

### Layer 1 — Marketing Website
- **Purpose:** the public front door and lead engine; establish trust, communicate offering, convert
  visitors into leads/checkouts. **This is what exists today — unchanged.**
- **Users:** Visitors, Prospects (unauthenticated).
- **Pages:** Home, About/Studio, Services (+ detail), Work/Portfolio (+ case study), Blog (+ post),
  Pricing, Process, Industries, Careers, Contact, Privacy, Terms.
- **Navigation:** public top nav (Services mega, Work, Studio, Process, Pricing) + footer + a new
  **"Log in" / "Client portal"** entry (the only visible seam to Layer 2).
- **Dependencies:** Service Catalog & CMS (already static via `config/`; later fed by the backend),
  CRM (lead capture target).
- **Future expansion:** per-tenant white-label marketing sites, A/B testing, localization, custom
  domains **[SaaS]**.

### Layer 2 — Business Platform
- **Purpose:** run the agency and serve clients — the operating system. Turns a paid engagement into
  tracked delivery with full transparency.
- **Users:** Client Owner/Collaborator, Agency Owner/Admin, Manager, Employee, Contractor, Finance,
  Support (roles per `ARCHITECTURE.md §3`).
- **Pages (by surface):**
  - *Client:* Overview, Projects, Deliverables/Approvals, Invoices, Files, Messages, Support.
  - *Admin:* Overview, Clients, Projects, CRM, Finance, Team, Catalog, CMS, Analytics, Settings.
  - *Employee:* My Work, My Projects, Calendar, Timesheets, Notifications.
  - *Finance/Support:* dashboards per `DESIGN_SYSTEM.md §10`.
- **Navigation:** role-scoped sidebar + top bar + ⌘K command palette (see §5).
- **Dependencies:** Auth (gate), the NestJS API (`BACKEND.md`), the data model (`DATABASE.md`),
  Payments providers, Files (R2), Notifications.
- **Future expansion:** mobile apps, portfolio/program management, advanced analytics, marketplace.

### Layer 3 — AI Platform
- **Purpose:** reduce overhead and surface intelligence across the platform — advisory, never
  autonomous in v1.
- **Users:** internal roles (PM/Sales/Support/Admin) primarily; AI Support faces clients.
- **Surfaces (not standalone pages — embedded):** AI PM panel in projects; AI Sales panel in CRM;
  AI Proposal generator in proposals; AI Pricing assistant in quotes; AI Support assistant in
  tickets/KB; a global AI entry in the command palette.
- **Navigation:** contextual (lives inside the relevant module) + ⌘K "Ask AI".
- **Dependencies:** Layer 2 data (via module contracts), the AI Orchestration Layer (`BACKEND.md §11`),
  Knowledge Base, approvals queue.
- **Future expansion:** agentic low-risk actions, predictive delivery, resource optimization.

---

## 2. Complete Routing Structure

Built on the approved route-group migration (`FRONTEND_AUDIT_AND_MIGRATION.md §4`). **Route groups
`(…)` do not appear in URLs** — they only assign layouts.

```
src/app/
├── (marketing)/                     # LAYER 1 — public, current shell (Lenis+Cursor+Nav+Footer)
│   ├── page.tsx                     → "/"                     Home
│   ├── about/                       → "/about"
│   ├── services/  [+ [slug]]        → "/services", "/services/web-development"
│   ├── work/      [+ [slug]]        → "/work", "/work/:slug"  Portfolio / case studies
│   ├── blog/      [+ [slug]]        → "/blog", "/blog/:slug"
│   ├── pricing/                     → "/pricing"
│   ├── process|industries|careers|contact|privacy|terms
│
├── (auth)/                          # AUTH — minimal centered shell, no app chrome
│   ├── login/                       → "/login"
│   ├── register/                    → "/register"
│   ├── forgot-password/ reset/      → "/forgot-password", "/reset-password"
│   ├── verify/ otp/ magic/          → "/verify", "/otp", "/magic"
│   └── invite/[token]/              → "/invite/:token"        accept invitation
│
├── (app)/                           # LAYER 2 — authenticated, lean app shell + role sidebar
│   ├── client/                      → "/client/…"             Client Dashboard surface
│   │   ├── page.tsx                 → "/client"               Overview
│   │   ├── projects/[id]/           → "/client/projects/:id"  live tracking, deliverables
│   │   ├── approvals/ invoices/ files/ messages/ support/
│   ├── admin/                       → "/admin/…"              Admin Dashboard surface
│   │   ├── page.tsx                 → "/admin"                Business overview
│   │   ├── clients/[id]/ projects/[id]/ crm/ finance/ team/ catalog/ cms/ analytics/
│   ├── employee/                    → "/employee/…"           Employee Dashboard surface
│   │   ├── page.tsx                 → "/employee"             My Work
│   │   ├── projects/ calendar/ timesheets/ notifications/
│   ├── finance/  support/           → role dashboards (may live under /admin or standalone)
│   └── settings/                    → "/settings/…"           profile, org, billing, integrations, API keys
│
├── checkout/                        # COMMERCE — hybrid: entered from marketing, may be public→auth
│   ├── [service]/                   → "/checkout/:service"    self-serve productized purchase
│   └── success/ cancel/
│
├── api/                             # SERVER route handlers (BFF/proxy to NestJS + webhooks)
│   ├── auth/[...]/                  auth callbacks (Better Auth / OAuth)
│   ├── webhooks/{stripe,razorpay}/  provider webhooks (signature-verified)
│   ├── ai/[...]/                    AI streaming proxy
│   └── (thin proxies; heavy logic lives in the NestJS backend)
│
├── layout.tsx                       # ROOT — html/body/fonts/providers only (surface-agnostic)
├── globals.css                      # unchanged
└── icon|opengraph-image|manifest|robots|sitemap|not-found
```

**Route-level access control:** each group's `layout.tsx` enforces its guard — `(app)` requires a
session + role; `(auth)` redirects authenticated users to their dashboard; `(marketing)` is public.
Middleware resolves tenant + session at the edge (see `BACKEND.md §7`).

**Why this is safe:** every existing marketing URL stays byte-identical; new surfaces live under new
path prefixes (`/client`, `/admin`, `/employee`, `/settings`) or invisible groups. No collision.

---

## 3. How the Marketing Site Connects to the Platform (without breaking anything)

The marketing site (Layer 1) stays exactly as-is; it gains **outbound seams** only.

| Connection | Seam added to marketing | Mechanism | Breakage risk |
|---|---|---|---|
| **Authentication** | "Log in" / "Client portal" link in Navbar + footer | plain `<Link href="/login">` → `(auth)` group | None — one link |
| **Checkout** | "Get started" / package CTA on Pricing & Service pages | `<Link href="/checkout/:service">` → checkout flow | None — CTAs already exist; only `href` targets change |
| **Payments** | (inside checkout, not marketing) | checkout calls `services/payments` → provider | None to marketing |
| **Client Dashboard** | post-login redirect | after auth, role router sends Client → `/client` | None — separate surface |
| **Admin Dashboard** | post-login redirect | Admin → `/admin` | None |
| **Project Management** | Contact/quote flow → CRM lead → (on win) project | lead form POST → API → CRM | Form target changes from stub to real endpoint |
| **AI** | "Get an instant proposal/estimate" CTA (optional) | → AI Proposal/Pricing assistant (auth-gated) | None — additive CTA |

**The golden rule:** Layer 1 only ever **links out** or **submits a lead**. It never imports Layer 2/3
code, never loads the app shell, and never depends on auth. Its bundle stays lean because the route
groups keep Lenis/Cursor/marketing chrome out of `(app)`. Existing forms (`ContactForm`,
`NewsletterForm`) evolve from client-only stubs to real submissions by swapping their handler to call
`services/*` — **markup, styling, and animation untouched.**

---

## 4. Navigation System

### 4.1 Public Navigation (Layer 1 — exists, +1 seam)
- Top: Logo · Services (mega) · Work · Studio · Process · Pricing · **Log in** · **Start a project** (CTA).
- Footer: Services / Studio / Resources columns + newsletter + socials (existing).
- Mobile: existing slide-over menu + the new "Log in" entry.

### 4.2 Authenticated Navigation (Layer 2 — shared shell, role-scoped content)
Shell = left sidebar (collapsible 256↔64px) + top bar (breadcrumb · ⌘K · notifications · avatar/org
switcher). The **sidebar items are filtered by role**:

**Client Navigation**
`Overview · Projects · Approvals · Invoices · Files · Messages · Support` + user menu.

**Admin Navigation**
`Overview · Clients · Projects · CRM · Finance · Team · Catalog · CMS · Analytics · Settings` +
approvals queue + AI flags.

**Employee Navigation**
`My Work · My Projects · Calendar · Timesheets · Notifications` + active timer.

**Finance / Support** (if standalone): finance/support nav per `DESIGN_SYSTEM.md §10.4–10.5`.

### 4.3 Mobile Navigation (Layer 2)
Sidebar → bottom tab bar (primary sections) + top bar; drawers full-height; ⌘K → full-screen search;
tables → stacked cards; sticky primary action. (Per `DESIGN_SYSTEM.md §7`.)

### 4.4 Command Palette (⌘K — universal in Layer 2/3)
Role-scoped, fuzzy: **navigate** (jump to any page), **create** (new project/invoice/client/task),
**search** (across entities), **run actions**, **switch org/project**, **"Ask AI"** (Layer 3 entry).
The single fastest path through the product (Linear/Raycast pattern).

### 4.5 Breadcrumbs (Layer 2)
Context path in the top bar: `Org › Section › Record` (e.g., `Meridian › Projects › Acme Redesign ›
Milestone 2`). Collapses the middle with "…" when deep; last segment is current (not a link).

---

## 5. Project Lifecycle (every step explained)

```
VISITOR → LEAD → PROPOSAL → QUOTE → CHECKOUT → PAYMENT → PROJECT CREATED →
AI ROADMAP → TEAM ASSIGNED → LIVE PROGRESS → PREVIEW → APPROVAL → DEPLOYMENT → MAINTENANCE
```

1. **Visitor** — browses Layer 1; Analytics captures source/UTM/behavior.
2. **Lead** — submits contact/quote form → **CRM lead** created with SLA timer; AI Sales scores it.
3. **Proposal** — Sales (assisted by **AI Proposal Generator**) builds a proposal from the Service
   Catalog; client reviews in-portal (accept/decline/comment).
4. **Quote** — priced quotation (line items, taxes, discounts) via the **Pricing Engine** /
   **AI Pricing Assistant**; client accepts.
5. **Checkout** — accepted quote (or self-serve productized service) → checkout summary.
6. **Payment** — deposit/first invoice paid via Razorpay/Stripe; contract e-signed. Provider webhook
   confirms → `payment.captured`.
7. **Project Created** — order → **project auto-created** from the matching Service Catalog template
   (website/app/SEO/branding/AI-automation); client account provisioned + portal invite.
8. **AI Generates Roadmap** — **AI PM** expands the template into phases, milestones, and draft tasks;
   proposes a schedule and a client-safe roadmap. Human PM reviews/adjusts (advisory).
9. **Admin Assigns Team** — Admin/Manager assigns employees/contractors (capacity-aware suggestions
   from AI PM); roles and access scoped.
10. **Live Progress** — team executes; tasks/time drive **Live Tracking** (%); client sees a curated,
    real-time status via WebSockets — **no status chasing needed**.
11. **Preview** — deliverables (designs, staging URLs, builds) submitted via Files for client review.
12. **Approval** — client approves or requests changes (threaded feedback); approval gates the
    milestone → triggers the **milestone invoice**.
13. **Deployment** — final delivery/launch; hand-off assets; project marked delivered; support window
    opens.
14. **Maintenance** — retainer via recurring billing; support tickets; change orders route back into
    Quote (upsell loop). AI Support deflects/accelerates.

Every transition emits events → Notifications, Activity Feed, Analytics, Audit (per `BACKEND.md §5`).

---

## 6. The Complete Customer Journey — "Never Need WhatsApp"

**Goal:** a client should learn *everything* about their engagement inside AgencyOS — status,
deliverables, money, and people — without a single "any update?" message.

| Client need | Where it's answered in AgencyOS | Replaces |
|---|---|---|
| "What's the status?" | Client Overview + **Live Tracking** (%, current phase, next milestone, ETA) | WhatsApp status pings |
| "Is it on track?" | Health indicator + AI-summarized, client-safe status narrative | "quick call?" |
| "Where's my deliverable?" | Deliverables/Files with preview + approve/request-changes | email attachments |
| "What am I paying / owe?" | Invoices: view, pay online, receipts, history | invoice-over-email |
| "I need a change" | Change request / support ticket → routed to CRM/Quote | WhatsApp scope creep |
| "Can I talk to the team?" | In-context Messages/Comments on the project | scattered chats |
| "What happens next?" | Roadmap + upcoming milestones + approvals queue | status meetings |
| "Notify me" | In-app + email notifications (+ future push/WhatsApp *as a channel, not the system*) | manual updates |

**Design principles that make this real:**
- **Push, don't pull** — clients are *notified* of status changes; they don't have to ask.
- **Real-time truth** — status is derived from actual task/milestone data, not a person's summary.
- **One place** — approvals, payments, files, and messages all live on the project, not in inboxes.
- **AI narration** — AI PM turns raw task data into a plain-language update the client trusts.
- **Transparency with boundaries** — clients see progress and deliverables; never internal cost,
  margin, or private notes (client-visibility flag).

Result: WhatsApp/email become *optional notification channels*, never the source of truth. The
platform is the single, always-current record.

---

## 7. Gap Analysis — What's Missing Today (categorized)

The marketing site is complete for Layer 1. Everything below is what AgencyOS additionally needs.

### 🔴 Critical (nothing works without these)
- **Backend API** (NestJS) — no server exists yet (`BACKEND.md`).
- **Database** (Postgres + Prisma) — schema not generated (`DATABASE.md`).
- **Authentication & sessions** — no auth, no roles, no tenant resolution.
- **Multi-tenancy enforcement** — no `organizationId` scoping anywhere yet.
- **App route groups & shells** — `(app)`/`(auth)` don't exist (planned, not built).

### 🟠 High (core product value)
- **Client / Admin / Employee dashboards** — no authenticated surfaces.
- **Project Management + Live Tracking** — the delivery core.
- **CRM + Leads** — lead capture currently a client-only stub.
- **Payments + Invoices** — no checkout/billing.
- **Service Catalog (dynamic)** — currently static `config/`.
- **File Manager (R2)** — no uploads/storage.
- **Notifications + Realtime (WebSockets)** — no event delivery.
- **Providers/services/API layer on the frontend** — scaffolding from the migration plan.

### 🟡 Medium (depth & intelligence)
- **AI Platform (Layer 3)** — PM/Sales/Proposal/Pricing/Support/KB assistants.
- **Analytics & Reports** — beyond marketing analytics.
- **Proposals/Quotes/Contracts + e-sign**.
- **Command palette, breadcrumbs, notification center** (app-shell UX).
- **Settings/entitlements** (roles, integrations, API keys).
- **Design-token reconciliation + dark mode** (opt-in).

### 🟢 Low (polish & scale)
- **Marketplace, white-label, public API** **[SaaS]**.
- **Mobile apps**; push/WhatsApp/SMS channels.
- **A11y pass, SEO helper, error/loading boundaries** (small additive wins).
- **Bundle analysis, dynamic-import tuning**.

---

## 8. 100% Implementation Roadmap

Phased for **incremental, non-breaking** delivery. Layer 1 stays live throughout. Each phase lists:
Objective · Modules · Dependencies · Complexity · Risk · Testing · Rollback. Frontend structural work
follows the approved `FRONTEND_AUDIT_AND_MIGRATION.md` checklist.

### Phase 0 — Foundation Scaffolding *(frontend, non-breaking)*
- **Objective:** git safety net + enterprise folders + route groups, marketing preserved.
- **Modules:** repo/init, `providers/ hooks/ services/ store/ config/ constants/ types/ features/`,
  `(marketing)/(auth)/(app)` groups (empty shells).
- **Dependencies:** none.
- **Complexity:** Low. **Risk:** Low (URLs unchanged).
- **Testing:** `build` + `lint` green after each step; visual parity check on every marketing route.
- **Rollback:** per-task git commits; revert.

### Phase 1 — Backend & Data Backbone
- **Objective:** stand up the API, DB, and tenancy.
- **Modules:** NestJS app + worker, Postgres + Prisma schema (from `DATABASE.md`), tenant-scope
  extension, event bus/outbox, config/secrets, health checks.
- **Dependencies:** Phase 0 (frontend can wait); DB decisions ratified (`DATABASE.md §14`).
- **Complexity:** High. **Risk:** Medium (foundational correctness).
- **Testing:** contract tests at module seams, tenant-isolation fuzz tests, migration dry-runs.
- **Rollback:** expand→contract migrations; DB snapshots/PITR; feature-flag new endpoints off.

### Phase 2 — Authentication & Identity
- **Objective:** secure login + roles + tenant sessions across surfaces.
- **Modules:** Better Auth (Google/password/magic-link/OTP), JWT+refresh, `(auth)` pages,
  route guards, `AuthProvider`, post-login role routing, invitations.
- **Dependencies:** Phase 1.
- **Complexity:** High. **Risk:** High (security).
- **Testing:** auth flow e2e, refresh-rotation/reuse-detection, RBAC matrix tests, guard coverage.
- **Rollback:** auth behind a flag; marketing unaffected (still no auth dependency); revert `(auth)`.

### Phase 3 — App Shell & Dashboards (skeletons)
- **Objective:** the lean authenticated shell + empty role dashboards.
- **Modules:** `(app)` layout (sidebar/top bar/command palette/breadcrumbs), Client/Admin/Employee
  overview pages with empty/loading states, notification center shell.
- **Dependencies:** Phase 2, `DESIGN_SYSTEM.md`.
- **Complexity:** Medium. **Risk:** Low. **Testing:** a11y + responsive + role-nav rendering.
- **Rollback:** surfaces are new routes; disable group; zero marketing impact.

### Phase 4 — Delivery Core (Projects + Live Tracking + Files)
- **Objective:** the OS's beating heart.
- **Modules:** Projects/Phases/Milestones/Tasks/Time, Live Tracking (WebSockets), File Manager (R2),
  Comments/Activity Feed, project templates.
- **Dependencies:** Phases 1–3.
- **Complexity:** High. **Risk:** Medium. **Testing:** realtime integration, projection correctness,
  visibility-flag (client vs internal) tests, upload/scan flow.
- **Rollback:** module flags per feature; data additive; revert routes.

### Phase 5 — Commerce & Finance (CRM → Checkout → Payments → Invoices)
- **Objective:** money in, lead-to-cash.
- **Modules:** CRM/Leads (wire marketing forms to real endpoint), Proposals/Quotes/Contracts,
  Service Catalog (dynamic), Checkout, Payments (Razorpay+Stripe), Invoices, webhooks.
- **Dependencies:** Phases 1–4.
- **Complexity:** High. **Risk:** High (financial correctness).
- **Testing:** idempotency, webhook replay, provider sandbox e2e, invoice-number races, refund flow.
- **Rollback:** payments in test mode → live behind flag; marketing lead form falls back to stub.

### Phase 6 — AI Platform (Layer 3)
- **Objective:** intelligence across delivery and sales — advisory, human-in-the-loop.
- **Modules:** AI Orchestration, AI PM (roadmap/health/summaries), AI Sales, AI Proposal, AI Pricing,
  AI Support, Knowledge Base, approvals queue, token budgets.
- **Dependencies:** Phases 4–5 (needs real data + modules to reason over).
- **Complexity:** High. **Risk:** Medium (cost, correctness, safety).
- **Testing:** grounded-output checks, prompt-injection defense, tenant-boundary isolation, budget
  enforcement, approval gating (no autonomous external actions).
- **Rollback:** per-project AI opt-out; graceful degrade (core works with AI off); model fallback.

### Phase 7 — Analytics, Notifications Depth & Settings
- **Objective:** insight, engagement, and control.
- **Modules:** Analytics/Reports (all lenses), notification channels + preferences, Settings/
  entitlements, integrations, API keys.
- **Dependencies:** Phases 1–6.
- **Complexity:** Medium. **Risk:** Low. **Testing:** metric-definition consistency, channel routing,
  entitlement gating.
- **Rollback:** additive dashboards/flags.

### Phase 8 — Design Reconciliation, A11y, Perf *(opt-in)*
- **Objective:** unify tokens with `DESIGN_SYSTEM.md`, add dark mode, a11y + perf polish — **without
  altering the current marketing look unless approved.**
- **Modules:** token layer (three-tier), dark theme, a11y pass, dynamic imports, SEO helper,
  error/loading boundaries.
- **Dependencies:** all prior; explicit approval (per migration T7.6).
- **Complexity:** Medium. **Risk:** Low-Medium (visual regression) → mitigated by visual review.
- **Testing:** visual-regression on marketing, contrast validation (light+dark), Lighthouse budgets.
- **Rollback:** theme behind a flag; per-commit revert; marketing palette restorable exactly.

### Phase 9 — SaaS Expansion *(future)*
- **Objective:** multi-tenant public product.
- **Modules:** tenant self-signup, plans/subscription billing, Super Admin control plane, white-label,
  public API, marketplace.
- **Dependencies:** Phases 1–8; tenancy already baked in.
- **Complexity:** High. **Risk:** Medium. **Testing:** tenant isolation at scale, billing, RLS.
- **Rollback:** gated launch; internal-only until proven.

---

## 9. Dependency Order (critical path)

```
Phase 0 (frontend scaffold) ─┐
                             ├─▶ Phase 1 (backend+DB) ─▶ Phase 2 (auth) ─▶ Phase 3 (shell)
                             │                                                   │
                             │                                                   ▼
                             │                                        Phase 4 (delivery core)
                             │                                                   │
                             │                                                   ▼
                             │                                        Phase 5 (commerce/finance)
                             │                                                   │
                             │                                                   ▼
                             │                                        Phase 6 (AI) ─▶ Phase 7 (analytics/settings)
                             │                                                                   │
                             └───────────────────────────────────────────────────▶ Phase 8 (design/a11y/perf)
                                                                                                 │
                                                                                                 ▼
                                                                                        Phase 9 (SaaS)
```

Phase 0 (frontend) and Phase 1 (backend) can proceed **in parallel** by different tracks; everything
authenticated depends on Phase 2.

---

## 10. Guardrails (unchanged commitment)
- Layer 1 marketing site is **preserved exactly** through Phases 0–7; any visual change is quarantined
  to opt-in Phase 8 with explicit approval + visual-regression review.
- No existing URL, section, or animation is altered to build Layers 2–3.
- New surfaces are new routes/groups; they can be flag-disabled without touching marketing.
- Incremental delivery, per-task commits, build+lint green gates, confirm-then-proceed.

---

## 11. Recommended Next Action
With this roadmap approved, the concrete next step remains the **already-approved migration T0.1**
(git baseline) → T1.1 (empty scaffolds) → T3 (route groups) from
`FRONTEND_AUDIT_AND_MIGRATION.md`. That builds Phase 0 safely and unlocks everything above — still
**one task at a time, with confirmation between each.**

**No code written. No project files modified.** This document is the official evolution roadmap.

---

*End of Evolution & Implementation Roadmap v1.0.*
