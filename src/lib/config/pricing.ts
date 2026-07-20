/**
 * CENTRALIZED PRICING CONFIG — single source of truth for the marketing layer.
 *
 * Currency, GST, discount, support and validity live here. Every marketing
 * page/component reads from this file (directly or via `plans.ts`/`offers.ts`).
 * Change a value here and it cascades sitewide.
 *
 * NOTE: This is the *marketing / display* source of truth. The checkout,
 * invoicing and proposal engines keep their own authoritative catalog
 * (`src/config/catalog`) — this file never drives payment math.
 */

export const CURRENCY = {
  code: "INR",
  symbol: "₹",
  locale: "en-IN",
} as const;

export const GST = {
  /** GST percentage applied to Indian invoices (display only). */
  percentage: 18,
  label: "GST (18%)",
  inclusive: false,
} as const;

/** Sitewide launch discount headline used across hero, offers and cards. */
export const DISCOUNT = {
  percentage: 60,
  label: "60% off",
  badge: "Limited Time Launch Offer",
} as const;

/** Support / warranty window bundled with the launch offer. */
export const SUPPORT = {
  launchDays: 30,
  label: "30 Days Support",
} as const;

/** How long the current promotional pricing is valid (display copy). */
export const VALIDITY = {
  label: "Limited period offer",
  note: "Pricing valid for new projects booked this quarter.",
} as const;

/** EMI eligibility (display flag surfaced on higher tiers). */
export const EMI = {
  eligible: true,
  minAmount: 25000,
  note: "EMI available on eligible engagements.",
} as const;

/** Standard milestone split shown on proposals / billing summaries. */
export const PAYMENT_MILESTONES = [
  { label: "Kickoff", percentage: 40 },
  { label: "Design sign-off", percentage: 30 },
  { label: "Delivery", percentage: 30 },
] as const;

/**
 * Format a numeric amount as an INR price string (e.g. 9999 → "₹9,999").
 * Single formatter so no component hardcodes the symbol or grouping.
 */
export function formatPrice(amount: number): string {
  return `${CURRENCY.symbol}${amount.toLocaleString(CURRENCY.locale)}`;
}

/** Append a billing cadence suffix, e.g. "₹5,999/mo". */
export function formatPriceWithCadence(amount: number, suffix?: string): string {
  return suffix ? `${formatPrice(amount)}${suffix}` : formatPrice(amount);
}
