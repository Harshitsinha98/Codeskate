/**
 * Realtime layer barrel — the single import surface for the realtime system.
 * One event system, one provider seam (see `provider.ts` / `events.ts`).
 */

export {
  REALTIME_TOPIC,
  REALTIME_SSE_EVENT,
  REALTIME_HEARTBEAT,
  REALTIME_HEARTBEAT_MS,
  topicForVerb,
  type RealtimeEvent,
  type RealtimeTopic,
} from "@/lib/realtime/events";

export {
  getRealtime,
  type RealtimeProvider,
  type RealtimeListener,
  type SubscriptionFilter,
  type Unsubscribe,
} from "@/lib/realtime/provider";
