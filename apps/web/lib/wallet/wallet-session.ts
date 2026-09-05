import { createStore, type Store } from "@starknet-io/get-starknet-discovery";
import type { WalletWithStarknetFeatures } from "@starknet-io/get-starknet-wallet-standard/features";
import { WalletAccountV6, walletV6 } from "starknet";

import type { Strk20WalletAccount } from "./wallet-api-adapter";

export type PrivacyWallet = WalletWithStarknetFeatures;

export type WalletDiscovery = Readonly<{
  getWallets(): readonly PrivacyWallet[];
  subscribe(listener: (wallets: readonly PrivacyWallet[]) => void): () => void;
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
