"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Layout,
  Server,
  Database,
  Cloud,
  Sparkles,
  Wrench,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { techGroups } from "@/lib/home";
import { EASE } from "@/lib/motion";

const groupIcons: Record<string, React.ReactNode> = {
  Frontend: <Layout className="h-5 w-5" />,
  Backend: <Server className="h-5 w-5" />,
  Database: <Database className="h-5 w-5" />,
  Cloud: <Cloud className="h-5 w-5" />,
  AI: <Sparkles className="h-5 w-5" />,
  DevOps: <Wrench className="h-5 w-5" />,
};

/**
 * simple-icons CDN slug per tool. Colored brand logos are served from
 * cdn.simpleicons.org. Anything without a valid logo (or a 404) falls back to
 * a clean text pill via onError — so a broken icon can never render.
 */
const brandSlugs: Record<string, string> = {
  "Next.js": "nextdotjs",
  React: "react",
  TypeScript: "typescript",
  "Tailwind CSS": "tailwindcss",
  "Node.js": "nodedotjs",
  Laravel: "laravel",
  PHP: "php",
  Python: "python",
  PostgreSQL: "postgresql",
  MongoDB: "mongodb",
  Firebase: "firebase",
  Redis: "redis",
  AWS: "amazonwebservices",
  Vercel: "vercel",
  Cloudflare: "cloudflare",
  GCP: "googlecloud",
  Claude: "anthropic",
  OpenAI: "openai",
  LangChain: "langchain",
  Docker: "docker",
  "GitHub Actions": "githubactions",
  Terraform: "terraform",
  Kubernetes: "kubernetes",
};

/** A single tech tile: colored brand logo + label, text-only fallback on error. */
function TechTile({ name }: { name: string }) {
  const slug = brandSlugs[name];
  const [broken, setBroken] = useState(false);
  const showLogo = slug && !broken;

  return (
    <div className="group/tile flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-royal/30 hover:shadow-soft">
      {showLogo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://cdn.simpleicons.org/${slug}`}
          alt={`${name} logo`}
          width={18}
          height={18}
          loading="lazy"
          onError={() => setBroken(true)}
          className="h-[18px] w-[18px] object-contain grayscale transition-all duration-300 group-hover/tile:grayscale-0"
        />
      )}
      <span className="text-sm font-medium text-ink-soft transition-colors group-hover/tile:text-ink">
        {name}
      </span>
    </div>
  );
}

/** PHASE 3 — Tech stack grouped by discipline with real brand logos. */
export function TechStack() {
  return (
    <section className="border-b border-line bg-base py-20 md:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Our stack"
          title="Built with modern technologies."
          description="We use the same battle-tested tools that power the world's best products — chosen for speed, security and long-term maintainability."
          align="center"
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {techGroups.map((group, i) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.06, ease: EASE }}
              whileHover={{ y: -6 }}
              className="group flex h-full flex-col rounded-3xl border border-line bg-surface p-6 shadow-soft transition-colors duration-300 hover:border-royal/25 hover:shadow-lift"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal/10 text-royal transition-all duration-300 group-hover:rotate-3 group-hover:bg-royal group-hover:text-white">
                  {groupIcons[group.category]}
                </span>
                <h3 className="text-base font-bold tracking-tight text-ink">
                  {group.category}
                </h3>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {group.items.map((t) => (
                  <TechTile key={t} name={t} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
