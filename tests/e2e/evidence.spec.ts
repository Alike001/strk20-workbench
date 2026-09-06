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
  const unverifiedReceiptHeadings = page.getByRole("heading", {
    name: "Confirmation not visible",
  });
  await expect(unverifiedReceiptHeadings).toHaveCount(3);
  await expect(unverifiedReceiptHeadings.first()).toBeVisible();
  await expect(
    page.getByText(
      "0x039372b04a863fd5cd016f2715034dc6286b7c61f63abe96199ddf65b35da6c0",
    ),
  ).toBeVisible();
  await expect(
    page.getByText(
      "0x04fbfb9204259a2c26aa4c5550f6bfd3acd67c4821ab23a7c50c537338093b20",
    ),
  ).toBeVisible();
  await expect(
    page.getByText(
      "0x0029a150756c3184bb1818cc0b471277dd6cd19a860d5d4069cfcaea4418a597",
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
