/**
 * Invoice Service — server-only invoice generation + lifecycle.
 *
 * An invoice is generated the moment a checkout Order's payment is captured
 * (`generateInvoiceForOrder`, called from `@/lib/order-service` inside the
 * capture transaction). Pricing is NEVER recomputed with a second model: the
 * authoritative *Minor amounts are copied from the Order (which the shared
 * `@/lib/pricing-engine` already computed), and the rendered line snapshot is
 * rebuilt from that SAME engine via the catalog — service package, add-ons,
 * coupon discount, tax. Generation records the settling PAYMENT transaction (via
 * the Transaction Service, which appends the immutable ledger credit) and emits
 * realtime + a notification, satisfying the success flow:
 *   Payment → Invoice Generated → Ledger Entry → Notification → Realtime.
 *
 * One invoice per order (idempotent — a re-run returns the existing invoice).
 * Server-only; accepts a base or `$transaction` Prisma client.
 */

import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateOrder } from "@/lib/pricing-engine";
import { getService, getPackage } from "@/config/catalog";
import { findCoupon } from "@/config/coupons";
import { recordTransaction } from "@/lib/transaction-service";
import { emitBillingRealtime } from "@/lib/finance-realtime";
import { notify, notifyMany } from "@/lib/notifications/service";
import { getAgencyAdminIds } from "@/lib/notifications/recipients";
import { NOTIFICATION_TYPE, NOTIFICATION_AUDIENCE } from "@/constants/notification";
import {
  INVOICE_STATUS,
  INVOICE_NUMBER_PREFIX,
  INVOICE_NUMBER_RANDOM_LENGTH,
  TRANSACTION_TYPE,
  type InvoiceStatusValue,
} from "@/constants/finance";
import type { Coupon } from "@/types/coupon";
import type { CheckoutBillingInfo } from "@/types/checkout";
import type { Invoice, InvoiceBillingAddress, InvoiceLineItem } from "@/types/finance";

type Db = PrismaClient | Prisma.TransactionClient;

export class InvoiceError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message);
    this.name = "InvoiceError";
  }
}

/* ── Invoice number ────────────────────────────────────────────────────────── */

const NUMBER_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function generateInvoiceNumber(): string {
  const bytes = randomBytes(INVOICE_NUMBER_RANDOM_LENGTH);
  let out = "";
  for (let i = 0; i < INVOICE_NUMBER_RANDOM_LENGTH; i++) {
    out += NUMBER_ALPHABET[bytes[i] % NUMBER_ALPHABET.length];
  }
  return `${INVOICE_NUMBER_PREFIX}-${out}`;
}

/* ── Row → domain mapping ──────────────────────────────────────────────────── */

