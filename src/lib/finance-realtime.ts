/**
 * Finance realtime emitter — the ONE helper the finance services use to signal
 * the billing surface over the EXISTING realtime layer (`@/lib/realtime`).
 * Reuses the shared bus with a `billing` sentinel projectId and the reserved
 * BILLING topic, exactly like the CRM reuses it with a `crm` sentinel and the
 * notification center with a `user:<id>` sentinel. The main project SSE stream
 * (`/api/realtime`) excludes the BILLING topic; a dedicated finance stream
 * (`/api/finance/stream`) subscribes to the sentinel and forwards these events
 * so the billing dashboard/invoices update with no refresh.
 *
 * Best-effort: any failure is swallowed so realtime never breaks a finance write.
 *
 * Server-only.
 */

import { getRealtime, REALTIME_TOPIC, type RealtimeEvent } from "@/lib/realtime";
import { PROJECT_ACTIVITY_VERB } from "@/constants/project";

/** The sentinel "projectId" every finance realtime event carries (agency-wide scope). */
export const BILLING_REALTIME_SCOPE = "billing";

/** Publish a finance change to the billing stream. `id` should be unique per event. */
export function emitBillingRealtime(id: string, message: string, actorId: string | null): void {
  try {
    const event: RealtimeEvent = {
      id,
      projectId: BILLING_REALTIME_SCOPE,
      topic: REALTIME_TOPIC.BILLING,
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
