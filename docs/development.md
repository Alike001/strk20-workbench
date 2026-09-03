# Development Guide

This guide describes how to configure your local development environment, run the workspace packages, and verify code quality for STRK20 Workbench.

## Environment Requirements

STRK20 Workbench requires:

- **Node.js**: `24.x` (enforced in `package.json` engines: `>=24 <25`)
- **pnpm**: `10.x` (enforced in `package.json` engines: `>=10 <11`, pinned to `10.33.1`)

No other system dependencies are required. You do **not** need:

- Docker or container runtimes
- PostgreSQL, Redis, or any local database
- A local Starknet devnet or node (e.g. Katana, Madara, Starknet-devnet)
- A local zero-knowledge prover or circuit toolchain

---

## Local Setup

### 1. Install Node.js 24

We recommend using [nvm](https://github.com/nvm-sh/nvm) (or [fnm](https://github.com/Schniz/fnm)):

```bash
# Using nvm with the repository .nvmrc file
nvm install 24
nvm use 24

# Verify Node.js version
node -v # Should display v24.x.x
```

### 2. Install pnpm 10

Enable `pnpm` via `corepack` (bundled with Node.js 24) or install the pinned version globally. Inside this repository, Corepack reads `packageManager` from the root `package.json` and selects pnpm 10.33.1 automatically:

```bash
# Option A: Using corepack (recommended)
corepack enable

# Option B: Global npm install
npm install -g pnpm@10.33.1

# Verify pnpm version
pnpm -v # Should display 10.33.1 inside this repository
```

### 3. Install Workspace Dependencies

Install dependencies from the frozen lockfile:

```bash
pnpm install --frozen-lockfile
```

Real-network development may also need public runtime configuration. Copy the committed template to the Next.js application directory, then replace placeholders locally:

```bash
cp .env.example apps/web/.env.local
```

The sandbox does not require an RPC key. Never commit `.env.local`.

---

## Workspace Architecture

STRK20 Workbench is organized as a pnpm workspace with three core directories:

| Folder                                      | Package Name                 | Description                                                                                                                                                                                                                                               |
| ------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`apps/web`](../apps/web)                   | `@strk20-workbench/web`      | Hosted Next.js visual workbench. Allows developers to test privacy scenarios (registration, shielding, private transfer, withdrawal), inspect public and private data views, diagnose simulated failure modes, and connect to supported Starknet wallets. |
| [`apps/example`](../apps/example)           | `@strk20-workbench/example`  | Minimal standalone TypeScript application demonstrating how external consumers can use `@strk20-workbench/lab-core` independently of the web frontend.                                                                                                    |
| [`packages/lab-core`](../packages/lab-core) | `@strk20-workbench/lab-core` | Framework-neutral TypeScript library holding the scenario core, deterministic simulation primitives, and state definitions. Built before dependent packages typecheck.                                                                                    |

---

## Development & Verification Commands

All standard development commands run from the root of the repository:

### Start Development Server

```bash
pnpm dev
```

Starts the visual workbench web app at `http://localhost:3000` via Next.js (`apps/web`).

### Formatting

```bash
# Check code formatting with Prettier (checked in CI)
pnpm format:check

# Automatically format all files
pnpm format
```

### Linting

```bash
# Run ESLint across all packages (enforces zero warnings)
pnpm lint
```

### Typechecking

```bash
# Builds @strk20-workbench/lab-core first, then runs tsc across workspace packages
pnpm typecheck
```

### Testing

```bash
# Run Vitest test suite across workspace packages
pnpm test
```

### Building

```bash
# Build lab-core, example app, and production Next.js web application
pnpm build
```

---

## Development Boundaries & Safety

### 1. Honest Privacy Simulation

The Workbench includes both an in-browser sandbox and an eventual mainnet wallet route.

- **Sandbox mode:** Always simulated. Used for learning and visualizing the lifecycle of privacy transactions.
- **Rules on terminology:** Never document, label, or market sandbox operations as:
  - Genuine proofs
  - Real blockchain proofs
  - Mainnet transactions
  - Confirmed production transactions

### 2. Secret Hygiene

- Do **not** commit `.env` or `.env.local` files containing real RPC API keys or private keys.
- Copy `.env.example` to `apps/web/.env.local` when configuring the Next.js application.
- Never store or accept private keys, viewing keys, or seed phrases.
