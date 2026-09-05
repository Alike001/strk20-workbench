import Link from "next/link";

import { ArrowRightIcon } from "./icons";
import styles from "./toolkit-landing.module.css";

const stages = [
  { number: "01", name: "Sandbox", detail: "Available now", state: "ready" },
  {
    number: "02",
    name: "Wallet check",
    detail: "Supported wallet",
    state: "next",
  },
  {
    number: "03",
    name: "Action review",
    detail: "User confirms",
    state: "next",
  },
  {
    number: "04",
    name: "Proof + submit",
    detail: "Wallet prepares",
    state: "next",
  },
  {
    number: "05",
    name: "Verified receipt",
    detail: "Mainnet evidence",
    state: "next",
  },
] as const;

const evidence = ["Shield", "Private transfer", "Withdraw"] as const;

export function MainnetPath() {
  return (
    <section className={`${styles.section} ${styles.pathSection}`}>
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>One adoption path</p>
          <h2>Sandbox first. Mainnet when ready.</h2>
        </div>
        <p>
          Learn the flow without funds, check wallet support deliberately, then
          review every real action before proof preparation and submission.
        </p>
      </div>

      <ol className={styles.pathRail}>
        {stages.map((stage) => (
          <li data-state={stage.state} key={stage.name}>
            <span>{stage.number}</span>
            <strong>{stage.name}</strong>
            <small>{stage.detail}</small>
          </li>
        ))}
      </ol>

      <div className={styles.privacyBoundary}>
        <div>
          <span>Private inside the pool</span>
          <p>Sender · Recipient · Amount · Token · Spent notes</p>
        </div>
        <div>
          <span>Public at the edges</span>
          <p>Deposit · Withdrawal · Timing · App-side DeFi</p>
        </div>
      </div>
    </section>
  );
}

export function EvidencePreview() {
  return (
    <section
      className={`${styles.section} ${styles.evidenceSection}`}
      id="evidence"
    >
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>Mainnet proof</p>
          <h2>Real evidence, not a screenshot.</h2>
        </div>
        <p>
          The final product will publish independently checkable Starknet
          receipts. Until those transactions exist, this table says so.
        </p>
      </div>

      <div className={styles.evidenceTableWrap}>
        <table className={styles.evidenceTable}>
          <thead>
            <tr>
              <th>Action</th>
              <th>Network</th>
              <th>Pool</th>
              <th>Transaction</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {evidence.map((action) => (
              <tr key={action}>
                <td data-label="Action">{action}</td>
                <td data-label="Network">SN_MAIN</td>
                <td data-label="Pool">
                  <code>0x0403…812a</code>
                </td>
                <td data-label="Transaction">Pending first mainnet run</td>
                <td data-label="Status">
                  <span className={styles.pendingStatus}>Not verified yet</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.sectionLinks}>
        <Link href="/evidence">
          Inspect evidence rules <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
}

export function FinalToolkitCta() {
  return (
    <section className={styles.finalCta}>
      <p className={styles.eyebrow}>Build the private layer once</p>
      <h2>Build private Starknet apps without rebuilding the plumbing.</h2>
      <p>
        Start with reusable components, test safely, then connect the same flow
        to STRK20 mainnet.
      </p>
      <div>
        <Link className={styles.primaryButton} href="/integrate">
          Start with the toolkit <ArrowRightIcon />
        </Link>
        <a
          className={styles.secondaryButton}
          href="https://github.com/Alike001/strk20-workbench"
          rel="noreferrer"
          target="_blank"
        >
          View on GitHub <ArrowRightIcon />
        </a>
      </div>
    </section>
  );
}

export function ToolkitFooter() {
  return (
    <footer className={styles.footer}>
      <div>
        <span className={styles.footerBrand}>
          STRK<span>[20]</span> Workbench
        </span>
        <p>
          Open-source infrastructure for understandable private token flows.
        </p>
      </div>
      <nav aria-label="Footer navigation">
        <Link href="/workbench">Playground</Link>
        <Link href="/integrate">Components</Link>
        <Link href="/documentation">Docs</Link>
        <Link href="/evidence">Evidence</Link>
      </nav>
      <p>Built for the STRK20 Private Sprint.</p>
    </footer>
  );
}
