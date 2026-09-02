# Technical Feasibility and Ecosystem Research

Date: 2026-09-02

## Decision Status

**Research verdict: proceed with the infrastructure direction. Do not register or choose a final name yet.**

The strongest defensible gap is still IDEA-24: a reproducible STRK20 developer environment. The technically honest product is not “run production proving on every laptop.” It is a developer laboratory with clearly separated execution modes:

1. a fast in-memory mode for unit and component tests;
2. a real local Starknet mode with the actual privacy-pool contract and discovery service, but an explicitly labelled mock-proof provider;
3. a real integration mode using a supported privacy wallet or the upstream SDK with a real prover and Starknet mainnet;
4. an optional self-hosted-prover profile for sufficiently powerful infrastructure.

This is feasible because most of the hard primitives already exist upstream. The missing product is the version-pinned orchestration, developer-facing test contract, observability, examples, and handoff from local testing to verifiable mainnet evidence.

This is not yet the final scope, architecture specification, project name, or registration entry.

## Research Questions

This pass tested the proposed direction against:

- the actual upstream devnet and E2E design;
- note discovery and its privacy boundaries;
- the transaction-prover interface and operational requirements;
- the published Wallet API types;
- anonymizer and open-note interfaces;
- CDR Kit and ZK Freighter;
- Zcash, RAILGUN, Privacy Pools, Aztec, Solana, and Stellar privacy tooling;
- wagmi, viem, Scaffold-ETH, local indexer tooling, and hackathon winners.

## Evidence and Local Validation

