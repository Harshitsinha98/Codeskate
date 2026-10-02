# AgencyOS — Design System & UX Architecture

**Companion to:** `PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`, `BACKEND.md`
**Document version:** 1.0
**Status:** Draft for review
**Perspective:** Apple · Stripe · Linear · Vercel · Framer design leads · UX Research · Creative Direction · Motion · Design-System Architecture
**Last updated:** 2026-07-11

> **Scope:** the complete **design language, component guidelines, motion system, UX
> architecture, and design tokens**. **No React, no Tailwind, no component code** — values
> are expressed as design tokens (hex/rem/ms) that frontend will implement. This is the
> contract between design and engineering.

> **Implemented marketing-site tokens (supersedes the indigo palette below for the public site):**
> - **Surfaces:** `night` `#0A0A0B` (hero, proof, services, product, CTA, navbar, footer, inner-page headers); light `base`/`subtle` for reading sections (work, process, FAQ, pricing tables).
> - **Brand:** orange `royal` `#FF6A1A` (400 `#FF8A47`, 600 `#F25A0A`) — highlight only: CTAs, glows, active states. `violet`/`cyan` are legacy aliases mapped to orange; don't use them in new code.
> - **Type:** Geist Sans (`--font-sans`) + Geist Mono (`--font-mono`) for eyebrows, numbers, stats and URLs. Geist Mono lacks `✓ ○ → ⌘` — use icons or ASCII.
> - **Utilities (globals.css):** `section-night`, `card-night`, `pill-night`, `night-grid`, `night-glow`, `horizon`, `ring-gradient`, `text-shine`, `text-gradient`, and `spotlight`/`spotlight-border` (via `<Spotlight>`) — the single card hover treatment.
> - **Buttons:** pill-shaped; `glow` / `night` / `night-ghost` variants for dark surfaces.

---

## 0. Design Philosophy

**One line:** *Calm surfaces, sharp typography, purposeful motion — a tool that feels fast,
looks premium, and gets out of the way.*

Five inherited principles, each with the source it's borrowed from and the rule it becomes:

1. **Clarity over decoration (Apple).** Content is the interface. Chrome recedes; typography
   and spacing do the work. Nothing decorative that doesn't aid comprehension.
2. **Trust through precision (Stripe).** Dense information rendered legibly. Perfect alignment,
   real data in examples, financial-grade correctness. Premium = precise, not flashy.
3. **Speed is a feature (Linear).** Keyboard-first, instant feedback, optimistic UI, command
   palette everywhere. The product should feel like it responds before you finish the action.
4. **Effortless surface, powerful depth (Notion / Vercel).** Simple by default, progressive
   disclosure for power. A beginner and an expert use the same screen differently.
5. **Motion with meaning (Framer).** Animation explains state and spatial relationships. If a
   motion doesn't teach the user something, it doesn't ship.

**Personality axes:** Professional (not corporate) · Modern (not trendy) · Confident (not loud)
· Warm-minimal (not sterile). **Aesthetic anchor:** near-monochrome canvas + one decisive
accent + restrained depth. Dark mode is a first-class citizen, not an afterthought.

---

## 1. Color System

### 1.1 Philosophy
A **near-neutral canvas** carries the product; a single **brand accent** signals action and
identity; **semantic colors** are reserved strictly for meaning (success/warn/error/info).
Color is used sparingly — a premium feel comes from *restraint*, not saturation.

### 1.2 Neutrals (the workhorse — a 12-step scale)
Cool-tinted gray ramp (slight blue undertone reads as "software," not "paper"). Values are
light-mode; dark-mode inverts the ramp (see §1.6).

| Token | Hex (light) | Use |
|---|---|---|
| `neutral-0` | `#FFFFFF` | base background (light) |
| `neutral-50` | `#F7F8FA` | app canvas / subtle fill |
| `neutral-100` | `#EEF0F3` | hover fill, subtle borders |
| `neutral-200` | `#E2E5EA` | borders, dividers |
| `neutral-300` | `#CBD0D8` | strong borders, disabled bg |
| `neutral-400` | `#9AA1AD` | placeholder, disabled text |
| `neutral-500` | `#6B7280` | secondary text / icons |
| `neutral-600` | `#4B5563` | body text (secondary) |
| `neutral-700` | `#374151` | body text (strong) |
| `neutral-800` | `#1F2430` | headings |
| `neutral-900` | `#141821` | primary text |
| `neutral-950` | `#0B0E14` | max-contrast / dark base |

