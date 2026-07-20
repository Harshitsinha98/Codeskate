/**
 * GET /api/finance/stream — Server-Sent Events for the Finance & Billing surface.
 *
 * An agency-internal companion to `/api/realtime`. The finance services publish
 * each change onto the shared realtime bus with the `billing` sentinel
 * `projectId` and the `billing` topic (see `@/lib/finance-realtime`); here we
 * subscribe filtered to that sentinel and forward frames, so the billing
 * dashboard/invoices update with no refresh.
 *
 * Authorization: finance staff only (admin / finance manager) via
 * `@/lib/finance-auth` — clients never receive these events. Reuses the EXISTING
 * realtime layer verbatim (no second event system).
 *
 * Node runtime — long-lived stream.
 */

import type { NextRequest } from "next/server";
import { getFinanceUser } from "@/lib/finance-auth";
import { BILLING_REALTIME_SCOPE } from "@/lib/finance-realtime";
import {
  getRealtime,
  REALTIME_SSE_EVENT,
  REALTIME_TOPIC,
  REALTIME_HEARTBEAT,
  REALTIME_HEARTBEAT_MS,
  type RealtimeEvent,
} from "@/lib/realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const finance = await getFinanceUser();
  if (!finance) return new Response("Unauthorized", { status: 401 });

  const encoder = new TextEncoder();
  const realtime = getRealtime();

  let unsubscribe: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          /* controller already closed */
        }
      };

      send(`retry: 3000\n\n`);
      send(`: connected\n\n`);

      unsubscribe = realtime.subscribe({ projectIds: [BILLING_REALTIME_SCOPE] }, (event: RealtimeEvent) => {
        if (event.topic !== REALTIME_TOPIC.BILLING) return;
        send(
          `event: ${REALTIME_SSE_EVENT}\n` +
            `id: ${event.id}\n` +
            `data: ${JSON.stringify(event)}\n\n`
        );
      });

      heartbeat = setInterval(() => send(REALTIME_HEARTBEAT), REALTIME_HEARTBEAT_MS);

      const close = () => {
        if (heartbeat) clearInterval(heartbeat);
        if (unsubscribe) unsubscribe();
        heartbeat = null;
        unsubscribe = null;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      request.signal.addEventListener("abort", close);
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      if (unsubscribe) unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
