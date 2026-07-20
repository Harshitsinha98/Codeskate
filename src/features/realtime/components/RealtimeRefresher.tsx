"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useRealtime } from "@/features/realtime/hooks/useRealtime";
import type { RealtimeEvent } from "@/lib/realtime/events";

/**
 * Mount-anywhere realtime bridge: subscribes to the SSE stream and calls
 * `router.refresh()` whenever a scoped event arrives, so a Server Component
 * dashboard re-renders with fresh data the instant an admin changes anything —
 * no polling, no manual refetch.
 *
 * Renders nothing. The server (`/api/realtime`) decides scope from the session,
 * so the SAME component works unchanged in the client dashboard, the admin
 * dashboard, and any future employee dashboard — each just receives the events
 * it is authorized for. Bursts (e.g. a phase change that also bumps progress and
 * status) are coalesced into a single refresh via a short trailing debounce.
 */
export function RealtimeRefresher({ onEvent }: { onEvent?: (event: RealtimeEvent) => void }) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useRealtime({
    onEvent: (event) => {
      onEvent?.(event);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 150);
    },
  });

  return null;
}
