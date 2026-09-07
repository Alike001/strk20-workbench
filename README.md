# STRK20 Workbench

Add private transfers to a Starknet app with reusable building blocks and a safe visual playground.

STRK20 Workbench is an open-source STRK20 component kit. Builders can first try Shield, Send privately, and Withdraw with fake tokens in the lightweight browser Sandbox, understand what observers can and cannot see, and then use the same React building blocks in their own application. Lab Core is the framework-neutral engine underneath the interface.

**Live product:** [strk20-workbench.vercel.app](https://strk20-workbench.vercel.app)

## Why it exists

STRK20 supplies the privacy protocol. Application developers still need understandable, reusable product parts for coordinating wallets, the privacy pool, discovery, proving, and anonymizer behavior. STRK20 Workbench packages those moving parts into one lightweight workflow with two honestly separated modes:

- **Sandbox:** fast, deterministic, and explicitly simulated. No wallet, funds, Docker, or local prover required.
- **Real network:** genuine STRK20 operations through a supported privacy wallet, with explorer-verifiable evidence.

## Project status

The guided Sandbox, Lab Core engine, reusable React package, independent Vite consumer, passive wallet discovery, mainnet capability gate, reviewed real-action flow, public evidence verifier, and anonymous production deployment are implemented. Ready X `5.33.9` has completed the real Shield → Private transfer → Withdraw lifecycle on Starknet Mainnet. A real action stays locked until a compatible STRK20 wallet, Starknet Mainnet, the reviewed pool configuration, and receipt verification are all available. Checked-in hashes qualify only after a successful receipt and an event from the reviewed pool are independently verified. The accepted research, product requirements, architecture, and build contract live in [`context/`](./context/README.md).

The first release is a lightweight pnpm workspace containing:

- a hosted Next.js component playground;
- a framework-neutral TypeScript scenario package;
- reusable React components for the private-transfer lifecycle;
- a small independent example consumer;
- a supported Wallet API path to real STRK20 mainnet activity.

No sandbox result will be represented as a genuine zero-knowledge proof or mainnet transaction.

## Verified mainnet evidence

All three records are successful Starknet Mainnet transactions and emit an event from the official STRK20 pool at `0x040337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a`.

| Action           | Transaction                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| Shield           | [`0x039372…da6c0`](https://voyager.online/tx/0x039372b04a863fd5cd016f2715034dc6286b7c61f63abe96199ddf65b35da6c0) |
| Private transfer | [`0x04fbfb…93b20`](https://voyager.online/tx/0x04fbfb9204259a2c26aa4c5550f6bfd3acd67c4821ab23a7c50c537338093b20) |
| Withdraw         | [`0x0029a1…8a597`](https://voyager.online/tx/0x0029a150756c3184bb1818cc0b471277dd6cd19a860d5d4069cfcaea4418a597) |

The public [Evidence page](https://strk20-workbench.vercel.app/evidence) verifies receipt success and official-pool interaction independently. The private-transfer receipt proves that the pool ran successfully; its private recipient and amount are intentionally not inferred from public chain data.

### First-use wallet boundary

Wallet API `0.10.3` does not give a dapp a registration method. A new account must shield once from its privacy-enabled wallet's own screen, where the wallet keeps the viewing key and publishes registration with the shield transaction. Workbench detects `NOT_REGISTERED`, explains that one-time step, and lets the user recheck before returning to the reviewed action. It never asks for a viewing key and never retries a failed action automatically.

The live pool fee is read on every visit. For a shield, Ready X reserves that fee from the public deposit, so Workbench shows both the gross public debit and the expected net private increase and blocks deposits that would leave zero private STRK. For transfers and withdrawals, it shows the requested output plus the additional private balance required for the fee.

### Privacy boundary

Deposits reveal the depositing address, token, amount, pool interaction, and timing. Withdrawals reveal the public destination, token, amount, pool interaction, and timing. Inside the pool, a private transfer can hide its sender-to-recipient link, recipient, amount, token, and spent notes. Workbench never requests a private key, seed phrase, viewing key, note contents, or proof payload.

## Run locally

```bash
git clone https://github.com/Alike001/strk20-workbench.git
cd strk20-workbench
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`. Node.js 24 and pnpm 10 are required. The Sandbox needs no wallet, account, RPC credential, Docker service, or real funds.

## Documentation & Contributing

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Contribution workflow, pull request guidelines, and safety boundaries.
- [`docs/development.md`](./docs/development.md) — Node.js 24 and pnpm 10 environment setup, workspace structure, and development commands.
- [`docs/compatibility.md`](./docs/compatibility.md) — Runtime and wallet compatibility matrix.

## Hackathon metadata

Sprint metadata is tracked in [`strk20.json`](./strk20.json). It currently contains three verified mainnet transactions and the public demo. This project deploys no custom contract; its real path integrates through Ready X with the official STRK20 pool. The demo-video URL will be added only after the final video is uploaded and publicly accessible.

Run `pnpm validate:submission` to check the current repository metadata. Maintainers use `pnpm validate:submission:final` only when the three verified hashes and demo video are ready.

## Team

- [`Alike001`](https://github.com/Alike001)
- [`Webghost01-NG`](https://github.com/Webghost01-NG)

## License

MIT. See [`LICENSE`](./LICENSE).
