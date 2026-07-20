/**
 * DESIGN SYSTEM 2.0 — Motion presets.
 *
 * Reusable Framer Motion variants + transitions with ONE consistent easing
 * curve (`ease-premium` = cubic-bezier(0.22, 1, 0.36, 1)). Import these instead
 * of hand-writing `initial/animate/transition` on every component.
 *
 * Usage:
 *   import { fadeUp, staggerChildren, hoverLift } from "@/lib/motion";
 *   <motion.div variants={fadeUp} initial="hidden" whileInView="show" />
 *   <motion.div whileHover={hoverLift.whileHover} whileTap={buttonPress.whileTap} />
 */

import type { Variants, Transition } from "framer-motion";

/** The single premium easing curve used across the whole system. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Standard entrance transition. */
export const transition: Transition = { duration: 0.6, ease: EASE };
export const transitionFast: Transition = { duration: 0.35, ease: EASE };
export const transitionSlow: Transition = { duration: 0.8, ease: EASE };

/** Default viewport config for scroll-in reveals. */
export const viewport = { once: true, margin: "-80px" } as const;

// ---------------------------------------------------------------- entrances

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: 28 },
  show: { opacity: 1, x: 0, transition },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: -28 },
  show: { opacity: 1, x: 0, transition },
};

export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition },
};

// ---------------------------------------------------------------- stagger

/** Parent container that staggers its children's entrances. */
export const staggerChildren = (
  stagger = 0.08,
  delayChildren = 0.05
): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

/** Child item to pair with a `staggerChildren` parent. */
export const staggerItem: Variants = fadeUp;

// ---------------------------------------------------------------- interactions

/** Lift a card/element on hover. Spread onto a motion element. */
export const hoverLift = {
  whileHover: { y: -6, transition: transitionFast },
} as const;

/** Subtle press feedback for buttons. */
export const buttonPress = {
  whileTap: { scale: 0.97, transition: { duration: 0.1, ease: EASE } },
} as const;

/** Combined card hover: lift + shadow handled via CSS class. */
export const cardHover = {
  whileHover: { y: -6, transition: transitionFast },
  whileTap: { scale: 0.995 },
} as const;
