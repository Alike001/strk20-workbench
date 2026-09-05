import Link from "next/link";
import type { JSX } from "react";

import submission from "../../../../strk20.json";
import { ArrowRightIcon } from "../product-shell";
import styles from "./documentation-guide.module.css";

const quickstartSteps = [
  {
    number: "01",
    title: "Open Sandbox",
    description: "Start without a wallet, account, or real funds.",
  },
  {
    number: "02",
    title: "Choose an action",
    description: "Pick shield, private transfer, or withdraw.",
  },
  {
    number: "03",
    title: "Review visibility",
    description: "See what stays private and what observers can still see.",
  },
  {
    number: "04",
    title: "Run it",
    description: "Follow the guided action using simulated tokens and proof.",
  },
  {
    number: "05",
    title: "Inspect the result",
    description: "Read the outcome, timeline, privacy facts, and next step.",
  },
] as const;

const comparisonRows = [
  {
    label: "Best for",
    sandbox: "Learning the private-token flow safely",
    real: "Deliberate mainnet use after preflight",
  },
  {
    label: "Assets",
    sandbox: "Fake tokens only",
    real: "Real assets and network fees",
  },
  {
    label: "Wallet",
    sandbox: "No wallet required",
    real: "Compatible privacy-enabled wallet required",
  },
  {
    label: "Proof and result",
    sandbox: "Simulated and never mainnet evidence",
    real: "Wallet-produced; public receipt checked separately",
  },
] as const;

const developerLayers = [
  {
    number: "01",
    title: "React components",
    description:
      "Collect an action and explain its privacy boundary without owning wallet state.",
  },
  {
    number: "02",
    title: "Adapter layer",
    description:
      "Checks capabilities and maps a reviewed Lab Core action into the STRK20 Wallet API shape.",
  },
  {
    number: "03",
    title: "Privacy wallet",
    description:
      "Keeps keys, notes, discovery, proving, signing, and submission behind wallet approval.",
  },
] as const;

const recoveryItems = [
  {
    title: "Wallet unsupported",
    recovery:
      "Use a privacy-enabled wallet advertising Wallet API 0.10.3 or newer, or continue in Sandbox.",
  },
  {
    title: "Wrong network",
    recovery:
      "Switch the wallet to Starknet Mainnet, then run the capability check again.",
  },
  {
    title: "Wallet request cancelled",
    recovery:
      "Nothing is assumed to have succeeded. Review the action before trying again.",
  },
  {
    title: "Proof service busy or failed",
    recovery:
      "Wait, keep the reviewed details unchanged, and retry from the review step.",
  },
  {
    title: "Confirmation uncertain",
    recovery:
      "Check the existing transaction status first. Do not submit the action again.",
  },
  {
    title: "Recipient not registered",
    recovery:
      "Ask the private-transfer recipient to complete first STRK20 use before retrying.",
  },
] as const;

const repositoryGuides = [
  {
    title: "Product requirements",
    description: "The product promise, journeys, and acceptance boundaries.",
    path: "context/product-requirements.md",
  },
  {
    title: "Technical specification",
    description: "Architecture, data flow, security, and implementation plan.",
    path: "context/technical-specification.md",
  },
  {
    title: "Compatibility notes",
    description: "Package pins and the supported wallet capability contract.",
    path: "docs/compatibility.md",
  },
  {
    title: "Submission metadata",
    description: "The repository source of truth for public submission links.",
    path: "strk20.json",
  },
] as const;

const walletApiExample = `const actions: STRK20_ACTION[] = [mappedReviewedAction];

// Prepare and simulate through the connected privacy wallet.
await account.strk20PrepareInvoke(actions, true);

// This second request can create a real transaction.
const { transaction_hash } =
  await account.strk20InvokeTransaction(actions);

// Verify transaction_hash and the expected pool separately.`;

const repositoryRoot = "https://github.com/Alike001/strk20-workbench/blob/main";

