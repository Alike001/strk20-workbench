import type {
  AdapterEvent,
  LabAction,
  LabAdapter,
  LabError,
  TransactionStatus,
} from "@strk20-workbench/lab-core";

export type RealActionPhase =
  | "idle"
  | "review"
  | "awaiting-wallet"
  | "preparing-proof"
  | "submitting"
  | "confirming"
  | "succeeded"
  | "cancelled"
  | "failed"
  | "uncertain";

export type RealActionState = Readonly<{
  phase: RealActionPhase;
  action?: LabAction;
  idempotencyKey?: string;
  transactionHash?: string;
  error?: LabError;
  message?: string;
}>;

type RealActionAdapter = Pick<LabAdapter, "execute" | "getTransactionStatus">;

/**
 * UI-facing safety controller for one reviewed real-wallet action.
 * It never stores keys, notes, balances, or wallet-private response data.
 */
export class RealActionController {
  readonly #adapter: RealActionAdapter;
  readonly #onChange: (state: RealActionState) => void;
  #state: RealActionState = Object.freeze({ phase: "idle" });
  #inFlight?: Promise<RealActionState>;

  constructor(input: {
    readonly adapter: RealActionAdapter;
    readonly onChange?: (state: RealActionState) => void;
  }) {
    this.#adapter = input.adapter;
    this.#onChange = input.onChange ?? (() => undefined);
  }

  getState(): RealActionState {
    return this.#state;
  }

  review(action: LabAction, idempotencyKey: string): RealActionState {
    if (!idempotencyKey.trim()) {
      throw new TypeError("A real action requires an idempotency key.");
    }
    if (isBusy(this.#state.phase)) {
      throw new Error("Wait for the current wallet request to finish.");
    }
    if (this.#state.phase === "uncertain") {
      throw new Error(
        "Check the submitted transaction before reviewing another action.",
      );
    }
    return this.#set({ phase: "review", action, idempotencyKey });
  }

  cancelReview(): RealActionState {
    if (this.#state.phase !== "review") return this.#state;
    return this.#set({
      ...this.#state,
      phase: "cancelled",
      message: "The action was cancelled before any wallet request.",
    });
  }

  dismiss(): RealActionState {
    if (isBusy(this.#state.phase) || this.#state.phase === "uncertain") {
      throw new Error(
        "Finish checking the submitted action before closing this flow.",
      );
    }
    return this.#set({ phase: "idle" });
  }

  confirm(signal?: AbortSignal): Promise<RealActionState> {
    if (this.#inFlight) return this.#inFlight;
    if (
      this.#state.phase !== "review" ||
      !this.#state.action ||
      !this.#state.idempotencyKey
    ) {
      return Promise.reject(
        new Error("Review the real action before asking the wallet."),
      );
    }

    const action = this.#state.action;
    const idempotencyKey = this.#state.idempotencyKey;
    this.#set({ ...this.#state, phase: "awaiting-wallet" });
    this.#inFlight = this.#adapter
      .execute(action, {
        signal,
        idempotencyKey,
        onEvent: (event) => this.#consume(event),
      })
      .then((result) => {
        if (result.status === "succeeded") {
          return this.#set({
            ...this.#state,
            phase: "succeeded",
            transactionHash: result.transactionHash,
            error: undefined,
            message: "The mainnet receipt succeeded.",
          });
        }
        if (result.status === "cancelled") {
          return this.#set({
            ...this.#state,
            phase: "cancelled",
            message: result.reason,
          });
        }
        if (result.status === "uncertain") {
          return this.#set({
            ...this.#state,
            phase: "uncertain",
            transactionHash: result.transactionHash,
            error: result.error,
            message:
              "Submission may have happened. Check the receipt before retrying.",
          });
        }
        return this.#set({
          ...this.#state,
          phase: "failed",
          error: result.error,
          message: result.error.explanation,
        });
      })
      .catch((cause: unknown) =>
        this.#set({
          ...this.#state,
          phase: "failed",
          message:
            cause instanceof Error
              ? cause.message
              : "The wallet action could not finish.",
        }),
      )
      .finally(() => {
        this.#inFlight = undefined;
      });
    return this.#inFlight;
  }

  retryReview(): RealActionState {
    if (this.#state.phase !== "failed" || !this.#state.action) {
      throw new Error(
        "Only a failed pre-submission action can be reviewed again.",
      );
    }
    return this.#set({
      phase: "review",
      action: this.#state.action,
      idempotencyKey: this.#state.idempotencyKey,
    });
  }

  async checkSubmittedTransaction(
    signal?: AbortSignal,
  ): Promise<RealActionState> {
    if (this.#state.phase !== "uncertain" || !this.#state.transactionHash) {
      throw new Error("There is no submitted transaction to check.");
    }
    const transactionHash = this.#state.transactionHash;
    this.#set({ ...this.#state, phase: "confirming" });
    let receipt: TransactionStatus;
    try {
      receipt = await this.#adapter.getTransactionStatus(
        transactionHash,
        signal,
      );
    } catch {
      return this.#set({
        ...this.#state,
        phase: "uncertain",
        message:
          "Confirmation is still unavailable. The action was not resubmitted.",
      });
    }
    if (receipt.status === "succeeded") {
      return this.#set({
        ...this.#state,
        phase: "succeeded",
        error: undefined,
        message: "The mainnet receipt succeeded.",
      });
    }
    if (receipt.status === "reverted") {
      return this.#set({
        ...this.#state,
        phase: "failed",
        message: "The submitted transaction reverted on Starknet.",
      });
    }
    return this.#set({
      ...this.#state,
      phase: "uncertain",
      message:
        "The transaction is submitted, but confirmation is not visible yet.",
    });
  }

  #consume(event: AdapterEvent): void {
    const phaseByEvent: Partial<Record<AdapterEvent["type"], RealActionPhase>> =
      {
        "action.awaiting-user": "awaiting-wallet",
        "proof.preparing": "preparing-proof",
        "transaction.submitted": "submitting",
        "transaction.confirming": "confirming",
      };
    const phase = phaseByEvent[event.type];
    if (!phase) return;
    const transactionHash =
      typeof event.payload?.transactionHash === "string"
        ? event.payload.transactionHash
        : this.#state.transactionHash;
    this.#set({ ...this.#state, phase, transactionHash });
  }

  #set(state: RealActionState): RealActionState {
    this.#state = Object.freeze({ ...state });
    this.#onChange(this.#state);
    return this.#state;
  }
}

function isBusy(phase: RealActionPhase): boolean {
  return [
    "awaiting-wallet",
    "preparing-proof",
    "submitting",
    "confirming",
  ].includes(phase);
}
