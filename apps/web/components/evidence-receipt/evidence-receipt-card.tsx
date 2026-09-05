import type { JSX } from "react";

import styles from "./evidence-receipt-card.module.css";

export type EvidenceAction = "shield" | "private-transfer" | "withdraw";

export type EvidenceReceiptStatus =
  "pending" | "confirmed" | "reverted" | "uncertain";

export interface EvidenceReceiptCardProps {
  action: EvidenceAction;
  status: EvidenceReceiptStatus;
  networkLabel: string;
  poolAddress: string;
  transactionHash: string;
  explorerUrl?: string;
  contractAddress?: string;
  timestampLabel?: string;
  expectedPoolVerified: boolean;
  explanation: string;
}

interface ReceiptCopy {
  label: string;
  heading: string;
  description: string;
}

const actionLabels: Record<EvidenceAction, string> = {
  shield: "Shield",
  "private-transfer": "Private transfer",
  withdraw: "Withdraw",
};

const statusCopy: Record<
  Exclude<EvidenceReceiptStatus, "confirmed">,
  ReceiptCopy
> = {
  pending: {
    label: "Pending · Not verified",
    heading: "Confirmation pending",
    description:
      "This transaction is still being checked. Do not submit again until its status is known.",
  },
  reverted: {
    label: "Reverted · Unsuccessful",
    heading: "Transaction reverted",
    description:
      "The transaction did not complete successfully and is not evidence of a successful STRK20 action.",
  },
  uncertain: {
    label: "Uncertain · Not verified",
    heading: "Confirmation not visible",
    description:
      "This transaction may have been submitted. Do not submit again until its status is checked.",
  },
};

const confirmedVerifiedCopy: ReceiptCopy = {
  label: "Confirmed · Expected pool verified",
  heading: "Verified STRK20 evidence",
  description:
    "The transaction is confirmed and its receipt was verified to touch the expected STRK20 pool.",
};

const confirmedUnverifiedCopy: ReceiptCopy = {
  label: "Confirmed · Pool not verified",
  heading: "Confirmed transaction",
  description:
    "The transaction is confirmed, but interaction with the expected STRK20 pool has not been verified. This is not verified STRK20 evidence.",
};

export function EvidenceReceiptCard({
  action,
  status,
  networkLabel,
  poolAddress,
  transactionHash,
  explorerUrl,
  contractAddress,
  timestampLabel,
  expectedPoolVerified,
  explanation,
}: EvidenceReceiptCardProps): JSX.Element {
  const isVerified = status === "confirmed" && expectedPoolVerified;
  const copy =
    status === "confirmed"
      ? isVerified
        ? confirmedVerifiedCopy
        : confirmedUnverifiedCopy
      : statusCopy[status];
  const isAlert = status === "reverted" || status === "uncertain";

  return (
    <article
      className={styles.card}
      data-status={status}
      data-verification={isVerified ? "verified" : "not-verified"}
      aria-label="STRK20 transaction evidence receipt"
    >
      <header className={styles.topRail}>
        <span>Mainnet evidence receipt</span>
        <span>{networkLabel}</span>
      </header>

      <div
        className={styles.outcome}
        role={isAlert ? "alert" : "status"}
        aria-live={isAlert ? "assertive" : "polite"}
        aria-atomic="true"
      >
        <span className={styles.outcomeMark} aria-hidden="true" />
        <div>
          <p>{copy.label}</p>
          <h2>{copy.heading}</h2>
          <p>{copy.description}</p>
        </div>
      </div>

      <div className={styles.summary}>
        <div>
          <p>What happened</p>
          <h3>
            {actionLabels[action]} on {networkLabel}
          </h3>
          <p>{explanation}</p>
        </div>
        <dl className={styles.quickFacts}>
          <div>
            <dt>Transaction</dt>
            <dd>{status}</dd>
          </div>
          <div>
            <dt>Expected pool</dt>
            <dd>
              {expectedPoolVerified ? "Interaction found" : "Not verified"}
            </dd>
          </div>
          <div>
            <dt>Inspect</dt>
            <dd>{explorerUrl ? "Explorer available" : "Link not supplied"}</dd>
          </div>
        </dl>
      </div>

      <section className={styles.technicalEvidence}>
        <div className={styles.evidenceHeading}>
          <div>
            <p>Receipt and caller context</p>
            <h3>Technical evidence</h3>
          </div>
          <span>
            {isVerified ? "Receipt + pool check passed" : "Review required"}
          </span>
        </div>

        <dl className={styles.evidenceList}>
          <EvidenceField
            label="Requested action"
            value={actionLabels[action]}
          />
          <EvidenceField label="Network" value={networkLabel} />
          <EvidenceField label="Expected pool" value={poolAddress} technical />
          <EvidenceField
            label="Transaction hash"
            value={transactionHash}
            technical
          />
          {contractAddress ? (
            <EvidenceField label="Contract" value={contractAddress} technical />
          ) : null}
          {timestampLabel ? (
            <EvidenceField label="Timestamp" value={timestampLabel} />
          ) : null}
        </dl>

        <div className={styles.evidenceActions}>
          {explorerUrl ? (
            <a href={explorerUrl} target="_blank" rel="noreferrer">
              Inspect on explorer <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <span>No explorer URL supplied by the caller.</span>
          )}
          <p>
            The requested action is caller context, not necessarily a public
            receipt field. Public evidence does not prove that all action
            details were private.
          </p>
        </div>
      </section>
    </article>
  );
}

function EvidenceField({
  label,
  value,
  technical = false,
}: Readonly<{
  label: string;
  value: string;
  technical?: boolean;
}>): JSX.Element {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{technical ? <code>{value}</code> : value}</dd>
    </div>
  );
}
