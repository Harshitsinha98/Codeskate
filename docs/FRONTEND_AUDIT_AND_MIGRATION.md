# AgencyOS — Frontend Audit & Safe Migration Plan

**Companion to:** `PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`, `BACKEND.md`, `DESIGN_SYSTEM.md`
**Document version:** 1.0
**Status:** Draft for review — **NO CODE CHANGES MADE YET**
**Perspective:** Principal Architect · Staff Frontend Engineer · Next.js / React / TypeScript / Tailwind / Framer Motion
**Last updated:** 2026-07-11

> **Prime directive:** upgrade the existing premium marketing site into the *foundation* of
> AgencyOS **without rebuilding, redesigning, or removing anything**. Preserve every animation,
> every premium section, every pixel of the current UI/UX. Refactor only where it earns its keep.
> Work incrementally; confirm after each step.

---

## 1. Project Analysis (verified, not assumed)

### 1.1 Stack
| Layer | Tech | Version |
|---|---|---|
| Framework | Next.js (App Router) | `^16.2.10` |
| UI runtime | React / React DOM | `19.0.0` |
| Language | TypeScript (strict) | `5.7.3` |
| Styling | Tailwind CSS | `3.4.17` |
| Motion | Framer Motion | `11.18.0` |
| Smooth scroll | Lenis | `1.1.18` |
| Icons | lucide-react | `0.469.0` |
| Class utils | clsx + tailwind-merge (`cn`) | — |

Scripts: `dev`, `build`, `start`, `lint`. No test runner. **Not a git repository** (verified).

### 1.2 Folder structure (as-is)
```
src/
├── app/                         # App Router — ALL marketing, at root level
│   ├── layout.tsx               # fonts, JSON-LD, SmoothScroll+Cursor+Nav+Footer shell
│   ├── page.tsx                 # home (13 stacked sections)
│   ├── globals.css              # tokens, base, components, utilities, reduced-motion
│   ├── about|careers|contact|industries|pricing|process|privacy|terms/page.tsx
│   ├── blog/(page + [slug])     # dynamic content pages
│   ├── services/(page + [slug])
│   ├── work/(page + [slug])
│   ├── icon.tsx opengraph-image.tsx manifest.ts robots.ts sitemap.ts not-found.tsx
├── components/
│   ├── layout/    # AnnouncementBar, Navbar, Footer, PageHeader, LegalLayout, NewsletterForm
│   ├── motion/    # SmoothScroll, Cursor, ScrollProgress, Reveal, Magnetic, TextReveal
│   ├── sections/  # 19 marketing sections (Hero, Services, Work, Pricing, FAQ, CTA, …)
│   └── ui/        # Button, Badge, Logo, Marquee, SectionHeading
└── lib/           # site.ts, services.ts, content.ts, pricing.ts, blog.ts, blog-content.tsx, utils.ts
```

### 1.3 Client/server boundary
- **22 of 36** components are `"use client"` — correctly scoped to motion/interactive components.
- Pages are **server components**; data comes from static `lib/*` modules (no fetching).
- Layout composes client shell (`SmoothScroll`, `Cursor`, `ScrollProgress`) around server `main`.

