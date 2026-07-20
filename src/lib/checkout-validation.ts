/**
 * Checkout field validation — the single source of truth, shared by the
 * client wizard (`CheckoutFlow`) and the order-creation API route. Moved out
 * of `CheckoutFlow.tsx` (where it was private) so the server can reject an
 * invalid submission with the EXACT same rules the UI enforces, instead of a
 * second, drifting copy.
 */

import type { CheckoutBillingInfo, CheckoutRequirements } from "@/types/checkout";

export type BillingErrors = Partial<Record<keyof CheckoutBillingInfo, string>>;
export type RequirementsErrors = Partial<Record<keyof CheckoutRequirements, string>>;

const REQUIRED_BILLING_FIELDS: (keyof CheckoutBillingInfo)[] = [
  "name",
  "email",
  "phone",
  "company",
  "country",
  "state",
  "city",
  "address",
];

const REQUIRED_REQUIREMENT_FIELDS: (keyof CheckoutRequirements)[] = [
  "projectName",
  "businessDescription",
  "goals",
  "targetAudience",
  "timeline",
];

export function validateBillingInfo(billing: CheckoutBillingInfo): BillingErrors {
  const errors: BillingErrors = {};
  for (const field of REQUIRED_BILLING_FIELDS) {
    if (!billing[field]?.trim()) errors[field] = "This field is required.";
  }
  if (billing.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billing.email)) {
    errors.email = "Enter a valid email address.";
  }
  return errors;
}

export function validateRequirements(requirements: CheckoutRequirements): RequirementsErrors {
  const errors: RequirementsErrors = {};
  for (const field of REQUIRED_REQUIREMENT_FIELDS) {
    const value = requirements[field];
    if (typeof value === "string" && !value.trim()) {
      errors[field] = "This field is required.";
    }
  }
  return errors;
}
