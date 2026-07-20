"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingUp } from "lucide-react";
import type { CaseStudy } from "@/lib/content";
import { caseMeta } from "@/lib/home";
import { cn } from "@/lib/utils";

/** PHASE 3 — Case-study card: dashboard mock + industry / problem / solution / tech / metrics. */
export function ProjectCard({
  study,
  className,
}: {
  study: CaseStudy;
  className?: string;
}) {
  const meta = caseMeta[study.slug];
  const tech = meta?.tech ?? [];

  return (
    <div
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft transition-all duration-300 ease-premium hover:-translate-y-1.5 hover:shadow-lift",
        className
      )}
    >
      {/* Dashboard screenshot placeholder */}
      <Link href={`/work/${study.slug}`} className="relative block">
        <div className="relative overflow-hidden border-b border-line bg-subtle">
          <div className="flex items-center gap-1.5 border-b border-line bg-surface px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="ml-3 flex h-4 flex-1 items-center rounded bg-subtle px-2 text-[0.55rem] text-ink-faint">
              {study.url.replace(/^https?:\/\//, "")}
            </span>
            {meta && (
              <span className="rounded-full bg-royal/10 px-2 py-0.5 text-[0.55rem] font-bold text-royal">
                {meta.industry}
              </span>
            )}
          </div>

          {/* Project cover image */}
          {meta?.image && (
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={meta.image}
                alt={`${study.client} — ${study.title}`}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 ease-premium group-hover:scale-[1.05]"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent"
                aria-hidden
              />
              {/* Floating metric chips */}
              <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-2">
                {study.metrics.slice(0, 2).map((m) => (
                  <span
                    key={m.label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[0.6rem] font-bold text-ink shadow-soft backdrop-blur"
                  >
                    <span className="text-royal">{m.value}</span>
                    <span className="font-medium text-ink-muted">{m.label}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Meta */}
      <div className="flex flex-1 flex-col p-7">
        <h3 className="text-xl font-bold tracking-tight text-ink">
          {study.title}
        </h3>

        {meta ? (
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex gap-2.5">
              <dt className="w-[4.5rem] shrink-0 text-[0.7rem] font-bold uppercase tracking-wide text-danger">
                Problem
              </dt>
              <dd className="flex-1 text-ink-muted">{meta.problem}</dd>
            </div>
            <div className="flex gap-2.5">
              <dt className="w-[4.5rem] shrink-0 text-[0.7rem] font-bold uppercase tracking-wide text-royal">
                Solution
              </dt>
              <dd className="flex-1 text-ink-muted">{meta.solution}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {study.summary}
          </p>
        )}

        {/* Business result */}
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-subtle px-4 py-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-wide text-ink-faint">
              Business result
            </p>
            <p className="text-sm font-semibold text-ink">
              {meta?.result ?? `${study.metrics[0].value} ${study.metrics[0].label}`}
            </p>
          </div>
        </div>

        {/* Tech used */}
        {tech.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tech.map((t) => (
              <span
                key={t}
                className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink-soft"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <Link
          href={`/work/${study.slug}`}
          className="mt-6 inline-flex items-center gap-1.5 border-t border-line pt-5 text-sm font-semibold text-royal transition-colors hover:text-royal-600"
        >
          View case study
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
