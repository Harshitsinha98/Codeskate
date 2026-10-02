"use client";

import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Spotlight } from "@/components/ui/Spotlight";
import { waLink } from "@/lib/site";
import type { CatalogService } from "@/types/catalog";

/**
 * Per-service pricing card: mono index, title, a big "from ₹X" price, the
 * entry package's features and a footer with WhatsApp enquiry + details link.
 */
export function ServicePricingCard({
  service,
  index = 0,
}: {
  service: CatalogService;
  index?: number;
}) {
  const entry = service.packages[0];
  const features = entry?.features ?? [];

  const enquireHref = waLink(
    `Hi CodeSkate, I'd like to enquire about ${service.title} (starting from ${entry?.priceLabel ?? "custom pricing"}).`
  );

  return (
    <Reveal delay={(index % 2) * 0.06} className="h-full">
      <Spotlight className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-colors duration-300 hover:border-ink/15">
        <div className="flex-1 p-7 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="font-mono text-[0.7rem] text-ink-faint">{service.index}</span>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-ink">{service.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{service.tagline}</p>
            </div>
            <Link
              href={`/services/${service.slug}`}
              aria-label={`${service.title} details`}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-ink-muted transition-colors hover:border-ink/20 hover:text-ink"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 flex items-baseline gap-2">
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink-muted">From</span>
            <span className="text-4xl font-semibold tabular-nums tracking-tight text-ink">
              {entry?.priceLabel ?? "Custom"}
            </span>
            {entry?.cadence && <span className="text-sm text-ink-muted">{entry.cadence}</span>}
          </div>

          <ul className="mt-7 grid gap-2.5 border-t border-line pt-6 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-ink-soft">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-royal" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <a
          href={enquireHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Enquire about ${service.title} on WhatsApp`}
          className="group/cta flex items-center justify-between border-t border-line bg-subtle px-7 py-4 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-white md:px-8"
        >
          Get an exact quote on WhatsApp
          <ArrowUpRight className="h-4 w-4 text-royal transition-transform group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
        </a>
      </Spotlight>
    </Reveal>
  );
}
