import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "../app/api/pool-fee/route";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.STARKNET_RPC_URL;
});

describe("GET /api/pool-fee", () => {
  it("does not call upstream when the server RPC is missing", async () => {
    const upstream = vi.fn();
    vi.stubGlobal("fetch", upstream);

    const response = await GET();

    expect(response.status).toBe(503);
    expect(upstream).not.toHaveBeenCalled();
  });

  it("reads the current fee only from the official pool", async () => {
    process.env.STARKNET_RPC_URL = "https://rpc.example/mainnet";
    const upstream = vi.fn().mockResolvedValue(
      Response.json({
        jsonrpc: "2.0",
        id: "strk20-pool-fee",
        result: ["0x53444835ec580000"],
      }),
    );
    vi.stubGlobal("fetch", upstream);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      poolAddress:
        "0x040337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a",
      tokenSymbol: "STRK",
      feeAmount: "6000000000000000000",
      feeFormatted: "6 STRK",
    });
    const [, options] = upstream.mock.calls[0] as [string, RequestInit];
    const requestBody = JSON.parse(String(options.body)) as {
      method: string;
      params: [{ contract_address: string; calldata: unknown[] }, string];
    };
    expect(requestBody).toMatchObject({
      method: "starknet_call",
      params: [
        {
          contract_address:
            "0x040337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a",
          calldata: [],
        },
        "latest",
      ],
    });
  });

  it("fails closed on a malformed fee response", async () => {
    process.env.STARKNET_RPC_URL = "https://rpc.example/mainnet";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ result: ["not-a-felt"] })),
    );

    const response = await GET();

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      error: { message: expect.stringMatching(/invalid fee/i) },
    });
  });
});
