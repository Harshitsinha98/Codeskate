"use client";

/**
 * Razorpay Checkout (browser) integration — loads the hosted checkout.js
 * script on demand and opens the payment modal. This is the ONLY provider-
 * specific client code; it's isolated here so the checkout flow component
 * stays provider-agnostic (it just calls `openRazorpayCheckout`).
 *
 * Type declarations are local (Razorpay ships no browser SDK types).
 */

import type { CheckoutBillingInfo } from "@/types/checkout";
import type { Money } from "@/types/common";

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let scriptPromise: Promise<boolean> | null = null;

/** Load checkout.js once; resolves true when `window.Razorpay` is available. */
function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => {
      scriptPromise = null; // allow a retry on next attempt
      resolve(false);
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export interface OpenCheckoutInput {
  keyId: string;
  providerOrderId: string;
  amount: Money;
  billing: CheckoutBillingInfo;
  description?: string;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onDismiss: () => void;
  onFailure: (reason: string) => void;
}

/**
 * Open the Razorpay payment modal. Rejects only if the script can't load;
 * outcomes (success / dismiss / failure) are delivered via callbacks.
 */
export async function openRazorpayCheckout(input: OpenCheckoutInput): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    input.onFailure("Could not load the payment gateway. Check your connection and try again.");
    return;
  }

  const rzp = new window.Razorpay({
    key: input.keyId,
    amount: input.amount.amountMinor,
    currency: input.amount.currency,
    name: "CodeSkate",
    description: input.description,
    order_id: input.providerOrderId,
    prefill: {
      name: input.billing.name,
      email: input.billing.email,
      contact: input.billing.phone,
    },
    theme: { color: "#2B4EFF" },
    handler: (response) => input.onSuccess(response),
    modal: { ondismiss: () => input.onDismiss() },
  });

  rzp.on("payment.failed", (response) => {
    const description =
      (response as { error?: { description?: string } })?.error?.description ??
      "Your payment could not be completed.";
    input.onFailure(description);
  });

  rzp.open();
}

export type { RazorpaySuccessResponse };
