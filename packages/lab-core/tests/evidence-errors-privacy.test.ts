import { describe, expect, it } from "vitest";

import {
  createLabError,
  executionTruth,
  getPrivacyFacts,
  isEvidenceConsistentWithExecution,
  isQualifyingMainnetEvidence,
  PRIVACY_CATALOG_VERSION,
  sanitizeRawCause,
  type EvidenceRecord,
  type LabAction,
} from "../src/index";

function evidence(overrides: Partial<EvidenceRecord> = {}): EvidenceRecord {
  return {
    id: "evidence-1",
    source: "project-curated",
    mode: "real",
    proofKind: "real",
    network: "SN_MAIN",
    action: "private-transfer",
    transactionHash: "0xabc123",
    receiptStatus: "succeeded",
    poolInteraction: "verified",
    explorerUrl: "https://voyager.online/tx/0xabc123",
    createdAt: "2026-09-04T00:00:00.000Z",
    ...overrides,
  };
}

describe("evidence truth boundary", () => {
  it("accepts only successful, verified, real mainnet evidence", () => {
    expect(isQualifyingMainnetEvidence(evidence())).toBe(true);
    const invalidCases: Partial<EvidenceRecord>[] = [
      { mode: "sandbox" },
      { proofKind: "simulated" },
      { network: "SN_SEPOLIA" },
      { receiptStatus: "pending" },
      { poolInteraction: "not-verified" },
      { transactionHash: "not-a-hash" },
      { transactionHash: undefined },
      { explorerUrl: "http://unsafe.example" },
      { explorerUrl: undefined },
    ];
    for (const invalid of invalidCases)
      expect(isQualifyingMainnetEvidence(evidence(invalid))).toBe(false);
  });

  it("keeps simulated, real-unverified, and genuine-mainnet labels distinct", () => {
    expect(
      executionTruth({
        mode: "sandbox",
        proofKind: "simulated",
        network: "SANDBOX",
      }),
    ).toBe("simulated");
    expect(
      executionTruth({
        mode: "real",
        proofKind: "unknown",
        network: "SN_MAIN",
      }),
    ).toBe("real-unverified");
    expect(
      executionTruth({ mode: "real", proofKind: "real", network: "SN_MAIN" }),
    ).toBe("genuine-mainnet");
  });

  it("requires evidence metadata to match the execution that produced it", () => {
    const execution = {
      mode: "real",
      proofKind: "real",
      network: "SN_MAIN",
      action: "private-transfer",
    } as const;
    expect(isEvidenceConsistentWithExecution(evidence(), execution)).toBe(true);
    expect(
      isEvidenceConsistentWithExecution(
        evidence({ action: "shield" }),
        execution,
      ),
    ).toBe(false);
    expect(
      isEvidenceConsistentWithExecution(
        evidence({ proofKind: "unknown" }),
        execution,
      ),
    ).toBe(false);
    expect(
      isEvidenceConsistentWithExecution(
        evidence({
          mode: "sandbox",
          network: "SANDBOX",
          source: "wallet-session",
        }),
        {
          mode: "sandbox",
          proofKind: "real",
          network: "SANDBOX",
          action: "private-transfer",
        },
      ),
    ).toBe(false);
  });
});

describe("privacy and error catalogues", () => {
  it("has reviewed privacy facts for every supported action", () => {
    const actions: LabAction["type"][] = [
      "register",
      "shield",
      "private-transfer",
      "withdraw",
    ];
    expect(PRIVACY_CATALOG_VERSION).toMatch(/^strk20-/);
    for (const action of actions) {
      const facts = getPrivacyFacts(action);
      expect(facts.length).toBeGreaterThan(0);
      expect(
        facts.every((fact) => fact.explanation && fact.technicalBasis),
      ).toBe(true);
    }
  });

  it("creates stable errors and redacts secret-bearing object keys", () => {
    const error = createLabError({
      code: "RPC_UNAVAILABLE",
      mode: "real",
      network: "SN_MAIN",
      phase: "confirming",
      stepId: "step-1",
      explanation: "Verification timed out.",
      rawCause: {
        authorization: "secret",
        rpcUrl: "secret",
        status: 503,
        nested: [{ apiKey: "secret", safe: true }],
      },
    });
    expect(error).toMatchObject({
      code: "RPC_UNAVAILABLE",
      retryable: true,
      explanation: "Verification timed out.",
    });
    expect(error.rawCause).toEqual({ status: 503, nested: [{ safe: true }] });
    expect(Object.isFrozen(error)).toBe(true);
  });

  it("turns Error instances and primitive causes into safe advanced details", () => {
    expect(sanitizeRawCause(new TypeError("bad input"))).toEqual({
      name: "TypeError",
      message: "bad input",
    });
    expect(sanitizeRawCause("plain failure")).toBe("plain failure");
  });
});
