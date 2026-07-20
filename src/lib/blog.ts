export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  cover: string;
};

export const posts: Post[] = [
  {
    slug: "conversion-first-design",
    title: "Why conversion-first design beats award-first design",
    excerpt:
      "Beautiful sites that don't convert are expensive art. Here's the framework we use to make sure design decisions earn their keep.",
    category: "Design",
    readTime: "6 min",
    date: "June 24, 2026",
    author: "Anaya Kapoor",
    cover: "from-royal via-violet to-cyan",
  },
  {
    slug: "core-web-vitals-2026",
    title: "The performance budget that keeps our sites under a second",
    excerpt:
      "Speed is a feature — and a ranking factor, and a conversion lever. A look at how we hit sub-second loads without sacrificing craft.",
    category: "Engineering",
    readTime: "8 min",
    date: "June 11, 2026",
    author: "Dev Sharma",
    cover: "from-violet via-royal to-royal-700",
  },
  {
    slug: "ai-agents-that-pay-back",
    title: "AI agents that actually pay for themselves",
    excerpt:
      "Most AI pilots die in the demo. We break down the workflows where automation reliably returns more than it costs.",
    category: "AI",
    readTime: "7 min",
    date: "May 29, 2026",
    author: "Rohan Mehta",
    cover: "from-cyan via-royal to-violet",
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
