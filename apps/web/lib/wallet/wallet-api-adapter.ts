import type { STRK20_ACTION, STRK20_BALANCE_ENTRY } from "starknet";

import {
  createLabError,
  type ActionResult,
  type AdapterSnapshot,
  type Capability,
  type CapabilityReport,
  type LabAction,
  type LabAdapter,
  type LabError,
  type TransactionStatus,
} from "@strk20-workbench/lab-core";

export const REQUIRED_STRK20_WALLET_API = "0.10.3";
export const STARKNET_MAIN_CHAIN_ID = "SN_MAIN";

export interface Strk20WalletAccount {
  readonly address: string;
  strk20Balances(tokens: string[]): Promise<STRK20_BALANCE_ENTRY[]>;
  strk20PrepareInvoke(
    actions: STRK20_ACTION[],
    simulate?: boolean,
  ): Promise<unknown>;
  strk20InvokeTransaction(
    actions: STRK20_ACTION[],
  ): Promise<{ readonly transaction_hash: string }>;
}

export interface TransactionVerifier {
  getTransactionStatus(
    transactionHash: string,
    signal?: AbortSignal,
  ): Promise<TransactionStatus>;
}

export interface WalletApiAdapterOptions {
  readonly account: Strk20WalletAccount;
  readonly walletName: string;
  readonly walletApiVersions: readonly string[];
  readonly chainId: string;
  readonly snapshot: AdapterSnapshot;
  readonly verifier?: TransactionVerifier;
  readonly poolConfigurationMatches?: boolean;
  readonly now?: () => string;
}

export type PrivateBalance = Readonly<{
  token: string;
  balance: bigint;
}>;

/**
 * Real STRK20 adapter. The connected wallet keeps keys, note discovery and
 * proving behind its own permission boundary; this class never receives them.
 */
export class WalletApiAdapter implements LabAdapter {
  readonly id = "strk20-wallet-api";
  readonly mode = "real" as const;
  readonly #account: Strk20WalletAccount;
  readonly #walletName: string;
  readonly #walletApiVersions: readonly string[];
  readonly #chainId: string;
  readonly #snapshot: AdapterSnapshot;
  readonly #verifier?: TransactionVerifier;
  readonly #poolConfigurationMatches?: boolean;
  readonly #now: () => string;
  readonly #results = new Map<string, ActionResult>();

  constructor(options: WalletApiAdapterOptions) {
    if (options.snapshot.network === "SANDBOX") {
      throw new TypeError("WalletApiAdapter requires a real-network snapshot.");
    }
    this.#account = options.account;
    this.#walletName = options.walletName;
    this.#walletApiVersions = [...options.walletApiVersions];
    this.#chainId = options.chainId;
    this.#snapshot = options.snapshot;
    this.#verifier = options.verifier;
    this.#poolConfigurationMatches = options.poolConfigurationMatches;
    this.#now = options.now ?? (() => new Date().toISOString());
  }

