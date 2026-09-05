import Link from "next/link";
import type { JSX } from "react";

import { ArrowRightIcon } from "../product-shell";
import styles from "./documentation-guide.module.css";

const toolkitLayers = [
  {
    number: "01",
    name: "Lab Core",
    label: "Scenario engine",
    status: "Workspace-ready",
    state: "ready",
    description:
      "Framework-neutral TypeScript for deterministic scenarios, lifecycle state, privacy facts, and controlled failure cases.",
    responsibilities: ["Model actions", "Advance state", "Record evidence"],
  },
  {
    number: "02",
    name: "Wallet API adapter",
    label: "Real-wallet boundary",
    status: "App-integrated · extraction in progress",
    state: "extracting",
    description:
      "The web app checks STRK20 wallet capabilities and keeps signing, note discovery, proving, and submission wallet-side.",
    responsibilities: ["Check capability", "Prepare review", "Verify receipt"],
  },
  {
    number: "03",
    name: "React components",
    label: "Product interface",
    status: "Workspace-ready",
    state: "ready",
    description:
      "Controlled UI building blocks for shield, private transfer, withdraw, progress, and honest privacy explanations.",
    responsibilities: ["Collect intent", "Explain privacy", "Render status"],
  },
] as const;

const adoptionSteps = [
  {
    number: "01",
    title: "Sandbox",
    description:
      "Learn shield, private-transfer, and withdraw flows with fake tokens and simulated results.",
  },
  {
    number: "02",
    title: "Wallet capability check",
    description:
      "Discover an installed wallet intentionally and confirm the required STRK20 Wallet API contract.",
  },
  {
    number: "03",
    title: "Action review",
    description:
      "Review the network, assets, fees, and public or private consequences before approval.",
  },
  {
    number: "04",
    title: "Proof and submit",
    description:
      "The privacy-enabled wallet owns keys, note discovery, proving, signing, and transaction submission.",
  },
  {
    number: "05",
    title: "Verified receipt",
    description:
      "Confirm the resulting transaction and pool interaction before treating a mainnet action as evidence.",
  },
] as const;

const repositoryGuides = [
  {
    title: "Product requirements",
    description: "What the workbench must do and how success is judged.",
    path: "context/product-requirements.md",
  },
  {
    title: "Technical specification",
    description:
      "Architecture, boundaries, data flow, security, and milestones.",
    path: "context/technical-specification.md",
  },
  {
    title: "Compatibility notes",
    description:
      "Exact package pins, inspected snapshots, and the open wallet gate.",
    path: "docs/compatibility.md",
  },
  {
    title: "STRK20 architecture",
    description: "The pool, notes, discovery, proving, and privacy boundaries.",
    path: "context/strk20-architecture.md",
  },
] as const;

const repositoryRoot = "https://github.com/Alike001/strk20-workbench/blob/main";

