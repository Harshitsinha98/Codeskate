"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Zap,
  ShieldCheck,
  Clock,
  Sparkles,
  Lock,
  Tag,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PriceBadge } from "./PriceBadge";
import { EcomDemo } from "./EcomDemo";
import {
  PRIMARY_OFFER,
  offerSaveLabel,
  type Offer,
} from "@/lib/config/offers";

const ease = [0.22, 1, 0.36, 1] as const;

type TabKey = "offer" | "includes";

/**
 * Promotional offer banner styled as a live "demo app" window — browser chrome
 * (traffic lights + URL), a tabbed interface (Offer / What's included) and
 * hover states throughout. Presentation only; all offer data comes from config.
 */
export function OfferBanner({ offer = PRIMARY_OFFER }: { offer?: Offer } = {}) {
  const [tab, setTab] = useState<TabKey>("offer");
  if (!offer.visible) return null;

  const tabs: { key: TabKey; label: string; icon: typeof Tag }[] = [
    { key: "offer", label: "Offer", icon: Tag },
    { key: "includes", label: "What's included", icon: ListChecks },
  ];

  return (
    <section className="relative overflow-hidden bg-base py-16 md:py-24">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
          className="ring-gradient group relative overflow-hidden rounded-4xl bg-night text-white shadow-night-card"
        >
          {/* ---------- Browser / app chrome ---------- */}
          <div className="relative flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            </div>
            <div className="ml-2 flex flex-1 items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 font-mono text-[0.68rem] text-white/40">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span className="truncate">codeskate.com/launch-offer</span>
              <motion.span
                className="ml-auto inline-flex items-center gap-1 rounded-full bg-royal/15 px-2 py-0.5 text-[0.6rem] font-medium text-royal-400"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-royal" />
                LIVE
              </motion.span>
            </div>
          </div>

          {/* ---------- Tab bar ---------- */}
          <div className="flex items-center gap-1 border-b border-white/[0.06] px-3 pt-2">
            {tabs.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative inline-flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    active ? "text-white" : "text-white/45 hover:text-white"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                  {active && (
                    <motion.span
                      layoutId="offer-tab"
                      className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-royal"
                      transition={{ duration: 0.3, ease }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ---------- Window body ---------- */}
          <div className="relative overflow-hidden">
            {/* floating glow orbs */}
            <motion.div
              aria-hidden
              className="absolute -right-24 -top-16 h-72 w-72 rounded-full bg-royal/20 blur-3xl"
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            <AnimatePresence mode="wait">
              {tab === "offer" ? (
                <motion.div
                  key="offer"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3, ease }}
                  className="relative grid grid-cols-1 gap-10 p-8 md:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14"
                >
                  <div>
                    <span className="pill-night">
                      <motion.span
                        animate={{ scale: [1, 1.25, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Zap className="h-3.5 w-3.5 fill-current text-royal-400" />
                      </motion.span>
                      {offer.name}
                    </span>

                    <h2 className="text-shine mt-6 text-display-lg font-semibold">
                      {offer.headline}
                    </h2>

                    <div className="mt-5 flex flex-wrap items-baseline gap-3">
                      <span className="font-mono text-xs uppercase tracking-[0.14em] text-white/40">
                        Starting at
                      </span>
                      <PriceBadge
                        price={offer.price}
                        oldPrice={offer.oldPrice}
                        discountLabel={offerSaveLabel(offer)}
                        size="lg"
                        tone="dark"
                      />
                    </div>

                    <p className="mt-5 max-w-md text-base leading-relaxed text-white/55">
                      {offer.description}
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button href={offer.ctaLink} variant="glow" size="lg" arrow>
                        {offer.ctaText}
                      </Button>
                      <span className="inline-flex items-center gap-4 font-mono text-[0.7rem] text-white/45">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-royal-400" />
                          Delivered in 7–14 days
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                          100% ownership
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* live e-commerce demo so it reads like a real deliverable */}
                  <EcomDemo />
                </motion.div>
              ) : (
                <motion.div
                  key="includes"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.3, ease }}
                  className="relative p-8 md:p-12"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-royal-400" />
                    <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-white/60">
                      Everything included
                    </h3>
                  </div>
                  <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                    {offer.includes.map((item, i) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: i * 0.05, ease }}
                        className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition-colors duration-300 hover:border-white/15"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
                          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        </span>
                        <span className="text-sm text-white/80">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Button href={offer.ctaLink} variant="glow" size="lg" arrow>
                      {offer.ctaText}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
