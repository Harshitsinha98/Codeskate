/**
 * POST /api/webhooks/razorpay
 *
 * The AUTHORITATIVE payment settlement path. Razorpay calls this server-to-server
 * for every payment lifecycle event; unlike the browser callback it always fires
 * (with retries), so it is the source of truth. Flow:
 *   1. Read the RAW body (signature is computed over exact bytes — never re-parse
 *      then re-stringify).
 *   2. Verify `X-Razorpay-Signature` via the provider adapter + webhook secret.
 *      An unverifiable request is rejected 401 and never touches business state.
 *   3. Hand the verified event to the reconciliation service, which reuses the
 *      idempotent order-service settlement seam (safe under retries + races with
 *      the browser callback).
 *
 * Node runtime (Prisma + crypto). Never trusts the payload before verification.
 */

import { NextResponse, type NextRequest } from "next/server";
import { getPaymentProvider, DEFAULT_PAYMENT_PROVIDER } from "@/lib/payments";
import { reconcileWebhookEvent } from "@/lib/reconciliation-service";
import { enforceRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/observability/logger";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Coarse abuse guard on the public endpoint (keyed by client ip). Verified
  // Razorpay traffic is low-volume; this only blunts unsigned flooding.
  try {
    await enforceRateLimit("payment", request.headers);
  } catch {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const provider = getPaymentProvider(DEFAULT_PAYMENT_PROVIDER);
  if (typeof provider.verifyWebhook !== "function") {
    logger.error("webhook: provider has no webhook verifier configured");
    return NextResponse.json({ error: "Webhook not supported." }, { status: 401 });
  }

  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const rawBody = await request.text();

  if (!signature || !provider.verifyWebhook({ rawBody, signature })) {
    // Do not reveal why — an attacker learns nothing from a flat 401.
    logger.warn("webhook: signature verification failed");
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const event = (payload as { event?: unknown })?.event;
  if (typeof event !== "string") {
    return NextResponse.json({ error: "Missing event." }, { status: 400 });
  }

  try {
    const result = await reconcileWebhookEvent(event, payload);
    logger.info("webhook: processed", {
      event,
      handled: result.handled,
      orderId: result.orderId,
      status: result.status,
      reason: result.reason,
    });
    // Always 200 on a handled OR knowingly-ignored event so Razorpay stops
    // retrying. A processing FAILURE below throws → 500 → Razorpay retries.
    return NextResponse.json({ received: true, ...result }, { status: 200 });
  } catch (error) {
    logger.error("webhook: processing failed — signalling retry", {
      event,
      error: error instanceof Error ? error.message : String(error),
    });
    // 500 tells Razorpay to retry; the settlement seam is idempotent so a retry
    // that later succeeds cannot double-provision.
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }
}
