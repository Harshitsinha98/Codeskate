/**
 * POST /api/checkout/orders/[orderId]/complete
 * Finalizes an order after the payment widget resolves — success (verify
 * signature), failure, or cancellation. All state transitions are decided
 * server-side; the client's reported outcome is never trusted without
 * signature verification on the success path.
 */

import { NextResponse, type NextRequest } from "next/server";
import { completeCheckoutOrder, assertOrderAccess } from "@/lib/order-service";
import { getServerSession } from "@/lib/rbac/session";
import { isAdminEmail } from "@/lib/admin-auth";
import { withApi, badRequest, unauthorized } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import type { CompleteOrderRequest } from "@/types/order";

export const POST = withApi(async (request: NextRequest, { params }) => {
  const { orderId } = await params;

  // Completing an order (success/fail/cancel) mutates payment + provisioning
  // state, so it requires an authenticated session and ownership of the order.
  // Admins may act on any order; a non-owner (including employees) is refused.
  // The browser callback is only a UX optimization — the Razorpay webhook is
  // the authoritative settlement path — so gating it here cannot lose payments.
  const session = await getServerSession().catch(() => null);
  const user = session?.user;
  if (!user) throw unauthorized("Sign in to complete this order.");

  await enforceRateLimit("payment", request.headers, user.id);

  let body: CompleteOrderRequest;
  try {
    body = (await request.json()) as CompleteOrderRequest;
  } catch {
    throw badRequest("Invalid JSON body.");
  }

  await assertOrderAccess(orderId, {
    userId: user.id,
    isAdmin: isAdminEmail(user.email),
  });

  // `OrderError` is normalized by `withApi`; the signature-verification path
  // inside `completeCheckoutOrder` throws it on any untrusted outcome.
  const result = await completeCheckoutOrder(orderId, body);
  return NextResponse.json({ data: result }, { status: 200 });
});
