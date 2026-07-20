import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/sections/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { site, waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — Let's build something",
  description:
    "Start a project or message CodeSkate on WhatsApp. Tell us what you're building and we'll show you how we'd engineer it.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const contactMethods = [
    {
      icon: MessageCircle,
      label: "WhatsApp us",
      value: site.phone,
      href: waLink("Hi CodeSkate, I'd like to talk about a project."),
      accent: "bg-success/10 text-success",
    },
    {
      icon: Mail,
      label: "Email",
      value: site.email,
      href: `mailto:${site.email}`,
      accent: "bg-violet/10 text-violet",
    },
    {
      icon: Phone,
      label: "Call",
      value: site.phone,
      href: `tel:${site.phone.replace(/\s/g, "")}`,
      accent: "bg-royal/10 text-royal",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Let's build something worth remembering."
        description="Whether you have a fully-scoped brief or just the seed of an idea, we'd love to hear it. Tell us where you want to go — we'll show you how to get there."
      />

      <section className="pb-24 md:pb-32">
        <div className="container-x">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
            {/* Form */}
            <Reveal>
              <ContactForm />
            </Reveal>

            {/* Sidebar */}
            <div className="space-y-4">
              <Reveal delay={0.1}>
                <div className="space-y-3">
                  {contactMethods.map((m) => {
                    const Icon = m.icon;
                    return (
                      <a
                        key={m.label}
                        href={m.href}
                        target={m.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 rounded-3xl border border-line bg-surface p-5 shadow-soft transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lift"
                      >
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${m.accent}`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block text-sm font-medium text-ink">
                            {m.label}
                          </span>
                          <span className="block text-sm text-ink-muted">
                            {m.value}
                          </span>
                        </span>
                      </a>
                    );
                  })}
                </div>
              </Reveal>

              {/* Office / map */}
              <Reveal delay={0.2}>
                <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
                  <div className="relative h-40 overflow-hidden bg-subtle">
                    {/* stylized map grid */}
                    <div
                      className="absolute inset-0 opacity-[0.12]"
                      style={{
                        backgroundImage:
                          "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                      }}
                    />
                    <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                      <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-royal text-white shadow-lift">
                        <MapPin className="h-4 w-4" />
                      </span>
                    </span>
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink-faint">
                      Where we work
                    </span>
                    <p className="mt-2 text-sm text-ink-soft">
                      {site.address.line1}
                      <br />
                      {site.address.line2}
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.3}>
                <div className="rounded-3xl border border-transparent bg-ink p-6 text-white">
                  <p className="text-sm font-medium">Response time</p>
                  <p className="mt-1 text-sm text-white/60">
                    We reply to every enquiry within one business day — usually
                    within a few hours.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
