import type { LabAction } from "@strk20-workbench/lab-core";

import styles from "./workbench.module.css";

export function PrivacyXRay({
  action = "private-transfer",
  amount,
}: Readonly<{ action?: LabAction["type"]; amount?: string }>) {
  const facts = plainFacts(action, amount);
  return (
    <aside className={styles.privacyXray} aria-labelledby="privacy-xray-title">
      <div className={styles.sectionHeading}>
        <h2 id="privacy-xray-title">What can people see?</h2>
      </div>
      <ul>
        {facts.map((fact) => (
          <li data-visibility={fact.visibility} key={fact.visibility}>
            <span aria-hidden="true" />
            <div>
              <strong>{fact.visibility}</strong>
              <p>{fact.explanation}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className={styles.boundaryNote}>
        This playground is simulated. It teaches the same public and private
        boundaries without using real funds.
      </p>
    </aside>
  );
}

function plainFacts(action: LabAction["type"], amount = "the selected") {
  if (action === "shield") {
    return [
      {
        visibility: "Visible",
        explanation: `Alice deposited ${amount} tokens into the privacy pool.`,
      },
      {
        visibility: "Private",
        explanation: "What Alice does with those tokens inside the pool.",
      },
    ] as const;
  }
  if (action === "withdraw") {
    return [
      {
        visibility: "Visible",
        explanation: `Bob received ${amount} public tokens when he withdrew.`,
      },
      {
        visibility: "Private",
        explanation:
          "The private transfers that happened before the withdrawal.",
      },
    ] as const;
  }
  return [
    {
      visibility: "Visible",
      explanation:
        "Someone interacted with the privacy pool, including the timing.",
    },
    {
      visibility: "Private",
      explanation: "Who paid, who received, the token and the amount.",
    },
  ] as const;
}
