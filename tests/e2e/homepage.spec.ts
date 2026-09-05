import { expect, test } from "@playwright/test";

test.describe("toolkit homepage", () => {
  test("explains the product and keeps evidence honest", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Private token flows, ready to build.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Not one component — a toolkit for STRK20.",
      }),
    ).toBeVisible();
    await expect(
      page.getByText("@strk20-workbench/lab-core", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Extracting next")).toBeVisible();
    await expect(page.getByText("Not verified yet")).toHaveCount(3);

    await expect(
      page.getByRole("link", { name: "Try the playground" }),
    ).toHaveAttribute("href", "/workbench");
  });

  test("has no page-level mobile overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
    await expect(
      page.getByRole("link", { name: "Start building" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Real evidence, not a screenshot.",
      }),
    ).toBeVisible();
  });
});
