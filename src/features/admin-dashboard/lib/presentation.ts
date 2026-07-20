/**
 * Admin-specific presentation helpers. Reuses the client dashboard's tone/label
 * maps for project/phase/task/milestone/order statuses; this only adds the
 * PAYMENT status mapping (payments have their own status vocabulary — see
 * `@/types/payment`).
 */

import type { StatusPresentation } from "@/features/client-dashboard/lib/presentation";

const NEUTRAL = "bg-line/60 text-ink-muted";
const BLUE = "bg-royal/10 text-royal-700";
const GREEN = "bg-emerald-500/10 text-emerald-700";
const RED = "bg-red-500/10 text-red-600";

const PAYMENT_STATUS_TONE: Record<string, string> = {
  created: NEUTRAL,
  authorized: BLUE,
  captured: GREEN,
  failed: RED,
  refunded: NEUTRAL,
};

const DELIVERABLE_STATUS_TONE: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-700",
  approved: GREEN,
  rejected: RED,
};

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function paymentStatusPresentation(status: string): StatusPresentation {
  return { label: titleCase(status), tone: PAYMENT_STATUS_TONE[status] ?? NEUTRAL };
}

export function deliverableStatusPresentation(status: string): StatusPresentation {
  return { label: titleCase(status), tone: DELIVERABLE_STATUS_TONE[status] ?? NEUTRAL };
}

/** Human-readable byte size, e.g. "1.4 MB". */
export function formatFileSize(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}
