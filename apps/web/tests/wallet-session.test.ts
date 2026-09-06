import { describe, expect, it, vi } from "vitest";

import type { PrivacyWallet } from "../lib/wallet/wallet-session";
import {
  connectPrivacyWallet,
  createWalletDiscoveryFromStore,
  waitForDiscoveredWallets,
  type WalletConnectionDriver,
} from "../lib/wallet/wallet-session";

const wallet = {
  name: "Test Privacy Wallet",
  version: "1.2.3",
  icon: "data:image/svg+xml;base64,",
  chains: ["starknet:SN_MAIN"],
  features: {},
  accounts: [],
} as unknown as PrivacyWallet;

function driver(): WalletConnectionDriver {
  return {
    connect: vi.fn().mockResolvedValue({
      address: "0xa11ce",
      strk20Balances: vi.fn(),
      strk20PrepareInvoke: vi.fn(),
      strk20InvokeTransaction: vi.fn(),
    }),
    requestChainId: vi.fn().mockResolvedValue("SN_MAIN"),
    supportedWalletApi: vi.fn().mockResolvedValue(["0.10.3"]),
    supportedSpecs: vi.fn().mockResolvedValue(["0.10.0"]),
  };
}

describe("wallet discovery", () => {
  it("reads and subscribes without connecting a wallet", () => {
    const subscribe = vi.fn((listener: (wallets: PrivacyWallet[]) => void) => {
      listener([wallet]);
      return vi.fn();
    });
    const discovery = createWalletDiscoveryFromStore({
      getWallets: () => [wallet],
      subscribe,
    } as never);
    const updates: readonly PrivacyWallet[][] = [];

    expect(discovery.getWallets()).toEqual([wallet]);
    discovery.subscribe((next) =>
      (updates as PrivacyWallet[][]).push([...next]),
    );
    expect(updates).toEqual([[wallet]]);
    expect(subscribe).toHaveBeenCalledTimes(1);
  });

  it("waits for an extension that registers after the first empty read", async () => {
    let discovered: PrivacyWallet[] = [];
    const listeners = new Set<(wallets: readonly PrivacyWallet[]) => void>();
    const discovery = {
      getWallets: () => [...discovered],
      subscribe(listener: (wallets: readonly PrivacyWallet[]) => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };

    const pending = waitForDiscoveredWallets(discovery, { timeoutMs: 1_000 });
    discovered = [wallet];
    for (const listener of listeners) listener(discovered);

    await expect(pending).resolves.toEqual([wallet]);
    expect(listeners.size).toBe(0);
  });

  it("returns an empty list after the bounded discovery window", async () => {
    vi.useFakeTimers();
    try {
      const discovery = {
        getWallets: () => [],
        subscribe: () => vi.fn(),
      };
      const pending = waitForDiscoveredWallets(discovery, { timeoutMs: 250 });
      await vi.advanceTimersByTimeAsync(250);
      await expect(pending).resolves.toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("stops waiting when the discovery request is cancelled", async () => {
    const listeners = new Set<(wallets: readonly PrivacyWallet[]) => void>();
    const discovery = {
      getWallets: () => [],
      subscribe(listener: (wallets: readonly PrivacyWallet[]) => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };
    const request = new AbortController();

    const pending = waitForDiscoveredWallets(discovery, {
      timeoutMs: 10_000,
      signal: request.signal,
    });
    request.abort();

    await expect(pending).resolves.toEqual([]);
    expect(listeners.size).toBe(0);
  });
});

describe("connectPrivacyWallet", () => {
  it("connects only when called and returns safe capability metadata", async () => {
    const connectionDriver = driver();
    const session = await connectPrivacyWallet({
      wallet,
      providerUrl: "/api/starknet",
      driver: connectionDriver,
    });

    expect(connectionDriver.connect).toHaveBeenCalledWith(
      "/api/starknet",
      wallet,
    );
    expect(session).toMatchObject({
      walletName: "Test Privacy Wallet",
      walletVersion: "1.2.3",
      chainId: "SN_MAIN",
      walletApiVersions: ["0.10.3"],
      rpcSpecVersions: ["0.10.0"],
    });
    expect(Object.keys(session)).not.toContain("viewingKey");
    expect(Object.keys(session)).not.toContain("privateKey");
  });

  it("rejects an empty provider URL before requesting wallet access", async () => {
    const connectionDriver = driver();
    await expect(
      connectPrivacyWallet({
        wallet,
        providerUrl: " ",
        driver: connectionDriver,
      }),
    ).rejects.toThrow(/provider URL/i);
    expect(connectionDriver.connect).not.toHaveBeenCalled();
  });
});
