import { describe, expect, it, vi } from "vitest";

import type {
  AdapterSnapshot,
  LabAction,
  TransactionStatus,
} from "@strk20-workbench/lab-core";

import {
  WalletApiAdapter,
  isMainnetChain,
  mapLabActionToStrk20,
  selectHighestWalletApiVersion,
  type Strk20WalletAccount,
  type TransactionVerifier,
} from "../lib/wallet/wallet-api-adapter";

const TOKEN = "0x1234";
const ALICE = "0xa11ce";
const BOB = "0xb0b";
const TX_HASH = "0xabc123";

function snapshot(): AdapterSnapshot {
  return {
    network: "SN_MAIN",
    proofKind: "unknown",
    actors: {
      alice: {
        id: "alice",
        name: "Alice",
        address: ALICE,
        registered: true,
        publicBalances: { [TOKEN]: 100n },
        privateBalances: { [TOKEN]: 50n },
      },
      bob: {
        id: "bob",
        name: "Bob",
        address: BOB,
        registered: true,
        publicBalances: { [TOKEN]: 0n },
        privateBalances: { [TOKEN]: 0n },
      },
    },
    tokens: {
      [TOKEN]: {
        id: TOKEN,
        symbol: "STRK",
        decimals: 18,
        fictional: false,
      },
    },
  };
}

function account(
  overrides: Partial<Strk20WalletAccount> = {},
): Strk20WalletAccount {
  return {
    address: ALICE,
    strk20Balances: vi
      .fn()
      .mockResolvedValue([{ token: TOKEN, balance: "50" }]),
    strk20PrepareInvoke: vi.fn().mockResolvedValue({}),
    strk20InvokeTransaction: vi
      .fn()
      .mockResolvedValue({ transaction_hash: TX_HASH }),
    ...overrides,
  };
}

function verifier(
  status: TransactionStatus["status"] = "succeeded",
): TransactionVerifier {
  return {
    getTransactionStatus: vi
      .fn()
      .mockResolvedValue({ status, transactionHash: TX_HASH }),
  };
}

function createAdapter(
  input: {
    account?: Strk20WalletAccount;
    verifier?: TransactionVerifier;
    chainId?: string;
    walletApiVersions?: readonly string[];
    poolConfigurationMatches?: boolean;
  } = {},
) {
  return new WalletApiAdapter({
    account: input.account ?? account(),
    walletName: "Privacy Wallet",
    walletApiVersions: input.walletApiVersions ?? ["0.10.3"],
    chainId: input.chainId ?? "SN_MAIN",
    snapshot: snapshot(),
    verifier: input.verifier ?? verifier(),
    poolConfigurationMatches: input.poolConfigurationMatches ?? true,
    now: () => "2026-09-05T00:00:00.000Z",
  });
}

const shield: LabAction = {
  type: "shield",
  actorId: "alice",
  token: { id: TOKEN },
  amount: 25n,
};

describe("WalletApiAdapter action mapping", () => {
  it("maps core actions to the published STRK20 Wallet API actions", () => {
    expect(mapLabActionToStrk20(shield, snapshot())).toEqual({
      type: "deposit",
      token: TOKEN,
      amount: "25",
    });
    expect(
      mapLabActionToStrk20(
        {
          type: "private-transfer",
          from: "alice",
          to: "bob",
          token: { id: TOKEN },
          amount: 12n,
        },
        snapshot(),
      ),
    ).toEqual({ type: "transfer", token: TOKEN, amount: "12", recipient: BOB });
    expect(
      mapLabActionToStrk20(
        {
          type: "private-transfer",
          from: "alice",
          to: "0xcafe",
          token: { id: TOKEN },
          amount: 3n,
        },
        snapshot(),
      ),
    ).toEqual({
      type: "transfer",
      token: TOKEN,
      amount: "3",
      recipient: "0xcafe",
    });
    expect(
      mapLabActionToStrk20(
        {
          type: "withdraw",
          actorId: "alice",
          recipient: ALICE,
          token: { id: TOKEN },
          amount: 4n,
        },
        snapshot(),
      ),
    ).toEqual({
      type: "withdraw",
      token: TOKEN,
      amount: "4",
      recipient: ALICE,
    });
  });

  it("does not invent a standalone registration transaction", () => {
    expect(() =>
      mapLabActionToStrk20({ type: "register", actorId: "alice" }, snapshot()),
    ).toThrow(/automatic on first STRK20 use/i);
  });

  it("recognizes text and felt encodings of Starknet Mainnet", () => {
    expect(isMainnetChain("SN_MAIN")).toBe(true);
    expect(isMainnetChain("0x534e5f4d41494e")).toBe(true);
    expect(isMainnetChain("SN_SEPOLIA")).toBe(false);
  });
});

