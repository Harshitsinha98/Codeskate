/**
 * Order service — server-only checkout → payment business logic.
 *
 * Pricing is ALWAYS recomputed here via the shared `@/lib/pricing-engine`
 * (never trusted from the client). Provider interaction goes through the
 * `@/lib/payments` adapter registry, so this service is provider-agnostic and
 * stays Stripe-compatible. An internal `Order` (Prisma) is created up front in
 * "pending" and only flips to "paid" AFTER server-side signature verification.
 */

import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateOrder, validateCoupon } from "@/lib/pricing-engine";
import { getService } from "@/config/catalog";
import { findCoupon } from "@/config/coupons";
import { getPaymentProvider, DEFAULT_PAYMENT_PROVIDER } from "@/lib/payments";
import { validateBillingInfo, validateRequirements } from "@/lib/checkout-validation";
import { createProjectForOrder } from "@/lib/project-service";
import { generateInvoiceForOrder } from "@/lib/invoice-service";
import { notify, notifyMany } from "@/lib/notifications/service";
import { getAgencyAdminIds } from "@/lib/notifications/recipients";
import { NOTIFICATION_TYPE, NOTIFICATION_AUDIENCE } from "@/constants/notification";
import { ORDER_STATUS } from "@/constants/order";
import type {
  CompleteOrderRequest,
  CompleteOrderResponse,
  CreateOrderRequest,
  CreateOrderResponse,
} from "@/types/order";
import type { Coupon } from "@/types/coupon";
import type { PriceBreakdown } from "@/types/checkout";

export class OrderError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly details?: unknown
  ) {
    super(message);
    this.name = "OrderError";
  }
}

/** Resolve the checkout selection to a package, its add-ons, and a validated coupon. */
function resolveSelection(input: CreateOrderRequest) {
  const service = getService(input.serviceSlug);
  if (!service) throw new OrderError("Unknown service.", 400);

  const pkg = service.packages.find((p) => p.id === input.packageId);
  if (!pkg) throw new OrderError("Unknown package for this service.", 400);

  const addons = service.addons.filter((a) => input.addonIds.includes(a.id));

  // Recompute the breakdown once WITHOUT a coupon to get the true subtotal the
  // coupon's minimum-order check must run against.
  const uncouponed = calculateOrder({ pkg, addons });

  let coupon: Coupon | null = null;
  if (input.couponCode?.trim()) {
    const result = validateCoupon(input.couponCode, uncouponed.subtotal);
    if (!result.valid) throw new OrderError(result.message, 400, { code: result.code });
    coupon = findCoupon(input.couponCode) ?? null;
  }

  const breakdown = calculateOrder({ pkg, addons, coupon });
  return { service, pkg, addons, coupon, breakdown };
}

/**
 * Create an internal Order + a provider order, ready for the client to pay.
 * `userId` is optional — checkout is available pre-auth (guest checkout).
 */
export async function createCheckoutOrder(
  input: CreateOrderRequest,
  userId: string | null,
  db: PrismaClient = prisma
): Promise<CreateOrderResponse> {
  // Server-side validation mirrors the wizard exactly (shared module).
  const billingErrors = validateBillingInfo(input.billing);
  const requirementErrors = validateRequirements(input.requirements);
  if (Object.keys(billingErrors).length || Object.keys(requirementErrors).length) {
    throw new OrderError("Some required details are missing or invalid.", 422, {
      billing: billingErrors,
      requirements: requirementErrors,
    });
  }

  const { pkg, coupon, breakdown } = resolveSelection(input);

  const provider = getPaymentProvider(DEFAULT_PAYMENT_PROVIDER);
  if (!provider.isConfigured()) {
    throw new OrderError("Payments are not configured on the server.", 503);
  }

  const order = await db.order.create({
    data: {
      userId,
      serviceSlug: input.serviceSlug,
      packageId: input.packageId,
      addonIds: input.addonIds,
      couponCode: coupon?.code ?? null,
      // CheckoutBillingInfo/CheckoutRequirements are fixed-shape interfaces, so
      // they lack the index signature Prisma's InputJsonValue expects — cast
      // through the Json type (they are plain, JSON-serializable objects).
      billing: input.billing as unknown as Prisma.InputJsonValue,
      requirements: input.requirements as unknown as Prisma.InputJsonValue,
      currency: breakdown.grandTotal.currency,
      subtotalMinor: breakdown.subtotal.amountMinor,
      discountMinor: breakdown.discount.amountMinor,
      taxMinor: breakdown.tax.amountMinor,
      totalMinor: breakdown.grandTotal.amountMinor,
      status: ORDER_STATUS.PENDING,
    },
  });

  const providerOrder = await provider.createOrder({
    amount: breakdown.grandTotal,
    receipt: order.id,
    notes: { serviceSlug: input.serviceSlug, packageId: pkg.id, orderId: order.id },
  });

  await db.payment.create({
    data: {
      orderId: order.id,
      provider: provider.id,
      providerOrderId: providerOrder.providerOrderId,
      status: "created",
      amountMinor: breakdown.grandTotal.amountMinor,
      currency: breakdown.grandTotal.currency,
    },
  });

  // Notify agency admins a new order was placed. Best-effort — a notification
  // failure must never fail checkout. Client confirmation follows on payment.
  try {
    const adminIds = await getAgencyAdminIds(db);
    if (adminIds.length) {
      await notifyMany(adminIds, {
        type: NOTIFICATION_TYPE.ORDER_CREATED,
        audience: NOTIFICATION_AUDIENCE.ADMIN,
        title: "New order placed",
        body: `Order ${order.id.slice(-6).toUpperCase()} for ${input.serviceSlug}.`,
        data: { orderId: order.id, href: `/admin/orders` },
      });
    }
  } catch {
    /* notifications are non-critical */
  }

  return {
    orderId: order.id,
    providerOrderId: providerOrder.providerOrderId,
    provider: provider.id,
    amount: breakdown.grandTotal,
    keyId: provider.publicKey() ?? "",
  };
}

