import Link from "next/link";
import type { JSX } from "react";

import { ArrowRightIcon } from "../product-shell";
import styles from "./components-page.module.css";

const components = [
  {
    number: "01",
    name: "Shield",
    description: "Move public tokens into a private balance.",
    icon: "shield",
  },
  {
    number: "02",
    name: "Send privately",
    description: "Transfer without exposing the recipient or amount.",
    icon: "send",
  },
  {
    number: "03",
    name: "Withdraw",
    description: "Move private tokens back to a public wallet.",
    icon: "withdraw",
  },
] as const;

const adoptionSteps = [
  {
    number: "1",
    title: "Try it in Sandbox.",
    description:
      "Use fake tokens to understand the complete flow without a wallet or real funds.",
  },
  {
    number: "2",
    title: "Add the component to an app.",
    description:
      "Choose the building blocks your product needs when the reusable React package is ready.",
  },
  {
    number: "3",
    title: "Connect a supported STRK20 wallet for real mode.",
    description:
      "The future real-mode path will hand genuine network actions to a compatible wallet.",
  },
] as const;

function ComponentIcon({
  name,
}: {
  name: (typeof components)[number]["icon"];
}): JSX.Element {
  if (name === "shield") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M6 8h20v16H6z" />
        <path d="M10 4v8M22 4v8M10 20v8M22 20v8" />
      </svg>
    );
  }

  if (name === "send") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M4 16h23M19 8l8 8-8 8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 22V4M9 11l7-7 7 7" />
      <path d="M6 18v9h20v-9" />
    </svg>
  );
}

export function ComponentsPage(): JSX.Element {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="components-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Reusable STRK20 components</p>
          <h1 id="components-title">Private transfers, ready to add.</h1>
          <p className={styles.intro}>
            Ready-made private-transfer building blocks. Try them safely in the
            playground, then add them to a Starknet app.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/workbench">
              Open playground <ArrowRightIcon />
            </Link>
            <Link className={styles.secondaryAction} href="/documentation">
              Read documentation <ArrowRightIcon />
            </Link>
          </div>
        </div>

        <aside className={styles.statusPanel} aria-label="Component kit status">
          <div className={styles.statusHeading}>
            <span>Kit status</span>
            <strong>React package · In development</strong>
          </div>
          <p>
            The Sandbox playground works today. The reusable package interface
            is being finalized in parallel.
          </p>
          <dl className={styles.productLayers}>
            <div>
              <dt>Product</dt>
              <dd>Reusable components</dd>
            </div>
            <div>
              <dt>Showroom</dt>
              <dd>Sandbox playground</dd>
            </div>
            <div>
              <dt>Engine</dt>
              <dd>Lab Core</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section
        className={styles.componentSection}
        aria-labelledby="kit-heading"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>The private-transfer kit</p>
          <h2 id="kit-heading">Three building blocks. One private flow.</h2>
          <p>
            Start with the complete lifecycle, or choose only the action your
            product needs.
          </p>
        </div>

        <ol className={styles.componentGrid}>
          {components.map((component) => (
            <li key={component.name}>
              <article className={styles.componentCard}>
                <div className={styles.cardTopline}>
                  <span>{component.number}</span>
                  <span>Sandbox preview</span>
                </div>
                <span className={styles.componentIcon}>
                  <ComponentIcon name={component.icon} />
                </span>
                <h3>{component.name}</h3>
                <p>{component.description}</p>
                <Link href="/workbench">
                  Try in Sandbox <ArrowRightIcon />
                </Link>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.adoption} aria-labelledby="adoption-heading">
        <div className={styles.adoptionIntro}>
          <p className={styles.eyebrow}>A safe adoption path</p>
          <h2 id="adoption-heading">From playground to production.</h2>
          <p>
            Learn the flow first. Add reusable UI when the package is ready.
            Bring in a supported wallet only when moving to real mode.
          </p>
        </div>

        <ol className={styles.adoptionSteps}>
          {adoptionSteps.map((step) => (
            <li key={step.number}>
              <span>{step.number}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <aside
        className={styles.truthBoundary}
        aria-label="Sandbox truth boundary"
      >
        <div>
          <span className={styles.truthMark} aria-hidden="true">
            i
          </span>
          <div>
            <strong>Know what is real.</strong>
            <p>
              Sandbox uses fake tokens and simulated results. Real mode will use
              a supported STRK20 wallet for genuine network actions; that path
              is still in development.
            </p>
          </div>
        </div>
        <Link href="/workbench">
          Open playground <ArrowRightIcon />
        </Link>
      </aside>
    </main>
  );
}
