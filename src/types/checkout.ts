/**
 * Checkout flow domain types. Interfaces only.
 * Persisted client-side (sessionStorage) via `@/hooks/useCheckoutState` — no
 * backend/database in this sprint (see docs — Checkout Experience sprint).
 */

import type { Money } from "@/types/common";
import type { CheckoutStep } from "@/constants/checkout";
import type { Coupon } from "@/types/coupon";

export interface CheckoutBillingInfo {
  name: string;
  email: string;
  phone: string;
  company: string;
  gstNumber: string;
  country: string;
  state: string;
  city: string;
  address: string;
}

export interface CheckoutRequirements {
  projectName: string;
  businessDescription: string;
  goals: string;
  targetAudience: string;
  timeline: string;
  budget: string;
  additionalNotes: string;
  /** File metadata only — actual upload/storage is a later sprint (frontend UI only). */
  files: CheckoutFileRef[];
}

export interface CheckoutFileRef {
  id: string;
  name: string;
  sizeBytes: number;
  type: string;
}

export interface CheckoutSelection {
  serviceSlug: string | null;
  packageId: string | null;
  addonIds: string[];
}

/** The complete, persistable checkout state. */
export interface CheckoutState {
  currentStep: CheckoutStep;
  selection: CheckoutSelection;
  billing: CheckoutBillingInfo;
  requirements: CheckoutRequirements;
  couponCode: string;
  appliedCoupon: Coupon | null;
  updatedAt: string;
}

/** A single line in the order summary breakdown. */
export interface PriceBreakdownLine {
  label: string;
  amount: Money;
}

/** Full pricing engine output for the order summary step. */
export interface PriceBreakdown {
  basePrice: Money;
  addonsTotal: Money;
  addonLines: PriceBreakdownLine[];
  subtotal: Money;
  discount: Money;
  discountLabel: string | null;
  taxableAmount: Money;
  tax: Money;
  taxRatePercent: number;
  grandTotal: Money;
}
