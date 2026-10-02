import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // CodeSkate Design System V2 — white-dominant, orange accent
        base: "#FFFFFF",
        surface: "#FFFFFF",
        // Alternate section wash
        subtle: "#FAFAF9",
        // Warm orange-tinted washes for branded sections
        warm: "#FFF7ED",
        "warm-soft": "#FFFBF5",
        ink: {
          DEFAULT: "#111827",
          soft: "#4B5563",
          muted: "#6B7280",
          faint: "#9CA3AF",
        },
        line: "#E5E7EB",
        // Primary brand orange — highlight only (CTA, glow, active states)
        royal: {
          DEFAULT: "#FF6A1A",
          400: "#FF8A47",
          600: "#F25A0A",
          700: "#C2410C",
        },
        // Dark "night" surfaces for hero / product / CTA / chrome
        night: {
          DEFAULT: "#0A0A0B",
          900: "#0A0A0B",
          800: "#111113",
          700: "#17171A",
          600: "#1F1F23",
          line: "rgba(255,255,255,0.08)",
        },
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
        // Kept for any residual references — mapped onto the orange system
        violet: {
          DEFAULT: "#F97316",
          600: "#EA580C",
        },
        cyan: {
          DEFAULT: "#F97316",
          600: "#EA580C",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "display-2xl": ["clamp(3rem, 6.5vw, 5.25rem)", { lineHeight: "1.03", letterSpacing: "-0.03em" }],
        "display-xl": ["clamp(2.5rem, 5.5vw, 4.25rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2rem, 3.75vw, 3rem)", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        "4xl": "1.5rem",
        "5xl": "2rem",
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgba(17,24,39,0.04), 0 2px 8px -2px rgba(17,24,39,0.06)",
        lift: "0 12px 32px -12px rgba(17,24,39,0.14), 0 4px 10px -4px rgba(17,24,39,0.06)",
        glow: "0 0 0 1px rgba(255,106,26,0.12), 0 16px 40px -16px rgba(255,106,26,0.25)",
        "glow-lg": "0 0 0 1px rgba(255,106,26,0.35), 0 8px 24px -6px rgba(255,106,26,0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
        "night-card": "0 0 0 1px rgba(255,255,255,0.06), 0 24px 60px -20px rgba(0,0,0,0.8)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "beam-x": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "beam-x": "beam-x 3.5s ease-in-out infinite",
        blink: "blink 1.1s steps(1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
