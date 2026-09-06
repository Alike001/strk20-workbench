import { createStore, type Store } from "@starknet-io/get-starknet-discovery";
import type { WalletWithStarknetFeatures } from "@starknet-io/get-starknet-wallet-standard/features";
import { WalletAccountV6, walletV6 } from "starknet";

import type { Strk20WalletAccount } from "./wallet-api-adapter";

export type PrivacyWallet = WalletWithStarknetFeatures;

export type WalletDiscovery = Readonly<{
  getWallets(): readonly PrivacyWallet[];
  subscribe(listener: (wallets: readonly PrivacyWallet[]) => void): () => void;
}>;

export type WalletDiscoveryWaitOptions = Readonly<{
  timeoutMs?: number;
  signal?: AbortSignal;
}>;

export type ConnectedWalletSession = Readonly<{
  account: Strk20WalletAccount;
  wallet: PrivacyWallet;
  walletName: string;
  walletVersion: string;
  chainId: string;
  walletApiVersions: readonly string[];
  rpcSpecVersions: readonly string[];
}>;

export interface WalletConnectionDriver {
  connect(
    providerUrl: string,
    wallet: PrivacyWallet,
  ): Promise<Strk20WalletAccount>;
  requestChainId(wallet: PrivacyWallet): Promise<unknown>;
  supportedWalletApi(wallet: PrivacyWallet): Promise<readonly unknown[]>;
  supportedSpecs(wallet: PrivacyWallet): Promise<readonly unknown[]>;
}

const DEFAULT_DRIVER: WalletConnectionDriver = {
  connect: (providerUrl, wallet) =>
    WalletAccountV6.connect({ nodeUrl: providerUrl }, wallet),
  requestChainId: (wallet) => walletV6.requestChainId(wallet),
  supportedWalletApi: (wallet) => walletV6.supportedWalletApi(wallet),
  supportedSpecs: (wallet) => walletV6.supportedSpecs(wallet),
};

/** Discovery is passive: constructing this object does not request connection. */
export function createWalletDiscovery(): WalletDiscovery {
  const store: Store = createStore({ eip1193Adapters: [] });
  return createWalletDiscoveryFromStore(store);
}

export function createWalletDiscoveryFromStore(
  store: Pick<Store, "getWallets" | "subscribe">,
): WalletDiscovery {
  return {
    getWallets: () => [...store.getWallets()],
    subscribe(listener) {
      return store.subscribe((wallets) => listener([...wallets]));
    },
  };
}

/**
 * Wallet extensions can register a moment after React becomes interactive.
 * Wait briefly for the existing discovery store instead of treating an empty
 * first read as proof that no wallet is installed.
 */
export function waitForDiscoveredWallets(
  discovery: WalletDiscovery,
  options: WalletDiscoveryWaitOptions = {},
): Promise<readonly PrivacyWallet[]> {
  const current = discovery.getWallets();
  if (current.length > 0 || options.signal?.aborted) {
    return Promise.resolve(current);
  }

  const timeoutMs = Math.max(0, options.timeoutMs ?? 2_000);
  return new Promise((resolve) => {
    let settled = false;
    const cleanup: { unsubscribe?: () => void } = {};

    const finish = (wallets: readonly PrivacyWallet[]) => {
      if (settled) return;
      settled = true;
      globalThis.clearTimeout(timeout);
      options.signal?.removeEventListener("abort", onAbort);
      cleanup.unsubscribe?.();
      resolve([...wallets]);
    };
    const onAbort = () => finish([]);
    const timeout = globalThis.setTimeout(
      () => finish(discovery.getWallets()),
      timeoutMs,
    );

    options.signal?.addEventListener("abort", onAbort, { once: true });
    if (options.signal?.aborted) onAbort();
    cleanup.unsubscribe = discovery.subscribe((wallets) => {
      if (wallets.length > 0) finish(wallets);
    });
    if (settled) cleanup.unsubscribe();

    const afterSubscribe = discovery.getWallets();
    if (afterSubscribe.length > 0) finish(afterSubscribe);
  });
}

/** Must only be called in response to an explicit user wallet choice. */
export async function connectPrivacyWallet(input: {
  readonly wallet: PrivacyWallet;
  readonly providerUrl: string;
  readonly driver?: WalletConnectionDriver;
}): Promise<ConnectedWalletSession> {
  if (!input.providerUrl.trim()) {
    throw new TypeError("A provider URL is required to connect a wallet.");
  }
  const driver = input.driver ?? DEFAULT_DRIVER;
  const account = await driver.connect(input.providerUrl, input.wallet);
  const [chainId, walletApiVersions, rpcSpecVersions] = await Promise.all([
    driver.requestChainId(input.wallet),
    driver.supportedWalletApi(input.wallet),
    driver.supportedSpecs(input.wallet),
  ]);

  return Object.freeze({
    account,
    wallet: input.wallet,
    walletName: input.wallet.name,
    walletVersion: input.wallet.version,
    chainId: String(chainId),
    walletApiVersions: Object.freeze(walletApiVersions.map(String)),
    rpcSpecVersions: Object.freeze(rpcSpecVersions.map(String)),
  });
}
