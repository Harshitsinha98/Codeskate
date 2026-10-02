import { Marquee } from "@/components/ui/Marquee";
import { Counter } from "@/components/ui/Counter";
import { trustBarStats } from "@/lib/home";

const STACK = [
  "Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Prisma",
  "Tailwind CSS", "React Native", "Flutter", "AWS", "Vercel", "Cloudflare",
  "OpenAI", "Claude", "Razorpay", "Docker",
];

/** Dark proof strip — honest stats in mono + the stack we ship on. */
export function ProofStrip() {
  return (
    <section className="section-night border-y border-white/[0.06]">
      <div className="container-x grid grid-cols-2 md:grid-cols-4">
        {trustBarStats.map((s, i) => (
          <div
            key={s.label}
            className={`px-2 py-10 text-center md:py-12 ${
              i > 0 ? "md:border-l md:border-white/[0.06]" : ""
            } ${i % 2 === 1 ? "border-l border-white/[0.06] md:border-l" : ""} ${
              i >= 2 ? "border-t border-white/[0.06] md:border-t-0" : ""
            }`}
          >
            <div className="font-mono text-4xl font-medium tabular-nums tracking-tight text-white md:text-5xl">
              <Counter value={s.value} suffix={s.suffix} />
            </div>
            <div className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-white/40">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.06] py-7">
        <Marquee>
          {STACK.map((name) => (
            <span
              key={name}
              className="font-mono text-sm text-white/35 transition-colors duration-300 hover:text-white"
            >
              {name}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
