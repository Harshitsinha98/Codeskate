import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { caseStudies, getCaseStudy } from "@/lib/content";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { CTA } from "@/components/sections/CTA";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  return {
    title: `${study.client} — ${study.title}`,
    description: study.summary,
    alternates: { canonical: `/work/${study.slug}` },
  };
}

const chapters = [
  { key: "problem", label: "The problem" },
  { key: "research", label: "The research" },
  { key: "approach", label: "The approach" },
  { key: "build", label: "The build" },
] as const;

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const idx = caseStudies.findIndex((c) => c.slug === slug);
  const next = caseStudies[(idx + 1) % caseStudies.length];

  return (
    <>
      <PageHeader eyebrow={study.category} title={study.title} description={study.summary}>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" /> All work
          </Link>
          <span className="h-4 w-px bg-line" />
          <span className="text-sm text-ink-muted">
            {study.client} · {study.year}
          </span>
          <span className="h-4 w-px bg-line" />
          <a
            href={study.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-royal transition-colors hover:text-royal-600"
          >
            Visit live site
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </PageHeader>

      {/* Hero visual */}
      <section className="pb-8">
        <div className="container-x">
          <Reveal>
            <div className="relative aspect-[16/8] overflow-hidden rounded-[2rem] border border-line shadow-lift">
              <div className={cn("absolute inset-0 bg-gradient-to-br", study.cover)} />
              <div className="noise absolute inset-0 opacity-40" />
              <div className="absolute inset-x-10 bottom-0 top-16 rounded-t-3xl bg-white/85 p-8 shadow-lift backdrop-blur">
                <div className="h-3 w-32 rounded-full bg-ink/10" />
                <div className="mt-4 h-10 w-2/3 rounded-xl bg-ink/15" />
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {study.metrics.map((m) => (
                    <div key={m.label} className="rounded-2xl bg-ink/[0.04] p-4">
                      <div className="font-display text-2xl text-ink">{m.value}</div>
                      <div className="mt-1 text-xs text-ink-muted">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services + metrics summary */}
      <section className="py-16">
        <div className="container-x">
          <div className="grid grid-cols-1 gap-10 border-y border-line py-10 md:grid-cols-[1fr_1.4fr]">
            <div>
              <span className="eyebrow">Services provided</span>
              <div className="mt-4 flex flex-wrap gap-2">
                {study.services.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-soft"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {study.metrics.map((m, i) => (
                <Reveal key={m.label} delay={i * 0.08}>
                  <div>
                    <div className="font-display text-4xl tracking-tight text-ink">
                      {m.value}
                    </div>
                    <div className="mt-1 text-sm text-ink-muted">{m.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Narrative chapters */}
      <section className="pb-8">
        <div className="container-x">
          <div className="mx-auto max-w-3xl space-y-16">
            {chapters.map((ch, i) => (
              <Reveal key={ch.key}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[auto_1fr] md:gap-10">
                  <div className="flex items-baseline gap-3 md:flex-col md:items-start">
                    <span className="font-display text-sm tabular-nums text-ink-faint">
                      0{i + 1}
                    </span>
                    <h2 className="font-display text-xl tracking-tight text-ink">
                      {ch.label}
                    </h2>
                  </div>
                  <p className="text-lg leading-relaxed text-ink-soft">
                    {study[ch.key]}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Before / After */}
      <section className="py-16 md:py-24">
        <div className="container-x">
          <SectionHeading
            eyebrow="The shift"
            title="Before and after."
            align="center"
            className="mb-12"
          />
          <BeforeAfter before={study.before} after={study.after} />
        </div>
      </section>

      {/* Live site */}
      <section className="pb-24">
        <div className="container-x">
          <Reveal>
            <div className="overflow-hidden rounded-[2rem] border border-line bg-surface shadow-lift">
              <div className="flex items-center gap-2 border-b border-line bg-subtle px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-danger/60" />
                <span className="h-3 w-3 rounded-full bg-royal/60" />
                <span className="h-3 w-3 rounded-full bg-success/60" />
                <span className="ml-3 truncate text-xs text-ink-faint">
                  {study.url.replace(/^https?:\/\//, "")}
                </span>
                <a
                  href={study.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-royal transition-colors hover:text-royal-600"
                >
                  Open live
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <a
                href={study.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${study.client} live site`}
                className="block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://s.wordpress.com/mshots/v1/${encodeURIComponent(
                    study.url
                  )}?w=1400&h=875`}
                  alt={`${study.client} — live site preview`}
                  loading="lazy"
                  className="w-full object-cover object-top"
                />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Next case */}
      <section className="pb-24">
        <div className="container-x">
          <Reveal>
            <Link
              href={`/work/${next.slug}`}
              className="group flex flex-col items-start justify-between gap-4 rounded-4xl border border-line bg-surface p-8 shadow-soft transition-all duration-500 hover:shadow-lift md:flex-row md:items-center"
            >
              <div>
                <span className="eyebrow">Next case study</span>
                <p className="mt-2 font-display text-2xl tracking-tight text-ink">
                  {next.title}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-ink">
                Read
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
