/**
 * Barrel export for AgencyOS payment provider adapters.
 * Import from "@/lib/payments".
 */

export { getPaymentProvider, DEFAULT_PAYMENT_PROVIDER } from "@/lib/payments/registry";
export type {
  PaymentProviderAdapter,
  CreateProviderOrderInput,
  ProviderOrderResult,
  VerifyPaymentInput,
  VerifyWebhookInput,
  RefundPaymentInput,
  RefundResult,
} from "@/lib/payments/types";