The inspected upstream STRK20 snapshot was [`starkware-libs/starknet-privacy`](https://github.com/starkware-libs/starknet-privacy) at commit `bc75e4bac71ad0ce10c6e63effc33b5b25131a4f`.

### What passed locally

| Surface | Command-level result | What it establishes |
|---|---|---|
| Privacy SDK | Build passed; 263 fast tests across 27 files passed | Registration, channels, deposits, private transfer, withdrawal, discovery, screening, shadow accounts, external invoke, open notes, and failure handling are testable primitives |
| Client | Build, lint, formatting, typecheck, and 66 tests across 11 files passed | The user-facing integration layer compiles against the current upstream interfaces |
| Published wallet types | Inspected from `starknet@10.5.0` and `@starknet-io/starknet-types-0103` | The STRK20 wallet actions and response types exist in released code |
| E2E implementation | Source and CI inspected | Upstream already starts a real patched devnet, deploys the real pool, and starts the real discovery service for E2E tests |

The SDK test run reported approximately 78.2% line coverage. Dependency audits at this snapshot reported 15 SDK findings and four high-severity client findings. Those audit counts are observations from one dependency-lock snapshot, not a security assessment of the STRK20 protocol.

### What did not complete in this environment

The full upstream devnet smoke test did not complete during this pass because the required pinned toolchain was not preinstalled and the large Scarb toolchain download was unusually slow. A Rust discovery build also spent an extended period fetching dependencies without producing a test result. Therefore this document does **not** claim that the full smoke suite passed locally.

This is an installation and reproducibility finding in its own right: upstream has the pieces, but a new developer currently needs several pinned toolchains, builds, and independently started services. That is precisely the workflow an IDEA-24 product should make deterministic.

## Actual STRK20 Interfaces

### 1. Local devnet

Upstream pins:

- Scarb `2.18.0`;
- Starknet Foundry `0.63.0`;
- Node `24.0.2`;
- `starknet-devnet` `0.8.0-rc.3` in CI.

Its E2E environment uses a real Starknet devnet with deterministic funded accounts, deploys the privacy pool, builds the Rust discovery service, and exercises shielding, private transfer, withdrawal, discovery, pagination, reorg behaviour, swaps, and lending paths.

The important qualification is that the local E2E smoke path uses a mock proof provider for screening/proof flow. The chain and pool state transition path are real; production transaction proving is not performed for every local test.

Upstream exports valuable testing primitives rather than requiring us to invent them:

- `Mocknet` and `MockPoolContract`;
- `MockProofProvider` and `MockProofInvocationFactory`;
- `Devnet` and `createDevnetTestEnv`;
- contract and indexer discovery providers;
- deterministic Alice, Bob, Carol, and David accounts;
- deterministic test tokens;
- tracing and concurrency-profiling helpers.

**Feasibility conclusion:** a one-command local pool environment is feasible. The correct implementation wraps and pins upstream components; it should not fork the protocol or recreate the cryptography.

### 2. Discovery

The discovery service is a stateless Rust HTTP service backed by Starknet RPC. The inspected routes are:

- `POST /v1/sync/incoming_state`;
- `POST /v1/sync/outgoing_state`;
- `POST /v1/sync/preflight_check`;
- `GET /health`.

The SDK's indexer provider supplies the pool address, recipient/account identity, viewing material, and cursor. It pins a block reference and detects reorgs. Oblivious HTTP can be used so the service does not trivially associate the request contents with the caller's network identity.

This is different from the public, keyless `strk20-indexer` participant project. The public indexer mirrors chain state; confidential wallet discovery interprets a user's own encrypted channels. Rebuilding either is unnecessary.

**Feasibility conclusion:** package the official discovery service as a managed dependency, expose its health/cursor/reorg state, and make its privacy boundary visible. Do not market it as a server that can never see sensitive request inputs.

### 3. Transaction prover

The official transaction prover exposes JSON-RPC at its root, including:

- `starknet_specVersion`;
- `starknet_proveTransaction`.

The inspected service currently expects Invoke V3 transactions and a finalized proving block. It documents a maximum concurrency of two by default, a busy response (`-32005`), retryable service behaviour, and a production recommendation around 48 vCPUs and 96 GB RAM. The current SDK already retries busy or unavailable proof services with backoff and parses the returned proof, facts, messages, and optional signature.

The SDK guidance recommends proving against a sufficiently mature block, currently described as roughly the current block minus ten, to reduce reorg and consistency problems. A failed submission also requires invalidating cached proof-nonce state before retrying.

**Feasibility conclusion:** the full prover should be a swappable remote service by default. An optional Docker profile can run the official image when hardware permits, but it must display hardware requirements. The fast local mode should expose the same provider boundary with a conspicuous `MOCK_PROOF` status. A mock result must never be described as a private mainnet proof.

### 4. Wallet API

The released wallet-facing surface inspected in `starknet@10.5.0` includes:

- `executeWithProof`;
- `strk20Balances`;
- `strk20PrepareInvoke`;
- `strk20InvokeTransaction`.

The corresponding wallet RPC actions cover:

- deposit;
- withdraw;
- private transfer;
- external invoke.

`wallet_strk20PrepareInvoke` can simulate without generating the expensive, state-revealing proof. That output is intentionally not submit-ready. `wallet_strk20InvokeTransaction` can be long-running because it performs proving, and it returns `NOT_REGISTERED` where the privacy account has not been set up. Invoke calldata supports placeholders for open-note IDs and the pool address.

Current documentation points builders to Starknet.js `^10.4.0`, while the inspected upstream repository pins `10.5.0`. At research time, npm's default `latest` tag did not expose the same STRK20 surface as the repository's pinned version, so version locking and compatibility checks are essential. The upstream privacy SDK and client are configured for GitHub Packages rather than ordinary public npm installation, adding authentication and onboarding friction.

No authoritative evidence was found that a supported browser privacy wallet can freely connect its STRK20 implementation to an arbitrary local devnet. The local product should therefore provide a faithful application-facing Wallet API test adapter for development while keeping the real-wallet mainnet path separate and obvious.

**Feasibility conclusion:** a wallet adapter is useful; a new wallet is out of scope. The adapter must follow the published request, response, error, and long-running-operation behaviour closely enough that applications can replace it with a real wallet at integration time.

### 5. Anonymizer and open notes

An anonymizer is a small adapter used in an atomic “sandwich”:

```text
private pool note
       ↓ withdraw input to helper
anonymizer privacy_invoke
       ↓ call public DeFi application
approve pool + return OpenNoteDeposit[]
       ↓
new private/open note credited by pool
```

The helper must return the exact open-note deposit span, approve the pool rather than transferring to it directly, and measure actual balance deltas. The pool currently allows at most one invoke leg in a privacy transaction. The resulting user link is hidden, but the external application action and amounts may remain public.

Upstream examples cover Ekubo and Vesu flows, plus shadow-account/derived-identity work. Open-note policies include required, exempt, and delegated handling. The source also contains newer compute/shadow-account capabilities that are not yet represented in the same way by the public wallet action union, so this is a moving compatibility surface.

**Feasibility conclusion:** ship one real anonymizer fixture and a contract harness that asserts approvals, balance deltas, returned deposits, and atomic failure. Do not attempt a general DeFi adapter framework in the first release.

## The Four Honest Environment Profiles

| Profile | Runs | Proof semantics | Intended use |
|---|---|---|---|
| `memory` | SDK test doubles and deterministic fixtures | Mock | Unit tests, UI states, CI, failure injection |
| `local` | Patched devnet, real deployed pool, local discovery, seeded accounts/tokens | Explicit mock-proof provider | Contract integration, discovery, reorg and anonymizer tests |
| `network` | Supported Starknet network, real wallet or SDK, real prover/discovery | Real | Staging and mainnet evidence |
| `full-prover` | Local stack plus official prover container | Real if hardware/configuration meet requirements | Advanced teams, CI runners, self-hosting validation |

Every log, badge, exported receipt, and UI state should identify the active profile. The product's most important trust feature is refusing to let developers confuse a simulated proof with a real one.

## Reverse Engineering: Privacy Infrastructure

### CDR Kit

CDR Kit's reusable insight is not its Story-specific contracts. It is the developer-product structure around a protocol: typed core, adapters, React surfaces, CLI/scaffolder, test mode, documentation, examples, and visible deployment evidence. It won the CDR Buildathon technical track by reducing repeated integration work.

**Take for STRK20:** one mental model and one compatibility matrix across CLI, test helpers, inspector, and example application.

### ZK Freighter

ZK Freighter puts identity, vault, proof, configuration, and transaction logic in a shared core while keeping web, extension, and mobile shells thin. Its bootnode is deliberately narrow and cannot sign. Its UI is unusually good at showing what is private, public, and independently verifiable.

**Take for STRK20:** shared core, thin surfaces, narrow supporting services, explicit network configuration, and evidence-first UX. Its source and assets should not be copied because the inspected repository did not declare a licence.

### Zcash

Zcash separates the node, the bandwidth-efficient `lightwalletd` service, client scanning, and viewing-key responsibilities. It supports local regtest/Docker workflows, but downstream end-to-end wallet testing still exposes gaps that require manual local networks.

**Take for STRK20:** local privacy tooling is an enduring infrastructure problem. Separate chain orchestration from wallet discovery, and include recovery/rescan scenarios from the beginning.

### RAILGUN

RAILGUN's engine embeds viewing, history scanning, Merkle state, balances, private transfers, and cross-contract calls as a reusable library. Its wallet tooling downloads proving artifacts only when needed, caches them, and validates hashes.

**Take for STRK20:** treat proof artifacts and binaries as versioned, integrity-checked dependencies; do not make every new project discover and trust downloads ad hoc.

### 0xbow Privacy Pools

0xbow separates contracts, circuits, SDK, relayer, and indexer concerns. Its account tooling reconstructs state from events and represents incomplete recovery state rather than pretending discovery is always finished.

**Take for STRK20:** display sync/recovery completeness, keep relaying separate, and make proof-artifact verification a first-class health check.

### Aztec

Aztec provides the strongest local-network precedent: one command starts the local Ethereum dependency, protocol contracts, accounts, tokens, sequencer, compiler/tooling, and wallet-side private execution environment. Its PXE owns secrets, notes, discovery, proving, and account isolation on the client side.

**Take for STRK20:** a privacy devnet must seed usable private state and expose wallet/discovery readiness, not merely start a JSON-RPC endpoint.

### Solana confidential transfers

Solana Token-2022 confidential transfers generate equality, validity, and range proofs on the client and require both token accounts to be configured. Official examples document that the default local validator can omit the required ZK operations, causing a misleading “local chain is running” state in which confidential operations fail.

**Take for STRK20:** a version and capability preflight is mandatory. “RPC healthy” is not the same as “private transaction stack compatible.”

### Stellar

`stellar-private-payments` is a work-in-progress reference stack spanning contracts, circuits, SDK, CLI, demo, browser proving, and compliance-provider integration. `stellar-zk` is a more general ZK developer kit with a unified `init → build → prove → deploy → call → estimate` workflow, templates, backend traits, profiles, and build manifests.

**Take for STRK20:** the CLI should model the developer's complete workflow and produce a machine-readable manifest, not act as a thin shell around Docker Compose.

## Reverse Engineering: General Developer Infrastructure

### wagmi and viem

wagmi separates core actions from React hooks while sharing one typed configuration for chains, connectors, and transports. viem exposes public, wallet, and test clients over interchangeable transports and supports typed custom RPC schemas and test-node actions.

**Take for STRK20:** define a small provider contract for chain, discovery, proof, and wallet operations. The same scenario code should run against memory, local, and network adapters.

### Scaffold-ETH

Scaffold-ETH turns setup into a product workflow: start chain, deploy, start app, use generated typed hooks, inspect/debug contracts, and fund burner accounts. Contract changes flow into the application rather than requiring manual address copying.

**Take for STRK20:** generate environment manifests and typed addresses automatically; include a small reference application that visibly reacts to the local stack.

### Indexer local environments

Modern indexer tooling such as Envio and Graph Node development runners bundles databases and query services, supplies sensible defaults, and supports fast redeployment. The indexer is managed as a dependency of the app development loop rather than treated as an unrelated deployment project.

**Take for STRK20:** discovery startup, cursor state, reset, health, and logs belong in the same control surface as the pool and test scenario.

## What Winning Infrastructure Usually Looks Like

The pattern is not simply “publish an SDK.” Strong winning examples make the dependency chain visible:

```text
protocol primitive
       ↓
reusable, typed developer workflow
       ↓
tested infrastructure package
       ↓
one concrete reference product
       ↓
evidence that other applications can adopt it
```

CDR Kit is the closest direct precedent: a technical-track winner that made a privacy protocol consumable through packages, CLI, components, tests, and documentation. Aragorn similarly made its infrastructure understandable through a dashboard and concrete end-user workflows. Privacy winners such as YORU and Zhat's Me paired strong primitives with one narrow story a judge could run and verify.

**Implication:** the STRK20 project needs both an installable lab and one excellent application fixture. A dashboard that only starts containers will underperform on mainnet product and integration depth.

## Missing Piece: Working Product Boundary

The current working descriptor is **STRK20 Developer Lab**. It is deliberately not a proposed brand name.

### Core promise

> Start a compatible STRK20 environment, run a private application scenario, inspect every public/private boundary, and move the same scenario to a real network without rewriting it.

### Candidate first-release surface

1. **CLI/orchestrator** — install/check/start/stop/reset/status, using pinned upstream versions.
2. **Machine-readable environment manifest** — chain, pool, accounts, tokens, discovery, proof mode, package versions, and capability flags.
3. **Scenario runner** — register, shield, private transfer, withdraw, and one anonymizer scenario.
4. **Test kit** — assertions for private balances, nullifier reuse, discovery cursors, atomic rollback, approvals, and public/private leakage boundaries.
5. **Failure injection** — prover busy/unavailable, stale proving block, reorg, unregistered recipient, discovery lag, insufficient public/private balance, and anonymizer revert.
6. **Wallet API development adapter** — published STRK20 request/response behaviour over the local scenario engine.
7. **Inspector/reference app** — topology, health, versions, Alice/Bob flow, note/discovery timeline, proof-mode warning, transaction evidence, and privacy-boundary explanations.
8. **Network handoff** — switch configuration to a real wallet/SDK and prover, run three genuine pool transactions, and export judge-verifiable evidence for `strk20.json` and the README.

### Explicitly outside the first boundary

- a new privacy pool;
- a new prover or circuit;
- another public note indexer;
- a new wallet or browser extension;
- a generic shield/transfer component library competing with existing kits;
- many DeFi integrations;
- hiding the fact that app-side anonymizer amounts can be public;
- describing mock-proof local transactions as production privacy.

## Fit Against the Sprint Rubric

| Criterion | Credible evidence path |
|---|---|
| STRK20 integration depth, 30% | Real pool deployment locally; actual discovery service; provider-compatible proving; published Wallet API behaviour; one real anonymizer; mainnet wallet/SDK flow |
| Working mainnet product, 30% | Public reference app, three successful live-pool transactions, real proof mode, explorer links, no login wall |
| Innovation, 25% | One-command privacy stack, capability/version preflight, profile parity, failure injection, privacy-boundary inspector, evidence export |
| Docs/open source, 15% | Permissive licence, five-minute quickstart, architecture and trust model, compatibility matrix, examples, CI, reproducible releases |

Infrastructure can meet and potentially win under the rubric. Its advantage is reusable ecosystem value; its risk is appearing like internal tooling rather than a product. The reference app and mainnet handoff solve that risk.

## Risks and Unresolved Questions

### High-priority organizer/upstream questions

1. Is the upstream mock-proof E2E pattern considered the recommended local-development mode, with genuine proving reserved for network or capable self-hosted environments?
2. Can Ready/Xverse privacy wallet implementations connect to a custom local devnet, or should local dapps use an adapter and test with the real Wallet API only on supported networks?
3. What is the supported public distribution path and licence for the privacy SDK/client packages currently configured through GitHub Packages?
4. Which exact pool, SDK, wallet API, discovery, prover, and patched-devnet versions should a third-party tool declare compatible for the sprint?

### Product risks

- The upstream surface is release-candidate software and can move during development.
- A full prover is not an ordinary laptop dependency.
- GitHub Packages authentication can prevent a genuinely one-command cold start unless distribution is clarified.
- Redistributing upstream binaries or images requires checking each licence and registry policy.
- Wallet API parity can drift if the adapter is not tested against a real supported wallet.
- “No obvious competing IDEA-24 entry” is a registry-snapshot finding, not proof that no team is building one privately or under a different description.
- Supporting every OS and container runtime would destroy the first-release focus; one reference platform plus CI is more credible.

## Go / No-Go Recommendation

**GO to scope discovery and an upstream compatibility spike.**

The direction has:

- an explicit place in the official ideas list;
- no clearly mature direct competitor in the inspected sprint registry;
- strong precedent in winning privacy/developer-tool projects;
- real upstream primitives to wrap instead of speculative protocol work;
- a credible route to every judging criterion;
- a concrete, honest distinction between simulated development and real mainnet privacy.

**Do not yet fork the registration repository or settle the brand.** First resolve the four upstream questions above and reduce the working boundary to the smallest mainnet-demonstrable vertical slice. The final name should come after that promise is fixed.

## Primary Sources

### STRK20

- [STRK20 build routes](https://strk20.starknet.io/build)
- [STRK20 by Example full agent reference](https://strk20-by-example.org/llms-full.txt)
- [Starknet Privacy monorepo](https://github.com/starkware-libs/starknet-privacy)
- [Private Sprint registry and ideas](https://github.com/starkience/strk20-hackathon)
- [STRK20 starter kit](https://github.com/Akashneelesh/strk20-starter-kit)
- [Starknet: Push to Private](https://www.starknet.io/blog/push-to-private/)
- [Starknet transaction prover source and documentation](https://github.com/starkware-libs/sequencer/tree/avi/privacy/configmap-docs/crates/starknet_transaction_prover)

### Privacy infrastructure

- [Zcash lightwalletd](https://github.com/zcash/lightwalletd)
- [RAILGUN engine](https://github.com/Railgun-Community/engine)
- [0xbow Privacy Pools Core](https://github.com/0xbow-io/privacy-pools-core)
- [Aztec local network](https://docs.aztec.network/developers/getting_started_on_local_network)
- [Aztec PXE](https://docs.aztec.network/developers/docs/foundational-topics/pxe)
- [Solana confidential-transfer example](https://github.com/solana-program/token-2022/blob/main/clients/cli/examples/confidential-transfer.sh)
- [Solana Confidential Balances sample guide](https://github.com/solana-developers/Confidential-Balances-Sample/blob/main/docs/product_guide.md)
- [Solana transaction-v1 local-validator limitations](https://github.com/solana-foundation/transaction-v1-examples/blob/main/README.md)
- [Stellar Private Payments](https://github.com/NethermindEth/stellar-private-payments)
- [Stellar ZK DevKit](https://github.com/stellar-zk/stellar-zk)
- [Stellar privacy overview](https://stellar.org/privacy)

### Developer products and winners

- [CDR Kit](https://github.com/Blockchain-Oracle/cdr-kit)
- [CDR Buildathon winners](https://build.usecdr.dev/winners)
- [ZK Freighter](https://github.com/Blockchain-Oracle/zk-freighter)
- [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2)
- [Graph Node Development](https://thegraph.com/docs/en/subgraphs/developing/creating/graph-node-dev/)
- [Aragorn](https://ethglobal.com/showcase/aragorn-5if7q)
- [YORU](https://ethglobal.com/showcase/yoru-4si1p)
