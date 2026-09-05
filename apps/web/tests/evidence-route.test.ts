import { describe, expect, it } from "vitest";

import { GET } from "../app/api/evidence/route";

describe("GET /api/evidence", () => {
  it("returns the empty repository projection without inventing evidence", async () => {
    const previous = process.env.STARKNET_RPC_URL;
    process.env.STARKNET_RPC_URL = "https://rpc.example/replace-me";
    try {
      const response = await GET();
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(payload.records).toEqual([]);
      expect(payload.manifest.transactions).toEqual([]);
      expect(payload.rpcConfigured).toBe(false);
    } finally {
      if (previous === undefined) delete process.env.STARKNET_RPC_URL;
      else process.env.STARKNET_RPC_URL = previous;
    }
  });
});
