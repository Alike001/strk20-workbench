# Source Ledger

Research performed: **2026-09-02**.

## Organization

- [`starkware-libs` GitHub organization](https://github.com/starkware-libs)
- [`GET /orgs/starkware-libs`](https://api.github.com/orgs/starkware-libs)
- [`GET /orgs/starkware-libs/repos`](https://api.github.com/orgs/starkware-libs/repos?per_page=100&type=public)

Organization counts and repository metadata in this folder were produced from GitHub API responses on the research date. They are a snapshot, not a live query.

## STRK20 / Starknet privacy

- [`starknet-privacy` repository](https://github.com/starkware-libs/starknet-privacy)
- Inspected `main` commit: [`bc75e4bac71ad0ce10c6e63effc33b5b25131a4f`](https://github.com/starkware-libs/starknet-privacy/tree/bc75e4bac71ad0ce10c6e63effc33b5b25131a4f)
- [Root architecture and compatibility README](https://github.com/starkware-libs/starknet-privacy/blob/bc75e4bac71ad0ce10c6e63effc33b5b25131a4f/README.md)
- [Privacy contract README](https://github.com/starkware-libs/starknet-privacy/blob/bc75e4bac71ad0ce10c6e63effc33b5b25131a4f/packages/privacy/README.md)
- [Privacy contract implementation](https://github.com/starkware-libs/starknet-privacy/blob/bc75e4bac71ad0ce10c6e63effc33b5b25131a4f/packages/privacy/src/privacy.cairo)
- [Client action definitions](https://github.com/starkware-libs/starknet-privacy/blob/bc75e4bac71ad0ce10c6e63effc33b5b25131a4f/packages/privacy/src/actions.cairo)
- [SDK README](https://github.com/starkware-libs/starknet-privacy/blob/bc75e4bac71ad0ce10c6e63effc33b5b25131a4f/sdk/README.md)
- [SDK package manifest](https://github.com/starkware-libs/starknet-privacy/blob/bc75e4bac71ad0ce10c6e63effc33b5b25131a4f/sdk/package.json)
- [Discovery service README](https://github.com/starkware-libs/starknet-privacy/blob/bc75e4bac71ad0ce10c6e63effc33b5b25131a4f/crates/discovery-service/README.md)
- [Proof interceptor README](https://github.com/starkware-libs/starknet-privacy/blob/bc75e4bac71ad0ce10c6e63effc33b5b25131a4f/proof-interceptor/README.md)
- [Demo README](https://github.com/starkware-libs/starknet-privacy/blob/bc75e4bac71ad0ce10c6e63effc33b5b25131a4f/demo/README.md)
- [Mainnet demo configuration template](https://github.com/starkware-libs/starknet-privacy/blob/bc75e4bac71ad0ce10c6e63effc33b5b25131a4f/demo/.env.mainnet.example)
- [Audit index](https://github.com/starkware-libs/starknet-privacy/tree/bc75e4bac71ad0ce10c6e63effc33b5b25131a4f/docs/audit)
- [OpenZeppelin Privacy V1 audit PDF](https://github.com/starkware-libs/starknet-privacy/blob/bc75e4bac71ad0ce10c6e63effc33b5b25131a4f/docs/audit/Privacy%20V1.pdf)
- [Latest observed privacy release: `PRIVACY-0.14.3-RC.6`](https://github.com/starkware-libs/starknet-privacy/releases/tag/PRIVACY-0.14.3-RC.6)
- [STRK20 public site](https://strk20.starknet.io/)

## Privacy bridge

- [`privacy-bridge` repository](https://github.com/starkware-libs/privacy-bridge)
- Inspected `main` commit: [`3e95694b997069c47eff52cd576af0bb3e03612d`](https://github.com/starkware-libs/privacy-bridge/tree/3e95694b997069c47eff52cd576af0bb3e03612d)
- [Bridge README](https://github.com/starkware-libs/privacy-bridge/blob/3e95694b997069c47eff52cd576af0bb3e03612d/README.md)
- [Bridge threat model](https://github.com/starkware-libs/privacy-bridge/blob/3e95694b997069c47eff52cd576af0bb3e03612d/docs/threat-model.md)

The bridge links above are pinned to the inspected commit so later changes on `main` do not silently change this research snapshot.

## Wider StarkWare repositories

- [Cairo](https://github.com/starkware-libs/cairo)
- [Cairo VM](https://github.com/starkware-libs/cairo-vm)
- [Sequencer](https://github.com/starkware-libs/sequencer)
- [Starknet specifications](https://github.com/starkware-libs/starknet-specs)
- [Proving monorepo](https://github.com/starkware-libs/proving)
- [Stwo](https://github.com/starkware-libs/stwo)
- [Stwo Cairo](https://github.com/starkware-libs/stwo-cairo)
- [Formal proofs](https://github.com/starkware-libs/formal-proofs)
- [StarkWare Starknet utilities](https://github.com/starkware-libs/starkware-starknet-utils)
- [Starknet payments](https://github.com/starkware-libs/starknet-payments)
- [Starknet staking](https://github.com/starkware-libs/starknet-staking)

## Reproduce the public metadata snapshot

With GitHub CLI authentication:

```sh
gh api orgs/starkware-libs
gh api --paginate 'orgs/starkware-libs/repos?per_page=100&type=public'
gh api 'repos/starkware-libs/starknet-privacy/releases?per_page=20'
gh api 'repos/starkware-libs/starknet-privacy/tags?per_page=20'
```

For source inspection, clone the exact privacy commit or release rather than a moving branch:

```sh
git clone https://github.com/starkware-libs/starknet-privacy.git
cd starknet-privacy
git checkout bc75e4bac71ad0ce10c6e63effc33b5b25131a4f
```
