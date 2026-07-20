"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useRealtime } from "@/features/realtime/hooks/useRealtime";

/**
 * CRM realtime bridge — subscribes to the agency-internal CRM SSE stream
 * (`/api/crm/stream`) and calls `router.refresh()` on each event so the CRM
 * dashboard/board/list re-render the instant any lead or proposal changes. Same
 * pattern as `RealtimeRefresher`, pointed at the CRM stream (a separate scope so
 * CRM events never leak onto client/project dashboards). Renders nothing.
 */
export function CrmRealtimeRefresher() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useRealtime({
    url: "/api/crm/stream",
    onEvent: () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 150);
    },
  });

  return null;
}
