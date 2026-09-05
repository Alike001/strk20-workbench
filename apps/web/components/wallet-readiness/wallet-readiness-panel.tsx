"use client";

import type { JSX } from "react";

import styles from "./wallet-readiness-panel.module.css";

export type WalletReadinessState =
  | "disconnected"
  | "discovering"
  | "connecting"
  | "unsupported"
  | "wrong-network"
  | "ready";

export interface WalletReadinessPanelProps {
  state: WalletReadinessState;
  walletName?: string;
  chainName?: string;
  supportedVersion?: string;
  detail?: string;
  onConnect?: () => void;
  onRetry?: () => void;
  onSwitchNetwork?: () => void;
  onUseSandbox?: () => void;
}

interface StateCopy {
  eyebrow: string;
  heading: string;
  description: string;
}

const stateCopy: Record<WalletReadinessState, StateCopy> = {
  disconnected: {
    eyebrow: "Wallet disconnected",
    heading: "Connect a privacy-enabled wallet",
    description:
      "Connecting checks compatibility. Connecting alone never moves funds or starts a transaction.",
  },
  discovering: {
    eyebrow: "Checking compatibility",
    heading: "Looking for compatible wallets...",
    description:
      "This checks which installed wallets expose the STRK20 Wallet API.",
  },
  connecting: {
    eyebrow: "Approval requested",
    heading: "Waiting for wallet approval...",
    description:
      "Approving this connection shares wallet capabilities. It does not move funds or start a transaction.",
  },
  unsupported: {
    eyebrow: "Wallet unsupported",
    heading: "This wallet is not ready for STRK20",
    description:
      "The connected wallet does not expose the required STRK20 Wallet API. Retry after updating or changing wallets, or continue in the Sandbox.",
  },
  "wrong-network": {
    eyebrow: "Network mismatch",
    heading: "Switch to Starknet Mainnet",
    description:
      "STRK20 mainnet actions require Starknet Mainnet. Switch intentionally, or continue in the Sandbox without using a real wallet.",
  },
  ready: {
    eyebrow: "Wallet ready",
    heading: "Ready to review real-wallet actions",
    description:
      "Your wallet reports the required capability. Every real action still has a separate review step before wallet approval.",
  },
};

export function WalletReadinessPanel({
  state,
  walletName,
  chainName,
  supportedVersion,
  detail,
  onConnect,
  onRetry,
  onSwitchNetwork,
  onUseSandbox,
}: WalletReadinessPanelProps): JSX.Element {
  const copy = stateCopy[state];
  const isLoading = state === "discovering" || state === "connecting";

  return (
    <section
      className={styles.panel}
      data-state={state}
      aria-label="Real-wallet readiness"
    >
      <div className={styles.header}>
        <span className={styles.stateMark} aria-hidden="true" />
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
      </div>

      <div
        className={styles.status}
        aria-live={isLoading ? "polite" : undefined}
        aria-atomic={isLoading ? "true" : undefined}
      >
        <h2 className={styles.heading}>{copy.heading}</h2>
        <p className={styles.description}>{copy.description}</p>
      </div>

      {state === "wrong-network" ? (
        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt>Current network</dt>
            <dd>{chainName ?? "Unknown network"}</dd>
          </div>
          <div className={styles.fact}>
            <dt>Required network</dt>
            <dd>Starknet Mainnet</dd>
          </div>
        </dl>
      ) : null}

      {state === "ready" ? (
        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt>Wallet</dt>
            <dd>{walletName ?? "Connected wallet"}</dd>
          </div>
          <div className={styles.fact}>
            <dt>Network</dt>
            <dd>Starknet Mainnet</dd>
          </div>
          <div className={styles.fact}>
            <dt>Wallet API</dt>
            <dd>{supportedVersion ?? "Version not reported"}</dd>
          </div>
        </dl>
      ) : null}

      {detail ? <p className={styles.detail}>{detail}</p> : null}

      {state === "disconnected" ? (
        <div className={styles.actions}>
          <button
            className={styles.primaryAction}
            type="button"
            onClick={onConnect}
          >
            Connect wallet
          </button>
        </div>
      ) : null}

      {state === "unsupported" ? (
        <div className={styles.actions}>
          <button
            className={styles.primaryAction}
            type="button"
            onClick={onRetry}
          >
            Retry
          </button>
          <button
            className={styles.secondaryAction}
            type="button"
            onClick={onUseSandbox}
          >
            Continue in Sandbox
          </button>
        </div>
      ) : null}

      {state === "wrong-network" ? (
        <div className={styles.actions}>
          <button
            className={styles.primaryAction}
            type="button"
            onClick={onSwitchNetwork}
          >
            Switch network
          </button>
          <button
            className={styles.secondaryAction}
            type="button"
            onClick={onUseSandbox}
          >
            Continue in Sandbox
          </button>
        </div>
      ) : null}

      <p className={styles.safetyNote}>
        Readiness checks do not move funds. Real actions are always reviewed
        separately.
      </p>
    </section>
  );
}
