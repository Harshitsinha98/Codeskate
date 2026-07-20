import Link from "next/link";
import { ArrowRight, ShieldCheck, Clock, IndianRupee } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CATALOG_SERVICES } from "@/config/catalog";

const assurances = [
  { icon: IndianRupee, label: "Fixed, agreed scope — no surprise billing" },
  { icon: Clock, label: "Honest timelines, weekly updates" },
  { icon: ShieldCheck, label: "Code you own, 100% handover" },
];

/** Home pricing preview — per-service starting prices + link to full pricing. */
export function PricingPreview() {
  return (
    <section className="border-b border-line bg-subtle py-20 md:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Pricing"
          title="A price for every service."
          description="Competitive, transparent starting prices across everything we do. Every engagement is fixed-scope and tailored — no hourly billing games."
          align="center"
        />

        <Stagger className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATALOG_SERVICES.map((service) => {
            const start = service.packages[0];
            return (
              <StaggerItem key={service.slug} className="h-full">
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col rounded-3xl border border-line bg-surface p-6 shadow-soft transition-all duration-300 ease-premium hover:-translate-y-1 hover:border-royal/25 hover:shadow-lift"
                >
                  <span className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-faint">
                    {service.title}
                  </span>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                    {service.tagline}
                  </p>
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-[0.7rem] font-medium text-ink-faint">
                      from
                    </span>
                    <span className="text-2xl font-bold tracking-tight text-ink">
                      {start.priceLabel}
                    </span>
                    <span className="text-xs text-ink-faint">
                      {start.cadence === "per month" ? "/mo" : ""}
                    </span>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 border-t border-line pt-4 text-sm font-semibold text-royal">
                    View packages
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-10">
            {assurances.map((a) => (
              <span
                key={a.label}
                className="inline-flex items-center gap-2 text-sm text-ink-muted"
              >
                <a.icon className="h-4 w-4 text-success" />
                {a.label}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <p className="mt-8 text-center text-sm text-ink-muted">
            Every engagement is tailored.{" "}
            <a
              href="/pricing"
              className="font-semibold text-royal underline-offset-4 transition-colors hover:text-royal-600 hover:underline"
            >
              Compare all packages in detail →
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
