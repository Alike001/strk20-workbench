# Reality Research: StarkWare Libs and STRK20

## Scope

Research question: what currently exists in the public `starkware-libs` GitHub organization, how does its repository ecosystem relate to STRK20, and what does the public source reveal about STRK20's architecture, maturity, and trust boundaries?

This is a current-reality brief. It documents what the public sources show as of 2026-09-02; it does not propose a product, integration architecture, or protocol changes.

## Sources Checked

- GitHub organization metadata and the complete public-repository list via GitHub's API.
- The `main` branch of `starknet-privacy`, locally inspected at commit [`bc75e4b`](https://github.com/starkware-libs/starknet-privacy/commit/bc75e4bac71ad0ce10c6e63effc33b5b25131a4f).
- The `main` branch of `privacy-bridge`, locally inspected at commit [`3e95694`](https://github.com/starkware-libs/privacy-bridge/commit/3e95694b997069c47eff52cd576af0bb3e03612d), including its README and threat model.
- READMEs and metadata for `cairo`, `cairo-vm`, `sequencer`, `starknet-specs`, `stwo`, `stwo-cairo`, `proving`, `formal-proofs`, `starknet-payments`, `starknet-staking`, and `starkware-starknet-utils`.
- The OpenZeppelin Privacy Contracts Audit dated 2026-05-29, scoped to `starknet-privacy` commit [`c5e2fb5`](https://github.com/starkware-libs/starknet-privacy/commit/c5e2fb5).
- The public STRK20 site at [`strk20.starknet.io`](https://strk20.starknet.io/).

Exact source links are collected in [`sources.md`](./sources.md).

## Verified Facts

### Organization

- The GitHub organization is named **StarkWare Libs** and links to `www.starkware.co`.
- GitHub reported **75 public repositories**: 60 active non-forks, 10 forks, and 5 archived repositories.
- The most common primary languages were Rust (18 repositories), Cairo (12), TypeScript (7), and Python (7); 20 repositories had no detected primary language.
- GitHub reported Apache-2.0 on 36 repositories, MIT on 8, and no machine-readable license identifier on 29. Repository-level license files still need to be checked before reuse.
- The organization had no pinned repositories at the time of the API query.

### Where STRK20 lives

- The main implementation repository is [`starknet-privacy`](https://github.com/starkware-libs/starknet-privacy), described by GitHub as “Starknet privacy protocol.”
- The repository is public and Apache-2.0 licensed. It was created on 2025-11-25.
- At the inspected snapshot, the latest GitHub release was [`PRIVACY-0.14.3-RC.6`](https://github.com/starkware-libs/starknet-privacy/releases/tag/PRIVACY-0.14.3-RC.6), published on 2026-09-01. The SDK package also reported version `0.14.3-rc.6`.
- Tags identify two mainnet contract milestones: `CONTRACT_V1_DEPLOYED_MAINNET_2026-04-20` and `CONTRACT_V2_DEPLOYED_MAINNET_2026-07-08`.
- The checked-in mainnet demo configuration leaves pool addresses, class hashes, service URLs, compliance key, tokens, and paymaster details as `TODO` placeholders. Those deployment values are therefore not established by the repository alone.

### Implemented components

The inspected monorepo contains:

- A Cairo privacy-pool account contract in `packages/privacy`.
- Cairo anonymizers for Ekubo swaps, Vesu lending, and shadow accounts.
- A TypeScript SDK published as `@starkware-libs/starknet-privacy-sdk` through GitHub Packages.
- A separate TypeScript client package.
- A Rust discovery core and HTTP discovery service.
- A transaction-prover integration whose compatible image comes from work in the `sequencer` repository.
- An optional proof-interceptor and Elliptic proxy for deposit screening.
- A React/Vite developer demo.
- TypeScript end-to-end tests, Cairo tests, Rust tests, and a Lean directory for formal-verification work.
- An OpenZeppelin audit report for the V1 contract scope.

### Transaction path

The repository's architecture states the following flow:

1. A wallet uses the SDK to compile actions.
2. The SDK sends those actions to an operator-side proving service.
3. The prover executes them in virtual Starknet blocks and returns a validity proof plus proof facts.
4. The wallet submits the resulting Starknet transaction, ideally through a paymaster.
5. Starknet validates the proof; the pool contract validates the associated proof facts and atomically applies the resulting actions.
6. A discovery service reads encrypted onchain state so wallets can recover relevant notes and channels without scanning all pool storage themselves.

The pool contract is the onchain source of truth for actions, storage layout, and protocol cryptography. The proving and discovery services are offchain infrastructure.

### Contract behavior

- Client actions are phase ordered: register viewing key, open channel, open token subchannel, deposit, use notes, create notes, withdraw, and optionally invoke one external contract.
- The pool uses Poseidon hashes with domain separation and ECDH-based encryption.
- The contract stores write-once note and registration data and reveals nullifiers when notes are spent.
- Registration is immutable in the inspected contract: attempting to set a viewing key again reverts through write-once enforcement.
- `apply_actions` has a reentrancy guard and pause check and validates proof program/version, base block, proof expiry, and message hash before applying state changes.
- Governance roles can manage upgrades, auditor/screener keys, fees, the fee collector, proof-validity parameters, and open-note screening policy.
- Fees, when enabled, are collected in STRK per `apply_actions` call.

### Discovery and metadata privacy

- The discovery service is designed as a stateless, RPC-backed HTTP API with cursor pagination; it does not require a local index database in the described implementation.
- Decryption keys are supplied per request and are described as request-scoped and not stored.
- Optional Oblivious HTTP support separates client IP metadata from encrypted request contents when a non-colluding relay is used.
- The service can read `pre_confirmed` state for responsive read-only UX, but proofs must be built against finalized state.

### Compatibility and operational status

- The root README presents a compatibility matrix rather than claiming every `main` branch works with every other component.
- The current matrix mixes `PRIVACY-0.14.3-RC.6` for SDK/proof interceptor with `PRIVACY-0.14.3-RC.2` images for the transaction prover and discovery service, plus Pathfinder `v0.22.7`.
- The SDK README requires Node.js 24 because of `ohttp-ts`, while the root and demo READMEs say Node.js 20 or newer. Component-level requirements therefore differ.
- The SDK documents a roughly ten-block sequencing constraint between state-changing activity and the finalized base block used for proving.

### Audit facts

- OpenZeppelin audited the V1 Cairo contract files at commit `c5e2fb5`.
- The report found 0 critical, 0 high, 2 medium, 5 low, and 4 informational issues: 11 total, 6 marked resolved in that report.
- Both medium findings were marked resolved.
- At report time, three low findings remained acknowledged/unresolved: expensive compilation before signature validation, nominal accounting for fee-on-transfer/rebasing tokens, and client ephemeral-secret reuse risk. One packing-boundary finding was acknowledged with an intention to resolve.
- The audit explicitly lists trust in Starknet consensus, client randomness, offchain proving and discovery availability, an auditor key, and immediately effective governance upgrades.
- The audit is not a certification and covers only the listed V1 contract files at its audited commit, not the entire current monorepo or its offchain services.

### Related privacy bridge

- [`privacy-bridge`](https://github.com/starkware-libs/privacy-bridge) is a separate Apache-2.0 repository for moving USDC between EVM chains and the Starknet privacy pool using Circle CCTP.
- Its public threat model explicitly says amount correlation, small anonymity sets, timing correlation, auditor visibility, and cash-out re-linking remain relevant.
- Its threat model also documents trust or metadata exposure involving the prover, relay, discovery indexer, auditor, AVNU paymaster, WalletConnect/Reown, RPC providers, and Circle.

### Wider repository organization

- `cairo` is the Rust implementation of the Cairo compiler and language toolchain.
- `cairo-vm` is the current production Rust Cairo VM; `cairo-lang` is the older Python-era codebase.
- `sequencer`, `mempool`, `committer`, `starknet-api`, and `starknet-specs` cover execution/node infrastructure and protocol interfaces.
- `stwo` and `stwo-cairo` both state that development moved to [`proving`](https://github.com/starkware-libs/proving) at the end of July 2026. They remain useful historical and documentation entry points, but `proving` is the current consolidation target.
- `formal-proofs` contains Lean work covering Cairo semantics and AIR soundness, including S-two-related verification.
- StarkEx-era repositories remain public alongside newer Starknet repositories; they should not automatically be treated as dependencies of STRK20.

## Inferences

These conclusions are interpretations of the verified repository evidence:

- `starknet-privacy` is best understood as an actively evolving release-candidate platform rather than a frozen standard implementation. The release naming, component matrix, frequent activity, and remaining configuration placeholders all point in that direction.
- STRK20's privacy is a full-system property, not merely a Cairo-contract property. Wallet key handling, randomness, proving requests, discovery requests, relayer behavior, screening configuration, RPC metadata, and usage patterns can all affect real-world privacy.
- The external prover appears primarily to affect transaction availability and metadata privacy rather than unilateral asset theft: the audit says any party able to run the proving infrastructure can submit valid transactions, while valid state transitions remain contract-checked. This does not rule out censorship, correlation, or implementation bugs.
- The organization repository list is a mixture of current production code, work in progress, migrations, historical systems, tutorials, configuration repositories, and forks. GitHub activity or star count alone is not a reliable maturity signal.

## Unknowns And Questions

- What are the canonical mainnet pool address, class hash, current auditor/screener public keys, supported-token list, fee settings, and governance-role holders?
- Which exact commits and container digests are deployed today, beyond the milestone tags?
- Are governance upgrades protected by a multisig, timelock, monitoring system, or emergency process? The audited model allowed upgrades with no onchain reaction delay.
- Who operates the production prover, discovery service, OHTTP relay, auditor, screener, and paymaster, and what are their retention and non-collusion policies?
- Has the current post-V1 contract and the offchain stack received additional audits not present in `docs/audit`?
- What is the production anonymity set by token, denomination, and time window?
- Which tokens are actually admitted, especially given the audit's accounting caveat for fee-on-transfer and rebasing assets?
- Which parts of `lean/privacy` are complete proofs versus active scaffolding? The repository map identifies the directory, but no top-level completion statement was found during this pass.
- Is STRK20 intended to become a formal Starknet ecosystem standard with a stable specification, or is “standard” currently a product/protocol label?

## Not Included

- No private StarkWare repositories, internal deployment configuration, production logs, or non-public audits were inspected.
- No contracts were executed against mainnet or Sepolia.
- No cryptographic proof, contract, SDK, or service implementation was independently security-audited in this research pass.
- No attempt was made to reproduce builds, tests, proofs, deployments, or performance claims.
- No integration plan or implementation recommendation is included.
