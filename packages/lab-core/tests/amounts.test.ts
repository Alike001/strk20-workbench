import { describe, expect, it } from "vitest";

import {
  addBaseUnits,
  assertPositiveAmount,
  formatTokenAmount,
  parseBaseUnitAmount,
  subtractBaseUnits,
} from "../src/index";

describe("base-unit amount helpers", () => {
  it("parses integer strings and bigints without floating-point arithmetic", () => {
    expect(parseBaseUnitAmount("1000000000000000001")).toBe(
      1000000000000000001n,
    );
    expect(parseBaseUnitAmount(4n)).toBe(4n);
    expect(() => parseBaseUnitAmount("1.5")).toThrow("unsigned integer");
    expect(() => parseBaseUnitAmount("01")).toThrow("unsigned integer");
    expect(() => parseBaseUnitAmount(-1n)).toThrow("cannot be negative");
  });

  it("adds, subtracts, and rejects invalid balances", () => {
    expect(addBaseUnits(9n, 3n)).toBe(12n);
    expect(subtractBaseUnits(9n, 3n)).toBe(6n);
    expect(() => addBaseUnits(1n, -2n)).toThrow("cannot be negative");
    expect(() => subtractBaseUnits(2n, 3n)).toThrow("exceeds balance");
    expect(() => assertPositiveAmount(0n)).toThrow("greater than zero");
  });

  it("formats display values from token decimals", () => {
    const token = {
      id: "strk",
      symbol: "STRK",
      decimals: 3,
      fictional: false,
    } as const;
    expect(formatTokenAmount(12000n, token)).toBe("12 STRK");
    expect(formatTokenAmount(12050n, token)).toBe("12.05 STRK");
  });
});
