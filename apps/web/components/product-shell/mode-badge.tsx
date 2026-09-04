import { FlaskIcon } from "./icons";
import styles from "./product-shell.module.css";

export function ModeBadge() {
  return (
    <div className={styles.modeBadge} aria-label="Execution mode">
      <span className={styles.modeName}>
        <FlaskIcon />
        Sandbox
      </span>
      <span className={styles.proofName}>
        <span className={styles.proofMark} aria-hidden="true" />
        Simulated proof
        <span className={styles.statusDot} aria-hidden="true" />
      </span>
    </div>
  );
}
