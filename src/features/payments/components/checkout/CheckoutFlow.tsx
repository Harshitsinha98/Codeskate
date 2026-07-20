"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCheckoutState } from "@/hooks/useCheckoutState";
import { getPackage, getService } from "@/config/catalog";
import { calculateOrder } from "@/lib/pricing-engine";
import { validateBillingInfo, validateRequirements } from "@/lib/checkout-validation";
import { paymentService } from "@/services/payment.service";
import { openRazorpayCheckout } from "@/features/payments/lib/razorpay-checkout";
import paymentsConfig from "@/config/payments";
import { CHECKOUT_STEPS, CHECKOUT_STEP_ORDER } from "@/constants/checkout";
import { Button } from "@/components/ui/Button";
import { CheckoutStepper } from "@/features/payments/components/checkout/CheckoutStepper";
import { AutosaveIndicator } from "@/features/payments/components/checkout/AutosaveIndicator";
import { StepPackageReview } from "@/features/payments/components/checkout/StepPackageReview";
import { StepBillingInfo } from "@/features/payments/components/checkout/StepBillingInfo";
import { StepRequirements } from "@/features/payments/components/checkout/StepRequirements";
import { StepAddons } from "@/features/payments/components/checkout/StepAddons";
import { StepOrderSummary, type PaymentPhase } from "@/features/payments/components/checkout/StepOrderSummary";
import { CouponInput } from "@/features/payments/components/checkout/CouponInput";

/**
 * Full 5-step checkout flow. Reads the service/package from URL params on
 * first load and persists progress via `useCheckoutState` (sessionStorage) —
 * refreshing mid-flow does not lose progress.
 */
