import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

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
});
