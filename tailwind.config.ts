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
        // Primary brand orange — accent only (~5% of any view)
        royal: {
          DEFAULT: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
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
        glow: "0 0 0 1px rgba(249,115,22,0.12), 0 16px 40px -16px rgba(249,115,22,0.25)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
