"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { refundInvoiceAction } from "@/app/admin/billing/actions";

/**
 * Admin-only refund trigger for an invoice. Issues a FULL refund (partial is
 * foundation) via `refundInvoiceAction`, which runs the refund service seam:
 * provider refund → transaction → ledger debit → timeline → notification →
 * realtime. Two-step confirm so it can't fire by accident; refreshes on success.
 *
 * Rendered only when the invoice still has a refundable balance — the parent
 * decides visibility, this component just performs the action.
 */
export function RefundButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onRefund() {
    setError(null);
    startTransition(async () => {
      try {
        await refundInvoiceAction(invoiceId);
        setConfirming(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Refund failed.");
      }
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-red-500/40 hover:text-red-600"
      >
        <RotateCcw className="h-4 w-4" />
        Issue refund
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={onRefund}
          className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Confirm full refund
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
          className="rounded-full border border-line px-4 py-2 text-sm text-ink-muted transition-colors hover:text-ink disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
