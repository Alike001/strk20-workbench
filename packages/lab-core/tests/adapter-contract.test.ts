import { describe, expect, it } from "vitest";

import {
  createAdapterContractFixture,
  createCanonicalScenarioState,
} from "../src/index";

describe("adapter contract fixture", () => {
  it("exercises snapshot, capabilities, function results, events, and status", async () => {
    const state = createCanonicalScenarioState();
    const seen: string[] = [];
    const adapter = createAdapterContractFixture({
      mode: "sandbox",
      snapshot: {
        network: state.network,
        proofKind: state.proofKind,
        actors: state.actors,
        tokens: state.tokens,
      },
      capabilities: {
        checkedAt: "now",
        capabilities: [
          { name: "register-supported", status: "ready", explanation: "Ready" },
        ],
      },
      events: [{ type: "capability.checked" }],
      result: (action) => ({ status: "cancelled", reason: action.type }),
    });
    expect((await adapter.getCapabilities()).capabilities[0]?.status).toBe(
      "ready",
    );
    expect((await adapter.getInitialState()).network).toBe("SANDBOX");
    const result = await adapter.execute(
      { type: "register", actorId: "alice" },
      { idempotencyKey: "one", onEvent: (event) => seen.push(event.type) },
    );
    expect(result).toEqual({ status: "cancelled", reason: "register" });
    expect(seen).toEqual(["capability.checked"]);
    expect(adapter.calls[0]?.idempotencyKey).toBe("one");
    expect(await adapter.getTransactionStatus("0x1")).toEqual({
      status: "succeeded",
      transactionHash: "0x1",
    });
    await expect(adapter.getTransactionStatus("")).rejects.toMatchObject({
      code: "INVALID_ACTION",
    });
  });
});
