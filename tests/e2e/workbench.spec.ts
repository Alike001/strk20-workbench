import { expect, test } from "@playwright/test";

test("canonical flow, persistence, custom amounts, failure recovery, and responsive layout", async ({
  page,
}) => {
  await page.goto("/workbench", {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByLabel("Current workbench environment")).toBeAttached();
  await expect(
    page.getByRole("button", { name: "Run next step" }),
  ).toBeEnabled();
  await page.screenshot({
    path: "/tmp/strk20-workbench-initial.png",
    fullPage: true,
  });

  await page.getByRole("button", { name: "Run next step" }).click();
  await expect(
    page.getByRole("article").filter({ hasText: "Alice" }),
  ).toContainText("Registered");
  await expect(
    page.getByRole("article").filter({ hasText: "Bob" }),
  ).toContainText("Registered");
  await page.getByRole("button", { name: "Run next step" }).click();
  await expect(
    page.getByRole("article").filter({ hasText: "Alice" }),
  ).toContainText(/50\s*LAB/);
  await page.getByRole("button", { name: "Run next step" }).click();
  await expect(
    page.getByRole("article").filter({ hasText: "Bob" }),
  ).toContainText(/20\s*LAB/);
  await page.getByRole("button", { name: "Run next step" }).click();
  await expect(
    page.getByRole("button", { name: "Scenario complete" }),
  ).toBeVisible();
  await expect(
    page.getByRole("article").filter({ hasText: "Bob" }),
  ).toContainText(/10\s*LAB/);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "/tmp/strk20-workbench-complete.png",
    fullPage: true,
  });

  await page.reload();
  await expect(
    page.getByRole("button", { name: "Scenario complete" }),
  ).toBeVisible();
  const persisted = await page.evaluate(() =>
    localStorage.getItem("strk20-workbench:sandbox:v1"),
  );
  expect(persisted).not.toContain("walletSession");

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset Sandbox" }).click();
  await page.getByLabel("shield amount").fill("40");
  await page.getByLabel("transfer amount").fill("15");
  await page.getByLabel("withdraw amount").fill("5");
  await page.getByRole("button", { name: "Run all" }).click();
  await expect(
    page.getByRole("article").filter({ hasText: "Alice" }),
  ).toContainText(/60\s*LAB/);
  await expect(
    page.getByRole("article").filter({ hasText: "Alice" }),
  ).toContainText(/25\s*LAB/);
  await expect(
    page.getByRole("article").filter({ hasText: "Bob" }),
  ).toContainText(/5\s*LAB/);

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset Sandbox" }).click();
  await page.getByText("Test recovery").click();
  await page.getByRole("button", { name: "Run next step" }).click();
  await expect(
    page.getByRole("heading", { name: "Proof service unavailable" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Retry safely" }).click();
  await expect(
    page.getByRole("article").filter({ hasText: "Alice" }),
  ).toContainText("Registered");

  const desktopOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(desktopOverflow).toBeLessThanOrEqual(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "/tmp/strk20-workbench-mobile.png",
    fullPage: true,
  });
  const mobileOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(mobileOverflow).toBeLessThanOrEqual(0);
});
