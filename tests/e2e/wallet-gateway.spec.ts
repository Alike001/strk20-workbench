import { expect, test } from "@playwright/test";

test("keeps Sandbox available when no privacy wallet is installed", async ({
  page,
}) => {
  await page.goto("/workbench");

  await expect(
    page.getByRole("heading", { name: "Move from learning to mainnet." }),
  ).toBeVisible();
  await expect(page.getByText("Connection never moves funds")).toBeVisible();

  await page.getByRole("button", { name: "Connect wallet" }).click();

  await expect(
    page.getByRole("heading", { name: "This wallet is not ready for STRK20" }),
  ).toBeVisible();
  await expect(
    page.getByText("No wallet is visible to this browser."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue in Sandbox" }),
  ).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
});
