import { formatPrice } from "@/lib/config/pricing";

/**
 * Reusable price badge. Renders a price with optional struck old price and a
 * discount pill. Purely presentational — receives numbers/labels via props.
 */
export function PriceBadge({
  price,
  oldPrice,
  discountLabel,
  cadence,
  size = "md",
}: {
  price: number | string;
  oldPrice?: number | string | null;
  discountLabel?: string | null;
  cadence?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const priceText = typeof price === "number" ? formatPrice(price) : price;
  const oldText =
    oldPrice == null
      ? null
      : typeof oldPrice === "number"
      ? formatPrice(oldPrice)
      : oldPrice;

  const priceSize =
    size === "lg" ? "text-5xl" : size === "sm" ? "text-2xl" : "text-3xl";

  return (
    <span className="inline-flex flex-wrap items-baseline gap-2.5">
      <span className={`${priceSize} font-bold tracking-tight text-royal`}>
        {priceText}
      </span>
      {oldText && (
        <span className="text-base text-ink-faint line-through">{oldText}</span>
      )}
      {cadence && <span className="text-sm text-ink-faint">{cadence}</span>}
      {discountLabel && (
        <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-bold text-success">
          {discountLabel}
        </span>
      )}
    </span>
  );
}
