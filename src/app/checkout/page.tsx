import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { CheckoutPageContent } from "@/app/checkout/CheckoutPageContent";

export const metadata: Metadata = {
  title: "Checkout — Start your project",
  description:
    "Review your package, tell us about your project, and get a clear, itemized price — no payment gateway needed to get started.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Checkout"
        title="Let's set up your project."
        description="A few quick steps to lock in your package and share what you're building — pricing updates live as you go."
      />
      <section className="pb-24 pt-4 md:pb-32">
        <div className="container-x">
          <Suspense fallback={null}>
            <CheckoutPageContent />
          </Suspense>
        </div>
      </section>
    </>
  );
}
