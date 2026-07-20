import { formatPrice, GST, PAYMENT_MILESTONES } from "@/lib/config/pricing";

/**
 * Reusable billing summary — computes GST + total for a base amount using the
 * centralized GST config. Purely presentational (display math only; never a
 * substitute for the checkout/invoice engine).
 */
export function BillingSummary({
  baseAmount,
  showMilestones = false,
}: {
  baseAmount: number;
  showMilestones?: boolean;
}) {
  const gstAmount = Math.round((baseAmount * GST.percentage) / 100);
  const total = baseAmount + gstAmount;

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-muted">Subtotal</span>
        <span className="font-semibold text-ink">{formatPrice(baseAmount)}</span>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-ink-muted">{GST.label}</span>
        <span className="font-semibold text-ink">{formatPrice(gstAmount)}</span>
      </div>
      <div className="my-4 h-px w-full bg-line" />
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">Grand Total</span>
        <span className="text-xl font-bold text-royal">{formatPrice(total)}</span>
      </div>

      {showMilestones && (
        <div className="mt-6 border-t border-line pt-5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Payment milestones
          </h4>
          <ul className="mt-3 space-y-2">
            {PAYMENT_MILESTONES.map((m) => (
              <li
                key={m.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-ink-soft">{m.label}</span>
                <span className="font-medium text-ink">
                  {m.percentage}% · {formatPrice(Math.round((total * m.percentage) / 100))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