export function DocumentationGuide(): JSX.Element {
  const transactionCount = submission.transactions.length;
  const contractCount = submission.contracts.length;
  const hasDemo = Boolean(submission.demo_url);
  const hasDemoVideo = Boolean(submission.demo_video);
  const evidenceComplete = transactionCount >= 3 && hasDemoVideo;

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="documentation-title">
        <div className={styles.heroTopline}>
          <p>Practical guide / start here</p>
          <span>Sandbox first · Real wallet by choice</span>
        </div>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>What Workbench does</p>
            <h1 id="documentation-title">See how private money moves work.</h1>
            <p>
              STRK20 Workbench lets you rehearse a shield, private transfer, or
              withdrawal with fake tokens, see what is public or private, and
              reuse the same interface pattern with a compatible real wallet.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href="/workbench">
                Start the 60-second Sandbox <ArrowRightIcon />
              </Link>
              <Link className={styles.secondaryAction} href="/integrate">
                View reusable components <ArrowRightIcon />
              </Link>
            </div>
          </div>

          <aside className={styles.inOneSentence} aria-labelledby="plain-title">
            <span aria-hidden="true">30-second answer</span>
            <h2 id="plain-title">Learn safely. Connect deliberately.</h2>
            <ol>
              <li>
                <strong>Try</strong>
                <span>Run a guided, simulated private-token action.</span>
              </li>
              <li>
                <strong>Understand</strong>
                <span>
                  See the privacy boundary and result in plain language.
                </span>
              </li>
              <li>
                <strong>Build</strong>
                <span>
                  Reuse the components and connect a supported wallet.
                </span>
              </li>
            </ol>
          </aside>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="quickstart-title">
        <SectionHeading
          number="01"
          label="60-second quickstart"
          title="Try one private move now."
          description="Your first useful step is the Sandbox. It teaches the workflow without requesting wallet access or moving real funds."
          id="quickstart-title"
        />

        <ol className={styles.quickstartGrid}>
          {quickstartSteps.map((step) => (
            <li key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>

        <Link className={styles.inlineAction} href="/workbench">
          Open Sandbox and choose an action <ArrowRightIcon />
        </Link>
      </section>

      <section className={styles.section} aria-labelledby="comparison-title">
        <SectionHeading
          number="02"
          label="Choose a mode"
          title="Sandbox and Real Wallet are not the same claim."
          description="Use Sandbox to learn quickly. Choose Real Wallet only when you intend to review a genuine action, approve it in your wallet, and pay network fees."
          id="comparison-title"
        />

        <div
          className={styles.comparison}
          role="table"
          aria-label="Sandbox and Real Wallet comparison"
        >
          <div className={styles.comparisonHead} role="row">
            <span role="columnheader">Difference</span>
            <strong role="columnheader">Sandbox</strong>
            <strong role="columnheader">Real Wallet</strong>
          </div>
          {comparisonRows.map((row) => (
            <div className={styles.comparisonRow} key={row.label} role="row">
              <strong role="rowheader">{row.label}</strong>
              <p data-mode="sandbox" role="cell">
                <span>Sandbox</span>
                {row.sandbox}
              </p>
              <p data-mode="real" role="cell">
                <span>Real Wallet</span>
                {row.real}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="developer-title">
        <SectionHeading
          number="03"
          label="Developer path"
          title="UI intent in. Wallet-approved action out."
          description="The reusable interface does not handle private material. It passes a reviewed action through an adapter to the compatible wallet boundary."
          id="developer-title"
        />

        <ol className={styles.developerPath}>
          {developerLayers.map((layer) => (
            <li key={layer.number}>
              <span>{layer.number}</span>
              <h3>{layer.title}</h3>
              <p>{layer.description}</p>
            </li>
          ))}
        </ol>

        <div className={styles.codePanel}>
          <div className={styles.codeExplanation}>
            <p>Small Wallet API example</p>
            <h3>Prepare before invoking.</h3>
            <p>
              The current adapter first asks the wallet to prepare and simulate
              the already-reviewed action. Only the invoke request can return a
              transaction hash, which the app then checks independently.
            </p>
            <ul>
              <li>Addresses and base-unit amounts come from reviewed input.</li>
              <li>The wallet keeps keys, notes, discovery, and proof data.</li>
              <li>A returned hash is not proof of a successful receipt.</li>
            </ul>
          </div>
          <pre aria-label="STRK20 Wallet API usage example">
            <code>{walletApiExample}</code>
          </pre>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="recovery-title">
        <SectionHeading
          number="04"
          label="Common errors"
          title="Recover without guessing."
          description="Different failures have different next steps. An uncertain transaction must be checked before anything is sent again."
          id="recovery-title"
        />

        <div className={styles.recoveryGrid}>
          {recoveryItems.map((item) => (
            <article key={item.title}>
              <span>Problem</span>
              <h3>{item.title}</h3>
              <p>{item.recovery}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="privacy-title">
        <SectionHeading
          number="05"
          label="Privacy boundary"
          title="Private in the pool. Public at the edges."
          description="Privacy is specific, not absolute. Review what each action reveals before approving a real-wallet request."
          id="privacy-title"
        />

        <div className={styles.boundaryGrid}>
          <article className={styles.boundaryCard} data-visibility="private">
            <div>
              <span>Inside the pool</span>
              <strong>Hidden by STRK20</strong>
            </div>
            <h3>Private transfer details</h3>
            <p>
              Sender-to-recipient links, private recipients, amounts, tokens,
              and spent notes can remain private inside the pool.
            </p>
          </article>

          <article className={styles.boundaryCard} data-visibility="public">
            <div>
              <span>Network edges</span>
              <strong>Still observable</strong>
            </div>
            <h3>Public activity</h3>
            <p>
              Deposits, withdrawals, timing, pool interactions, public
              recipients, and app-side DeFi details may remain visible.
            </p>
          </article>
        </div>

        <p className={styles.boundaryNote}>
          The hosted app does not request private keys, viewing keys, note
          contents, or proof payloads. Your wallet remains the approval and
          private-data boundary.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="evidence-title">
        <SectionHeading
          number="06"
          label="Current evidence"
          title={
            evidenceComplete
              ? "Submission evidence is published."
              : "Submission evidence is still incomplete."
          }
          description={`The current strk20.json lists ${transactionCount} mainnet transaction hashes, ${contractCount} contract addresses, ${hasDemo ? "a public demo URL" : "no public demo URL"}, and ${hasDemoVideo ? "a demo video" : "no demo video"}. Sandbox results do not fill mainnet evidence fields.`}
          id="evidence-title"
        />

        <div className={styles.evidenceStatus}>
          <div>
            <span>Repository status</span>
            <strong>
              {evidenceComplete ? "Evidence complete" : "Evidence incomplete"}
            </strong>
          </div>
          <dl>
            <div>
              <dt>Transactions</dt>
              <dd>{transactionCount} listed</dd>
            </div>
            <div>
              <dt>Contracts</dt>
              <dd>{contractCount} listed</dd>
            </div>
            <div>
              <dt>Public demo</dt>
              <dd>{hasDemo ? "Live" : "Not listed"}</dd>
            </div>
            <div>
              <dt>Demo video</dt>
              <dd>{hasDemoVideo ? "Listed" : "Not listed"}</dd>
            </div>
          </dl>
          <div className={styles.evidenceActions}>
            <Link href="/evidence">
              Open evidence review <ArrowRightIcon />
            </Link>
            <a
              href={`${repositoryRoot}/strk20.json`}
              target="_blank"
              rel="noreferrer"
            >
              Inspect strk20.json <ArrowRightIcon />
            </a>
          </div>
        </div>
      </section>

      <section className={styles.guides} aria-labelledby="guides-title">
        <SectionHeading
          number="07"
          label="Repository guides"
          title="Go deeper when you need to."
          description="These checked-in sources explain the product contract, implementation boundary, compatibility decisions, and current public metadata."
          id="guides-title"
        />

        <div className={styles.guideGrid}>
          {repositoryGuides.map((guide) => (
            <a
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
            </a>
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
