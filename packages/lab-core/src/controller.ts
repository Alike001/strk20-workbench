import { createLabError } from "./errors";
import { isEvidenceConsistentWithExecution } from "./evidence";
import {
  appendEvent,
  appendStep,
  applySuccessfulAction,
  createEvent,
  finalizeState,
  freezeScenario,
  updateStep,
  validateAction,
} from "./scenario";
import type {
  ActionResult,
  AdapterEvent,
  LabAction,
  LabAdapter,
  LabError,
  LabEventType,
  ScenarioState,
  StepStatus,
} from "./types";

export type ControllerOutcome =
  "succeeded" | "cancelled" | "failed" | "uncertain" | "deduplicated";
export interface ControllerResult {
  readonly outcome: ControllerOutcome;
  readonly state: ScenarioState;
  readonly stepId?: string;
  readonly error?: LabError;
}
export interface ExecuteOptions {
  readonly idempotencyKey?: string;
  readonly signal?: AbortSignal;
}

export class ScenarioController {
  readonly #adapter: LabAdapter;
  readonly #now: () => string;
  #state: ScenarioState;

  constructor(input: {
    readonly initialState: ScenarioState;
    readonly adapter: LabAdapter;
    readonly now?: () => string;
  }) {
    if (input.initialState.mode !== input.adapter.mode)
      throw new TypeError("Scenario mode must match adapter mode.");
    this.#state = freezeScenario(input.initialState);
    this.#adapter = input.adapter;
    this.#now = input.now ?? (() => new Date().toISOString());
  }

  getState(): ScenarioState {
    return this.#state;
  }

