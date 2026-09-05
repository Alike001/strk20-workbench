import { describe, expect, it } from "vitest";

import {
  DEFAULT_SCENARIO_AMOUNTS,
  SandboxWorkbenchRuntime,
  getGuidedStage,
} from "../lib/workbench/runtime";

describe("SandboxWorkbenchRuntime", () => {
  it("runs the full guided lifecycle and publishes each immutable state", async () => {
    const runtime = new SandboxWorkbenchRuntime({
      now: () => "2026-09-04T00:00:00.000Z",
    });
    const states: string[] = [];
    await runtime.runAll(DEFAULT_SCENARIO_AMOUNTS, {
      onState: (state) => states.push(getGuidedStage(state)),
    });
    const state = runtime.getState();
    expect(runtime.getStage()).toBe("complete");
    expect(state.actors.alice?.publicBalances["lab-token"]).toBe(50n);
    expect(state.actors.alice?.privateBalances["lab-token"]).toBe(30n);
    expect(state.actors.bob?.publicBalances["lab-token"]).toBe(10n);
    expect(state.actors.bob?.privateBalances["lab-token"]).toBe(10n);
    expect(states).toEqual([
      "register",
      "shield",
      "private-transfer",
      "withdraw",
      "complete",
    ]);
  });

  it("uses changed amounts instead of replaying the canonical balances", async () => {
    const runtime = new SandboxWorkbenchRuntime();
    await runtime.runAll({ shield: 40n, transfer: 15n, withdraw: 5n });
    const state = runtime.getState();
    expect(state.actors.alice?.publicBalances["lab-token"]).toBe(60n);
    expect(state.actors.alice?.privateBalances["lab-token"]).toBe(25n);
    expect(state.actors.bob?.publicBalances["lab-token"]).toBe(5n);
    expect(state.actors.bob?.privateBalances["lab-token"]).toBe(10n);
  });

  it("stops on a controlled failure and retries the identical action safely", async () => {
    const runtime = new SandboxWorkbenchRuntime();
    await runtime.runNext(DEFAULT_SCENARIO_AMOUNTS);
    const failed = await runtime.runNext(DEFAULT_SCENARIO_AMOUNTS, {
      failNext: true,
    });
    expect(failed?.error?.code).toBe("PROVER_UNAVAILABLE");
    expect(runtime.getStage()).toBe("shield");
    expect((await runtime.retry())?.outcome).toBe("succeeded");
    expect(runtime.getStage()).toBe("private-transfer");
  });

  it("hides actor registration inside the first friendly Shield step", async () => {
    const runtime = new SandboxWorkbenchRuntime();
    const result = await runtime.runGuidedStep(DEFAULT_SCENARIO_AMOUNTS);
    expect(result?.outcome).toBe("succeeded");
    expect(runtime.getStage()).toBe("private-transfer");
    expect(runtime.getState().actors.alice?.registered).toBe(true);
    expect(runtime.getState().actors.bob?.registered).toBe(true);
    expect(runtime.getState().actors.alice?.privateBalances["lab-token"]).toBe(
      50n,
    );
  });

  it("returns nothing after completion or before any retryable attempt", async () => {
    const runtime = new SandboxWorkbenchRuntime();
    expect(await runtime.retry()).toBeUndefined();
    await runtime.runAll(DEFAULT_SCENARIO_AMOUNTS);
    expect(await runtime.runNext(DEFAULT_SCENARIO_AMOUNTS)).toBeUndefined();
  });

  it("resets the controller, adapter, stage, and retry memory", async () => {
    const runtime = new SandboxWorkbenchRuntime();
    await runtime.runNext(DEFAULT_SCENARIO_AMOUNTS);
    expect(runtime.getStage()).toBe("shield");
    runtime.reset();
    expect(runtime.getStage()).toBe("register");
    expect(await runtime.retry()).toBeUndefined();
  });
});
