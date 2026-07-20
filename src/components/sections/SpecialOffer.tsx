/**
 * Dedicated launch-offer promo. Now a thin wrapper over the reusable,
 * config-driven <OfferBanner />, which reads the centralized primary offer
 * (price, includes, discount) from `@/lib/config/offers`.
 */
export { OfferBanner as SpecialOffer } from "@/components/pricing/OfferBanner";
