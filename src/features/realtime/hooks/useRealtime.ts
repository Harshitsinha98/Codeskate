"use client";

import { useEffect, useRef } from "react";
import type { RealtimeEvent } from "@/lib/realtime/events";

export interface UseRealtimeOptions {
  /** SSE endpoint. Defaults to the app's single realtime route. */
  url?: string;
  /** Called for every event the caller is scoped to. */
  onEvent?: (event: RealtimeEvent) => void;
  /** Toggle the connection without unmounting. Defaults to true. */
  enabled?: boolean;
}

/**
 * Subscribe to the server's SSE stream (`/api/realtime`).
 *
 * Uses the browser's native `EventSource`, which reconnects automatically with
 * the server-advertised `retry` interval; on top of that we add an explicit
 * capped-backoff reconnect for the cases EventSource gives up on (repeated hard
 * errors), and we always tear the connection down on unmount / when disabled.
 *
 * The hook is transport-only: it hands parsed events to `onEvent`. Dashboards
 * compose it with `router.refresh()` (see `RealtimeRefresher`) so the exact same
 * hook powers client, admin, and any future employee dashboard.
 */
export function useRealtime({ url = "/api/realtime", onEvent, enabled = true }: UseRealtimeOptions) {
  // Keep the latest callback without resubscribing on every render.
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let source: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    let closed = false;

    const connect = () => {
      if (closed) return;
      source = new EventSource(url);

      source.addEventListener("project-activity", (e) => {
        try {
          const event = JSON.parse((e as MessageEvent).data) as RealtimeEvent;
          onEventRef.current?.(event);
        } catch {
          /* ignore malformed frame */
        }
      });

      // A clean open resets the backoff counter.
      source.onopen = () => {
        attempts = 0;
      };

      // On error EventSource will try its own reconnect; if the connection is
      // fully closed, schedule an explicit capped-backoff retry.
      source.onerror = () => {
        if (closed) return;
        if (source && source.readyState === EventSource.CLOSED) {
          source.close();
          source = null;
          attempts += 1;
          const delay = Math.min(1000 * 2 ** attempts, 30_000);
          reconnectTimer = setTimeout(connect, delay);
        }
      };
    };

    connect();

    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (source) source.close();
    };
  }, [url, enabled]);
}
