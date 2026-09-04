import type { JSX } from "react";

import styles from "./actor-card.module.css";

export type ActorRegistrationState =
  "registered" | "not-registered" | "pending";

export interface ActorBalanceView {
  readonly amount: string;
  readonly symbol: string;
}

export interface ActorCardProps {
  readonly name: string;
  readonly address: string;
  readonly registration: ActorRegistrationState;
  readonly publicBalance: ActorBalanceView;
  readonly privateBalance: ActorBalanceView;
  readonly active?: boolean;
  readonly compact?: boolean;
}

const registrationLabels: Record<ActorRegistrationState, string> = {
  registered: "Registered",
  "not-registered": "Not registered",
  pending: "Pending",
};

const registrationClassNames: Record<ActorRegistrationState, string> = {
  registered: styles.registered!,
  "not-registered": styles.notRegistered!,
  pending: styles.pending!,
};

export function ActorCard({
  name,
  address,
  registration,
  publicBalance,
  privateBalance,
  active = false,
  compact = false,
}: ActorCardProps): JSX.Element {
  return (
    <article
      className={`${styles.actorCard} ${active ? styles.active : ""} ${compact ? styles.compact : ""}`}
      data-active={active ? "true" : "false"}
    >
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Actor</span>
          <h3 className={styles.name}>{name}</h3>
        </div>
        {active ? (
          <span className={styles.activeLabel}>Active actor</span>
        ) : null}
      </header>

      <p className={styles.addressBlock}>
        <span className={styles.addressLabel}>Address</span>
        <code
          className={styles.address}
          title={address}
          aria-label={`Full address: ${address}`}
        >
          {address}
        </code>
      </p>

      <dl className={styles.facts}>
        <div className={`${styles.fact} ${styles.publicBalance}`}>
          <dt>Public balance</dt>
          <dd>
            <span className={styles.amount}>{publicBalance.amount}</span>
            <span className={styles.symbol}>{publicBalance.symbol}</span>
          </dd>
        </div>

        <div className={`${styles.fact} ${styles.privateBalance}`}>
          <dt>Private balance</dt>
          <dd>
            <span className={styles.amount}>{privateBalance.amount}</span>
            <span className={styles.symbol}>{privateBalance.symbol}</span>
          </dd>
        </div>

        <div className={`${styles.fact} ${styles.registrationFact}`}>
          <dt>Registration</dt>
          <dd>
            <span
              className={`${styles.registration} ${registrationClassNames[registration]}`}
            >
              <span className={styles.registrationMarker} aria-hidden="true" />
              {registrationLabels[registration]}
            </span>
          </dd>
        </div>
      </dl>
    </article>
  );
}
