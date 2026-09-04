import type {
  ExecutionMode,
  LabError,
  LabErrorCode,
  Network,
  StepStatus,
} from "./types";

interface ErrorCopy {
  readonly title: string;
  readonly explanation: string;
  readonly nextAction: string;
  readonly retryable: boolean;
}

const ERROR_COPY: Record<LabErrorCode, ErrorCopy> = {
  INVALID_ACTION: {
    title: "This action is not valid yet",
    explanation: "The action does not satisfy the current scenario rules.",
    nextAction: "Check the amount and complete the required earlier step.",
    retryable: false,
  },
  NOT_REGISTERED: {
    title: "Private account not registered",
    explanation:
      "This actor must register before holding or receiving a private balance.",
    nextAction: "Register the required actor, then try again.",
    retryable: false,
  },
  INSUFFICIENT_PUBLIC_BALANCE: {
    title: "Not enough public balance",
    explanation: "The public balance is smaller than the requested amount.",
    nextAction: "Use a smaller amount or fund the public balance.",
    retryable: false,
  },
  INSUFFICIENT_PRIVATE_BALANCE: {
    title: "Not enough private balance",
    explanation: "The shielded balance is smaller than the requested amount.",
    nextAction: "Use a smaller amount or shield more tokens first.",
    retryable: false,
  },
  WALLET_NOT_FOUND: {
    title: "No supported wallet found",
    explanation: "The browser did not expose a compatible Starknet wallet.",
    nextAction: "Install or enable a supported wallet, or continue in Sandbox.",
    retryable: true,
  },
  WALLET_UNSUPPORTED: {
    title: "Wallet privacy methods unavailable",
    explanation:
      "The connected wallet does not advertise the STRK20 methods this action needs.",
    nextAction: "Use a supported privacy wallet or continue in Sandbox.",
    retryable: false,
  },
  WALLET_REJECTED: {
    title: "Request cancelled in wallet",
    explanation: "The wallet request was rejected or closed without approval.",
    nextAction: "Review the action and approve it when ready.",
    retryable: true,
  },
  WRONG_NETWORK: {
    title: "Wrong network",
    explanation:
      "The connected wallet is not on the network required for this action.",
    nextAction:
      "Switch to the requested Starknet network and run the preflight again.",
    retryable: true,
  },
  DISCOVERY_STALE: {
    title: "Private balance discovery is stale",
    explanation:
      "The wallet could not confirm that its private-note view is current.",
    nextAction: "Refresh private balances before creating another action.",
    retryable: true,
  },
  PROVER_BUSY: {
    title: "Proof service is busy",
    explanation: "The proof service cannot accept this request right now.",
    nextAction: "Wait briefly, then retry with the same action.",
    retryable: true,
  },
  PROVER_UNAVAILABLE: {
    title: "Proof service unavailable",
    explanation: "The proof service could not be reached.",
    nextAction:
      "Check service status and retry later; Sandbox remains available.",
    retryable: true,
  },
  PROOF_FAILED: {
    title: "Proof creation failed",
    explanation: "A valid private-transaction proof could not be produced.",
    nextAction: "Refresh private state before retrying the action.",
    retryable: true,
  },
  SUBMISSION_FAILED: {
    title: "Transaction was not submitted",
    explanation:
      "The transaction failed before a reliable network submission was recorded.",
    nextAction: "Correct the reported problem, then retry.",
    retryable: true,
  },
  TRANSACTION_REVERTED: {
    title: "Transaction reverted",
    explanation: "Starknet rejected the submitted transaction.",
    nextAction: "Inspect the receipt and correct the action before retrying.",
    retryable: false,
  },
  TRANSACTION_UNCERTAIN: {
    title: "Transaction status is uncertain",
    explanation:
      "A transaction may already exist, so sending another could duplicate the action.",
    nextAction: "Resolve the existing transaction hash before retrying.",
    retryable: false,
  },
  RPC_UNAVAILABLE: {
    title: "Network verification unavailable",
    explanation: "The public RPC could not confirm the transaction state.",
    nextAction: "Retry receipt verification without resubmitting the action.",
    retryable: true,
  },
  SAVED_STATE_INCOMPATIBLE: {
    title: "Saved sandbox state is incompatible",
    explanation: "The saved data cannot be safely loaded by this version.",
    nextAction: "Reset the local Sandbox state.",
    retryable: false,
  },
  UNKNOWN: {
    title: "Unexpected error",
    explanation:
      "The action stopped for a reason the workbench could not classify.",
    nextAction:
      "Open advanced details, then retry only if no transaction was submitted.",
    retryable: false,
  },
};

const SECRET_KEY_PATTERN =
  /key|secret|token|authorization|password|credential|rpc|url/i;

export function sanitizeRawCause(value: unknown): unknown {
  if (value instanceof Error)
    return { name: value.name, message: value.message };
  if (Array.isArray(value)) return value.map(sanitizeRawCause);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !SECRET_KEY_PATTERN.test(key))
        .map(([key, child]) => [key, sanitizeRawCause(child)]),
    );
  }
  return value;
}

export function createLabError(input: {
  readonly code: LabErrorCode;
  readonly mode: ExecutionMode;
  readonly network: Network;
  readonly phase: StepStatus;
  readonly stepId?: string;
  readonly rawCause?: unknown;
  readonly explanation?: string;
}): LabError {
  const copy = ERROR_COPY[input.code];
  return Object.freeze({
    code: input.code,
    title: copy.title,
    explanation: input.explanation ?? copy.explanation,
    nextAction: copy.nextAction,
    retryable: copy.retryable,
    phase: input.phase,
    stepId: input.stepId,
    mode: input.mode,
    network: input.network,
    ...(input.rawCause === undefined
      ? {}
      : { rawCause: sanitizeRawCause(input.rawCause) }),
  });
}
