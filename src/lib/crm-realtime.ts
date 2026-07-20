/**
 * CRM realtime emitter — the ONE helper the CRM services use to signal the CRM
 * surface over the EXISTING realtime layer (`@/lib/realtime`). Reuses the shared
 * bus with a `crm` sentinel projectId and the reserved CRM topic, exactly like
 * the notification center reuses it with a `user:<id>` sentinel. The main project
 * SSE stream (`/api/realtime`) excludes the CRM topic; a dedicated CRM stream
 * (`/api/crm/stream`) subscribes to the sentinel and forwards these events so the
 * CRM dashboard/board updates with no refresh.
 *
 * Best-effort: any failure is swallowed so realtime never breaks a CRM write.
 *
 * Server-only.
 */

import { getRealtime, REALTIME_TOPIC, type RealtimeEvent } from "@/lib/realtime";
import { PROJECT_ACTIVITY_VERB } from "@/constants/project";

/** The sentinel "projectId" every CRM realtime event carries (agency-wide scope). */
export const CRM_REALTIME_SCOPE = "crm";

/** Publish a CRM change to the CRM stream. `id` should be unique per event. */
export function emitCrmRealtime(id: string, message: string, actorId: string | null): void {
  try {
    const event: RealtimeEvent = {
      id,
      projectId: CRM_REALTIME_SCOPE,
      topic: REALTIME_TOPIC.CRM,
      verb: PROJECT_ACTIVITY_VERB.NOTE_ADDED,
      message,
      actorId,
      createdAt: new Date().toISOString(),
    };
    getRealtime().publish(event);
  } catch {
    /* realtime is non-critical — never break the write path */
  }
}
