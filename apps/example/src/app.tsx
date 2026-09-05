import { useState } from "react";

import {
  FlowProgress,
  PrivacyFacts,
  PrivateTransfer,
  Shield,
  Withdraw,
  type PrivacyActionStatus,
  type PrivacyFlowStage,
} from "@strk20-workbench/react";

const stageOrder = ["shield", "private-transfer", "withdraw"] as const;

export function App() {
  const [stageIndex, setStageIndex] = useState(0);
  const [amount, setAmount] = useState("20");
  const [status, setStatus] = useState<PrivacyActionStatus>("idle");
  const stage: PrivacyFlowStage = stageOrder[stageIndex] ?? "complete";

  async function advance() {
    setStatus("pending");
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    setStatus("success");
    await new Promise((resolve) => window.setTimeout(resolve, 300));
    setStageIndex((current) => current + 1);
    setStatus("idle");
  }

  function reset() {
    setStageIndex(0);
    setAmount("20");
    setStatus("idle");
  }

  return (
    <main>
      <header className="example-header">
        <span className="example-brand">
          STRK<span>[20]</span> component example
        </span>
        <p>
          This small app imports the component package. It does not import the
          Workbench website.
        </p>
      </header>

      <FlowProgress stage={stage} />

      <div className="example-grid">
        {stage === "shield" ? (
          <Shield
            amount={amount}
            mode="sandbox"
            onAmountChange={setAmount}
            onSubmit={advance}
            status={status}
          />
        ) : null}
        {stage === "private-transfer" ? (
          <PrivateTransfer
            amount={amount}
            mode="sandbox"
            onAmountChange={setAmount}
            onSubmit={advance}
            status={status}
          />
        ) : null}
        {stage === "withdraw" ? (
          <Withdraw
            amount={amount}
            mode="sandbox"
            onAmountChange={setAmount}
            onSubmit={advance}
            status={status}
          />
        ) : null}
        {stage === "complete" ? (
          <section className="example-complete">
            <h1>Private flow complete.</h1>
            <p>
              All three reusable component states ran with fake Sandbox tokens.
            </p>
            <button onClick={reset} type="button">
              Start again
            </button>
          </section>
        ) : null}

        <PrivacyFacts
          action={stage === "complete" ? "private-transfer" : stage}
          amount={amount}
        />
      </div>
    </main>
  );
}