export function DocumentationGuide(): JSX.Element {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="documentation-title">
        <div className={styles.heroTopline}>
          <p>Developer architecture / honest status</p>
          <span>Open source · MIT</span>
        </div>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <h1 id="documentation-title">
              Understand the stack. Build private flows.
            </h1>
            <p>
              STRK20 Workbench is reusable infrastructure for Starknet
              developers to understand, prototype, and connect shield,
              private-transfer, and withdraw flows.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href="/workbench">
                Explore in Sandbox <ArrowRightIcon />
              </Link>
              <Link className={styles.secondaryAction} href="/integrate">
                View components <ArrowRightIcon />
              </Link>
            </div>
          </div>

          <aside className={styles.readiness} aria-labelledby="readiness-title">
            <div className={styles.readinessHeading}>
              <span aria-hidden="true">status://current</span>
              <h2 id="readiness-title">What builders can use today</h2>
            </div>
            <dl>
              <div>
                <dt>Lab Core</dt>
                <dd data-state="ready">Workspace-ready</dd>
              </div>
              <div>
                <dt>React package</dt>
                <dd data-state="ready">Workspace-ready</dd>
              </div>
              <div>
                <dt>Wallet API</dt>
                <dd data-state="extracting">App-integrated</dd>
              </div>
              <div>
                <dt>Distribution</dt>
                <dd data-state="pending">Not published to npm</dd>
              </div>
            </dl>
            <p>
              Sandbox works without a wallet or real funds. Mainnet fits behind
              an explicit capability check, review, and wallet approval path.
            </p>
          </aside>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="layers-title">
        <SectionHeading
          number="01"
          label="Toolkit layers"
          title="Three layers. One clear boundary."
          description="Use the scenario engine and React UI in this workspace today. The wallet adapter is already app-integrated and is being extracted into a reusable boundary."
          id="layers-title"
        />

        <ol className={styles.layerGrid}>
          {toolkitLayers.map((layer) => (
            <li key={layer.name}>
              <article className={styles.layerCard} data-state={layer.state}>
                <div className={styles.cardTopline}>
                  <span>{layer.number}</span>
                  <span>{layer.label}</span>
                </div>
                <h3>{layer.name}</h3>
                <p>{layer.description}</p>
                <ul>
                  {layer.responsibilities.map((responsibility) => (
                    <li key={responsibility}>{responsibility}</li>
                  ))}
                </ul>
                <strong>{layer.status}</strong>
              </article>
            </li>
          ))}
        </ol>

        <aside className={styles.packageNotice}>
          <span aria-hidden="true">!</span>
          <div>
            <strong>Workspace packages, not registry packages.</strong>
            <p>
              Lab Core and React are usable from this monorepo. Packages are not
              published to npm yet, so adoption currently starts by cloning the
              workspace.
            </p>
          </div>
        </aside>
      </section>

      <section className={styles.section} aria-labelledby="path-title">
        <SectionHeading
          number="02"
          label="Adoption path"
          title="Prototype first. Cross into mainnet deliberately."
          description="The same product flow gains stronger requirements at each stage. A connection alone never proves compatibility or moves funds."
          id="path-title"
        />

        <ol className={styles.adoptionRail}>
          {adoptionSteps.map((step) => (
            <li key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="privacy-title">
        <SectionHeading
          number="03"
          label="Privacy boundary"
          title="Private in the pool. Public at the edges."
          description="Privacy is specific, not absolute. The interface explains which details remain shielded and which activity still reaches public infrastructure."
          id="privacy-title"
        />

        <div className={styles.boundaryGrid}>
          <article className={styles.boundaryCard} data-visibility="private">
            <div className={styles.boundaryTopline}>
              <span>Inside the pool</span>
              <strong>Private</strong>
            </div>
            <h3>Shielded transfer details</h3>
            <p>
              Private inside the pool: sender, recipient, amount, token, and
              spent notes.
            </p>
            <span className={styles.boundaryRail} aria-hidden="true">
              encrypted state / nullifier protection
            </span>
          </article>

          <article className={styles.boundaryCard} data-visibility="public">
            <div className={styles.boundaryTopline}>
              <span>Network edges</span>
              <strong>Public</strong>
            </div>
            <h3>Observable activity</h3>
            <p>
              Public at the edges: deposits, withdrawals, timing, and app-side
              DeFi activity.
            </p>
            <span className={styles.boundaryRail} aria-hidden="true">
              onchain activity / external protocols
            </span>
          </article>
        </div>

        <p className={styles.boundaryNote}>
          The hosted app does not handle private keys, viewing keys, note
          discovery, or proof requests. A compatible privacy-enabled wallet owns
          those responsibilities in real mode.
        </p>
      </section>

      <section className={styles.guides} aria-labelledby="guides-title">
        <SectionHeading
          number="04"
          label="Repository guides"
          title="Trace every claim to the source."
          description="The product contract, implementation boundaries, compatibility decisions, and protocol research live beside the code."
          id="guides-title"
        />

        <div className={styles.guideGrid}>
          {repositoryGuides.map((guide) => (
            <Link
              href={`${repositoryRoot}/${guide.path}`}
              key={guide.title}
              target="_blank"
              rel="noreferrer"
            >
              <div>
                <h3>{guide.title}</h3>
                <p>{guide.description}</p>
              </div>
              <code>{guide.path}</code>
              <ArrowRightIcon />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function SectionHeading({
  number,
  label,
  title,
  description,
  id,
}: Readonly<{
  number: string;
  label: string;
  title: string;
  description: string;
  id: string;
}>): JSX.Element {
  return (
    <header className={styles.sectionHeading}>
      <p>
        <span>{number}</span>
        {label}
      </p>
      <div>
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </div>
    </header>
  );
}
