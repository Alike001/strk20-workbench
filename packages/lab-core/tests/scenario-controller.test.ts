import { describe, expect, it } from "vitest";

import {
  CANONICAL_TOKEN_ID,
  ScenarioController,
  createAdapterContractFixture,
  createCanonicalScenarioState,
  createInitialState,
  createLabError,
  getBalance,
  totalValue,
  type ActionResult,
  type LabAction,
} from "../src/index";

const token = { id: CANONICAL_TOKEN_ID } as const;
const fixedNow = () => "2026-09-04T12:00:00.000Z";

function setup(
  result?: ActionResult | ((action: LabAction) => ActionResult),
  events = [],
) {
  const initial = createCanonicalScenarioState({ runId: "test-run" });
  const adapter = createAdapterContractFixture({
    mode: "sandbox",
    snapshot: {
      network: initial.network,
      proofKind: initial.proofKind,
      actors: initial.actors,
      tokens: initial.tokens,
    },
    result,
    events,
  });
  return {
    initial,
    adapter,
    controller: new ScenarioController({
      initialState: initial,
      adapter,
      now: fixedNow,
    }),
  };
}

async function runCanonical(controller: ScenarioController) {
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
  return controller.getState();
}

describe("canonical scenario controller", () => {
  it("produces the documented balances and conserves value", async () => {
    const { controller } = setup();
    const state = await runCanonical(controller);
    expect(getBalance(state, "alice", token.id, "public")).toBe(50n);
    expect(getBalance(state, "alice", token.id, "private")).toBe(30n);
    expect(getBalance(state, "bob", token.id, "public")).toBe(10n);
    expect(getBalance(state, "bob", token.id, "private")).toBe(10n);
    expect(totalValue(state)).toBe(100n);
    expect(state.steps.every((step) => step.status === "succeeded")).toBe(true);
    expect(state.activeStepId).toBeUndefined();
    expect(Object.isFrozen(state.actors.alice?.publicBalances)).toBe(true);
  });

  it("forwards normalized progress events into one canonical timeline", async () => {
    const { controller } = setup(undefined, [
      { type: "action.awaiting-user", payload: { prompt: "review" } },
      { type: "proof.preparing", proofKind: "simulated" },
      {
        type: "transaction.submitted",
        payload: { transactionHash: "simulated" },
      },
      { type: "transaction.confirming" },
      { type: "capability.checked", payload: { capability: "register" } },
    ]);
    await controller.execute({ type: "register", actorId: "alice" });
    expect(controller.getState().timeline.map((event) => event.type)).toEqual(
      expect.arrayContaining([
        "action.awaiting-user",
        "proof.preparing",
        "transaction.submitted",
        "transaction.confirming",
        "capability.checked",
        "action.succeeded",
      ]),
    );
  });

  it("deduplicates a succeeded idempotency key without a second adapter call", async () => {
    const { controller, adapter } = setup();
    const action = { type: "register", actorId: "alice" } as const;
    expect(
      (await controller.execute(action, { idempotencyKey: "register-alice" }))
        .outcome,
    ).toBe("succeeded");
    expect(
      (await controller.execute(action, { idempotencyKey: "register-alice" }))
        .outcome,
    ).toBe("deduplicated");
    expect(adapter.calls).toHaveLength(1);
  });

  it("records cancellation without changing balances or creating evidence", async () => {
    const { controller, initial } = setup({
      status: "cancelled",
      reason: "User closed wallet",
    });
    const result = await controller.execute({
      type: "register",
      actorId: "alice",
    });
    expect(result.outcome).toBe("cancelled");
    expect(result.state.steps[0]?.status).toBe("cancelled");
    expect(result.state.evidence).toHaveLength(0);
    expect(totalValue(result.state)).toBe(totalValue(initial));
  });

  it("keeps adapter failures distinct and preserves their stable code", async () => {
    const initial = createCanonicalScenarioState();
    const error = createLabError({
      code: "PROVER_UNAVAILABLE",
      mode: "sandbox",
      network: "SANDBOX",
      phase: "preparing-proof",
    });
    const { controller } = setup({ status: "failed", error });
    const result = await controller.execute({
      type: "register",
      actorId: "alice",
    });
    expect(result).toMatchObject({
      outcome: "failed",
      error: { code: "PROVER_UNAVAILABLE" },
    });
    expect(result.state.actors.alice?.registered).toBe(
      initial.actors.alice?.registered,
    );
  });

  it("blocks all new actions after an uncertain submission and never resubmits its key", async () => {
    const { controller, adapter } = setup({
      status: "uncertain",
      transactionHash: "0x123",
    });
    const action = { type: "register", actorId: "alice" } as const;
    expect(
      (await controller.execute(action, { idempotencyKey: "uncertain-key" }))
        .outcome,
    ).toBe("uncertain");
    expect(
      (await controller.execute(action, { idempotencyKey: "uncertain-key" }))
        .outcome,
    ).toBe("uncertain");
    const blocked = await controller.execute(
      { type: "register", actorId: "bob" },
      { idempotencyKey: "new-key" },
    );
    expect(blocked.error?.code).toBe("TRANSACTION_UNCERTAIN");
    expect(adapter.calls).toHaveLength(1);
  });

  it("normalizes thrown adapter errors and rejects real proof claims in Sandbox", async () => {
    const throwing = setup(() => {
      throw new Error("adapter exploded");
    });
    const failed = await throwing.controller.execute({
      type: "register",
      actorId: "alice",
    });
    expect(failed.error).toMatchObject({
      code: "UNKNOWN",
      rawCause: { message: "adapter exploded" },
    });

    const falseProof = setup({ status: "succeeded", proofKind: "real" });
    const rejected = await falseProof.controller.execute({
      type: "register",
      actorId: "alice",
    });
    expect(rejected.error).toMatchObject({ code: "INVALID_ACTION" });
    expect(rejected.state.actors.alice?.registered).toBe(false);
  });

  it("rejects an adapter whose mode differs from the scenario", () => {
    const initial = createCanonicalScenarioState();
    const adapter = createAdapterContractFixture({
      mode: "real",
      snapshot: {
        network: "SN_MAIN",
        proofKind: "real",
        actors: initial.actors,
        tokens: initial.tokens,
      },
    });
    expect(
      () => new ScenarioController({ initialState: initial, adapter }),
    ).toThrow("must match");
  });

  it("records matching real evidence and rejects mismatched evidence", async () => {
    const base = createCanonicalScenarioState();
    const real = createInitialState({
      runId: "real-run",
      seed: "real",
      mode: "real",
      network: "SN_MAIN",
      proofKind: "real",
      actors: base.actors,
      tokens: base.tokens,
      now: fixedNow(),
    });
    const goodEvidence = {
      id: "good",
      source: "wallet-session",
      mode: "real",
      proofKind: "real",
      network: "SN_MAIN",
      action: "register",
      transactionHash: "0xabc",
      receiptStatus: "succeeded",
      poolInteraction: "verified",
      explorerUrl: "https://voyager.online/tx/0xabc",
      createdAt: fixedNow(),
    } as const;
    const goodAdapter = createAdapterContractFixture({
      mode: "real",
      snapshot: {
        network: real.network,
        proofKind: real.proofKind,
        actors: real.actors,
        tokens: real.tokens,
      },
      result: {
        status: "succeeded",
        proofKind: "real",
        evidence: goodEvidence,
      },
    });
    const good = await new ScenarioController({
      initialState: real,
      adapter: goodAdapter,
      now: fixedNow,
    }).execute({ type: "register", actorId: "alice" });
    expect(good.state.evidence).toEqual([goodEvidence]);

    const badAdapter = createAdapterContractFixture({
      mode: "real",
      snapshot: {
        network: real.network,
        proofKind: real.proofKind,
        actors: real.actors,
        tokens: real.tokens,
      },
      result: {
        status: "succeeded",
        proofKind: "real",
        evidence: { ...goodEvidence, action: "shield" },
      },
    });
    const bad = await new ScenarioController({
      initialState: real,
      adapter: badAdapter,
      now: fixedNow,
    }).execute({ type: "register", actorId: "alice" });
    expect(bad.error?.code).toBe("INVALID_ACTION");
    expect(bad.state.evidence).toHaveLength(0);
  });
});

