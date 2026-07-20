import type { ReactNode } from "react";

/** Full article bodies, keyed by post slug. Real editorial content. */
export const postBodies: Record<string, ReactNode> = {
  "conversion-first-design": (
    <>
      <p>
        There&apos;s a quiet trap in our industry. It&apos;s the belief that if
        a design wins an award, it must be good for the business. Sometimes
        those two things align. Often they don&apos;t — and when they diverge,
        the business is the one that pays.
      </p>
      <h2>Beauty is table stakes, not the goal</h2>
      <p>
        We&apos;re not arguing against craft. CodeSkate obsesses over craft. But
        craft in service of nothing is decoration. The question we ask of every
        design decision is simple: <em>what is this in service of?</em> If the
        answer is &ldquo;it looks impressive,&rdquo; that&apos;s not enough.
      </p>
      <p>
        Conversion-first design starts from the outcome and works backwards.
        Before we open Figma, we know what a visitor is supposed to do, what&apos;s
        currently stopping them, and how we&apos;ll measure whether we fixed it.
      </p>
      <h2>The framework we use</h2>
      <p>
        Every screen gets scored against three questions. Is the next action
        obvious within three seconds? Does the copy address the objection a real
        user would have right here? And is there anything on this screen that
        doesn&apos;t earn its place? Anything that fails goes back to the board.
      </p>
      <blockquote>
        The best-performing designs we&apos;ve shipped weren&apos;t the flashiest.
        They were the clearest.
      </blockquote>
      <p>
        Clarity converts. When Lumen&apos;s onboarding went from a 14-step maze
        to a five-screen flow, completion rose 318%. Nothing about that redesign
        was visually radical — it was ruthlessly clear. That&apos;s the whole
        game.
      </p>
      <h2>Where awards fit</h2>
      <p>
        Do great outcomes and great aesthetics ever coincide? Constantly. A
        conversion-first process doesn&apos;t mean ugly — it means every
        beautiful choice also does a job. When you get both, you win the award{" "}
        <em>and</em> the quarter. That&apos;s the bar.
      </p>
    </>
  ),
  "core-web-vitals-2026": (
    <>
      <p>
        Speed isn&apos;t a nice-to-have. It&apos;s a conversion lever, a ranking
        factor and a trust signal all at once. A site that loads in under a
        second feels expensive. One that stutters feels cheap — no matter how
        beautiful the design.
      </p>
      <h2>Start with a budget, not an audit</h2>
      <p>
        Most teams treat performance as something to fix at the end. We treat it
        as a constraint from the start. Before we write code, we agree a
        performance budget: a hard ceiling on JavaScript, image weight and
        render-blocking resources. If a feature would blow the budget, we
        discuss the trade-off up front — not after launch.
      </p>
      <h2>The techniques that actually move the needle</h2>
      <p>
        Ship less JavaScript. Server-render what you can. Lazy-load what&apos;s
        below the fold. Serve modern image formats at the exact size they&apos;ll
        render. Preload the fonts that matter and swap the ones that don&apos;t.
        None of this is exotic — it&apos;s discipline, applied consistently.
      </p>
      <blockquote>
        A performance budget turns &ldquo;make it faster&rdquo; from a vague wish
        into a testable constraint every commit is measured against.
      </blockquote>
      <p>
        For Vantage, holding that discipline took their median load from 3.4s to
        0.8s — and demo conversions rose 52% alongside it. Speed didn&apos;t just
        please Google. It changed how the brand felt.
      </p>
      <h2>Measure in the field, not just the lab</h2>
      <p>
        Lab scores are a proxy. Real users on real devices are the truth. We
        instrument every project with field data so we optimize for what people
        actually experience — not a synthetic run on a fast connection.
      </p>
    </>
  ),
  "ai-agents-that-pay-back": (
    <>
      <p>
        Most AI pilots die in the demo. They dazzle in a controlled setting,
        then quietly get shelved when they meet the mess of real work. The
        problem is rarely the model. It&apos;s that the pilot was pointed at the
        wrong workflow.
      </p>
      <h2>Automate the boring middle, not the exciting edges</h2>
      <p>
        The workflows where AI reliably pays back share a shape: high volume,
        repetitive, and expensive in human time but forgiving of a human check.
        Support triage. Lead qualification. Document extraction. First-draft
        generation. These aren&apos;t glamorous — which is exactly why they work.
      </p>
      <h2>Human-in-the-loop is a feature, not a failure</h2>
      <p>
        The best deployments don&apos;t remove humans — they promote them. The
        agent handles the repetitive 64% so people spend their time on the
        genuinely hard 36%. When Orbital deployed a support agent, ticket volume
        dropped 64% and CSAT <em>rose</em> 22 points. The humans got better
        because they were freed to be human.
      </p>
      <blockquote>
        If you can&apos;t measure what an AI workflow deflects, saves or speeds
        up, you don&apos;t have a project — you have a demo.
      </blockquote>
      <h2>Guardrails, evaluations, and honest ROI</h2>
      <p>
        Every agent we ship comes with an evaluation harness and guardrails, so
        quality is monitored, not assumed. And every one comes with a dashboard
        that answers the only question that matters: is this returning more than
        it costs? If it isn&apos;t, we&apos;d rather tell you than let it drift.
      </p>
    </>
  ),
};
