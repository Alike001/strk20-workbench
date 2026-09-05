import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { CapabilityReport } from "@strk20-workbench/lab-core";

import {
  RealWalletGateway,
  checkReceiptVerifier,
  readinessFrom,
} from "../components/wallet-readiness";

function report(status: "ready" | "blocked"): CapabilityReport {
  return {
    checkedAt: "2026-09-05T00:00:00.000Z",
    capabilities: [
      {
        name: "wallet-methods-present",
        status,
        explanation: "Wallet method status.",
      },
      {
        name: "pool-configuration-matches",
        status: "ready",
        explanation: "Official pool.",
      },
      {
        name: "rpc-verification-available",
        status: "ready",
        explanation: "Receipt verifier.",
      },
    ],
  };
}

describe("real wallet gateway", () => {
  it("explains the connection and review boundary before any wallet action", () => {
    const html = renderToStaticMarkup(<RealWalletGateway />);

    expect(html).toContain("Move from learning to mainnet.");
    expect(html).toContain("Connection never moves funds");
    expect(html).toContain("Review before proof and submit.");
    expect(html).toContain("Stay in wallet");
  });

  it("requires mainnet and every critical capability", () => {
    expect(readinessFrom({ chainId: "SN_MAIN" }, report("ready"))).toBe(
      "ready",
    );
    expect(readinessFrom({ chainId: "SN_MAIN" }, report("blocked"))).toBe(
      "unsupported",
    );
    expect(readinessFrom({ chainId: "SN_SEPOLIA" }, report("ready"))).toBe(
      "wrong-network",
    );
  });

  it("requires the hosted receipt verifier to report Starknet Mainnet", async () => {
    const mainnet = async () =>
      new Response(JSON.stringify({ result: "0x534e5f4d41494e" }));
    const wrongNetwork = async () =>
      new Response(JSON.stringify({ result: "SN_SEPOLIA" }));
    const unavailable = async () => new Response(null, { status: 503 });

    await expect(checkReceiptVerifier(mainnet as typeof fetch)).resolves.toBe(
      true,
    );
    await expect(
      checkReceiptVerifier(wrongNetwork as typeof fetch),
    ).resolves.toBe(false);
    await expect(
      checkReceiptVerifier(unavailable as typeof fetch),
    ).resolves.toBe(false);
  });
});
