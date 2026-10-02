import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { site, waLink } from "@/lib/site";

/** Final conversion CTA — full-bleed dark section with a horizon glow. */
export function CTA() {
  return (
    <section className="section-night border-t border-white/[0.06]">
      <div className="night-grid pointer-events-none absolute inset-0 rotate-180" aria-hidden />
      <div
        className="horizon pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-72 max-w-4xl blur-2xl"
        aria-hidden
      />

      <div className="container-x relative py-28 text-center md:py-36">
        <Reveal>
          <span className="eyebrow">Let&apos;s build</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mx-auto mt-5 max-w-4xl text-[clamp(2.4rem,5.5vw,4.5rem)] font-semibold leading-[1.04] tracking-[-0.04em]">
            <span className="text-shine">Have an idea? </span>
            <span className="text-gradient">Let&apos;s ship it.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/55 md:text-lg">
            Tell us what you&apos;re building. In one free call you&apos;ll get a
            clear plan, a fixed price and a realistic timeline.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/contact" variant="glow" size="lg" arrow>
              Start a project
            </Button>
            <Button href={waLink("Hi CodeSkate, I'd like to discuss a project.")} variant="night" size="lg" external>
              Chat on WhatsApp
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-xs text-white/40">
            <a href={`mailto:${site.email}`} className="transition-colors hover:text-white">
              {site.email}
            </a>
            <span className="hidden h-3 w-px bg-white/15 sm:block" />
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-white">
              {site.phone}
            </a>
            <span className="hidden h-3 w-px bg-white/15 sm:block" />
            <span>{site.address.line2}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
