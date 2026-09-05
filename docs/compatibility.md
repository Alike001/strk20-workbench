# Compatibility

The machine-readable matrix lives in [`config/compatibility.json`](../config/compatibility.json). The package set and Ready X capability path are browser-verified, but the overall status remains `candidate` until a minimal prepare/invoke flow is proven on mainnet.

## Confirmed direction

- Node.js 24 and pnpm 10 for the workspace.
- Next.js 16 with Webpack for the initial wallet-integration path.
- Starknet Wallet API for genuine user-facing STRK20 actions.
- No private keys, viewing keys, discovery requests, or proving requests handled by the hosted application.
- Privacy SDK examples are reference material only unless the product later adds a clearly separate key-holding operator mode.

## Candidate package set

| Package                                     | Exact pin |
| ------------------------------------------- | --------- |
| `starknet`                                  | `10.5.0`  |
| `@starknet-io/get-starknet-discovery`       | `6.0.2`   |
| `@starknet-io/get-starknet-wallet-standard` | `6.0.2`   |
| `@starknet-io/types-js`                     | `0.10.3`  |

Why this set: Starknet.js 10.4.0 is the starter baseline where `WalletAccountV6` first appears. Version 10.5.0 uses the same wallet-standard 6.0.2 and Wallet API 0.10.3 generation, matches the inspected STRK20 privacy repository snapshot, and avoids the prerelease Wallet API types pulled by Starknet.js 10.7.1.

## Reproducible checks on 2026-09-04

| Matrix                                                                                             | Result       | Notes                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Upstream starter: Starknet.js `10.4.0`, discovery `6.0.2`, wallet standard `6.0.2`, types `0.10.3` | Pass         | Clean dependency install and Next.js Webpack production build passed. The starter's ranged Next.js dependency resolved to `16.3.4` during this disposable check. |
| Workbench candidate: same set with Starknet.js `10.5.0`                                            | Pass         | The same starter compiled, typechecked, prerendered, and completed a production build after the one-version substitution.                                        |
| Workbench lockfile and app                                                                         | Pass         | Exact-pinned install, lint, typecheck, automated tests, and Next.js 16.2.9 Webpack production build pass.                                                        |
| Browser discovery without an extension                                                             | Pass         | The page renders, scans only after a click, remains empty when no wallet is installed, and makes no RPC/private method request.                                  |
| Real wallet extension                                                                              | Partial pass | Ready X connected on Starknet Mainnet and advertised Wallet API `0.10.3` on 2026-09-05. Extension version and minimal prepare/invoke evidence remain pending.    |

Source snapshots inspected:

- `Akashneelesh/strk20-starter-kit` at `187fe789dd4f5de14ccb0953abfdb49a26643664`.
- `starknet-io/starknet.js` at `b4fe523106d8b56f2d8276d710ed748941ac8fa2` (release 10.7.1); package metadata for 10.5.0 was checked separately from npm.
- `starkware-libs/starknet-specs` at `1e79af61071a77e0031d397e1fbe81e9a0637072` (Wallet API development spec 0.10.4-rc.1).

## What the browser probe proves

The hidden probe discovers wallet-standard providers only after **Scan installed wallets** is pressed. A second explicit action connects one selected wallet. It then reads the chain ID, `wallet_supportedWalletApi`, `wallet_supportedSpecs`, and the names of wallet-standard features.

It does **not** call `wallet_strk20Balances`, `wallet_strk20PrepareInvoke`, or `wallet_strk20InvokeTransaction`. A result saying **Available by contract** means two narrower things: the corresponding Starknet.js method exists, and the wallet advertises Wallet API 0.10.3 or newer. It does not claim that proving or mainnet submission succeeded.

## Human-browser result on 2026-09-05

Ready X was selected in the hosted Workbench, approved account access, reported Starknet Mainnet, advertised Wallet API `0.10.3`, and exposed the required STRK20 methods. The configured official pool and receipt-verifier checks also passed. This proves discovery and capability compatibility without reading a private balance or starting a transaction; it does not yet prove successful preparation, proving, or submission.

## Compatibility gate partially complete

Before real-mode UI is treated as fully supported, the team must still record:

1. the Ready X extension version (the product now displays it after connection);
2. a minimal prepare/invoke result on Starknet Mainnet;
3. the resulting transaction hash and verified pool interaction.

Already recorded: Ready X, Wallet API `0.10.3`, exact application package pins, successful capability detection without reading private balances, and the current wallet/pool/receipt-verifier boundary.

The sandbox does not depend on this gate and must remain usable if real mode is unavailable.

## Four questions for the STRK20 team

The following message is ready for the sprint Telegram. Answers must be copied below with the responder and date; until then they are explicitly unresolved.

> We are building STRK20 Workbench, lightweight developer infrastructure that runs a wallet-free sandbox and graduates the same flow to the Wallet API. Could you confirm: (1) Is mock-proof E2E the recommended local-development mode, with genuine proving reserved for public-network/self-hosted environments? (2) Can current Ready/Xverse privacy wallets connect to a custom devnet, or should local apps use an adapter and test Wallet API only on supported public networks? (3) What is the supported public distribution/licence path for the privacy SDK/client packages currently using GitHub Packages? (4) Which exact pool, SDK, Wallet API, discovery, prover, patched-devnet, and wallet versions should third-party sprint tooling declare compatible?

Answers: **pending team response**.