### 1.3 Brand accent (Indigo-violet — "Meridian")
Chosen for trust (blue heritage) with a modern violet lean; distinct from Stripe-purple and
Linear-indigo while sharing their premium register.

| Token | Hex | Use |
|---|---|---|
| `brand-50` | `#EEF0FF` | tint background |
| `brand-100` | `#DfE3FF` | subtle fill |
| `brand-200` | `#C2C9FF` | hover tint |
| `brand-300` | `#9DA6FF` | borders on tint |
| `brand-400` | `#7C83FB` | accents, focus glow |
| `brand-500` | `#5B5BF0` | **primary action** (default) |
| `brand-600` | `#4A46D6` | primary hover |
| `brand-700` | `#3B37B0` | primary active/pressed |
| `brand-800` | `#2E2B87` | on-dark accents |
| `brand-900` | `#20205E` | deep accent |

**Accent gradient (marketing only):** `#5B5BF0 → #7C83FB → #22D3EE` (indigo→violet→cyan),
used on hero, CTAs, and animated backgrounds — never inside the app product surfaces.

### 1.4 Semantic colors (meaning only)
Each has `bg` (subtle fill), `border`, `solid` (primary), `text` (on-subtle) tiers.

| Meaning | Solid | Subtle bg | Use |
|---|---|---|---|
| **Success** | `#12A150` (emerald) | `#E7F7EE` | paid, approved, done, healthy |
| **Warning** | `#C77800` (amber) | `#FCF3E5` | at-risk, pending, due soon |
| **Error / Danger** | `#DC2B4E` (rose) | `#FCEBEF` | failed, overdue, destructive |
| **Info** | `#0E7DD1` (sky) | `#E7F2FC` | neutral notices, tips |
| **AI / Accent-2** | `#7C3AED` (violet) | `#F1EBFE` | AI-generated content, insights |

### 1.5 Data-visualization palette (categorical, colorblind-safe)
Ordered for series 1→8; validated for deuteranopia/protanopia and light/dark. (See `dataviz`
skill before building any chart.)
`#5B5BF0`, `#22D3EE`, `#12A150`, `#F5A623`, `#EC4899`, `#8B5CF6`, `#0EA5E9`, `#64748B`.
Sequential ramp (single-hue) and diverging ramp derived from brand + rose; documented per chart.

### 1.6 Dark mode
Not a filter — a **designed second theme**. Base `neutral-950 #0B0E14`; surfaces step *up* in
lightness (elevation = lighter, opposite of light mode). Reduce accent saturation ~8% and lift
text contrast. Semantic subtle-bg become low-opacity tints of the solid. Every token has a
light and dark value; components reference **semantic tokens**, never raw hex (see §12).

---

## 2. Typography

### 2.1 Typefaces
- **UI / Sans:** **Inter** (or Geist) — variable, exceptional legibility at small sizes,
  tabular numerals for tables/finance. Primary for 95% of the product.
- **Display (marketing headlines):** Inter Display / a refined grotesk at large sizes with
  tighter tracking; optional expressive face on hero only.
- **Mono:** **Geist Mono / JetBrains Mono** — code, IDs, API keys, technical values.
- **Numeric:** enable `font-feature-settings: "tnum"` (tabular) in tables, invoices, metrics.

### 2.2 Type scale (major-third-ish, tuned; rem @ 16px base)
| Token | Size | Line-height | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `display-2xl` | 4.5rem/72 | 1.05 | 600 | -0.02em | marketing hero |
| `display-xl` | 3.5rem/56 | 1.08 | 600 | -0.02em | big headlines |
| `display-lg` | 2.75rem/44 | 1.1 | 600 | -0.02em | section titles |
| `h1` | 2rem/32 | 1.2 | 600 | -0.01em | page title |
| `h2` | 1.5rem/24 | 1.25 | 600 | -0.01em | section |
| `h3` | 1.25rem/20 | 1.3 | 600 | 0 | card/subsection |
| `h4` | 1.125rem/18 | 1.4 | 600 | 0 | small heading |
| `body-lg` | 1.125rem/18 | 1.6 | 400 | 0 | long-form/marketing |
| `body` | 1rem/16 | 1.55 | 400 | 0 | default UI text |
| `body-sm` | 0.875rem/14 | 1.5 | 400 | 0 | dense UI, table cells |
| `caption` | 0.8125rem/13 | 1.45 | 500 | 0 | labels, meta |
| `overline` | 0.75rem/12 | 1.4 | 600 | 0.06em | eyebrows, uppercase |
| `mono-sm` | 0.8125rem/13 | 1.5 | 450 | 0 | code, IDs |

