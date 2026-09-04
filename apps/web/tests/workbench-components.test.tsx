import {
  createCanonicalScenarioState,
  createLabError,
} from "@strk20-workbench/lab-core";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  AdvancedDetails,
  ErrorRecoveryPanel,
  PrivacyXRay,
  ScenarioSteps,
  TransactionTimeline,
} from "../components/workbench";

const noop = () => undefined;

describe("workbench presentation components", () => {
  it("shows actionable guided steps and controlled-failure copy", () => {
    const html = renderToStaticMarkup(
      <ScenarioSteps
        busy={false}
        complete={false}
        failNext={false}
        amounts={{ shield: "50", transfer: "20", withdraw: "10" }}
        onAmountChange={noop}
        onFailNextChange={noop}
        onReset={noop}
        onRunAll={noop}
        onRunStep={noop}
        steps={[
          {
            label: "Register",
            description: "Register both actors.",
            status: "ready",
          },
          {
            label: "Shield",
            description: "Create a private balance.",
            status: "waiting",
          },
        ]}
      />,
    );
    expect(html).toContain("Run next step");
    expect(html).toContain("Run all");
    expect(html).toContain("Test recovery");
  });

  it("projects empty timeline, privacy facts, errors, and advanced truth", () => {
    const state = createCanonicalScenarioState();
    const timeline = renderToStaticMarkup(
      <TransactionTimeline
        events={state.timeline}
        onSelectStep={noop}
        steps={state.steps}
      />,
    );
    expect(timeline).toContain("No actions yet");
    expect(
      renderToStaticMarkup(<PrivacyXRay action="private-transfer" />),
    ).toContain("Chain observers cannot read");
    const error = createLabError({
      code: "PROVER_UNAVAILABLE",
      mode: "sandbox",
      network: "SANDBOX",
      phase: "preparing-proof",
    });
    expect(
      renderToStaticMarkup(
        <ErrorRecoveryPanel busy={false} error={error} onRetry={noop} />,
      ),
    ).toContain("Retry safely");
    expect(
      renderToStaticMarkup(
        <AdvancedDetails onOpenChange={noop} open state={state} />,
      ),
    ).toContain("simulated");
  });
});
