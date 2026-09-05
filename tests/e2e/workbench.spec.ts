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
  await expect(
    page.getByText("Sandbox · No wallet · No real funds"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Shield 50 tokens" }),
  ).toBeEnabled();
  await page.screenshot({
    path: "/tmp/strk20-workbench-initial.png",
    fullPage: true,
  });

  await page.getByRole("button", { name: "Shield 50 tokens" }).click();
  await expect(
    page.getByRole("button", { name: "Send 20 tokens privately" }),
  ).toBeVisible();
  await expect(
    page.getByRole("article").filter({ hasText: "Alice" }),
  ).toContainText("50");
  await page.getByRole("button", { name: "Send 20 tokens privately" }).click();
  await expect(
    page.getByRole("button", { name: "Withdraw 10 tokens" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Withdraw 10 tokens" }).click();
  await expect(
    page.getByRole("heading", { name: "Alice paid Bob privately." }),
  ).toBeVisible();
  await expect(
    page.getByRole("article").filter({ hasText: "Bob" }),
  ).toContainText("10");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "/tmp/strk20-workbench-complete.png",
    fullPage: true,
  });

  await page.reload();
  await expect(page.getByRole("button", { name: "Start again" })).toBeVisible();
  const persisted = await page.evaluate(() =>
    localStorage.getItem("strk20-workbench:sandbox:v1"),
  );
  expect(persisted).not.toContain("walletSession");

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Start again" }).click();
  await page.getByLabel("shield amount").fill("40");
  await page.getByRole("button", { name: "Shield 40 tokens" }).click();
  await page.getByLabel("transfer amount").fill("15");
  await page.getByRole("button", { name: "Send 15 tokens privately" }).click();
  await page.getByLabel("withdraw amount").fill("5");
  await page.getByRole("button", { name: "Withdraw 5 tokens" }).click();
  await expect(
    page.getByRole("article").filter({ hasText: "Alice" }),
  ).toContainText("60");
  await expect(
    page.getByRole("article").filter({ hasText: "Alice" }),
  ).toContainText("25");
  await expect(
    page.getByRole("article").filter({ hasText: "Bob" }),
  ).toContainText("5");

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Start again" }).click();
  await page.getByText("Developer details", { exact: true }).click();
  await page.getByText("Test recovery").click();
  await page.getByRole("button", { name: "Shield 50 tokens" }).click();
  await expect(
    page.getByRole("heading", { name: "Proof service unavailable" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Retry safely" }).click();
  await expect(
    page.getByRole("button", { name: "Send 20 tokens privately" }),
  ).toBeVisible();

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
