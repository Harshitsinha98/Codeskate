/**
 * Payment provider adapter contract.
 *
 * Every payment provider (Razorpay today, Stripe later) implements this SAME
 * interface. Route handlers and services depend only on `PaymentProviderAdapter`
 * — never on a concrete provider — so adding Stripe later means adding one new
 * file (`stripe.ts`) that implements this interface and registering it in
 * `registry.ts`. No other code changes.
 */

import type { Money } from "@/types/common";
import type { PaymentProvider } from "@/types/payment";

export interface CreateProviderOrderInput {
  /** Grand total to charge, in integer minor units. */
  amount: Money;
  /** Internal Order id — passed back as the provider order's receipt/reference. */
  receipt: string;
  /** Arbitrary key-value metadata attached to the provider order (e.g. service/package). */
  notes?: Record<string, string>;
}

export interface ProviderOrderResult {
  providerOrderId: string;
  amount: Money;
}

export interface VerifyPaymentInput {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}

export interface VerifyWebhookInput {
  /** The exact raw request body bytes as received (pre-JSON-parse). */
  rawBody: string;
  /** The provider's signature header (e.g. Razorpay's `X-Razorpay-Signature`). */
  signature: string;
}

export interface RefundPaymentInput {
  /** The provider's captured-payment id to refund against. */
  providerPaymentId: string;
  /** Amount to refund, in integer minor units (full or partial). */
  amount: Money;
  /** Arbitrary key-value metadata attached to the provider refund. */
  notes?: Record<string, string>;
}

export interface RefundResult {
  /** The provider's refund id (gateway reference). */
  providerRefundId: string;
  amount: Money;
  status: string;
}

export interface PaymentProviderAdapter {
  readonly id: PaymentProvider;
  /** True when this provider has the credentials it needs to operate. */
  isConfigured(): boolean;
  /** Client-safe identifier the frontend needs to open the provider's checkout UI. */
  publicKey(): string | null;
  createOrder(input: CreateProviderOrderInput): Promise<ProviderOrderResult>;
  /** Verify a completed payment's signature. Never throws — returns false on any mismatch. */
  verifySignature(input: VerifyPaymentInput): boolean;
  /**
   * Verify an incoming webhook payload against its signature header, using the
   * provider's webhook secret. Optional on the interface so a provider can exist
   * before its webhook is wired; the webhook route checks for it and refuses the
   * request (401) when absent. Never throws — returns false on any mismatch or
   * when the webhook secret is not configured, so an unverifiable request is
   * rejected rather than trusted.
   */
  verifyWebhook?(input: VerifyWebhookInput): boolean;
  /**
   * Refund a captured payment (full or partial). Optional on the interface so a
   * provider can be added before it supports refunds; the Refund Service checks
   * for it and fails cleanly when absent. Reuses the SAME provider abstraction —
   * no refund-specific provider coupling leaks into the finance module.
   */
  refund?(input: RefundPaymentInput): Promise<RefundResult>;
}
