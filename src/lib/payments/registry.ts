/**
 * Payment provider registry.
 *
 * To add Stripe later: implement `PaymentProviderAdapter` in a new
 * `stripe.ts` file (mirroring `razorpay.ts`) and add one line here. No route
 * handler, service, or UI component changes — they all depend on the
 * `PaymentProviderAdapter` interface, not on Razorpay specifically.
 */

import type { PaymentProvider } from "@/types/payment";
import type { PaymentProviderAdapter } from "@/lib/payments/types";
import { razorpayAdapter } from "@/lib/payments/razorpay";

const adapters: Partial<Record<PaymentProvider, PaymentProviderAdapter>> = {
  razorpay: razorpayAdapter,
  // stripe: stripeAdapter,  // ← future: implement lib/payments/stripe.ts, add here
};

export function getPaymentProvider(id: PaymentProvider): PaymentProviderAdapter {
  const adapter = adapters[id];
  if (!adapter) {
    throw new Error(`No payment provider adapter registered for "${id}".`);
  }
  return adapter;
}

/** The provider AgencyOS checkout uses today. */
export const DEFAULT_PAYMENT_PROVIDER: PaymentProvider = "razorpay";
