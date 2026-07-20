/**
 * Payment reconciliation service — server-only.
 *
 * The Razorpay webhook is the AUTHORITATIVE settlement path; the browser
 * `/complete` callback is only a UX optimization that may never arrive (user
 * closes the tab, network drop). This service takes a signature-VERIFIED webhook
 * event and drives the order to its correct terminal state by reusing the SAME
 * idempotent settlement seam the browser callback uses (`@/lib/order-service`),
 * so an order settles exactly once regardless of which path (or how many
 * retries) reaches it first.
 *
 * Idempotency is inherited entirely from the order-service settlers:
 *   - `settleOrderAsPaid` short-circuits on a non-pending order and relies on the
 *     independently-idempotent project/invoice generators, so a retried
 *     `payment.captured`/`order.paid` never double-provisions.
 *   - `markOrderFailed` never downgrades a captured order.
 *   - `refund.processed` is acknowledged only (the Refund Service remains the
 *     single writer of refund state — per the sprint's "no refund automation
 *     changes" constraint), so a webhook refund event cannot double-refund.
 */

import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  settleOrderAsPaid,
  markOrderFailed,
  findOrderIdByProviderOrderId,
} from "@/lib/order-service";
import { DEFAULT_PAYMENT_PROVIDER } from "@/lib/payments";
import { logger } from "@/lib/observability/logger";

/** The Razorpay webhook events this service acts on. */
export const HANDLED_WEBHOOK_EVENTS = [
  "payment.captured",
  "payment.failed",
  "order.paid",
  "refund.processed",
] as const;

export type HandledWebhookEvent = (typeof HANDLED_WEBHOOK_EVENTS)[number];

export interface ReconcileResult {
  event: string;
  /** True when the event mapped to a known internal order and was processed. */
  handled: boolean;
  orderId?: string;
  status?: string;
  reason?: string;
}

/** Narrow, defensive readers over the loosely-typed Razorpay webhook payload. */
function readPaymentEntity(payload: unknown): {
  orderId?: string;
  paymentId?: string;
  method?: string;
  reason?: string;
} {
  const entity = (payload as { payment?: { entity?: Record<string, unknown> } })?.payment?.entity;
  if (!entity) return {};
  return {
    orderId: typeof entity.order_id === "string" ? entity.order_id : undefined,
    paymentId: typeof entity.id === "string" ? entity.id : undefined,
    method: typeof entity.method === "string" ? entity.method : undefined,
    reason:
      typeof entity.error_description === "string"
        ? entity.error_description
        : typeof entity.error_reason === "string"
          ? entity.error_reason
          : undefined,
  };
}

function readOrderEntity(payload: unknown): { orderId?: string } {
  const entity = (payload as { order?: { entity?: Record<string, unknown> } })?.order?.entity;
  return { orderId: typeof entity?.id === "string" ? entity.id : undefined };
}

/**
 * Reconcile a single VERIFIED webhook event. The caller (webhook route) must have
 * already verified the signature. Returns a structured result for logging; it
 * never throws on an unknown/unmapped event (that's an ack, not an error) — it
 * only throws if a settlement it attempted fails, so Razorpay retries it.
 */
export async function reconcileWebhookEvent(
  event: string,
  payload: unknown,
  db: PrismaClient = prisma
): Promise<ReconcileResult> {
  const provider = DEFAULT_PAYMENT_PROVIDER;

  switch (event) {
    case "payment.captured":
    case "order.paid": {
      // Both events mean "money is in". Resolve our order from the provider order id.
      const providerOrderId =
        readPaymentEntity(payload).orderId ?? readOrderEntity(payload).orderId;
      const paymentId = readPaymentEntity(payload).paymentId;
      const method = readPaymentEntity(payload).method;
      if (!providerOrderId) return { event, handled: false, reason: "no_provider_order_id" };

      const orderId = await findOrderIdByProviderOrderId(provider, providerOrderId, db);
      if (!orderId) return { event, handled: false, reason: "unknown_order" };

      const result = await settleOrderAsPaid(
        orderId,
        { providerPaymentId: paymentId ?? providerOrderId, method: method ?? null },
        db
      );
      return { event, handled: true, orderId, status: result.status };
    }

    case "payment.failed": {
      const { orderId: providerOrderId, reason } = readPaymentEntity(payload);
      if (!providerOrderId) return { event, handled: false, reason: "no_provider_order_id" };

      const orderId = await findOrderIdByProviderOrderId(provider, providerOrderId, db);
      if (!orderId) return { event, handled: false, reason: "unknown_order" };

      const result = await markOrderFailed(orderId, reason ?? "payment_failed", db);
      return { event, handled: true, orderId, status: result.status };
    }

    case "refund.processed": {
      // Refund writes are owned exclusively by the Refund Service (admin-driven).
      // The webhook only acknowledges the event so Razorpay stops retrying; it
      // must not mutate refund/ledger state here (no refund automation — sprint
      // constraint), which also keeps refunds idempotent by construction.
      logger.info("webhook: refund.processed acknowledged", { event });
      return { event, handled: true, reason: "acknowledged_no_write" };
    }

    default:
      // Unhandled event type — acknowledge so Razorpay stops retrying.
      return { event, handled: false, reason: "unhandled_event" };
  }
}
