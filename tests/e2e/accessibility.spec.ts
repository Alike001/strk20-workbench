import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const publicRoutes = [
  ["landing page", "/"],
  ["workbench", "/workbench"],
  ["components", "/integrate"],
  ["documentation", "/documentation"],
  ["evidence", "/evidence"],
] as const;

for (const [name, route] of publicRoutes) {
  test(`${name} has no serious or critical automated accessibility violations`, async ({
    page,
  }) => {
    await page.goto(route);

    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const blockingViolations = violations
      .filter(({ impact }) => impact === "serious" || impact === "critical")
      .map(({ help, id, nodes }) => ({
        help,
        id,
        targets: nodes.map(({ target }) => target),
      }));

    expect(blockingViolations).toEqual([]);
  });
}