**Weights:** 400 (body), 500 (labels/emphasis), 600 (headings/buttons), 700 (rare, marketing).
**Rules:** max ~72ch measure for long-form; never more than 3 weights per screen; headings use
negative tracking, body zero, uppercase overlines positive.

---

## 3. Spacing, Grid & Layout

### 3.1 Spacing scale (4px base, geometric)
`0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128` (px) → tokens `space-0 … space-128`.
**Rule:** 8px is the rhythm unit; 4px for fine adjustments; components pad in multiples of 4.

### 3.2 Grid
- **App:** 12-column fluid grid, 24px gutters (16px on tablet). Content max-width `1280px`;
  ultra-wide caps content and adds side rails (see §7).
- **Marketing:** 12-column, 24–32px gutters, max-width `1200–1440px`, generous vertical rhythm
  (section padding `space-96`/`space-128`).
- **Dashboard shell:** fixed left sidebar (`256px`, collapsible to `64px`) + top bar (`56px`) +
  fluid content. Optional right context panel (`320–360px`).

### 3.3 Breakpoints
| Name | Min width | Target |
|---|---|---|
| `xs` | 0 | mobile portrait |
| `sm` | 480px | large mobile |
| `md` | 768px | tablet |
| `lg` | 1024px | laptop |
| `xl` | 1280px | desktop |
| `2xl` | 1536px | large desktop |
| `3xl` | 1920px | ultra-wide (rails/max-out) |

### 3.4 Border radius
`radius-none 0` · `radius-sm 6px` (inputs, badges) · `radius-md 10px` (buttons, cards) ·
`radius-lg 14px` (panels, dialogs) · `radius-xl 20px` (marketing cards) · `radius-2xl 28px`
(hero media) · `radius-full 9999px` (pills, avatars). **House style:** 10px is the default —
soft but not rounded-toy.

---

## 4. Elevation & Shadows

Depth is **subtle and layered** — premium products barely cast shadows; they use *contrast +
one soft ambient shadow*, not drop-shadow drama. Dark mode leans on lighter surfaces + hairline
borders instead of shadow.

| Level | Token | Light shadow | Use |
|---|---|---|---|
| 0 | `elevation-0` | none (border only) | flush surfaces, table rows |
| 1 | `elevation-1` | `0 1px 2px rgba(16,24,40,.06)` | cards, inputs |
| 2 | `elevation-2` | `0 4px 12px rgba(16,24,40,.08)` | dropdowns, popovers |
| 3 | `elevation-3` | `0 12px 28px rgba(16,24,40,.12)` | dialogs, drawers |
| 4 | `elevation-4` | `0 24px 56px rgba(16,24,40,.16)` | command palette, modals over modals |

**Rules:** at most one elevated layer competing for attention; hairline `1px` border (`neutral-200`
light / white-8% dark) pairs with every shadow for crisp edges; focus glow uses `brand-400` ring,
not shadow.

---

## 5. Iconography & Illustration

### 5.1 Icons
- **Library:** **Lucide** (already in the stack) — consistent 1.5px stroke, 24px grid.
- **Sizes:** `16` (inline/dense), `20` (default UI), `24` (nav/emphasis). Stroke stays optically
  consistent — don't scale a 24px icon down to 16.
- **Rules:** outline by default; filled only for active nav/selected states; icons carry meaning,
  never decoration; always paired with a label or `aria-label`; two-tone allowed for AI/brand moments.

### 5.2 Illustration
- **Style:** minimal, geometric, low-detail line + soft gradient fills using brand palette;
  isometric avoided (dated). Think Vercel/Stripe spot illustrations — abstract, calm, on-brand.
- **Use:** empty states, onboarding, marketing section breaks, error pages. Never inside dense
  data views.
- **Product imagery:** real UI screenshots (crisp, in-context) over stock photography.

---

## 6. State System (empty · loading · skeleton · error · success · warning)

A consistent state grammar every data surface must implement.

### 6.1 Empty states
Structure: **spot illustration + one-line headline + one-sentence guidance + primary action**.
Tone: encouraging, specific ("No projects yet — create your first to start tracking delivery").
Never a blank panel. First-use empty states double as onboarding.

