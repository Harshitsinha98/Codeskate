"use client";

import { CheckCircle2, Info, Loader2, XCircle } from "lucide-react";
import type { PriceBreakdown } from "@/types/checkout";
import type { CatalogService, ServiceAddon, ServicePackage } from "@/types/catalog";
import type { CheckoutBillingInfo } from "@/types/checkout";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/Button";

/**
 * Lifecycle of the payment attempt, owned by `CheckoutFlow` and rendered here.
 * `idle` — nothing started; `processing` — order created / Razorpay modal open /
 * verifying; the rest are terminal outcomes shown in the summary card.
 */
export type PaymentPhase = "idle" | "processing" | "success" | "failed" | "cancelled";

/** Step 5 — order summary: base price, add-ons, discount, GST, grand total. */
export function StepOrderSummary({
  service,
  pkg,
  selectedAddons,
  billing,
  breakdown,
  paymentsEnabled,
  paymentPhase,
  paymentError,
  onProceedToPayment,
}: {
  service: CatalogService;
  pkg: ServicePackage;
  selectedAddons: ServiceAddon[];
  billing: CheckoutBillingInfo;
  breakdown: PriceBreakdown;
  paymentsEnabled: boolean;
  paymentPhase: PaymentPhase;
  paymentError: string | null;
  onProceedToPayment: () => void;
}) {
  return (
    <div className="space-y-8">
      {/* Review order */}
      <div className="rounded-2xl border border-line bg-surface p-6">
        <h3 className="font-display text-lg tracking-tight text-ink">Review order</h3>
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-faint">Service</dt>
            <dd className="mt-0.5 font-medium text-ink">{service.title}</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Package</dt>
            <dd className="mt-0.5 font-medium text-ink">{pkg.name}</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Billed to</dt>
            <dd className="mt-0.5 font-medium text-ink">
              {billing.name || "—"} {billing.company && `· ${billing.company}`}
            </dd>
          </div>
          <div>
            <dt className="text-ink-faint">Contact</dt>
            <dd className="mt-0.5 font-medium text-ink">{billing.email || "—"}</dd>
          </div>
        </dl>
      </div>

      {/* Price breakdown */}
      <div className="rounded-2xl border border-line bg-surface p-6">
        <h3 className="mb-4 font-display text-lg tracking-tight text-ink">Price breakdown</h3>
        <div className="space-y-3 text-sm">
          <Row label={`${pkg.name} package`} value={formatMoney(breakdown.basePrice)} />
          {breakdown.addonLines.map((line) => (
            <Row key={line.label} label={line.label} value={formatMoney(line.amount)} muted />
          ))}
          <div className="h-px bg-line" />
          <Row label="Subtotal" value={formatMoney(breakdown.subtotal)} />
          {breakdown.discount.amountMinor > 0 && (
            <Row
              label={breakdown.discountLabel ?? "Discount"}
              value={`-${formatMoney(breakdown.discount)}`}
              accent="success"
            />
          )}
          <Row
            label={`GST (${breakdown.taxRatePercent}%)`}
            value={formatMoney(breakdown.tax)}
            muted
          />
          <div className="h-px bg-line" />
          <Row
            label="Grand total"
            value={formatMoney(breakdown.grandTotal)}
            emphasis
          />
        </div>
      </div>

      {/* Proceed to payment */}
      <div className="space-y-3 rounded-2xl border border-line bg-base/50 p-6 text-center">
        {paymentPhase === "success" ? (
          <div className="space-y-3">
            <p className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              Payment successful — your order is confirmed.
            </p>
            <p className="text-xs text-ink-faint">
              We&apos;ve recorded your order and will be in touch shortly with next steps.
            </p>
          </div>
        ) : (
          <>
            <Button
              size="lg"
              className="w-full"
              disabled={!paymentsEnabled || paymentPhase === "processing"}
              onClick={onProceedToPayment}
            >
              {paymentPhase === "processing" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : paymentPhase === "failed" || paymentPhase === "cancelled" ? (
                "Retry Payment"
              ) : (
                "Proceed to Payment"
              )}
            </Button>

            {paymentPhase === "failed" && (
              <p className="flex items-center justify-center gap-1.5 text-xs text-red-600">
                <XCircle className="h-3.5 w-3.5 shrink-0" />
                {paymentError ?? "Your payment could not be completed. Please try again."}
              </p>
            )}
            {paymentPhase === "cancelled" && (
              <p className="flex items-center justify-center gap-1.5 text-xs text-ink-faint">
                <Info className="h-3.5 w-3.5 shrink-0" />
                Payment was cancelled. You can try again whenever you&apos;re ready.
              </p>
            )}
            {!paymentsEnabled && paymentPhase === "idle" && (
              <p className="flex items-center justify-center gap-1.5 text-xs text-ink-faint">
                <Info className="h-3.5 w-3.5 shrink-0" />
                Online payments are currently unavailable. Please reach out and we&apos;ll help you
                complete your order.
              </p>
            )}

            <div className="pt-1">
              <Button href="/contact" variant="secondary" size="md">
                Talk to us instead
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  accent,
  emphasis,
}: {
  label: string;
  value: string;
  muted?: boolean;
  accent?: "success";
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-ink-faint" : "text-ink-soft"}>{label}</span>
      <span
        className={
          emphasis
            ? "font-display text-xl tracking-tight text-ink"
            : accent === "success"
              ? "font-medium text-emerald-600"
              : "font-medium text-ink"
        }
      >
        {value}
      </span>
    </div>
  );
}