  async getCapabilities(signal?: AbortSignal): Promise<CapabilityReport> {
    assertNotAborted(signal);
    const supported = this.#supportsRequiredApi();
    const methodsPresent = hasRequiredMethods(this.#account);
    const actionsReady = supported && methodsPresent;
    const ready = (
      name: Capability["name"],
      explanation: string,
    ): Capability => ({ name, status: "ready", explanation });
    const unavailable = (
      name: Capability["name"],
      explanation: string,
    ): Capability => ({
      name,
      status: "blocked",
      explanation,
      recoveryAction:
        "Use a privacy-enabled wallet advertising Wallet API 0.10.3 or newer, or continue in Sandbox.",
    });
    const actionCapability = (name: Capability["name"], explanation: string) =>
      actionsReady
        ? ready(name, explanation)
        : unavailable(
            name,
            "The connected wallet has not established the required STRK20 action methods.",
          );

    return {
      checkedAt: this.#now(),
      capabilities: [
        ready("wallet-discovered", `${this.#walletName} was selected.`),
        ready("wallet-connected", "The wallet approved account access."),
        isMainnetChain(this.#chainId)
          ? ready(
              "chain-id-known",
              "The wallet is connected to Starknet Mainnet.",
            )
          : {
              name: "chain-id-known",
              status: "blocked",
              explanation: `Expected Starknet Mainnet but received ${this.#chainId}.`,
              recoveryAction:
                "Switch the wallet to Starknet Mainnet and retry preflight.",
            },
        actionsReady
          ? ready(
              "wallet-methods-present",
              `Wallet API ${selectHighestWalletApiVersion(this.#walletApiVersions) ?? "unknown"} exposes the STRK20 methods.`,
            )
          : unavailable(
              "wallet-methods-present",
              `The wallet must advertise Wallet API ${REQUIRED_STRK20_WALLET_API} or newer and expose balance, prepare and invoke methods.`,
            ),
        actionCapability(
          "balances-readable",
          "Private balances can be requested deliberately with wallet consent.",
        ),
        actionCapability(
          "register-supported",
          "The wallet handles registration automatically on first STRK20 use; there is no standalone registration transaction.",
        ),
        actionCapability(
          "shield-supported",
          "The wallet can submit a STRK20 deposit action.",
        ),
        actionCapability(
          "private-transfer-supported",
          "The wallet can submit a STRK20 private transfer action.",
        ),
        actionCapability(
          "withdraw-supported",
          "The wallet can submit a STRK20 withdrawal action.",
        ),
        actionCapability(
          "external-invoke-supported",
          "The wallet API accepts STRK20 invoke actions for reviewed anonymizer helpers.",
        ),
        this.#poolConfigurationMatches === true
          ? ready(
              "pool-configuration-matches",
              "The configured pool matches the reviewed mainnet address.",
            )
          : {
              name: "pool-configuration-matches",
              status:
                this.#poolConfigurationMatches === false
                  ? "blocked"
                  : "unknown",
              explanation:
                this.#poolConfigurationMatches === false
                  ? "The configured pool does not match the reviewed mainnet address."
                  : "Pool configuration has not yet been independently verified.",
              recoveryAction:
                "Verify the configured pool before enabling a real action.",
            },
        this.#verifier
          ? ready(
              "rpc-verification-available",
              "A receipt verifier is available after wallet submission.",
            )
          : {
              name: "rpc-verification-available",
              status: "blocked",
              explanation: "No receipt verifier is configured.",
              recoveryAction:
                "Configure the allowlisted public receipt verifier before enabling real actions.",
            },
      ],
    };
  }

  async getInitialState(signal?: AbortSignal): Promise<AdapterSnapshot> {
    assertNotAborted(signal);
    return this.#snapshot;
  }

  /** Deliberate, consent-gated read. Capability detection never calls this. */
  async readPrivateBalances(
    tokens: readonly string[],
    signal?: AbortSignal,
  ): Promise<readonly PrivateBalance[]> {
    assertNotAborted(signal);
    const preflightError = this.#preflightError("awaiting-user");
    if (preflightError) throw preflightError;
    try {
      const balances = await this.#account.strk20Balances([...tokens]);
      assertNotAborted(signal);
      return balances.map((entry) => ({
        token: String(entry.token),
        balance: BigInt(entry.balance),
      }));
    } catch (cause) {
      if (signal?.aborted || isCancellation(cause)) {
        throw this.#error("WALLET_REJECTED", "awaiting-user", cause);
      }
      throw this.#classifyError(cause, "awaiting-user");
    }
  }

  async execute(
    action: LabAction,
    options: Parameters<LabAdapter["execute"]>[1],
  ): Promise<ActionResult> {
    if (options.signal?.aborted) {
      return {
        status: "cancelled",
        reason: "The action was cancelled before wallet review.",
      };
    }
    const previous = this.#results.get(options.idempotencyKey);
    if (previous) return previous;

    const preflightError = this.#preflightError("validating");
    if (preflightError) return { status: "failed", error: preflightError };

    let walletActions: STRK20_ACTION[];
    try {
      walletActions = [mapLabActionToStrk20(action, this.#snapshot)];
    } catch (cause) {
      return {
        status: "failed",
        error: this.#error(
          "INVALID_ACTION",
          "validating",
          cause,
          safeMessage(cause),
        ),
      };
    }

    options.onEvent({
      type: "action.awaiting-user",
      proofKind: "real",
      payload: { walletName: this.#walletName, action: action.type },
    });

    try {
      options.onEvent({
        type: "proof.preparing",
        proofKind: "real",
        payload: { simulate: true },
      });
      await this.#account.strk20PrepareInvoke(walletActions, true);
      assertNotAborted(options.signal);
    } catch (cause) {
      if (options.signal?.aborted || isCancellation(cause)) {
        return {
          status: "cancelled",
          reason: "Wallet proof preparation was cancelled.",
        };
      }
      return {
        status: "failed",
        error: this.#classifyError(cause, "preparing-proof"),
      };
    }

    let transactionHash: string;
    try {
      const submitted =
        await this.#account.strk20InvokeTransaction(walletActions);
      transactionHash = submitted.transaction_hash;
      if (!isTransactionHash(transactionHash)) {
        throw new TypeError("The wallet returned an invalid transaction hash.");
      }
      options.onEvent({
        type: "transaction.submitted",
        proofKind: "real",
        payload: { transactionHash },
      });
      options.onEvent({
        type: "transaction.confirming",
        proofKind: "real",
        payload: { transactionHash },
      });
    } catch (cause) {
      if (options.signal?.aborted) {
        const result: ActionResult = {
          status: "uncertain",
          error: this.#error(
            "TRANSACTION_UNCERTAIN",
            "submitting",
            cause,
            "Submission had already started when the local operation was cancelled, so its network status must be checked before retrying.",
          ),
        };
        this.#results.set(options.idempotencyKey, result);
        return result;
      }
      if (isCancellation(cause)) {
        return {
          status: "cancelled",
          reason: "Wallet submission was cancelled.",
        };
      }
      if (submissionMayBeUncertain(cause)) {
        const result: ActionResult = {
          status: "uncertain",
          error: this.#error(
            "TRANSACTION_UNCERTAIN",
            "submitting",
            cause,
            "The wallet submission did not return a transaction hash, so verify wallet activity before retrying.",
          ),
        };
        this.#results.set(options.idempotencyKey, result);
        return result;
      }
      return {
        status: "failed",
        error: this.#classifyError(cause, "submitting"),
      };
    }

    if (!this.#verifier) {
      const result: ActionResult = {
        status: "uncertain",
        transactionHash,
        error: this.#error(
          "TRANSACTION_UNCERTAIN",
          "confirming",
          undefined,
          "The wallet submitted the transaction, but no receipt verifier is configured.",
        ),
      };
      this.#results.set(options.idempotencyKey, result);
      return result;
    }

    try {
      const receipt = await this.#verifier.getTransactionStatus(
        transactionHash,
        options.signal,
      );
      if (receipt.status === "succeeded") {
        const result: ActionResult = {
          status: "succeeded",
          proofKind: "real",
          transactionHash,
        };
        this.#results.set(options.idempotencyKey, result);
        return result;
      }
      if (receipt.status === "reverted") {
        return {
          status: "failed",
          error: this.#error("TRANSACTION_REVERTED", "confirming"),
        };
      }
      const result: ActionResult = {
        status: "uncertain",
        transactionHash,
        error: this.#error(
          "TRANSACTION_UNCERTAIN",
          "confirming",
          undefined,
          "The transaction was submitted, but its final status is not visible yet.",
        ),
      };
      this.#results.set(options.idempotencyKey, result);
      return result;
    } catch (cause) {
      const result: ActionResult = {
        status: "uncertain",
        transactionHash,
        error: this.#error(
          "TRANSACTION_UNCERTAIN",
          "confirming",
          cause,
          "The transaction was submitted, but receipt verification is temporarily unavailable.",
        ),
      };
      this.#results.set(options.idempotencyKey, result);
      return result;
    }
  }

  async getTransactionStatus(
    transactionHash: string,
    signal?: AbortSignal,
  ): Promise<TransactionStatus> {
    if (!isTransactionHash(transactionHash)) {
      throw this.#error(
        "INVALID_ACTION",
        "validating",
        undefined,
        "A valid Starknet transaction hash is required.",
      );
    }
    assertNotAborted(signal);
    if (!this.#verifier) {
      throw this.#error("RPC_UNAVAILABLE", "confirming");
    }
    try {
      return await this.#verifier.getTransactionStatus(transactionHash, signal);
    } catch (cause) {
      throw this.#error("RPC_UNAVAILABLE", "confirming", cause);
    }
  }

  #supportsRequiredApi(): boolean {
    return this.#walletApiVersions.some((version) =>
      versionMeetsMinimum(version, REQUIRED_STRK20_WALLET_API),
    );
  }

  #preflightError(phase: LabError["phase"]): LabError | undefined {
    if (!isMainnetChain(this.#chainId)) {
      return this.#error("WRONG_NETWORK", phase);
    }
    if (!this.#supportsRequiredApi() || !hasRequiredMethods(this.#account)) {
      return this.#error("WALLET_UNSUPPORTED", phase);
    }
    if (this.#poolConfigurationMatches === false) {
      return this.#error(
        "INVALID_ACTION",
        phase,
        undefined,
        "The configured privacy pool does not match the reviewed mainnet pool.",
      );
    }
    return undefined;
  }

  #classifyError(cause: unknown, phase: LabError["phase"]): LabError {
    const message = safeMessage(cause).toLowerCase();
    if (isCancellation(cause))
      return this.#error("WALLET_REJECTED", phase, cause);
    if (
      message.includes("not_registered") ||
      message.includes("not registered")
    ) {
      return this.#error("NOT_REGISTERED", phase, cause);
    }
    if (message.includes("busy") || message.includes("429")) {
      return this.#error("PROVER_BUSY", phase, cause);
    }
    if (message.includes("prover") || message.includes("unavailable")) {
      return this.#error("PROVER_UNAVAILABLE", phase, cause);
    }
    if (message.includes("proof")) {
      return this.#error("PROOF_FAILED", phase, cause);
    }
    return this.#error(
      phase === "submitting" ? "SUBMISSION_FAILED" : "UNKNOWN",
      phase,
      cause,
    );
  }

  #error(
    code: Parameters<typeof createLabError>[0]["code"],
    phase: LabError["phase"],
    rawCause?: unknown,
    explanation?: string,
  ): LabError {
    return createLabError({
      code,
      mode: "real",
      network: this.#snapshot.network,
      phase,
      ...(rawCause === undefined ? {} : { rawCause }),
      ...(explanation === undefined ? {} : { explanation }),
    });
  }
}

