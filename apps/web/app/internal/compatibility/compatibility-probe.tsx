"use client";

import type { WalletWithStarknetFeatures } from "@starknet-io/get-starknet-wallet-standard/features";
import { useEffect, useRef, useState } from "react";

import {
  connectPrivacyWallet,
  createWalletDiscovery,
} from "../../../lib/wallet/wallet-session";

import {
  buildCapabilityReport,
  MINIMUM_STRK20_WALLET_API,
  type WalletCapabilityReport,
} from "./wallet-capabilities";

type ProbeState = "idle" | "scanning" | "connecting" | "complete" | "error";

function safeError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "The wallet did not complete the compatibility request.";
}

export function CompatibilityProbe() {
  const [wallets, setWallets] = useState<WalletWithStarknetFeatures[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [state, setState] = useState<ProbeState>("idle");
  const [report, setReport] = useState<WalletCapabilityReport | null>(null);
  const [error, setError] = useState("");
  const unsubscribeRef = useRef<null | (() => void)>(null);

  useEffect(
    () => () => {
      unsubscribeRef.current?.();
    },
    [],
  );

  function scanWallets() {
    setError("");
    setReport(null);
    setState("scanning");
    setHasScanned(true);
    unsubscribeRef.current?.();

    const discovery = createWalletDiscovery();
    const update = (nextWallets: readonly WalletWithStarknetFeatures[]) => {
      setWallets([...nextWallets]);
      setState("idle");
    };

    update(discovery.getWallets());
    unsubscribeRef.current = discovery.subscribe(update);
  }

  async function connect(wallet: WalletWithStarknetFeatures) {
    setError("");
    setReport(null);
    setState("connecting");

    try {
      const origin = window.location.origin;
      const session = await connectPrivacyWallet({
        providerUrl: `${origin}/api/starknet`,
        wallet,
      });

      setReport(
        buildCapabilityReport({
          walletName: session.walletName,
          chainId: session.chainId,
          featureNames: Object.keys(wallet.features),
          walletApiVersions: session.walletApiVersions,
          rpcSpecVersions: session.rpcSpecVersions,
          account: session.account,
        }),
      );
      setState("complete");
    } catch (caught) {
      setError(safeError(caught));
      setState("error");
    }
  }

  return (
    <section className="probe" aria-labelledby="probe-title">
      <div className="probe-heading">
        <div>
          <p className="eyebrow">Internal compatibility spike</p>
          <h1 id="probe-title">Can this wallet speak STRK20?</h1>
        </div>
        <span className="candidate-badge">Candidate · not production</span>
      </div>

      <p className="probe-intro">
        This page discovers installed Starknet wallets, then checks the
        wallet&apos;s advertised API after you choose Connect. It never requests
        shielded balances, prepares a proof, or submits a transaction.
      </p>

      <div className="safety-strip" role="note">
        <span>No viewing keys</span>
        <span>No balance request</span>
        <span>No transaction</span>
      </div>

      <div className="probe-actions">
        <button type="button" className="primary-button" onClick={scanWallets}>
          {state === "scanning" ? "Scanning…" : "Scan installed wallets"}
        </button>
        <p>
          Connection happens only after you select a wallet below. Minimum
          advertised Wallet API: <code>{MINIMUM_STRK20_WALLET_API}</code>.
        </p>
      </div>

      {wallets.length > 0 ? (
        <div className="wallet-grid" aria-label="Discovered wallets">
          {wallets.map((wallet) => (
            <article
              className="wallet-card"
              key={`${wallet.name}-${wallet.version}`}
            >
              <div>
                <strong>{wallet.name}</strong>
                <span>Wallet standard {wallet.version}</span>
              </div>
              <button
                type="button"
                onClick={() => connect(wallet)}
                disabled={state === "connecting"}
              >
                {state === "connecting"
                  ? "Waiting for wallet…"
                  : "Connect & inspect"}
              </button>
            </article>
          ))}
        </div>
      ) : state !== "scanning" ? (
        <p className="empty-state">
          {hasScanned
            ? "No wallet was detected. Install or enable a current privacy-enabled Starknet wallet, then scan again."
            : "No wallet has been scanned yet. Press the scan button to inspect this browser."}
        </p>
      ) : null}

      {error ? (
        <p className="probe-error" role="alert">
          {error}
        </p>
      ) : null}

      {report ? <CapabilityReport report={report} /> : null}
    </section>
  );
}

function CapabilityReport({ report }: { report: WalletCapabilityReport }) {
  return (
    <section className="report" aria-labelledby="report-title">
      <div className="report-heading">
        <div>
          <p className="eyebrow">Safe capability report</p>
          <h2 id="report-title">{report.walletName}</h2>
        </div>
        <span className={report.meetsMinimumWalletApi ? "pass" : "fail"}>
          {report.meetsMinimumWalletApi
            ? "STRK20 API advertised"
            : "STRK20 API missing"}
        </span>
      </div>

      <dl className="facts">
        <div>
          <dt>Chain</dt>
          <dd>{report.chainId}</dd>
        </div>
        <div>
          <dt>Wallet API</dt>
          <dd>{report.walletApiVersions.join(", ") || "None advertised"}</dd>
        </div>
        <div>
          <dt>RPC specs</dt>
          <dd>{report.rpcSpecVersions.join(", ") || "None advertised"}</dd>
        </div>
      </dl>

      <div className="method-list">
        {report.methods.map((method) => (
          <div key={method.name}>
            <div>
              <strong>{method.name}</strong>
              <code>{method.libraryMethod}</code>
            </div>
            <span>
              {method.presentInLibrary && method.advertisedByWalletApi
                ? "Available by contract"
                : "Not established"}
            </span>
          </div>
        ))}
      </div>

      <details>
        <summary>Advertised wallet-standard features</summary>
        <ul>
          {report.featureNames.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </details>

      <p className="report-caveat">
        “Available by contract” means the package method exists and the wallet
        advertises Wallet API {MINIMUM_STRK20_WALLET_API} or newer. No private
        method was invoked, so this is a compatibility preflight—not proof of a
        successful mainnet action.
      </p>
    </section>
  );
}
