import {
  CANONICAL_TOKEN_ID,
  SandboxAdapter,
  ScenarioController,
  createCanonicalScenarioState,
  type ControllerResult,
  type LabAction,
  type ScenarioState,
} from "@strk20-workbench/lab-core";

export interface ScenarioAmounts {
  readonly shield: bigint;
  readonly transfer: bigint;
  readonly withdraw: bigint;
}

export const DEFAULT_SCENARIO_AMOUNTS: ScenarioAmounts = Object.freeze({
  shield: 50n,
  transfer: 20n,
  withdraw: 10n,
});

export type GuidedStage =
  "register" | "shield" | "private-transfer" | "withdraw" | "complete";

export interface GuidedRunOptions {
  readonly failNext?: boolean;
  readonly onState?: (state: ScenarioState) => void;
}

export class SandboxWorkbenchRuntime {
  #adapter: SandboxAdapter;
  #controller: ScenarioController;
  #lastAttempt?: {
    readonly action: LabAction;
    readonly idempotencyKey: string;
  };
  readonly #now: () => string;

  constructor(input?: {
    readonly initialState?: ScenarioState;
    readonly now?: () => string;
  }) {
    const state = input?.initialState ?? createCanonicalScenarioState();
    this.#now = input?.now ?? (() => new Date().toISOString());
    this.#adapter = new SandboxAdapter({ initialState: state });
    this.#controller = new ScenarioController({
      initialState: state,
      adapter: this.#adapter,
      now: this.#now,
    });
  }

  getState(): ScenarioState {
    return this.#controller.getState();
  }

  getStage(): GuidedStage {
    return getGuidedStage(this.getState());
  }

  async runNext(
    amounts: ScenarioAmounts,
    options: GuidedRunOptions = {},
  ): Promise<ControllerResult | undefined> {
    const actions = actionsForStage(this.getState(), amounts);
    let latest: ControllerResult | undefined;
    for (const action of actions) {
      if (options.failNext) {
        this.#adapter.setFailureInjection({
          kind: "prover-unavailable",
          action: action.type,
        });
      }
      const idempotencyKey = `${this.getState().runId}:guided:${this.getStage()}:${actionKey(action)}`;
      this.#lastAttempt = { action, idempotencyKey };
      latest = await this.#controller.execute(action, { idempotencyKey });
      options.onState?.(latest.state);
      if (latest.outcome !== "succeeded") return latest;
    }
    return latest;
  }

  async runAll(
    amounts: ScenarioAmounts,
    options: GuidedRunOptions = {},
  ): Promise<ControllerResult | undefined> {
    let latest: ControllerResult | undefined;
    let shouldFail = options.failNext;
    while (this.getStage() !== "complete") {
      latest = await this.runGuidedStep(amounts, {
        failNext: shouldFail,
        onState: options.onState,
      });
      shouldFail = false;
      if (!latest || latest.outcome !== "succeeded") break;
    }
    return latest;
  }

  async runGuidedStep(
    amounts: ScenarioAmounts,
    options: GuidedRunOptions = {},
  ): Promise<ControllerResult | undefined> {
    if (this.getStage() === "register") {
      const registration = await this.runNext(amounts, {
        onState: options.onState,
      });
      if (!registration || registration.outcome !== "succeeded") {
        return registration;
      }
    }
    return this.runNext(amounts, options);
  }

  async retry(
    onState?: (state: ScenarioState) => void,
  ): Promise<ControllerResult | undefined> {
    if (!this.#lastAttempt) return undefined;
    const result = await this.#controller.execute(this.#lastAttempt.action, {
      idempotencyKey: this.#lastAttempt.idempotencyKey,
    });
    onState?.(result.state);
    return result;
  }

  reset(state = createCanonicalScenarioState()): ScenarioState {
    this.#adapter = new SandboxAdapter({ initialState: state });
    this.#controller = new ScenarioController({
      initialState: state,
      adapter: this.#adapter,
      now: this.#now,
    });
    this.#lastAttempt = undefined;
    return this.getState();
  }
}

export function getGuidedStage(state: ScenarioState): GuidedStage {
  if (!state.actors.alice?.registered || !state.actors.bob?.registered) {
    return "register";
  }
  const succeeded = new Set(
    state.steps
      .filter((step) => step.status === "succeeded")
      .map((step) => step.action.type),
  );
  if (!succeeded.has("shield")) return "shield";
  if (!succeeded.has("private-transfer")) return "private-transfer";
  if (!succeeded.has("withdraw")) return "withdraw";
  return "complete";
}

function actionsForStage(
  state: ScenarioState,
  amounts: ScenarioAmounts,
): readonly LabAction[] {
  const token = { id: CANONICAL_TOKEN_ID } as const;
  const stage = getGuidedStage(state);
  if (stage === "register") {
    return [
      ...(state.actors.alice?.registered
        ? []
        : [{ type: "register", actorId: "alice" } as const]),
      ...(state.actors.bob?.registered
        ? []
        : [{ type: "register", actorId: "bob" } as const]),
    ];
  }
  if (stage === "shield") {
    return [
      {
        type: "shield",
        actorId: "alice",
        token,
        amount: amounts.shield,
      },
    ];
  }
  if (stage === "private-transfer") {
    return [
      {
        type: "private-transfer",
        from: "alice",
        to: "bob",
        token,
        amount: amounts.transfer,
      },
    ];
  }
  if (stage === "withdraw") {
    return [
      {
        type: "withdraw",
        actorId: "bob",
        recipient: state.actors.bob?.address ?? "",
        token,
        amount: amounts.withdraw,
      },
    ];
  }
  return [];
}

function actionKey(action: LabAction): string {
  if (action.type === "register") return `${action.type}:${action.actorId}`;
  if (action.type === "private-transfer") {
    return `${action.type}:${action.from}:${action.to}:${action.amount.toString()}`;
  }
  return `${action.type}:${action.actorId}:${action.amount.toString()}`;
}
