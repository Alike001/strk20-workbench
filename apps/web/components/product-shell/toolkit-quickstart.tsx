import Link from "next/link";

import { ArrowRightIcon } from "./icons";
import styles from "./toolkit-landing.module.css";

const installCommands = `pnpm install --frozen-lockfile
pnpm --filter @strk20-workbench/example dev`;

const componentExample = `import { PrivateTransfer } from
  "@strk20-workbench/react";
import "@strk20-workbench/react/styles.css";

<PrivateTransfer
  amount={amount}
  mode="sandbox"
  onAmountChange={setAmount}
  onSubmit={sendPrivately}
/>`;

export function ToolkitQuickstart() {
  return (
    <section
      className={`${styles.section} ${styles.quickstart}`}
      id="quickstart"
    >
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>Quickstart</p>
          <h2>From install to private transfer.</h2>
        </div>
        <p>
          Clone the public workspace, run the lightweight example, then use the
          same controlled component API in your application.
        </p>
      </div>

      <div className={styles.quickstartGrid}>
        <div className={styles.codeWindow}>
          <div className={styles.codeWindowBar}>
            <span>Terminal</span>
            <span>Fresh clone</span>
          </div>
          <pre>
            <code>{installCommands}</code>
          </pre>
          <div className={styles.codeWindowBar}>
            <span>PrivateTransfer.tsx</span>
            <span>React</span>
          </div>
          <pre>
            <code>{componentExample}</code>
          </pre>
        </div>

        <div className={styles.flowPreview}>
          <div className={styles.flowHeader}>
            <span>Private token lifecycle</span>
            <span>Sandbox</span>
          </div>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong>Shield</strong>
                <small>Public balance becomes a private note.</small>
              </div>
            </li>
            <li aria-current="step">
              <span>02</span>
              <div>
                <strong>Send privately</strong>
                <small>Alice sends to Bob inside the pool.</small>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Withdraw</strong>
                <small>Bob returns value to a public address.</small>
              </div>
            </li>
          </ol>
          <div className={styles.visibilityNote}>
            <span>What stays private?</span>
            <p>
              Inside the pool, sender, recipient and amount stay private.
              Deposit, withdrawal and timing remain public.
            </p>
          </div>
          <Link href="/workbench">
            Run this flow <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
