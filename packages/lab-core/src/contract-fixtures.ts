import { createLabError } from "./errors";
import type {
  ActionResult,
  AdapterEvent,
  AdapterSnapshot,
  CapabilityReport,
  LabAction,
  LabAdapter,
  TransactionStatus,
} from "./types";

export interface AdapterFixture extends LabAdapter {
  readonly calls: readonly {
    readonly action: LabAction;
    readonly idempotencyKey: string;
  }[];
}

export function createAdapterContractFixture(input: {
  readonly mode: "sandbox" | "real";
  readonly snapshot: AdapterSnapshot;
  readonly result?: ActionResult | ((action: LabAction) => ActionResult);
  readonly events?: readonly AdapterEvent[];
  readonly capabilities?: CapabilityReport;
}): AdapterFixture {
  const calls: { action: LabAction; idempotencyKey: string }[] = [];
  const defaultResult: ActionResult = {
    status: "succeeded",
    proofKind: input.mode === "sandbox" ? "simulated" : "real",
  };
  return {
    id: `contract-fixture-${input.mode}`,
    mode: input.mode,
    get calls() {
      return calls;
    },
    async getCapabilities() {
      return (
        input.capabilities ?? {
          checkedAt: "2026-09-02T00:00:00.000Z",
          capabilities: [],
        }
      );
    },
    async getInitialState() {
      return input.snapshot;
    },
    async execute(action, options) {
      calls.push({ action, idempotencyKey: options.idempotencyKey });
      for (const event of input.events ?? []) options.onEvent(event);
      return typeof input.result === "function"
        ? input.result(action)
        : (input.result ?? defaultResult);
    },
    async getTransactionStatus(transactionHash): Promise<TransactionStatus> {
      if (!transactionHash)
        throw createLabError({
          code: "INVALID_ACTION",
          mode: input.mode,
          network: input.snapshot.network,
          phase: "validating",
        });
      return { status: "succeeded", transactionHash };
    },
  };
}
