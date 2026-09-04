import { getPrivacyFacts, type LabAction } from "@strk20-workbench/lab-core";

import styles from "./workbench.module.css";

export function PrivacyXRay({
  action = "private-transfer",
}: Readonly<{ action?: LabAction["type"] }>) {
  const facts = getPrivacyFacts(action);
  return (
    <aside className={styles.privacyXray} aria-labelledby="privacy-xray-title">
      <div className={styles.sectionHeading}>
        <div>
          <h2 id="privacy-xray-title">Privacy X-ray</h2>
          <p>{actionLabel(action)} visibility, based on the STRK20 model.</p>
        </div>
      </div>
      <ul>
        {facts.map((fact) => (
          <li data-visibility={fact.visibility} key={fact.field}>
            <span aria-hidden="true" />
            <div>
              <strong>{fact.field}</strong>
              <small>{fact.visibility}</small>
              <p>{fact.explanation}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className={styles.boundaryNote}>
        Timing and pool interaction can remain visible. Sandbox results are not
        privacy proofs.
      </p>
    </aside>
  );
}

function actionLabel(action: LabAction["type"]): string {
  return action === "private-transfer" ? "Private transfer" : action;
}
