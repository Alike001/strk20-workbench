import { describe, expect, it } from "vitest";

import { GET } from "../app/api/evidence/route";

describe("GET /api/evidence", () => {
  it("returns repository evidence without inventing receipt verification", async () => {
    const previous = process.env.STARKNET_RPC_URL;
    process.env.STARKNET_RPC_URL = "https://rpc.example/replace-me";
    try {
      const response = await GET();
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(payload.records).toEqual([
        expect.objectContaining({
          action: "shield",
          transactionHash:
            "0x039372b04a863fd5cd016f2715034dc6286b7c61f63abe96199ddf65b35da6c0",
          receiptStatus: "unknown",
          poolInteraction: "not-verified",
        }),
      ]);
      expect(payload.manifest.transactions).toEqual([
        "0x039372b04a863fd5cd016f2715034dc6286b7c61f63abe96199ddf65b35da6c0",
      ]);
      expect(payload.rpcConfigured).toBe(false);
    } finally {
      if (previous === undefined) delete process.env.STARKNET_RPC_URL;
      else process.env.STARKNET_RPC_URL = previous;
    }
  });
});
