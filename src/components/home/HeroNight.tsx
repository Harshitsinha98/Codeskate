"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, MessageCircle, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductShot } from "@/components/home/ProductShot";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.8, delay, ease },
});

/**
 * Homepage hero — dark, centered, product-first.
 * The CRM product shot sits in 3D perspective and flattens as you scroll.
 */
export function HeroNight() {
  const shotRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: shotRef,
    offset: ["start end", "center center"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 22, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.92, 1]);

  return (
    <section className="section-night">
      <div className="night-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="night-glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="container-x relative pb-10 pt-20 text-center md:pt-28">
        <motion.div {...fadeUp(0)} className="flex justify-center">
          <Link href="/products/codeskate-crm" className="pill-night group transition-colors hover:border-white/20 hover:text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-royal shadow-[0_0_8px_rgba(255,106,26,0.9)]" />
            Now shipping: CodeSkate CRM
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        <motion.h1
          {...fadeUp(0.08)}
          className="mx-auto mt-8 max-w-5xl text-[clamp(2.6rem,7vw,5.5rem)] font-semibold leading-[1.02] tracking-[-0.045em]"
        >
          <span className="text-shine">We build the software</span>
          <br />
          <span className="text-shine">your competitors </span>
          <span className="text-gradient">wish they had.</span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.16)}
          className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-white/55 md:text-lg"
        >
          A senior product engineering studio for websites, SaaS, mobile apps
          and AI automation. We don&apos;t just ship for clients — we run our own
          product, used by real sales teams every day.
        </motion.p>

        <motion.div
          {...fadeUp(0.24)}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button href="/contact" variant="glow" size="lg" arrow>
            Start a project
          </Button>
          <Button href="/work" variant="night" size="lg">
            See our work
          </Button>
        </motion.div>

        <motion.p
          {...fadeUp(0.32)}
          className="mt-6 font-mono text-[0.72rem] text-white/35"
        >
          Free scoping call · Fixed-price milestones · Reply within 24h
        </motion.p>
      </div>

      {/* Product shot */}
      <div className="container-x relative pb-20 md:pb-28">
        <div className="horizon pointer-events-none absolute inset-x-0 -bottom-10 mx-auto h-64 max-w-5xl blur-2xl" aria-hidden />
        <div ref={shotRef} className="relative mx-auto max-w-5xl [perspective:1600px]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease }}
            style={{ rotateX, scale, transformOrigin: "50% 0%" }}
          >
            <ProductShot />
          </motion.div>

          {/* Floating live events */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.3, ease }}
            className="absolute -left-6 top-[38%] hidden lg:block"
          >
            <EventChip icon={<PhoneCall className="h-3.5 w-3.5" />} title="Call logged" sub="Rahul V. · 3m 12s" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.5, ease }}
            className="absolute -right-6 top-[62%] hidden lg:block"
          >
            <EventChip
              icon={<MessageCircle className="h-3.5 w-3.5" />}
              title="WhatsApp follow-up sent"
              sub="Automation · 2s ago"
              tone="green"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function EventChip({
  icon,
  title,
  sub,
  tone = "orange",
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  tone?: "orange" | "green";
}) {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-night-700/80 px-3 py-2 text-left shadow-night-card backdrop-blur-xl"
    >
      <span
        className={`grid h-7 w-7 place-items-center rounded-lg ${
          tone === "green" ? "bg-emerald-400/10 text-emerald-300" : "bg-royal/15 text-royal-400"
        }`}
      >
        {icon}
      </span>
      <span>
        <span className="block text-[0.72rem] font-medium text-white">{title}</span>
        <span className="block font-mono text-[0.6rem] text-white/40">{sub}</span>
      </span>
    </motion.div>
  );
}
