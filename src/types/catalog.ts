/**
 * Service Catalog domain types for AgencyOS marketing.
 *
 * Shaped to match docs/DATABASE.md (`service_categories`/`services`/`packages`/
 * `package_features`/`addons`) so this local TypeScript module can later be
 * replaced by an API response with the SAME shape — no UI changes required.
 *
 * `CatalogService` is a strict superset of the original `Service` type it
 * replaces (same field names/types for slug, index, title, tagline, summary,
 * outcome, capabilities, deliverables, outcomes, process, technologies,
 * accent) — every existing consumer keeps compiling unchanged.
 */

import type { Money } from "@/types/common";
import type { PackageTier, PricingModel } from "@/constants/catalog";

export type CatalogAccent = "royal" | "violet" | "cyan";

/** A grouping of related services (e.g. "Design & Engineering"). */
export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export interface ServiceOutcomeMetric {
  metric: string;
  label: string;
}

export interface ServiceProcessStep {
  title: string;
  detail: string;
}

/** One row of the per-service package comparison table. */
export interface ServiceComparisonRow {
  feature: string;
  /** One value per package, in `CatalogService.packages` order. */
  values: (boolean | string)[];
}

/** A single tier (Basic / Standard / Premium) of a service's packages. */
export interface ServicePackage {
  id: string;
  serviceSlug: string;
  tier: PackageTier;
  name: string;
  tagline: string;
  priceLabel: string;
  /** Optional exact starting price — populated once a backend/API exists. */
  priceFrom?: Money;
  cadence: string;
  featured?: boolean;
  features: string[];
  ctaLabel: string;
}

/** An optional add-on purchasable alongside any package of a service. */
export interface ServiceAddon {
  id: string;
  serviceSlug: string;
  name: string;
  description: string;
  priceLabel: string;
  priceFrom?: Money;
}

export interface CatalogService {
  slug: string;
  categoryId: string;
  index: string;
  title: string;
  tagline: string;
  summary: string;
  outcome: string;
  capabilities: string[];
  deliverables: string[];
  outcomes: ServiceOutcomeMetric[];
  process: ServiceProcessStep[];
  technologies: string[];
  accent: CatalogAccent;
  pricingModel: PricingModel;
  packages: ServicePackage[];
  addons: ServiceAddon[];
  comparisonRows: ServiceComparisonRow[];
}
