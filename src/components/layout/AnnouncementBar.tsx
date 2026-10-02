"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useState } from "react";

/**
 * Announcement bar — a slim, dark product-update strip (not a discount).
 * Offers live on /pricing; this slot is for what we've shipped.
 */
export function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="relative z-[60] border-b border-white/[0.06] bg-night">
      <div className="container-x flex h-10 items-center justify-center">
        <Link
          href="/products/codeskate-crm"
          className="group inline-flex items-center gap-2.5 text-[0.8rem] text-white/70 transition-colors hover:text-white"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-royal/30 bg-royal/10 px-2 py-0.5 font-mono text-[0.65rem] font-medium uppercase tracking-wider text-royal-400">
            <span className="h-1.5 w-1.5 rounded-full bg-royal shadow-[0_0_8px_rgba(255,106,26,0.9)]" />
            New
          </span>
          <span>
            CodeSkate CRM is live
            <span className="hidden sm:inline"> — call tracking, WhatsApp automation &amp; lead hub</span>
          </span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>

        <button
          onClick={() => setOpen(false)}
          aria-label="Dismiss announcement"
          className="absolute right-3 rounded-full p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
