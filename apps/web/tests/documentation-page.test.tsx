import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import DocumentationPage from "../app/(product)/documentation/page";

function renderPage(): string {
  return renderToStaticMarkup(<DocumentationPage />);
}

describe("Documentation page", () => {
  it("explains the product, audience, and toolkit readiness honestly", () => {
    const html = renderPage();

    expect(html).toContain("reusable infrastructure for Starknet developers");
    expect(html).toContain("shield, private-transfer, and withdraw flows");
    expect(html).toContain("Lab Core");
    expect(html).toContain("Wallet API adapter");
    expect(html).toContain("React components");
    expect(html).toContain("Workspace-ready");
    expect(html).toContain("App-integrated · extraction in progress");
    expect(html).toContain("Packages are not published to npm yet");
    expect(html).not.toContain("npm install @strk20-workbench");
  });

  it("shows the complete adoption path in order", () => {
    const html = renderPage();
    const stages = [
      "Sandbox",
      "Wallet capability check",
      "Action review",
      "Proof and submit",
      "Verified receipt",
    ];

    for (const [index, stage] of stages.entries()) {
      expect(html).toContain(stage);

      if (index > 0) {
        expect(html.indexOf(stage)).toBeGreaterThan(
          html.indexOf(stages[index - 1]!),
        );
      }
    }

    expect(html).toContain("A connection alone never proves compatibility");
  });

  it("states what is private and public without claiming total privacy", () => {
    const html = renderPage();

    expect(html).toContain(
      "Private inside the pool: sender, recipient, amount, token, and spent notes.",
    );
    expect(html).toContain(
      "Public at the edges: deposits, withdrawals, timing, and app-side DeFi activity.",
    );
    expect(html).toContain("The hosted app does not handle private keys");
  });

  it("keeps all four repository guide links", () => {
    const html = renderPage();

    expect(html).toContain("context/product-requirements.md");
    expect(html).toContain("context/technical-specification.md");
    expect(html).toContain("docs/compatibility.md");
    expect(html).toContain("context/strk20-architecture.md");
    expect(html).toContain('aria-current="page"');
  });
});
