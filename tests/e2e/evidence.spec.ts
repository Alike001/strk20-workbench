import { expect, test } from "@playwright/test";

test("shows only repository-backed public evidence and remains responsive", async ({
  page,
}) => {
  await page.goto("/evidence");

  await expect(
    page.getByRole("heading", { name: "Evidence, not privacy claims." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /0 of 3 verified/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Confirmation not visible" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "0x039372b04a863fd5cd016f2715034dc6286b7c61f63abe96199ddf65b35da6c0",
    ),
  ).toBeVisible();
  await expect(
    page.getByText("Checked-in hashes are not trusted automatically."),
  ).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasOverflow).toBe(false);
});
