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
  await expect(page.getByText("No wallet is visible yet.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue in Sandbox" }),
  ).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
});

test("guides an unregistered account through wallet-owned first-use setup", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const runtime = window as typeof window & {
      __balanceReads: number;
      __invokeCalls: number;
      __prepareCalls: number;
      __preparedAmount?: string;
      __registered: boolean;
    };
    runtime.__balanceReads = 0;
    runtime.__invokeCalls = 0;
    runtime.__prepareCalls = 0;
    runtime.__registered = false;
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
          request: async ({
            type,
            params,
          }: {
            type: string;
            params?: { actions?: Array<{ amount?: string }> };
          }) => {
            if (type === "wallet_requestChainId") return "SN_MAIN";
            if (type === "wallet_supportedWalletApi") return ["0.10.3"];
            if (type === "wallet_supportedSpecs") return ["0.8"];
            if (type === "wallet_strk20Balances") {
              runtime.__balanceReads += 1;
              return runtime.__registered
                ? [
                    {
                      token:
                        "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
                      balance: "1000000000000000000",
                    },
                  ]
                : Promise.reject({
                    code: 118,
                    message: "An error occurred (NOT_REGISTERED)",
                  });
            }
            if (type === "wallet_strk20PrepareInvoke") {
              runtime.__prepareCalls += 1;
              throw new Error("The combined flow must not call prepare.");
            }
            if (type === "wallet_strk20InvokeTransaction") {
              runtime.__invokeCalls += 1;
              runtime.__preparedAmount = params?.actions?.[0]?.amount;
              if (runtime.__preparedAmount !== "0x6f05b59d3b200000") {
                return Promise.reject({
                  code: 114,
                  message: "An error occurred (INVALID_REQUEST_PAYLOAD)",
                });
              }
              if (!runtime.__registered) {
                return Promise.reject({
                  code: 118,
                  message: "An error occurred (NOT_REGISTERED)",
                });
              }
              return Promise.reject({
                code: 163,
                message: "An error occurred (UNKNOWN_ERROR)",
                data: {
                  error: {
                    code: "PROVER_FAILED",
                    message:
                      "The proving service could not finish this action.",
                  },
                },
              });
            }
            throw new Error(`Unexpected wallet request: ${type}`);
          },
        },
      },
    };

    window.addEventListener("wallet-standard:app-ready", (event) => {
      window.setTimeout(() => {
        (
          event as CustomEvent<{ register(candidate: unknown): void }>
        ).detail.register(wallet);
      }, 500);
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
  const delayedWallet = page.getByRole("button", { name: /QA Ready Wallet/ });
  await expect(delayedWallet).toBeVisible();
  await delayedWallet.click();

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
    page.getByText("shield once from its own privacy screen", {
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

  const shieldAmount = page.getByRole("textbox", {
    name: "Total public STRK to deposit",
  });
  await shieldAmount.fill("1");
  await expect(
    page.getByText("Expected private STRK received", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("0 STRK", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Enter more than 6 STRK", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Review real action" }),
  ).toBeDisabled();

  await shieldAmount.fill("8");
  await expect(page.getByText("2 STRK", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Review real action" }).click();
  await expect(page.getByText("Expected private increase")).toBeVisible();
  await expect(page.getByText("2 STRK", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue to wallet approvals" }),
  ).toBeVisible();
  await expect(
    page.getByText("Continuing starts proof preparation", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText("Nothing can be submitted without wallet approval", {
      exact: false,
    }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Continue to wallet approvals" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Finish registration inside QA Ready Wallet.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Wallet API 0.10.3 has no registration method", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "I shielded in QA Ready Wallet — check again",
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => (window as typeof window & { __invokeCalls: number }).__invokeCalls,
    ),
  ).toBe(1);

  await page.evaluate(() => {
    (window as typeof window & { __registered: boolean }).__registered = true;
  });
  await page
    .getByRole("button", {
      name: "I shielded in QA Ready Wallet — check again",
    })
    .click();
  await expect(
    page.getByText("Registration confirmed. Review the action once more", {
      exact: false,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Continue to wallet approvals" })
    .click();
  await expect(page.getByText("Safe failure details")).toBeVisible();
  await expect(
    page.getByText("Wallet submission", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("163", { exact: true })).toBeVisible();
  await expect(
    page.getByText("The proving service could not finish this action."),
  ).toBeVisible();
  await expect(
    page.getByText("No hash returned by wallet", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (
          window as typeof window & {
            __preparedAmount?: string;
          }
        ).__preparedAmount,
    ),
  ).toBe("0x6f05b59d3b200000");
  expect(
    await page.evaluate(
      () => (window as typeof window & { __invokeCalls: number }).__invokeCalls,
    ),
  ).toBe(2);
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { __prepareCalls: number }).__prepareCalls,
    ),
  ).toBe(0);
  await page.screenshot({
    path: "/tmp/strk20-safe-failure-diagnostic.png",
    fullPage: false,
  });
});
