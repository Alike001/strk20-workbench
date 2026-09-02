# Reality Research: STRK20 Infrastructure Idea

Date: 2026-09-02

## Scope

Determine whether an infrastructure project can satisfy and compete under the STRK20 Private Sprint rubric; reverse-engineer the product and engineering patterns in `Blockchain-Oracle/cdr-kit` and `Blockchain-Oracle/zk-freighter`; identify overlap in the current STRK20 field; and compare relevant privacy and developer-infrastructure projects in other ecosystems.

This is a research and concept-selection artifact. It is not an implementation plan or authorization to register a project.

## Sources Checked

### Primary reference repositories

- [Blockchain-Oracle/cdr-kit](https://github.com/Blockchain-Oracle/cdr-kit), commit `bacde37f08ffab366cff2754ae714d073e45fa7b`
- [CDR Kit live product](https://www.cdrkit.xyz/)
- [CDR Buildathon winners](https://build.usecdr.dev/winners)
- [Blockchain-Oracle/zk-freighter](https://github.com/Blockchain-Oracle/zk-freighter), commit `5ddf72483e1383defcbc0a17fd9dba58c5e0f0f4`

### STRK20 sources

- [Private Sprint repository](https://github.com/starkience/strk20-hackathon), local snapshot commit `857456d413cdcddcd52644884bd2a7b7bbead533`
- `README.md`, `IDEAS.md`, `registry.json`, and the project crawler in that snapshot
- [starkware-libs/starknet-privacy](https://github.com/starkware-libs/starknet-privacy), local snapshot commit `bc75e4bac71ad0ce10c6e63effc33b5b25131a4f`
- Current participant repositories for `strk20-indexer`, `STRK20 ZK Receipts`, `strk-disclose`, `VeilCheck`, `Preflight`, `VeilGuard`, `Tx404`, `PrivKit`, `Lacuna`, and `Ledger Glass`

### External comparisons

- [0xbow Privacy Pools Core](https://github.com/0xbow-io/privacy-pools-core)
- [Envio Privacy Pools indexer](https://github.com/enviodev/privacy-pools)
- [RAILGUN Wallet SDK](https://github.com/Railgun-Community/wallet)
- [ZK-Kit](https://github.com/zk-kit/zk-kit)
- [RainbowKit](https://github.com/rainbow-me/rainbowkit)
- [Aragorn](https://ethglobal.com/showcase/aragorn-5if7q), an open-source ETHGlobal prize winner
- [YORU](https://ethglobal.com/showcase/yoru-4si1p), an open-source ETHGlobal finalist and privacy-track winner
- [Zhat's Me](https://ethglobal.com/showcase/zhats-me-vioyt), an open-source selective-disclosure SDK integration winner
- [PRTCT](https://ethglobal.com/showcase/prtct-p8roy), an open-source Aztec prize winner

All inspected third-party repositories were cloned into a temporary research directory. No third-party code or assets were copied into this workspace.

## Verified Facts

### Infrastructure is eligible and can score well

- The sprint accepts individuals or teams and new or existing projects.
- The repository must be public, open-source, and licensed.
- A scored project needs a public demo, a three-minute video, and at least three successful Starknet mainnet transactions touching the live STRK20 pool.
- The judging weights are 30% STRK20 integration depth, 30% working mainnet product, 25% innovation, and 15% documentation/open-source quality.
- The rules explicitly say that another team depending on something a project published counts in that project's favour.
- `IDEAS.md` explicitly includes infrastructure ideas 19 through 26, including a local environment and drop-in components.

Therefore infrastructure is not merely allowed; reusable infrastructure is directly encouraged. It is still required to have a real, publicly usable mainnet surface.

### What CDR Kit actually is

CDR Kit is a productization layer over Story Protocol's Confidential Data Rails. It turns a difficult protocol into several developer-facing surfaces with one mental model:

- nine deployed condition contracts;
- typed contract bindings and addresses;
- a TypeScript core SDK;
- React hooks, headless components, and styled components;
- a CLI and project scaffolder;
- framework-neutral agent tools mapped into MCP and several agent frameworks;
- a documentation/dashboard application;
- mock mode, test helpers, typed statuses, and typed errors.

Its repository is a pnpm/Turborepo monorepo. The actual protocol integration stays in core packages, while applications and adapters remain thin.

CDR Kit was a winner in the CDR Buildathon technical track. The winners page describes its value as making CDR usable without every developer rebuilding protocol plumbing. This is direct evidence that well-executed infrastructure can win a privacy-oriented technical track.

CDR Kit's strongest reusable product lessons are:

1. Package a real missing workflow, not only documentation.
2. Give developers multiple entry surfaces over one tested core.
3. Provide mock/testing mode so adoption does not begin with funds or infrastructure.
4. Make documentation, quickstarts, examples, and live evidence part of the product.
5. State protocol limitations and already-existing work honestly.

### Why the CDR Kit interface feels polished

The UI is a deliberately restrained developer-product design rather than a generic crypto landing page:

- light-first warm paper background with an optional dark theme;
- indigo as the primary action colour, green for verified/live states, and amber for warnings;
- Bricolage Grotesque for display text, Hanken Grotesk for body text, and JetBrains Mono for technical evidence;
- a two-column hero containing the promise on the left and a live protocol object on the right;
- a faint technical grid, small evidence badges, code windows, package pills, and deployment tables;
- sections ordered as product promise, package map, quickstart, live flow, supported primitives, proof, differentiation, and final call to action;
- restrained radii, thin borders, small shadows, and motion attached to state changes instead of decoration.

The repository is MIT licensed. Its code can be reused under the license, but a STRK20 project should still have its own name, copy, visual identity, diagrams, and assets.

### What ZK Freighter actually is

ZK Freighter is not a developer kit. It is a privacy-by-default Stellar wallet system with:

- web, browser-extension, and mobile surfaces;
- one shared `@zk-freighter/core` package for identity, vaults, proofs, network configuration, and transactions;
- a shared UI package;
- in-browser proof generation;
- a narrow bootnode that retains and serves historical pool events;
- a testnet funding service;
- explicit testnet/mainnet configuration;
- selective-disclosure receipts;
- a large public evidence table of accepted transactions;
- explicit statements of public boundaries and non-claims.

Its most transferable engineering lessons are:

1. Put privacy, keys, proving, and transaction logic in one core; keep surfaces thin.
2. Make supporting services narrow, optional, self-hostable, and incapable of signing.
3. Treat network switching as configuration rather than a rewrite.
4. Explain exactly what is public, encrypted, or inferred.
5. Record explorer-verifiable evidence beside every major integration claim.

No license is declared by GitHub for the ZK Freighter repository and no root license file was present in the inspected snapshot. Its architecture and public behaviour can be studied, but its code, artwork, copy, and assets should not be copied unless the owner grants a license.

### Existing STRK20 overlap

The obvious infrastructure prompts are already unevenly occupied:

| Prompt                                | Current overlap                                                                              | Observed maturity                                                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IDEA-21 selective disclosure          | STRK20 ZK Receipts, strk-disclose, Ledger Glass, and payment projects with scoped disclosure | Multiple implementations; Ledger Glass has a concrete scoped-key design, while two others had no mainnet evidence in their manifests at the inspected commits |
| IDEA-23 open note indexer             | `kfastov/strk20-indexer`                                                                     | Very deep Rust implementation: keyless sync, epoch bundles, storage-proof verification, tests, and one recorded pool transaction                              |
| IDEA-24 local development environment | No registry entry clearly claims this prompt                                                 | Upstream has devnet/test pieces, but no single packaged developer environment was found                                                                       |
| IDEA-25 privacy simulator             | VeilCheck, Preflight, VeilGuard, and parts of Lacuna                                         | Crowded; Lacuna already had six verified mainnet pool interactions, a public demo, and a video                                                                |
| IDEA-26 component/SDK kit             | Tx404, PrivKit, Stealth Checkout, and starter-kit derivatives                                | Tx404 already exposes core and React packages; PrivKit was still pre-code in the inspected commit                                                             |

This makes IDEA-23 and IDEA-25 poor starting points for a late entrant unless the approach is materially different. A general “STRK20 SDK” would also be compared directly with Tx404 and the upstream SDK.

### The upstream local-development reality

`starkware-libs/starknet-privacy` already contains substantial building blocks:

- an exported `@starkware-libs/starknet-privacy-sdk/testing` surface;
- `Mocknet`, mock pool/proof providers, contract and indexer discovery providers, and tracing helpers;
- a managed devnet helper that creates funded accounts and deploys the privacy contract;
- Cairo contracts and test contracts;
- an end-to-end suite that starts a discovery indexer and tests deposit, private transfer, note discovery, pagination, reorgs, swaps, and lending;
- a Rust discovery service and fixtures;
- a published transaction-prover container reference.

However, the upstream E2E README requires the developer to install a patched Starknet devnet, build Cairo artifacts, build the SDK, build the Rust discovery service, install a separate E2E workspace, and configure environment data. No root Compose file, project scaffolder, or one-command application-facing environment was found in the inspected snapshot.

The opportunity is therefore orchestration and developer experience, not reimplementing the pool, cryptography, or discovery protocol.

### Lessons from other ecosystems and winners

- 0xbow packages protocol contracts, circuits, a relayer, and an SDK separately. This validates a layered privacy stack and shows that relaying, proof artifacts, and account recovery are distinct infrastructure concerns.
- RAILGUN exposes wallet/privacy functions as an SDK that other apps can embed. It validates the “privacy engine as a library” shape.
- ZK-Kit succeeds by shipping small, tested, documented primitives that many protocols reuse rather than one oversized application.
- RainbowKit's adoption comes from a polished component experience, scaffolding, examples, and a narrow job rather than owning the wallet protocol itself.
- Envio's Privacy Pools project shows how a public indexer can pair event ingestion with query-ready analytics, while keeping the underlying privacy protocol separate.
- Aragorn won multiple ETHGlobal prizes as infrastructure, but made the infrastructure concrete through a dashboard and several end-user workflows.
- Zhat's Me won an SDK-integration prize by turning privacy primitives into one understandable proof workflow.
- YORU won/finaled with a focused user problem, real contracts, and a clear explanation of how account abstraction, paymasters, and stealth addresses were load-bearing.
- PRTCT won an Aztec prize with a narrow proof claim and an end-to-end demonstrator, even though its production vision was larger.

The repeated pattern is: judges can reward infrastructure, but they understand and trust it more easily when it includes one excellent reference product and verifiable technical evidence.

## Inferences

### Best current direction

The strongest whitespace is a focused STRK20 developer laboratory: a one-command, deterministic environment for building and testing private applications. This is a working concept, not a final project name.

Its centre should be IDEA-24, with only the minimum useful pieces of IDEA-26:

- a CLI that starts a pinned STRK20 development stack;
- funded Alice/Bob accounts and known token fixtures;
- a pool plus discovery service and a selectable mock/real proving path;
- deterministic scenarios for register, shield, private transfer, unshield, and one anonymizer flow;
- an application-facing test kit with assertions and failure injection;
- a small React inspector/control room, not a second general component SDK;
- an exportable evidence report for local tests and real mainnet verification;
- one public reference app that also performs genuine mainnet STRK20 actions through a compatible wallet.

This combines CDR Kit's developer-product shape with ZK Freighter's shared core, narrow services, privacy honesty, and evidence discipline. It does not copy Story-specific conditions, ZK Freighter wallet code, or existing STRK20 indexer/simulator products.

### Why this can fit the four judging criteria

| Criterion                      | What the project would need to demonstrate                                                                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Integration depth, 30%         | Real pool contract, official SDK/testing primitives, discovery, proving path, Wallet API, and at least one anonymizer scenario rather than a superficial wrapper  |
| Mainnet product, 30%           | A hosted inspector/reference app that a real user can open and use on mainnet, plus three verified pool transactions; a local CLI alone is insufficient           |
| Innovation, 25%                | Reproducible one-command orchestration, scenario fixtures, failure injection, compatibility pinning, and evidence export that upstream does not currently package |
| Documentation/open source, 15% | Installable CLI/package, clear license, architecture, privacy boundaries, version matrix, examples, tests, and a five-minute quickstart                           |

### Recommended boundary

Do not attempt to reproduce CDR Kit's fifteen packages or ZK Freighter's web/extension/mobile breadth. A credible first boundary is:

1. one CLI;
2. one test-kit package;
3. one inspector/reference web application;
4. one Docker/managed-process stack;
5. one real anonymizer example;
6. one evidence format and verification command.

The component kit should support the laboratory's inspector and example app. It should not be pitched as another generic shield/unshield SDK unless it introduces a missing contract or testing interface.

### UI direction inferred from CDR Kit

The interface can adopt the same design principles without cloning the product:

- developer control-room rather than consumer wallet;
- a warm neutral base with a distinct STRK20-derived accent palette;
- hero topology showing pool, prover, discovery, and accounts becoming ready;
- a command-first quickstart;
- an Alice-to-Bob scenario timeline;
- visible public/private boundary labels;
- health, version, and compatibility states;
- explorer-verifiable mainnet evidence;
- technical typography and restrained motion tied to process state.

## Unknowns And Questions

- Whether the official prover container can be made practical on ordinary hackathon-builder hardware without a reduced/mock profile.
- Whether a compatible privacy wallet can connect to a local devnet directly, or whether the laboratory must expose a faithful mock Wallet API adapter for local testing.
- Which upstream versions and patched devnet build are stable enough to pin as the first supported compatibility set.
- Whether the STRK20 team considers a project-local redistributable prover image acceptable, or expects developers to obtain it from the existing registry.
- Whether another participant has an unadvertised IDEA-24 implementation not visible from current registry descriptions.
- The user's intended emphasis between local developer tooling, reusable components, index/discovery, and end-user wallet experience.

These questions affect final scope, but they do not invalidate the infrastructure direction.

## Not Included

- No hackathon fork or registration PR.
- No final project name.
- No copied third-party source or visual assets.
- No implementation architecture, technical specification, or build checklist.
- No claim that ZK Freighter won its referenced hackathon; that was not verified from an authoritative results source.
