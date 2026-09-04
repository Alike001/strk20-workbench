import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  ActorCard,
  type ActorCardProps,
  type ActorRegistrationState,
} from "../components/actor-card";

const longAddress =
  "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const actor: ActorCardProps = {
  name: "Alice",
  address: longAddress,
  registration: "registered",
  publicBalance: { amount: "50", symbol: "STRK" },
  privateBalance: { amount: "30", symbol: "STRK" },
};

function renderActor(
  registration: ActorRegistrationState,
  active?: boolean,
): string {
  return renderToStaticMarkup(
    <ActorCard {...actor} active={active} registration={registration} />,
  );
}

describe("ActorCard", () => {
  it("renders every actor field with semantic balance markup", () => {
    const html = renderActor("registered");

    expect(html).toContain("<article");
    expect(html).toContain("<h3");
    expect(html).toContain("Alice");
    expect(html).toContain("<dl");
    expect(html).toContain("<dt");
    expect(html).toContain("<dd");
    expect(html).toContain("Public balance");
    expect(html).toContain("Private balance");
    expect(html).toContain("50");
    expect(html).toContain("30");
    expect(html.match(/STRK/g)).toHaveLength(2);
    expect(html).toContain("Registration");
    expect(html).toContain("Registered");
  });

  it("keeps a long address visible and available as its full title", () => {
    const html = renderActor("registered");

    expect(html).toContain(longAddress);
    expect(html).toContain(`title="${longAddress}"`);
    expect(html).toContain(`aria-label="Full address: ${longAddress}"`);
  });

  it("writes all registration states as visible labels", () => {
    expect(renderActor("registered")).toContain("Registered");
    expect(renderActor("not-registered")).toContain("Not registered");
    expect(renderActor("pending")).toContain("Pending");
  });

  it("adds emphasis for active actors without changing their data", () => {
    const inactiveHtml = renderActor("registered");
    const activeHtml = renderActor("registered", true);

    expect(inactiveHtml).toContain('data-active="false"');
    expect(inactiveHtml).not.toContain("Active actor");
    expect(activeHtml).toContain('data-active="true"');
    expect(activeHtml).toContain("Active actor");
    expect(activeHtml).toContain("Alice");
    expect(activeHtml).toContain(longAddress);
    expect(activeHtml).toContain("Public balance");
    expect(activeHtml).toContain("Private balance");
    expect(activeHtml).toContain("50");
    expect(activeHtml).toContain("30");
    expect(activeHtml).toContain("Registered");
  });
});
