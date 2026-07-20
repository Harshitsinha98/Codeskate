/**
 * Site configuration home for AgencyOS.
 *
 * NOTE: The existing brand/nav config lives at "@/lib/site" and is used by many
 * live marketing components. To avoid moving files or breaking imports, this file
 * RE-EXPORTS it — giving the enterprise `config/` layer a home while keeping full
 * backwards compatibility. Both "@/lib/site" and "@/config/site" resolve identically.
 */

export * from "@/lib/site";
export { site as default } from "@/lib/site";
