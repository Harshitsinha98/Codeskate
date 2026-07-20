/**
 * Service-type resolution — maps a catalog service slug to the coarse delivery
 * `ServiceType` used across the project engine. Extracted into its own module so
 * both `@/config/project-templates` and `@/lib/project-service` can share it
 * without a circular import.
 *
 * The catalog has no explicit serviceType column yet, so this is the single
 * translation point; unknown slugs fall back to "custom" (never throws) so
 * delivery can never block a paid order.
 */

import type { ServiceType } from "@/types/project";

const SLUG_TO_SERVICE_TYPE: Record<string, ServiceType> = {
  "web-development": "website",
  "mobile-apps": "app",
  "ui-ux-design": "website",
  branding: "branding",
  "digital-marketing": "marketing",
  "paid-advertising": "marketing",
  "ai-automation": "ai_automation",
  "maintenance-growth": "custom",
};

export function serviceTypeForSlug(slug: string): ServiceType {
  return SLUG_TO_SERVICE_TYPE[slug] ?? "custom";
}
