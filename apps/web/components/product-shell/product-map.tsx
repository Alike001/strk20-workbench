import {
  ArrowRightIcon,
  ShieldCheckIcon,
  TerminalIcon,
  WalletIcon,
} from "./icons";
import styles from "./product-shell.module.css";

const stages = [
  {
    number: "1",
    title: "Sandbox",
    body: "Run locally, inspect privacy, and debug your flow.",
    icon: TerminalIcon,
    tone: "ready",
  },
  {
    number: "2",
    title: "Wallet API",
    body: "Use a supported wallet with the same integration.",
    icon: WalletIcon,
    tone: "pending",
  },
  {
    number: "3",
    title: "Mainnet evidence",
    body: "Generate real proofs and verify pool transactions.",
    icon: ShieldCheckIcon,
    tone: "ready",
  },
] as const;

export function ProductMap() {
  return (
    <section className={styles.productMap} aria-labelledby="product-map-title">
      <h2 id="product-map-title">Same scenario, moving through the stack</h2>
      <div className={styles.stageRail}>
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          return (
            <div className={styles.stageGroup} key={stage.title}>
              <article className={styles.stage} data-tone={stage.tone}>
                <span className={styles.stageNumber}>{stage.number}</span>
                <div>
                  <h3>{stage.title}</h3>
                  <p>{stage.body}</p>
                </div>
                <Icon className={styles.stageIcon} />
              </article>
              {index < stages.length - 1 ? (
                <span className={styles.stageArrow} aria-hidden="true">
                  <ArrowRightIcon />
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
