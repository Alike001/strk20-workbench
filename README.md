# STRK20 Workbench

Add private transfers to a Starknet app with reusable building blocks and a safe visual playground.

STRK20 Workbench is an open-source STRK20 component kit in active development. Builders can first try Shield, Send privately, and Withdraw with fake tokens in the lightweight browser Sandbox, understand what observers can and cannot see, and then use the same React building blocks in their own application. Lab Core is the framework-neutral engine underneath the interface.

**Live product:** [strk20-workbench.vercel.app](https://strk20-workbench.vercel.app)

## Why it exists

STRK20 supplies the privacy protocol. Application developers still need understandable, reusable product parts for coordinating wallets, the privacy pool, discovery, proving, and anonymizer behavior. STRK20 Workbench packages those moving parts into one lightweight workflow with two honestly separated modes:

- **Sandbox:** fast, deterministic, and explicitly simulated. No wallet, funds, Docker, or local prover required.
- **Real network:** genuine STRK20 operations through a supported privacy wallet, with explorer-verifiable evidence.

## Project status

The guided Sandbox, Lab Core engine, reusable React package, independent Vite consumer, passive wallet discovery, mainnet capability gate, reviewed real-action flow, public evidence verifier, and anonymous production deployment are implemented. A real action stays locked until a compatible STRK20 wallet, Starknet Mainnet, the reviewed pool configuration, and receipt verification are all available. Checked-in hashes qualify only after a final receipt and an event from the reviewed pool are independently verified. The next release gate is deliberate minimal-value mainnet execution. The accepted research, product requirements, architecture, and build contract live in [`context/`](./context/README.md).

The first release is planned as a lightweight pnpm workspace containing:

- a hosted Next.js component playground;
- a framework-neutral TypeScript scenario package;
- reusable React components for the private-transfer lifecycle;
- a small independent example consumer;
- a supported Wallet API path to real STRK20 mainnet activity.

No sandbox result will be represented as a genuine zero-knowledge proof or mainnet transaction.

### First-use wallet boundary

Wallet API `0.10.3` does not give a dapp a registration method. A new account must shield once from its privacy-enabled wallet's own screen, where the wallet keeps the viewing key and publishes registration with the shield transaction. Workbench detects `NOT_REGISTERED`, explains that one-time step, and lets the user recheck before returning to the reviewed action. It never asks for a viewing key and never retries a failed action automatically.

The live pool fee is read on every visit. For a shield, Ready X reserves that fee from the public deposit, so Workbench shows both the gross public debit and the expected net private increase and blocks deposits that would leave zero private STRK. For transfers and withdrawals, it shows the requested output plus the additional private balance required for the fee.

## Documentation & Contributing

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Contribution workflow, pull request guidelines, and safety boundaries.
- [`docs/development.md`](./docs/development.md) — Node.js 24 and pnpm 10 environment setup, workspace structure, and development commands.
- [`docs/compatibility.md`](./docs/compatibility.md) — Runtime and wallet compatibility matrix.

## Hackathon metadata

Sprint metadata is tracked in [`strk20.json`](./strk20.json). Transaction hashes, deployed contracts, the public demo, and the demo video will only be added when they exist and have been verified.

Run `pnpm validate:submission` to check the current repository metadata. Maintainers use `pnpm validate:submission:final` only when the three verified hashes and demo video are ready.

## License

MIT. See [`LICENSE`](./LICENSE).
