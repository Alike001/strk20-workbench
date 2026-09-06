import { describe, expect, it, vi } from "vitest";

import { RpcTransactionVerifier } from "../lib/wallet/rpc-transaction-verifier";

function response(result: unknown) {
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("RpcTransactionVerifier", () => {
  it.each([
    [
      { execution_status: "SUCCEEDED", finality_status: "ACCEPTED_ON_L2" },
      "succeeded",
    ],
    [
      { execution_status: "REVERTED", finality_status: "ACCEPTED_ON_L2" },
      "reverted",
    ],
    [{ finality_status: "RECEIVED" }, "pending"],
    [{ finality_status: "PRE_CONFIRMED" }, "pending"],
  ] as const)("maps an RPC result to %s", async (result, expected) => {
    const request = vi
      .fn()
      .mockResolvedValue(response({ jsonrpc: "2.0", id: 1, result }));
    const verifier = new RpcTransactionVerifier({
      fetch: request,
      timeoutMs: 1_000,
    });

    await expect(verifier.getTransactionStatus("0xabc")).resolves.toEqual({
      status: expected,
      transactionHash: "0xabc",
    });
    const body = JSON.parse(request.mock.calls[0]?.[1]?.body as string);
    expect(body).toEqual({
      jsonrpc: "2.0",
      id: 1,
      method: "starknet_getTransactionReceipt",
      params: ["0xabc"],
    });
  });

  it("treats transaction-not-found as unknown and other RPC errors as failures", async () => {
    const notFound = new RpcTransactionVerifier({
      fetch: vi.fn().mockResolvedValue(
        response({
          error: { code: 29, message: "Transaction hash not found" },
        }),
      ),
    });
    await expect(notFound.getTransactionStatus("0xabc")).resolves.toEqual({
      status: "unknown",
      transactionHash: "0xabc",
    });

    const failed = new RpcTransactionVerifier({
      fetch: vi
        .fn()
        .mockResolvedValue(response({ error: { code: -1, message: "bad" } })),
    });
    await expect(failed.getTransactionStatus("0xabc")).rejects.toThrow(
      /could not read/i,
    );
  });
});