### 6.2 Loading & skeleton
- **Skeletons** (not spinners) for structured content — mirror the final layout (card/table/row
  shapes) with a subtle shimmer (1.2s, left→right, low contrast). Prevents layout shift.
- **Spinners** only for indeterminate <1s actions inside buttons/inline.
- **Optimistic UI**: reflect the action instantly, reconcile on server response, roll back with a
  toast on failure (Linear pattern).
- **Progressive load:** shell + skeleton → data streams in region by region.

### 6.3 Error states
Three tiers: **inline** (field-level, red text + icon under input) · **section** (a panel failed
— retry affordance + plain-language cause) · **page** (full error page with illustration, code,
support link). Never expose stack traces or codes without a human-readable message.

### 6.4 Success / Warning / Info feedback
- **Toasts** (transient, top-right, 4s, stackable) for async confirmations ("Invoice sent").
- **Inline banners** (persistent) for state that must remain visible (payment overdue, plan limit).
- **Success moments:** subtle — a checkmark morph + micro-confetti reserved for milestone
  completion / first project live (celebrate rarely, so it lands).

---

## 7. Responsive Design

| Device | Layout behavior |
|---|---|
| **Ultra-wide (≥1920)** | Content max-width capped (`1440px` app / `1200px` reading); extra space becomes symmetric rails or an optional right context panel — never stretch tables full-bleed |
| **Desktop (1280–1919)** | Full shell: sidebar + top bar + content (+ optional right panel). Multi-column dashboards |
| **Laptop (1024–1279)** | Sidebar collapsible to icons; right panel becomes an overlay; charts reflow to 2-up |
| **Tablet (768–1023)** | Sidebar → slide-over drawer; single/two-column; tables → priority columns + horizontal scroll or card fallback; touch targets ≥44px |
| **Mobile (<768)** | Bottom tab bar (primary sections) + top bar; single column; tables become **stacked cards**; command palette → full-screen search; drawers full-height; sticky primary action |

**Rules:** design mobile and desktop as **distinct compositions**, not one squeezed into the
other; touch targets ≥44×44px; never hide critical actions behind hover on touch; content
priority reflows (most-important-first) rather than uniform shrink.

---

## 8. Component Library — Guidelines

For each: anatomy, variants, states, sizing, and behavior. All reference semantic tokens.
Universal states every interactive component supports: **default · hover · focus-visible ·
active/pressed · disabled · loading · error/invalid**.

### Buttons
- **Variants:** `primary` (brand solid), `secondary` (neutral outline), `tertiary/ghost`
  (text only), `destructive` (error solid), `subtle` (tinted fill). Plus `icon-only` and
  `split`.
- **Sizes:** `sm 32px` · `md 40px` (default) · `lg 48px`. Radius `md`. Label weight 600.
- **States:** hover lifts fill one step + subtle scale (1.01) on marketing/magnetic; focus =
  2px `brand-400` ring + 2px offset; loading = spinner replaces label, width locked; disabled =
  `neutral-200` bg / `neutral-400` text, no pointer.
- **Rules:** one primary per view/region; leading icon 16–20px; never more than a 2-word label
  where possible; full-width only in forms/mobile.

### Inputs (text/number/textarea)
- Anatomy: label (top, `caption` 500) · field · helper/error text · optional prefix/suffix/icon.
- Height 40px (`md`), radius `sm`, `1px neutral-300` border → `brand-500` on focus with ring.
- States: filled, focus, error (rose border + message), disabled, read-only, with-loading.
- Rules: labels always visible (no placeholder-as-label); placeholder is example text; validate
  on blur + on submit, not per-keystroke; error text replaces helper text.

### Dropdowns / Select / Combobox
- Trigger looks like an input; menu = `elevation-2` popover, radius `md`, 8px item padding,
  hover fill `neutral-100`, selected = check + brand text. Searchable (combobox) when >7 options.
  Keyboard: type-ahead, arrow nav, Enter select, Esc close. Virtualized for long lists.

### Checkboxes / Radios / Switches
- 18px control, radius `sm` (checkbox) / full (radio). Checked = `brand-500` fill + white glyph;
  smooth 150ms check-draw. **Switch** = 44×24 track, thumb slides with spring; ON = brand.
  Radios for exclusive ≤5 options; switch for instant on/off settings; checkbox for multi-select.

### Cards
- Surface `neutral-0`/dark surface, `1px` border, radius `md/lg`, `elevation-1`, padding
  `space-24`. Variants: static, interactive (hover lift + border→brand), stat/metric,
  media-top (marketing). Clear header/body/footer regions. Interactive cards get focus ring.

