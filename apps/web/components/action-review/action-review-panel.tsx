"use client";

import type { JSX } from "react";

import styles from "./action-review-panel.module.css";

export type RealAction = "shield" | "private-transfer" | "withdraw";

export type RealActionStatus =
  | "review"
  | "preparing-proof"
  | "awaiting-wallet"
  | "submitted"
  | "confirming"
  | "succeeded"
  | "cancelled"
  | "failed"
  | "uncertain";

export interface ActionReviewPanelProps {
  action: RealAction;
  tokenSymbol: string;
  tokenAddress: string;
  amount: string;
  expectedPrivateAmount?: string;
  recipientLabel?: string;
  recipientAddress?: string;
  networkLabel: string;
  poolFee: string;
  status: RealActionStatus;
  transactionHash?: string;
  explorerUrl?: string;
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
  busy?: boolean;
}

interface ActionCopy {
  label: string;
  summary: (props: ActionReviewPanelProps) => string;
  privateFact: string;
  publicFact: string;
}

interface StatusCopy {
  label: string;
  heading: string;
  description: string;
}

const actionCopy: Record<RealAction, ActionCopy> = {
  shield: {
    label: "Shield",
    summary: ({ amount, tokenSymbol, expectedPrivateAmount }) =>
      `You are asking your wallet to deposit ${amount} ${tokenSymbol}. After the pool fee, about ${expectedPrivateAmount ?? "the wallet-reviewed amount"} becomes private.`,
    privateFact:
      "Your resulting in-pool balance, note contents, and how that value is later spent.",
    publicFact:
      "Your depositing account, token, amount, pool interaction, and timing.",
  },
  "private-transfer": {
    label: "Private transfer",
    summary: ({ amount, tokenSymbol, recipientLabel, recipientAddress }) =>
      `You are asking your wallet to send ${amount} ${tokenSymbol} privately to ${recipientLabel ?? recipientAddress ?? "the selected recipient"}.`,
    privateFact:
      "The sender-to-recipient link, recipient, amount, token, and spent notes inside the pool.",
    publicFact:
      "A pool interaction and its timing. Relayer, RPC, or app-side DeFi metadata may remain observable.",
  },
  withdraw: {
    label: "Withdraw",
    summary: ({ amount, tokenSymbol, recipientLabel, recipientAddress }) =>
      `You are asking your wallet to withdraw ${amount} ${tokenSymbol} from the private pool to ${recipientLabel ?? recipientAddress ?? "the selected recipient"}.`,
    privateFact:
      "The source note contents and links to earlier private transfers inside the pool.",
    publicFact:
      "The withdrawal recipient, token, amount, pool interaction, and timing.",
  },
};

const statusCopy: Record<RealActionStatus, StatusCopy> = {
  review: {
    label: "Review required",
    heading: "Review this real action.",
    description:
      "Nothing has been submitted. Continuing starts proof preparation and can proceed to a separate transaction approval in your wallet.",
  },
  "preparing-proof": {
    label: "Proof preparation",
    heading: "Preparing the proof request...",
    description:
      "Your wallet is preparing the requested private action. A proof and transaction are not verified yet.",
  },
  "awaiting-wallet": {
    label: "Wallet approval",
    heading: "Waiting for wallet approval...",
    description:
      "Review the wallet prompt before approving. No transaction is verified yet.",
  },
  submitted: {
    label: "Submitted",
    heading: "Transaction submitted.",
    description:
      "The wallet returned a transaction hash. Submission is not confirmation or verification.",
  },
  confirming: {
    label: "Confirming",
    heading: "Waiting for network confirmation...",
    description:
      "The submitted transaction is being checked on Starknet. It is not verified yet.",
  },
  succeeded: {
    label: "Receipt succeeded",
    heading: "Starknet confirmed the transaction.",
    description:
      "The supplied receipt succeeded. Expected-pool interaction is verified separately before this becomes STRK20 evidence.",
  },
  cancelled: {
    label: "Cancelled safely",
    heading: "Nothing was submitted.",
    description:
      "This action stopped before a transaction was submitted. You can review a new action when ready.",
  },
  failed: {
    label: "Failed",
    heading: "Action failed.",
    description:
      "No verified success was recorded for this attempt. Review the failure in the calling flow before trying again.",
  },
  uncertain: {
    label: "Confirmation uncertain",
    heading: "Submitted, but confirmation is not visible yet.",
    description:
      "Do not submit again until the transaction status is checked. This action is not verified.",
  },
};

const activeStatuses = new Set<RealActionStatus>([
  "preparing-proof",
  "awaiting-wallet",
  "submitted",
  "confirming",
]);

