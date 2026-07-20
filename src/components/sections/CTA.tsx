"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/lib/site";

const contacts = [
  { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
  { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.whatsapp}` },
  {
    icon: MapPin,
    label: "Office",
    value: `${site.address.line2}`,
    href: undefined,
  },
];

/** PHASE 3 — Final conversion CTA with contact details. */
export function CTA() {
  return (
    <section className="warm-wash py-20 md:py-28">
      <div className="divider-orange mx-auto mb-16 w-full max-w-[1200px]" />
      <div className="container-x">
        <div className="relative overflow-hidden rounded-4xl bg-ink px-6 py-16 shadow-lift md:px-16 md:py-20">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage:
                "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 80%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 80%)",
            }}
            aria-hidden
          />
          <div
            className="absolute left-1/2 top-0 h-40 w-[36rem] -translate-x-1/2 rounded-full bg-royal/20 blur-3xl"
            aria-hidden
          />

          <div className="relative mx-auto max-w-2xl text-center">
            <Reveal>
              <h2 className="text-display-lg font-bold text-white">
                Let&apos;s Build Something Exceptional.
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65 md:text-lg">
                Tell us about your idea. We&apos;ll help you design, build and
                scale it — starting with a free, no-commitment consultation.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button href="/contact" variant="primary" size="lg" arrow>
                  Start Your Project
                </Button>
                <Button href="/contact" variant="secondary" size="lg">
                  Book Consultation
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Contact strip */}
          <Reveal delay={0.15}>
            <div className="relative mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-4 border-t border-white/10 pt-10 sm:grid-cols-3">
              {contacts.map((c) => {
                const inner = (
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                      <c.icon className="h-4 w-4" />
                    </span>
                    <span className="text-left">
                      <span className="block text-[0.65rem] font-bold uppercase tracking-wide text-white/40">
                        {c.label}
                      </span>
                      <span className="block text-sm font-medium text-white/85">
                        {c.value}
                      </span>
                    </span>
                  </span>
                );
                return c.href ? (
                  <Link
                    key={c.label}
                    href={c.href}
                    className="rounded-2xl p-2 transition-colors hover:bg-white/5"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div key={c.label} className="rounded-2xl p-2">
                    {inner}
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
