import type { JSX } from "react";

import styles from "./environment-status.module.css";

export type EnvironmentStatusTone =
  "ready" | "warning" | "inactive" | "pending";

export interface EnvironmentStatusItem {
  readonly label: string;
  readonly value: string;
  readonly detail?: string;
  readonly tone: EnvironmentStatusTone;
}

export interface EnvironmentStatusProps {
  readonly items: readonly EnvironmentStatusItem[];
  readonly ariaLabel?: string;
}

const toneLabels: Record<EnvironmentStatusTone, string> = {
  ready: "Ready",
  warning: "Warning",
  inactive: "Inactive",
  pending: "Pending",
};

const toneClassNames: Record<EnvironmentStatusTone, string> = {
  ready: styles.ready!,
  warning: styles.warning!,
  inactive: styles.inactive!,
  pending: styles.pending!,
};

export function EnvironmentStatus({
  items,
  ariaLabel = "Environment status",
}: EnvironmentStatusProps): JSX.Element {
  return (
    <section className={styles.environmentStatus} aria-label={ariaLabel}>
      <dl className={styles.items}>
        {items.map((item, index) => (
          <div className={styles.item} key={`${item.label}-${index}`}>
            <dt className={styles.term}>
              <span className={styles.label}>{item.label}</span>
              <span className={`${styles.tone} ${toneClassNames[item.tone]}`}>
                <span className={styles.toneMarker} aria-hidden="true" />
                {toneLabels[item.tone]}
              </span>
            </dt>
            <dd className={styles.description}>
              <span className={styles.value}>{item.value}</span>
              {item.detail ? (
                <span className={styles.detail}>{item.detail}</span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
