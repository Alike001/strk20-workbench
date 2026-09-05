import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  FlowProgress,
  PrivacyFacts,
  PrivateTransfer,
  Shield,
  Withdraw,
} from "../src";

const actionProps = {
  amount: "20",
  mode: "sandbox" as const,
  onAmountChange: vi.fn(),
  onSubmit: vi.fn(),
};

describe("STRK20 React components", () => {
  it.each([
    [Shield, "Shield", "Shield 20 tokens"],
    [PrivateTransfer, "Send privately", "Send 20 tokens privately"],
    [Withdraw, "Withdraw", "Withdraw 20 tokens"],
  ])("renders %s with an understandable action", (Component, title, button) => {
    const markup = renderToStaticMarkup(<Component {...actionProps} />);

    expect(markup).toContain(`>${title}</h2>`);
    expect(markup).toContain(button);
    expect(markup).toContain("Sandbox uses fake tokens");
    expect(markup).toContain("No wallet or real funds are involved");
  });

  it("labels real mode without claiming the component executes by itself", () => {
    const markup = renderToStaticMarkup(
      <PrivateTransfer {...actionProps} mode="real" />,
    );

    expect(markup).toContain(
      "Real mode requests execution through a supported STRK20 wallet",
    );
  });

  it("renders the reusable flow and privacy explanation", () => {
    const progress = renderToStaticMarkup(
      <FlowProgress stage="private-transfer" />,
    );
    const facts = renderToStaticMarkup(
      <PrivacyFacts action="private-transfer" amount="20" />,
    );

    expect(progress).toContain('aria-current="step"');
    expect(progress).toContain("Shield");
    expect(progress).toContain("Send privately");
    expect(progress).toContain("Withdraw");
    expect(facts).toContain("What can people see?");
    expect(facts).toContain("Who paid, who received, the token and the amount");
  });
});
