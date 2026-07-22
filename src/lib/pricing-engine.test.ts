import { describe, it, expect } from "vitest";
import {
  calculateOrder,
  calculateDiscount,
  validateCoupon,
} from "@/lib/pricing-engine";
import type { ServicePackage, ServiceAddon } from "@/types/catalog";
import type { Coupon } from "@/types/coupon";
import { COUPON_DISCOUNT_TYPES, COUPON_VALIDATION_ERRORS } from "@/constants/coupon";

const pkg = (amountMinor: number): ServicePackage =>
  ({
    id: "pkg_1",
    serviceSlug: "web-development",
    tier: "standard",
    name: "Standard",
    tagline: "",
    priceLabel: "",
    priceFrom: { amountMinor, currency: "INR" },
    cadence: "",
    features: [],
    ctaLabel: "",
  }) as ServicePackage;

const addon = (amountMinor: number, name = "Add-on"): ServiceAddon =>
  ({
    id: `addon_${amountMinor}`,
    serviceSlug: "web-development",
    name,
    description: "",
    priceLabel: "",
    priceFrom: { amountMinor, currency: "INR" },
  }) as ServiceAddon;

const percentCoupon = (value: number): Coupon => ({
  code: "PCT",
  discountType: COUPON_DISCOUNT_TYPES.PERCENTAGE,
  percentageValue: value,
  expiresAt: null,
  minimumOrder: null,
  isActive: true,
});

const flatCoupon = (amountMinor: number): Coupon => ({
  code: "FLAT",
  discountType: COUPON_DISCOUNT_TYPES.FLAT,
  flatValue: { amountMinor, currency: "INR" },
  expiresAt: null,
  minimumOrder: null,
  isActive: true,
});

describe("calculateOrder — base → add-ons → discount → GST → total", () => {
  it("computes subtotal from base + add-ons and applies 18% GST", () => {
    const b = calculateOrder({
      pkg: pkg(10_000_00), // ₹10,000
      addons: [addon(2_000_00), addon(3_000_00)], // ₹5,000
    });
    expect(b.subtotal.amountMinor).toBe(15_000_00);
    expect(b.discount.amountMinor).toBe(0);
    expect(b.taxableAmount.amountMinor).toBe(15_000_00);
    expect(b.tax.amountMinor).toBe(2_700_00); // 18%
    expect(b.grandTotal.amountMinor).toBe(17_700_00);
  });

  it("applies GST to the POST-discount amount (not the subtotal)", () => {
    const b = calculateOrder({
      pkg: pkg(10_000_00),
      addons: [],
      coupon: percentCoupon(10), // -₹1,000 → taxable ₹9,000
    });
    expect(b.subtotal.amountMinor).toBe(10_000_00);
    expect(b.discount.amountMinor).toBe(1_000_00);
    expect(b.taxableAmount.amountMinor).toBe(9_000_00);
    expect(b.tax.amountMinor).toBe(1_620_00); // 18% of 9,000
    expect(b.grandTotal.amountMinor).toBe(10_620_00);
  });

  it("supports a custom tax rate (e.g. zero-rated)", () => {
    const b = calculateOrder({ pkg: pkg(5_000_00), addons: [], taxRatePercent: 0 });
    expect(b.tax.amountMinor).toBe(0);
    expect(b.grandTotal.amountMinor).toBe(5_000_00);
  });

  it("labels a percentage coupon", () => {
    const b = calculateOrder({ pkg: pkg(10_000_00), addons: [], coupon: percentCoupon(10) });
    expect(b.discountLabel).toContain("10%");
  });
});

describe("calculateDiscount", () => {
  it("percentage discount is a fraction of subtotal", () => {
    expect(
      calculateDiscount(percentCoupon(25), { amountMinor: 8_000_00, currency: "INR" }).amountMinor
    ).toBe(2_000_00);
  });

  it("flat discount never exceeds the subtotal", () => {
    expect(
      calculateDiscount(flatCoupon(9_999_00), { amountMinor: 5_000_00, currency: "INR" }).amountMinor
    ).toBe(5_000_00);
  });
});

describe("validateCoupon — fixed order of checks", () => {
  const big = { amountMinor: 20_000_000, currency: "INR" }; // ₹2L, above all minimums

  it("rejects an unknown code", () => {
    const r = validateCoupon("DOES_NOT_EXIST", big);
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.code).toBe(COUPON_VALIDATION_ERRORS.NOT_FOUND);
  });

  it("rejects an expired coupon (EXPIRED fixture in config)", () => {
    const r = validateCoupon("EXPIRED", big);
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.code).toBe(COUPON_VALIDATION_ERRORS.EXPIRED);
  });

  it("rejects when order is below the coupon minimum", () => {
    const r = validateCoupon("LAUNCH10", { amountMinor: 1_000_00, currency: "INR" }); // ₹1k < ₹1L min
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.code).toBe(COUPON_VALIDATION_ERRORS.BELOW_MINIMUM_ORDER);
  });

  it("accepts a valid, active, in-budget coupon", () => {
    const r = validateCoupon("LAUNCH10", big);
    expect(r.valid).toBe(true);
    if (r.valid) expect(r.coupon.code).toBe("LAUNCH10");
  });

  it("matches codes case-insensitively", () => {
    expect(validateCoupon("launch10", big).valid).toBe(true);
  });
});
