"use client";

import { Check, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { CatalogService, ServicePackage } from "@/types/catalog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatMoney } from "@/lib/money";

/** Step 1 — shows the selected service, package, included features, and price. */
export function StepPackageReview({
  service,
  pkg,
}: {
  service: CatalogService | undefined;
  pkg: ServicePackage | undefined;
}) {
  if (!service || !pkg) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface p-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <div>
          <h3 className="font-display text-xl tracking-tight text-ink">
            No package selected yet.
          </h3>
          <p className="mt-2 max-w-sm text-sm text-ink-muted">
            Pick a package from any service page to start checkout — your
            selection will land here automatically.
          </p>
        </div>
        <Button href="/services" variant="secondary" arrow>
          Browse services
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Badge>{service.title}</Badge>
        {pkg.featured && <Badge className="border-royal/30 text-royal">Most popular</Badge>}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-3xl tracking-tight text-ink">{pkg.name}</h3>
        <p className="text-sm leading-relaxed text-ink-muted">{pkg.tagline}</p>
      </div>

      <div className="flex items-baseline gap-2 rounded-2xl border border-line bg-base/50 p-6">
        <span className="font-display text-4xl tracking-tight text-ink">
          {pkg.priceFrom ? formatMoney(pkg.priceFrom) : pkg.priceLabel}
        </span>
        <span className="text-sm text-ink-faint">{pkg.cadence}</span>
      </div>

      <div>
        <span className="mb-3 block text-sm font-medium text-ink-soft">
          Included in this package
        </span>
        <ul className="space-y-3">
          {pkg.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-royal/10 text-royal">
                <Check className="h-3 w-3" />
              </span>
              <span className="text-ink-soft">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-ink-faint">
        Wrong package?{" "}
        <Link href={`/services/${service.slug}`} className="font-medium text-ink underline-offset-4 hover:underline">
          Compare packages for {service.title.toLowerCase()} →
        </Link>
      </p>
    </div>
  );
}
