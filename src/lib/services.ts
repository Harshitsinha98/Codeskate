/**
 * Service catalogue — re-exports the real Service Catalog module.
 *
 * The full data (categories, packages, add-ons, comparison rows) now lives in
 * "@/config/catalog", shaped to match docs/DATABASE.md so it can later be
 * replaced by an API without touching any consumer. This file exists purely
 * so existing imports of "@/lib/services" (`services`, `getService`, the
 * `Service` type) keep resolving unchanged.
 */

export type { CatalogService as Service } from "@/types/catalog";
export { CATALOG_SERVICES as services, getService } from "@/config/catalog";
