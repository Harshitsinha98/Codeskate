/**
 * Money arithmetic helpers — integer minor-unit math (never floats), per the
 * `Money` convention in `@/types/common` and docs/DATABASE.md §0.6.
 */

import type { Money } from "@/types/common";

export const zeroMoney = (currency = "INR"): Money => ({
  amountMinor: 0,
  currency,
});

export const addMoney = (a: Money, b: Money): Money => {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add different currencies: ${a.currency} + ${b.currency}`);
  }
  return { amountMinor: a.amountMinor + b.amountMinor, currency: a.currency };
};

export const sumMoney = (items: Money[], currency = "INR"): Money =>
  items.reduce(addMoney, zeroMoney(currency));

export const subtractMoney = (a: Money, b: Money): Money => {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot subtract different currencies: ${a.currency} - ${b.currency}`);
  }
  return {
    amountMinor: Math.max(0, a.amountMinor - b.amountMinor),
    currency: a.currency,
  };
};

/** Multiply money by a plain percentage (0-100), rounding to the nearest minor unit. */
export const percentOfMoney = (money: Money, percent: number): Money => ({
  amountMinor: Math.round((money.amountMinor * percent) / 100),
  currency: money.currency,
});

/** Format minor units as a locale currency string, e.g. 2000000 → "₹20,000.00". */
export function formatMoney(money: Money, locale = "en-IN"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
    minimumFractionDigits: 2,
  }).format(money.amountMinor / 100);
}
