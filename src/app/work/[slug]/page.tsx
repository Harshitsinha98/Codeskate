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
import Image from "next/image";
import { caseMeta } from "@/lib/home";

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
  const meta = caseMeta[study.slug];

  return (
    <>
      <PageHeader eyebrow={study.category} title={study.title} description={study.summary}>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> All work
          </Link>
          <span className="h-4 w-px bg-white/15" />
          <span className="font-mono text-xs text-white/50">
            {study.client} · {study.year}
          </span>
          <span className="h-4 w-px bg-white/15" />
          <a
            href={study.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-royal-400 transition-colors hover:text-royal"
          >
            Visit live site
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </PageHeader>

      {/* Hero visual — real screenshot rising out of the dark header */}
      <section className="relative pb-8">
        <div className="absolute inset-x-0 top-0 h-1/2 bg-night" aria-hidden />
        <div className="container-x relative">
          <Reveal>
            <a
              href={study.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${study.client} live site`}
              className="ring-gradient group block overflow-hidden rounded-3xl bg-night-800 shadow-night-card"
            >
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="ml-3 truncate font-mono text-[0.68rem] text-white/40">
                  {study.url.replace(/^https?:\/\//, "")}
                </span>
                <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[0.68rem] text-white/50 transition-colors group-hover:text-white">
                  Open live
                  <ExternalLink className="h-3 w-3" />
                </span>
              </div>
              {meta?.image && (
                <div className="relative aspect-[16/9]">
                  <Image
                    src={meta.image}
                    alt={`${study.client} — live site`}
                    fill
                    priority
                    sizes="(min-width: 1200px) 1200px, 100vw"
                    className="object-cover object-top"
                  />
                </div>
              )}
            </a>
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
                    className="rounded-full border border-line bg-surface px-3 py-1 font-mono text-[0.7rem] text-ink-soft"
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
                    <div className="font-mono text-2xl font-medium tracking-tight text-ink md:text-3xl">
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[10rem_1fr] md:gap-10">
                  <div className="flex items-baseline gap-3 md:flex-col md:items-start">
                    <span className="font-mono text-xs tabular-nums text-royal">
                      0{i + 1}
                    </span>
                    <h2 className="text-xl font-semibold tracking-tight text-ink">
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

      {/* Next case */}
      <section className="pb-24">
        <div className="container-x">
          <Reveal>
            <Link
              href={`/work/${next.slug}`}
              className="group flex flex-col items-start justify-between gap-4 rounded-3xl border border-line bg-subtle p-8 transition-colors duration-300 hover:border-ink/15 md:flex-row md:items-center"
            >
              <div>
                <span className="eyebrow">Next case study</span>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-ink">
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
