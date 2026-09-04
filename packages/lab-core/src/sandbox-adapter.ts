import { createLabError } from "./errors";
import {
  applySuccessfulAction,
  createCanonicalScenarioState,
  freezeScenario,
  validateAction,
} from "./scenario";
import type {
  ActionResult,
  AdapterSnapshot,
  Capability,
  CapabilityReport,
  LabAction,
  LabAdapter,
  ScenarioState,
  TransactionStatus,
} from "./types";

export type SandboxFailureKind =
  "cancelled" | "prover-unavailable" | "proof-failed";

export interface SandboxFailureInjection {
  readonly kind: SandboxFailureKind;
  readonly action?: LabAction["type"];
  readonly once?: boolean;
}

export class SandboxAdapter implements LabAdapter {
  readonly id = "strk20-sandbox";
  readonly mode = "sandbox" as const;
  #state: ScenarioState;
  #failure?: SandboxFailureInjection;
  #executionCount = 0;
  readonly #results = new Map<string, ActionResult>();
  readonly #transactions = new Set<string>();

  constructor(input?: {
    readonly initialState?: ScenarioState;
    readonly failure?: SandboxFailureInjection;
  }) {
    const initialState = input?.initialState ?? createCanonicalScenarioState();
    if (initialState.mode !== "sandbox" || initialState.network !== "SANDBOX") {
      throw new TypeError("SandboxAdapter requires a SANDBOX scenario.");
    }
    this.#state = freezeScenario(initialState);
    this.#failure = input?.failure;
  }

  setFailureInjection(failure?: SandboxFailureInjection): void {
    this.#failure = failure;
  }

  reset(state = createCanonicalScenarioState()): void {
    if (state.mode !== "sandbox" || state.network !== "SANDBOX") {
      throw new TypeError(
        "SandboxAdapter can only reset to a SANDBOX scenario.",
      );
    }
    this.#state = freezeScenario(state);
    this.#failure = undefined;
    this.#executionCount = 0;
    this.#results.clear();
    this.#transactions.clear();
  }

  async getCapabilities(): Promise<CapabilityReport> {
    const ready = (
      name: Capability["name"],
      explanation: string,
    ): Capability => ({ name, status: "ready", explanation });
    return {
      checkedAt: "2026-09-02T00:00:00.000Z",
      capabilities: [
        {
          name: "wallet-discovered",
          status: "unknown",
          explanation: "Sandbox does not require a wallet.",
        },
        {
          name: "wallet-connected",
          status: "unknown",
          explanation: "Sandbox does not connect a wallet.",
        },
        ready("chain-id-known", "The isolated SANDBOX network is selected."),
        ready("balances-readable", "Sandbox balances are held in memory."),
        ready("register-supported", "Registration is simulated locally."),
        ready("shield-supported", "Shielding is simulated locally."),
        ready(
          "private-transfer-supported",
          "Private transfer rules are simulated locally.",
        ),
        ready("withdraw-supported", "Withdrawal is simulated locally."),
        {
          name: "wallet-methods-present",
          status: "unknown",
          explanation: "Wallet methods are outside Sandbox mode.",
        },
        {
          name: "external-invoke-supported",
          status: "blocked",
          explanation:
            "The first Sandbox release does not simulate anonymizer invokes.",
        },
        ready(
          "pool-configuration-matches",
          "The fixture uses the versioned Workbench pool model.",
        ),
        {
          name: "rpc-verification-available",
          status: "unknown",
          explanation: "Sandbox does not use an RPC endpoint.",
        },
      ],
    };
  }

  async getInitialState(): Promise<AdapterSnapshot> {
    return this.#snapshot();
  }

  async execute(
    action: LabAction,
    options: Parameters<LabAdapter["execute"]>[1],
  ): Promise<ActionResult> {
    if (options.signal?.aborted) {
      return { status: "cancelled", reason: "Sandbox action was aborted." };
    }
    const previous = this.#results.get(options.idempotencyKey);
    if (previous) return previous;

    const validationError = validateAction(this.#state, action);
    if (validationError) {
      return { status: "failed", error: validationError };
    }

    options.onEvent({
      type: "proof.preparing",
      proofKind: "simulated",
      payload: {
        educationalOnly: true,
        message: "Preparing a simulated proof-shaped result.",
      },
    });

    const injected = this.#matchingFailure(action.type);
    if (injected?.kind === "cancelled") {
      const result: ActionResult = {
        status: "cancelled",
        reason: "Controlled Sandbox cancellation.",
      };
      if (injected.once !== false) this.#failure = undefined;
      return result;
    }
    if (
      injected?.kind === "prover-unavailable" ||
      injected?.kind === "proof-failed"
    ) {
      const result: ActionResult = {
        status: "failed",
        error: createLabError({
          code:
            injected.kind === "prover-unavailable"
              ? "PROVER_UNAVAILABLE"
              : "PROOF_FAILED",
          mode: "sandbox",
          network: "SANDBOX",
          phase: "preparing-proof",
        }),
      };
      if (injected.once !== false) this.#failure = undefined;
      return result;
    }

    this.#executionCount += 1;
    const suffix = deterministicId(
      `${this.#state.seed}:${this.#executionCount}:${action.type}`,
    );
    const transactionHash = `simulated:${suffix}`;
    const artifacts = artifactPayload(action, suffix);
    options.onEvent({
      type: "transaction.submitted",
      proofKind: "simulated",
      payload: { transactionHash, ...artifacts, educationalOnly: true },
    });
    options.onEvent({
      type: "transaction.confirming",
      proofKind: "simulated",
      payload: { transactionHash, confirmation: "deterministic" },
    });

    this.#state = applySuccessfulAction(this.#state, action);
    this.#transactions.add(transactionHash);
    const result: ActionResult = {
      status: "succeeded",
      proofKind: "simulated",
      transactionHash,
      evidence: {
        id: `sandbox-evidence-${suffix}`,
        source: "sandbox",
        mode: "sandbox",
        proofKind: "simulated",
        network: "SANDBOX",
        action: action.type,
        transactionHash,
        receiptStatus: "succeeded",
        poolInteraction: "not-applicable",
        createdAt: "2026-09-02T00:00:00.000Z",
      },
    };
    this.#results.set(options.idempotencyKey, result);
    return result;
  }

  async getTransactionStatus(
    transactionHash: string,
  ): Promise<TransactionStatus> {
    return {
      status: this.#transactions.has(transactionHash) ? "succeeded" : "unknown",
      transactionHash,
    };
  }

  #matchingFailure(
    action: LabAction["type"],
  ): SandboxFailureInjection | undefined {
    if (!this.#failure) return undefined;
    return !this.#failure.action || this.#failure.action === action
      ? this.#failure
      : undefined;
  }

  #snapshot(): AdapterSnapshot {
    return {
      network: "SANDBOX",
      proofKind: "simulated",
      actors: this.#state.actors,
      tokens: this.#state.tokens,
    };
  }
}

function deterministicId(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function artifactPayload(
  action: LabAction,
  suffix: string,
): Readonly<Record<string, string>> {
  if (action.type === "register") {
    return { channelId: `sim-channel-${suffix}` };
  }
  if (action.type === "shield") {
    return { createdNoteId: `sim-note-${suffix}` };
  }
  if (action.type === "private-transfer") {
    return {
      spentNullifierId: `sim-nullifier-${suffix}`,
      createdNoteId: `sim-note-${suffix}`,
    };
  }
  return { spentNullifierId: `sim-nullifier-${suffix}` };
}
