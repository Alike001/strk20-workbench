import type { LabError } from "@strk20-workbench/lab-core";

import styles from "./workbench.module.css";

export function ErrorRecoveryPanel({
  error,
  busy,
  onRetry,
}: Readonly<{ error?: LabError; busy: boolean; onRetry: () => void }>) {
  if (!error) return null;
  return (
    <section
      className={styles.errorPanel}
      aria-labelledby="recovery-title"
      role="alert"
    >
      <div>
        <span>Error · {error.code}</span>
        <h2 id="recovery-title">{error.title}</h2>
        <p>{error.explanation}</p>
        <small>{error.nextAction}</small>
      </div>
      {error.retryable ? (
        <button disabled={busy} onClick={onRetry} type="button">
          Retry safely
        </button>
      ) : null}
    </section>
  );
}
