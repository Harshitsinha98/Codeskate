"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Check, CreditCard, Loader2 } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Self-contained, auto-playing e-commerce demo. Loops through a realistic
 * checkout journey — browse products, add to cart, pay, order placed — to make
 * the offer preview feel like a real live app. Purely decorative.
 */

type Stage = "browse" | "add1" | "add2" | "cart" | "paying" | "done";

const SEQUENCE: { stage: Stage; hold: number }[] = [
  { stage: "browse", hold: 1200 },
  { stage: "add1", hold: 1100 },
  { stage: "add2", hold: 1100 },
  { stage: "cart", hold: 1400 },
  { stage: "paying", hold: 1600 },
  { stage: "done", hold: 1800 },
];

const PRODUCTS = [
  { name: "Aurora Lamp", price: "₹1,299", tone: "from-royal/20 to-warning/10" },
  { name: "Terra Mug", price: "₹499", tone: "from-success/15 to-royal/10" },
  { name: "Nimbus Bag", price: "₹2,199", tone: "from-warning/15 to-royal/15" },
];

export function EcomDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setTimeout(
      () => setStep((s) => (s + 1) % SEQUENCE.length),
      SEQUENCE[step].hold,
    );
    return () => clearTimeout(t);
  }, [step]);

  const stage = SEQUENCE[step].stage;
  const cartCount = stage === "add1" ? 1 : ["add2", "cart", "paying", "done"].includes(stage) ? 2 : 0;
  const showStore = ["browse", "add1", "add2"].includes(stage);

  return (
    <div className="glass-warm relative rounded-3xl p-4 shadow-soft">
      <div className="relative mx-auto max-w-[300px] overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
        {/* app top bar */}
        <div className="flex items-center gap-2 border-b border-line bg-subtle px-3 py-2.5">
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-danger/40" />
            <span className="h-2 w-2 rounded-full bg-warning/50" />
            <span className="h-2 w-2 rounded-full bg-success/50" />
          </div>
          <span className="ml-1 text-[0.6rem] font-medium text-ink-faint">
            your-store.com
          </span>
          <div className="relative ml-auto">
            <ShoppingCart className="h-4 w-4 text-ink-soft" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.4, 1] }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.4, ease }}
                  className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-royal text-[0.5rem] font-bold text-white"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* screen body — fixed height so it doesn't jump */}
        <div className="relative h-[220px] overflow-hidden">
          <AnimatePresence mode="wait">
            {/* ---------- STORE / PRODUCTS ---------- */}
            {showStore && (
              <motion.div
                key="store"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease }}
                className="absolute inset-0 space-y-2.5 p-3"
              >
                {PRODUCTS.map((p, i) => {
                  const isAdding =
                    (stage === "add1" && i === 0) || (stage === "add2" && i === 1);
                  const isAdded =
                    (stage === "add2" && i === 0) ||
                    (["cart", "paying", "done"].includes(stage) && i < 2);
                  return (
                    <motion.div
                      key={p.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.08, ease }}
                      className="flex items-center gap-2.5 rounded-xl border border-line p-2"
                    >
                      <span
                        className={`h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br ${p.tone}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[0.7rem] font-semibold text-ink">
                          {p.name}
                        </div>
                        <div className="text-[0.65rem] font-medium text-ink-muted">
                          {p.price}
                        </div>
                      </div>
                      <motion.span
                        animate={
                          isAdding ? { scale: [1, 0.85, 1] } : { scale: 1 }
                        }
                        transition={{ duration: 0.4, ease }}
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[0.6rem] font-bold transition-colors ${
                          isAdded || isAdding
                            ? "bg-success/15 text-success"
                            : "bg-royal text-white"
                        }`}
                      >
                        {isAdded || isAdding ? (
                          <>
                            <Check className="h-2.5 w-2.5" /> Added
                          </>
                        ) : (
                          "Add"
                        )}
                      </motion.span>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* ---------- CART ---------- */}
            {stage === "cart" && (
              <motion.div
                key="cart"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease }}
                className="absolute inset-0 flex flex-col p-3"
              >
                <div className="text-[0.7rem] font-bold text-ink">Your Cart</div>
                <div className="mt-2 space-y-2">
                  {PRODUCTS.slice(0, 2).map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center gap-2 rounded-lg border border-line p-1.5"
                    >
                      <span className={`h-7 w-7 rounded-md bg-gradient-to-br ${p.tone}`} />
                      <span className="text-[0.65rem] font-medium text-ink">
                        {p.name}
                      </span>
                      <span className="ml-auto text-[0.65rem] font-semibold text-ink-soft">
                        {p.price}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-line pt-2">
                  <span className="text-[0.65rem] text-ink-muted">Total</span>
                  <span className="text-[0.75rem] font-bold text-ink">₹1,798</span>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-royal py-2 text-[0.65rem] font-bold text-white"
                >
                  <CreditCard className="h-3 w-3" /> Checkout
                </motion.div>
              </motion.div>
            )}

            {/* ---------- PAYING ---------- */}
            {stage === "paying" && (
              <motion.div
                key="paying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4"
              >
                <div className="w-full rounded-xl border border-line bg-subtle p-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-royal" />
                    <span className="text-[0.65rem] font-semibold text-ink">
                      •••• •••• •••• 4242
                    </span>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 flex-1 rounded-full bg-royal/20"
                        animate={{ backgroundColor: ["#F9731633", "#F97316", "#F9731633"] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[0.65rem] font-medium text-ink-muted">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-royal" />
                  Processing payment…
                </div>
              </motion.div>
            )}

            {/* ---------- DONE ---------- */}
            {stage === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5, ease }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.25, ease }}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-success"
                  >
                    <Check className="h-5 w-5 text-white" strokeWidth={3} />
                  </motion.div>
                </motion.div>
                <div className="text-center">
                  <div className="text-[0.8rem] font-bold text-ink">Order placed!</div>
                  <div className="mt-0.5 text-[0.62rem] text-ink-muted">
                    Confirmation sent to your inbox
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-3 text-center text-[0.7rem] text-ink-muted">
        Live checkout — the kind of experience we build
      </p>
    </div>
  );
}
