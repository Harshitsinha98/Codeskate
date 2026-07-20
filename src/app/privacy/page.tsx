import type { Metadata } from "next";
import { LegalLayout } from "@/components/layout/LegalLayout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.legalName} collects, uses and protects your personal information.`,
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: false },
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Privacy Policy"
      updated="July 1, 2026"
      intro={`This policy explains what information ${site.legalName} collects, why we collect it, and the choices you have. We keep it plain-language on purpose.`}
      sections={[
        {
          heading: "Information we collect",
          body: [
            "We collect information you give us directly — such as your name, email, company and project details when you contact us or subscribe to our newsletter.",
            "We also collect limited technical information automatically, including your IP address, browser type and how you interact with our site, via privacy-respecting analytics.",
          ],
        },
        {
          heading: "How we use your information",
          body: [
            "To respond to your enquiries, deliver our services, send you material you've requested, and improve our website and offering.",
            "We never sell your personal information. We only share it with service providers who help us operate — and only to the extent necessary.",
          ],
        },
        {
          heading: "Cookies and analytics",
          body: [
            "We use a minimal set of cookies to make the site work and to understand aggregate usage. You can disable cookies in your browser at any time.",
            "Our analytics are configured to anonymize IP addresses and avoid cross-site tracking wherever possible.",
          ],
        },
        {
          heading: "Data retention and security",
          body: [
            "We retain personal information only as long as necessary for the purposes described here, or as required by law.",
            "We use industry-standard technical and organizational measures to protect your information, including encryption in transit and access controls.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "You may request access to, correction of, or deletion of your personal information at any time.",
            `To exercise any of these rights, email us at ${site.email} and we'll respond promptly.`,
          ],
        },
        {
          heading: "Contact",
          body: [
            `Questions about this policy? Reach us at ${site.email}, or by post at ${site.address.line1}, ${site.address.line2}.`,
          ],
        },
      ]}
    />
  );
}
