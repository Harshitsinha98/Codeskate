/**
 * POST /api/checkout/orders
 * Creates an internal Order (server-priced) + a Razorpay order, and returns
 * everything the client needs to open the payment widget. Node runtime
 * (Prisma + Razorpay SDK are not edge-compatible).
 */

import { NextResponse, type NextRequest } from "next/server";
import { createCheckoutOrder } from "@/lib/order-service";
import { getServerSession } from "@/lib/rbac/session";
import { withApi, badRequest } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import type { CreateOrderRequest } from "@/types/order";

export const POST = withApi(async (request: NextRequest) => {
  // Checkout is available to guests; attach the user id when signed in.
  const session = await getServerSession().catch(() => null);
  const userId = session?.user?.id ?? null;

  await enforceRateLimit("checkout", request.headers, userId);

  let body: CreateOrderRequest;
  try {
    body = (await request.json()) as CreateOrderRequest;
  } catch {
    throw badRequest("Invalid JSON body.");
  }

  // `OrderError` carries `statusCode`/`details`; `withApi` normalizes it into the
  // standard `{ error }` envelope and logs 5xx failures, so no bespoke catch is
  // needed here.
  const result = await createCheckoutOrder(body, userId);
  return NextResponse.json({ data: result }, { status: 201 });
});
