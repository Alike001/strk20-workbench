import type { VerifiedReceipt } from "./types";

type RpcEvent = Readonly<{ from_address?: unknown }>;

type RpcReceipt = Readonly<{
  finality_status?: unknown;
  execution_status?: unknown;
  events?: unknown;
}>;

type RpcResponse = Readonly<{
  result?: RpcReceipt;
  error?: Readonly<{ code?: unknown; message?: unknown }>;
}>;

export class RpcEvidenceVerifier {
  readonly #endpoint: string;
  readonly #expectedPool: string;
  readonly #timeoutMs: number;
  readonly #fetch: typeof fetch;

  constructor(input: {
    readonly endpoint: string;
    readonly expectedPool: string;
    readonly timeoutMs?: number;
    readonly fetch?: typeof fetch;
  }) {
    this.#endpoint = input.endpoint;
    this.#expectedPool = input.expectedPool;
    this.#timeoutMs = input.timeoutMs ?? 12_000;
    this.#fetch = input.fetch ?? fetch;
  }

  async verify(
    transactionHash: string,
    signal?: AbortSignal,
  ): Promise<VerifiedReceipt> {
    const timeout = AbortSignal.timeout(this.#timeoutMs);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
    const response = await this.#fetch(this.#endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "strk20-evidence",
        method: "starknet_getTransactionReceipt",
        params: [transactionHash],
      }),
      cache: "no-store",
      signal: combined,
    });
    if (!response.ok) {
      throw new Error(`Evidence verifier returned HTTP ${response.status}.`);
    }
    const payload = (await response.json()) as RpcResponse;
    if (payload.error) {
      if (isNotFound(payload.error)) {
        return unverified(transactionHash, "unknown");
      }
      throw new Error("The Starknet RPC could not read this receipt.");
    }

    const receiptStatus = mapReceiptStatus(payload.result);
    const events = Array.isArray(payload.result?.events)
      ? (payload.result.events as RpcEvent[])
      : [];
    const poolInteraction =
      receiptStatus === "succeeded" &&
      events.some(
        (event) =>
          typeof event.from_address === "string" &&
          sameFelt(event.from_address, this.#expectedPool),
      )
        ? "verified"
        : "not-verified";

    return { transactionHash, receiptStatus, poolInteraction };
  }
}

function mapReceiptStatus(
  receipt: RpcReceipt | undefined,
): VerifiedReceipt["receiptStatus"] {
  if (!receipt) return "unknown";
  if (receipt.execution_status === "REVERTED") return "reverted";
  if (
    receipt.execution_status === "SUCCEEDED" &&
    (receipt.finality_status === "ACCEPTED_ON_L2" ||
      receipt.finality_status === "ACCEPTED_ON_L1")
  ) {
    return "succeeded";
  }
  if (
    receipt.finality_status === "RECEIVED" ||
    receipt.finality_status === "PRE_CONFIRMED"
  ) {
    return "pending";
  }
  return "unknown";
}

function sameFelt(left: string, right: string): boolean {
  try {
    return BigInt(left) === BigInt(right);
  } catch {
    return false;
  }
}

function isNotFound(error: NonNullable<RpcResponse["error"]>): boolean {
  return (
    error.code === 29 ||
    (typeof error.message === "string" &&
      error.message.toLowerCase().includes("transaction hash not found"))
  );
}

function unverified(
  transactionHash: string,
  receiptStatus: VerifiedReceipt["receiptStatus"],
): VerifiedReceipt {
  return {
    transactionHash,
    receiptStatus,
    poolInteraction: "not-verified",
  };
}
