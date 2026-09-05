export type PrivacyFlowStage =
  "shield" | "private-transfer" | "withdraw" | "complete";

const stages = [
  { id: "shield", label: "Shield" },
  { id: "private-transfer", label: "Send privately" },
  { id: "withdraw", label: "Withdraw" },
] as const;

export function FlowProgress({ stage }: { readonly stage: PrivacyFlowStage }) {
  const activeIndex =
    stage === "complete"
      ? stages.length
      : stages.findIndex((item) => item.id === stage);

  return (
    <ol className="strk20-progress" aria-label="Private transfer progress">
      {stages.map((item, index) => {
        const state =
          index < activeIndex
            ? "complete"
            : index === activeIndex
              ? "active"
              : "waiting";
        return (
          <li
            aria-current={state === "active" ? "step" : undefined}
            data-state={state}
            key={item.id}
          >
            <span>{index + 1}</span>
            <strong>{item.label}</strong>
            <i aria-hidden="true" />
          </li>
        );
      })}
    </ol>
  );
}