### 1.4 Design language (as-is)
- Tokens in `tailwind.config.ts` + `globals.css`: neutrals (`base/surface/ink/line`), accents
  **`royal` (#2B4EFF) / `violet` (#7A5CFF) / `cyan` (#3ED6F2)**, `display` sizes with `clamp()`,
  custom shadows (`soft/lift/glow`), `premium` easing, keyframes (marquee/gradient-pan/float/shimmer).
- Fonts: **Inter** (sans) + **Fraunces** (display) via `next/font`, CSS variables, `display: swap`.
- Signature CSS: `.mesh-hero`, `.noise`, `.glass`, `.border-animated` (conic `@property` spin),
  `.text-gradient`, `.container-x`, `.eyebrow`.
- **Light mode only** (`color-scheme: light`).

---

## 2. Audit Report

### 2.1 What is GOOD (preserve — do not touch)
1. **Genuinely premium, hand-crafted UI** — cohesive design language, thoughtful motion, real polish.
2. **Strict TypeScript, zero `any`, zero `console`, zero TODO/FIXME** — clean, disciplined code.
3. **Motion architecture is excellent** — reusable primitives (`Reveal`, `Stagger`, `Magnetic`,
   `TextReveal`, `Cursor`, `ScrollProgress`) with premium easing curves; not copy-pasted.
4. **Accessibility foundations present** — `prefers-reduced-motion` fully handled, `:focus-visible`
   ring, `::selection`, `aria-label`s on icon buttons, semantic headings.
5. **Performance-friendly by construction** — no raster images (CSS gradients/mesh/noise/SVG),
   `next/font` with swap, no blocking assets → strong LCP potential.
6. **SEO is thorough** — per-page metadata on all 15 routes, JSON-LD org schema, sitemap, robots,
   manifest, dynamic OG image, canonical.
7. **Clean separation already partially present** — `layout / motion / sections / ui / lib`.
8. **Deliberate engineering decisions** — Lenis-vs-native-scroll conflict resolved with comments;
   Cursor gated to fine pointers; `cn()` helper for class merging.

### 2.2 What needs IMPROVEMENT (for AgencyOS scale — additive, not destructive)
| # | Area | Issue | Severity |
|---|---|---|---|
| I1 | **No app/marketing separation** | All routes at `app/` root; no home for future dashboards/auth without polluting the marketing shell (Lenis/Cursor should NOT load in dashboards) | High (blocks modules) |
| I2 | **Missing enterprise scaffolding** | No `features/ providers/ hooks/ types/ config/ constants/ services/ store/` | High (requested) |
| I3 | **No API/data layer** | Forms (`ContactForm`, `NewsletterForm`) are client-only stubs; no server actions, no fetch layer, no validation (no zod) | Medium |
| I4 | **`lib/` mixes concerns** | config (`site.ts`) + data (`services/content/pricing/blog`) + utils in one folder | Low |
| I5 | **No dynamic imports / code splitting** | `Cursor`, Lenis, heavy sections load eagerly for every route | Medium |
| I6 | **No providers seam** | Shell wired directly in `layout.tsx`; no place for Theme/Query/Auth/Realtime providers | Medium |
| I7 | **No shared domain types** | Types inline; no central `types/` for cross-cutting models | Low |
| I8 | **Not a git repo** | No version-control safety net for incremental refactors | **High (do first)** |
| I9 | **No error/loading boundaries** | No `loading.tsx`, `error.tsx`, `global-error.tsx` (only `not-found.tsx`) | Low |
| I10 | **Design-token divergence** | Current `royal/violet/cyan` vs new `DESIGN_SYSTEM.md` brand indigo — needs *reconciliation*, not replacement | Low (defer) |
| I11 | **No dark mode** | `color-scheme: light` only; design system wants dark as first-class | Low (defer) |
| I12 | **Minor a11y gaps** | Toggle chips (service/budget) lack `aria-pressed`; form inputs lack `aria-invalid`/error text | Low |

### 2.3 Unused / duplicate code
- **Unused:** none proven — every component is imported (home composes 13 sections; others used by
  sub-pages). `PageHeader`/`LegalLayout` used by legal/content pages. *(Will confirm per-file before
  any deletion — nothing deleted without a proven zero-reference check.)*
- **Duplicate patterns (minor, not urgent):** the "pill toggle" button style is repeated in
  `ContactForm` (services + budget chips); the primary CTA button markup is re-implemented inline in
  `ContactForm` instead of using `ui/Button`. Candidates for a shared `Chip`/`ToggleChip` primitive
  and reusing `Button` — **opt-in later**, not part of the safe structural migration.

### 2.4 Performance
- **Strengths:** no images to optimize, `next/font` swap, static content, minimal JS per page.
- **Watch items:** (a) motion shell (`Cursor` + Lenis) loads globally — should be scoped to the
  marketing route group so future dashboards start lean; (b) no bundle analysis configured;
  (c) all sections in home render eagerly — acceptable for a marketing page, but below-fold sections
  are dynamic-import candidates if/when bundle grows. **No action needed now beyond scoping.**

### 2.5 Accessibility
- Solid baseline (reduced-motion, focus ring, aria on icon buttons). Gaps: toggle `aria-pressed`,
  form error semantics (`aria-invalid`, linked error text), and a "skip to content" link. All are
  **small, additive** fixes — deferred to a dedicated a11y pass, not the structural migration.

### 2.6 SEO
- Excellent. Only nits: consider a shared `buildMetadata()` helper to DRY the repeated title/OG
  blocks across 15 pages (additive), and add `twitter:site`/verification when handles exist.

### 2.7 Architecture
- Appropriate for a marketing site; **not yet** shaped for a multi-surface product (marketing +
  dashboards + auth + API). The migration below introduces that shape **without moving existing
  pages' URLs or breaking imports** (path alias `@/*` stays valid throughout).

### 2.8 Animation
- Best-practice Framer Motion: variants, `whileInView` + `viewport once`, spring configs, premium
  cubic-bezier. **Keep as-is.** Only future improvement: extract shared transition constants into
  `constants/motion.ts` so values are defined once (additive, non-breaking).

### 2.9 Component quality
- Well-typed, single-responsibility, prop-driven. `Button` supports variants/sizes/magnetic/arrow.
  Improvement path: promote a few inline patterns (chips, form fields) into `ui/` primitives — **later**.

---

## 3. Safe Migration Principles (how "nothing breaks")

1. **Git first.** Initialize a repo + commit the current working site as the baseline before any
   change. Every task = its own commit → instant rollback.
2. **Additive before subtractive.** Create new folders/seams first; move files only when the new
   location is proven; delete nothing until a zero-reference check passes.
3. **Preserve URLs & imports.** Keep the `@/*` alias. Use **App Router route groups** `(marketing)`
   which **do not change URLs**. Barrel/re-export shims keep old import paths working during moves.
4. **One concern per step.** Each checklist item is independently shippable and verifiable
   (`npm run build` + `npm run lint` must stay green after every step).
5. **No design changes in the structural phase.** Tokens, animations, and section markup are
   untouched until an explicit, separate, opt-in "design reconciliation" phase.
6. **Confirm-then-proceed.** After each task I summarize exactly what changed and wait for your go.

---

## 4. Target Enterprise Architecture (end state — introduced gradually)

```
src/
├── app/
│   ├── (marketing)/             # route GROUP — URLs UNCHANGED (no /marketing prefix)
│   │   ├── layout.tsx           # the CURRENT marketing shell (Lenis, Cursor, Nav, Footer)
│   │   ├── page.tsx             # home  (moved, same URL "/")
│   │   ├── about|work|services|… # all existing marketing pages (same URLs)
│   ├── (app)/                   # FUTURE product surface — lean shell, NO Lenis/Cursor
│   │   └── (dashboard routes added later — not now)
│   ├── (auth)/                  # FUTURE auth routes (login/register) — not now
│   ├── api/                     # FUTURE route handlers — not now
│   ├── layout.tsx               # ROOT layout: html/body/fonts/providers only (surface-agnostic)
│   ├── globals.css              # unchanged
│   └── icon/opengraph/manifest/robots/sitemap/not-found  # unchanged
│
├── features/                    # feature-first modules (self-contained), added as built
│   ├── marketing/               # (optional) marketing-only feature logic
│   ├── auth/         crm/        projects/     payments/    ai/    notifications/  (scaffold only)
│   └── <each>: components/ hooks/ api/ types/ index.ts
│
├── components/
│   ├── ui/                      # shared design-system primitives (existing + future)
│   ├── motion/                  # shared motion primitives (existing — unchanged)
│   ├── layout/                  # marketing chrome (existing) — may split shared vs marketing
│   └── sections/                # marketing sections (existing — unchanged)
│
├── providers/                   # ThemeProvider, QueryProvider, AuthProvider, RealtimeProvider (stubs)
├── hooks/                       # shared cross-feature hooks (useMediaQuery, useDisclosure, …)
├── services/                    # client API layer: http client, endpoint clients (stubs)
├── store/                       # global client state (when needed — stub)
├── config/                      # app config (site.ts moves here), env schema, feature flags
├── constants/                   # nav, routes, motion constants, enums, query keys
├── types/                       # shared domain & UI types
└── lib/                         # pure utilities only (utils.ts stays; data modules may move to config/features)
```

**Why route groups (`(marketing)`, `(app)`, `(auth)`):** Next.js route groups let us give each
surface its **own layout** (marketing keeps Lenis+Cursor; dashboards get a lean, fast shell) **without
changing any public URL**. This is the single most important structural move and it is 100%
non-destructive.

**Reusable separation achieved:**
- **Marketing Website** → `app/(marketing)` + `components/sections|layout` + `config/site`
- **Shared Components** → `components/ui` + `components/motion`
- **Future Dashboards** → `app/(app)` + `features/*`
- **Authentication** → `app/(auth)` + `features/auth` + `providers/AuthProvider`
- **API Layer** → `services/*` (client) + `app/api/*` (server) — talks to the NestJS backend
- **AI / Payments / Notifications / Realtime** → `features/ai|payments|notifications` +
  `providers/RealtimeProvider` — **scaffolded, not implemented**

---

## 5. Complete Migration Checklist (incremental, confirm after each)

> Each task is **independently verifiable** (`npm run build` + `npm run lint` green) and reversible
> (its own git commit). **Nothing is started until you approve this plan; then we do ONE task at a
> time and I wait for your confirmation between each.**

### Phase 0 — Safety net (do first)
- [ ] **T0.1** Initialize git, add a proper `.gitignore` (already present), commit current site as
  `baseline: premium marketing site` — the rollback point. *(No source changes.)*
- [ ] **T0.2** Add `.env.example` (empty placeholders for future auth/payments/AI) — additive.
- [ ] **T0.3** Add `bundle`/type-check npm scripts (`typecheck`) — additive, no behavior change.

### Phase 1 — Non-destructive scaffolding (empty folders + stubs)
- [ ] **T1.1** Create empty scaffold dirs with `README.md` placeholders: `providers/ hooks/ services/
  store/ config/ constants/ types/ features/`. *(Zero imports changed — nothing can break.)*
- [ ] **T1.2** Add `constants/routes.ts` + `constants/motion.ts` (mirror existing values; not yet
  wired). Additive.
- [ ] **T1.3** Add `types/index.ts` with shared UI types (e.g., `NavItem` re-exported). Additive.

### Phase 2 — Config consolidation (move data/config; keep imports working via shims)
- [ ] **T2.1** Move `lib/site.ts` → `config/site.ts`; leave a re-export shim at `lib/site.ts` so all
  existing imports keep resolving. Verify build. *(Reversible, zero behavior change.)*
- [ ] **T2.2** (Optional) Move `lib/{services,content,pricing,blog}.ts` → `config/content/` with
  shims. Only if build stays green; otherwise skip.

### Phase 3 — Route-group separation (the key move; URLs unchanged)
- [ ] **T3.1** Introduce `app/(marketing)/layout.tsx` holding the CURRENT shell (Lenis, Cursor,
  ScrollProgress, AnnouncementBar, Navbar, Footer). Slim root `app/layout.tsx` to html/body/fonts/
  JSON-LD/providers only.
- [ ] **T3.2** Move each marketing route into `app/(marketing)/` **one at a time**, verifying the URL
  and build after each (home, about, services, work, blog, pricing, process, industries, careers,
  contact, privacy, terms). Route groups keep URLs identical.
- [ ] **T3.3** Confirm every page renders identically (visual + build). This phase changes **zero**
  markup, styles, or animations.

### Phase 4 — Providers seam (stubs only, no libs added yet)
- [ ] **T4.1** Add `providers/AppProviders.tsx` composing future providers (ThemeProvider stub now;
  Query/Auth/Realtime as commented placeholders). Wire into root layout. No new dependencies.
- [ ] **T4.2** Prepare `app/(app)/layout.tsx` + `app/(auth)/layout.tsx` **lean shells** (no Lenis/
  Cursor) as empty-but-valid placeholders for future modules. No routes inside yet.

### Phase 5 — Service/API layer stub (no backend calls yet)
- [ ] **T5.1** Add `services/http.ts` (typed fetch wrapper stub) + `services/README.md` describing the
  contract to the NestJS API (`BACKEND.md`). Not imported by any page yet.
- [ ] **T5.2** Define `types/api.ts` (response envelope, pagination) mirroring `BACKEND.md §3.1`.

### Phase 6 — Feature scaffolds (empty, future-ready)
- [ ] **T6.1** Create `features/{auth,crm,projects,payments,ai,notifications}/` each with
  `components/ hooks/ api/ types/ index.ts` placeholders + a README pointing to the relevant PRD/
  architecture section. **No implementation.**

### Phase 7 — Optional quality passes (each opt-in, separate approval)
- [ ] **T7.1** Dynamic-import below-fold home sections (perf) — only if measured beneficial.
- [ ] **T7.2** Promote repeated inline patterns to `ui/` primitives (`ToggleChip`, `Field`) and reuse
  `Button` in `ContactForm` — behavior-preserving refactor.
- [ ] **T7.3** A11y pass: `aria-pressed` on toggles, form error semantics, skip-link.
- [ ] **T7.4** `buildMetadata()` SEO helper to DRY per-page metadata.
- [ ] **T7.5** Add `loading.tsx`/`error.tsx` boundaries.
- [ ] **T7.6** (Deferred, explicit) Design-token reconciliation with `DESIGN_SYSTEM.md` + dark mode —
  **only if/when you choose**; current palette otherwise preserved exactly.

---

## 6. Risk Register

| Risk | Likelihood | Mitigation |
|---|---|---|
| A moved page changes its URL | Low | Route groups `(marketing)` preserve URLs by design; verify each |
| Broken import after a file move | Low | Re-export shims + `@/*` alias + build check after every step |
| Losing an animation/section | Very low | No markup/motion touched in Phases 0–6; git baseline for rollback |
| Scope creep into redesign | Medium | Design changes quarantined to opt-in Phase 7.6 with explicit approval |
| Regression with no rollback | Low | Git init in T0.1 before anything; one commit per task |

---

## 7. What I will NOT do (guardrails, per your instruction)
- ❌ Rebuild the website or any section.
- ❌ Redesign, restyle, or re-theme existing UI (palette/typography/spacing stay).
- ❌ Remove or alter existing animations (Lenis, Cursor, Reveal, Magnetic, etc.).
- ❌ Replace premium sections.
- ❌ Delete any file without a proven zero-reference check + your confirmation.
- ❌ Add heavy dependencies (auth/query/state libs) during structural phases.
- ❌ Proceed to the next task without summarizing changes and getting your go-ahead.

---

## 8. Recommendation & Next Action

The codebase is in **excellent shape** — this is an *architecture-enablement* migration, not a
rescue. The highest-value, lowest-risk sequence is: **T0.1 (git safety net) → T1.1 (empty scaffolds)
→ T3 (route-group separation).** Those three unlock every future module while changing **zero** URLs,
markup, styles, or animations.

**I have made no code changes.** Per your instruction, I will execute **one task at a time and wait
for your confirmation after each.**

👉 **Proposed first task: T0.1 — initialize git and commit the current site as the baseline** (pure
safety, no source edits). Reply to approve T0.1, adjust the plan, or tell me which task to start with.

---

*End of Frontend Audit & Migration Plan v1.0. No files created, moved, updated, or deleted in the
project source. This document is the agreed contract before incremental execution begins.*
