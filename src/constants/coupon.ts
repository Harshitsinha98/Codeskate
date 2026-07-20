/**
 * Coupon constants for the checkout pricing engine.
 * Values only — mirrors docs/DATABASE.md `coupons.type` (percent/fixed).
 */

export const COUPON_DISCOUNT_TYPES = {
  PERCENTAGE: "percentage",
  FLAT: "flat",
} as const;

export type CouponDiscountType =
  (typeof COUPON_DISCOUNT_TYPES)[keyof typeof COUPON_DISCOUNT_TYPES];

export const COUPON_VALIDATION_ERRORS = {
  NOT_FOUND: "not_found",
  INACTIVE: "inactive",
  EXPIRED: "expired",
  BELOW_MINIMUM_ORDER: "below_minimum_order",
} as const;

export type CouponValidationErrorCode =
  (typeof COUPON_VALIDATION_ERRORS)[keyof typeof COUPON_VALIDATION_ERRORS];
