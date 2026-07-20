/**
 * Razorpay adapter — implements `PaymentProviderAdapter`.
 * Server-only (uses the secret key). Env-gated: `isConfigured()` reflects
 * whether both RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are present, so
 * callers can degrade gracefully (never crash) when they're absent.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";
import type {
  CreateProviderOrderInput,
  PaymentProviderAdapter,
  ProviderOrderResult,
  RefundPaymentInput,
  RefundResult,
  VerifyPaymentInput,
  VerifyWebhookInput,
} from "@/lib/payments/types";

// key_id is not secret (Razorpay's own model) — one env var serves both the
// server SDK and the client checkout widget, avoiding a duplicated setting.
function keyId(): string {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
}

function keySecret(): string {
  return process.env.RAZORPAY_KEY_SECRET ?? "";
}

// The webhook secret is configured SEPARATELY in the Razorpay dashboard (it is
// not the API key secret). Absent = webhook cannot be verified, so the route
// rejects every webhook rather than trusting an unsigned payload.
function webhookSecret(): string {
  return process.env.RAZORPAY_WEBHOOK_SECRET ?? "";
}

function isConfigured(): boolean {
  return Boolean(keyId() && keySecret());
}

let client: Razorpay | null = null;

function getClient(): Razorpay {
  if (!client) {
    client = new Razorpay({ key_id: keyId(), key_secret: keySecret() });
  }
  return client;
}

async function createOrder({
  amount,
  receipt,
  notes,
}: CreateProviderOrderInput): Promise<ProviderOrderResult> {
  if (!isConfigured()) {
    throw new Error("Razorpay is not configured (missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET).");
  }
  const order = await getClient().orders.create({
    amount: amount.amountMinor,
    currency: amount.currency,
    receipt,
    notes,
  });
  return {
    providerOrderId: order.id,
    amount: { amountMinor: Number(order.amount), currency: order.currency },
  };
}

function verifySignature({ providerOrderId, providerPaymentId, signature }: VerifyPaymentInput): boolean {
  if (!isConfigured()) return false;

  let expectedBuf: Buffer;
  let actualBuf: Buffer;
  try {
    const expected = createHmac("sha256", keySecret())
      .update(`${providerOrderId}|${providerPaymentId}`)
      .digest("hex");
    expectedBuf = Buffer.from(expected, "hex");
    actualBuf = Buffer.from(signature, "hex");
  } catch {
    return false;
  }
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * Verify a Razorpay webhook: HMAC-SHA256 of the RAW request body keyed by the
 * webhook secret, compared to the `X-Razorpay-Signature` header in constant
 * time. Returns false (reject) when the webhook secret is unset or on any
 * mismatch — an unverifiable webhook is never trusted.
 */
function verifyWebhook({ rawBody, signature }: VerifyWebhookInput): boolean {
  const secret = webhookSecret();
  if (!secret) return false;

  let expectedBuf: Buffer;
  let actualBuf: Buffer;
  try {
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    expectedBuf = Buffer.from(expected, "hex");
    actualBuf = Buffer.from(signature, "hex");
  } catch {
    return false;
  }
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * Refund a captured payment (full or partial) via the Razorpay SDK. Reuses the
 * same env-gated client; throws if credentials are absent so the Refund Service
 * surfaces a clean error. Razorpay refunds are keyed off the PAYMENT id.
 */
async function refund({ providerPaymentId, amount, notes }: RefundPaymentInput): Promise<RefundResult> {
  if (!isConfigured()) {
    throw new Error("Razorpay is not configured (missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET).");
  }
  const refundRow = await getClient().payments.refund(providerPaymentId, {
    amount: amount.amountMinor,
    notes,
  });
  return {
    providerRefundId: refundRow.id,
    amount: { amountMinor: Number(refundRow.amount ?? amount.amountMinor), currency: amount.currency },
    status: refundRow.status ?? "processed",
  };
}

export const razorpayAdapter: PaymentProviderAdapter = {
  id: "razorpay",
  isConfigured,
  publicKey: () => keyId() || null,
  createOrder,
  verifySignature,
  verifyWebhook,
  refund,
};
