/**
 * GET /api/crm/stream — Server-Sent Events for the Sales CRM surface.
 *
 * An agency-internal companion to `/api/realtime`. The CRM services publish each
 * change onto the shared realtime bus with the `crm` sentinel `projectId` and the
 * `crm` topic (see `@/lib/crm-realtime`); here we subscribe filtered to that
 * sentinel and forward frames, so the CRM dashboard/board updates with no refresh.
 *
 * Authorization: CRM staff only (admin / sales) via `@/lib/crm-auth` — clients
 * never receive CRM events. Reuses the EXISTING realtime layer verbatim (no
 * second event system).
 *
 * Node runtime — long-lived stream.
 */

import type { NextRequest } from "next/server";
import { getCrmUser } from "@/lib/crm-auth";
import { CRM_REALTIME_SCOPE } from "@/lib/crm-realtime";
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
  const crm = await getCrmUser();
  if (!crm) return new Response("Unauthorized", { status: 401 });

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

      unsubscribe = realtime.subscribe({ projectIds: [CRM_REALTIME_SCOPE] }, (event: RealtimeEvent) => {
        if (event.topic !== REALTIME_TOPIC.CRM) return;
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
