import { LockIcon } from "./icons";
import styles from "./product-shell.module.css";

export function PrivacyScenario() {
  return (
    <section className={styles.scenario} aria-labelledby="scenario-title">
      <header className={styles.scenarioHeader}>
        <div>
          <h2 id="scenario-title">Private transfer scenario</h2>
          <p>
            mode: <strong>sandbox</strong> <span aria-hidden="true">|</span>{" "}
            proof: <strong>simulated</strong> <span aria-hidden="true">|</span>{" "}
            network: local simulation
          </p>
        </div>
        <span className={styles.scenarioState}>Scenario preview</span>
      </header>

      <div className={styles.scenarioBody}>
        <div
          className={styles.flowCanvas}
          aria-label="Alice to Bob private transfer diagram"
        >
          <Actor name="Alice" role="Sender" />
          <div className={styles.privatePool}>
            <span>STRK20 shielded pool</span>
            <div className={styles.noteFlow}>
              <Note owner="Alice" />
              <span className={styles.flowLine} aria-label="Private transfer">
                <i />
                <b>Private transfer</b>
              </span>
              <Note owner="Bob" />
            </div>
            <p>Commitments onchain · ownership encrypted</p>
          </div>
          <Actor name="Bob" role="Recipient" />
        </div>

        <PrivacyXRay />
      </div>
    </section>
  );
}

function Actor({ name, role }: Readonly<{ name: string; role: string }>) {
  return (
    <div className={styles.actor}>
      <span>{role}</span>
      <strong>{name}</strong>
      <small>
        {name === "Alice" ? "Public → private" : "Private → public"}
      </small>
    </div>
  );
}

function Note({ owner }: { owner: string }) {
  return (
    <div className={styles.note}>
      <span>
        Shielded note <LockIcon />
      </span>
      <b aria-hidden="true">••••••••</b>
      <small>{owner}&apos;s private balance</small>
    </div>
  );
}

function PrivacyXRay() {
  const facts = [
    {
      title: "Public deposit",
      body: "Depositor, token, amount and timing are visible.",
      tone: "public",
    },
    {
      title: "Hidden in pool",
      body: "Sender, recipient, amount, token and spent notes stay private.",
      tone: "private",
    },
    {
      title: "Public withdrawal",
      body: "Recipient, token, amount and timing are visible.",
      tone: "public",
    },
  ] as const;

  return (
    <aside className={styles.xray} aria-labelledby="xray-title">
      <h3 id="xray-title">Privacy X-ray</h3>
      <ol>
        {facts.map((fact) => (
          <li data-tone={fact.tone} key={fact.title}>
            <span aria-hidden="true" />
            <div>
              <strong>{fact.title}</strong>
              <p>{fact.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
