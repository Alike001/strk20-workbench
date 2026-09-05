import { describe, expect, it, vi } from "vitest";

import {
  buildPublicEvidence,
  isUsableRpcUrl,
  type VerifiedReceipt,
} from "../lib/evidence";

const HASH = "0xabc";
const PADDED_HASH = `0x${"0".repeat(61)}abc`;

function submission(transactions: string[] = [HASH]) {
  return {
    transactions,
    contracts: [],
    demo_video: "",
    demo_url: "",
  };
}

function curated(transactionHash = HASH) {
  return {
    records: [
      {
        action: "shield",
        transaction_hash: transactionHash,
        created_at: "2026-09-05T12:00:00.000Z",
      },
    ],
  };
}

function verifier(result?: Partial<VerifiedReceipt>) {
  return {
    verify: vi.fn().mockResolvedValue({
      transactionHash: HASH,
      receiptStatus: "succeeded",
      poolInteraction: "verified",
      ...result,
    }),
  };
}

describe("buildPublicEvidence", () => {
  it("publishes a qualifying-shaped record only after public receipt verification", async () => {
    const receiptVerifier = verifier();
    const result = await buildPublicEvidence({
      submission: submission(),
      curated: curated(),
      verifier: receiptVerifier,
    });

    expect(result.records).toHaveLength(1);
    expect(result.records[0]).toMatchObject({
      source: "project-curated",
      mode: "real",
      proofKind: "real",
      network: "SN_MAIN",
      action: "shield",
      transactionHash: HASH,
      receiptStatus: "succeeded",
      poolInteraction: "verified",
    });
    expect(receiptVerifier.verify).toHaveBeenCalledWith(HASH);
  });

  it("keeps records unverified when RPC is not configured", async () => {
    const result = await buildPublicEvidence({
      submission: submission(),
      curated: curated(),
    });

    expect(result.rpcConfigured).toBe(false);
    expect(result.records[0]).toMatchObject({
      receiptStatus: "unknown",
      poolInteraction: "not-verified",
    });
  });

  it("deduplicates equivalent padded hashes before verification", async () => {
    const receiptVerifier = verifier();
    const result = await buildPublicEvidence({
      submission: submission([HASH, PADDED_HASH]),
      curated: curated(PADDED_HASH),
      verifier: receiptVerifier,
    });

    expect(result.records).toHaveLength(1);
    expect(receiptVerifier.verify).toHaveBeenCalledTimes(1);
    expect(result.issues.join(" ")).toMatch(/duplicate transaction hash/i);
  });

  it("does not publish metadata absent from strk20.json or hashes without metadata", async () => {
    const result = await buildPublicEvidence({
      submission: submission(["0x111"]),
      curated: curated("0x222"),
      verifier: verifier(),
    });

    expect(result.records).toEqual([]);
    expect(result.issues).toHaveLength(2);
    expect(result.issues.join(" ")).toContain("0x111");
    expect(result.issues.join(" ")).toContain("0x222");
  });

  it("fails closed on malformed repository metadata", async () => {
    const result = await buildPublicEvidence({
      submission: { transactions: ["fake"] },
      curated: { records: "fake" },
      verifier: verifier(),
    });

    expect(result.records).toEqual([]);
    expect(result.issues).toHaveLength(2);
  });
});

describe("isUsableRpcUrl", () => {
  it("accepts configured HTTP endpoints without exposing their value", () => {
    expect(isUsableRpcUrl("https://rpc.example/key")).toBe(true);
    expect(isUsableRpcUrl("http://127.0.0.1:5050")).toBe(true);
    expect(isUsableRpcUrl("https://rpc.example/replace-me")).toBe(false);
    expect(isUsableRpcUrl("file:///secret")).toBe(false);
    expect(isUsableRpcUrl(undefined)).toBe(false);
  });
});