### Tables
- Financial-grade: `body-sm`, tabular numerals, 44–52px rows, sticky header, zebra optional
  (prefer hairline row borders). Features: column sort, resize, pin, row select (checkbox),
  bulk-action bar on select, inline actions on row hover, expandable rows, sticky first column
  on mobile. Right-align numeric columns. Empty/loading/error states per §6. Pagination or
  infinite scroll (cursor). Density toggle (comfortable/compact).

### Charts
- Follow `dataviz` skill. Minimal axes, no gridline clutter, direct labels over legends where
  possible, brand categorical palette, tooltips on hover/focus, animated draw-in (once, 400ms).
  Always a caption + units. Accessible: data table fallback + `aria` summaries.

### Forms
- Single-column preferred (faster completion); group with section headers; label-top; inline
  validation; sticky footer with primary/secondary on long forms; autosave for drafts
  (proposals, settings) with "Saved" micro-indicator; destructive actions confirmed.

### Tabs
- Underline style (2px brand indicator that **slides** between tabs, 200ms) for content
  switching; pill/segmented style for view toggles. Keyboard arrow-navigable; lazy-load panels.

### Accordions
- Chevron rotates 180° (200ms), content height animates (ease-out); one-open or multi-open
  variants. Used for FAQ, settings groups, nested filters.

### Dialogs (Modal)
- Centered, `elevation-4`, radius `lg`, max-width by purpose (sm 400 / md 520 / lg 720),
  scrim `neutral-950/40` with 4px backdrop blur. Enter: scale 0.96→1 + fade (200ms). Trap focus,
  Esc to close, restore focus on close. Reserve for focused decisions; avoid modal stacking.

### Drawers / Sheets
- Slide from right (detail/context) or bottom (mobile). Widths 360/480/640. Spring slide-in;
  overlay optional (non-modal drawers keep context). Used for record detail, filters, quick-create.

### Sidebars & Navigation
- **App sidebar:** logo/org switcher (top) · primary nav (grouped, icon+label) · secondary
  (settings, help) · user menu (bottom). Collapsible to 64px icon rail (tooltip labels).
  Active item = tinted fill + brand text + left indicator. Sections collapsible.
- **Top bar:** breadcrumb/context (left) · global search / ⌘K (center-right) · notifications ·
  help · avatar. 56px, `elevation-0` with bottom hairline, sticky.

### Breadcrumbs
- `body-sm`, `neutral-500` with `neutral-900` current; chevron separators; collapse middle with
  "…" menu when deep; last item not a link.

### Badges / Tags / Pills
- Status badges use semantic subtle-bg + solid text + optional 6px dot. Sizes sm/md. Count
  badges (notifications) = brand/rose pill. Tags (labels) = neutral or custom color, dismissible
  variant with ×. Never rely on color alone — include text/dot (accessibility).

### Tooltips
- `elevation-2`, dark surface (`neutral-900`) with white text (light mode), `caption`, 8px pad,
  6px offset, 300ms open-delay / 0 close. Arrow optional. Keyboard-focus triggers too. For
  supplementary info only — never house essential content in a tooltip.

### Progress Bars
- Linear (2–6px track, brand fill, animated width) and circular (rings for completion %).
  Determinate shows %; indeterminate uses a moving indent. Milestone/project progress uses a
  segmented bar (phases). Live-tracking bar animates smoothly on WS update.

### Timeline Components
- Vertical timeline for activity/history: node (dot/icon) + connector line + content card;
  grouped by day; internal-vs-client-visible styling; live entries fade/slide in at top.

### Kanban Cards
- Compact: title, labels (color dots), assignee avatar, due chip (color by urgency), progress/
  subtask count, priority flag. Drag = lift (`elevation-3`) + tilt 2° + column drop-zone
  highlight; smooth FLIP reorder. Column header shows count + WIP limit.

### Calendar
- Month/week/day/agenda views. Events colored by type/project; drag to reschedule; today marker;
  overflow "+N more"; mini-calendar in sidebars. Timezone-aware; keyboard navigable.

### File Upload
- Dropzone (dashed border → brand on drag-over) + browse; per-file progress rows with thumbnail,
  name, size, status, cancel/retry; image preview; type/size validation with clear errors;
  presigned direct-to-R2 (see `BACKEND.md §9`). Paste-to-upload supported.

