/**
 * Invoice PDF provider abstraction — FOUNDATION ONLY.
 *
 * This is the provider seam for future invoice PDF generation, mirroring the
 * payment/notification provider registries. NO PDF is generated yet: the default
 * provider is intentionally unconfigured and `render()` throws a clear
 * "not implemented" error. When a real generator lands (e.g. a
 * `puppeteer`/`react-pdf`/HTML-to-PDF service), implement `InvoicePdfProvider`
 * in a new file and register it here — no call site changes, exactly like adding
 * a Stripe payment adapter.
 *
 * Consumers depend ONLY on this interface + `getInvoicePdfProvider()`, so the
 * client "download invoice" button can render its disabled/coming-soon state
 * from `isConfigured()` today and light up with zero UI changes later.
 *
 * Server-only.
 */

import type { Invoice } from "@/types/finance";

export interface InvoicePdfResult {
  /** The generated PDF bytes. */
  bytes: Uint8Array;
  fileName: string;
  contentType: "application/pdf";
}

export interface InvoicePdfProvider {
  readonly id: string;
  /** True when this provider can actually produce a PDF. */
  isConfigured(): boolean;
  /** Render an invoice to a PDF. Throws when the provider is not configured. */
  render(invoice: Invoice): Promise<InvoicePdfResult>;
}

/**
 * The default no-op provider — foundation placeholder. Reports "not configured"
 * so UIs show a coming-soon state, and throws if `render()` is ever called.
 */
const noopPdfProvider: InvoicePdfProvider = {
  id: "noop",
  isConfigured: () => false,
  async render(): Promise<InvoicePdfResult> {
    throw new Error("Invoice PDF generation is not implemented yet (provider foundation only).");
  },
};

const providers: Record<string, InvoicePdfProvider> = {
  noop: noopPdfProvider,
  // pdf: realPdfProvider,  // ← future: implement InvoicePdfProvider, add here
};

/** The invoice PDF provider in use today (foundation no-op). */
export const DEFAULT_INVOICE_PDF_PROVIDER = "noop";

export function getInvoicePdfProvider(id: string = DEFAULT_INVOICE_PDF_PROVIDER): InvoicePdfProvider {
  return providers[id] ?? noopPdfProvider;
}

/** Convenience: whether invoice PDF download is available (false today). */
export function isInvoicePdfAvailable(): boolean {
  return getInvoicePdfProvider().isConfigured();
}