  async execute(
    action: LabAction,
    options: ExecuteOptions = {},
  ): Promise<ControllerResult> {
    const idempotencyKey =
      options.idempotencyKey ??
      `${this.#state.runId}:${this.#state.steps.length + 1}:${action.type}`;
    const prior = this.#state.steps.find(
      (step) => step.idempotencyKey === idempotencyKey,
    );
    if (prior?.status === "succeeded")
      return { outcome: "deduplicated", state: this.#state, stepId: prior.id };
    if (prior?.status === "uncertain")
      return {
        outcome: "uncertain",
        state: this.#state,
        stepId: prior.id,
        error: prior.error,
      };

    const stepId = `${this.#state.runId}:step:${this.#state.steps.length + 1}`;
    const timestamp = this.#now();
    const validationError = validateAction(this.#state, action, stepId);
    this.#state = appendStep(this.#state, {
      id: stepId,
      action,
      idempotencyKey,
      status: validationError ? "failed" : "validating",
      createdAt: timestamp,
      updatedAt: timestamp,
      error: validationError,
    });
    this.#append("action.validation-started", stepId, { action: action.type });
    if (validationError) {
      this.#append("action.failed", stepId, { code: validationError.code });
      this.#state = finalizeState({
        state: this.#state,
        error: validationError,
      });
      return {
        outcome: "failed",
        state: this.#state,
        stepId,
        error: validationError,
      };
    }

    let result: ActionResult;
    try {
      result = await this.#adapter.execute(action, {
        signal: options.signal,
        idempotencyKey,
        onEvent: (event) => this.#consumeAdapterEvent(stepId, event),
      });
    } catch (cause) {
      result = {
        status: "failed",
        error: createLabError({
          code: "UNKNOWN",
          mode: this.#state.mode,
          network: this.#state.network,
          phase: this.#stepStatus(stepId),
          stepId,
          rawCause: cause,
        }),
      };
    }
    return this.#finalizeResult(stepId, action, result);
  }

  #consumeAdapterEvent(stepId: string, event: AdapterEvent): void {
    const statusByEvent: Partial<Record<AdapterEvent["type"], StepStatus>> = {
      "action.awaiting-user": "awaiting-user",
      "proof.preparing": "preparing-proof",
      "transaction.submitted": "submitting",
      "transaction.confirming": "confirming",
    };
    const status = statusByEvent[event.type];
    const timestamp = this.#now();
    if (status)
      this.#state = updateStep(this.#state, stepId, {
        status,
        updatedAt: timestamp,
      });
    this.#state = appendEvent(
      this.#state,
      createEvent({
        state: this.#state,
        type: event.type,
        timestamp,
        stepId,
        proofKind: event.proofKind,
        payload: event.payload,
      }),
    );
  }

  #finalizeResult(
    stepId: string,
    action: LabAction,
    result: ActionResult,
  ): ControllerResult {
    const timestamp = this.#now();
    if (result.status === "succeeded") {
      if (this.#state.mode === "sandbox" && result.proofKind !== "simulated") {
        return this.#finishFailure(
          stepId,
          createLabError({
            code: "INVALID_ACTION",
            mode: this.#state.mode,
            network: this.#state.network,
            phase: "failed",
            stepId,
            explanation: "A Sandbox adapter cannot report a real proof.",
          }),
          timestamp,
        );
      }
      if (
        result.evidence &&
        !isEvidenceConsistentWithExecution(result.evidence, {
          mode: this.#state.mode,
          proofKind: result.proofKind,
          network: this.#state.network,
          action: action.type,
        })
      ) {
        return this.#finishFailure(
          stepId,
          createLabError({
            code: "INVALID_ACTION",
            mode: this.#state.mode,
            network: this.#state.network,
            phase: "failed",
            stepId,
            explanation: "Adapter evidence does not match the executed action.",
          }),
          timestamp,
        );
      }
      this.#state = applySuccessfulAction(this.#state, action);
      this.#state = updateStep(this.#state, stepId, {
        status: "succeeded",
        updatedAt: timestamp,
        transactionHash: result.transactionHash,
      });
      this.#append("balance.changed", stepId, { action: action.type });
      this.#append("privacy.fact-recorded", stepId, { action: action.type });
      this.#append("action.succeeded", stepId, { action: action.type });
      this.#state = finalizeState({
        state: this.#state,
        proofKind: result.proofKind,
        evidence: result.evidence,
      });
      return { outcome: "succeeded", state: this.#state, stepId };
    }
    if (result.status === "cancelled") {
      this.#state = updateStep(this.#state, stepId, {
        status: "cancelled",
        updatedAt: timestamp,
      });
      this.#append("action.cancelled", stepId, { reason: result.reason });
      this.#state = finalizeState({ state: this.#state });
      return { outcome: "cancelled", state: this.#state, stepId };
    }
    if (result.status === "uncertain") {
      const error =
        result.error ??
        createLabError({
          code: "TRANSACTION_UNCERTAIN",
          mode: this.#state.mode,
          network: this.#state.network,
          phase: "uncertain",
          stepId,
        });
      this.#state = updateStep(this.#state, stepId, {
        status: "uncertain",
        updatedAt: timestamp,
        transactionHash: result.transactionHash,
        error,
      });
      this.#append("transaction.uncertain", stepId, {
        transactionHash: result.transactionHash,
      });
      this.#state = finalizeState({ state: this.#state, error });
      return { outcome: "uncertain", state: this.#state, stepId, error };
    }
    return this.#finishFailure(stepId, result.error, timestamp);
  }

  #finishFailure(
    stepId: string,
    error: LabError,
    timestamp: string,
  ): ControllerResult {
    this.#state = updateStep(this.#state, stepId, {
      status: "failed",
      updatedAt: timestamp,
      error,
    });
    this.#append("action.failed", stepId, { code: error.code });
    this.#state = finalizeState({ state: this.#state, error });
    return { outcome: "failed", state: this.#state, stepId, error };
  }

  #append(
    type: LabEventType,
    stepId: string,
    payload: Readonly<Record<string, unknown>>,
  ): void {
    this.#state = appendEvent(
      this.#state,
      createEvent({
        state: this.#state,
        type,
        timestamp: this.#now(),
        stepId,
        payload,
      }),
    );
  }

  #stepStatus(stepId: string): StepStatus {
    return (
      this.#state.steps.find((step) => step.id === stepId)?.status ?? "failed"
    );
  }
}
