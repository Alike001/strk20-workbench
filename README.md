# STRK20 Workbench

Add private transfers to a Starknet application with reusable UI building blocks, a framework-neutral flow engine, and a safe visual playground.

[Open the live Workbench](https://strk20-workbench.vercel.app) · [Watch the demo](https://youtu.be/RTdBB3ivAXg) · [Try the Sandbox](https://strk20-workbench.vercel.app/workbench) · [Inspect verified evidence](https://strk20-workbench.vercel.app/evidence)

## What is this?

STRK20 Workbench helps application developers understand and integrate the three core movements in an STRK20 private-token lifecycle:

1. **Shield** public STRK into the privacy pool.
2. **Send privately** inside the pool.
3. **Withdraw** private STRK to a public Starknet address.

The project deliberately separates learning from real execution. The Sandbox uses fake tokens and simulated results, while Real mode asks a compatible privacy wallet to prepare proofs and submit genuine Starknet Mainnet actions. Public receipts are verified independently before they are presented as evidence.

## Project at a glance

| Area                       | Current status                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| Public application         | Live at [strk20-workbench.vercel.app](https://strk20-workbench.vercel.app)               |
| Sandbox lifecycle          | Complete Shield → Private transfer → Withdraw flow                                       |
| Supported real-wallet path | Ready X `5.33.9`, Wallet API `0.10.3`, Starknet Mainnet                                  |
| Mainnet evidence           | Three successful transactions verified against the official STRK20 pool                  |
| Reusable UI                | Workspace package with Shield, PrivateTransfer, Withdraw, FlowProgress, and PrivacyFacts |
| Core engine                | Framework-neutral TypeScript state machine and adapter contracts                         |
| Custom contract            | None; the project integrates with the official STRK20 pool through the wallet API        |
| Demo video                 | Published at [youtu.be/RTdBB3ivAXg](https://youtu.be/RTdBB3ivAXg)                        |

## Try it without a wallet

The fastest way to understand the product is the browser Sandbox:

1. Open the [Workbench](https://strk20-workbench.vercel.app/workbench).
2. Confirm the top badge says **Sandbox · No wallet · No real funds**.
3. Click **Run the complete example**.
4. Follow Alice’s balances through Shield, private transfer to Bob, and Bob’s withdrawal.
5. Read **What can people see?** to compare the public edges with the private in-pool action.
6. Open **Developer details** for the normalized event timeline and simulated evidence.

Nothing in this path connects a wallet, spends funds, or creates a real proof. Every Sandbox result remains explicitly labelled as simulated.

## Use the verified mainnet path

Real mode is intentionally more cautious. It requires:

- Ready X `5.33.9` or a wallet that passes the same runtime capability checks;
- Starknet Mainnet;
- Wallet API `0.10.3` with STRK20 balance, prepare, and invoke methods;
- the configured official STRK20 pool;
- enough public or private STRK for the requested action and the live pool fee; and
- an available server-side receipt verifier.

The safe flow is:

1. Click **Connect wallet** and deliberately choose the wallet.
2. Review the detected wallet, network, Wallet API version, pool, and verifier status.
3. Optionally request the private STRK total. This is a separate consent step and does not start a transaction.
4. Select Shield, private transfer, or withdrawal and enter the action details.
5. Read the Workbench’s final review, including the amount, recipient, fee, network, and privacy boundary.
6. Continue only when the review is correct. Proof creation and signing remain inside Ready X.
7. Wait for receipt verification. If the wallet omits a transaction hash, copy the hash from Ready X into the recovery field and use **Check this transaction — do not resubmit**.

The Workbench never requests a private key, seed phrase, viewing key, note contents, or proof payload. Connecting a wallet never moves funds, and an uncertain transaction is never resubmitted automatically.

### First-use registration

Wallet API `0.10.3` does not expose a standalone registration method to dapps. If Ready X reports `NOT_REGISTERED`, perform the first Shield from Ready X’s own STRK20/privacy screen, wait for confirmation, return to the Workbench, and recheck registration. The wallet owns the viewing key and registration process throughout.

### Pool fees

The Workbench reads the current pool fee instead of hard-coding it. For Shield, Ready X deducts the pool fee from the public deposit, so the interface shows the gross public debit and expected net private increase. Private transfers and withdrawals require the requested amount plus the fee in the private balance.

## How the pieces fit together

```text
Next.js Workbench
├── Sandbox UI ───────────────> Sandbox adapter ──────> simulated events
├── Real-action UI ───────────> Wallet API adapter ──> Ready X ──> STRK20 pool
├── Reusable React components ─┐
└── Evidence UI                 ├─> Lab Core types, state machine, and rules
                               ┘

Server receipt verifier ──────> allowlisted Starknet RPC reads ──> public evidence
```

The browser application orchestrates the experience, but the wallet keeps keys, private balances, discovery, notes, and proof data. The server only performs allowlisted, read-only Starknet RPC checks; it cannot sign or submit a transaction.

## Workspace packages

| Path                                       | Package                      | Purpose                                                                                        |
| ------------------------------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------- |
| [`apps/web`](./apps/web)                   | `@strk20-workbench/web`      | Next.js product, Sandbox, real-wallet flow, documentation, and evidence UI                     |
| [`apps/example`](./apps/example)           | `@strk20-workbench/example`  | Separate Vite consumer using only public React-package exports                                 |
| [`packages/lab-core`](./packages/lab-core) | `@strk20-workbench/lab-core` | Framework-neutral domain model, scenario engine, adapters, privacy facts, and evidence rules   |
| [`packages/react`](./packages/react)       | `@strk20-workbench/react`    | Controlled React components for Shield, PrivateTransfer, Withdraw, progress, and privacy facts |

The React package is currently workspace-only and is not published to npm. A consuming application supplies the action callback and explicitly chooses `sandbox` or `real` mode.

```tsx
import { PrivateTransfer } from "@strk20-workbench/react";
import "@strk20-workbench/react/styles.css";

<PrivateTransfer
  amount={amount}
  mode="sandbox"
  onAmountChange={setAmount}
  onSubmit={sendPrivately}
/>;
```

See [`packages/react/README.md`](./packages/react/README.md) and the independent [`apps/example`](./apps/example) consumer for the complete workspace example.

## Verified Starknet Mainnet evidence

The repository contains one successful transaction for each required action. The live [Evidence page](https://strk20-workbench.vercel.app/evidence) checks that every receipt succeeded and emitted an event from the official STRK20 pool:

`0x040337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a`

| Action           | Transaction                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| Shield           | [`0x039372…da6c0`](https://voyager.online/tx/0x039372b04a863fd5cd016f2715034dc6286b7c61f63abe96199ddf65b35da6c0) |
| Private transfer | [`0x04fbfb…93b20`](https://voyager.online/tx/0x04fbfb9204259a2c26aa4c5550f6bfd3acd67c4821ab23a7c50c537338093b20) |
| Withdraw         | [`0x0029a1…8a597`](https://voyager.online/tx/0x0029a150756c3184bb1818cc0b471277dd6cd19a860d5d4069cfcaea4418a597) |

A successful public receipt proves that the reviewed STRK20 pool executed. It does not independently reveal or prove the private transfer’s recipient, amount, or note contents.

## Privacy boundary

| Action           | Publicly observable                                                        | Kept inside the wallet/pool                                         |
| ---------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Shield           | Depositing account, token, deposit amount, pool interaction, and timing    | Resulting private balance, notes, and later spending                |
| Private transfer | Pool/app interaction and timing may remain observable                      | Sender-to-recipient link, recipient, amount, token, and spent notes |
| Withdraw         | Public destination, token, withdrawal amount, pool interaction, and timing | Source notes and links to earlier private transfers                 |

Privacy is not the same as invisibility. RPC providers, relayers, application telemetry, network metadata, and transaction timing can still expose information. The interface states these limits instead of presenting privacy as an absolute guarantee.

## Run locally

Requirements: Node.js 24 and pnpm 10.33.1.

```bash
git clone https://github.com/Alike001/strk20-workbench.git
cd strk20-workbench
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`. The Sandbox needs no wallet, account, RPC credential, Docker service, database, local chain, or local prover.

To run the separate React-package consumer:

```bash
pnpm --filter @strk20-workbench/example dev
```

### Optional real-network configuration

```bash
cp .env.example apps/web/.env.local
```

Replace only the server-side `STARKNET_RPC_URL` placeholder. Never commit `.env.local` or expose a provider key through a `NEXT_PUBLIC_` variable. The browser talks to same-origin, read-only API routes with method and payload allowlists.

### Verification commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm build
pnpm audit --audit-level high
pnpm validate:submission
```

The final metadata validator also requires the public demo-video URL:

```bash
pnpm validate:submission:final
```

## Known limitations

- Ready X `5.33.9` is the only browser-wallet path verified end to end for this release.
- The React component package is demonstrated inside the workspace but is not published to npm.
- Proof preparation can take time because it is performed by the wallet and its proving infrastructure.
- Some wallet calls can complete without returning a transaction hash; the Workbench provides a read-only manual recovery check instead of resubmitting.
- Local receipt evidence fails closed when `STARKNET_RPC_URL` is not configured.
- No custom anonymizer contract is included; the release focuses on the complete official-pool lifecycle.

## Documentation

- [`docs/development.md`](./docs/development.md) — local setup, workspace commands, and safety boundaries.
- [`docs/compatibility.md`](./docs/compatibility.md) — exact package, wallet, API, and browser verification matrix.
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — contribution workflow and security rules.
- [`context/`](./context/README.md) — product requirements, architecture decisions, and implementation checklist.
- [`strk20.json`](./strk20.json) — machine-readable sprint evidence.

## Team

- [`Alike001`](https://github.com/Alike001)
- [`Webghost01-NG`](https://github.com/Webghost01-NG)

## License

Released under the [MIT License](./LICENSE).