export function CheckoutFlow({
  initialServiceSlug,
  initialPackageId,
}: {
  initialServiceSlug: string | null;
  initialPackageId: string | null;
}) {
  const { state, update, hydrated, savingStatus } = useCheckoutState();
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<PaymentPhase>("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  // Guards against a second click while an attempt is already in flight (the
  // button is also disabled, but this keeps the async handler itself reentrant-safe).
  const paymentInFlight = useRef(false);

  // Seed selection from the incoming ?service=&package= query on first hydration
  // only if nothing is already persisted (so a refresh keeps prior progress).
  const seeded = useMemo(() => {
    if (!hydrated) return false;
    if (state.selection.serviceSlug) return true;
    if (initialServiceSlug && getService(initialServiceSlug)) {
      update({
        selection: {
          serviceSlug: initialServiceSlug,
          packageId:
            initialPackageId && getPackage(initialServiceSlug, initialPackageId)
              ? initialPackageId
              : (getService(initialServiceSlug)?.packages[0]?.id ?? null),
          addonIds: [],
        },
      });
    }
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const service = state.selection.serviceSlug ? getService(state.selection.serviceSlug) : undefined;
  const pkg =
    service && state.selection.packageId
      ? service.packages.find((p) => p.id === state.selection.packageId)
      : undefined;
  const addonIds = state.selection.addonIds;
  const selectedAddons = useMemo(
    () => (service ? service.addons.filter((a) => addonIds.includes(a.id)) : []),
    [service, addonIds]
  );

  const breakdown = useMemo(() => {
    if (!pkg) return null;
    return calculateOrder({
      pkg,
      addons: selectedAddons,
      coupon: state.appliedCoupon,
    });
  }, [pkg, selectedAddons, state.appliedCoupon]);

  const currentIndex = CHECKOUT_STEP_ORDER.indexOf(state.currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === CHECKOUT_STEP_ORDER.length - 1;

  const billingErrors = validateBillingInfo(state.billing);
  const requirementsErrors = validateRequirements(state.requirements);

  const canAdvance = (): boolean => {
    if (state.currentStep === CHECKOUT_STEPS.PACKAGE) return Boolean(service && pkg);
    if (state.currentStep === CHECKOUT_STEPS.BILLING) return Object.keys(billingErrors).length === 0;
    if (state.currentStep === CHECKOUT_STEPS.REQUIREMENTS)
      return Object.keys(requirementsErrors).length === 0;
    return true;
  };

  const goNext = () => {
    setAttemptedNext(true);
    if (!canAdvance()) return;
    setAttemptedNext(false);
    const nextStep = CHECKOUT_STEP_ORDER[currentIndex + 1];
    if (nextStep) update({ currentStep: nextStep });
  };

  const goBack = () => {
    setAttemptedNext(false);
    const prevStep = CHECKOUT_STEP_ORDER[currentIndex - 1];
    if (prevStep) update({ currentStep: prevStep });
  };

  const toggleAddon = (addonId: string) => {
    const current = state.selection.addonIds;
    const next = current.includes(addonId)
      ? current.filter((id) => id !== addonId)
      : [...current, addonId];
    update({ selection: { ...state.selection, addonIds: next } });
  };

  /**
   * Payment orchestration (client half):
   *   1. create the server order + provider order (server recomputes pricing),
   *   2. open the Razorpay modal with the returned providerOrderId/keyId/amount,
   *   3. report the outcome back to the server, which verifies the signature
   *      server-side before flipping the internal Order to "paid".
   * Provider-agnostic at this layer — only `openRazorpayCheckout` is Razorpay-
   * specific, and it's swapped by provider in a later Stripe adapter.
   */
  const handleProceedToPayment = useCallback(async () => {
    if (paymentInFlight.current) return;
    if (!service || !pkg) return;

    paymentInFlight.current = true;
    setPaymentError(null);
    setPaymentPhase("processing");

    try {
      const created = await paymentService.createOrder({
        serviceSlug: service.slug,
        packageId: pkg.id,
        addonIds: state.selection.addonIds,
        couponCode: state.appliedCoupon?.code ?? null,
        billing: state.billing,
        requirements: state.requirements,
      });

      await openRazorpayCheckout({
        keyId: created.keyId,
        providerOrderId: created.providerOrderId,
        amount: created.amount,
        billing: state.billing,
        description: `${service.title} — ${pkg.name}`,
        onSuccess: async (response) => {
          try {
            await paymentService.completeOrder(created.orderId, {
              outcome: "success",
              providerOrderId: response.razorpay_order_id,
              providerPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            setPaymentPhase("success");
          } catch (err) {
            setPaymentError(err instanceof Error ? err.message : "We could not confirm your payment.");
            setPaymentPhase("failed");
          } finally {
            paymentInFlight.current = false;
          }
        },
        onDismiss: async () => {
          // Modal closed without paying — record the cancellation, best-effort.
          try {
            await paymentService.completeOrder(created.orderId, { outcome: "cancelled" });
          } catch {
            // Non-fatal: the order simply stays pending server-side.
          }
          setPaymentPhase("cancelled");
          paymentInFlight.current = false;
        },
        onFailure: async (reason) => {
          try {
            await paymentService.completeOrder(created.orderId, { outcome: "failed", reason });
          } catch {
            // Non-fatal: surface the failure to the user regardless.
          }
          setPaymentError(reason);
          setPaymentPhase("failed");
          paymentInFlight.current = false;
        },
      });
    } catch (err) {
      // createOrder failed, or the gateway script could not open at all.
      setPaymentError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPaymentPhase("failed");
      paymentInFlight.current = false;
    }
  }, [service, pkg, state.selection.addonIds, state.appliedCoupon, state.billing, state.requirements]);

  if (!hydrated || !seeded) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-faint" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10 flex items-center justify-between gap-4">
        <CheckoutStepper currentStep={state.currentStep} />
      </div>
      <div className="mb-6 flex justify-end">
        <AutosaveIndicator status={savingStatus} />
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-line bg-surface p-8 shadow-soft md:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentStep}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {state.currentStep === CHECKOUT_STEPS.PACKAGE && (
              <StepPackageReview service={service} pkg={pkg} />
            )}

            {state.currentStep === CHECKOUT_STEPS.BILLING && (
              <StepBillingInfo
                billing={state.billing}
                onChange={(patch) => update({ billing: { ...state.billing, ...patch } })}
                errors={attemptedNext ? billingErrors : {}}
              />
            )}

            {state.currentStep === CHECKOUT_STEPS.REQUIREMENTS && (
              <StepRequirements
                requirements={state.requirements}
                onChange={(patch) =>
                  update({ requirements: { ...state.requirements, ...patch } })
                }
                errors={attemptedNext ? requirementsErrors : {}}
              />
            )}

            {state.currentStep === CHECKOUT_STEPS.ADDONS && (
              <StepAddons
                addons={service?.addons ?? []}
                selectedIds={state.selection.addonIds}
                onToggle={toggleAddon}
              />
            )}

            {state.currentStep === CHECKOUT_STEPS.SUMMARY && service && pkg && breakdown && (
              <div className="space-y-8">
                <CouponInput
                  code={state.couponCode}
                  appliedCoupon={state.appliedCoupon}
                  subtotal={breakdown.subtotal}
                  onCodeChange={(couponCode) => update({ couponCode })}
                  onApply={(coupon) => update({ appliedCoupon: coupon, couponCode: coupon.code })}
                  onRemove={() => update({ appliedCoupon: null })}
                />
                <StepOrderSummary
                  service={service}
                  pkg={pkg}
                  selectedAddons={selectedAddons}
                  billing={state.billing}
                  breakdown={breakdown}
                  paymentsEnabled={paymentsConfig.providers.razorpay.enabled}
                  paymentPhase={paymentPhase}
                  paymentError={paymentError}
                  onProceedToPayment={handleProceedToPayment}
                />
              </div>
            )}

            {state.currentStep === CHECKOUT_STEPS.SUMMARY && (!service || !pkg) && (
              <StepPackageReview service={service} pkg={pkg} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {!isLastStep && (
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={isFirstStep}
            className={isFirstStep ? "invisible" : ""}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button variant="primary" onClick={goNext} arrow>
            Next
          </Button>
        </div>
      )}

      {isLastStep && (
        <div className="mt-6 flex items-center justify-start">
          <Button variant="ghost" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      )}
    </div>
  );
}
