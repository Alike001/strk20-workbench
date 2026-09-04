import type { LabEvent, ScenarioStep } from "@strk20-workbench/lab-core";

import styles from "./workbench.module.css";

const visibleEventTypes = new Set<LabEvent["type"]>([
  "action.validation-started",
  "proof.preparing",
  "transaction.submitted",
  "transaction.confirming",
  "action.succeeded",
  "action.cancelled",
  "action.failed",
  "transaction.uncertain",
]);

export function TransactionTimeline({
  events,
  steps,
  selectedStepId,
  onSelectStep,
}: Readonly<{
  events: readonly LabEvent[];
  steps: readonly ScenarioStep[];
  selectedStepId?: string;
  onSelectStep: (stepId: string) => void;
}>) {
  const visible = events
    .filter((event) => event.stepId && visibleEventTypes.has(event.type))
    .slice(-12)
    .reverse();

  return (
    <section className={styles.timeline} aria-labelledby="timeline-title">
      <div className={styles.sectionHeading}>
        <div>
          <h2 id="timeline-title">Transaction timeline</h2>
          <p>One source of truth for every simulated action and status.</p>
        </div>
        <span>{steps.length} actions</span>
      </div>

      {visible.length === 0 ? (
        <div className={styles.emptyTimeline}>
          <strong>No actions yet.</strong>
          <p>Run Register to begin the inspectable scenario.</p>
        </div>
      ) : (
        <ol className={styles.timelineList} aria-live="polite">
          {visible.map((event) => {
            const step = steps.find((item) => item.id === event.stepId);
            const isFinal =
              event.type === "action.succeeded" ||
              event.type === "action.failed" ||
              event.type === "action.cancelled" ||
              event.type === "transaction.uncertain";
            return (
              <li data-final={isFinal || undefined} key={event.id}>
                <button
                  aria-pressed={selectedStepId === event.stepId}
                  onClick={() => onSelectStep(event.stepId!)}
                  type="button"
                >
                  <span aria-hidden="true" />
                  <div>
                    <strong>{eventLabel(event.type)}</strong>
                    <small>
                      {step ? actionLabel(step) : "Scenario action"} ·{" "}
                      {event.proofKind}
                    </small>
                  </div>
                  <time dateTime={event.timestamp}>
                    {shortTime(event.timestamp)}
                  </time>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function eventLabel(type: LabEvent["type"]): string {
  const labels: Partial<Record<LabEvent["type"], string>> = {
    "action.validation-started": "Action validated",
    "proof.preparing": "Simulated proof prepared",
    "transaction.submitted": "Simulation submitted",
    "transaction.confirming": "Simulation confirmed",
    "action.succeeded": "Action succeeded",
    "action.cancelled": "Action cancelled",
    "action.failed": "Action failed",
    "transaction.uncertain": "Status uncertain",
  };
  return labels[type] ?? type;
}

function actionLabel(step: ScenarioStep): string {
  if (step.action.type === "private-transfer") return "Private transfer";
  return `${step.action.type[0]?.toUpperCase()}${step.action.type.slice(1)}`;
}

function shortTime(timestamp: string): string {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? "simulated"
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