export function ActionReviewPanel(props: ActionReviewPanelProps): JSX.Element {
  const {
    action,
    tokenSymbol,
    tokenAddress,
    amount,
    expectedPrivateAmount,
    recipientLabel,
    recipientAddress,
    networkLabel,
    poolFee,
    status,
    transactionHash,
    explorerUrl,
    onConfirm,
    onCancel,
    disabled = false,
    busy = false,
  } = props;
  const actionDetails = actionCopy[action];
  const currentStatus = statusCopy[status];
  const controlsDisabled = disabled || busy;
  const isActive = activeStatuses.has(status);

  return (
    <section
      className={styles.panel}
      data-action={action}
      data-status={status}
      aria-busy={busy || isActive}
      aria-label="Real action review"
    >
      <header className={styles.warningRail}>
        <span className={styles.warningMark} aria-hidden="true">
          !
        </span>
        <strong>Real funds · {networkLabel}</strong>
        <span>Wallet approval required</span>
      </header>

      <div className={styles.introduction}>
        <p className={styles.eyebrow}>Real action / final review</p>
        <h2>
          {status === "review"
            ? "Review this real action."
            : actionDetails.label}
        </h2>
        <p className={styles.summary}>{actionDetails.summary(props)}</p>
      </div>

      <div className={styles.reviewLayout}>
        <div className={styles.details}>
          <h3>Request details</h3>
          <dl>
            <ReviewFact label="Action" value={actionDetails.label} />
            <ReviewFact
              label="Token"
              value={tokenSymbol}
              technicalValue={tokenAddress}
            />
            <ReviewFact
              label={action === "shield" ? "Public deposit" : "Amount"}
              value={`${amount} ${tokenSymbol}`}
            />
            {action === "shield" && expectedPrivateAmount ? (
              <ReviewFact
                label="Expected private increase"
                value={expectedPrivateAmount}
              />
            ) : null}
            <ReviewFact
              label="Recipient"
              value={
                action === "shield"
                  ? "Not applicable for shield"
                  : (recipientLabel ?? "Selected recipient")
              }
              technicalValue={
                action === "shield" ? undefined : recipientAddress
              }
            />
            <ReviewFact label="Network" value={networkLabel} />
            <ReviewFact label="Pool fee" value={poolFee} />
          </dl>
        </div>

        <div className={styles.privacyFacts}>
          <h3>Privacy boundary</h3>
          <article data-visibility="private">
            <span>Private inside the pool</span>
            <strong>Stays private</strong>
            <p>{actionDetails.privateFact}</p>
          </article>
          <article data-visibility="public">
            <span>Visible at the edges</span>
            <strong>Remains public</strong>
            <p>{actionDetails.publicFact}</p>
          </article>
        </div>
      </div>

      <div
        className={styles.statusRail}
        role={status === "failed" ? "alert" : "status"}
        aria-live={status === "failed" ? "assertive" : "polite"}
        aria-atomic="true"
      >
        <span className={styles.statusMark} aria-hidden="true" />
        <div>
          <p>{currentStatus.label}</p>
          <h3>{currentStatus.heading}</h3>
          <p>{currentStatus.description}</p>
        </div>
      </div>

      {transactionHash ? (
        <div className={styles.transactionEvidence}>
          <span>Transaction hash supplied by caller</span>
          <code>{transactionHash}</code>
          {explorerUrl ? (
            <a href={explorerUrl} target="_blank" rel="noreferrer">
              Open in explorer <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      ) : null}

      <footer className={styles.actions}>
        {status === "review" ? (
          <button
            className={styles.primaryAction}
            type="button"
            onClick={onConfirm}
            disabled={controlsDisabled}
          >
            Continue to wallet approvals
          </button>
        ) : null}
        <button
          className={styles.secondaryAction}
          type="button"
          onClick={onCancel}
          disabled={controlsDisabled}
        >
          {status === "review" ? "Cancel review" : "Close panel"}
        </button>
        <p>
          Continuing asks the wallet to prepare the proof and then request
          submission approval. Nothing can be submitted without wallet approval,
          and this interface never asks for your secrets.
        </p>
      </footer>
    </section>
  );
}

function ReviewFact({
  label,
  value,
  technicalValue,
}: Readonly<{
  label: string;
  value: string;
  technicalValue?: string;
}>): JSX.Element {
  return (
    <div>
      <dt>{label}</dt>
      <dd>
        <span>{value}</span>
        {technicalValue ? <code>{technicalValue}</code> : null}
      </dd>
    </div>
  );
}
