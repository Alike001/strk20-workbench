import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import IntegratePage from "../app/(product)/integrate/page";

describe("Components page", () => {
  it("explains the component kit, adoption path, and truth boundary", () => {
    const html = renderToStaticMarkup(<IntegratePage />);

    expect(html).toContain("Private transfers, ready to add.");
    expect(html).toContain("Shield");
    expect(html).toContain("Send privately");
    expect(html).toContain("Withdraw");
    expect(html).toContain("React package · Workspace ready");
    expect(html).toContain("Try it in Sandbox.");
    expect(html).toContain("Add the component to an app.");
    expect(html).toContain("Connect a supported STRK20 wallet for real mode.");
    expect(html).toContain("Sandbox uses fake tokens and simulated results.");
    expect(html).toContain("pnpm install --frozen-lockfile");
    expect(html).toContain("pnpm --filter @strk20-workbench/example dev");
    expect(html).toContain("@strk20-workbench/react");
    expect(html).toContain("@strk20-workbench/react/styles.css");
    expect(html).toContain('href="/workbench"');
    expect(html).toContain('href="/documentation"');
  });

  it("does not present the workspace package as npm-published", () => {
    const html = renderToStaticMarkup(<IntegratePage />);

    expect(html).not.toContain("<code>npm install");
    expect(html).toContain("Workspace-only today");
  });
});
