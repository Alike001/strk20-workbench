import type { EvidenceRecord } from "@strk20-workbench/lab-core";

export type CuratedEvidenceAction = Extract<
  EvidenceRecord["action"],
  "shield" | "private-transfer" | "withdraw"
>;

export type CuratedEvidenceEntry = Readonly<{
  action: CuratedEvidenceAction;
  transactionHash: string;
  createdAt: string;
}>;

export type EvidenceManifestSummary = Readonly<{
  transactions: readonly string[];
  contracts: readonly string[];
  demoVideo: string;
  demoUrl: string;
}>;

export type PublicEvidenceResponse = Readonly<{
  officialPool: string;
  requiredTransactions: number;
  rpcConfigured: boolean;
  records: readonly EvidenceRecord[];
  issues: readonly string[];
  manifest: EvidenceManifestSummary;
}>;

export type VerifiedReceipt = Readonly<{
  transactionHash: string;
  receiptStatus: NonNullable<EvidenceRecord["receiptStatus"]>;
  poolInteraction: NonNullable<EvidenceRecord["poolInteraction"]>;
}>;
