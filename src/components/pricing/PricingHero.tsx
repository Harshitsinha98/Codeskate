import { Button } from "@/components/ui/Button";
import { PriceBadge } from "./PriceBadge";
import { PRIMARY_OFFER } from "@/lib/config/offers";

/**
 * Reusable pricing hero. Prop-driven headline + offer price line. Defaults to
 * the centralized primary offer for the launch price.
 */
export function PricingHero({
  eyebrow = "Investment",
  title,
  description,
  showOffer = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  showOffer?: boolean;
}) {
  return (
    <div className="text-center">
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="mt-5 text-display-xl font-bold tracking-tight text-ink">
        {title}
      </h1>
      {description && (
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
          {description}
        </p>
      )}
      {showOffer && PRIMARY_OFFER.visible && (
        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-line bg-surface px-6 py-3 shadow-soft">
          <span className="text-sm font-semibold text-ink-muted">
            {PRIMARY_OFFER.name}
          </span>
          <PriceBadge
            price={PRIMARY_OFFER.price}
            oldPrice={PRIMARY_OFFER.oldPrice}
            size="sm"
          />
          <Button href={PRIMARY_OFFER.ctaLink} variant="primary" size="md">
            {PRIMARY_OFFER.ctaText}
          </Button>
        </div>
      )}
    </div>
  );
}
