import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import DocumentationPage from "../app/(product)/documentation/page";

function renderPage(): string {
  return renderToStaticMarkup(<DocumentationPage />);
}

describe("Documentation page", () => {
  it("explains the product value and gives visitors an immediate first action", () => {
    const html = renderPage();

    expect(html).toContain("What Workbench does");
    expect(html).toContain("See how private money moves work.");
    expect(html).toContain(
      "rehearse a shield, private transfer, or withdrawal with fake tokens",
    );
    expect(html).toContain("Learn safely. Connect deliberately.");
    expect(html).toContain("Start the 60-second Sandbox");
    expect(html).toContain('href="/workbench"');
    expect(html).toContain("View reusable components");
    expect(html).toContain('href="/integrate"');
  });

  it("shows the complete 60-second quickstart in order", () => {
    const html = renderPage();
    const steps = [
      "Open Sandbox",
      "Choose an action",
      "Review visibility",
      "Run it",
      "Inspect the result",
    ];

    for (const [index, step] of steps.entries()) {
      expect(html).toContain(step);
      if (index > 0) {
        expect(html.indexOf(step)).toBeGreaterThan(
          html.indexOf(steps[index - 1]!),
        );
      }
    }

    expect(html).toContain("Open Sandbox and choose an action");
  });

  it("distinguishes Sandbox learning from deliberate real-wallet use", () => {
    const html = renderPage();

    expect(html).toContain("Sandbox and Real Wallet are not the same claim.");
    expect(html).toContain("Fake tokens only");
    expect(html).toContain("No wallet required");
    expect(html).toContain("Simulated and never mainnet evidence");
    expect(html).toContain("Real assets and network fees");
    expect(html).toContain("Compatible privacy-enabled wallet required");
    expect(html).toContain(
      "Wallet-produced; public receipt checked separately",
    );
    expect(html).toContain(
      'role="table" aria-label="Sandbox and Real Wallet comparison"',
    );
    expect(html).toContain('role="columnheader"');
    expect(html).toContain('role="rowheader"');
  });

  it("explains the component, adapter, and wallet path", () => {
    const html = renderPage();
    const layers = ["React components", "Adapter layer", "Privacy wallet"];

    for (const [index, layer] of layers.entries()) {
      expect(html).toContain(layer);
      if (index > 0) {
        expect(html.indexOf(layer)).toBeGreaterThan(
          html.indexOf(layers[index - 1]!),
        );
      }
    }

    expect(html).toContain("maps a reviewed Lab Core action");
    expect(html).toContain("Keeps keys, notes, discovery, proving, signing");
  });

  it("uses the same prepare-then-invoke Wallet API flow as the adapter", () => {
    const html = renderPage();

    expect(html).toContain("Small Wallet API example");
    expect(html).toContain("account.strk20PrepareInvoke(actions, true)");
    expect(html).toContain("account.strk20InvokeTransaction(actions)");
    expect(html).toContain("transaction_hash");
    expect(html).toContain("A returned hash is not proof");
    expect(html).not.toContain("wallet_strk20Submit");
  });

  it("gives distinct recovery steps for common real-wallet failures", () => {
    const html = renderPage();

    expect(html).toContain("Wallet unsupported");
    expect(html).toContain("Wallet API 0.10.3 or newer");
    expect(html).toContain("Wrong network");
    expect(html).toContain("Switch the wallet to Starknet Mainnet");
    expect(html).toContain("Proof service busy or failed");
    expect(html).toContain("Confirmation uncertain");
    expect(html).toContain("Do not submit the action again");
    expect(html).toContain("Recipient not registered");
  });

  it("states what STRK20 can hide and what remains public", () => {
    const html = renderPage();

    expect(html).toContain("Private in the pool. Public at the edges.");
    expect(html).toContain(
      "Sender-to-recipient links, private recipients, amounts, tokens, and spent notes can remain private",
    );
    expect(html).toContain(
      "Deposits, withdrawals, timing, pool interactions, public recipients, and app-side DeFi details may remain visible.",
    );
    expect(html).toContain("The hosted app does not request private keys");
    expect(html).not.toContain("everything is private");
  });

  it("reports live repository evidence without completion claims", () => {
    const html = renderPage();

    expect(html).toContain("Submission evidence is still incomplete.");
    expect(html).toContain(
      "strk20.json lists 0 mainnet transaction hashes, 0 contract addresses, a public demo URL, and no demo video",
    );
    expect(html.match(/0 listed/g)).toHaveLength(2);
    expect(html).toContain("Live");
    expect(html.match(/Not listed/g)).toHaveLength(1);
    expect(html).toContain("Evidence incomplete");
    expect(html).toContain('href="/evidence"');
    expect(html).not.toMatch(/production[- ]ready/i);
    expect(html).not.toMatch(/mainnet evidence (?:is )?(?:ready|complete)/i);
  });

  it("keeps repository guide links valid and safely external", () => {
    const html = renderPage();

    expect(html).toContain("context/product-requirements.md");
    expect(html).toContain("context/technical-specification.md");
    expect(html).toContain("docs/compatibility.md");
    expect(html).toContain("strk20.json");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer"');
    expect(html).toContain('aria-current="page"');
  });
});
