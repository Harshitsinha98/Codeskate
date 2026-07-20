import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

/** Before → After comparison strip for case studies. */
export function BeforeAfter({
  before,
  after,
}: {
  before: string;
  after: string;
}) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
      <Reveal direction="right">
        <div className="h-full rounded-3xl border border-line bg-surface p-7">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            Before
          </span>
          <p className="mt-3 text-lg leading-relaxed text-ink-muted">{before}</p>
        </div>
      </Reveal>
      <div className="flex items-center justify-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white">
          <ArrowRight className="h-5 w-5" />
        </span>
      </div>
      <Reveal direction="left" delay={0.1}>
        <div className="h-full rounded-3xl border border-transparent bg-ink p-7 text-white shadow-glow">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-cyan">
            After
          </span>
          <p className="mt-3 text-lg leading-relaxed text-white/90">{after}</p>
        </div>
      </Reveal>
    </div>
  );
}
