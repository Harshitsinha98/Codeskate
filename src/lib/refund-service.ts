/**
 * Refund Service — server-only, admin-initiated invoice refunds.
 *
 * Supports a FULL refund (partial is foundation — the amount is parameterised
 * and the running totals track it, admin UI follows later). A refund reuses the
 * EXISTING payment abstraction (`@/lib/payments` → the provider's `refund()`),
 * then, in ONE transaction, automatically:
 *   1. records the REFUND transaction (Transaction Service → appends the ledger
 *      DEBIT via the Ledger Service),
 *   2. updates the invoice's refunded total + derived status,
 *   3. marks the payment + order refunded,
 *   4. logs a Timeline event on the linked project (Timeline Service),
 *   5. generates a Notification (client + admins) and emits realtime.
 *
 * Admin-initiated only — the caller (server action) gates on `requireFinanceUser`.
 * Server-only.
 */

import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payments";
import type { PaymentProvider } from "@/types/payment";
import { recordTransaction } from "@/lib/transaction-service";
import { deriveInvoiceStatus, toInvoice } from "@/lib/invoice-service";
import { timelineService } from "@/lib/timeline-service";
import { emitBillingRealtime } from "@/lib/finance-realtime";
import { notify, notifyMany } from "@/lib/notifications/service";
import { getAgencyAdminIds } from "@/lib/notifications/recipients";
import { NOTIFICATION_TYPE, NOTIFICATION_AUDIENCE } from "@/constants/notification";
import { PROJECT_ACTIVITY_VERB } from "@/constants/project";
import { ORDER_STATUS } from "@/constants/order";
import {
  TRANSACTION_TYPE,
  REFUND_TYPE,
  type InvoiceStatusValue,
} from "@/constants/finance";
import type { Invoice } from "@/types/finance";

export class RefundError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message);
    this.name = "RefundError";
  }
}

export interface RefundInvoiceInput {
  invoiceId: string;
  /** Refund amount in minor units. Omit for a FULL refund of the remaining net. */
  amountMinor?: number;
  reason?: string | null;
}

/**
 * Refund an invoice. Calls the payment provider, then persists all side-effects
 * atomically. Full refund by default; a partial amount is honoured if provided
 * (foundation). Admin-only — enforced by the calling server action.
 */
export async function refundInvoice(
  input: RefundInvoiceInput,
  actorId: string | null
): Promise<Invoice> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: input.invoiceId },
    include: {
      order: { include: { payments: true, project: { select: { id: true } } } },
    },
  });
  if (!invoice) throw new RefundError("Invoice not found.", 404);

  const alreadyRefunded = invoice.amountRefundedMinor;
  const netPaid = invoice.amountPaidMinor - alreadyRefunded;
  if (netPaid <= 0) throw new RefundError("This invoice has nothing left to refund.", 409);

  const amountMinor = input.amountMinor ?? netPaid;
  if (amountMinor <= 0) throw new RefundError("Refund amount must be positive.", 400);
  if (amountMinor > netPaid) throw new RefundError("Refund exceeds the refundable balance.", 400);

  const refundType = amountMinor >= netPaid ? REFUND_TYPE.FULL : REFUND_TYPE.PARTIAL;

  // Resolve the captured payment to refund against (reuse the payment abstraction).
  const capturedPayment =
    invoice.order?.payments.find((p) => p.status === "captured") ?? invoice.order?.payments[0] ?? null;

  let gatewayReference: string | null = null;
  const gateway = capturedPayment?.provider ?? null;
  if (capturedPayment?.providerPaymentId && gateway) {
    const provider = getPaymentProvider(gateway as PaymentProvider);
    if (typeof provider.refund !== "function") {
      throw new RefundError(`Provider "${gateway}" does not support refunds.`, 501);
    }
    if (!provider.isConfigured()) {
      throw new RefundError("Payments are not configured on the server.", 503);
    }
    const result = await provider.refund({
      providerPaymentId: capturedPayment.providerPaymentId,
      amount: { amountMinor, currency: invoice.currency },
      notes: { invoiceId: invoice.id, invoiceNumber: invoice.number },
    });
    gatewayReference = result.providerRefundId;
  }

  // Persist every side-effect atomically.
  const updated = await prisma.$transaction(async (tx) => {
    // 1. Record the refund transaction (also appends the immutable ledger debit).
    await recordTransaction(
      {
        invoiceId: invoice.id,
        type: TRANSACTION_TYPE.REFUND,
        amountMinor,
        currency: invoice.currency,
        gateway,
        gatewayReference,
        notes: input.reason?.trim() || `${refundType} refund for invoice ${invoice.number}`,
        actorId,
      },
      tx
    );

    // 2. Update the invoice refunded total + derived status.
    const newRefunded = alreadyRefunded + amountMinor;
    const status: InvoiceStatusValue = deriveInvoiceStatus({
      totalMinor: invoice.totalMinor,
      amountPaidMinor: invoice.amountPaidMinor,
      amountRefundedMinor: newRefunded,
      status: invoice.status as InvoiceStatusValue,
    });
    const row = await tx.invoice.update({
      where: { id: invoice.id },
      data: { amountRefundedMinor: newRefunded, status },
    });

    // 3. Mark the payment + order refunded (full refund only — partial leaves
    //    the order paid, since the engagement is still partly settled).
    if (refundType === REFUND_TYPE.FULL) {
      if (capturedPayment) {
        await tx.payment.update({ where: { id: capturedPayment.id }, data: { status: "refunded" } });
      }
      if (invoice.orderId) {
        await tx.order.update({ where: { id: invoice.orderId }, data: { status: "refunded" } });
      }
    }

    // 4. Timeline event on the linked project (Timeline Service — single seam).
    const projectId = invoice.order?.project?.id ?? null;
    if (projectId) {
      await timelineService.log(
        {
          projectId,
          verb: PROJECT_ACTIVITY_VERB.NOTE_ADDED,
          message: `Refund issued on invoice ${invoice.number}.`,
          actorId,
          metadata: { invoiceId: invoice.id, amountMinor, refundType, gatewayReference },
        },
        tx
      );
    }

    return row;
  });

  const result = toInvoice(updated as Parameters<typeof toInvoice>[0]);

  // 5. Realtime + notifications (best-effort — the refund is already persisted).
  emitBillingRealtime(`invoice-refunded-${invoice.id}-${gatewayReference ?? amountMinor}`, `Invoice ${invoice.number} refunded`, actorId);
  try {
    if (invoice.clientId) {
      await notify({
        userId: invoice.clientId,
        type: NOTIFICATION_TYPE.REFUND_ISSUED,
        audience: NOTIFICATION_AUDIENCE.CLIENT,
        title: `Refund issued for ${invoice.number}`,
        body: input.reason?.trim() || "A refund has been processed for your invoice.",
        data: { invoiceId: invoice.id, href: `/client/invoices/${invoice.id}` },
      });
    }
    const adminIds = await getAgencyAdminIds();
    if (adminIds.length) {
      await notifyMany(adminIds, {
        type: NOTIFICATION_TYPE.REFUND_ISSUED,
        audience: NOTIFICATION_AUDIENCE.ADMIN,
        title: `Refund on ${invoice.number}`,
        body: `${refundType} refund processed.`,
        data: { invoiceId: invoice.id, href: `/admin/billing/invoices/${invoice.id}` },
      });
    }
  } catch {
    /* notifications are non-critical */
  }

  return result;
}