/**
 * Authorize a caller to act on an order (complete / fail / cancel).
 *
 * The browser `/complete` callback mutates payment + provisioning state, so it
 * must be owned by the caller. Rules:
 *   - Admins may act on ANY order (support / manual reconciliation).
 *   - A signed-in user may act only on an order whose `userId` is theirs.
 *   - A guest order (`userId === null`) has no owner to match, so only an admin
 *     may act on it through this authenticated path.
 * This never runs on the webhook path — the webhook is server-to-server and
 * authenticated by signature, not by session — so guest orders still settle.
 */
export async function assertOrderAccess(
  orderId: string,
  caller: { userId: string; isAdmin: boolean },
  db: PrismaClient = prisma
): Promise<void> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { userId: true },
  });
  if (!order) throw new OrderError("Order not found.", 404);
  if (caller.isAdmin) return;
  if (order.userId && order.userId === caller.userId) return;
  throw new OrderError("You do not have access to this order.", 403);
}

/**
 * Finalize an order: verify the payment signature on success (server-side),
 * or record a failed / cancelled attempt. Idempotent-friendly: a terminal
 * order is not re-transitioned.
 */
export async function completeCheckoutOrder(
  orderId: string,
  input: CompleteOrderRequest,
  db: PrismaClient = prisma
): Promise<CompleteOrderResponse> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { payments: true },
  });
  if (!order) throw new OrderError("Order not found.", 404);

  // Already finalized — return current state (safe on double-submit).
  if (order.status !== ORDER_STATUS.PENDING) {
    return { orderId: order.id, status: order.status as CompleteOrderResponse["status"] };
  }

  const payment = order.payments[0];
  if (!payment) throw new OrderError("No payment attempt exists for this order.", 409);

  if (input.outcome === "cancelled") {
    await db.$transaction([
      db.order.update({ where: { id: order.id }, data: { status: ORDER_STATUS.CANCELLED } }),
      db.payment.update({ where: { id: payment.id }, data: { status: "failed", failureReason: "cancelled_by_user" } }),
    ]);
    return { orderId: order.id, status: ORDER_STATUS.CANCELLED };
  }

  if (input.outcome === "failed") {
    await db.$transaction([
      db.order.update({ where: { id: order.id }, data: { status: ORDER_STATUS.FAILED } }),
      db.payment.update({
        where: { id: payment.id },
        data: { status: "failed", failureReason: input.reason ?? "payment_failed" },
      }),
    ]);
    return { orderId: order.id, status: ORDER_STATUS.FAILED };
  }

  // outcome === "success" — verify the provider signature before trusting it.
  const provider = getPaymentProvider(payment.provider as "razorpay" | "stripe");
  const signatureValid = provider.verifySignature({
    providerOrderId: input.providerOrderId,
    providerPaymentId: input.providerPaymentId,
    signature: input.signature,
  });

  // The provider order id in the callback must match what we created.
  if (input.providerOrderId !== payment.providerOrderId || !signatureValid) {
    await db.$transaction([
      db.order.update({ where: { id: order.id }, data: { status: ORDER_STATUS.FAILED } }),
      db.payment.update({
        where: { id: payment.id },
        data: { status: "failed", failureReason: "signature_verification_failed" },
      }),
    ]);
    throw new OrderError("Payment signature verification failed.", 400);
  }

  // Signature verified — hand off to the shared, idempotent settlement path that
  // the webhook also uses, so the browser callback and the server-to-server
  // webhook can never diverge or double-provision.
  return settleOrderAsPaid(
    order.id,
    { providerPaymentId: input.providerPaymentId, signature: input.signature },
    db
  );
}