describe("action validation", () => {
  it("requires registration and positive known-token amounts", async () => {
    const { controller, adapter } = setup();
    const beforeRegistration = await controller.execute({
      type: "shield",
      actorId: "alice",
      token,
      amount: 1n,
    });
    expect(beforeRegistration.error?.code).toBe("NOT_REGISTERED");
    const zero = await controller.execute({
      type: "shield",
      actorId: "alice",
      token,
      amount: 0n,
    });
    expect(zero.error?.code).toBe("INVALID_ACTION");
    const unknownToken = await controller.execute({
      type: "shield",
      actorId: "alice",
      token: { id: "unknown" },
      amount: 1n,
    });
    expect(unknownToken.error?.code).toBe("INVALID_ACTION");
    expect(adapter.calls).toHaveLength(0);
  });

  it("rejects malformed runtime amounts and empty withdrawal recipients", async () => {
    const malformed = setup();
    const malformedAction = {
      type: "shield",
      actorId: "alice",
      token,
      amount: 1.5,
    } as unknown as LabAction;
    expect(
      (await malformed.controller.execute(malformedAction)).error?.code,
    ).toBe("INVALID_ACTION");

    const withdrawal = setup();
    await withdrawal.controller.execute({ type: "register", actorId: "bob" });
    expect(
      (
        await withdrawal.controller.execute({
          type: "withdraw",
          actorId: "bob",
          recipient: "  ",
          token,
          amount: 1n,
        })
      ).error?.code,
    ).toBe("INVALID_ACTION");
  });

  it("rejects unknown, repeated, and self-directed actor actions", async () => {
    const { controller } = setup();
    expect(
      (await controller.execute({ type: "register", actorId: "unknown" })).error
        ?.code,
    ).toBe("INVALID_ACTION");
    await controller.execute({ type: "register", actorId: "alice" });
    expect(
      (await controller.execute({ type: "register", actorId: "alice" })).error
        ?.code,
    ).toBe("INVALID_ACTION");
    expect(
      (
        await controller.execute({
          type: "private-transfer",
          from: "alice",
          to: "alice",
          token,
          amount: 1n,
        })
      ).error?.code,
    ).toBe("INVALID_ACTION");
  });

  it("rejects unregistered recipients and excessive public/private spends", async () => {
    const first = setup();
    await first.controller.execute({ type: "register", actorId: "alice" });
    expect(
      (
        await first.controller.execute({
          type: "shield",
          actorId: "alice",
          token,
          amount: 101n,
        })
      ).error?.code,
    ).toBe("INSUFFICIENT_PUBLIC_BALANCE");
    await first.controller.execute({
      type: "shield",
      actorId: "alice",
      token,
      amount: 50n,
    });
    expect(
      (
        await first.controller.execute({
          type: "private-transfer",
          from: "alice",
          to: "bob",
          token,
          amount: 1n,
        })
      ).error?.code,
    ).toBe("NOT_REGISTERED");

    const second = setup();
    await second.controller.execute({ type: "register", actorId: "bob" });
    expect(
      (
        await second.controller.execute({
          type: "withdraw",
          actorId: "bob",
          recipient: "0xB0B",
          token,
          amount: 1n,
        })
      ).error?.code,
    ).toBe("INSUFFICIENT_PRIVATE_BALANCE");
  });
});
