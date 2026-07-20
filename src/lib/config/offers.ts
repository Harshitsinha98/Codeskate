/**
 * CENTRALIZED OFFERS — every promotional offer lives here.
 *
 * Hero card, SpecialOffer section and any banner read from these. Toggle
 * `visible` to show/hide an offer sitewide; change price/discount once.
 */

import { formatPrice } from "./pricing";

export type Offer = {
  id: string;
  name: string;
  headline: string;
  badge: string;
  /** Numeric offer price in INR. */
  price: number;
  /** Numeric pre-discount price in INR. */
  oldPrice: number;
  discountPercentage: number;
  couponCode: string | null;
  /** ISO date string; null = no expiry. */
  expiry: string | null;
  visible: boolean;
  ctaText: string;
  ctaLink: string;
  /** Feature checklist shown with the offer. */
  includes: string[];
  /** Short supporting copy. */
  description: string;
};

export const OFFERS: Record<string, Offer> = {
  launch: {
    id: "launch",
    name: "Launch Offer",
    headline: "Professional Business Website",
    badge: "Limited Time Launch Offer",
    price: 5999,
    oldPrice: 14999,
    discountPercentage: 60,
    couponCode: "LAUNCH60",
    expiry: null,
    visible: true,
    ctaText: "Claim Offer",
    ctaLink: "/contact",
    includes: [
      "Responsive Website",
      "Premium UI Design",
      "SEO Setup",
      "Contact Form",
      "WhatsApp Integration",
      "Admin Panel",
      "30 Days Support",
    ],
    description:
      "Everything a growing business needs to look credible online and start winning customers — designed, built and launched by a senior product team.",
  },
};

/** The primary active offer surfaced on the homepage hero + offer section. */
export const PRIMARY_OFFER: Offer = OFFERS.launch;

export function offerPriceLabel(offer: Offer): string {
  return formatPrice(offer.price);
}

export function offerOldPriceLabel(offer: Offer): string {
  return formatPrice(offer.oldPrice);
}

export function offerSaveLabel(offer: Offer): string {
  return `Save ${offer.discountPercentage}%`;
}
