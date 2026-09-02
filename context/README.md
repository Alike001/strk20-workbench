# StarkWare Libs and STRK20 Context

This directory is a research snapshot of the public [`starkware-libs`](https://github.com/starkware-libs) GitHub organization, with deeper coverage of the STRK20 implementation.

The snapshot was prepared on **2026-09-02**. Repository activity, release versions, and deployment details can change; check the source links before making production decisions.

## Start here

1. [`reality-research.md`](./reality-research.md) — facts, inferences, and unresolved questions.
2. [`organization-map.md`](./organization-map.md) — how the organization is divided and which repositories matter to STRK20.
3. [`strk20-architecture.md`](./strk20-architecture.md) — implementation-level map of the privacy protocol.
4. [`security-and-trust.md`](./security-and-trust.md) — privacy boundaries, privileged roles, audit status, and operational caveats.
5. [`repository-catalog.md`](./repository-catalog.md) — categorized catalog of all 75 public repositories visible at the time of research.
6. [`sources.md`](./sources.md) — primary-source ledger and exact snapshot identifiers.
7. [`infrastructure-idea-research.md`](./infrastructure-idea-research.md) — reverse engineering of CDR Kit and ZK Freighter, current sprint overlap, comparable projects, and the strongest infrastructure wedge.
8. [`technical-feasibility-and-ecosystem-research.md`](./technical-feasibility-and-ecosystem-research.md) — devnet, discovery, prover, Wallet API, and anonymizer feasibility; cross-ecosystem precedents; and the evidence-backed developer-lab boundary.
9. [`project-scope.md`](./project-scope.md) — the proposed product boundary, core workflow, frontend principles, CDR Kit/ZK Freighter influence, delivery constraints, and definition of done.
10. [`product-requirements.md`](./product-requirements.md) — detailed user journeys, frontend behaviour, acceptance criteria, edge cases, product boundaries, and submission proof points.
11. [`build-notes.md`](./build-notes.md) — durable record of the product decisions and scope-shaping conversations.
12. [`technical-specification.md`](./technical-specification.md) — approved stack and architecture translated into domain types, adapter contracts, data flows, repository structure, security controls, testing, risks, and build milestones.
13. [`build-checklist.md`](./build-checklist.md) — the autonomous, sequenced build contract with registration, verification commands, three review pauses, teammate boundaries, mainnet evidence, and final GitHub sprint handoff.

## Short orientation

STRK20 is implemented primarily in [`starknet-privacy`](https://github.com/starkware-libs/starknet-privacy), not across the entire organization. That repository contains the Cairo privacy-pool contract, TypeScript SDK and client, Rust discovery service, proof-screening services, DeFi anonymizers, tests, demo, and formal-verification work.

The wider organization supplies adjacent layers:

```text
Cairo language and VM
        ↓
Starknet execution, APIs, and sequencer
        ↓
Transaction proving and STARK proving stack
        ↓
starknet-privacy pool + SDK + discovery
        ↓
anonymizers, privacy bridge, wallets, and DeFi integrations
```

The repositories are related, but they do not form one versioned monorepo. Treat each repository's own release and compatibility notes as authoritative.
