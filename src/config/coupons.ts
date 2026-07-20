/**
 * Coupon registry — real, working local data (not a database yet).
 * Consumed by `@/lib/pricing-engine`'s `validateCoupon`. A future backend
 * replaces this lookup with an API call against the SAME `Coupon` shape.
 */

import type { Coupon } from "@/types/coupon";
import { COUPON_DISCOUNT_TYPES } from "@/constants/coupon";

export const COUPONS: Coupon[] = [
  {
    code: "LAUNCH10",
    discountType: COUPON_DISCOUNT_TYPES.PERCENTAGE,
    percentageValue: 10,
    expiresAt: "2026-12-31T23:59:59.000Z",
    minimumOrder: { amountMinor: 10000000, currency: "INR" }, // ₹1L
    isActive: true,
  },
  {
    code: "FLAT5000",
    discountType: COUPON_DISCOUNT_TYPES.FLAT,
    flatValue: { amountMinor: 500000, currency: "INR" }, // ₹5,000
    expiresAt: "2026-12-31T23:59:59.000Z",
    minimumOrder: { amountMinor: 5000000, currency: "INR" }, // ₹50k
    isActive: true,
  },
  {
    code: "EXPIRED",
    discountType: COUPON_DISCOUNT_TYPES.PERCENTAGE,
    percentageValue: 15,
    expiresAt: "2025-01-01T00:00:00.000Z",
    minimumOrder: null,
    isActive: true,
  },
];

export const findCoupon = (code: string): Coupon | undefined =>
  COUPONS.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
