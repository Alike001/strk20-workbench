"use client";

import {
  isQualifyingMainnetEvidence,
  type EvidenceRecord,
} from "@strk20-workbench/lab-core";
import { useEffect, useState } from "react";

import { EvidenceReceiptCard } from "../evidence-receipt";
import { SubmissionReadinessPanel } from "../submission-readiness";
import type { PublicEvidenceResponse } from "../../lib/evidence";
import styles from "./evidence-experience.module.css";

type LoadState =
  | Readonly<{ status: "loading" }>
  | Readonly<{ status: "failed"; message: string }>
  | Readonly<{ status: "ready"; response: PublicEvidenceResponse }>;

export function EvidenceExperience() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    void loadPublicEvidence(controller.signal).then(
      (response) => setState({ status: "ready", response }),
      () =>
        setState({
          status: "failed",
          message:
            "Public evidence could not be checked. No transaction is being treated as verified.",
        }),
    );
    return () => controller.abort();
  }, []);

  if (state.status === "loading") {
    return (
      <section className={styles.notice} role="status" aria-live="polite">
        <span>Public verification</span>
        <h2>Checking repository evidence…</h2>
        <p>
          Reading checked-in hashes and verifying their public Starknet
          receipts. Nothing is submitted from this page.
        </p>
      </section>
    );
  }
  if (state.status === "failed") {
    return (
      <section className={styles.notice} role="alert">
        <span>Verification unavailable</span>
        <h2>No evidence was assumed.</h2>
        <p>{state.message}</p>
      </section>
    );
  }
  return <EvidenceResults response={state.response} />;
}

export function EvidenceResults({
  response,
}: Readonly<{ response: PublicEvidenceResponse }>) {
  const records = response.records.filter(isPublicMainnetRecord);
  const verifiedCount = records.filter(isQualifyingMainnetEvidence).length;

  return (
    <div className={styles.results}>
      <section
        className={styles.summary}
        aria-labelledby="evidence-summary-title"
      >
        <div>
          <span>Live qualification gate</span>
          <h2 id="evidence-summary-title">
            {verifiedCount} of {response.requiredTransactions} verified
          </h2>
          <p>
            Only final Starknet Mainnet receipts with an event emitted by the
            reviewed STRK20 pool count here. Checked-in hashes are not trusted
            automatically.
          </p>
        </div>
        <dl>
          <div>
            <dt>Repository hashes</dt>
            <dd>{response.manifest.transactions.length}</dd>
          </div>
          <div>
            <dt>RPC receipt check</dt>
            <dd>{response.rpcConfigured ? "Available" : "Not configured"}</dd>
          </div>
          <div>
            <dt>Duplicate counting</dt>
            <dd>Blocked</dd>
          </div>
        </dl>
      </section>

      <SubmissionReadinessPanel
        verifiedTransactionCount={verifiedCount}
        requiredTransactionCount={response.requiredTransactions}
        demoVideoUrl={response.manifest.demoVideo || undefined}
        demoUrl={response.manifest.demoUrl || undefined}
        deploymentDetected={false}
        contractAddresses={response.manifest.contracts}
        repositoryUrl="https://github.com/Alike001/strk20-workbench"
      />

      {response.issues.length > 0 ? (
        <section className={styles.issues} aria-label="Evidence issues">
          <h3>Needs attention</h3>
          <ul>
            {response.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {records.length === 0 ? (
        <section className={styles.empty}>
          <span>No public evidence published yet</span>
          <h2>Sandbox results never appear here.</h2>
          <p>
            After deliberate minimal-value mainnet actions, maintainers add the
            reviewed hashes and action metadata. This page then checks each
            public receipt independently.
          </p>
        </section>
      ) : (
        <div className={styles.receipts}>
          {records.map((record) => (
            <EvidenceReceiptCard
              key={record.id}
              action={toReceiptAction(record.action)}
              status={toReceiptStatus(record.receiptStatus)}
              networkLabel="Starknet Mainnet"
              poolAddress={response.officialPool}
              transactionHash={record.transactionHash ?? ""}
              explorerUrl={record.explorerUrl}
              timestampLabel={record.createdAt}
              expectedPoolVerified={record.poolInteraction === "verified"}
              explanation={explanationFor(record.action)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export async function loadPublicEvidence(
  signal?: AbortSignal,
  request: typeof fetch = fetch,
): Promise<PublicEvidenceResponse> {
  const response = await request("/api/evidence", {
    cache: "no-store",
    signal,
  });
  if (!response.ok)
    throw new Error(`Evidence API returned ${response.status}.`);
  return (await response.json()) as PublicEvidenceResponse;
}

function isPublicMainnetRecord(record: EvidenceRecord): boolean {
  return (
    record.source === "project-curated" &&
    record.mode === "real" &&
    record.proofKind === "real" &&
    record.network === "SN_MAIN" &&
    typeof record.transactionHash === "string"
  );
}

function toReceiptAction(action: EvidenceRecord["action"]) {
  if (
    action === "shield" ||
    action === "private-transfer" ||
    action === "withdraw"
  ) {
    return action;
  }
  throw new TypeError("Unsupported public evidence action.");
}

function toReceiptStatus(status: EvidenceRecord["receiptStatus"]) {
  if (status === "succeeded") return "confirmed" as const;
  if (status === "reverted") return "reverted" as const;
  if (status === "pending") return "pending" as const;
  return "uncertain" as const;
}

function explanationFor(action: EvidenceRecord["action"]): string {
  if (action === "shield") {
    return "The project requested a public STRK deposit into the private pool.";
  }
  if (action === "withdraw") {
    return "The project requested value to leave the private pool for a public address.";
  }
  return "The project requested a transfer inside the private pool; private transfer details are not inferred from the public receipt.";
}
