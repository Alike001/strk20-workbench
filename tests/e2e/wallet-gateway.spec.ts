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

test("explains an unregistered private balance request after explicit consent", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const runtime = window as typeof window & { __balanceReads: number };
    runtime.__balanceReads = 0;
    const wallet = {
      version: "2.4.1",
      name: "QA Ready Wallet",
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
      chains: ["starknet:SN_MAIN"],
      accounts: [],
      features: {
        "standard:connect": {
          version: "1.0.0",
          connect: async () => ({ accounts: [{ address: "0x1234" }] }),
        },
        "standard:disconnect": {
          version: "1.0.0",
          disconnect: async () => undefined,
        },
        "standard:events": {
          version: "1.0.0",
          on: () => () => undefined,
        },
        "starknet:walletApi": {
          version: "1.0.0",
          walletVersion: "1.0.0",
          id: "qa-ready-wallet",
          request: async ({ type }: { type: string }) => {
            if (type === "wallet_requestChainId") return "SN_MAIN";
            if (type === "wallet_supportedWalletApi") return ["0.10.3"];
            if (type === "wallet_supportedSpecs") return ["0.8"];
            if (type === "wallet_strk20Balances") {
              runtime.__balanceReads += 1;
              return Promise.reject({
                code: 118,
                message: "An error occurred (NOT_REGISTERED)",
              });
            }
            throw new Error(`Unexpected wallet request: ${type}`);
          },
        },
      },
    };

    window.addEventListener("wallet-standard:app-ready", (event) => {
      (
        event as CustomEvent<{ register(candidate: unknown): void }>
      ).detail.register(wallet);
    });
  });

  await page.route("**/api/starknet", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "qa",
        result: "0x534e5f4d41494e",
      }),
    });
  });
  await page.route("**/api/pool-fee", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        feeAmount: "6000000000000000000",
        feeFormatted: "6 STRK",
      }),
    });
  });

  await page.goto("/workbench");
  await page.getByRole("button", { name: "Connect wallet" }).click();
  await page.getByRole("button", { name: /QA Ready Wallet/ }).click();

  await expect(page.getByText("Hidden until you ask")).toBeVisible();
  await expect(page.getByText("2.4.1", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { __balanceReads: number }).__balanceReads,
    ),
  ).toBe(0);

  await page
    .getByRole("button", { name: "Check private STRK balance" })
    .click();
  await expect(
    page.getByText("Your first successful shield registers it automatically", {
      exact: false,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { __balanceReads: number }).__balanceReads,
    ),
  ).toBe(1);

  await expect(page.getByText("No transaction was started.")).toBeVisible();
});
