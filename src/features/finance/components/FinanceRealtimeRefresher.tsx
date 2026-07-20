"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useRealtime } from "@/features/realtime/hooks/useRealtime";

/**
 * Finance realtime bridge — subscribes to the agency-internal billing SSE stream
 * (`/api/finance/stream`) and calls `router.refresh()` on each event so the
 * billing dashboard / invoice pages re-render the instant an invoice, transaction
 * or refund changes. Same pattern as `CrmRealtimeRefresher`, pointed at the
 * finance stream (a separate scope so billing events never leak onto other
 * dashboards). Renders nothing.
 */
export function FinanceRealtimeRefresher() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useRealtime({
    url: "/api/finance/stream",
    onEvent: () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 150);
    },
  });

  return null;
}
