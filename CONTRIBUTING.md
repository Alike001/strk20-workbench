# Contributing to STRK20 Workbench

Thank you for contributing to STRK20 Workbench! We welcome contributions that help builders learn, test, and integrate STRK20 privacy workflows cleanly and securely.

## Guiding Principles

1. **Lightweight and accessible:** No Docker, local blockchain, database, or local prover is required to build, test, or run the workbench.
2. **Honest privacy boundaries:** The visual sandbox is deterministic and simulated. Sandbox results must **never** be described or represented as genuine zero-knowledge proofs, real blockchain proofs, mainnet transactions, or confirmed production transactions.
3. **Strict security posture:** STRK20 Workbench does not handle, store, or solicit private keys or secret material. Never commit or submit secrets, private keys, viewing keys, seed phrases, real `.env` files, or API/provider keys.
4. **Focused contributions:** Keep pull requests small, scoped, and well-tested. Follow the documented standards and avoid unnecessary dependencies or unrelated refactors.

---

## Workspace Overview

The repository is structured as a pnpm workspace:

- [`apps/web`](./apps/web): The visual Next.js workbench application. It enables builders to explore privacy scenarios (registration, shielding, private transfer, withdrawal), inspect public versus private state, and graduate workflows to supported Starknet wallets.
- [`apps/example`](./apps/example): A minimal, independent TypeScript consumer verifying that external projects can import and consume `@strk20-workbench/lab-core` directly without UI dependencies.
- [`packages/lab-core`](./packages/lab-core): The framework-neutral TypeScript scenario core. It defines execution modes, deterministic state representations, and scenario interfaces.

---

## Development Quickstart

For full environment setup instructions, refer to the [Development Guide](docs/development.md).

### Prerequisites

- **Node.js 24** (`.nvmrc` provided)
- **pnpm 10** (`packageManager` pinned to `pnpm@10.33.1`)
- No Docker, database, local node, or prover is required.

### Quick Commands

```bash
# Install dependencies strictly matching the lockfile
pnpm install --frozen-lockfile

# Start the visual workbench in development mode
pnpm dev

# Run quality and validation checks
pnpm lint           # ESLint with zero warnings allowed
pnpm typecheck      # Build lab-core and verify TypeScript across workspace
pnpm test           # Run Vitest test suite
pnpm format:check   # Verify Prettier formatting
pnpm build          # Run production build across all packages
```

---

## Contribution Workflow

Follow this step-by-step workflow for all contributions:

1. **Fork** the repository on GitHub:
   - Fork `https://github.com/Alike001/strk20-workbench` to your GitHub account.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/strk20-workbench.git
   cd strk20-workbench
   ```
3. **Configure remotes** to keep in sync:
   ```bash
   git remote add upstream https://github.com/Alike001/strk20-workbench.git
   ```
4. **Synchronize upstream main** before starting:
   ```bash
   git fetch upstream
   git checkout main
   git pull origin main
   git merge upstream/main
   ```
5. **Create a task branch** from fresh `main`:
   ```bash
   git checkout -b <type>/<descriptive-name>
   # e.g., git checkout -b docs/contributor-development-guide
   ```
6. **Make focused changes:**
   - Keep changes tightly scoped to the assigned issue or feature.
   - Do not add or bump dependencies without prior discussion.
   - Do not commit secrets, real credentials, or keys.
7. **Verify locally:**
   ```bash
   pnpm format:check
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```
8. **Commit** using conventional commit style:
   ```bash
   git commit -m "docs: add contributor development guide"
   ```
9. **Push** the branch to your fork:
   ```bash
   git push origin <type>/<descriptive-name>
   ```
10. **Open a Pull Request:**
    - Target `Alike001/strk20-workbench` `main` branch.
    - Fill out the repository pull request template (`.github/pull_request_template.md`) completely.
    - Confirm all checks in the template pass.
11. **Maintainer review:**
    - Address any review feedback. Maintainers will review and merge approved PRs.

---

## Security & Sensitive Information

> [!CAUTION]
> **NEVER** commit or publish:
>
> - Private keys
> - Viewing keys
> - Seed phrases / recovery mnemonics
> - Real `.env` or `.env.local` files containing live credentials
> - Provider API keys (e.g., Infura, Alchemy, Blast, etc.)
> - Secret tokens or credentials of any kind

Any PR containing secret or key material will be closed immediately.

---

## Privacy Simulation Boundary

> [!IMPORTANT]
> The sandbox environment is deterministic and simulated for rapid experimentation and debugging.
>
> Sandbox results must **NEVER** be described as:
>
> - Genuine zero-knowledge proofs
> - Real blockchain proofs
> - Mainnet transactions
> - Confirmed production transactions

Genuine transactions only occur through user-approved wallet interactions via the supported Starknet Wallet API route.
