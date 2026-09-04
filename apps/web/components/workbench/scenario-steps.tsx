import styles from "./workbench.module.css";

export interface ScenarioStepView {
  readonly label: string;
  readonly description: string;
  readonly status: "complete" | "ready" | "waiting";
}

export function ScenarioSteps({
  steps,
  busy,
  complete,
  failNext,
  amounts,
  onRunStep,
  onRunAll,
  onReset,
  onFailNextChange,
  onAmountChange,
}: Readonly<{
  steps: readonly ScenarioStepView[];
  busy: boolean;
  complete: boolean;
  failNext: boolean;
  amounts: Readonly<{ shield: string; transfer: string; withdraw: string }>;
  onRunStep: () => void;
  onRunAll: () => void;
  onReset: () => void;
  onFailNextChange: (enabled: boolean) => void;
  onAmountChange: (
    field: "shield" | "transfer" | "withdraw",
    value: string,
  ) => void;
}>) {
  return (
    <section className={styles.controls} aria-labelledby="scenario-steps-title">
      <div className={styles.sectionHeading}>
        <div>
          <h2 id="scenario-steps-title">Guided scenario</h2>
          <p>Run one step or complete the full private-token lifecycle.</p>
        </div>
        <span>{complete ? "Complete" : busy ? "Running" : "Ready"}</span>
      </div>

      <ol className={styles.steps}>
        {steps.map((step, index) => (
          <li data-status={step.status} key={step.label}>
            <span className={styles.stepNumber}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <strong>{step.label}</strong>
              <p>{step.description}</p>
            </div>
            <small>{step.status}</small>
          </li>
        ))}
      </ol>

      <fieldset className={styles.amountEditor} disabled={busy || complete}>
        <legend>Scenario amounts · fictional LAB base units</legend>
        {(["shield", "transfer", "withdraw"] as const).map((field) => (
          <label key={field}>
            <span>{field === "transfer" ? "Private transfer" : field}</span>
            <input
              aria-label={`${field} amount`}
              inputMode="numeric"
              onChange={(event) => onAmountChange(field, event.target.value)}
              pattern="[0-9]*"
              value={amounts[field]}
            />
          </label>
        ))}
      </fieldset>

      <div className={styles.controlActions}>
        <button
          className={styles.primaryButton}
          disabled={busy || complete}
          onClick={onRunStep}
          type="button"
        >
          {busy ? "Running…" : complete ? "Scenario complete" : "Run next step"}
        </button>
        <button
          className={styles.secondaryButton}
          disabled={busy || complete}
          onClick={onRunAll}
          type="button"
        >
          Run all
        </button>
        <button
          className={styles.textButton}
          disabled={busy}
          onClick={onReset}
          type="button"
        >
          Reset Sandbox
        </button>
      </div>

      <label className={styles.failureToggle}>
        <input
          checked={failNext}
          disabled={busy || complete}
          onChange={(event) => onFailNextChange(event.target.checked)}
          type="checkbox"
        />
        <span>
          <strong>Test recovery</strong>
          <small>Make the next proof attempt fail once.</small>
        </span>
      </label>
    </section>
  );
}
