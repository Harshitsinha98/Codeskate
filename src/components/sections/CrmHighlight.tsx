import { Check } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { CrmOrbit } from "@/components/sections/CrmOrbit";
import { waLink } from "@/lib/site";

const enquire = waLink(
  "Hi CodeSkate, I'm interested in CodeSkate CRM for lead management. Can you share pricing and a demo?"
);

const POINTS = [
  "Every call logged automatically",
  "Never miss a follow-up",
  "Runs on web and Android",
];

/** Home section — upsell the in-house CodeSkate CRM product. */
export function CrmHighlight() {
  return (
    <section className="warm-wash-strong relative overflow-hidden border-y border-line py-20 md:py-28">
      <div className="container-x relative">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <span className="eyebrow">Our product · CodeSkate CRM</span>
              <h2 className="mt-4 font-display text-3xl tracking-tight text-ink md:text-4xl">
                Need to manage leads? We built the CRM for it.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-soft">
                CodeSkate CRM captures every lead with a native call tracker and
                WhatsApp automation, then keeps your whole team on top of
                follow-ups. It&apos;s the same platform running in production for
                real sales teams today.
              </p>

              <ul className="mt-6 space-y-2.5">
                {POINTS.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm text-ink-soft">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/10 text-success">
                      <Check className="h-3 w-3" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href="/products/codeskate-crm" variant="primary" size="lg" arrow>
                  Explore CodeSkate CRM
                </Button>
                <Button href={enquire} variant="secondary" size="lg" external>
                  Enquire on WhatsApp
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <CrmOrbit />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