### Comment Box
- Rich text (bold/italic/lists/code/link), @mention autocomplete (avatar popover), file attach,
  internal-vs-client toggle (clearly labeled + color-coded), submit on ⌘Enter. Threaded replies
  indent one level; edited/resolved indicators.

### Chat / AI UI
- Message list (user right / AI left or full-width), streaming token render, markdown + code
  blocks with copy, tool-call/"thinking" affordance (collapsible), suggested-prompt chips,
  citation chips linking to source records, token/cost subtle in footer, stop-generation control.
  AI surfaces use the violet AI-accent + a subtle shimmer while generating.

### Notifications (in-app)
- **Toast** (transient) and **notification center** (bell → popover/drawer list): grouped,
  unread dot, icon by type, timestamp (relative), deep-link on click, mark-read/read-all,
  preferences link. Real-time insert with slide+fade. Empty state per §6.

### Activity Feed
- Chronological, grouped by day, actor avatar + verb + object + relative time, filterable
  (type/project/person), client-visible items styled distinctly, live prepend on new events.

---

## 9. Motion Design

### 9.1 Principles
1. **Purpose only** — motion explains state change, spatial origin, or hierarchy. No motion for
   motion's sake.
2. **Fast & subtle in-product** (100–250ms); **expressive on marketing** (300–800ms, choreographed).
3. **Natural easing** — spring/ease-out for entrances, ease-in for exits; avoid linear except
   progress/marquee.
4. **Interruptible & reversible** — animations respond to rapid input, never block interaction.
5. **Respect `prefers-reduced-motion`** — replace movement with instant/opacity changes.

### 9.2 Timing & easing tokens
| Token | Duration | Use |
|---|---|---|
| `motion-instant` | 80ms | state toggles, hover fills |
| `motion-fast` | 150ms | buttons, checkboxes, tabs |
| `motion-base` | 220ms | dropdowns, tooltips, cards |
| `motion-slow` | 320ms | dialogs, drawers, page regions |
| `motion-expressive` | 500–800ms | marketing reveals, hero |

Easings: `ease-out-quad` (entrances), `ease-in-quad` (exits), `spring(stiffness 260, damping 26)`
(playful/drag), `ease-in-out` (loops).

### 9.3 In-product micro-interactions (Framer Motion / 21st.dev)
Hover lifts, focus rings, tab indicator slide, switch spring, checkmark draw, skeleton shimmer,
optimistic row insert/remove (FLIP), drag lift on Kanban, toast slide, number count-up on
metrics, sidebar collapse, chevron rotations, live-progress bar tween. **Page transitions:**
subtle cross-fade + 8px rise (App Router); shared-element for list→detail where it aids continuity.

### 9.4 Marketing motion (expressive, choreographed)
- **Smooth scrolling** (Lenis — already in stack) with restraint.
- **Scroll-reveal:** sections fade + rise (24px, staggered children 60ms) on enter-viewport, once.
- **Parallax:** subtle depth on hero media/background layers (≤ 20% travel).
- **Magnetic buttons:** primary CTAs pull ~6–10px toward cursor with spring; label stays centered.
- **Cursor interactions:** custom cursor / hover-grow on interactive media (desktop only).
- **Animated gradients & backgrounds:** slow-drifting brand-gradient mesh / grain on hero;
  GPU-friendly, pauses off-screen and under reduced-motion.
- **Sticky sections:** pinned scroll-scrub sequences for "how it works" / process.
- **Reveal on load:** hero headline word-stagger + media scale-in; above-the-fold ≤ 800ms total.

**Performance guardrails:** animate only `transform`/`opacity`; `will-change` sparingly; 60fps
target; lazy-init heavy scroll effects; disable/reduce on mobile + reduced-motion.

---

## 10. Dashboard UX (per role)

**Shared shell:** left sidebar + top bar (⌘K search, notifications, avatar) + content + optional
right context panel. **Command palette (⌘K)** is universal: navigate, create, search, run actions,
switch org/project — role-scoped results.

### 10.1 Client Dashboard
- **Goal:** confidence + self-serve. Calm, curated, zero internal noise.
- **Nav:** Overview · Projects · Deliverables/Approvals · Invoices · Files · Messages · Support.
- **Home widgets:** active project status + live progress ring, next milestone, pending approvals,
  outstanding balance, recent activity, quick "request/change" action.
- **Quick actions:** approve deliverable, pay invoice, request change, message team.
- **Tone:** spacious, jargon-free, celebratory on milestones.

