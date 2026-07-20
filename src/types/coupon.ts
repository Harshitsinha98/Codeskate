/**
 * Coupon domain types for the checkout pricing engine.
 * Interfaces only. Shaped to match docs/DATABASE.md `coupons` so a future
 * backend can validate coupons server-side against the SAME structure.
 *
 * No backend validation exists yet — `validateCoupon` in
 * `@/lib/pricing-engine` performs the same checks CLIENT-SIDE against a small
 * local `COUPONS` registry (`@/config/coupons`). This is explicitly a stand-in:
 * the validation STRUCTURE (error codes, order-of-checks) is the real,
 * reusable contract; the data source is the part that gets swapped later.
 */

import type { ISODateString, Money } from "@/types/common";
import type { CouponDiscountType, CouponValidationErrorCode } from "@/constants/coupon";

export interface Coupon {
  code: string;
  discountType: CouponDiscountType;
  /** Percentage points (0-100) when discountType is "percentage". */
  percentageValue?: number;
  /** Flat amount when discountType is "flat". */
  flatValue?: Money;
  expiresAt: ISODateString | null;
  /** Minimum order subtotal (before discount/tax) required to redeem. */
  minimumOrder: Money | null;
  isActive: boolean;
}

export type CouponValidationResult =
  | { valid: true; coupon: Coupon }
  | { valid: false; code: CouponValidationErrorCode; message: string };
