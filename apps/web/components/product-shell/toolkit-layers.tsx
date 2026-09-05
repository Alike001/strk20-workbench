import Link from "next/link";

import { ArrowRightIcon } from "./icons";
import styles from "./toolkit-landing.module.css";

const layers = [
  {
    number: "01",
    name: "Core",
    status: "Workspace ready",
    description:
      "Model private-token lifecycles, privacy facts and recoverable errors without React.",
    code: 'import { SandboxAdapter } from "@strk20-workbench/lab-core";',
  },
  {
    number: "02",
    name: "Wallet API",
    status: "App integration ready",
    description:
      "Discover capability, prepare proofs and submit through a privacy-enabled wallet.",
    code: "await account.strk20InvokeTransaction(actions);",
  },
  {
    number: "03",
    name: "React",
    status: "Workspace ready",
    description:
      "Drop Shield, Send privately and Withdraw into an existing application.",
    code: 'import { PrivateTransfer } from "@strk20-workbench/react";',
  },
] as const;

export function ToolkitLayers() {
  return (
    <section className={styles.section} id="toolkit">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>The developer surface</p>
          <h2>Not one component — a toolkit for STRK20.</h2>
        </div>
        <p>
          Start with the layer you need. Use the full stack when you are ready
          to take a private flow from local understanding to wallet execution.
        </p>
      </div>

      <p className={styles.releaseStatus}>
        <span aria-hidden="true" /> Workspace packages · publishing next
      </p>

      <ol className={styles.layerList}>
        {layers.map((layer) => (
          <li key={layer.name}>
            <span className={styles.layerNumber}>{layer.number}</span>
            <div className={styles.layerCopy}>
              <div>
                <h3>{layer.name}</h3>
                <span>{layer.status}</span>
              </div>
              <p>{layer.description}</p>
            </div>
            <code>{layer.code}</code>
          </li>
        ))}
      </ol>

      <div className={styles.sectionLinks}>
        <Link href="/integrate">
          Open components <ArrowRightIcon />
        </Link>
        <Link href="/documentation">
          Read the docs <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
}