/**
 * Idempotently settle an order as PAID: flip the order to paid, capture the
 * payment, and auto-provision the delivery project + invoice — all atomically.
 * If any step throws, the whole transaction rolls back so we never end up with a
 * paid order that has no project or no invoice (or vice-versa).
 *
 * This is the SINGLE settlement seam shared by the browser callback
 * (`completeCheckoutOrder`) and the Razorpay webhook. It is safe to call more
 * than once for the same order: a non-pending order short-circuits to its
 * current state, and `createProjectForOrder`/`generateInvoiceForOrder` are each
 * independently idempotent — so a webhook retry (or a webhook racing the browser
 * callback) never creates a duplicate Invoice/Project/Ledger entry/Timeline
 * event/Notification. The caller is responsible for having authenticated the
 * payment (signature on the callback path, webhook signature on the webhook path).
 */
export async function settleOrderAsPaid(
  orderId: string,
  capture: { providerPaymentId: string; signature?: string | null; method?: string | null },
  db: PrismaClient = prisma
): Promise<CompleteOrderResponse> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { payments: true },
  });
  if (!order) throw new OrderError("Order not found.", 404);

  // Already finalized — return current state. This is the idempotency guard:
  // a duplicate webhook (or the browser callback arriving after the webhook, or
  // vice-versa) sees a non-pending order and does nothing.
  if (order.status !== ORDER_STATUS.PENDING) {
    return { orderId: order.id, status: order.status as CompleteOrderResponse["status"] };
  }

  const payment = order.payments[0];
  if (!payment) throw new OrderError("No payment attempt exists for this order.", 409);

  // Success Flow: Payment → Invoice Generated → Ledger Entry → Notification →
  // Realtime. Invoice generation records the settling payment transaction +
  // immutable ledger credit and fires the client/admin invoice notifications.
  await db.$transaction(async (tx) => {
    await tx.order.update({ where: { id: order.id }, data: { status: ORDER_STATUS.PAID } });
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "captured",
        providerPaymentId: capture.providerPaymentId,
        ...(capture.signature ? { providerSignature: capture.signature } : {}),
        ...(capture.method ? { method: capture.method } : {}),
        capturedAt: new Date(),
      },
    });
    await createProjectForOrder(order.id, tx);
    await generateInvoiceForOrder(order.id, tx);
  });

  // Payment verified & project provisioned. Notify the client (payment confirmed)
  // and admins (payment success). Best-effort — never fail a captured payment on
  // a notification error. Project-created notifications are emitted separately by
  // the Timeline Service (the CREATED activity from createProjectForOrder).
  try {
    if (order.userId) {
      await notify({
        userId: order.userId,
        type: NOTIFICATION_TYPE.PAYMENT_SUCCESSFUL,
        audience: NOTIFICATION_AUDIENCE.CLIENT,
        title: "Payment confirmed",
        body: `Your payment for order ${order.id.slice(-6).toUpperCase()} was received.`,
        data: { orderId: order.id, href: "/client" },
      });
    }
    const adminIds = await getAgencyAdminIds(db);
    if (adminIds.length) {
      await notifyMany(adminIds, {
        type: NOTIFICATION_TYPE.PAYMENT_SUCCESSFUL,
        audience: NOTIFICATION_AUDIENCE.ADMIN,
        title: "Payment received",
        body: `Order ${order.id.slice(-6).toUpperCase()} paid.`,
        data: { orderId: order.id, href: "/admin/orders" },
      });
    }
  } catch {
    /* notifications are non-critical */
  }

  return { orderId: order.id, status: ORDER_STATUS.PAID };
}

/**
 * Idempotently mark a pending order FAILED (e.g. Razorpay `payment.failed`).
 * A non-pending order is left untouched — a captured order must never be
 * downgraded by a late/duplicate failure event.
 */
export async function markOrderFailed(
  orderId: string,
  reason: string,
  db: PrismaClient = prisma
): Promise<CompleteOrderResponse> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { payments: true },
  });
  if (!order) throw new OrderError("Order not found.", 404);
  if (order.status !== ORDER_STATUS.PENDING) {
    return { orderId: order.id, status: order.status as CompleteOrderResponse["status"] };
  }
  const payment = order.payments[0];
  await db.$transaction([
    db.order.update({ where: { id: order.id }, data: { status: ORDER_STATUS.FAILED } }),
    ...(payment
      ? [
          db.payment.update({
            where: { id: payment.id },
            data: { status: "failed", failureReason: reason },
          }),
        ]
      : []),
  ]);
  return { orderId: order.id, status: ORDER_STATUS.FAILED };
}

/**
 * Resolve an internal Order id from a provider's order id (the webhook payload
 * references the provider order/payment, not our internal ids). Reuses the
 * `@@unique([provider, providerOrderId])` index on Payment. Returns null when no
 * matching payment exists (e.g. an event for an order created elsewhere).
 */
export async function findOrderIdByProviderOrderId(
  provider: string,
  providerOrderId: string,
  db: PrismaClient = prisma
): Promise<string | null> {
  const payment = await db.payment.findUnique({
    where: { provider_providerOrderId: { provider, providerOrderId } },
    select: { orderId: true },
  });
  return payment?.orderId ?? null;
}

/** Exposed for potential reuse (e.g. an order-confirmation page later). */
export type { PriceBreakdown };
