import { getBalance, type ScenarioState } from "@strk20-workbench/lab-core";

import type { PlaygroundStage } from "./guided-progress";
import styles from "./workbench.module.css";

type AmountField = "shield" | "transfer" | "withdraw";

interface ActionContent {
  readonly field: AmountField;
  readonly title: string;
  readonly description: string;
  readonly button: (amount: string) => string;
  readonly arrow: (amount: string) => string;
}

const content: Record<Exclude<PlaygroundStage, "complete">, ActionContent> = {
  shield: {
    field: "shield",
    title: "First, make Alice’s tokens private.",
    description:
      "Shielding moves tokens from Alice’s public wallet into her private balance.",
    button: (amount) => `Shield ${amount} tokens`,
    arrow: (amount) => `Shield ${amount}`,
  },
  "private-transfer": {
    field: "transfer",
    title: "Next, send tokens to Bob privately.",
    description:
      "The transfer happens inside the privacy pool, hiding who received it and how much moved.",
    button: (amount) => `Send ${amount} tokens privately`,
    arrow: (amount) => `Send ${amount}`,
  },
  withdraw: {
    field: "withdraw",
    title: "Finally, return tokens to Bob’s public wallet.",
    description:
      "Withdrawing turns part of Bob’s private balance back into public tokens.",
    button: (amount) => `Withdraw ${amount} tokens`,
    arrow: (amount) => `Withdraw ${amount}`,
  },
};

export function GuidedAction({
  stage,
  scenario,
  amounts,
  busy,
  hydrated,
  onAmountChange,
  onRunStep,
  onRunAll,
  onReset,
}: Readonly<{
  stage: PlaygroundStage;
  scenario: ScenarioState;
  amounts: Readonly<Record<AmountField, string>>;
  busy: boolean;
  hydrated: boolean;
  onAmountChange: (field: AmountField, value: string) => void;
  onRunStep: () => void;
  onRunAll: () => void;
  onReset: () => void;
}>) {
  if (stage === "complete") {
    return (
      <section className={styles.actionSurface} aria-labelledby="action-title">
        <div className={styles.actionForm}>
          <p className={styles.completionMark}>Example complete</p>
          <h2 id="action-title">Alice paid Bob privately.</h2>
          <p>
            You shielded Alice’s tokens, transferred value without exposing the
            payment, and withdrew part of Bob’s balance publicly.
          </p>
          <button
            className={styles.primaryButton}
            disabled={busy}
            onClick={onReset}
            type="button"
          >
            Start again
          </button>
        </div>
        <div className={styles.balanceStory}>
          <BalanceSnapshot
            name="Alice"
            privateAmount={balance(scenario, "alice", "private")}
            publicAmount={balance(scenario, "alice", "public")}
          />
          <FlowArrow label="Private payment complete" />
          <BalanceSnapshot
            name="Bob"
            privateAmount={balance(scenario, "bob", "private")}
            publicAmount={balance(scenario, "bob", "public")}
          />
        </div>
      </section>
    );
  }

  const current = content[stage];
  const amount = amounts[current.field];
  const prediction = predict(stage, scenario, amount);

  return (
    <section className={styles.actionSurface} aria-labelledby="action-title">
      <div className={styles.actionForm}>
        <h2 id="action-title">{current.title}</h2>
        <p>{current.description}</p>
        <label className={styles.singleAmount}>
          <span>Amount</span>
          <span>
            <input
              aria-label={`${current.field} amount`}
              disabled={busy}
              inputMode="numeric"
              onChange={(event) =>
                onAmountChange(current.field, event.target.value)
              }
              pattern="[0-9]*"
              value={amount}
            />
            <small>tokens</small>
          </span>
        </label>
        <button
          className={styles.primaryButton}
          disabled={busy || !hydrated}
          onClick={onRunStep}
          type="button"
        >
          {busy ? "Running…" : current.button(amount)}
          <span aria-hidden="true">→</span>
        </button>
        <button
          className={styles.runAllButton}
          disabled={busy || !hydrated}
          onClick={onRunAll}
          type="button"
        >
          Run the complete example <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className={styles.balanceStory}>
        <BalanceSnapshot {...prediction.before} />
        <FlowArrow label={current.arrow(amount)} />
        <BalanceSnapshot {...prediction.after} />
      </div>
    </section>
  );
}

function BalanceSnapshot({
  name,
  publicAmount,
  privateAmount,
  hint,
}: Readonly<{
  name: string;
  publicAmount: bigint;
  privateAmount: bigint;
  hint?: string;
}>) {
  return (
    <article className={styles.balanceSnapshot}>
      <header>
        <span aria-hidden="true">{name[0]}</span>
        <strong>{name}</strong>
      </header>
      {hint ? <p>{hint}</p> : null}
      <dl>
        <div>
          <dt>Public</dt>
          <dd>{publicAmount.toString()}</dd>
        </div>
        <div>
          <dt>Private</dt>
          <dd>{privateAmount.toString()}</dd>
        </div>
      </dl>
    </article>
  );
}

function FlowArrow({ label }: { label: string }) {
  return (
    <div className={styles.flowArrow} aria-label={label}>
      <span>{label}</span>
      <i aria-hidden="true" />
    </div>
  );
}

function predict(
  stage: Exclude<PlaygroundStage, "complete">,
  scenario: ScenarioState,
  rawAmount: string,
) {
  const amount = safeBigInt(rawAmount);
  if (stage === "shield") {
    const currentPublic = balance(scenario, "alice", "public");
    const currentPrivate = balance(scenario, "alice", "private");
    return {
      before: {
        name: "Alice",
        publicAmount: currentPublic,
        privateAmount: currentPrivate,
        hint: "Before shielding",
      },
      after: {
        name: "Alice",
        publicAmount: subtractFloor(currentPublic, amount),
        privateAmount: currentPrivate + amount,
        hint: "After shielding",
      },
    };
  }
  if (stage === "private-transfer") {
    return {
      before: {
        name: "Alice",
        publicAmount: balance(scenario, "alice", "public"),
        privateAmount: balance(scenario, "alice", "private"),
        hint: "Sender",
      },
      after: {
        name: "Bob",
        publicAmount: balance(scenario, "bob", "public"),
        privateAmount: balance(scenario, "bob", "private") + amount,
        hint: "Recipient after transfer",
      },
    };
  }
  const currentPublic = balance(scenario, "bob", "public");
  const currentPrivate = balance(scenario, "bob", "private");
  return {
    before: {
      name: "Bob",
      publicAmount: currentPublic,
      privateAmount: currentPrivate,
      hint: "Before withdrawing",
    },
    after: {
      name: "Bob",
      publicAmount: currentPublic + amount,
      privateAmount: subtractFloor(currentPrivate, amount),
      hint: "After withdrawing",
    },
  };
}

function balance(
  state: ScenarioState,
  actor: "alice" | "bob",
  kind: "public" | "private",
): bigint {
  return getBalance(state, actor, "lab-token", kind);
}

function safeBigInt(value: string): bigint {
  try {
    return /^\d+$/.test(value) ? BigInt(value) : 0n;
  } catch {
    return 0n;
  }
}

function subtractFloor(value: bigint, amount: bigint): bigint {
  return amount > value ? 0n : value - amount;
}
