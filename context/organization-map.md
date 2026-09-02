# StarkWare Libs Organization Map

Snapshot date: **2026-09-02**.

## Organization profile

| Item                           |             Observed value |
| ------------------------------ | -------------------------: |
| Public repositories            |                         75 |
| Active, non-fork repositories  |                         60 |
| Forks                          |                         10 |
| Archived repositories          |                          5 |
| Most common primary language   |     Rust — 18 repositories |
| Cairo repositories             |                         12 |
| TypeScript repositories        |                          7 |
| Python repositories            |                          7 |
| Organization verification flag | Not verified by GitHub API |
| Pinned repositories            |              None returned |

The “not verified” flag is GitHub metadata, not a claim that the organization is illegitimate. The profile links to StarkWare's corporate site, and the repositories are the public source locations referenced throughout StarkWare and Starknet documentation.

## Functional layers

### 1. Language and execution

| Repository                                                                 | Role                                                                                                        |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [`cairo`](https://github.com/starkware-libs/cairo)                         | Current Rust compiler and language toolchain for provable programs and Starknet contracts.                  |
| [`cairo-vm`](https://github.com/starkware-libs/cairo-vm)                   | Current Rust implementation of the Cairo VM; its README says it replaced the older Python VM in production. |
| [`cairo_native`](https://github.com/starkware-libs/cairo_native)           | Compiles Cairo Sierra to MLIR/native execution paths.                                                       |
| [`cairo-lang`](https://github.com/starkware-libs/cairo-lang)               | Older Python-era Cairo repository.                                                                          |
| [`tree-sitter-cairo`](https://github.com/starkware-libs/tree-sitter-cairo) | Cairo parser grammar for editor/tooling integrations.                                                       |

STRK20's onchain contracts are written in Cairo, so this layer supplies its programming and execution foundation.

### 2. Proof generation and verification

| Repository                                                                                                                 | Role                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [`proving`](https://github.com/starkware-libs/proving)                                                                     | Current consolidation target for StarkWare's Rust proving work.                           |
| [`stwo`](https://github.com/starkware-libs/stwo)                                                                           | Circle STARK prover/verifier foundation; README directs new development to `proving`.     |
| [`stwo-cairo`](https://github.com/starkware-libs/stwo-cairo)                                                               | Cairo-specific proving layer over Stwo; README also directs new development to `proving`. |
| [`stwo-circuits`](https://github.com/starkware-libs/stwo-circuits)                                                         | Circuit-related Stwo work.                                                                |
| [`proving-utils`](https://github.com/starkware-libs/proving-utils)                                                         | Shared proving utilities.                                                                 |
| [`formal-proofs`](https://github.com/starkware-libs/formal-proofs)                                                         | Lean verification of Cairo semantics and AIR soundness.                                   |
| [`stone-prover`](https://github.com/starkware-libs/stone-prover), [`ethSTARK`](https://github.com/starkware-libs/ethSTARK) | Earlier-generation proving implementations.                                               |

The STRK20 repository does not directly declare that its transaction prover is built from `proving`; its current compatibility table instead points to a transaction-prover implementation in the `sequencer` repository. The general proving repositories are the broader cryptographic foundation, not automatically direct runtime dependencies.

### 3. Starknet node and protocol infrastructure

| Repository                                                             | Role                                                                                                                             |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [`sequencer`](https://github.com/starkware-libs/sequencer)             | Starknet sequencer implementation under development; also contains the transaction-prover path referenced by `starknet-privacy`. |
| [`mempool`](https://github.com/starkware-libs/mempool)                 | Transaction mempool work.                                                                                                        |
| [`committer`](https://github.com/starkware-libs/committer)             | State commitment-related infrastructure.                                                                                         |
| [`starknet-api`](https://github.com/starkware-libs/starknet-api)       | Rust Starknet API types/components.                                                                                              |
| [`starknet-specs`](https://github.com/starkware-libs/starknet-specs)   | JSON-RPC, Wallet API, Proving API, and P2P specifications.                                                                       |
| [`starknet-replay`](https://github.com/starkware-libs/starknet-replay) | Re-execution of existing Starknet transactions against real state.                                                               |
| [`blockifier`](https://github.com/starkware-libs/blockifier)           | Archived in this organization; historically the sequencer's transaction-execution component.                                     |
| [`papyrus`](https://github.com/starkware-libs/papyrus)                 | Archived Starknet full-node repository in this organization.                                                                     |

### 4. STRK20 privacy layer

| Repository                                                                               | Role                                                                                                                        |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [`starknet-privacy`](https://github.com/starkware-libs/starknet-privacy)                 | Core pool contract, SDK, discovery, compliance screening, anonymizers, demo, and tests.                                     |
| [`privacy-bridge`](https://github.com/starkware-libs/privacy-bridge)                     | USDC movement between EVM chains and the pool through Circle CCTP.                                                          |
| [`starkware-starknet-utils`](https://github.com/starkware-libs/starkware-starknet-utils) | Shared Cairo application components pinned by the privacy contracts.                                                        |
| [`ekubo-abis`](https://github.com/starkware-libs/ekubo-abis)                             | Archived mirror pinned by related contract builds; the repo description specifically mentions SuperVega rather than STRK20. |

### 5. Starknet applications and economic protocols

Examples include staking, payments, perpetuals, governed tokens, token migration, earn contracts, `strkBTC`, and an account-abstraction wallet. These demonstrate that the organization houses protocol applications as well as base infrastructure. They are not all STRK20 dependencies.

### 6. StarkEx and historical product infrastructure

Repositories such as `starkex-contracts`, `starkex-core`, `starkex-js`, `starkex-resources`, spot trading, perpetuals, and exchange configuration repositories belong to the StarkEx product lineage. They coexist with Starknet work but should be evaluated separately.

## STRK20 dependency view

```text
starknet-privacy
├── Cairo contracts
│   ├── Cairo/Starknet toolchain
│   ├── OpenZeppelin Cairo components
│   ├── starkware-starknet-utils (pinned Git revision)
│   └── Ekubo contracts (pinned Git revision)
├── TypeScript SDK/client
│   ├── starknet.js 10.5.0 in the published SDK snapshot
│   ├── ohttp-ts
│   └── Zod and cryptographic/browser libraries
├── Rust discovery service
│   └── Starknet RPC / Pathfinder-backed state reads
├── transaction proving
│   └── compatible transaction-prover image linked to sequencer work
├── deposit screening
│   ├── proof-interceptor
│   ├── elliptic-proxy
│   └── Elliptic AML service
└── integrations
    ├── Ekubo swap anonymizer
    ├── Vesu lending anonymizer
    ├── shadow-account anonymizer
    ├── AVNU paymaster path
    └── privacy-bridge / Circle CCTP
```

This diagram combines direct build dependencies, documented runtime dependencies, and documented integrations. It is not a package-manager lock graph.

## Repository status signals to read carefully

- **Release candidate:** the current privacy releases include `RC` in their version names even though mainnet deployment milestone tags exist.
- **Migrated:** `stwo` and `stwo-cairo` are still public and prominent, but their READMEs say development moved to `proving`.
- **Archived:** five repositories are explicitly archived; others may still be historical even when not archived.
- **Fork:** ten repositories are forks, sometimes used for patched or organization-specific integration work.
- **Work in progress:** several application READMEs explicitly carry WIP disclaimers.
- **Blank description:** a missing GitHub description is not evidence that a repository is unused; source and README inspection is required.
