"use client";

import Link from "next/link";
import { ArrowRight, X, Flame } from "lucide-react";
import { useState } from "react";
import { PRIMARY_OFFER, offerPriceLabel } from "@/lib/config/offers";

/**
 * PHASE 2 — Announcement bar.
 * Warm-orange, rounded, offer-driven strip above the navbar. "Limited Time"
 * pill + animated arrow CTA, dismissible. Reads the centralized primary offer.
 */
export function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  if (!open || !PRIMARY_OFFER.visible) return null;

  return (
    <div className="relative z-[60] bg-white px-3 pt-3">
      <div className="container-x">
        <div className="relative flex items-center justify-center gap-x-3 gap-y-1 overflow-hidden rounded-2xl border border-royal/20 bg-gradient-to-r from-royal to-royal-600 px-4 py-2.5 pr-11 text-center shadow-soft sm:pr-4">
          {/* soft sheen */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(24rem_10rem_at_20%_-40%,rgba(255,255,255,0.25),transparent)]"
          />

          <span className="relative hidden items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white sm:inline-flex">
            <Flame className="h-3 w-3" />
            Limited Time
          </span>

          <p className="relative text-[0.8rem] text-white sm:text-sm">
            <span className="font-semibold">Launch Offer</span>
            <span className="hidden sm:inline"> — Professional Business Website</span>{" "}
            starting at{" "}
            <span className="font-bold">{offerPriceLabel(PRIMARY_OFFER)}</span>
          </p>

          <Link
            href={PRIMARY_OFFER.ctaLink}
            className="group relative inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[0.72rem] font-bold text-royal shadow-sm transition-transform hover:-translate-y-0.5 sm:text-xs"
          >
            Claim Offer
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>

          <button
            onClick={() => setOpen(false)}
            aria-label="Dismiss announcement"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
