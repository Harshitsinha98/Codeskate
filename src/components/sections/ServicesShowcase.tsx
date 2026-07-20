import { services } from "@/lib/services";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { Button } from "@/components/ui/Button";

/** Home services grid — compact cards for every service. */
export function ServicesShowcase() {
  const shown = services;

  return (
    <section id="services" className="relative overflow-hidden border-b border-line bg-base py-20 md:py-28">
      <span className="dot-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="container-x relative">
        <SectionHeading
          title="Services"
          description="Everything you need to build, launch and grow — delivered by one senior team, with clear pricing and honest timelines."
          align="center"
        />

        <Stagger className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((service) => (
            <StaggerItem key={service.slug} className="h-full">
              <ServiceCard service={service} />
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-10 flex justify-center">
          <Button href="/services" variant="secondary" arrow>
            View all services
          </Button>
        </div>
      </div>
    </section>
  );
}