type InvoiceRow = {
  id: string;
  number: string;
  clientId: string | null;
  orderId: string | null;
  projectId: string | null;
  proposalId: string | null;
  billing: Prisma.JsonValue;
  gstNumber: string | null;
  lineItems: Prisma.JsonValue;
  notes: string | null;
  currency: string;
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
  amountPaidMinor: number;
  amountRefundedMinor: number;
  status: string;
  invoiceDate: Date;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toInvoice(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    number: row.number,
    clientId: row.clientId,
    orderId: row.orderId,
    projectId: row.projectId,
    proposalId: row.proposalId,
    billing: (row.billing as unknown as InvoiceBillingAddress) ?? emptyBilling(),
    gstNumber: row.gstNumber,
    lineItems: (row.lineItems as unknown as InvoiceLineItem[]) ?? [],
    notes: row.notes,
    currency: row.currency,
    subtotalMinor: row.subtotalMinor,
    discountMinor: row.discountMinor,
    taxMinor: row.taxMinor,
    totalMinor: row.totalMinor,
    amountPaidMinor: row.amountPaidMinor,
    amountRefundedMinor: row.amountRefundedMinor,
    status: row.status as InvoiceStatusValue,
    invoiceDate: row.invoiceDate.toISOString(),
    dueDate: row.dueDate?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function emptyBilling(): InvoiceBillingAddress {
  return {
    name: "",
    email: "",
    phone: null,
    company: null,
    gstNumber: null,
    country: null,
    state: null,
    city: null,
    address: null,
  };
}

/** Map an order's stored billing JSON to the invoice billing snapshot. */
function billingFromOrder(billing: CheckoutBillingInfo | null): InvoiceBillingAddress {
  if (!billing) return emptyBilling();
  return {
    name: billing.name ?? "",
    email: billing.email ?? "",
    phone: billing.phone || null,
    company: billing.company || null,
    gstNumber: billing.gstNumber || null,
    country: billing.country || null,
    state: billing.state || null,
    city: billing.city || null,
    address: billing.address || null,
  };
}

/**
 * Rebuild the rendered invoice lines from the SAME pricing engine the order was
 * priced with (package + add-ons + discount + tax). Display-only snapshot — the
 * authoritative amounts come from the order's stored *Minor columns.
 */
function buildInvoiceLines(order: {
  serviceSlug: string;
  packageId: string;
  addonIds: string[];
  couponCode: string | null;
}): InvoiceLineItem[] {
  const service = getService(order.serviceSlug);
  const pkg = getPackage(order.serviceSlug, order.packageId);
  if (!service || !pkg) return [];

  const addons = service.addons.filter((a) => order.addonIds.includes(a.id));
  const coupon: Coupon | null = order.couponCode ? findCoupon(order.couponCode) ?? null : null;
  const breakdown = calculateOrder({ pkg, addons, coupon });

  const lines: InvoiceLineItem[] = [
    { kind: "package", refId: pkg.id, label: pkg.name, amountMinor: breakdown.basePrice.amountMinor },
    ...breakdown.addonLines.map((line, i) => ({
      kind: "addon" as const,
      refId: addons[i]?.id ?? "",
      label: line.label,
      amountMinor: line.amount.amountMinor,
    })),
  ];
  if (breakdown.discount.amountMinor > 0) {
    lines.push({
      kind: "discount",
      refId: coupon?.code ?? "discount",
      label: breakdown.discountLabel ?? "Discount",
      amountMinor: -breakdown.discount.amountMinor,
    });
  }
  if (breakdown.tax.amountMinor > 0) {
    lines.push({
      kind: "tax",
      refId: "tax",
      label: `GST (${breakdown.taxRatePercent}%)`,
      amountMinor: breakdown.tax.amountMinor,
    });
  }
  return lines;
}

/* ── Generation (the payment-capture seam) ─────────────────────────────────── */

/**
 * Generate (or return the existing) invoice for a captured order, marking it
 * PAID and recording the settling payment transaction + ledger credit. Called
 * from the Order Engine's capture transaction, so `db` is normally a tx client.
 * Idempotent: an order already carrying an invoice returns it unchanged.
 */
export async function generateInvoiceForOrder(orderId: string, db: Db = prisma): Promise<Invoice> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { invoice: true, project: true, payments: true },
  });
  if (!order) throw new InvoiceError(`generateInvoiceForOrder: order ${orderId} not found.`, 404);

  // Idempotent — one invoice per order.
  if (order.invoice) return toInvoice(order.invoice as InvoiceRow);

  const billing = billingFromOrder(order.billing as unknown as CheckoutBillingInfo | null);
  const lineItems = buildInvoiceLines({
    serviceSlug: order.serviceSlug,
    packageId: order.packageId,
    addonIds: order.addonIds,
    couponCode: order.couponCode,
  });
  const capturedPayment = order.payments.find((p) => p.status === "captured") ?? order.payments[0];

  // Create the PAID invoice (retry on the astronomically unlikely number clash).
  let created: InvoiceRow | null = null;
  for (let attempt = 0; attempt < 5 && !created; attempt++) {
    try {
      created = (await db.invoice.create({
        data: {
          number: generateInvoiceNumber(),
          clientId: order.userId,
          orderId: order.id,
          projectId: order.project?.id ?? null,
          proposalId: null,
          billing: billing as unknown as Prisma.InputJsonValue,
          gstNumber: billing.gstNumber,
          lineItems: lineItems as unknown as Prisma.InputJsonValue,
          currency: order.currency,
          subtotalMinor: order.subtotalMinor,
          discountMinor: order.discountMinor,
          taxMinor: order.taxMinor,
          totalMinor: order.totalMinor,
          amountPaidMinor: order.totalMinor,
          amountRefundedMinor: 0,
          status: INVOICE_STATUS.PAID,
          invoiceDate: new Date(),
        },
      })) as InvoiceRow;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        attempt < 4
      ) {
        continue;
      }
      throw error;
    }
  }
  if (!created) throw new InvoiceError("Could not generate a unique invoice number.", 500);

  const invoice = toInvoice(created);

  // Record the settling payment transaction — this appends the ledger CREDIT
  // through the Transaction → Ledger Services (single seam, no direct writes).
  await recordTransaction(
    {
      invoiceId: invoice.id,
      type: TRANSACTION_TYPE.PAYMENT,
      amountMinor: order.totalMinor,
      currency: order.currency,
      gateway: capturedPayment?.provider ?? null,
      gatewayReference: capturedPayment?.providerPaymentId ?? null,
      notes: `Payment captured for order ${order.id.slice(-6).toUpperCase()}`,
      actorId: order.userId,
    },
    db
  );

  // Realtime + notification (best-effort — never break the capture transaction).
  emitBillingRealtime(`invoice-generated-${invoice.id}`, `Invoice ${invoice.number} generated`, order.userId);
  try {
    if (order.userId) {
      await notify(
        {
          userId: order.userId,
          type: NOTIFICATION_TYPE.INVOICE_GENERATED,
          audience: NOTIFICATION_AUDIENCE.CLIENT,
          title: `Invoice ${invoice.number} ready`,
          body: "Your invoice for the confirmed payment is available to view and download.",
          data: { invoiceId: invoice.id, href: `/client/invoices/${invoice.id}` },
        },
        db
      );
    }
    const adminIds = await getAgencyAdminIds(db);
    if (adminIds.length) {
      await notifyMany(
        adminIds,
        {
          type: NOTIFICATION_TYPE.INVOICE_GENERATED,
          audience: NOTIFICATION_AUDIENCE.ADMIN,
          title: `Invoice ${invoice.number} generated`,
          body: `Order ${order.id.slice(-6).toUpperCase()} invoiced.`,
          data: { invoiceId: invoice.id, href: `/admin/billing/invoices/${invoice.id}` },
        },
        db
      );
    }
  } catch {
    /* notifications are non-critical */
  }

  return invoice;
}

