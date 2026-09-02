import { describe, expect, it } from "vitest";

import { compatibilitySummary, isGenuineExecution } from "../src/index";

describe("compatibility boundary", () => {
  it("keeps the sandbox wallet-free", () => {
    expect(compatibilitySummary.sandboxRequiresWallet).toBe(false);
  });

  it("only treats real-mode real proofs as genuine", () => {
    expect(isGenuineExecution("sandbox", "simulated")).toBe(false);
    expect(isGenuineExecution("sandbox", "real")).toBe(false);
    expect(isGenuineExecution("real", "simulated")).toBe(false);
    expect(isGenuineExecution("real", "real")).toBe(true);
  });
});
