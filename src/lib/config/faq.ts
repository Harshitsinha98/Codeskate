/**
 * CENTRALIZED PRICING FAQ.
 *
 * Pricing-related questions, defined once. Any answer that references a price
 * range is composed from the config so copy never drifts from the numbers.
 */

export type PricingFaq = { q: string; a: string };

export const PRICING_FAQS: PricingFaq[] = [
  {
    q: "What size projects do you take on?",
    a: "Most engagements sit between ₹2L and ₹50L+. We work with funded startups scaling fast and established businesses that want their digital presence to match their ambition. If you're not sure where you fit, a discovery call will make it clear in fifteen minutes.",
  },
  {
    q: "How long does a typical project take?",
    a: "A focused landing page or brand sprint can ship in 2–3 weeks. A full website is usually 5–9 weeks. Complex products and apps run 3–6 months. We'll give you a precise timeline after discovery — and we hit it.",
  },
  {
    q: "Do you work with our existing team?",
    a: "Constantly. We plug into your Slack, your rituals and your codebase, and we're just as comfortable being fully autonomous. However you like to work, we adapt.",
  },
  {
    q: "What makes you different from other agencies?",
    a: "We're accountable to outcomes, not hours. Senior people do the actual work — no bait-and-switch to juniors. And we obsess over the details that make the difference between good and unforgettable.",
  },
  {
    q: "Do you offer ongoing support after launch?",
    a: "Yes. Most clients stay with us on a Maintenance & Growth retainer — proactive monitoring, security, and a monthly roadmap of improvements. Launch is where the real work begins.",
  },
  {
    q: "How do we get started?",
    a: "Book a discovery call. We'll dig into your goals, tell you honestly whether we're the right fit, and follow up with a clear proposal, timeline and price. No pressure, no jargon.",
  },
];