### 10.2 Admin Dashboard
- **Goal:** run the business at a glance → drill anywhere.
- **Nav:** Overview · Clients · Projects · CRM · Finance · Team · Catalog · CMS · Analytics ·
  Settings.
- **Home widgets:** revenue + pipeline value, active projects by health (green/amber/red),
  utilization, cash/AR, approvals queue, AI PM flags, recent activity. Configurable widget grid.
- **Quick actions:** new project, create invoice, add client, send proposal.
- **Density:** information-dense but hierarchical; KPI row → charts → tables.

### 10.3 Employee Dashboard
- **Goal:** focus on "my work," minimal friction.
- **Nav:** My Work · My Projects · Calendar · Timesheets · Notifications.
- **Home widgets:** today's tasks (priority-sorted), active timer, week workload bar, upcoming
  due, mentions, quick time-log.
- **Quick actions:** start timer, update task status, log time, comment.
- **Feel:** Linear-fast, keyboard-driven, distraction-free.

### 10.4 Finance Dashboard
- **Goal:** money clarity + control.
- **Nav:** Overview · Invoices · Payments · Subscriptions · Refunds · Reports · Taxes.
- **Home widgets:** MRR/revenue, AR aging, overdue invoices, cash in/out, payment success rate,
  profitability by client/project.
- **Quick actions:** issue invoice, record payment, approve refund, export report.
- **Style:** financial-grade tables, tabular numerals, precise, exportable.

### 10.5 Support Dashboard
- **Goal:** fast resolution + SLA awareness.
- **Nav:** Tickets · Queue · Knowledge Base · Clients · Reports.
- **Home widgets:** open tickets by priority, SLA breaches/at-risk, unassigned queue, CSAT,
  response time, AI-suggested replies.
- **Quick actions:** reply, assign, escalate, create change-order, add KB article.

---

## 11. Marketing Website UX

Premium, motion-rich, conversion-focused. Shared: sticky translucent nav (blur on scroll), clear
CTA ("Start a project" / "Log in"), footer with sitemap + trust signals, dark-mode toggle.

- **Home:** hero (headline + gradient/animated bg + primary CTA + product visual) → logo marquee
  (trust) → services showcase → live-tracking/product highlight → outcomes/metrics → case-study
  teasers → process → testimonials → pricing preview → CTA band. Scroll-choreographed.
- **About:** story, mission, team grid (hover reveal), values, culture, careers link.
- **Services:** overview grid → per-service detail (deliverables, process, pricing model, sample
  work, FAQ, CTA). Driven by Service Catalog.
- **Portfolio / Work:** filterable grid (industry/service) → case-study detail (problem → approach
  → solution → results metrics → gallery → testimonial → CTA). Rich media, parallax.
- **Pricing:** plan/package cards (highlight recommended), toggle (one-off vs retainer), feature
  comparison table, FAQ, CTA. Transparent, trust-building.
- **Blog:** index (featured + grid, category filter, search) → article (readable measure, TOC,
  author, related, share). Driven by Blog CMS.
- **Case Studies:** dedicated depth format (can overlap Portfolio) — narrative + data viz + pull
  quotes.
- **Contact:** form (name/email/company/service/budget/message) → CRM lead; alt channels; calendar
  booking; response-time promise. Success state confirms + sets expectations.

---

## 12. Design Tokens Strategy

**Three-tier token architecture** (industry best practice — Stripe/GitHub Primer model):

1. **Primitive/global tokens** — raw values: `color.neutral.500 = #6B7280`, `space.4 = 16px`,
   `radius.md = 10px`, `duration.base = 220ms`. No meaning, just values.
2. **Semantic/alias tokens** — intent-mapped, theme-aware: `color.bg.canvas`, `color.bg.surface`,
   `color.text.primary`, `color.text.secondary`, `color.border.default`, `color.action.primary`,
   `color.status.success`, `color.focus.ring`. **Components reference only these.** Light/dark
   supply different primitives behind the same semantic name.
3. **Component tokens (optional)** — `button.primary.bg`, `input.border.focus` — for components
   needing overrides; default to inheriting semantic tokens.

