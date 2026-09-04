import { describe, expect, it } from "vitest";

import {
  buildCapabilityReport,
  walletApiMeetsMinimum,
} from "../app/internal/compatibility/wallet-capabilities";

describe("wallet compatibility reporting", () => {
  it("accepts the minimum and newer semantic versions", () => {
    expect(walletApiMeetsMinimum(["0.10.3"])).toBe(true);
    expect(walletApiMeetsMinimum(["0.10.4-rc.1"])).toBe(true);
    expect(walletApiMeetsMinimum(["0.11.0"])).toBe(true);
  });

  it("rejects older or malformed versions", () => {
    expect(walletApiMeetsMinimum(["0.10.2"])).toBe(false);
    expect(walletApiMeetsMinimum(["unknown"])).toBe(false);
    expect(walletApiMeetsMinimum([])).toBe(false);
  });

  it("reports methods without invoking any of them", () => {
    let invocationCount = 0;
    const method = () => {
      invocationCount += 1;
    };

    const report = buildCapabilityReport({
      walletName: "Test wallet",
      chainId: "SN_MAIN",
      featureNames: ["starknet:walletApi", "standard:connect"],
      walletApiVersions: ["0.10.3"],
      rpcSpecVersions: ["0.10.0"],
      account: {
        strk20Balances: method,
        strk20PrepareInvoke: method,
        strk20InvokeTransaction: method,
      },
    });

    expect(report.methods.every((item) => item.presentInLibrary)).toBe(true);
    expect(report.methods.every((item) => item.invoked === false)).toBe(true);
    expect(invocationCount).toBe(0);
  });
});
