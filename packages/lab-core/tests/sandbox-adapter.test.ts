import { describe, expect, it } from "vitest";

import {
  CANONICAL_TOKEN_ID,
  SandboxAdapter,
  ScenarioController,
  createCanonicalScenarioState,
  getBalance,
} from "../src/index";

const token = { id: CANONICAL_TOKEN_ID } as const;

describe("SandboxAdapter", () => {
  it("reports honest wallet-free capabilities and its deterministic snapshot", async () => {
    const adapter = new SandboxAdapter();
    const report = await adapter.getCapabilities();
    expect(
      report.capabilities.find((item) => item.name === "wallet-connected")
        ?.status,
    ).toBe("unknown");
    expect(
      report.capabilities.find(
        (item) => item.name === "private-transfer-supported",
      )?.status,
    ).toBe("ready");
    expect(
      report.capabilities.find(
        (item) => item.name === "external-invoke-supported",
      )?.status,
    ).toBe("blocked");
    expect((await adapter.getInitialState()).network).toBe("SANDBOX");
  });

  it("runs the canonical lifecycle through the controller", async () => {
    const initial = createCanonicalScenarioState({
      runId: "sandbox-integration",
    });
    const adapter = new SandboxAdapter({ initialState: initial });
    const controller = new ScenarioController({
      initialState: initial,
      adapter,
      now: () => "2026-09-04T00:00:00.000Z",
    });
    await controller.execute({ type: "register", actorId: "alice" });
    await controller.execute({ type: "register", actorId: "bob" });
    await controller.execute({
      type: "shield",
      actorId: "alice",
      token,
      amount: 50n,
    });
    await controller.execute({
      type: "private-transfer",
      from: "alice",
      to: "bob",
      token,
      amount: 20n,
    });
    await controller.execute({
      type: "withdraw",
      actorId: "bob",
      recipient: "0xB0B",
      token,
      amount: 10n,
    });
    const state = controller.getState();
    expect(getBalance(state, "alice", token.id, "private")).toBe(30n);
    expect(getBalance(state, "bob", token.id, "public")).toBe(10n);
    expect(state.evidence).toHaveLength(5);
    expect(
      state.evidence.every(
        (item) =>
          item.source === "sandbox" &&
          item.transactionHash?.startsWith("simulated:"),
      ),
    ).toBe(true);
  });

  it("emits deterministic note-shaped teaching identifiers", async () => {
    async function run() {
      const state = createCanonicalScenarioState({ seed: "same-seed" });
      const adapter = new SandboxAdapter({ initialState: state });
      await adapter.execute(
        { type: "register", actorId: "alice" },
        { idempotencyKey: "register", onEvent: () => undefined },
      );
      const payloads: Readonly<Record<string, unknown>>[] = [];
      await adapter.execute(
        { type: "shield", actorId: "alice", token, amount: 10n },
        {
          idempotencyKey: "shield",
          onEvent: (event) => payloads.push(event.payload ?? {}),
        },
      );
      return payloads;
    }
    expect(await run()).toEqual(await run());
    expect(JSON.stringify(await run())).toContain("sim-note-");
  });

  it("injects a one-shot prover failure and allows a safe retry with the same key", async () => {
    const adapter = new SandboxAdapter({
      failure: { kind: "prover-unavailable", action: "shield" },
    });
    await adapter.execute(
      { type: "register", actorId: "alice" },
      { idempotencyKey: "register", onEvent: () => undefined },
    );
    const action = {
      type: "shield",
      actorId: "alice",
      token,
      amount: 10n,
    } as const;
    const failed = await adapter.execute(action, {
      idempotencyKey: "shield",
      onEvent: () => undefined,
    });
    expect(failed).toMatchObject({
      status: "failed",
      error: { code: "PROVER_UNAVAILABLE" },
    });
    const retried = await adapter.execute(action, {
      idempotencyKey: "shield",
      onEvent: () => undefined,
    });
    expect(retried.status).toBe("succeeded");
    expect(
      await adapter.execute(action, {
        idempotencyKey: "shield",
        onEvent: () => undefined,
      }),
    ).toBe(retried);
  });

  it("supports cancellation, proof failure, abort, and direct prerequisite errors", async () => {
    const cancelled = new SandboxAdapter({
      failure: { kind: "cancelled", once: false },
    });
    expect(
      (
        await cancelled.execute(
          { type: "register", actorId: "alice" },
          { idempotencyKey: "cancel", onEvent: () => undefined },
        )
      ).status,
    ).toBe("cancelled");

    const proofFailure = new SandboxAdapter({
      failure: { kind: "proof-failed" },
    });
    expect(
      await proofFailure.execute(
        { type: "register", actorId: "alice" },
        { idempotencyKey: "proof", onEvent: () => undefined },
      ),
    ).toMatchObject({ status: "failed", error: { code: "PROOF_FAILED" } });

    const aborted = new AbortController();
    aborted.abort();
    expect(
      (
        await new SandboxAdapter().execute(
          { type: "register", actorId: "alice" },
          {
            signal: aborted.signal,
            idempotencyKey: "aborted",
            onEvent: () => undefined,
          },
        )
      ).status,
    ).toBe("cancelled");

    const invalid = await new SandboxAdapter().execute(
      { type: "shield", actorId: "alice", token, amount: 1n },
      { idempotencyKey: "invalid", onEvent: () => undefined },
    );
    expect(invalid).toMatchObject({
      status: "failed",
      error: { code: "NOT_REGISTERED" },
    });
  });

  it("tracks simulated statuses and resets all internal execution state", async () => {
    const adapter = new SandboxAdapter();
    const result = await adapter.execute(
      { type: "register", actorId: "alice" },
      { idempotencyKey: "register", onEvent: () => undefined },
    );
    if (result.status !== "succeeded" || !result.transactionHash)
      throw new Error("Expected Sandbox success");
    expect(
      (await adapter.getTransactionStatus(result.transactionHash)).status,
    ).toBe("succeeded");
    expect(
      (await adapter.getTransactionStatus("simulated:missing")).status,
    ).toBe("unknown");
    adapter.setFailureInjection({ kind: "cancelled" });
    adapter.reset();
    expect((await adapter.getInitialState()).actors.alice?.registered).toBe(
      false,
    );
  });

  it("rejects non-Sandbox initial and reset states", () => {
    const sandbox = createCanonicalScenarioState();
    const real = { ...sandbox, mode: "real", network: "SN_MAIN" } as const;
    expect(() => new SandboxAdapter({ initialState: real })).toThrow(
      "SANDBOX scenario",
    );
    expect(() => new SandboxAdapter().reset(real)).toThrow(
      "reset to a SANDBOX",
    );
  });
});
