/**
 * Finance presentation helpers — label + tone maps for the billing surface.
 * Mirrors `@/features/crm/lib/presentation`: status VALUES come from
 * `@/constants/finance` (the single source of truth); this only maps them to
 * human labels + Tailwind tone classes for the badges.
 */

import {
  INVOICE_STATUS,
  TRANSACTION_TYPE,
  TRANSACTION_STATUS,
  LEDGER_ENTRY_TYPE,
} from "@/constants/finance";
import type { StatusPresentation } from "@/features/client-dashboard/lib/presentation";

type Tone = string;

const NEUTRAL: Tone = "bg-line/60 text-ink-muted";
const BLUE: Tone = "bg-royal/10 text-royal-700";
const AMBER: Tone = "bg-amber-500/10 text-amber-700";
const GREEN: Tone = "bg-emerald-500/10 text-emerald-700";
const RED: Tone = "bg-red-500/10 text-red-600";
const VIOLET: Tone = "bg-violet-500/10 text-violet-700";

function titleCase(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const INVOICE_TONE: Record<string, Tone> = {
  [INVOICE_STATUS.DRAFT]: NEUTRAL,
  [INVOICE_STATUS.PENDING]: AMBER,
  [INVOICE_STATUS.PAID]: GREEN,
  [INVOICE_STATUS.PARTIALLY_PAID]: BLUE,
  [INVOICE_STATUS.REFUNDED]: VIOLET,
  [INVOICE_STATUS.CANCELLED]: RED,
};

const TRANSACTION_TONE: Record<string, Tone> = {
  [TRANSACTION_TYPE.PAYMENT]: GREEN,
  [TRANSACTION_TYPE.PARTIAL_PAYMENT]: BLUE,
  [TRANSACTION_TYPE.REFUND]: VIOLET,
  [TRANSACTION_TYPE.MANUAL_ADJUSTMENT]: AMBER,
};

const TRANSACTION_STATUS_TONE: Record<string, Tone> = {
  [TRANSACTION_STATUS.PENDING]: AMBER,
  [TRANSACTION_STATUS.SUCCESS]: GREEN,
  [TRANSACTION_STATUS.FAILED]: RED,
};

const LEDGER_TONE: Record<string, Tone> = {
  [LEDGER_ENTRY_TYPE.CREDIT]: GREEN,
  [LEDGER_ENTRY_TYPE.DEBIT]: RED,
};

export function invoiceStatusPresentation(status: string): StatusPresentation {
  return { label: titleCase(status), tone: INVOICE_TONE[status] ?? NEUTRAL };
}

export function transactionTypePresentation(type: string): StatusPresentation {
  return { label: titleCase(type), tone: TRANSACTION_TONE[type] ?? NEUTRAL };
}

export function transactionStatusPresentation(status: string): StatusPresentation {
  return { label: titleCase(status), tone: TRANSACTION_STATUS_TONE[status] ?? NEUTRAL };
}

export function ledgerTypePresentation(type: string): StatusPresentation {
  return { label: titleCase(type), tone: LEDGER_TONE[type] ?? NEUTRAL };
}

export { titleCase as financeTitleCase };
