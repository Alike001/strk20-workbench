import {
  createCanonicalScenarioState,
  createLabError,
} from "@strk20-workbench/lab-core";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  AdvancedDetails,
  ErrorRecoveryPanel,
  GuidedAction,
  GuidedProgress,
  PrivacyXRay,
  TransactionTimeline,
} from "../components/workbench";

const noop = () => undefined;

describe("workbench presentation components", () => {
  it("shows the friendly three-step journey and current action", () => {
    const state = createCanonicalScenarioState();
    const html = renderToStaticMarkup(
      <>
        <GuidedProgress stage="shield" />
        <GuidedAction
          scenario={state}
          stage="shield"
          busy={false}
          hydrated
          amounts={{ shield: "50", transfer: "20", withdraw: "10" }}
          onAmountChange={noop}
          onReset={noop}
          onRunAll={noop}
          onRunStep={noop}
        />
      </>,
    );
    expect(html).toContain("Shield 50 tokens");
    expect(html).toContain("Send privately");
    expect(html).toContain("Run the complete example");
    expect(html).not.toContain("nullifier");
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
    ).toContain("Who paid, who received");
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
