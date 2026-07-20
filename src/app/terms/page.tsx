import type { Metadata } from "next";
import { LegalLayout } from "@/components/layout/LegalLayout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that govern your use of the ${site.legalName} website and services.`,
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: false },
};

export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Terms of Service"
      updated="July 1, 2026"
      intro={`These terms govern your use of the ${site.legalName} website and any services we provide. By using our site, you agree to them.`}
      sections={[
        {
          heading: "Using our website",
          body: [
            "You may use our website for lawful purposes only. You agree not to misuse it, attempt to disrupt it, or access it in any way that breaches applicable law.",
            "All content on this site — copy, design, code and brand assets — is owned by CodeSkate unless otherwise stated, and may not be reproduced without permission.",
          ],
        },
        {
          heading: "Engagements and proposals",
          body: [
            "Any project engagement is governed by a separate written agreement, including scope, deliverables, timeline and fees. Information on this website is for general guidance and does not constitute a binding offer.",
            "Pricing tiers shown are indicative starting points. Final pricing is confirmed in your proposal after a discovery conversation.",
          ],
        },
        {
          heading: "Intellectual property",
          body: [
            "Upon full payment, ownership of the final deliverables created specifically for you transfers to you, as detailed in your engagement agreement.",
            "We retain the right to display completed work in our portfolio and marketing, unless a confidentiality agreement states otherwise.",
          ],
        },
        {
          heading: "Limitation of liability",
          body: [
            "Our website and content are provided “as is” without warranties of any kind. To the fullest extent permitted by law, CodeSkate is not liable for any indirect or consequential loss arising from use of this site.",
          ],
        },
        {
          heading: "Changes to these terms",
          body: [
            "We may update these terms from time to time. The current version will always be posted here with its effective date.",
          ],
        },
        {
          heading: "Contact",
          body: [
            `If you have any questions about these terms, contact us at ${site.email}.`,
          ],
        },
      ]}
    />
  );
}
