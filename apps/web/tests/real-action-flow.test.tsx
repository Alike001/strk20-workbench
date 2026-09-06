import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { LabAdapter } from "@strk20-workbench/lab-core";

import {
  RealActionFlow,
  MissingTransactionHashRecovery,
  buildSafeFailureDiagnostic,
  buildPoolFeePreview,
  createReviewedAction,
  displayStatus,
  isRegistrationRequired,
  privateBalanceErrorMessage,
  readPrivateStrkBalance,
  readPoolFee,
} from "../components/wallet-readiness";
import type { WalletApiAdapter } from "../lib/wallet/wallet-api-adapter";

const adapter = {
  execute: vi.fn(),
  getTransactionStatus: vi.fn(),
  readPrivateBalances: vi.fn(),
} as unknown as WalletApiAdapter;

describe("real action flow", () => {
  it("starts with a plain-language action builder and no wallet request", () => {
    const html = renderToStaticMarkup(
      <RealActionFlow adapter={adapter} walletName="Ready Wallet" />,
    );

    expect(html).toContain("Make one private money move.");
    expect(html).toContain("No transaction starts here.");
    expect(html).toContain("Make public STRK private");
    expect(html).toContain("Send private STRK");
    expect(html).toContain("Return private STRK to public");
    expect(html).toContain("Checking the official pool");
    expect(html).toContain("Enter an amount to see the expected STRK cost.");
    expect(html).toContain("Check private STRK balance");
    expect(html).toContain("Hidden until you ask");
    expect(html).not.toContain('value="0.01"');
    expect(html).toContain("disabled");
    expect(
      (adapter as unknown as Pick<LabAdapter, "execute">).execute,
    ).not.toHaveBeenCalled();
    expect(adapter.readPrivateBalances).not.toHaveBeenCalled();
  });

  it("shows a safe manual receipt path when a wallet omits the hash", () => {
    const html = renderToStaticMarkup(
      <MissingTransactionHashRecovery
        transactionHash=""
        walletName="Ready X"
        onChange={() => undefined}
        onCheck={() => undefined}
      />,
    );

    expect(html).toContain("The wallet did not return a hash to Workbench.");
    expect(html).toContain("find the latest Shield in Activity");
    expect(html).toContain("Do not make another shield.");
    expect(html).toContain("Check this transaction — do not resubmit");
    expect(html).toContain("cannot move funds");
  });

  it("shows visible progress while checking a recovered receipt", () => {
    const html = renderToStaticMarkup(
      <MissingTransactionHashRecovery
        checking
        transactionHash="0xabc"
        walletName="Ready X"
        onChange={() => undefined}
        onCheck={() => undefined}
      />,
    );

    expect(html).toContain("Checking Starknet receipt");
    expect(html).toContain("disabled");
  });

  it("reads and formats only the requested private STRK balance", async () => {
    const readPrivateBalances = vi.fn().mockResolvedValue([
      {
        token: `0x0${"4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"}`,
        balance: 12_500_000_000_000_000_000n,
      },
    ]);

    await expect(readPrivateStrkBalance({ readPrivateBalances })).resolves.toBe(
      "12.5 STRK",
    );
    expect(readPrivateBalances).toHaveBeenCalledOnce();
    expect(readPrivateBalances).toHaveBeenCalledWith(
      ["0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"],
      undefined,
    );
  });

  it("turns an unregistered balance response into first-use guidance", () => {
    expect(
      privateBalanceErrorMessage({
        code: "NOT_REGISTERED",
        title: "Private account not registered",
        explanation: "This actor must register first.",
        nextAction: "Register the actor.",
        retryable: false,
        phase: "awaiting-user",
        mode: "real",
        network: "SN_MAIN",
      }),
    ).toBe(
      "STRK20 is available, but this account has not completed one-time wallet setup. Open Ready X, shield once from its own privacy screen, then return and try again. No transaction was started.",
    );
    expect(
      isRegistrationRequired({
        code: "NOT_REGISTERED",
        phase: "preparing-proof",
      }),
    ).toBe(true);
    expect(isRegistrationRequired(new Error("Something else failed"))).toBe(
      false,
    );
  });

  it("accepts only a successful formatted pool fee response", async () => {
    const request = vi.fn().mockResolvedValue(
      Response.json({
        feeAmount: "6000000000000000000",
        feeFormatted: "6 STRK",
      }),
    );

    await expect(readPoolFee(request)).resolves.toEqual({
      amount: 6_000_000_000_000_000_000n,
      label: "6 STRK",
    });
    expect(request).toHaveBeenCalledWith(
      "/api/pool-fee",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );

    await expect(
      readPoolFee(
        vi
          .fn()
          .mockResolvedValue(
            Response.json({ feeAmount: "6", feeFormatted: "unknown" }),
          ),
      ),
    ).rejects.toThrow(/invalid/i);

    await expect(
      readPoolFee(
        vi
          .fn()
          .mockResolvedValue(
            Response.json({ feeAmount: "6", feeFormatted: "6 STRK" }),
          ),
      ),
    ).rejects.toThrow(/inconsistent/i);
  });

  it("subtracts the live fee from a shield and blocks a zero-private result", () => {
    const fee = { amount: 6_000_000_000_000_000_000n, label: "6 STRK" };

    expect(buildPoolFeePreview("1", fee, "shield")).toEqual({
      costLabel: "Public STRK leaving wallet",
      costValue: "1 STRK",
      outcomeLabel: "Expected private STRK received",
      outcomeValue: "0 STRK",
      note: "The 6 STRK pool fee is reserved from the shield amount, not added on top.",
      blocksReview: true,
      warning:
        "Enter more than 6 STRK. This amount would leave 0 STRK private after the pool fee.",
    });
    expect(buildPoolFeePreview("8", fee, "shield")).toEqual({
      costLabel: "Public STRK leaving wallet",
      costValue: "8 STRK",
      outcomeLabel: "Expected private STRK received",
      outcomeValue: "2 STRK",
      note: "The 6 STRK pool fee is reserved from the shield amount, not added on top.",
      blocksReview: false,
    });
    expect(buildPoolFeePreview("", fee)).toBeUndefined();
  });

  it("adds the live fee to private transfer and withdrawal requirements", () => {
    const fee = { amount: 6_000_000_000_000_000_000n, label: "6 STRK" };

    expect(buildPoolFeePreview("1", fee, "private-transfer")).toEqual({
      costLabel: "Private STRK balance required",
      costValue: "7 STRK",
      outcomeLabel: "Private recipient receives",
      outcomeValue: "1 STRK",
      note: "The 6 STRK pool fee is charged from your private balance in addition to this amount.",
      blocksReview: false,
    });
    expect(buildPoolFeePreview("1", fee, "withdraw")).toMatchObject({
      costValue: "7 STRK",
      outcomeLabel: "Public recipient receives",
      outcomeValue: "1 STRK",
    });
  });

  it("creates exact base-unit wallet actions from human amounts", () => {
    expect(
      createReviewedAction({
        action: "shield",
        amount: "1.25",
        recipient: "",
      }),
    ).toMatchObject({
      type: "shield",
      amount: 1_250_000_000_000_000_000n,
    });

    expect(
      createReviewedAction({
        action: "private-transfer",
        amount: "0.01",
        recipient: "0x123",
      }),
    ).toMatchObject({
      type: "private-transfer",
      to: "0x123",
      amount: 10_000_000_000_000_000n,
    });
  });

  it("rejects malformed recipients and maps controller language for the UI", () => {
    expect(() =>
      createReviewedAction({
        action: "withdraw",
        amount: "1",
        recipient: "not-an-address",
      }),
    ).toThrow(/valid Starknet/i);
    expect(displayStatus("submitting")).toBe("submitted");
    expect(displayStatus("cancelled")).toBe("cancelled");
    expect(displayStatus("uncertain")).toBe("uncertain");
  });

  it("exposes only sanitized wallet failure details", () => {
    const diagnostic = buildSafeFailureDiagnostic({
      code: "UNKNOWN",
      title: "Unexpected error",
      explanation: "The action stopped.",
      nextAction: "Inspect the details.",
      retryable: false,
      phase: "preparing-proof",
      mode: "real",
      network: "SN_MAIN",
      rawCause: {
        code: 163,
        message: "An error occurred at https://private-rpc.example/v2/secret",
        data: {
          error: {
            code: "PROVER_PREPARE_FAILED",
            message: "Prover unavailable; token=my-private-token",
          },
        },
      },
    });

    expect(diagnostic).toEqual({
      phase: "Proof preparation",
      workbenchCode: "UNKNOWN",
      walletCode: "163",
      walletMessage: "An error occurred at [redacted URL]",
      walletDetail: "Prover unavailable; token=[redacted]",
      transactionHash: "No hash returned by wallet",
    });
    expect(JSON.stringify(diagnostic)).not.toContain("private-rpc.example");
    expect(JSON.stringify(diagnostic)).not.toContain("my-private-token");
  });
});
