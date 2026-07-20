"use client";

import { motion } from "framer-motion";
import {
  PhoneCall,
  MessageCircle,
  UserPlus,
  CalendarClock,
  ListChecks,
  BarChart3,
  Bell,
  Filter,
} from "lucide-react";

/**
 * CodeSkate CRM feature orbit — the lightning logo at the centre with real
 * product features circling on two counter-rotating rings. Icons counter-spin
 * so they stay upright. Pure decoration; respects reduced-motion via the global
 * CSS rule that neutralises animations.
 */

type OrbitIcon = {
  icon: typeof PhoneCall;
  label: string;
  tone: string;
};

const INNER: OrbitIcon[] = [
  { icon: PhoneCall, label: "Call tracker", tone: "text-success bg-success/10" },
  { icon: MessageCircle, label: "WhatsApp", tone: "text-success bg-success/10" },
  { icon: UserPlus, label: "Lead capture", tone: "text-royal bg-royal/10" },
];

const OUTER: OrbitIcon[] = [
  { icon: ListChecks, label: "Tasks", tone: "text-royal bg-royal/10" },
  { icon: CalendarClock, label: "Follow-ups", tone: "text-warning bg-warning/10" },
  { icon: BarChart3, label: "Reports", tone: "text-royal bg-royal/10" },
  { icon: Bell, label: "Reminders", tone: "text-warning bg-warning/10" },
  { icon: Filter, label: "Pipeline", tone: "text-success bg-success/10" },
];

function OrbitRing({
  items,
  radius,
  duration,
  reverse = false,
}: {
  items: OrbitIcon[];
  radius: number;
  duration: number;
  reverse?: boolean;
}) {
  return (
    <motion.div
      className="absolute inset-0"
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {items.map((item, i) => {
        const angle = (i / items.length) * 2 * Math.PI;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <div
            key={item.label}
            className="absolute left-1/2 top-1/2"
            style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
          >
            {/* counter-rotate so the chip stays upright */}
            <motion.div
              animate={{ rotate: reverse ? 360 : -360 }}
              transition={{ duration, repeat: Infinity, ease: "linear" }}
              className="group flex flex-col items-center gap-1.5"
            >
              <span
                className={`grid h-11 w-11 place-items-center rounded-2xl border border-line bg-white shadow-lift transition-transform duration-300 group-hover:scale-110 ${item.tone}`}
              >
                <item.icon className="h-5 w-5" />
              </span>
              <span className="whitespace-nowrap rounded-full bg-white/80 px-2 py-0.5 text-[0.6rem] font-semibold text-ink-muted opacity-0 shadow-soft backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                {item.label}
              </span>
            </motion.div>
          </div>
        );
      })}
    </motion.div>
  );
}

export function CrmOrbit() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[26rem]">
      {/* soft glow */}
      <div
        className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-royal/10 blur-3xl"
        aria-hidden
      />

      {/* orbit ring guides */}
      <span
        className="absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-royal/15"
        aria-hidden
      />
      <span
        className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full border border-royal/10"
        aria-hidden
      />

      {/* rotating rings — radius as % of a 26rem (416px) box */}
      <OrbitRing items={INNER} radius={129} duration={28} />
      <OrbitRing items={OUTER} radius={208} duration={40} reverse />

      {/* centre logo */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-[#FB923C] via-[#F97316] to-[#EA580C] shadow-lift"
        >
          <span
            className="absolute inset-0 rounded-3xl bg-royal/40 blur-md"
            aria-hidden
          />
          <svg viewBox="0 0 24 24" className="relative h-10 w-10" fill="none" aria-hidden>
            <path
              d="M13.5 2 5 13.2h5.3L9.4 22 19 10.2h-5.6L13.5 2Z"
              fill="white"
              stroke="white"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
