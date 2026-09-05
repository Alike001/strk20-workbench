import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import IntroductionPage from "../app/(product)/page";
import { ModeBadge, ProductMap } from "../components/product-shell";

describe("product shell", () => {
  it("labels the execution truth without relying on colour", () => {
    const html = renderToStaticMarkup(<ModeBadge />);

    expect(html).toContain("Execution mode");
    expect(html).toContain("Sandbox");
    expect(html).toContain("Simulated proof");
  });

  it("shows the sandbox-to-mainnet adoption path", () => {
    const html = renderToStaticMarkup(<ProductMap />);

    expect(html).toContain("Same scenario, moving through the stack");
    expect(html).toContain("Sandbox");
    expect(html).toContain("Wallet API");
    expect(html).toContain("Mainnet evidence");
  });

  it("presents the workbench as honest STRK20 developer infrastructure", () => {
    const html = renderToStaticMarkup(<IntroductionPage />);

    expect(html).toContain("Private token flows, ready to build.");
    expect(html).toContain("Not one component — a toolkit for STRK20.");
    expect(html).toContain("@strk20-workbench/lab-core");
    expect(html).toContain("Workspace ready");
    expect(html).toContain("Extracting next");
    expect(html).toContain("Pending first mainnet run");
    expect(html).toContain("Not verified yet");
    expect(html).not.toContain("Verified on mainnet");
  });
});
