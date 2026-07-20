"use server";

/**
 * Finance server actions — the authorized write surface for the billing UI.
 *
 * Each action re-checks finance authorization server-side via `requireFinanceUser`
 * (admin / future finance manager only — never trusts the client), delegates to
 * the EXISTING finance services (`@/lib/refund-service`) — which record the
 * transaction, append the immutable ledger entry, log the timeline event,
 * notify + emit realtime through the shared layers — and revalidates the affected
 * billing routes so the server components re-render. No business logic lives here.
 */

import { revalidatePath } from "next/cache";
import { requireFinanceUser } from "@/lib/finance-auth";
import { refundInvoice } from "@/lib/refund-service";

function revalidateBilling(invoiceId?: string): void {
  revalidatePath("/admin/billing");
  revalidatePath("/admin/billing/invoices");
  if (invoiceId) {
    revalidatePath(`/admin/billing/invoices/${invoiceId}`);
    revalidatePath(`/client/invoices/${invoiceId}`);
  }
  revalidatePath("/client/invoices");
}

/**
 * Issue a refund on an invoice. Full refund by default (partial is foundation —
 * pass `amountMinor` to refund a specific amount). Admin-initiated only.
 */
export async function refundInvoiceAction(
  invoiceId: string,
  input?: { amountMinor?: number; reason?: string | null }
): Promise<void> {
  const finance = await requireFinanceUser();
  await refundInvoice({ invoiceId, amountMinor: input?.amountMinor, reason: input?.reason ?? null }, finance.id);
  revalidateBilling(invoiceId);
}
