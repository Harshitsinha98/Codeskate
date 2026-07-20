/**
 * Realtime provider abstraction — the ONE seam the app uses to publish and
 * subscribe to project events. Deliberately provider-agnostic (mirrors the
 * storage abstraction in `@/lib/storage`): callers talk only to the
 * `RealtimeProvider` interface, never to a concrete transport, so the in-process
 * implementation here can be swapped for Redis pub/sub, Postgres LISTEN/NOTIFY,
 * or a hosted bus later without touching a single publisher or subscriber.
 *
 * The default `InProcessRealtimeProvider` fans events out to subscribers within
 * the same Node process via an EventEmitter. This is correct for a single-node
 * deployment; a multi-node deployment swaps `getRealtime()` for a distributed
 * provider (same interface) so cross-instance events still arrive.
 *
 * Server-only. Never import from client components — the browser talks to the
 * SSE endpoint, not to this module.
 */

import { EventEmitter } from "node:events";
import type { RealtimeEvent } from "@/lib/realtime/events";

/** Unsubscribe handle returned by `subscribe`. Idempotent. */
export type Unsubscribe = () => void;

/** A subscriber callback. Receives every event it is scoped to. */
export type RealtimeListener = (event: RealtimeEvent) => void;

/** Filter deciding which events a subscriber receives. */
export interface SubscriptionFilter {
  /**
   * Project ids the subscriber may see. `undefined` = all projects (admin).
   * An empty array = nothing (a client with no projects).
   */
  projectIds?: string[];
}

/** The replaceable realtime contract. A distributed backend implements these. */
export interface RealtimeProvider {
  /** Publish an event to all matching subscribers. */
  publish(event: RealtimeEvent): void;
  /** Subscribe with a scope filter. Returns an unsubscribe handle. */
  subscribe(filter: SubscriptionFilter, listener: RealtimeListener): Unsubscribe;
  /** Current subscriber count (diagnostics/tests). */
  subscriberCount(): number;
}

const CHANNEL = "project-activity";

/**
 * Single-process provider. One EventEmitter, N listeners; each listener applies
 * its own project-scope filter. The emitter's max-listeners cap is lifted since
 * every open dashboard tab is a listener.
 */
class InProcessRealtimeProvider implements RealtimeProvider {
  private readonly emitter = new EventEmitter();
  private count = 0;

  constructor() {
    this.emitter.setMaxListeners(0);
  }

  publish(event: RealtimeEvent): void {
    this.emitter.emit(CHANNEL, event);
  }

  subscribe(filter: SubscriptionFilter, listener: RealtimeListener): Unsubscribe {
    const scoped = (event: RealtimeEvent) => {
      if (filter.projectIds && !filter.projectIds.includes(event.projectId)) return;
      listener(event);
    };
    this.emitter.on(CHANNEL, scoped);
    this.count += 1;

    let active = true;
    return () => {
      if (!active) return;
      active = false;
      this.emitter.off(CHANNEL, scoped);
      this.count -= 1;
    };
  }

  subscriberCount(): number {
    return this.count;
  }
}

// Cache across hot-reloads / route invocations in the same process, like the
// Prisma singleton — otherwise each import would get a fresh emitter and
// publishers/subscribers would land on different buses.
const globalForRealtime = globalThis as unknown as {
  realtimeProvider: RealtimeProvider | undefined;
};

/**
 * Resolve the active realtime provider. Currently always in-process; swapping in
 * a distributed provider is a one-line change here and requires NO changes at
 * any publish/subscribe call site.
 */
export function getRealtime(): RealtimeProvider {
  if (!globalForRealtime.realtimeProvider) {
    globalForRealtime.realtimeProvider = new InProcessRealtimeProvider();
  }
  return globalForRealtime.realtimeProvider;
}
