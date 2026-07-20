"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/site";

const services = [
  "Website",
  "Mobile App",
  "UI / UX",
  "Branding",
  "Marketing",
  "AI Automation",
];

/**
 * Contact form. There's no marketing backend, so on submit we open a
 * pre-filled WhatsApp chat with every detail the visitor entered — the
 * enquiry reaches a real person instantly instead of vanishing.
 */
export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (s: string) =>
    setPicked((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const lines = [
      "Hi CodeSkate, I'd like to start a project.",
      "",
      name && `Name: ${name}`,
      email && `Email: ${email}`,
      picked.length > 0 && `Need help with: ${picked.join(", ")}`,
      message && `Project: ${message}`,
    ].filter(Boolean);

    window.open(waLink(lines.join("\n")), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface p-8 shadow-soft md:p-10">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
              <Check className="h-8 w-8" />
            </span>
            <h3 className="mt-6 font-display text-2xl tracking-tight text-ink">
              Opening WhatsApp…
            </h3>
            <p className="mt-2 max-w-sm text-sm text-ink-muted">
              We&apos;ve pre-filled your details in a WhatsApp chat. Just hit send
              and a real person from CodeSkate will reply — usually within a few
              hours.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-6 text-sm font-semibold text-royal transition-colors hover:text-royal-600"
            >
              Edit my details
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Full name" name="name" placeholder="Jane Cooper" required />
              <Field
                label="Work email"
                name="email"
                type="email"
                placeholder="jane@company.com"
                required
              />
            </div>

            {/* Services */}
            <div>
              <span className="mb-3 block text-sm font-medium text-ink-soft">
                What do you need help with?
              </span>
              <div className="flex flex-wrap gap-2">
                {services.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(s)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
                      picked.includes(s)
                        ? "border-transparent bg-ink text-white"
                        : "border-line bg-surface text-ink-soft hover:border-ink/20"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-ink-soft"
              >
                Tell us about your project
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                placeholder="What are you building, and what does success look like?"
                className="w-full resize-none rounded-2xl border border-line bg-base/50 px-4 py-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-royal/40 focus:bg-surface focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-royal px-8 py-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-royal-600 hover:shadow-lift sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              Send on WhatsApp
              <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5" />
            </button>
            <p className="text-xs text-ink-faint">
              Opens WhatsApp with your details pre-filled. Prefer email?{" "}
              <a
                href="mailto:hello@codeskate.com"
                className="font-medium text-royal hover:text-royal-600"
              >
                hello@codeskate.com
              </a>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-ink-soft">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-line bg-base/50 px-4 py-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-royal/40 focus:bg-surface focus:outline-none"
      />
    </div>
  );
}
