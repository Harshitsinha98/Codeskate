"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

/** Wraps the app in Lenis for premium inertial smooth scrolling. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        // Use lerp (frame-rate-independent) OR duration — not both. lerp gives
        // the smoothest result and won't stutter on high-refresh displays.
        lerp: 0.12,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        // Let native touch scrolling handle mobile — smoothing touch often
        // feels laggy and fights the OS.
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