/* ── Status maintenance ────────────────────────────────────────────────────── */

/**
 * Derive an invoice status from its paid/refunded running totals. Used after a
 * refund (or a future partial payment) so status always reflects the money.
 */
export function deriveInvoiceStatus(inv: {
  totalMinor: number;
  amountPaidMinor: number;
  amountRefundedMinor: number;
  status: InvoiceStatusValue;
}): InvoiceStatusValue {
  if (inv.status === INVOICE_STATUS.CANCELLED) return INVOICE_STATUS.CANCELLED;
  const net = inv.amountPaidMinor - inv.amountRefundedMinor;
  if (inv.amountRefundedMinor > 0 && net <= 0) return INVOICE_STATUS.REFUNDED;
  if (inv.amountPaidMinor >= inv.totalMinor && inv.totalMinor > 0) return INVOICE_STATUS.PAID;
  if (inv.amountPaidMinor > 0) return INVOICE_STATUS.PARTIALLY_PAID;
  return INVOICE_STATUS.PENDING;
}

/* ── Reads ─────────────────────────────────────────────────────────────────── */

/** Fetch one invoice by id, or null. */
export async function getInvoice(invoiceId: string, db: Db = prisma): Promise<Invoice | null> {
  const row = await db.invoice.findUnique({ where: { id: invoiceId } });
  return row ? toInvoice(row as InvoiceRow) : null;
}

/** Fetch an invoice ONLY if it belongs to `clientId` (client-scoped view). */
export async function getClientInvoice(
  clientId: string,
  invoiceId: string,
  db: Db = prisma
): Promise<Invoice | null> {
  const row = await db.invoice.findFirst({ where: { id: invoiceId, clientId } });
  return row ? toInvoice(row as InvoiceRow) : null;
}

/** List all invoices (newest first), optionally filtered by status. */
export async function listInvoices(status?: string, db: Db = prisma): Promise<Invoice[]> {
  const rows = await db.invoice.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return rows.map((r) => toInvoice(r as InvoiceRow));
}

/** List a client's own invoices (newest first). */
export async function listClientInvoices(clientId: string, db: Db = prisma): Promise<Invoice[]> {
  const rows = await db.invoice.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => toInvoice(r as InvoiceRow));
}
