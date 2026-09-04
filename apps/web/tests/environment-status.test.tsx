import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  EnvironmentStatus,
  type EnvironmentStatusItem,
} from "../components/environment-status";

const items: readonly EnvironmentStatusItem[] = [
  {
    label: "Execution mode",
    value: "Sandbox",
    detail: "Simulated proof only",
    tone: "ready",
  },
  {
    label: "Network",
    value: "Unknown",
    tone: "warning",
  },
  {
    label: "Wallet API",
    value: "Not connected",
    tone: "inactive",
  },
  {
    label: "Compatibility check",
    value: "Waiting for wallet selection",
    tone: "pending",
  },
];

describe("EnvironmentStatus", () => {
  it("renders semantic environment facts with an accessible label", () => {
    const html = renderToStaticMarkup(
      <EnvironmentStatus
        ariaLabel="Current runtime environment"
        items={items}
      />,
    );

    expect(html).toContain('aria-label="Current runtime environment"');
    expect(html).toContain("<dl");
    expect(html).toContain("<dt");
    expect(html).toContain("<dd");
    expect(html).toContain("Execution mode");
    expect(html).toContain("Sandbox");
    expect(html).toContain("Simulated proof only");
    expect(html).toContain("Network");
    expect(html).toContain("Unknown");
    expect(html).toContain("Wallet API");
    expect(html).toContain("Not connected");
  });

  it("writes every status tone into the rendered output", () => {
    const html = renderToStaticMarkup(<EnvironmentStatus items={items} />);

    expect(html).toContain('aria-label="Environment status"');
    expect(html).toContain("Ready");
    expect(html).toContain("Warning");
    expect(html).toContain("Inactive");
    expect(html).toContain("Pending");
  });
});
