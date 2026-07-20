import { Marquee } from "@/components/ui/Marquee";
import { clients } from "@/lib/content";

/** Infinite marquee of client wordmarks — social proof strip. */
export function LogoMarquee() {
  return (
    <section className="border-y border-line bg-surface/50 py-10">
      <div className="container-x mb-6">
        <p className="text-center text-xs font-medium uppercase tracking-[0.22em] text-ink-faint">
          Trusted by ambitious teams — from seed-stage to enterprise
        </p>
      </div>
      <Marquee>
        {clients.map((name) => (
          <span
            key={name}
            className="font-display text-2xl tracking-tight text-ink-faint transition-colors duration-300 hover:text-ink md:text-3xl"
          >
            {name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
