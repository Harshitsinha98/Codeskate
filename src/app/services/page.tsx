import type { Metadata } from "next";
import { SERVICE_CATEGORIES, getServicesByCategory } from "@/config/catalog";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { CTA } from "@/components/sections/CTA";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Services — Design, build, launch & scale",
  description:
    "Websites, SaaS products, mobile apps, AI automation and enterprise software — built around outcomes. Explore how CodeSkate engineers software that scales.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="What we do"
        title="Everything you need to build and scale."
        description="We're a full-stack product engineering company. From the first line of strategy to the last point of growth, every discipline is held to the same standard — and pointed at the same goal: your business."
      >
        <Button href="/contact" variant="primary" size="lg" arrow magnetic>
          Start Your Project
        </Button>
      </PageHeader>

      {SERVICE_CATEGORIES.map((category, i) => {
        const categoryServices = getServicesByCategory(category.id);
        if (categoryServices.length === 0) return null;

        return (
          <section
            key={category.id}
            className={i % 2 === 1 ? "bg-surface/40 py-16 md:py-24" : "py-16 md:py-24"}
          >
            <div className="container-x">
              <SectionHeading
                eyebrow="Category"
                title={category.name}
                description={category.description}
                className="mb-12"
              />
              <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {categoryServices.map((service) => (
                  <StaggerItem key={service.slug} className="h-full">
                    <ServiceCard service={service} />
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </section>
        );
      })}

      <ProcessTimeline />
      <CTA />
    </>
  );
}
