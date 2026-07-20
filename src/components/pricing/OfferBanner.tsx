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
    <section className="warm-wash relative overflow-hidden border-b border-line py-20 md:py-28">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
          className="group relative overflow-hidden rounded-4xl border border-line bg-surface shadow-lift transition-shadow duration-500 hover:shadow-glow"
        >
          {/* ---------- Browser / app chrome ---------- */}
          <div className="relative flex items-center gap-3 border-b border-line bg-subtle px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-danger/50" />
              <span className="h-3 w-3 rounded-full bg-warning/60" />
              <span className="h-3 w-3 rounded-full bg-success/60" />
            </div>
            <div className="ml-2 flex flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-ink-faint">
              <Lock className="h-3 w-3 text-success" />
              <span className="truncate">codeskate.com/launch-offer</span>
              <motion.span
                className="ml-auto inline-flex items-center gap-1 rounded-full bg-royal/10 px-2 py-0.5 text-[0.6rem] font-bold text-royal"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-royal" />
                LIVE
              </motion.span>
            </div>
          </div>

          {/* ---------- Tab bar ---------- */}
          <div className="flex items-center gap-1 border-b border-line bg-subtle/60 px-3 pt-2">
            {tabs.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative inline-flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    active ? "text-ink" : "text-ink-muted hover:text-ink"
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
              className="absolute -right-24 -top-16 h-64 w-64 rounded-full bg-royal/12 blur-3xl"
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
                    <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-royal to-royal-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-soft">
                      <motion.span
                        animate={{ scale: [1, 1.25, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Zap className="h-3.5 w-3.5 fill-current" />
                      </motion.span>
                      {offer.name}
                    </span>

                    <h2 className="mt-6 text-display-lg font-bold text-ink">
                      {offer.headline}
                    </h2>

                    <div className="mt-5 flex flex-wrap items-baseline gap-3">
                      <span className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
                        Starting at
                      </span>
                      <PriceBadge
                        price={offer.price}
                        oldPrice={offer.oldPrice}
                        discountLabel={offerSaveLabel(offer)}
                        size="lg"
                      />
                    </div>

                    <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
                      {offer.description}
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button href={offer.ctaLink} variant="primary" size="lg" arrow>
                        {offer.ctaText}
                      </Button>
                      <span className="inline-flex items-center gap-4 text-xs text-ink-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-royal" />
                          Delivered in 7–14 days
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-success" />
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
                    <Sparkles className="h-4 w-4 text-royal" />
                    <h3 className="text-sm font-bold uppercase tracking-wide text-ink">
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
                        className="group/item flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-royal/25 hover:shadow-lift"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10 transition-colors duration-300 group-hover/item:bg-success/20">
                          <CheckCircle2 className="h-4.5 w-4.5 text-success" />
                        </span>
                        <span className="text-sm font-medium text-ink">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Button href={offer.ctaLink} variant="primary" size="lg" arrow>
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