describe("WalletApiAdapter safety boundaries", () => {
  it("selects the highest advertised Wallet API version numerically", () => {
    expect(selectHighestWalletApiVersion(["0.10.3", "0.7.2"])).toBe("0.10.3");
    expect(selectHighestWalletApiVersion(["invalid"])).toBeUndefined();
  });

  it("reports capabilities without requesting balances or preparing a proof", async () => {
    const wallet = account();
    const report = await createAdapter({ account: wallet }).getCapabilities();

    expect(report.checkedAt).toBe("2026-09-05T00:00:00.000Z");
    expect(
      report.capabilities.find((item) => item.name === "register-supported")
        ?.explanation,
    ).toMatch(/automatically/i);
    expect(wallet.strk20Balances).not.toHaveBeenCalled();
    expect(wallet.strk20PrepareInvoke).not.toHaveBeenCalled();
    expect(wallet.strk20InvokeTransaction).not.toHaveBeenCalled();
  });

  it("requests private balances only through the deliberate consent method", async () => {
    const wallet = account();
    const adapter = createAdapter({ account: wallet });

    await expect(adapter.readPrivateBalances([TOKEN])).resolves.toEqual([
      { token: TOKEN, balance: 50n },
    ]);
    expect(wallet.strk20Balances).toHaveBeenCalledWith([TOKEN]);
  });

  it("classifies structured Wallet API balance errors", async () => {
    const unregistered = account();
    vi.mocked(unregistered.strk20Balances).mockRejectedValue({
      code: 118,
      message: "An error occurred (NOT_REGISTERED)",
    });
    await expect(
      createAdapter({ account: unregistered }).readPrivateBalances([TOKEN]),
    ).rejects.toMatchObject({ code: "NOT_REGISTERED" });

    const refused = account();
    vi.mocked(refused.strk20Balances).mockRejectedValue({
      code: 113,
      message: "An error occurred (USER_REFUSED_OP)",
    });
    await expect(
      createAdapter({ account: refused }).readPrivateBalances([TOKEN]),
    ).rejects.toMatchObject({ code: "WALLET_REJECTED" });
  });

  it("blocks unsupported wallets and wrong networks before invoking methods", async () => {
    const unsupported = account();
    const unsupportedResult = await createAdapter({
      account: unsupported,
      walletApiVersions: ["0.10.2"],
    }).execute(shield, { idempotencyKey: "unsupported", onEvent: vi.fn() });
    expect(unsupportedResult).toMatchObject({
      status: "failed",
      error: { code: "WALLET_UNSUPPORTED", phase: "validating" },
    });

    const wrongNetwork = account();
    const wrongNetworkResult = await createAdapter({
      account: wrongNetwork,
      chainId: "SN_SEPOLIA",
    }).execute(shield, { idempotencyKey: "wrong-network", onEvent: vi.fn() });
    expect(wrongNetworkResult).toMatchObject({
      status: "failed",
      error: { code: "WRONG_NETWORK", phase: "validating" },
    });
    expect(unsupported.strk20PrepareInvoke).not.toHaveBeenCalled();
    expect(wrongNetwork.strk20PrepareInvoke).not.toHaveBeenCalled();
  });

  it("accepts a newer prerelease API but rejects malformed advertisements", async () => {
    const prerelease = await createAdapter({
      walletApiVersions: ["0.10.4-rc.1"],
    }).getCapabilities();
    expect(
      prerelease.capabilities.find(
        (item) => item.name === "wallet-methods-present",
      )?.status,
    ).toBe("ready");

    const malformed = await createAdapter({
      walletApiVersions: ["banana.99.99"],
    }).getCapabilities();
    expect(
      malformed.capabilities.find(
        (item) => item.name === "wallet-methods-present",
      )?.status,
    ).toBe("blocked");
  });

  it("prepares, submits, verifies, and emits normalized progress", async () => {
    const wallet = account();
    const check = verifier();
    const events: string[] = [];
    const adapter = createAdapter({ account: wallet, verifier: check });

    await expect(
      adapter.execute(shield, {
        idempotencyKey: "success",
        onEvent: (event) => events.push(event.type),
      }),
    ).resolves.toEqual({
      status: "succeeded",
      proofKind: "real",
      transactionHash: TX_HASH,
    });
    expect(wallet.strk20PrepareInvoke).toHaveBeenCalledWith(
      [{ type: "deposit", token: TOKEN, amount: "25" }],
      true,
    );
    expect(wallet.strk20InvokeTransaction).toHaveBeenCalledWith([
      { type: "deposit", token: TOKEN, amount: "25" },
    ]);
    expect(check.getTransactionStatus).toHaveBeenCalledWith(TX_HASH, undefined);
    expect(events).toEqual([
      "action.awaiting-user",
      "proof.preparing",
      "transaction.submitted",
      "transaction.confirming",
    ]);
  });

  it("treats wallet rejection as cancellation and prover pressure as retryable", async () => {
    const rejected = createAdapter({
      account: account({
        strk20PrepareInvoke: vi
          .fn()
          .mockRejectedValue(new Error("User rejected request")),
      }),
    });
    await expect(
      rejected.execute(shield, { idempotencyKey: "reject", onEvent: vi.fn() }),
    ).resolves.toMatchObject({ status: "cancelled" });

    const busy = createAdapter({
      account: account({
        strk20PrepareInvoke: vi
          .fn()
          .mockRejectedValue(new Error("Prover busy: 429")),
      }),
    });
    await expect(
      busy.execute(shield, { idempotencyKey: "busy", onEvent: vi.fn() }),
    ).resolves.toMatchObject({
      status: "failed",
      error: { code: "PROVER_BUSY", retryable: true },
    });
  });

  it("never resubmits while a submitted transaction remains uncertain", async () => {
    const wallet = account();
    const adapter = createAdapter({
      account: wallet,
      verifier: verifier("pending"),
    });
    const options = { idempotencyKey: "pending", onEvent: vi.fn() };

    const first = await adapter.execute(shield, options);
    const second = await adapter.execute(shield, options);

    expect(first).toMatchObject({
      status: "uncertain",
      transactionHash: TX_HASH,
      error: { code: "TRANSACTION_UNCERTAIN" },
    });
    expect(second).toEqual(first);
    expect(wallet.strk20InvokeTransaction).toHaveBeenCalledTimes(1);
  });

  it("blocks retry when submission times out before returning a hash", async () => {
    const wallet = account({
      strk20InvokeTransaction: vi
        .fn()
        .mockRejectedValue(new Error("Network timeout")),
    });
    const adapter = createAdapter({ account: wallet });
    const options = { idempotencyKey: "submission-timeout", onEvent: vi.fn() };

    const first = await adapter.execute(shield, options);
    const second = await adapter.execute(shield, options);
    expect(first).toMatchObject({
      status: "uncertain",
      error: { code: "TRANSACTION_UNCERTAIN", phase: "submitting" },
    });
    expect(second).toEqual(first);
    expect(wallet.strk20InvokeTransaction).toHaveBeenCalledTimes(1);
  });

  it("separates a confirmed revert from receipt-verification uncertainty", async () => {
    const reverted = await createAdapter({
      verifier: verifier("reverted"),
    }).execute(shield, { idempotencyKey: "reverted", onEvent: vi.fn() });
    expect(reverted).toMatchObject({
      status: "failed",
      error: { code: "TRANSACTION_REVERTED" },
    });

    const unavailableVerifier: TransactionVerifier = {
      getTransactionStatus: vi.fn().mockRejectedValue(new Error("RPC timeout")),
    };
    const uncertain = await createAdapter({
      verifier: unavailableVerifier,
    }).execute(shield, { idempotencyKey: "rpc-down", onEvent: vi.fn() });
    expect(uncertain).toMatchObject({
      status: "uncertain",
      transactionHash: TX_HASH,
      error: { code: "TRANSACTION_UNCERTAIN" },
    });
  });
});
