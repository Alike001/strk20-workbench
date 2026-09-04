import type { TokenState } from "./types";

const INTEGER_PATTERN = /^(0|[1-9]\d*)$/;

export function parseBaseUnitAmount(value: string | bigint): bigint {
  if (typeof value === "bigint") {
    if (value < 0n)
      throw new TypeError("Base-unit amounts cannot be negative.");
    return value;
  }
  if (!INTEGER_PATTERN.test(value))
    throw new TypeError("Base-unit amounts must be unsigned integer strings.");
  return BigInt(value);
}

export function assertPositiveAmount(amount: bigint): void {
  if (amount <= 0n)
    throw new RangeError("Action amounts must be greater than zero.");
}

export function addBaseUnits(left: bigint, right: bigint): bigint {
  const result = left + right;
  if (result < 0n)
    throw new RangeError("Base-unit balance cannot be negative.");
  return result;
}

export function subtractBaseUnits(balance: bigint, amount: bigint): bigint {
  assertPositiveAmount(amount);
  if (amount > balance) throw new RangeError("Amount exceeds balance.");
  return balance - amount;
}

export function formatTokenAmount(amount: bigint, token: TokenState): string {
  const scale = 10n ** BigInt(token.decimals);
  const whole = amount / scale;
  const fraction = amount % scale;
  if (fraction === 0n) return `${whole.toString()} ${token.symbol}`;
  const fractionText = fraction
    .toString()
    .padStart(token.decimals, "0")
    .replace(/0+$/, "");
  return `${whole.toString()}.${fractionText} ${token.symbol}`;
}