export function mapLabActionToStrk20(
  action: LabAction,
  snapshot: AdapterSnapshot,
): STRK20_ACTION {
  if (action.type === "register") {
    throw new TypeError(
      "Registration is automatic on first STRK20 use and is not a standalone wallet action.",
    );
  }
  const token = requireAddress(action.token.id, "token");
  const amount = action.amount.toString();
  if (action.type === "shield") return { type: "deposit", token, amount };
  if (action.type === "withdraw") {
    return {
      type: "withdraw",
      token,
      amount,
      recipient: requireAddress(action.recipient, "withdrawal recipient"),
    };
  }
  const recipient = snapshot.actors[action.to]?.address ?? action.to;
  return {
    type: "transfer",
    token,
    amount,
    recipient: requireAddress(recipient, "private-transfer recipient"),
  };
}

export function isMainnetChain(chainId: string): boolean {
  if (chainId === STARKNET_MAIN_CHAIN_ID) return true;
  try {
    return BigInt(chainId) === BigInt("0x534e5f4d41494e");
  } catch {
    return false;
  }
}

function hasRequiredMethods(account: Strk20WalletAccount): boolean {
  return (
    typeof account.strk20Balances === "function" &&
    typeof account.strk20PrepareInvoke === "function" &&
    typeof account.strk20InvokeTransaction === "function"
  );
}

