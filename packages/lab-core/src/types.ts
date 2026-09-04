export type ActorId = string;
export type TokenId = string;
export type ExecutionMode = "sandbox" | "real";
export type ProofKind = "simulated" | "real" | "unknown";
export type Network = "SANDBOX" | "SN_MAIN" | "SN_SEPOLIA" | "UNKNOWN";

export interface TokenRef {
  readonly id: TokenId;
}

export type LabAction =
  | { readonly type: "register"; readonly actorId: ActorId }
  | {
      readonly type: "shield";
      readonly actorId: ActorId;
      readonly token: TokenRef;
      readonly amount: bigint;
    }
  | {
      readonly type: "private-transfer";
      readonly from: ActorId;
      readonly to: ActorId;
      readonly token: TokenRef;
      readonly amount: bigint;
    }
  | {
      readonly type: "withdraw";
      readonly actorId: ActorId;
      readonly recipient: string;
      readonly token: TokenRef;
      readonly amount: bigint;
    };

export type StepStatus =
  | "idle"
  | "validating"
  | "awaiting-user"
  | "preparing-proof"
  | "submitting"
  | "confirming"
  | "succeeded"
  | "cancelled"
  | "failed"
  | "uncertain";

export interface ActorState {
  readonly id: ActorId;
  readonly name: string;
  readonly address: string;
  readonly registered: boolean;
  readonly publicBalances: Readonly<Record<TokenId, bigint>>;
  readonly privateBalances: Readonly<Record<TokenId, bigint>>;
}

export interface TokenState {
  readonly id: TokenId;
  readonly symbol: string;
  readonly decimals: number;
  readonly fictional: boolean;
}

export interface ScenarioStep {
  readonly id: string;
  readonly action: LabAction;
  readonly idempotencyKey: string;
  readonly status: StepStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly transactionHash?: string;
  readonly error?: LabError;
}

export type LabEventType =
  | "scenario.created"
  | "capability.checked"
  | "action.validation-started"
  | "action.awaiting-user"
  | "proof.preparing"
  | "transaction.submitted"
  | "transaction.confirming"
  | "balance.changed"
  | "privacy.fact-recorded"
  | "action.succeeded"
  | "action.cancelled"
  | "action.failed"
  | "transaction.uncertain"
  | "evidence.verified";

export interface LabEvent {
  readonly id: string;
  readonly runId: string;
  readonly stepId?: string;
  readonly timestamp: string;
  readonly mode: ExecutionMode;
  readonly proofKind: ProofKind;
  readonly type: LabEventType;
  readonly payload: Readonly<Record<string, unknown>>;
}

export type LabErrorCode =
  | "INVALID_ACTION"
  | "NOT_REGISTERED"
  | "INSUFFICIENT_PUBLIC_BALANCE"
  | "INSUFFICIENT_PRIVATE_BALANCE"
  | "WALLET_NOT_FOUND"
  | "WALLET_UNSUPPORTED"
  | "WALLET_REJECTED"
  | "WRONG_NETWORK"
  | "DISCOVERY_STALE"
  | "PROVER_BUSY"
  | "PROVER_UNAVAILABLE"
  | "PROOF_FAILED"
  | "SUBMISSION_FAILED"
  | "TRANSACTION_REVERTED"
  | "TRANSACTION_UNCERTAIN"
  | "RPC_UNAVAILABLE"
  | "SAVED_STATE_INCOMPATIBLE"
  | "UNKNOWN";

export interface LabError {
  readonly code: LabErrorCode;
  readonly title: string;
  readonly explanation: string;
  readonly nextAction: string;
  readonly retryable: boolean;
  readonly phase: StepStatus;
  readonly stepId?: string;
  readonly mode: ExecutionMode;
  readonly network: Network;
  readonly rawCause?: unknown;
}

