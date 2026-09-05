import type { LabAction } from "@strk20-workbench/lab-core";

export interface PrivacyFactsProps {
  readonly action?: Extract<
    LabAction["type"],
    "shield" | "private-transfer" | "withdraw"
  >;
  readonly amount?: string;
  readonly className?: string;
}

export function PrivacyFacts({
  action = "private-transfer",
  amount = "the selected",
  className,
}: PrivacyFactsProps) {
  const facts = plainFacts(action, amount);
  const classes = ["strk20-facts", className].filter(Boolean).join(" ");

  return (
    <aside className={classes}>
      <h2>What can people see?</h2>
      <ul>
        {facts.map((fact) => (
          <li
            data-visibility={fact.visibility.toLowerCase()}
            key={fact.visibility}
          >
            <span aria-hidden="true" />
            <div>
              <strong>{fact.visibility}</strong>
              <p>{fact.explanation}</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function plainFacts(
  action: NonNullable<PrivacyFactsProps["action"]>,
  amount: string,
) {
  if (action === "shield") {
    return [
      {
        visibility: "Visible",
        explanation: `A deposit of ${amount} tokens into the privacy pool.`,
      },
      {
        visibility: "Private",
        explanation: "What happens to those tokens inside the pool.",
      },
    ] as const;
  }
  if (action === "withdraw") {
    return [
      {
        visibility: "Visible",
        explanation: `A public withdrawal of ${amount} tokens.`,
      },
      {
        visibility: "Private",
        explanation: "The private transfers that happened before withdrawal.",
      },
    ] as const;
  }
  return [
    {
      visibility: "Visible",
      explanation:
        "Someone interacted with the privacy pool, including timing.",
    },
    {
      visibility: "Private",
      explanation: "Who paid, who received, the token and the amount.",
    },
  ] as const;
}
