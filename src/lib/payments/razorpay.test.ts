import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createHmac } from "node:crypto";
import { razorpayAdapter } from "@/lib/payments/razorpay";

const KEY_ID = "rzp_test_key";
const KEY_SECRET = "test_secret_abc";
const WEBHOOK_SECRET = "test_webhook_secret";

function paymentSignature(orderId: string, paymentId: string, secret: string): string {
  return createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

function webhookSignature(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

describe("razorpay verifySignature (checkout callback)", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = KEY_ID;
    process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
  });
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
  });

  it("accepts a correctly-signed payment", () => {
    const sig = paymentSignature("order_1", "pay_1", KEY_SECRET);
    expect(
      razorpayAdapter.verifySignature({
        providerOrderId: "order_1",
        providerPaymentId: "pay_1",
        signature: sig,
      })
    ).toBe(true);
  });

  it("rejects a signature made with the wrong secret", () => {
    const sig = paymentSignature("order_1", "pay_1", "attacker_secret");
    expect(
      razorpayAdapter.verifySignature({
        providerOrderId: "order_1",
        providerPaymentId: "pay_1",
        signature: sig,
      })
    ).toBe(false);
  });

  it("rejects a tampered order/payment id (signature no longer matches)", () => {
    const sig = paymentSignature("order_1", "pay_1", KEY_SECRET);
    expect(
      razorpayAdapter.verifySignature({
        providerOrderId: "order_1",
        providerPaymentId: "pay_TAMPERED",
        signature: sig,
      })
    ).toBe(false);
  });

  it("rejects a malformed (non-hex) signature without throwing", () => {
    expect(
      razorpayAdapter.verifySignature({
        providerOrderId: "order_1",
        providerPaymentId: "pay_1",
        signature: "not-a-valid-hex-signature!!!",
      })
    ).toBe(false);
  });

  it("returns false when Razorpay is not configured", () => {
    delete process.env.RAZORPAY_KEY_SECRET;
    const sig = paymentSignature("order_1", "pay_1", KEY_SECRET);
    expect(
      razorpayAdapter.verifySignature({
        providerOrderId: "order_1",
        providerPaymentId: "pay_1",
        signature: sig,
      })
    ).toBe(false);
  });
});

describe("razorpay verifyWebhook", () => {
  const rawBody = JSON.stringify({ event: "payment.captured", id: "evt_1" });

  beforeEach(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
  });
  afterEach(() => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
  });

  it("accepts a webhook signed over the raw body", () => {
    const sig = webhookSignature(rawBody, WEBHOOK_SECRET);
    expect(razorpayAdapter.verifyWebhook?.({ rawBody, signature: sig })).toBe(true);
  });

  it("rejects when the body was altered after signing", () => {
    const sig = webhookSignature(rawBody, WEBHOOK_SECRET);
    const tampered = JSON.stringify({ event: "payment.captured", id: "evt_HACKED" });
    expect(razorpayAdapter.verifyWebhook?.({ rawBody: tampered, signature: sig })).toBe(false);
  });

  it("rejects a signature from the wrong secret", () => {
    const sig = webhookSignature(rawBody, "wrong_secret");
    expect(razorpayAdapter.verifyWebhook?.({ rawBody, signature: sig })).toBe(false);
  });

  it("rejects every webhook when the webhook secret is unset", () => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    const sig = webhookSignature(rawBody, WEBHOOK_SECRET);
    expect(razorpayAdapter.verifyWebhook?.({ rawBody, signature: sig })).toBe(false);
  });
});
