"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type TextRevealProps = {
  text: string;
  className?: string;
  delay?: number;
  /** Split by "word" (default) or "char" for a character cascade. */
  by?: "word" | "char";
  once?: boolean;
};

const container: Variants = {
  hidden: {},
  show: (delay: number) => ({
    transition: { staggerChildren: 0.045, delayChildren: delay },
  }),
};

const wordVariant: Variants = {
  hidden: { y: "110%" },
  show: {
    y: "0%",
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Editorial split-text reveal. Each word/char rises from behind a mask —
 * the signature headline animation used across the site.
 */
export function TextReveal({
  text,
  className,
  delay = 0,
  by = "word",
  once = true,
}: TextRevealProps) {
  const tokens = by === "word" ? text.split(" ") : text.split("");

  return (
    <motion.span
      className={cn("inline", className)}
      variants={container}
      custom={delay}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-40px" }}
      aria-label={text}
    >
      {tokens.map((token, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          aria-hidden
        >
          <motion.span variants={wordVariant} className="inline-block">
            {token}
            {by === "word" && i < tokens.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
