import type {
  TransactionStatus,
  TransactionStatus as LabTransactionStatus,
} from "@strk20-workbench/lab-core";

import type { TransactionVerifier } from "./wallet-api-adapter";

type RpcStatusResult = Readonly<{
  finality_status?: string;
  execution_status?: string;
}>;

type RpcResponse = Readonly<{
  result?: RpcStatusResult;
  error?: Readonly<{ code?: number; message?: string }>;
}>;

export class RpcTransactionVerifier implements TransactionVerifier {
  readonly #endpoint: string;
  readonly #timeoutMs: number;
  readonly #fetch: typeof fetch;

  constructor(input?: {
    readonly endpoint?: string;
    readonly timeoutMs?: number;
    readonly fetch?: typeof fetch;
  }) {
    this.#endpoint = input?.endpoint ?? "/api/starknet";
    this.#timeoutMs = input?.timeoutMs ?? 20_000;
    this.#fetch = input?.fetch ?? fetch;
  }

  async getTransactionStatus(
    transactionHash: string,
    signal?: AbortSignal,
  ): Promise<TransactionStatus> {
    const timeout = AbortSignal.timeout(this.#timeoutMs);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
    const response = await this.#fetch(this.#endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "starknet_getTransactionStatus",
        params: [transactionHash],
      }),
      cache: "no-store",
      signal: combined,
    });
    if (!response.ok) {
      throw new Error(`Receipt verifier returned HTTP ${response.status}.`);
    }
    const payload = (await response.json()) as RpcResponse;
    if (payload.error) {
      if (isNotFound(payload.error)) {
        return { status: "unknown", transactionHash };
      }
      throw new Error(
        "The Starknet RPC could not read the transaction status.",
      );
    }
    return {
      status: mapRpcStatus(payload.result),
      transactionHash,
    } satisfies LabTransactionStatus;
  }
}

function mapRpcStatus(
  result: RpcStatusResult | undefined,
): TransactionStatus["status"] {
  if (!result) return "unknown";
  if (result.execution_status === "REVERTED") return "reverted";
  if (
    result.execution_status === "SUCCEEDED" &&
    (result.finality_status === "ACCEPTED_ON_L2" ||
      result.finality_status === "ACCEPTED_ON_L1")
  ) {
    return "succeeded";
  }
  if (
    result.finality_status === "RECEIVED" ||
    result.finality_status === "PRE_CONFIRMED"
  ) {
    return "pending";
  }
  return "unknown";
}

function isNotFound(error: NonNullable<RpcResponse["error"]>): boolean {
  return (
    error.code === 29 ||
    error.message?.toLowerCase().includes("transaction hash not found") === true
  );
}
