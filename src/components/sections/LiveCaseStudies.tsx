"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Live case studies — real, running client sites. The production sites block
 * iframe embedding (X-Frame-Options / CSP), so each card shows a live
 * screenshot (WordPress mShots) that links out to the real site in a new tab.
 */
type LiveStudy = {
  title: string;
  category: string;
  url: string;
  summary: string;
};

const LIVE_STUDIES: LiveStudy[] = [
  {
    title: "Saran Tax Solution",
    category: "Finance · Services",
    url: "https://sarantaxsolution.com",
    summary:
      "A trust-first marketing site for a tax consultancy, engineered to convert enquiries into clients.",
  },
  {
    title: "Pragat Hanuman Ji",
    category: "Community · Non-profit",
    url: "https://pragathanumanji.in",
    summary:
      "A devotional community platform with a warm, accessible interface for all ages.",
  },
  {
    title: "Shivis Elegance",
    category: "Ecommerce · Fashion",
    url: "https://shivis-elegance1.vercel.app",
    summary:
      "A boutique jewelry storefront with a clean, conversion-focused shopping experience.",
  },
];

const shotUrl = (url: string) =>
  `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1200&h=750`;

function LiveFrame({ study, index }: { study: LiveStudy; index: number }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Reveal delay={(index % 2) * 0.08}>
      <a
        href={study.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft transition-shadow duration-300 hover:shadow-lift"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-line bg-subtle">
          {!loaded && (
            <div className="absolute inset-0 grid place-items-center text-xs text-ink-faint">
              Loading live preview…
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shotUrl(study.url)}
            alt={`${study.title} — live site`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <span className="eyebrow">{study.category}</span>
          <div className="mt-2 flex items-center justify-between gap-3">
            <h3 className="font-display text-xl tracking-tight text-ink">
              {study.title}
            </h3>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-royal transition-colors group-hover:text-royal-600">
              Visit
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
            {study.summary}
          </p>
        </div>
      </a>
    </Reveal>
  );
}

export function LiveCaseStudies() {
  return (
    <section className="border-t border-line bg-base py-20 md:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Live from production"
          title="Real client work, running right now."
          description="Every preview below is a live production site we've shipped. Click any card to open the full, interactive experience in a new tab."
          align="center"
          className="mb-14"
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {LIVE_STUDIES.map((study, i) => (
            <LiveFrame key={study.url} study={study} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
