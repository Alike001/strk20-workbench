import { describe, expect, it, vi } from "vitest";

import { RpcEvidenceVerifier } from "../lib/evidence";

const POOL = "0x040337b1af3c";

function response(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function verifier(payload: unknown) {
  return new RpcEvidenceVerifier({
    endpoint: "https://rpc.example",
    expectedPool: POOL,
    timeoutMs: 1_000,
    fetch: vi.fn().mockResolvedValue(response(payload)),
  });
}

describe("RpcEvidenceVerifier", () => {
  it("verifies only a final successful receipt with an event from the expected pool", async () => {
    const request = vi.fn().mockResolvedValue(
      response({
        result: {
          execution_status: "SUCCEEDED",
          finality_status: "ACCEPTED_ON_L2",
          events: [{ from_address: "0x00040337b1af3c", keys: [], data: [] }],
        },
      }),
    );
    const receiptVerifier = new RpcEvidenceVerifier({
      endpoint: "https://rpc.example",
      expectedPool: POOL,
      fetch: request,
    });

    await expect(receiptVerifier.verify("0xabc")).resolves.toEqual({
      transactionHash: "0xabc",
      receiptStatus: "succeeded",
      poolInteraction: "verified",
    });
    expect(JSON.parse(request.mock.calls[0]?.[1]?.body as string)).toEqual({
      jsonrpc: "2.0",
      id: "strk20-evidence",
      method: "starknet_getTransactionReceipt",
      params: ["0xabc"],
    });
  });

  it("does not infer pool interaction from receipt success alone", async () => {
    await expect(
      verifier({
        result: {
          execution_status: "SUCCEEDED",
          finality_status: "ACCEPTED_ON_L1",
          events: [{ from_address: "0x999" }],
        },
      }).verify("0xabc"),
    ).resolves.toMatchObject({
      receiptStatus: "succeeded",
      poolInteraction: "not-verified",
    });
  });

  it.each([
    [
      { execution_status: "REVERTED", finality_status: "ACCEPTED_ON_L2" },
      "reverted",
    ],
    [{ finality_status: "RECEIVED" }, "pending"],
    [{ finality_status: "PRE_CONFIRMED" }, "pending"],
    [{ finality_status: "REJECTED" }, "unknown"],
  ] as const)(
    "maps non-qualifying receipts conservatively",
    async (result, status) => {
      await expect(verifier({ result }).verify("0xdef")).resolves.toMatchObject(
        {
          receiptStatus: status,
          poolInteraction: "not-verified",
        },
      );
    },
  );

  it("treats not-found as unknown and surfaces other RPC failures", async () => {
    await expect(
      verifier({
        error: { code: 29, message: "Transaction hash not found" },
      }).verify("0x123"),
    ).resolves.toMatchObject({
      receiptStatus: "unknown",
      poolInteraction: "not-verified",
    });
    await expect(
      verifier({ error: { code: -1, message: "bad request" } }).verify("0x123"),
    ).rejects.toThrow(/could not read/i);
  });

  it("rejects a non-success HTTP response", async () => {
    const receiptVerifier = new RpcEvidenceVerifier({
      endpoint: "https://rpc.example",
      expectedPool: POOL,
      fetch: vi.fn().mockResolvedValue(response({}, 503)),
    });
    await expect(receiptVerifier.verify("0x123")).rejects.toThrow(/HTTP 503/);
  });
});
