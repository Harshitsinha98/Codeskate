/**
 * Adapters bridging Service Catalog data to existing marketing components.
 * Keeps `@/components/sections/PricingCards` and `@/lib/pricing`'s `Plan` type
 * unchanged (zero risk to the sitewide /pricing page) while letting the
 * catalog's per-service packages render through the SAME component.
 */

import type { Plan } from "@/lib/pricing";
import type { ServicePackage } from "@/types/catalog";
import { waLink } from "@/lib/site";

/**
 * Convert a service's packages into `Plan`s for `<PricingCards />`.
 * Each plan's CTA opens a WhatsApp enquiry with the package pre-filled — there
 * is no self-serve checkout/payment on the marketing site; pricing is confirmed
 * over chat.
 */
export function packagesToPlans(packages: ServicePackage[]): Plan[] {
  return packages.map((pkg) => ({
    name: pkg.name,
    price: pkg.priceLabel,
    cadence: pkg.cadence,
    tagline: pkg.tagline,
    featured: pkg.featured,
    features: pkg.features,
    cta: pkg.ctaLabel,
    ctaHref: waLink(
      `Hi CodeSkate, I'd like to enquire about the ${pkg.name} package (${pkg.priceLabel}).`
    ),
  }));
}
