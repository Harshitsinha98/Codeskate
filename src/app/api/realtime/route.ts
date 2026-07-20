/**
 * GET /api/realtime — Server-Sent Events stream of project activity.
 *
 * The one realtime endpoint both dashboards connect to. On connect we resolve
 * the caller's subscription scope from their session:
 *   - admin (ADMIN_EMAILS): all projects (no project filter),
 *   - employee (EMPLOYEE_EMAILS): only projects they're assigned to,
 *   - client: only projects where they are the `clientId`,
 *   - unauthenticated: 401.
 *
 * We then subscribe to the realtime provider (`@/lib/realtime`) with that scope
 * and forward each event as an SSE message. A periodic heartbeat comment keeps
 * intermediaries from idling the connection out; the stream is torn down and the
 * subscription released when the client disconnects (request abort).
 *
 * SSE (not polling, not WebSockets) per the sprint's transport constraint.
 * Node runtime — long-lived stream + Prisma for scope resolution.
 */

import type { NextRequest } from "next/server";
import { getServerSession } from "@/lib/rbac/session";
import { getAdminUser } from "@/lib/admin-auth";
import { getEmployeeUser } from "@/lib/employee-auth";
import { employeeProjectIds } from "@/lib/employee-dashboard";
import { prisma } from "@/lib/prisma";
import {
  getRealtime,
  REALTIME_SSE_EVENT,
  REALTIME_TOPIC,
  REALTIME_HEARTBEAT,
  REALTIME_HEARTBEAT_MS,
  type RealtimeEvent,
  type SubscriptionFilter,
} from "@/lib/realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Resolve which projects the caller may receive events for. null = forbidden. */
async function resolveScope(): Promise<SubscriptionFilter | null> {
  const admin = await getAdminUser();
  if (admin) return {}; // all projects

  const session = await getServerSession();
  const userId = session?.user?.id;
  if (!userId) return null;

  // Employees are scoped to the projects they're assigned to (manager or task
  // assignee) — the SAME scope the employee dashboard reads, so the realtime
  // layer is reused unchanged for the employee surface.
  const employee = await getEmployeeUser();
  if (employee) {
    return { projectIds: await employeeProjectIds(employee.id) };
  }

  const projects = await prisma.project.findMany({
    where: { clientId: userId },
    select: { id: true },
  });
  return { projectIds: projects.map((p) => p.id) };
}

export async function GET(request: NextRequest) {
  const scope = await resolveScope();
  if (!scope) {
    return new Response("Unauthorized", { status: 401 });
  }

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

      // Advise the client's reconnect backoff, then open with a comment so the
      // connection is immediately established end-to-end.
      send(`retry: 3000\n\n`);
      send(`: connected\n\n`);

      unsubscribe = realtime.subscribe(scope, (event: RealtimeEvent) => {
        // Personal notification events ride a separate per-user stream
        // (/api/notifications/stream); never leak them onto the project stream
        // (admins subscribe to ALL projects and would otherwise see everyone's).
        if (event.topic === REALTIME_TOPIC.NOTIFICATION) return;
        // CRM events ride their own agency-internal stream (/api/crm/stream);
        // keep them off the project stream (client dashboards must not see them).
        if (event.topic === REALTIME_TOPIC.CRM) return;
        // Finance events ride their own agency-internal stream (/api/finance/stream);
        // keep them off the project stream (client dashboards must not see them).
        if (event.topic === REALTIME_TOPIC.BILLING) return;
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
