import { awards } from "@/lib/content";
import { Reveal } from "@/components/motion/Reveal";

/** Awards / recognition strip. */
export function Awards() {
  return (
    <section className="py-20">
      <div className="container-x">
        <Reveal>
          <p className="text-center text-xs font-medium uppercase tracking-[0.22em] text-ink-faint">
            Recognized by the industry
          </p>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-5">
          {awards.map((award, i) => (
            <Reveal key={award.title} delay={i * 0.06}>
              <div className="flex h-full flex-col items-center justify-center bg-surface px-4 py-8 text-center transition-colors duration-300 hover:bg-base">
                <span className="font-display text-lg tracking-tight text-ink">
                  {award.title}
                </span>
                <span className="mt-1 text-xs text-ink-muted">
                  {award.detail}
                </span>
                <span className="mt-2 text-[0.7rem] font-medium text-ink-faint">
                  {award.year}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
