/**
 * Checkout pricing engine — the reusable calculation utility.
 * Pure functions, no framework dependency: base price → add-ons → discount
 * (coupon) → GST → grand total. Designed so a future backend can perform the
 * IDENTICAL calculation server-side (same inputs, same order of operations)
 * to authoritatively verify whatever the client computed.
 */

import type { Money } from "@/types/common";
import type { ServiceAddon, ServicePackage } from "@/types/catalog";
import type { Coupon, CouponValidationResult } from "@/types/coupon";
import type { PriceBreakdown } from "@/types/checkout";
import { COUPON_VALIDATION_ERRORS } from "@/constants/coupon";
import { DEFAULT_TAX_RATE_PERCENT } from "@/constants/checkout";
import { findCoupon } from "@/config/coupons";
import { addMoney, percentOfMoney, subtractMoney, sumMoney, zeroMoney } from "@/lib/money";

/**
 * Validate a coupon code against the (currently local) coupon registry.
 * Checks run in a fixed order — existence → active → expiry → minimum order —
 * so a future server-side validator can mirror the exact same sequence and
 * error codes without behavior drift.
 */
export function validateCoupon(
  code: string,
  orderSubtotal: Money
): CouponValidationResult {
  const coupon = findCoupon(code);

  if (!coupon) {
    return {
      valid: false,
      code: COUPON_VALIDATION_ERRORS.NOT_FOUND,
      message: "That coupon code doesn't exist.",
    };
  }
  if (!coupon.isActive) {
    return {
      valid: false,
      code: COUPON_VALIDATION_ERRORS.INACTIVE,
      message: "This coupon is no longer active.",
    };
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return {
      valid: false,
      code: COUPON_VALIDATION_ERRORS.EXPIRED,
      message: "This coupon has expired.",
    };
  }
  if (
    coupon.minimumOrder &&
    orderSubtotal.currency === coupon.minimumOrder.currency &&
    orderSubtotal.amountMinor < coupon.minimumOrder.amountMinor
  ) {
    return {
      valid: false,
      code: COUPON_VALIDATION_ERRORS.BELOW_MINIMUM_ORDER,
      message: `This coupon requires a minimum order of ${formatMinimum(coupon.minimumOrder)}.`,
    };
  }

  return { valid: true, coupon };
}

function formatMinimum(money: Money): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: money.currency,
    minimumFractionDigits: 0,
  }).format(money.amountMinor / 100);
}

/** Compute the discount amount a coupon yields against a given subtotal. */
export function calculateDiscount(coupon: Coupon, subtotal: Money): Money {
  if (coupon.discountType === "percentage" && coupon.percentageValue) {
    return percentOfMoney(subtotal, coupon.percentageValue);
  }
  if (coupon.discountType === "flat" && coupon.flatValue) {
    return {
      amountMinor: Math.min(coupon.flatValue.amountMinor, subtotal.amountMinor),
      currency: subtotal.currency,
    };
  }
  return zeroMoney(subtotal.currency);
}

export interface CalculateOrderInput {
  pkg: ServicePackage;
  addons: ServiceAddon[];
  coupon?: Coupon | null;
  taxRatePercent?: number;
}

/**
 * Compute the full order breakdown: base price → add-ons → subtotal →
 * discount (coupon) → GST (or any future tax, via `taxRatePercent`) → total.
 * GST is applied to the POST-DISCOUNT amount (standard practice).
 */
export function calculateOrder({
  pkg,
  addons,
  coupon = null,
  taxRatePercent = DEFAULT_TAX_RATE_PERCENT,
}: CalculateOrderInput): PriceBreakdown {
  const currency = pkg.priceFrom?.currency ?? "INR";
  const basePrice = pkg.priceFrom ?? zeroMoney(currency);

  const addonLines = addons.map((addon) => ({
    label: addon.name,
    amount: addon.priceFrom ?? zeroMoney(currency),
  }));
  const addonsTotal = sumMoney(
    addonLines.map((l) => l.amount),
    currency
  );

  const subtotal = addMoney(basePrice, addonsTotal);

  const discount = coupon ? calculateDiscount(coupon, subtotal) : zeroMoney(currency);
  const discountLabel = coupon
    ? coupon.discountType === "percentage"
      ? `${coupon.code} (-${coupon.percentageValue}%)`
      : `${coupon.code} (flat discount)`
    : null;

  const taxableAmount = subtractMoney(subtotal, discount);
  const tax = percentOfMoney(taxableAmount, taxRatePercent);
  const grandTotal = addMoney(taxableAmount, tax);

  return {
    basePrice,
    addonsTotal,
    addonLines,
    subtotal,
    discount,
    discountLabel,
    taxableAmount,
    tax,
    taxRatePercent,
    grandTotal,
  };
}
