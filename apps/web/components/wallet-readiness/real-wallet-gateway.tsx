"use client";

import type {
  AdapterSnapshot,
  CapabilityReport,
} from "@strk20-workbench/lab-core";
import { useEffect, useMemo, useRef, useState } from "react";

import { RpcTransactionVerifier } from "../../lib/wallet/rpc-transaction-verifier";
import {
  WalletApiAdapter,
  isMainnetChain,
  selectHighestWalletApiVersion,
} from "../../lib/wallet/wallet-api-adapter";
import {
  connectPrivacyWallet,
  createWalletDiscovery,
  waitForDiscoveredWallets,
  type ConnectedWalletSession,
  type PrivacyWallet,
  type WalletDiscovery,
} from "../../lib/wallet/wallet-session";
import {
  WalletReadinessPanel,
  type WalletReadinessState,
} from "./wallet-readiness-panel";
import { RealActionFlow } from "./real-action-flow";
import styles from "./real-wallet-gateway.module.css";

const STRK_TOKEN =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
const OFFICIAL_POOL =
  "0x040337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a";

export function RealWalletGateway() {
  const [wallets, setWallets] = useState<readonly PrivacyWallet[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [state, setState] = useState<WalletReadinessState>("disconnected");
  const [detail, setDetail] = useState<string>();
  const [session, setSession] = useState<ConnectedWalletSession>();
  const [report, setReport] = useState<CapabilityReport>();
  const [selectedWallet, setSelectedWallet] = useState<PrivacyWallet>();
  const [adapter, setAdapter] = useState<WalletApiAdapter>();
  const discoveryRef = useRef<WalletDiscovery | undefined>(undefined);
  const discoveryRequest = useRef<AbortController | undefined>(undefined);

  useEffect(() => {
    const discovery = createWalletDiscovery();
    discoveryRef.current = discovery;
    let active = true;
    queueMicrotask(() => {
      if (active) setWallets(discovery.getWallets());
    });
    const unsubscribe = discovery.subscribe(setWallets);
    return () => {
      active = false;
      discoveryRequest.current?.abort();
      discoveryRef.current = undefined;
      unsubscribe();
    };
  }, []);

  const supportedVersion = useMemo(
    () => selectHighestWalletApiVersion(session?.walletApiVersions ?? []),
    [session],
  );

  async function openPicker() {
    setDetail(undefined);
    setShowPicker(true);
    const discovery = discoveryRef.current;
    if (!discovery) {
      setState("unsupported");
      setDetail("Wallet discovery is not ready yet. Wait a moment and retry.");
      return;
    }

    discoveryRequest.current?.abort();
    const request = new AbortController();
    discoveryRequest.current = request;
    setState("discovering");

    const discovered = await waitForDiscoveredWallets(discovery, {
      timeoutMs: 2_000,
      signal: request.signal,
    });
    if (request.signal.aborted) return;
    setWallets(discovered);

    if (discovered.length > 0) {
      setState("disconnected");
      setDetail("Wallet detected. Choose it from the list below.");
      return;
    }

    setState("unsupported");
    setDetail(
      "No Starknet wallet was discovered after waiting for the extension. Unlock Ready X, then retry.",
    );
  }

  async function connect(wallet: PrivacyWallet) {
    setSelectedWallet(wallet);
    setState("connecting");
    setDetail(undefined);
    try {
      const connected = await connectPrivacyWallet({
        wallet,
        providerUrl: `${window.location.origin}/api/starknet`,
      });
      const rpcReady = await checkReceiptVerifier();
      const connectedAdapter = createAdapter(connected, rpcReady);
      const capabilityReport = await connectedAdapter.getCapabilities();
      setSession(connected);
      setAdapter(connectedAdapter);
      setReport(capabilityReport);
      setShowPicker(false);
      setState(readinessFrom(connected, capabilityReport));
      setDetail(readinessDetail(connected, capabilityReport));
    } catch (error) {
      setState("unsupported");
      setDetail(safeConnectionMessage(error));
    }
  }

  function returnToSandbox() {
    document.getElementById("sandbox-workbench")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className={styles.gateway} aria-labelledby="real-wallet-title">
      <header className={styles.introduction}>
        <div>
          <p>Real-wallet path</p>
          <h2 id="real-wallet-title">Move from learning to mainnet.</h2>
        </div>
        <p>
          First check whether an installed wallet supports STRK20. Connection
          never moves funds, reads private balances, or starts proving.
        </p>
      </header>

      <div className={styles.gatewayGrid}>
        <WalletReadinessPanel
          chainName={session?.chainId}
          detail={detail}
          onConnect={() => void openPicker()}
          onRetry={() => {
            if (selectedWallet) void connect(selectedWallet);
            else void openPicker();
          }}
          onSwitchNetwork={() => {
            if (selectedWallet) void connect(selectedWallet);
          }}
          onUseSandbox={returnToSandbox}
          state={state}
          supportedVersion={supportedVersion}
          walletName={session?.walletName}
          walletVersion={session?.walletVersion}
        />

        <div className={styles.nextStep}>
          <span>Next safety gate</span>
          <h3>Review before proof and submit.</h3>
          <p>
            A compatible wallet unlocks a separate action review. Token, amount,
            recipient, public edges, and pool fee must be understood before the
            wallet prepares a proof.
          </p>
          <dl>
            <div>
              <dt>Balance access</dt>
              <dd>Consent only</dd>
            </div>
            <div>
              <dt>Keys and notes</dt>
              <dd>Stay in wallet</dd>
            </div>
            <div>
              <dt>Mainnet receipt</dt>
              <dd>Verified separately</dd>
            </div>
          </dl>
          {state === "ready" ? (
            <p className={styles.readyNote}>
              Capability gate passed. Action review is the next build step; no
              transaction has started.
            </p>
          ) : null}
        </div>
      </div>

      {showPicker ? (
        <div className={styles.walletPicker} aria-label="Installed wallets">
          <div>
            <span>Installed wallets</span>
            <button type="button" onClick={() => setShowPicker(false)}>
              Close
            </button>
          </div>
          {wallets.length > 0 ? (
            <ul>
              {wallets.map((wallet) => (
                <li key={`${wallet.name}-${wallet.version}`}>
                  <button type="button" onClick={() => void connect(wallet)}>
                    <strong>{wallet.name}</strong>
                    <span>Version {wallet.version} · Check STRK20 support</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : state === "discovering" ? (
            <p>Waiting briefly for Ready X to become visible…</p>
          ) : (
            <p>
              No wallet is visible yet. Unlock Ready X and press Retry; Sandbox
              remains available above.
            </p>
          )}
        </div>
      ) : null}

      {report ? (
        <details className={styles.capabilities}>
          <summary>Inspect capability report</summary>
          <ul>
            {report.capabilities.map((capability) => (
              <li data-status={capability.status} key={capability.name}>
                <strong>{capability.name}</strong>
                <span>{capability.explanation}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {state === "ready" && adapter && session ? (
        <RealActionFlow
          key={`${session.account.address}-${report?.checkedAt ?? "ready"}`}
          adapter={adapter}
          walletName={session.walletName}
        />
      ) : null}
    </section>
  );
}

export function readinessFrom(
  session: Pick<ConnectedWalletSession, "chainId">,
  report: CapabilityReport,
): WalletReadinessState {
  if (!isMainnetChain(session.chainId)) return "wrong-network";
  const requiredNames = [
    "wallet-methods-present",
    "pool-configuration-matches",
    "rpc-verification-available",
  ] as const;
  return requiredNames.every(
    (name) =>
      report.capabilities.find((capability) => capability.name === name)
        ?.status === "ready",
  )
    ? "ready"
    : "unsupported";
}

function readinessDetail(
  session: ConnectedWalletSession,
  report: CapabilityReport,
): string | undefined {
  if (!isMainnetChain(session.chainId)) {
    return "Switch to Starknet Mainnet inside the wallet, then recheck.";
  }
  return report.capabilities.find(
    (capability) => capability.status === "blocked",
  )?.explanation;
}

function createAdapter(
  session: ConnectedWalletSession,
  rpcReady: boolean,
): WalletApiAdapter {
  const configuredPool =
    process.env.NEXT_PUBLIC_STRK20_POOL_ADDRESS ?? OFFICIAL_POOL;
  return new WalletApiAdapter({
    account: session.account,
    walletName: session.walletName,
    walletApiVersions: session.walletApiVersions,
    chainId: session.chainId,
    snapshot: realSnapshot(session.account.address),
    verifier: rpcReady ? new RpcTransactionVerifier() : undefined,
    poolConfigurationMatches:
      normalizeFelt(configuredPool) === normalizeFelt(OFFICIAL_POOL),
  });
}

export async function checkReceiptVerifier(
  request: typeof fetch = fetch,
): Promise<boolean> {
  try {
    const response = await request("/api/starknet", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "wallet-readiness",
        method: "starknet_chainId",
        params: [],
      }),
      cache: "no-store",
    });
    if (!response.ok) return false;
    const payload = (await response.json()) as { result?: unknown };
    return typeof payload.result === "string" && isMainnetChain(payload.result);
  } catch {
    return false;
  }
}

function realSnapshot(address: string): AdapterSnapshot {
  return {
    network: "SN_MAIN",
    proofKind: "unknown",
    actors: {
      alice: {
        id: "alice",
        name: "Connected wallet",
        address,
        registered: false,
        publicBalances: {},
        privateBalances: {},
      },
      bob: {
        id: "bob",
        name: "Recipient",
        address: "0x0",
        registered: false,
        publicBalances: {},
        privateBalances: {},
      },
    },
    tokens: {
      [STRK_TOKEN]: {
        id: STRK_TOKEN,
        symbol: "STRK",
        decimals: 18,
        fictional: false,
      },
    },
  };
}

function normalizeFelt(value: string): bigint | undefined {
  try {
    return BigInt(value);
  } catch {
    return undefined;
  }
}

function safeConnectionMessage(error: unknown): string {
  if (error instanceof Error && /reject|cancel/i.test(error.message)) {
    return "The wallet connection was cancelled. No funds moved.";
  }
  return "The wallet could not establish STRK20 compatibility. Update or change wallets, then retry.";
}
