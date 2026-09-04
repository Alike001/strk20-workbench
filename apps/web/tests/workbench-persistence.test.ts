import {
  SandboxAdapter,
  ScenarioController,
  createCanonicalScenarioState,
  type ScenarioState,
} from "@strk20-workbench/lab-core";
import { describe, expect, it } from "vitest";
import type { StateStorage } from "zustand/middleware";

import {
  parsePersistedSandboxScenario,
  serializeSandboxScenario,
} from "../lib/workbench/persistence";
import {
  WORKBENCH_STORAGE_KEY,
  createWorkbenchStore,
  rehydrateWorkbenchStore,
} from "../lib/workbench/store";

function memoryStorage(initial?: Record<string, string>) {
  const values = new Map(Object.entries(initial ?? {}));
  const storage: StateStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
    removeItem: (key) => void values.delete(key),
  };
  return { storage, values };
}

async function registeredAliceState(): Promise<ScenarioState> {
  const initial = createCanonicalScenarioState({ runId: "persisted-run" });
  const controller = new ScenarioController({
    initialState: initial,
    adapter: new SandboxAdapter({ initialState: initial }),
    now: () => "2026-09-04T00:00:00.000Z",
  });
  await controller.execute({ type: "register", actorId: "alice" });
  return controller.getState();
}

describe("sandbox scenario persistence", () => {
  it("round-trips bigint balances and actions through validated JSON-safe data", async () => {
    const state = await registeredAliceState();
    const serialized = serializeSandboxScenario(state);
    expect(serialized.actors.alice?.publicBalances["lab-token"]).toBe("100");
    expect(JSON.stringify(serialized)).not.toContain("100n");
    const parsed = parsePersistedSandboxScenario(serialized);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.state.actors.alice?.publicBalances["lab-token"]).toBe(100n);
    expect(parsed.state.actors.alice?.registered).toBe(true);
    expect(Object.isFrozen(parsed.state.actors.alice?.publicBalances)).toBe(
      true,
    );
  });

  it("normalizes bigint event payload values to JSON strings", () => {
    const initial = createCanonicalScenarioState();
    const withPayload: ScenarioState = {
      ...initial,
      timeline: [
        ...initial.timeline,
        {
          id: "event-bigint",
          runId: initial.runId,
          timestamp: "now",
          mode: "sandbox",
          proofKind: "simulated",
          type: "balance.changed",
          payload: { amount: 50n, ignored: undefined },
        },
      ],
    };
    const serialized = serializeSandboxScenario(withPayload);
    expect(serialized.timeline.at(-1)?.payload).toEqual({ amount: "50" });
  });

  it("rejects real state and malformed saved state", () => {
    const sandbox = createCanonicalScenarioState();
    expect(() =>
      serializeSandboxScenario({
        ...sandbox,
        mode: "real",
        network: "SN_MAIN",
        proofKind: "real",
      }),
    ).toThrow("Only simulated SANDBOX");
    const invalid = parsePersistedSandboxScenario({ mode: "real" });
    expect(invalid.success).toBe(false);
    if (!invalid.success) expect(invalid.issues.length).toBeGreaterThan(0);
  });
});

describe("versioned workbench store", () => {
  it("waits for explicit hydration and restores only validated Sandbox state", async () => {
    const savedState = await registeredAliceState();
    const raw = JSON.stringify({
      state: {
        sandboxSnapshot: serializeSandboxScenario(savedState),
        selectedMode: "sandbox",
        advancedDetails: true,
      },
      version: 1,
    });
    const memory = memoryStorage({ [WORKBENCH_STORAGE_KEY]: raw });
    const store = createWorkbenchStore({ storage: memory.storage });
    expect(store.getState().hydrated).toBe(false);
    expect(store.getState().scenario.actors.alice?.registered).toBe(false);
    await rehydrateWorkbenchStore(store);
    expect(store.getState().hydrated).toBe(true);
    expect(store.getState().scenario.actors.alice?.registered).toBe(true);
    expect(store.getState().advancedDetails).toBe(true);
  });

  it("persists safe preferences and Sandbox snapshots but excludes wallet sessions", async () => {
    const memory = memoryStorage();
    const store = createWorkbenchStore({ storage: memory.storage });
    await rehydrateWorkbenchStore(store);
    store.getState().setScenario(await registeredAliceState());
    store.getState().setSelectedMode("real");
    store.getState().setSelectedStepId("step-1");
    store.getState().setAdvancedDetails(true);
    store.getState().setWalletSession({
      walletId: "ready",
      accountAddress: "0xprivate-session-address",
      network: "SN_MAIN",
    });
    const raw = memory.values.get(WORKBENCH_STORAGE_KEY) ?? "";
    expect(raw).toContain("sandboxSnapshot");
    expect(raw).toContain('"lab-token":"100"');
    expect(raw).not.toContain("walletSession");
    expect(raw).not.toContain("0xprivate-session-address");
    expect(raw).not.toContain('"scenario"');
  });

  it("preserves wallet session metadata when resetting only the Sandbox", async () => {
    const memory = memoryStorage();
    const reset = createCanonicalScenarioState({ runId: "reset-run" });
    const store = createWorkbenchStore({
      storage: memory.storage,
      initialScenario: await registeredAliceState(),
      createResetScenario: () => reset,
    });
    store.getState().setSelectedMode("real");
    store.getState().setWalletSession({
      walletId: "ready",
      accountAddress: "0xabc",
      network: "SN_MAIN",
    });
    store.getState().resetSandbox();
    expect(store.getState().scenario.runId).toBe("reset-run");
    expect(store.getState().scenario.actors.alice?.registered).toBe(false);
    expect(store.getState().selectedMode).toBe("real");
    expect(store.getState().walletSession?.accountAddress).toBe("0xabc");
  });

  it("reports incompatible current data and keeps the safe initial scenario", async () => {
    const memory = memoryStorage({
      [WORKBENCH_STORAGE_KEY]: JSON.stringify({
        state: { sandboxSnapshot: { mode: "real" } },
        version: 1,
      }),
    });
    const store = createWorkbenchStore({ storage: memory.storage });
    await rehydrateWorkbenchStore(store);
    expect(store.getState().hydrated).toBe(true);
    expect(store.getState().hydrationError?.code).toBe(
      "SAVED_STATE_INCOMPATIBLE",
    );
    expect(store.getState().scenario.mode).toBe("sandbox");
  });

  it("migrates the supported version-zero shape", async () => {
    const state = await registeredAliceState();
    const memory = memoryStorage({
      [WORKBENCH_STORAGE_KEY]: JSON.stringify({
        state: {
          sandboxScenario: serializeSandboxScenario(state),
          selectedStepId: "legacy-step",
          advancedDetails: true,
        },
        version: 0,
      }),
    });
    const store = createWorkbenchStore({ storage: memory.storage });
    await rehydrateWorkbenchStore(store);
    expect(store.getState().hydrationError).toBeUndefined();
    expect(store.getState().scenario.actors.alice?.registered).toBe(true);
    expect(store.getState().selectedStepId).toBe("legacy-step");
  });

  it("rejects real initial and reset scenarios", () => {
    const sandbox = createCanonicalScenarioState();
    const real = {
      ...sandbox,
      mode: "real",
      network: "SN_MAIN",
      proofKind: "real",
    } as const;
    expect(() => createWorkbenchStore({ initialScenario: real })).toThrow(
      "simulated SANDBOX",
    );
    const store = createWorkbenchStore({ createResetScenario: () => real });
    expect(() => store.getState().resetSandbox()).toThrow("simulated SANDBOX");
  });
});
