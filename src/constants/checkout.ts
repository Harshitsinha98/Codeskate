/**
 * Checkout flow constants. Values only.
 */

export const CHECKOUT_STEPS = {
  PACKAGE: 1,
  BILLING: 2,
  REQUIREMENTS: 3,
  ADDONS: 4,
  SUMMARY: 5,
} as const;

export type CheckoutStep = (typeof CHECKOUT_STEPS)[keyof typeof CHECKOUT_STEPS];

export const CHECKOUT_STEP_ORDER: CheckoutStep[] = [
  CHECKOUT_STEPS.PACKAGE,
  CHECKOUT_STEPS.BILLING,
  CHECKOUT_STEPS.REQUIREMENTS,
  CHECKOUT_STEPS.ADDONS,
  CHECKOUT_STEPS.SUMMARY,
];

export const CHECKOUT_STEP_LABELS: Record<CheckoutStep, string> = {
  [CHECKOUT_STEPS.PACKAGE]: "Package",
  [CHECKOUT_STEPS.BILLING]: "Billing",
  [CHECKOUT_STEPS.REQUIREMENTS]: "Requirements",
  [CHECKOUT_STEPS.ADDONS]: "Add-ons",
  [CHECKOUT_STEPS.SUMMARY]: "Summary",
};

/** GST rate applied in the pricing engine (India standard services rate). */
export const DEFAULT_TAX_RATE_PERCENT = 18;

/** sessionStorage key the checkout state is persisted under. */
export const CHECKOUT_STORAGE_KEY = "agencyos:checkout:v1";
