import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { caseStudies } from "@/lib/content";
import { caseMeta } from "@/lib/home";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** Selected work — large screenshot cards, outcome first. Light section. */
export function WorkShowcase() {
  const [lead, ...rest] = caseStudies.slice(0, 3);

  return (
    <section className="relative bg-base py-24 md:py-32">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="eyebrow">02 / Selected work</span>
            <h2 className="mt-4 max-w-2xl text-display-lg font-semibold text-ink">
              Shipped. Live. Making money for real businesses.
            </h2>
          </div>
          <Button href="/work" variant="secondary" arrow>
            All case studies
          </Button>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Reveal className="lg:col-span-2">
            <WorkCard slug={lead.slug} large />
          </Reveal>
          {rest.map((s, i) => (
            <Reveal key={s.slug} delay={i * 0.08}>
              <WorkCard slug={s.slug} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkCard({ slug, large = false }: { slug: string; large?: boolean }) {
  const study = caseStudies.find((c) => c.slug === slug)!;
  const meta = caseMeta[slug];

  return (
    <Link
      href={`/work/${slug}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-subtle transition-colors duration-300 hover:border-ink/15",
        large && "lg:grid lg:grid-cols-[1fr_1.35fr]"
      )}
    >
      {/* Copy */}
      <div className={cn("flex flex-col p-7 md:p-8", large && "lg:justify-between lg:p-10")}>
        <div>
          <div className="flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink-muted">
            <span>{meta?.industry ?? study.category}</span>
            <span className="h-px w-6 bg-line" />
            <span>{study.year}</span>
          </div>
          <h3 className={cn("mt-4 font-semibold tracking-tight text-ink", large ? "text-2xl md:text-3xl" : "text-xl")}>
            {study.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">{meta?.solution ?? study.summary}</p>
        </div>

        <div className={cn("mt-6", large && "lg:mt-10")}>
          <div className="grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-surface">
            {study.metrics.map((m) => (
              <div key={m.label} className="px-3 py-3">
                <div className="truncate font-mono text-sm font-medium text-ink">{m.value}</div>
                <div className="mt-0.5 truncate text-[0.68rem] text-ink-muted">{m.label}</div>
              </div>
            ))}
          </div>
          {meta?.tech && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {meta.tech.map((t) => (
                <span key={t} className="rounded-full border border-line bg-surface px-2.5 py-0.5 font-mono text-[0.65rem] text-ink-soft">
                  {t}
                </span>
              ))}
            </div>
          )}
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
            Read case study
            <ArrowUpRight className="h-4 w-4 text-royal transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>

      {/* Screenshot */}
      {meta?.image && (
        <div className={cn("relative px-7 md:px-8", large ? "lg:px-0 lg:pt-10" : "")}>
          <div
            className={cn(
              "relative overflow-hidden rounded-t-2xl border border-b-0 border-line bg-surface shadow-lift transition-transform duration-500 ease-premium group-hover:-translate-y-1",
              large && "lg:rounded-r-none lg:border-r-0"
            )}
          >
            <div className="flex items-center gap-1.5 border-b border-line px-3.5 py-2.5">
              <span className="h-2 w-2 rounded-full bg-line" />
              <span className="h-2 w-2 rounded-full bg-line" />
              <span className="h-2 w-2 rounded-full bg-line" />
              <span className="ml-2 truncate font-mono text-[0.6rem] text-ink-faint">
                {study.url.replace(/^https?:\/\//, "")}
              </span>
            </div>
            <div className="relative aspect-[16/9]">
              <Image
                src={meta.image}
                alt={`${study.client} — ${study.title}`}
                fill
                sizes={large ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 50vw, 100vw"}
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}
