import { describe, expect, it, vi } from "vitest";

import type {
  ActionResult,
  AdapterEvent,
  LabAction,
  LabAdapter,
  TransactionStatus,
} from "@strk20-workbench/lab-core";

import { RealActionController } from "../lib/wallet/real-action-controller";

const action: LabAction = {
  type: "private-transfer",
  from: "alice",
  to: "bob",
  token: { id: "0x123" },
  amount: 1n,
};

function adapter(input?: {
  result?: ActionResult;
  events?: readonly AdapterEvent[];
  receipt?: TransactionStatus;
}): Pick<LabAdapter, "execute" | "getTransactionStatus"> {
  const defaultResult: ActionResult = {
    status: "succeeded",
    proofKind: "real",
    transactionHash: "0xabc",
  };
  return {
    execute: vi.fn(async (_action, options) => {
      for (const event of input?.events ?? []) options.onEvent(event);
      return input?.result ?? defaultResult;
    }),
    getTransactionStatus: vi.fn(async (transactionHash) => {
      const defaultReceipt: TransactionStatus = {
        status: "succeeded",
        transactionHash,
      };
      return input?.receipt ?? defaultReceipt;
    }),
  };
}

describe("RealActionController", () => {
  it("requires review and exposes every wallet execution phase", async () => {
    const states: string[] = [];
    const wallet = adapter({
      events: [
        { type: "action.awaiting-user" },
        { type: "proof.preparing" },
        {
          type: "transaction.submitted",
          payload: { transactionHash: "0xabc" },
        },
        {
          type: "transaction.confirming",
          payload: { transactionHash: "0xabc" },
        },
      ],
    });
    const controller = new RealActionController({
      adapter: wallet,
      onChange: (state) => states.push(state.phase),
    });

    await expect(controller.confirm()).rejects.toThrow(/review/i);
    controller.review(action, "transfer-1");
    await expect(controller.confirm()).resolves.toMatchObject({
      phase: "succeeded",
      transactionHash: "0xabc",
    });
    expect(states).toEqual([
      "review",
      "awaiting-wallet",
      "awaiting-wallet",
      "preparing-proof",
      "submitting",
      "confirming",
      "succeeded",
    ]);
  });

  it("deduplicates parallel confirmation calls", async () => {
    let finish: ((result: ActionResult) => void) | undefined;
    const execute = vi.fn(
      () =>
        new Promise<ActionResult>((resolve) => {
          finish = resolve;
        }),
    );
    const controller = new RealActionController({
      adapter: {
        execute,
        getTransactionStatus: vi.fn(),
      },
    });
    controller.review(action, "transfer-2");

    const first = controller.confirm();
    const second = controller.confirm();
    expect(first).toBe(second);
    expect(execute).toHaveBeenCalledTimes(1);
    finish?.({ status: "cancelled", reason: "User rejected request" });
    await expect(first).resolves.toMatchObject({ phase: "cancelled" });
  });

  it("allows retry review after failure but never after uncertainty", async () => {
    const failed = new RealActionController({
      adapter: adapter({
        result: {
          status: "failed",
          error: {
            code: "PROVER_BUSY",
            title: "Prover busy",
            explanation: "Try again later.",
            nextAction: "Retry",
            retryable: true,
            phase: "preparing-proof",
            mode: "real",
            network: "SN_MAIN",
          },
        },
      }),
    });
    failed.review(action, "transfer-3");
    await failed.confirm();
    expect(failed.retryReview().phase).toBe("review");

    const uncertainAdapter = adapter({
      result: {
        status: "uncertain",
        transactionHash: "0xdef",
      },
      receipt: { status: "pending", transactionHash: "0xdef" },
    });
    const uncertain = new RealActionController({ adapter: uncertainAdapter });
    uncertain.review(action, "transfer-4");
    await uncertain.confirm();
    expect(() => uncertain.review(action, "different")).toThrow(/check/i);
    await expect(uncertain.checkSubmittedTransaction()).resolves.toMatchObject({
      phase: "uncertain",
      transactionHash: "0xdef",
    });
    expect(uncertainAdapter.execute).toHaveBeenCalledTimes(1);
  });

  it("polls an uncertain hash to success without resubmitting", async () => {
    const wallet = adapter({
      result: { status: "uncertain", transactionHash: "0x789" },
      receipt: { status: "succeeded", transactionHash: "0x789" },
    });
    const controller = new RealActionController({ adapter: wallet });
    controller.review(action, "transfer-5");
    await controller.confirm();

    await expect(controller.checkSubmittedTransaction()).resolves.toMatchObject(
      {
        phase: "succeeded",
        transactionHash: "0x789",
      },
    );
    expect(wallet.execute).toHaveBeenCalledTimes(1);
    expect(wallet.getTransactionStatus).toHaveBeenCalledWith(
      "0x789",
      undefined,
    );
  });
});
