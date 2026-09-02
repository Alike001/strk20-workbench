# Public Repository Catalog

Snapshot date: **2026-09-02**. GitHub returned 75 public repositories. Categories below are research classifications inferred from repository names, metadata, and selected READMEs; they are not official organization teams.

Legend: **archived** and **fork** are GitHub status flags observed in the snapshot.

## STRK20, privacy, payments, and application contracts

| Repository | Primary language | Snapshot note |
|---|---|---|
| [`starknet-privacy`](https://github.com/starkware-libs/starknet-privacy) | TypeScript | Core STRK20 implementation monorepo. |
| [`privacy-bridge`](https://github.com/starkware-libs/privacy-bridge) | TypeScript | USDC EVM/CCTP bridge engine for the privacy pool. |
| [`starknet-payments`](https://github.com/starkware-libs/starknet-payments) | Cairo | Starknet payments contracts; README says WIP. |
| [`starknet-staking`](https://github.com/starkware-libs/starknet-staking) | Cairo | Starknet staking contracts; README says WIP. |
| [`starknet-perpetual`](https://github.com/starkware-libs/starknet-perpetual) | Cairo | Starknet perpetual-related contracts. |
| [`earn-contracts`](https://github.com/starkware-libs/earn-contracts) | Cairo | Earn-related contracts. |
| [`strkBTC`](https://github.com/starkware-libs/strkBTC) | Cairo | STRK/BTC-related contract repository; no GitHub description in snapshot. |
| [`usdc-migration`](https://github.com/starkware-libs/usdc-migration) | Cairo | USDC migration contracts. |
| [`sn-governed-token`](https://github.com/starkware-libs/sn-governed-token) | Cairo | Governed-token contracts. |
| [`Seamless-2FA-Wallet`](https://github.com/starkware-libs/Seamless-2FA-Wallet) | Cairo | Two-tier account-abstraction wallet. |

## Cairo language, VM, compiler, and formal verification

| Repository | Primary language | Snapshot note |
|---|---|---|
| [`cairo`](https://github.com/starkware-libs/cairo) | Rust | Current Cairo compiler/language repository. |
| [`cairo-vm`](https://github.com/starkware-libs/cairo-vm) | Rust | Current production Rust Cairo VM. |
| [`cairo_native`](https://github.com/starkware-libs/cairo_native) | Rust | Sierra-to-MLIR/native compiler. |
| [`cairo-lang`](https://github.com/starkware-libs/cairo-lang) | Python | Older Python Cairo repository. |
| [`cairo-vm-old`](https://github.com/starkware-libs/cairo-vm-old) | — | **Fork** retained under an explicit old name. |
| [`tree-sitter-cairo`](https://github.com/starkware-libs/tree-sitter-cairo) | JavaScript | Tree-sitter Cairo grammar. |
| [`formal-proofs`](https://github.com/starkware-libs/formal-proofs) | Lean | Formal verification of Cairo semantics and AIR encodings. |
| [`cairo-docs`](https://github.com/starkware-libs/cairo-docs) | HTML | **Archived** Cairo documentation repository. |

## Proving and cryptography

| Repository | Primary language | Snapshot note |
|---|---|---|
| [`proving`](https://github.com/starkware-libs/proving) | Rust | Consolidated proving monorepo and current migration target. |
| [`stwo`](https://github.com/starkware-libs/stwo) | Rust | Circle STARK foundation; development moved to `proving`. |
| [`stwo-cairo`](https://github.com/starkware-libs/stwo-cairo) | Rust | Cairo prover/verifier over Stwo; development moved to `proving`. |
| [`stwo-circuits`](https://github.com/starkware-libs/stwo-circuits) | Rust | Stwo circuit work. |
| [`stwo-cairo-m31`](https://github.com/starkware-libs/stwo-cairo-m31) | Rust | M31/Cairo proving work. |
| [`stwo-air-schema`](https://github.com/starkware-libs/stwo-air-schema) | Shell | AIR schema-related repository. |
| [`proving-utils`](https://github.com/starkware-libs/proving-utils) | Rust | Proving utilities. |
| [`stone-prover`](https://github.com/starkware-libs/stone-prover) | C++ | Earlier-generation STARK prover. |
| [`ethSTARK`](https://github.com/starkware-libs/ethSTARK) | C++ | Ethereum-oriented STARK implementation. |
| [`starkware-crypto-utils`](https://github.com/starkware-libs/starkware-crypto-utils) | TypeScript | Stark-curve keys, signatures, and Pedersen hash. |
| [`crypto-cpp`](https://github.com/starkware-libs/crypto-cpp) | C++ | C++ cryptographic utilities. |
| [`veedo`](https://github.com/starkware-libs/veedo) | Solidity | Verifiable-delay/randomness-era work; last push observed in 2020. |

## Starknet node, state, and specifications

| Repository | Primary language | Snapshot note |
|---|---|---|
| [`sequencer`](https://github.com/starkware-libs/sequencer) | Rust | Starknet sequencer under development; contains referenced privacy transaction-prover work. |
| [`mempool`](https://github.com/starkware-libs/mempool) | Rust | Mempool component. |
| [`committer`](https://github.com/starkware-libs/committer) | Rust | State-commitment component. |
| [`starknet-api`](https://github.com/starkware-libs/starknet-api) | Rust | Starknet API types/components. |
| [`starknet-specs`](https://github.com/starkware-libs/starknet-specs) | Python | JSON-RPC, Wallet, Proving, and P2P specs. |
| [`starknet-replay`](https://github.com/starkware-libs/starknet-replay) | Rust | Re-execute transactions against real network state. |
| [`blockifier`](https://github.com/starkware-libs/blockifier) | Rust | **Archived** transaction-execution component repository. |
| [`papyrus`](https://github.com/starkware-libs/papyrus) | Rust | **Archived** Starknet full node. |
| [`starknet-devnet`](https://github.com/starkware-libs/starknet-devnet) | Rust | **Fork** of Starknet devnet. |
| [`starkware-starknet-utils`](https://github.com/starkware-libs/starkware-starknet-utils) | Cairo | Common StarkWare application components. |

## Client libraries and connectivity

| Repository | Primary language | Snapshot note |
|---|---|---|
| [`starknet.js`](https://github.com/starkware-libs/starknet.js) | TypeScript | **Fork** of the Starknet JavaScript library. |
| [`starknet-rs`](https://github.com/starkware-libs/starknet-rs) | — | **Fork** of a Rust Starknet library. |
| [`starknet-connect`](https://github.com/starkware-libs/starknet-connect) | TypeScript | Starknet connection tooling. |
| [`starknet-snap`](https://github.com/starkware-libs/starknet-snap) | HTML | Wallet Snap-related repository. |

## StarkEx and exchange infrastructure

| Repository | Primary language | Snapshot note |
|---|---|---|
| [`starkex-contracts`](https://github.com/starkware-libs/starkex-contracts) | Solidity | StarkEx contracts. |
| [`starkex-core`](https://github.com/starkware-libs/starkex-core) | — | StarkEx core repository. |
| [`starkex-js`](https://github.com/starkware-libs/starkex-js) | TypeScript | StarkEx JavaScript SDK. |
| [`starkex-resources`](https://github.com/starkware-libs/starkex-resources) | Python | StarkEx resources. |
| [`starkex-resources-wip`](https://github.com/starkware-libs/starkex-resources-wip) | Python | Older WIP resources repository. |
| [`starkex-for-spot-trading`](https://github.com/starkware-libs/starkex-for-spot-trading) | Cairo | Spot-trading contracts. |
| [`stark-perpetual`](https://github.com/starkware-libs/stark-perpetual) | Cairo | StarkEx/perpetual-era Cairo contracts. |
| [`starkex-playground`](https://github.com/starkware-libs/starkex-playground) | Python | StarkEx playground. |
| [`starkex-apps-api`](https://github.com/starkware-libs/starkex-apps-api) | — | StarkEx application API material. |
| [`starkex-data-availability-committee`](https://github.com/starkware-libs/starkex-data-availability-committee) | Python | StarkEx DAC implementation/material. |

## Product configuration repositories

| Repository | Primary language | Snapshot note |
|---|---|---|
| [`x10-config`](https://github.com/starkware-libs/x10-config) | — | X10 configuration. |
| [`gammax-config`](https://github.com/starkware-libs/gammax-config) | — | GammaX perpetual StarkEx configuration. |
| [`dydx-config`](https://github.com/starkware-libs/dydx-config) | — | dYdX configuration. |
| [`okx-config`](https://github.com/starkware-libs/okx-config) | — | OKX configuration. |
| [`davion-config`](https://github.com/starkware-libs/davion-config) | — | Davion Labs perpetual StarkEx configuration. |
| [`spherex-config`](https://github.com/starkware-libs/spherex-config) | — | SphereX configuration. |

## Tutorials, meetings, and learning material

| Repository | Primary language | Snapshot note |
|---|---|---|
| [`StarkNet-AllCoreDevs-Meetings`](https://github.com/starkware-libs/StarkNet-AllCoreDevs-Meetings) | — | **Fork**; historical meeting material. |
| [`starknet-tutorials-cairo-syntax`](https://github.com/starkware-libs/starknet-tutorials-cairo-syntax) | — | Cairo syntax tutorial. |
| [`starknet-tutorials-erc20`](https://github.com/starkware-libs/starknet-tutorials-erc20) | — | ERC-20 tutorial. |
| [`starknet-tutorials-erc721`](https://github.com/starkware-libs/starknet-tutorials-erc721) | — | ERC-721 tutorial. |
| [`starknet-tutorials-utils`](https://github.com/starkware-libs/starknet-tutorials-utils) | — | Tutorial utilities. |
| [`starknet-tutorials-global`](https://github.com/starkware-libs/starknet-tutorials-global) | — | General tutorial material. |

## CI, GitHub automation, infrastructure, mirrors, and test repositories

| Repository | Primary language | Snapshot note |
|---|---|---|
| [`merge-gatekeeper`](https://github.com/starkware-libs/merge-gatekeeper) | Go | **Fork** for merge control. |
| [`github-action-benchmark`](https://github.com/starkware-libs/github-action-benchmark) | — | **Fork** for continuous benchmarking. |
| [`setup-rust`](https://github.com/starkware-libs/setup-rust) | TypeScript | **Fork** GitHub Action for Rust setup. |
| [`find-comment`](https://github.com/starkware-libs/find-comment) | — | **Fork** GitHub Action. |
| [`create-or-update-comment`](https://github.com/starkware-libs/create-or-update-comment) | — | **Fork** GitHub Action. |
| [`python-terraform`](https://github.com/starkware-libs/python-terraform) | Python | **Fork** Terraform wrapper. |
| [`karpenter`](https://github.com/starkware-libs/karpenter) | — | Infrastructure repository; no description in snapshot. |
| [`test-repository`](https://github.com/starkware-libs/test-repository) | — | Organization test repository. |
| [`ekubo-abis`](https://github.com/starkware-libs/ekubo-abis) | Cairo | **Archived** mirror of deleted Ekubo ABIs. |

## Catalog cautions

- Primary language is GitHub's detected language, not the only language used.
- A blank description or language is recorded as `—`; it is not a maturity judgment.
- “Active” here only means GitHub did not mark a repository archived; it does not guarantee maintenance or production use.
- Exact dependencies must be established from manifests and lockfiles, not from this category map.

