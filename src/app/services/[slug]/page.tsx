import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { services, getService } from "@/lib/services";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CTA } from "@/components/sections/CTA";
import { cn } from "@/lib/utils";
import { site, waLink } from "@/lib/site";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: `${service.title} — ${service.tagline}`,
    description: service.summary,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

const accentText = {
  royal: "text-royal",
  violet: "text-violet",
  cyan: "text-cyan-600",
};

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const idx = services.findIndex((s) => s.slug === slug);
  const next = services[(idx + 1) % services.length];

  const startingLabel = service.packages[0]?.priceLabel ?? "Custom pricing";
  const startingCadence = service.packages[0]?.cadence ?? "";
  const enquireHref = waLink(
    `Hi CodeSkate, I'd like to enquire about ${service.title} (starting from ${startingLabel}).`
  );

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    provider: { "@type": "Organization", name: site.legalName, url: site.url },
    areaServed: "Worldwide",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      <PageHeader
        eyebrow={`Service ${service.index}`}
        title={service.title}
        description={service.summary}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button href="/contact" variant="glow" size="lg" arrow magnetic>
            Start Your Project
          </Button>
          <Button
            href={enquireHref}
            variant="night"
            size="lg"
            external
          >
            Enquire on WhatsApp
          </Button>
          <p className="text-sm font-medium text-white/50">
            {service.outcome}
          </p>
        </div>
      </PageHeader>

      {/* Outcomes bar */}
      <section className="border-y border-line bg-surface/50 py-12">
        <div className="container-x">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {service.outcomes.map((o, i) => (
              <Reveal key={o.label} delay={i * 0.08}>
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "font-display text-5xl tracking-tight",
                      accentText[service.accent]
                    )}
                  >
                    {o.metric}
                  </span>
                  <span className="mt-2 text-sm text-ink-muted">{o.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-24 md:py-28">
        <div className="container-x">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <SectionHeading
              eyebrow="Capabilities"
              title="Everything this includes."
              description={`From strategy to ship, here's the full scope of what our ${service.title.toLowerCase()} engagements can cover.`}
            />
            <Stagger className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {service.capabilities.map((cap) => (
                <StaggerItem key={cap}>
                  <div className="flex items-center gap-3 border-b border-line py-3">
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink/5",
                        accentText[service.accent]
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-sm text-ink-soft">{cap}</span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* Deliverables + Process */}
      <section className="bg-surface/40 py-24 md:py-28">
        <div className="container-x">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            {/* Deliverables */}
            <div>
              <SectionHeading
                eyebrow="Deliverables"
                title="What you'll walk away with."
              />
              <div className="mt-10 space-y-3">
                {service.deliverables.map((d, i) => (
                  <Reveal key={d} delay={i * 0.06}>
                    <div className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 shadow-soft">
                      <span className="font-display text-sm tabular-nums text-ink-faint">
                        0{i + 1}
                      </span>
                      <span className="text-sm text-ink-soft">{d}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Process */}
            <div>
              <SectionHeading
                eyebrow="Process"
                title="How we get there."
              />
              <div className="mt-10 space-y-6">
                {service.process.map((step, i) => (
                  <Reveal key={step.title} delay={i * 0.06}>
                    <div className="relative flex gap-5 pl-2">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface font-display text-xs",
                            accentText[service.accent]
                          )}
                        >
                          {i + 1}
                        </span>
                        {i < service.process.length - 1 && (
                          <span className="mt-1 h-full w-px flex-1 bg-line" />
                        )}
                      </div>
                      <div className="pb-2">
                        <h3 className="font-display text-lg tracking-tight text-ink">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment / starting price */}
      <section className="py-16 md:py-20">
        <div className="container-x">
          <Reveal>
            <div className="flex flex-col items-center gap-6 rounded-4xl border border-line bg-surface p-8 text-center shadow-soft md:flex-row md:justify-between md:p-12 md:text-left">
              <div>
                <span className="eyebrow">Investment</span>
                <p className="mt-3 text-sm text-ink-muted">
                  {service.title} projects start from
                </p>
                <p className="mt-1 font-display text-4xl tracking-tight text-ink md:text-5xl">
                  {startingLabel}
                  {startingCadence && (
                    <span className="ml-2 text-base font-normal text-ink-muted">
                      {startingCadence}
                    </span>
                  )}
                </p>
                <p className="mt-3 max-w-md text-sm text-ink-soft">
                  Final pricing depends on your scope. Tap Enquire Now and we&apos;ll
                  confirm your exact quote on WhatsApp within minutes.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                <Button href={enquireHref} variant="primary" size="lg" external>
                  Enquire on WhatsApp
                </Button>
                <Button href="/contact" variant="secondary" size="lg">
                  Start Your Project
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Add-ons */}
      {service.addons.length > 0 && (
        <section className="py-24 md:py-28">
          <div className="container-x">
            <SectionHeading
              eyebrow="Add-ons"
              title="Extend any package."
              description="Scope these in alongside any tier as your needs grow."
              className="mb-12"
            />
            <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {service.addons.map((addon) => (
                <StaggerItem key={addon.id}>
                  <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-soft">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-lg tracking-tight text-ink">
                        {addon.name}
                      </h3>
                      <Badge className="shrink-0">{addon.priceLabel}</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                      {addon.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* Technologies */}
      <section className="py-24 md:py-28">
        <div className="container-x">
          <SectionHeading
            eyebrow="Technologies"
            title="The tools behind the work."
            align="center"
          />
          <Stagger className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-3">
            {service.technologies.map((tech) => (
              <StaggerItem key={tech}>
                <span className="inline-flex items-center rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink-soft shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:text-ink hover:shadow-lift">
                  {tech}
                </span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Next service */}
      <section className="pb-24">
        <div className="container-x">
          <Reveal>
            <Link
              href={`/services/${next.slug}`}
              className="group flex flex-col items-start justify-between gap-4 rounded-4xl border border-line bg-surface p-8 shadow-soft transition-all duration-500 hover:shadow-lift md:flex-row md:items-center"
            >
              <div>
                <span className="eyebrow">Next service</span>
                <p className="mt-2 font-display text-2xl tracking-tight text-ink">
                  {next.title}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-ink">
                Explore
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      <CTA />
    </>
  );
}
