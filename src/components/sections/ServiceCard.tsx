"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/lib/services";
import { serviceStories } from "@/lib/home";
import { EASE } from "@/lib/motion";
import { getServiceIcon } from "./serviceIcons";

/**
 * Service card — compact. Colorful brand-style icon, title, a one-line
 * description and a mini CTA into the service detail page.
 */
export function ServiceCard({ service }: { service: Service }) {
  const story = serviceStories[service.slug];
  const icon = getServiceIcon(service.slug);
  const description = story?.headline ?? service.summary;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="group flex h-full flex-col rounded-3xl border border-line bg-surface p-6 shadow-soft transition-colors duration-300 hover:border-royal/25 hover:shadow-lift"
    >
      <div className="flex items-center gap-3.5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-subtle transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
          {icon}
        </span>
        <h3 className="text-lg font-bold tracking-tight text-ink">
          {service.title}
        </h3>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
        {description}
      </p>

      <Link
        href={`/services/${service.slug}`}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-royal transition-colors hover:text-royal-600"
      >
        Explore Service
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
    </motion.div>
  );
}
