"use client";

import { Check } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { waLink } from "@/lib/site";
import { getServiceIcon, serviceAccentText } from "./serviceIcons";
import type { CatalogService } from "@/types/catalog";

/**
 * DiziCode-style per-service pricing card: colored icon + title, a
 * "Starting from ₹X" price, the entry package's feature list, and a vertical
 * "ENQUIRE NOW" rail that opens WhatsApp (price is discussed after enquiry).
 */
export function ServicePricingCard({
  service,
  index = 0,
}: {
  service: CatalogService;
  index?: number;
}) {
  const entry = service.packages[0];
  const accent = serviceAccentText[service.slug] ?? "text-royal";
  const features = entry?.features ?? [];
  const cadence = entry?.cadence ? ` ${entry.cadence}` : "";

  const enquireHref = waLink(
    `Hi CodeSkate, I'd like to enquire about ${service.title} (starting from ${entry?.priceLabel ?? "custom pricing"}).`
  );

  return (
    <Reveal delay={index * 0.05}>
      <div className="flex overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition-shadow duration-300 hover:shadow-lift">
        <div className="flex-1 p-6 md:p-8">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-surface/70">
              {getServiceIcon(service.slug)}
            </span>
            <div>
              <h3 className={`text-xl font-semibold md:text-2xl ${accent}`}>
                {service.title}
              </h3>
              <p className="mt-0.5 text-sm text-ink-muted">{service.tagline}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
              Starting from
            </p>
            <p className="mt-1 text-3xl font-bold text-ink md:text-4xl">
              {entry?.priceLabel ?? "Custom"}
              <span className="text-base font-normal text-ink-muted">
                {cadence}
              </span>
            </p>
          </div>

          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-ink-soft">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
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
          className="flex w-14 shrink-0 items-center justify-center bg-royal text-white transition-colors duration-300 hover:bg-royal/90 md:w-16"
        >
          <span
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Enquire Now
          </span>
        </a>
      </div>
    </Reveal>
  );
}
