import type {
  EvidenceRecord,
  ExecutionMode,
  Network,
  ProofKind,
} from "./types";

const STARKNET_HASH = /^0x[0-9a-fA-F]{1,64}$/;

export function isGenuineExecution(
  mode: ExecutionMode,
  proofKind: ProofKind,
): boolean {
  return mode === "real" && proofKind === "real";
}

export function isQualifyingMainnetEvidence(record: EvidenceRecord): boolean {
  return (
    record.mode === "real" &&
    record.proofKind === "real" &&
    record.network === "SN_MAIN" &&
    record.receiptStatus === "succeeded" &&
    record.poolInteraction === "verified" &&
    typeof record.transactionHash === "string" &&
    STARKNET_HASH.test(record.transactionHash) &&
    typeof record.explorerUrl === "string" &&
    record.explorerUrl.startsWith("https://")
  );
}

export function isEvidenceConsistentWithExecution(
  record: EvidenceRecord,
  execution: {
    readonly mode: ExecutionMode;
    readonly proofKind: ProofKind;
    readonly network: Network;
    readonly action: EvidenceRecord["action"];
  },
): boolean {
  return (
    record.mode === execution.mode &&
    record.proofKind === execution.proofKind &&
    record.network === execution.network &&
    record.action === execution.action &&
    (execution.mode !== "sandbox" || record.source === "sandbox")
  );
}

export function executionTruth(input: {
  readonly mode: ExecutionMode;
  readonly proofKind: ProofKind;
  readonly network: Network;
}): "simulated" | "genuine-mainnet" | "real-unverified" {
  if (input.mode === "sandbox" || input.proofKind === "simulated")
    return "simulated";
  if (
    input.mode === "real" &&
    input.proofKind === "real" &&
    input.network === "SN_MAIN"
  )
    return "genuine-mainnet";
  return "real-unverified";
}
