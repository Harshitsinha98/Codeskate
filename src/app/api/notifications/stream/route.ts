/**
 * GET /api/notifications/stream — Server-Sent Events for the notification center.
 *
 * A per-user companion to `/api/realtime`. The Notification Service publishes each
 * new notification onto the shared realtime bus with a `user:<id>` sentinel
 * `projectId` and the `notification` topic; here we subscribe filtered to the
 * caller's OWN sentinel, so a user only ever receives their own notifications —
 * even an admin (whose project stream is unscoped) sees only their personal feed.
 *
 * Reuses the EXISTING realtime layer verbatim (`@/lib/realtime`) — no second event
 * system. The browser hook (`useNotifications`) reconnects via EventSource and
 * refetches the list/counter when a frame arrives.
 *
 * Node runtime — long-lived stream.
 */

import type { NextRequest } from "next/server";
import { getServerSession } from "@/lib/rbac/session";
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
  const session = await getServerSession();
  const userId = session?.user?.id;
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const sentinel = `user:${userId}`;
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

      // Subscribe scoped to this user's sentinel project id; additionally guard on
      // the notification topic so only personal notifications flow through.
      unsubscribe = realtime.subscribe({ projectIds: [sentinel] }, (event: RealtimeEvent) => {
        if (event.topic !== REALTIME_TOPIC.NOTIFICATION) return;
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
