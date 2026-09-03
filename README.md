# STRK20 Workbench

Build and debug private Starknet applications without running heavy infrastructure on your laptop.

STRK20 Workbench is an open-source developer product for learning, testing, and integrating STRK20 workflows. Its visual sandbox will let builders run registration, shielding, private transfer, and withdrawal scenarios; inspect what is public and private; diagnose failures; and graduate the same workflow to a supported wallet on Starknet mainnet.

## Why it exists

STRK20 supplies the privacy protocol. Application developers still need a clear way to coordinate wallets, the privacy pool, discovery, proving, and anonymizer behavior. STRK20 Workbench packages those moving parts into one lightweight workflow with two honestly separated modes:

- **Sandbox:** fast, deterministic, and explicitly simulated. No wallet, funds, Docker, or local prover required.
- **Real network:** genuine STRK20 operations through a supported privacy wallet, with explorer-verifiable evidence.

## Project status

The product is at the implementation-start stage. The accepted research, product requirements, architecture, and build contract live in [`context/`](./context/README.md).

The first release is planned as a lightweight pnpm workspace containing:

- a hosted Next.js visual workbench;
- a framework-neutral TypeScript scenario package;
- a small independent example consumer;
- a supported Wallet API path to real STRK20 mainnet activity.

No sandbox result will be represented as a genuine zero-knowledge proof or mainnet transaction.

## Documentation & Contributing

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Contribution workflow, pull request guidelines, and safety boundaries.
- [`docs/development.md`](./docs/development.md) — Node.js 24 and pnpm 10 environment setup, workspace structure, and development commands.
- [`docs/compatibility.md`](./docs/compatibility.md) — Runtime and wallet compatibility matrix.

## Hackathon metadata

Sprint metadata is tracked in [`strk20.json`](./strk20.json). Transaction hashes, deployed contracts, the public demo, and the demo video will only be added when they exist and have been verified.

## License

MIT. See [`LICENSE`](./LICENSE).
