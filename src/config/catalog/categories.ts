/**
 * Service categories — groups the catalog's services for the /services listing.
 * Real data module (not a database yet); shaped to match a future API response
 * 1:1, per docs/DATABASE.md `portfolio_categories`-style tables.
 */

import type { ServiceCategory } from "@/types/catalog";

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "design-engineering",
    slug: "design-engineering",
    name: "Design & Engineering",
    description:
      "Websites, apps and interfaces engineered to convert — and designed to be loved.",
  },
  {
    id: "brand-growth",
    slug: "brand-growth",
    name: "Brand & Growth",
    description:
      "Identity, content and performance media that compound demand month over month.",
  },
  {
    id: "ai-continuity",
    slug: "ai-continuity",
    name: "AI & Continuity",
    description:
      "Automation and an always-on partner that keep your product improving after launch.",
  },
];

export const getCategory = (slug: string) =>
  SERVICE_CATEGORIES.find((c) => c.slug === slug);
