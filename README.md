# CodeSkate — Product Engineering Company Website

A production-grade marketing site for **CodeSkate** ("Engineering Software That Scales."), a product engineering company. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion and Lenis.

> CodeSkate is a brand created for this project. All clients, case studies, testimonials, team members and metrics are illustrative — swap them for real content before going live.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
```

## Tech stack

| Concern            | Choice                                             |
| ------------------ | -------------------------------------------------- |
| Framework          | Next.js 16 (App Router, RSC, Turbopack)            |
| Language           | TypeScript (strict)                                |
| Styling            | Tailwind CSS 3 + custom design tokens              |
| Motion             | Framer Motion (reveals, split-text, magnetic, tilt) |
| Smooth scroll      | Lenis (`lenis/react`)                              |
| Icons              | lucide-react                                       |
| Fonts              | Inter (sans) + Fraunces (display), via `next/font` |

## What's included

**Design system** — Premium light theme (`#FAFAFA` base, royal-blue → violet → cyan accents), mesh gradients, noise texture, glassmorphism, animated borders, soft/lift/glow shadows, editorial type scale. Tokens live in `tailwind.config.ts` and `src/app/globals.css`.

**Motion primitives** (`src/components/motion/`) — Smooth scroll, custom cursor follower, scroll progress bar, scroll reveals, staggered reveals, masked split-text headline reveal, and magnetic buttons. All respect `prefers-reduced-motion`.

**Pages** (20+ routes)

- `/` — Home: hero, logo marquee, services, featured work, process timeline, industries, testimonials, tech stack, awards, pricing, FAQ, blog preview, CTA
- `/services` + 8 detailed `/services/[slug]` pages (deliverables, outcomes, process, tech, CTA)
- `/work` + 4 interactive `/work/[slug]` case studies (problem → research → approach → build → results, before/after, testimonial)
- `/about`, `/process`, `/industries`, `/pricing` (with animated comparison table), `/careers`
- `/blog` + 3 full `/blog/[slug]` articles
- `/contact` (animated multi-step form, WhatsApp/Calendly/map), `/privacy`, `/terms`, custom `404`

**SEO** — Per-page metadata, Open Graph + Twitter cards, dynamically generated OG image (`opengraph-image.tsx`) and favicon (`icon.tsx`), JSON-LD (Organization, Service, FAQPage, BlogPosting), `sitemap.xml`, `robots.txt`, web manifest, semantic HTML.

## Project structure

```
src/
  app/                 # routes, metadata, sitemap/robots/manifest, OG image
  components/
    layout/            # navbar (mega menu), footer, announcement bar, page header
    motion/            # reusable animation primitives
    sections/          # composable page sections (hero, services, work, …)
    ui/                # button, badge, logo, marquee, section heading
  lib/                 # site config + all content data (single source of truth)
```

## Editing content

All copy and data are centralized in `src/lib/`:

- `site.ts` — brand name, contact details, navigation, footer links
- `services.ts` — the 8 services (capabilities, deliverables, process, tech)
- `content.ts` — case studies, testimonials, stats, industries, process, FAQs, awards, tech stack
- `pricing.ts` — plans + comparison matrix
- `blog.ts` / `blog-content.tsx` — posts + article bodies

Change the brand in `site.ts` and the whole site updates.

## Notes / next steps for production

- Forms (contact, newsletter) are client-side only — wire them to your backend / email provider / CRM.
- Replace the CSS-gradient project/blog "mockups" with real screenshots via `next/image`.
- Point Calendly, WhatsApp and social links in `site.ts` at real destinations.
- Add real analytics; the layout already ships JSON-LD and full metadata.