export interface EvidenceRecord {
  readonly id: string;
  readonly source: "sandbox" | "wallet-session" | "project-curated";
  readonly mode: ExecutionMode;
  readonly proofKind: ProofKind;
  readonly network: Network;
  readonly action: LabAction["type"] | "anonymizer-invoke";
  readonly transactionHash?: string;
  readonly receiptStatus?: "succeeded" | "reverted" | "pending" | "unknown";
  readonly poolInteraction?: "verified" | "not-verified" | "not-applicable";
  readonly explorerUrl?: string;
  readonly createdAt: string;
}

export interface PrivacyFact {
  readonly field: string;
  readonly visibility: "public" | "private" | "conditional";
  readonly explanation: string;
  readonly technicalBasis: string;
}

export interface ScenarioState {
  readonly schemaVersion: number;
  readonly runId: string;
  readonly seed: string;
  readonly mode: ExecutionMode;
  readonly network: Network;
  readonly proofKind: ProofKind;
  readonly actors: Readonly<Record<ActorId, ActorState>>;
  readonly tokens: Readonly<Record<TokenId, TokenState>>;
  readonly steps: readonly ScenarioStep[];
  readonly timeline: readonly LabEvent[];
  readonly activeStepId?: string;
  readonly lastError?: LabError;
  readonly evidence: readonly EvidenceRecord[];
}

export type CapabilityName =
  | "wallet-discovered"
  | "wallet-connected"
  | "chain-id-known"
  | "wallet-methods-present"
  | "balances-readable"
  | "register-supported"
  | "shield-supported"
  | "private-transfer-supported"
  | "withdraw-supported"
  | "external-invoke-supported"
  | "pool-configuration-matches"
  | "rpc-verification-available";

export interface Capability {
  readonly name: CapabilityName;
  readonly status: "ready" | "missing" | "blocked" | "unknown";
  readonly explanation: string;
  readonly technicalDetail?: string;
  readonly recoveryAction?: string;
}

export interface CapabilityReport {
  readonly checkedAt: string;
  readonly capabilities: readonly Capability[];
}

export interface AdapterSnapshot {
  readonly network: Network;
  readonly proofKind: ProofKind;
  readonly actors: Readonly<Record<ActorId, ActorState>>;
  readonly tokens: Readonly<Record<TokenId, TokenState>>;
}

export interface AdapterEvent {
  readonly type:
    | "capability.checked"
    | "action.awaiting-user"
    | "proof.preparing"
    | "transaction.submitted"
    | "transaction.confirming";
  readonly proofKind?: ProofKind;
  readonly payload?: Readonly<Record<string, unknown>>;
}

export type ActionResult =
  | {
      readonly status: "succeeded";
      readonly proofKind: ProofKind;
      readonly transactionHash?: string;
      readonly evidence?: EvidenceRecord;
    }
  | { readonly status: "cancelled"; readonly reason: string }
  | { readonly status: "failed"; readonly error: LabError }
  | {
      readonly status: "uncertain";
      readonly transactionHash?: string;
      readonly error?: LabError;
    };

export interface TransactionStatus {
  readonly status: "pending" | "succeeded" | "reverted" | "unknown";
  readonly transactionHash: string;
}

export interface LabAdapter {
  readonly id: string;
  readonly mode: ExecutionMode;
  getCapabilities(signal?: AbortSignal): Promise<CapabilityReport>;
  getInitialState(signal?: AbortSignal): Promise<AdapterSnapshot>;
  execute(
    action: LabAction,
    options: {
      readonly signal?: AbortSignal;
      readonly onEvent: (event: AdapterEvent) => void;
      readonly idempotencyKey: string;
    },
  ): Promise<ActionResult>;
  getTransactionStatus(
    transactionHash: string,
    signal?: AbortSignal,
  ): Promise<TransactionStatus>;
}

export interface PersistedSandboxState {
  readonly schemaVersion: number;
  readonly savedAt: string;
  readonly mode: "sandbox";
  readonly scenario: unknown;
}

export interface CompatibilitySummary {
  readonly product: "STRK20 Workbench";
  readonly sandboxRequiresWallet: false;
  readonly realRoute: "Wallet API";
}
