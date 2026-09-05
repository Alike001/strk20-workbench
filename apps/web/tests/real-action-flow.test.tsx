import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { LabAdapter } from "@strk20-workbench/lab-core";

import {
  RealActionFlow,
  buildPoolFeePreview,
  createReviewedAction,
  displayStatus,
  readPoolFee,
} from "../components/wallet-readiness";
import type { WalletApiAdapter } from "../lib/wallet/wallet-api-adapter";

const adapter = {
  execute: vi.fn(),
  getTransactionStatus: vi.fn(),
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
    expect(html).not.toContain('value="0.01"');
    expect(html).toContain("disabled");
    expect(
      (adapter as unknown as Pick<LabAdapter, "execute">).execute,
    ).not.toHaveBeenCalled();
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

  it("shows the expected cost and warns when the pool fee exceeds the amount", () => {
    const fee = { amount: 6_000_000_000_000_000_000n, label: "6 STRK" };

    expect(buildPoolFeePreview("0.01", fee)).toEqual({
      totalLabel: "6.01 STRK",
      warning:
        "The 6 STRK pool fee is greater than your 0.01 STRK amount. Review the cost before continuing.",
    });
    expect(buildPoolFeePreview("12", fee)).toEqual({
      totalLabel: "18 STRK",
    });
    expect(buildPoolFeePreview("", fee)).toBeUndefined();
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
});
