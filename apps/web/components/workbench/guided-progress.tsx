import styles from "./workbench.module.css";

export type PlaygroundStage =
  "shield" | "private-transfer" | "withdraw" | "complete";

const stages = [
  { id: "shield", label: "Shield" },
  { id: "private-transfer", label: "Send privately" },
  { id: "withdraw", label: "Withdraw" },
] as const;

export function GuidedProgress({ stage }: { stage: PlaygroundStage }) {
  const activeIndex =
    stage === "complete"
      ? stages.length
      : stages.findIndex((item) => item.id === stage);

  return (
    <ol className={styles.progressRail} aria-label="Private transfer progress">
      {stages.map((item, index) => {
        const state =
          index < activeIndex
            ? "complete"
            : index === activeIndex
              ? "active"
              : "waiting";
        return (
          <li data-state={state} key={item.id}>
            <span>{index + 1}</span>
            <strong>{item.label}</strong>
            <i aria-hidden="true" />
          </li>
        );
      })}
    </ol>
  );
}
