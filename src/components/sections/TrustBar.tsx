"use client";

import { Marquee } from "@/components/ui/Marquee";
import { Counter } from "@/components/ui/Counter";
import { clients } from "@/lib/content";
import { trustBarStats } from "@/lib/home";
import { Reveal } from "@/components/motion/Reveal";

/** PHASE 3 — Proof strip: animated counters + client wordmark marquee. */
export function TrustBar() {
  return (
    <section className="border-b border-line warm-wash">
      <div className="container-x py-14 md:py-16">
        <Reveal>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-faint">
            Products we&apos;ve shipped
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {trustBarStats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05}>
              <div className="relative text-center">
                <div className="text-4xl font-bold tracking-tight text-ink md:text-5xl">
                  <Counter value={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-2 text-sm text-ink-muted">{s.label}</div>
                {i < trustBarStats.length - 1 && (
                  <span
                    className="absolute -right-3 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-line md:block"
                    aria-hidden
                  />
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="border-t border-line py-9">
        <Marquee>
          {clients.map((name) => (
            <span
              key={name}
              className="text-xl font-bold tracking-tight text-ink-faint/70 transition-colors duration-300 hover:text-ink md:text-2xl"
            >
              {name}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