function requireAddress(value: string | undefined, label: string): string {
  if (!value || !/^0x[0-9a-fA-F]+$/.test(value)) {
    throw new TypeError(`A valid ${label} address is required.`);
  }
  return value;
}

function safeMessage(cause: unknown): string {
  if (cause instanceof Error && cause.message.trim()) return cause.message;
  return "The wallet request failed for an unknown reason.";
}

function isCancellation(cause: unknown): boolean {
  const message = safeMessage(cause).toLowerCase();
  return (
    (cause instanceof DOMException && cause.name === "AbortError") ||
    message.includes("reject") ||
    message.includes("denied") ||
    message.includes("cancel")
  );
}

function submissionMayBeUncertain(cause: unknown): boolean {
  const message = safeMessage(cause).toLowerCase();
  return (
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("connection")
  );
}

function numericVersion(version: string): readonly number[] | null {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version);
  return match ? match.slice(1, 4).map(Number) : null;
}

function compareNumericVersions(left: string, right: string): number {
  const leftParts = numericVersion(left);
  const rightParts = numericVersion(right);
  if (!leftParts || !rightParts) return 0;
  for (let index = 0; index < 3; index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

function versionMeetsMinimum(version: string, minimum: string): boolean {
  return (
    numericVersion(version) !== null &&
    compareNumericVersions(version, minimum) >= 0
  );
}

export function selectHighestWalletApiVersion(
  versions: readonly string[],
): string | undefined {
  return [...versions]
    .filter((version) => numericVersion(version) !== null)
    .sort((left, right) => compareNumericVersions(right, left))[0];
}

function assertNotAborted(signal?: AbortSignal): void {
  if (signal?.aborted)
    throw new DOMException("The operation was aborted.", "AbortError");
}

function isTransactionHash(value: string): boolean {
  return /^0x[0-9a-fA-F]{1,64}$/.test(value);
}