**Token categories**
| Category | Examples |
|---|---|
| **Color** | `bg.*`, `text.*`, `border.*`, `action.*`, `status.*`, `chart.*`, `ai.*` |
| **Spacing** | `space.0…128` |
| **Typography** | `font.family.*`, `font.size.*`, `font.weight.*`, `line.*`, `tracking.*` |
| **Radius** | `radius.sm…full` |
| **Shadow/Elevation** | `elevation.0…4`, `focus.ring` |
| **Animation** | `duration.*`, `easing.*` |
| **Opacity** | `opacity.disabled .4`, `opacity.muted .64`, `opacity.scrim .4`, `opacity.hover .08` |
| **Z-index** | `z.base 0`, `z.sticky 100`, `z.dropdown 1000`, `z.drawer 1100`, `z.dialog 1200`, `z.toast 1300`, `z.command 1400`, `z.tooltip 1500` |

**Delivery:** tokens defined once (e.g., a `tokens.json` / Style Dictionary source) → exported to
CSS variables (light/dark themes) → consumed by Tailwind config + components. **Single source of
truth**; theming = swap the primitive layer; multi-tenant white-label **[SaaS]** = per-tenant
primitive overrides (brand color, radius, logo) leaving semantics intact.

---

## 13. Accessibility (WCAG 2.2 AA+)

- **Contrast:** text ≥ 4.5:1 (≥3:1 for large/UI); validate every semantic pair in light **and**
  dark; never convey status by color alone (pair with icon/text/dot).
- **Keyboard:** every interactive element reachable and operable; logical tab order; visible
  `focus-visible` ring (2px `brand-400` + offset) on all focusables; no keyboard traps; Esc closes
  overlays; ⌘K palette as a keyboard superpower; documented shortcuts.
- **Screen readers:** semantic HTML first; ARIA only to fill gaps (roles, `aria-live` for
  toasts/async, labeled inputs, described errors); dialogs/drawers manage focus + `aria-modal`;
  tables use proper headers/scope; icons have accessible names.
- **Motion:** honor `prefers-reduced-motion` — swap movement for opacity/instant; no essential
  info conveyed only through motion; no auto-play that can't be paused; nothing flashes >3×/s.
- **Targets & forms:** ≥44px touch targets; labels always associated; errors announced +
  programmatically linked; helpful, specific error messages.
- **Content:** clear language, meaningful link text, alt text on informative images, captions on
  video, respect user font-size/zoom (rem-based).
- **Testing:** automated (axe) in CI + manual keyboard/SR passes on key flows before ship.

---

## 14. Design Review — Coherence, Risks & Recommendations

**How this holds together:** every surface pulls from one token set, one type scale, one motion
vocabulary, and one state grammar — so Client, Admin, Employee, Finance, and Support dashboards
plus the marketing site read as **one product** despite different densities. Density is the lever
that differentiates roles (spacious client vs dense admin), not new visual languages.

**Risks & mitigations**
1. **Over-animation on marketing** → strict motion budget, reduced-motion parity, 60fps guardrails,
   animate only transform/opacity.
2. **Dashboard density vs clarity** → hierarchy (KPI→chart→table), progressive disclosure, right
   panel for detail instead of cramming.
3. **Dark-mode contrast regressions** → tokens carry both themes; contrast validated per pair in CI.
4. **Accent overuse dilutes signal** → one primary per region; color reserved for meaning.
5. **Component drift over time** → three-tier tokens + a documented component library are the
   guardrail; components reference semantic tokens only.
6. **White-label future** → semantic-token indirection means a tenant can rebrand (color/radius/
   logo) without touching component design.

**Recommended build order:** tokens → primitives (button/input/card/table/badge/dialog) → shell
(sidebar/topbar/command palette) → state system (empty/loading/error) → role dashboards →
marketing. Build the **token layer and 8 core primitives first**; everything else composes from them.

---

## 15. Open Design Decisions (to ratify)

1. **Primary typeface:** Inter vs Geist (recommend **Inter** for numerics/legibility; Geist for a
   more distinct brand voice).
2. **Brand accent:** confirm indigo-violet `#5B5BF0` (vs a more differentiated hue).
3. **Icon set:** stay on **Lucide** (in stack) vs custom set for brand moments.
4. **Token tooling:** Style Dictionary vs hand-authored CSS variables → Tailwind.
5. **Marketing motion intensity:** how expressive (Framer-maximal) vs restrained (Linear-minimal)?
6. **Command palette scope in v1:** navigation + search only, or full action-execution from day one?

---

*End of Design System v1.0. This is the source of truth for the eventual Tailwind theme,
component library, and Storybook. Next artifacts (after sign-off): the token file, a component
spec sheet per primitive, and high-fidelity mockups of the three core dashboards + marketing home.
No React/Tailwind code until ratified.*
