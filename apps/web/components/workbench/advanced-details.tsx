import type { ScenarioState } from "@strk20-workbench/lab-core";

import styles from "./workbench.module.css";

export function AdvancedDetails({
  state,
  open,
  onOpenChange,
}: Readonly<{
  state: ScenarioState;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>) {
  const selected = state.steps.at(-1);
  return (
    <details
      className={styles.advancedDetails}
      onToggle={(event) => onOpenChange(event.currentTarget.open)}
      open={open}
    >
      <summary>Advanced details</summary>
      <dl>
        <div>
          <dt>Run ID</dt>
          <dd>{state.runId}</dd>
        </div>
        <div>
          <dt>Proof kind</dt>
          <dd>{state.proofKind}</dd>
        </div>
        <div>
          <dt>Latest transaction</dt>
          <dd>{selected?.transactionHash ?? "Not created"}</dd>
        </div>
        <div>
          <dt>Evidence records</dt>
          <dd>{state.evidence.length}</dd>
        </div>
      </dl>
      <pre>{safeStringify(selected ?? { status: "idle" })}</pre>
    </details>
  );
}

function safeStringify(value: unknown): string {
  return JSON.stringify(
    value,
    (_, child) => (typeof child === "bigint" ? child.toString() : child),
    2,
  );
}
