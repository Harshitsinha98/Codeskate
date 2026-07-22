import { describe, it, expect } from "vitest";
import {
  addMoney,
  subtractMoney,
  sumMoney,
  percentOfMoney,
  zeroMoney,
} from "@/lib/money";

describe("money helpers — integer minor-unit math", () => {
  it("adds same-currency amounts", () => {
    expect(addMoney({ amountMinor: 100, currency: "INR" }, { amountMinor: 250, currency: "INR" })).toEqual({
      amountMinor: 350,
      currency: "INR",
    });
  });

  it("throws when adding different currencies", () => {
    expect(() =>
      addMoney({ amountMinor: 100, currency: "INR" }, { amountMinor: 100, currency: "USD" })
    ).toThrow();
  });

  it("clamps subtraction at zero (never negative money)", () => {
    expect(
      subtractMoney({ amountMinor: 100, currency: "INR" }, { amountMinor: 500, currency: "INR" })
    ).toEqual({ amountMinor: 0, currency: "INR" });
  });

  it("sums a list, empty list yields zero", () => {
    expect(sumMoney([], "INR")).toEqual(zeroMoney("INR"));
    expect(
      sumMoney(
        [
          { amountMinor: 100, currency: "INR" },
          { amountMinor: 200, currency: "INR" },
        ],
        "INR"
      )
    ).toEqual({ amountMinor: 300, currency: "INR" });
  });

  it("computes percentage with rounding to nearest minor unit", () => {
    // 18% of 12345 = 2222.1 → rounds to 2222
    expect(percentOfMoney({ amountMinor: 12345, currency: "INR" }, 18)).toEqual({
      amountMinor: 2222,
      currency: "INR",
    });
  });
});
