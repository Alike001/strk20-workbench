import { z } from "zod";

import type {
  CuratedEvidenceEntry,
  EvidenceManifestSummary,
  PublicEvidenceResponse,
  VerifiedReceipt,
} from "./types";

export const OFFICIAL_STRK20_POOL =
  "0x040337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a";
export const REQUIRED_MAINNET_TRANSACTIONS = 3;

const felt = z.string().regex(/^0x[0-9a-fA-F]{1,64}$/);
const secureUrlOrEmpty = z.union([
  z.literal(""),
  z.string().url().startsWith("https://"),
]);

const submissionSchema = z.object({
  transactions: z.array(felt),
  contracts: z.array(felt),
  demo_video: secureUrlOrEmpty,
  demo_url: secureUrlOrEmpty,
});

const curatedSchema = z.object({
  records: z.array(
    z.object({
      action: z.enum(["shield", "private-transfer", "withdraw"]),
      transaction_hash: felt,
      created_at: z.string().datetime({ offset: true }),
    }),
  ),
});

type ReceiptVerifier = Readonly<{
  verify(transactionHash: string): Promise<VerifiedReceipt>;
}>;

export async function buildPublicEvidence(input: {
  readonly submission: unknown;
  readonly curated: unknown;
  readonly verifier?: ReceiptVerifier;
}): Promise<PublicEvidenceResponse> {
  const submissionResult = submissionSchema.safeParse(input.submission);
  const curatedResult = curatedSchema.safeParse(input.curated);
  const issues: string[] = [];

  if (!submissionResult.success) {
    issues.push("strk20.json is invalid and no evidence was published.");
  }
  if (!curatedResult.success) {
    issues.push("The curated evidence metadata is invalid.");
  }

  const submission = submissionResult.success
    ? submissionResult.data
    : { transactions: [], contracts: [], demo_video: "", demo_url: "" };
  const curatedEntries = curatedResult.success
    ? toCuratedEntries(curatedResult.data.records)
    : [];
  const manifestHashes = uniqueHashes(submission.transactions, issues);
  const entries = matchCuratedEntries(curatedEntries, manifestHashes, issues);
  const records = await Promise.all(
    entries.map(async (entry) => {
      let verification: VerifiedReceipt = {
        transactionHash: entry.transactionHash,
        receiptStatus: "unknown",
        poolInteraction: "not-verified",
      };
      if (input.verifier) {
        try {
          verification = await input.verifier.verify(entry.transactionHash);
        } catch {
          issues.push(
            `Receipt verification is unavailable for ${entry.transactionHash}.`,
          );
        }
      }
      return {
        id: `mainnet-${normalizeFelt(entry.transactionHash)}`,
        source: "project-curated" as const,
        mode: "real" as const,
        proofKind: "real" as const,
        network: "SN_MAIN" as const,
        action: entry.action,
        transactionHash: entry.transactionHash,
        receiptStatus: verification.receiptStatus,
        poolInteraction: verification.poolInteraction,
        explorerUrl: `https://voyager.online/tx/${entry.transactionHash}`,
        createdAt: entry.createdAt,
      };
    }),
  );

  return {
    officialPool: OFFICIAL_STRK20_POOL,
    requiredTransactions: REQUIRED_MAINNET_TRANSACTIONS,
    rpcConfigured: Boolean(input.verifier),
    records,
    issues,
    manifest: toManifestSummary(submission),
  };
}

export function isUsableRpcUrl(value: string | undefined): value is string {
  if (!value || value.includes("replace-me")) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function toCuratedEntries(
  entries: readonly {
    action: CuratedEvidenceEntry["action"];
    transaction_hash: string;
    created_at: string;
  }[],
): CuratedEvidenceEntry[] {
  return entries.map((entry) => ({
    action: entry.action,
    transactionHash: entry.transaction_hash,
    createdAt: entry.created_at,
  }));
}

function uniqueHashes(hashes: readonly string[], issues: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const hash of hashes) {
    const normalized = normalizeFelt(hash);
    if (seen.has(normalized)) {
      issues.push(`Duplicate transaction hash ignored: ${hash}.`);
      continue;
    }
    seen.add(normalized);
    unique.push(hash);
  }
  return unique;
}

function matchCuratedEntries(
  entries: readonly CuratedEvidenceEntry[],
  manifestHashes: readonly string[],
  issues: string[],
): CuratedEvidenceEntry[] {
  const byHash = new Map<string, CuratedEvidenceEntry>();
  for (const entry of entries) {
    const normalized = normalizeFelt(entry.transactionHash);
    if (byHash.has(normalized)) {
      issues.push(
        `Duplicate curated metadata ignored: ${entry.transactionHash}.`,
      );
      continue;
    }
    byHash.set(normalized, entry);
  }

  const matched: CuratedEvidenceEntry[] = [];
  for (const hash of manifestHashes) {
    const entry = byHash.get(normalizeFelt(hash));
    if (!entry) {
      issues.push(`No reviewed action metadata exists for ${hash}.`);
      continue;
    }
    matched.push(entry);
  }
  for (const entry of byHash.values()) {
    if (
      !manifestHashes.some(
        (hash) => normalizeFelt(hash) === normalizeFelt(entry.transactionHash),
      )
    ) {
      issues.push(
        `Curated metadata is not listed in strk20.json: ${entry.transactionHash}.`,
      );
    }
  }
  return matched;
}

function normalizeFelt(value: string): string {
  return BigInt(value).toString(16);
}

function toManifestSummary(submission: {
  transactions: readonly string[];
  contracts: readonly string[];
  demo_video: string;
  demo_url: string;
}): EvidenceManifestSummary {
  return {
    transactions: submission.transactions,
    contracts: submission.contracts,
    demoVideo: submission.demo_video,
    demoUrl: submission.demo_url,
  };
}
