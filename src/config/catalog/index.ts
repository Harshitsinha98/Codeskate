/**
 * Service Catalog registry — barrel + convenience lookups.
 * Import from "@/config/catalog". This is the single source of truth the
 * marketing website reads from; a future API can replace these modules'
 * internals without changing any consumer.
 */

export {
  CATALOG_SERVICES,
  getService,
  getServicesByCategory,
  getPackage,
} from "@/config/catalog/services";
export { SERVICE_CATEGORIES, getCategory } from "@/config/catalog/categories";
export { packagesToPlans } from "@/config/catalog/adapters";
