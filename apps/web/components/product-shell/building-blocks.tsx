import Link from "next/link";

import { ArrowRightIcon } from "./icons";
import styles from "./product-shell.module.css";

const blocks = [
  {
    number: "01",
    title: "Shield",
    description: "Move public tokens into a private balance.",
  },
  {
    number: "02",
    title: "Send privately",
    description: "Pay without exposing the recipient or amount.",
  },
  {
    number: "03",
    title: "Withdraw",
    description: "Move private tokens back to a public wallet.",
  },
] as const;

export function BuildingBlocks() {
  return (
    <section className={styles.buildingBlocks} id="components">
      <div className={styles.blocksHeading}>
        <h2>Ready-made privacy building blocks.</h2>
        <p>
          Start with a complete private-transfer flow, or use only the parts
          your app needs.
        </p>
      </div>

      <ol className={styles.blockRail}>
        {blocks.map((block) => (
          <li key={block.title}>
            <span className={styles.blockNumber}>{block.number}</span>
            <div>
              <h3>{block.title}</h3>
              <p>{block.description}</p>
            </div>
            <Link href="/workbench">
              Try it <ArrowRightIcon />
            </Link>
          </li>
        ))}
      </ol>

      <div className={styles.adoptionStrip}>
        <div className={styles.adoptionCopy}>
          <h2>Try it first. Copy it second.</h2>
          <p>
            Every component runs in Sandbox before a wallet or real funds are
            involved.
          </p>
          <div className={styles.adoptionActions}>
            <Link className={styles.primaryAction} href="/workbench">
              Open component playground <ArrowRightIcon />
            </Link>
            <Link className={styles.secondaryAction} href="/integrate">
              View integration guide <ArrowRightIcon />
            </Link>
          </div>
        </div>
        <div
          className={styles.codePreview}
          aria-label="Planned React component interface"
        >
          <span>Planned React API</span>
          <pre>
            <code>{`import { PrivateTransfer } from "@strk20-workbench/react";

<PrivateTransfer mode="sandbox" />`}</code>
          </pre>
          <p>
            The reusable React package is the next build milestone. The
            playground works today in Sandbox.
          </p>
        </div>
      </div>
    </section>
  );
}
