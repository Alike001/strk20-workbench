import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "../app/api/starknet/route";

function request(body: unknown, contentType = "application/json") {
  return new Request("http://localhost/api/starknet", {
    method: "POST",
    headers: { "content-type": contentType },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.STARKNET_RPC_URL;
});

describe("POST /api/starknet", () => {
  it("rejects non-JSON and non-allowlisted methods", async () => {
    expect((await POST(request({}, "text/plain"))).status).toBe(415);
    const denied = await POST(
      request({ jsonrpc: "2.0", id: 1, method: "starknet_call", params: [] }),
    );
    expect(denied.status).toBe(403);
    await expect(denied.json()).resolves.toMatchObject({
      error: { message: expect.stringMatching(/not available/i) },
    });
  });

  it("does not proxy when the server-only RPC URL is missing", async () => {
    const upstream = vi.fn();
    vi.stubGlobal("fetch", upstream);
    const response = await POST(
      request({
        jsonrpc: "2.0",
        id: 1,
        method: "starknet_getTransactionStatus",
        params: ["0x1"],
      }),
    );
    expect(response.status).toBe(503);
    expect(upstream).not.toHaveBeenCalled();
  });

  it("proxies only an allowlisted request without exposing the RPC URL", async () => {
    process.env.STARKNET_RPC_URL = "https://rpc.example/secret-path";
    const upstream = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          result: { finality_status: "ACCEPTED_ON_L2" },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", upstream);
    const payload = {
      jsonrpc: "2.0",
      id: 1,
      method: "starknet_getTransactionStatus",
      params: ["0x1"],
    };
    const response = await POST(request(payload));
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(JSON.parse(text)).toMatchObject({ id: 1 });
    expect(text).not.toContain("secret-path");
    expect(upstream).toHaveBeenCalledWith(
      "https://rpc.example/secret-path",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });
});
