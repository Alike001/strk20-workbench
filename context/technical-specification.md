# STRK20 Developer Workbench Technical Specification

Status: technical specification candidate  
Date: 2026-09-02  
Product name: STRK20 Workbench  
Repository name: `strk20-workbench`  
Package scope: pending GitHub owner confirmation

## 1. Overview

The product is a lightweight, hosted and locally runnable developer workbench for STRK20 applications. Its central design constraint is that the same framework-neutral scenario definition must run against two explicitly different adapters:

- a deterministic browser sandbox that simulates STRK20 behaviour without claiming to produce valid proofs;
- a real Wallet API adapter that delegates keys, discovery, proving, and transaction submission to a supported privacy wallet.

The frontend consumes scenario events from a reusable TypeScript package. It renders those events as balances, a guided lifecycle, an animated timeline, a privacy X-ray, technical evidence, errors, and mainnet proof points.

The required path runs directly with Node and a browser. It does not require Docker, a local Starknet node, a local discovery service, or a production prover.

### Architecture in one sentence

> A framework-neutral STRK20 scenario controller sends actions through a capability-based adapter, emits normalized events into a browser store, and lets a Next.js workbench render identical user journeys for clearly labelled sandbox and real-network modes.

## 2. Architectural Principles

### 2.1 One core, thin surfaces

`lab-core` owns scenario rules, types, state transitions, privacy facts, normalized errors, and adapter contracts. It must not import React, Next.js, Zustand, DOM APIs, or wallet-discovery UI.

This is the direct CDR Kit lesson: reusable protocol-facing behaviour lives below the product surfaces.

### 2.2 Capability detection instead of assumptions

The workbench must not assume that a discovered wallet supports STRK20. A real adapter reports its capabilities before actions are enabled.

### 2.3 Simulation and reality never share an ambiguous label

Sandbox events contain `proofKind: "simulated"`. Genuine evidence can contain `proofKind: "real"` only when produced through the real adapter and associated with a confirmed supported-network transaction.

### 2.4 Sensitive wallet operations stay in the browser wallet

The hosted application does not request, receive, store, proxy, or log seed phrases, private keys, or viewing keys. Wallet STRK20 methods are called from the browser.

### 2.5 Minimal hosted backend

Next.js Route Handlers are limited to safe public-data functions such as RPC receipt verification and serving project evidence. They do not become a custody, wallet, discovery, or proving service.

### 2.6 Deterministic sandbox

The sandbox behaves like a small state machine, not a video. Supported input changes produce corresponding balances, events, privacy facts, and errors. A known seed makes tests reproducible.

## 3. Stack

### 3.1 Runtime and workspace

| Concern | Choice | Reason |
|---|---|---|
| Runtime | Node.js 24.x | Matches the upstream STRK20 development baseline while remaining suitable for Next.js 16 |
| Package manager | pnpm 10.x workspaces | Fast installs, strict dependency boundaries, no need for Turborepo at this scale |
| Language | TypeScript 5.9.x, strict mode | Shared types across core, web, and example |
| Module format | ESM | Matches modern Next.js, Starknet.js, and upstream package direction |

All committed dependencies use an exact lockfile. Critical Starknet-facing dependencies are exact-pinned rather than ranged.

### 3.2 Frontend

| Dependency | Starting pin/policy | Purpose |
|---|---|---|
| Next.js | 16.2.9 candidate; verify against starter before final lock | Hosted workbench, documentation routes, safe server routes |
| React / React DOM | compatible exact React 19 release selected by the lockfile | Interactive product surface |
| Tailwind CSS | exact current release selected at scaffold time | Design tokens and responsive layout |
| Zustand | 5.0.12 candidate | Lightweight workbench state and versioned sandbox persistence |
| Zod | exact current stable release | Runtime validation of persisted data, configuration, and server inputs |

The STRK20 starter currently uses Next.js 16.0.8, React 19.2.1, and Webpack scripts. The implementation begins with a compatibility spike: if Starknet wallet packages do not bundle correctly with the current Next.js/Turbopack combination, the project will use `next dev --webpack` and `next build --webpack`, matching the starter kit rather than spending time on bundler debugging.

### 3.3 Starknet and STRK20

| Dependency/API | Candidate pin | Purpose |
|---|---|---|
| `starknet` | `10.5.0` | Upstream-inspected STRK20 wallet types and transaction/RPC utilities |
| `@starknet-io/get-starknet-discovery` | `6.0.2` | Browser wallet discovery |
| `@starknet-io/get-starknet-wallet-standard` | `6.0.2` | Standard wallet feature access |
| `@starknet-io/types-js` | `0.10.3` | Wallet/API type alignment |
| STRK20 Wallet API | capability detected at runtime | Balances, prepare/invoke, and proof execution |
| STRK20 pool | mainnet address from official sprint metadata | Evidence and transaction target validation |

The final compatibility set is written to a version manifest only after a real supported wallet smoke test passes. The application must fail closed with an actionable compatibility message if a wallet exposes only ordinary Starknet methods and not STRK20 actions.

### 3.4 Testing and quality

| Dependency | Candidate pin/policy | Purpose |
|---|---|---|
| Vitest | 4.1.6 candidate | Core unit, contract, store, and component tests |
| Testing Library | exact current stable releases | User-visible component behaviour |
| Playwright | exact current stable release | Two critical hosted journeys in Chromium |
| ESLint | exact current release compatible with Next.js | Static checks |
| Prettier | exact current stable release | Consistent formatting |

Vitest uses `test.projects`, not the deprecated workspace configuration. Node tests cover `lab-core`; browser or jsdom tests cover persistence and UI behaviour.

### 3.5 No first-release dependencies on

- Docker;
- PostgreSQL or another database;
- authentication;
- a hosted user account service;
- a local Starknet devnet;
- a locally running discovery service;
- a locally running transaction prover;
- Kubernetes or a queue system;
- a runtime AI model.

## 4. Repository Structure

```text
project-root/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── (marketing)/
│   │   │   │   └── page.tsx                  # Thirty-second introduction
│   │   │   ├── workbench/
│   │   │   │   └── page.tsx                  # Sandbox and real-mode workspace
│   │   │   ├── integrate/
│   │   │   │   └── page.tsx                  # Adoption guide and examples
│   │   │   ├── evidence/
│   │   │   │   └── page.tsx                  # Verified public proof points
│   │   │   ├── docs/
│   │   │   │   └── [[...slug]]/page.tsx      # Product documentation
│   │   │   ├── api/
│   │   │   │   ├── rpc/route.ts              # Allowlisted public RPC proxy
│   │   │   │   ├── evidence/route.ts         # Validated project evidence
│   │   │   │   └── health/route.ts           # Hosted app readiness
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── introduction/                 # Hero, product map, CTAs
│   │   │   ├── shell/                        # Navigation, mode and status bars
│   │   │   ├── scenario/                     # Steps, controls, actors, balances
│   │   │   ├── timeline/                     # Animated public/private flow
│   │   │   ├── privacy-xray/                  # Observer-visible facts
│   │   │   ├── details/                      # Advanced evidence drawer
│   │   │   ├── wallet/                       # Discovery, connection, preflight
│   │   │   ├── errors/                       # Plain and raw error displays
│   │   │   ├── evidence/                     # Mainnet evidence cards/table
│   │   │   └── ui/                           # Project-owned UI primitives
│   │   ├── content/
│   │   │   └── docs/                         # Markdown documentation
│   │   ├── lib/
│   │   │   ├── wallet/                       # Browser wallet integration
│   │   │   ├── rpc/                          # Public verification client
│   │   │   ├── evidence/                     # Evidence parsing/verification
│   │   │   └── config/                       # Public runtime configuration
│   │   ├── stores/
│   │   │   ├── workbench-store.ts            # Current normalized UI/session state
│   │   │   ├── persisted-sandbox.ts          # Versioned persistence adapter
│   │   │   └── migrations.ts                 # Saved-state migrations
│   │   ├── styles/
│   │   │   └── tokens.css                    # Original design tokens
│   │   └── tests/
│   │       ├── components/
│   │       ├── integration/
│   │       └── browser/
│   └── example/
│       ├── src/                              # Separate consumer of lab-core
│       ├── tests/
│       ├── package.json
│       └── README.md
├── packages/
│   └── lab-core/
│       ├── src/
│       │   ├── actions.ts                    # Action schemas and constructors
│       │   ├── actors.ts                     # Actor and account-facing types
│       │   ├── amounts.ts                    # Base-unit-safe amount operations
│       │   ├── capabilities.ts               # Adapter capability model
│       │   ├── controller.ts                 # Scenario orchestration
│       │   ├── errors.ts                     # Normalized error taxonomy
│       │   ├── events.ts                     # Event schemas
│       │   ├── evidence.ts                   # Evidence records and validators
│       │   ├── privacy.ts                    # Public/private fact catalogue
│       │   ├── scenario.ts                   # State machine and invariants
│       │   ├── persistence.ts                # Serializable safe-state schema
│       │   ├── adapters/
│       │   │   ├── adapter.ts                # Adapter contract
│       │   │   ├── sandbox.ts                # Deterministic lightweight engine
│       │   │   └── wallet-api.ts             # Genuine wallet integration contract
│       │   └── index.ts                      # Intentional public exports
│       ├── tests/
│       │   ├── canonical-flow.test.ts
│       │   ├── invalid-order.test.ts
│       │   ├── failures.test.ts
│       │   ├── privacy-facts.test.ts
│       │   ├── evidence.test.ts
│       │   └── adapter-contract.test.ts
│       └── package.json
├── contracts/
│   └── anonymizer-example/                   # Added only after core/mainnet gate
├── scripts/
│   ├── verify-mainnet-evidence.ts            # Receipt/pool evidence check
│   └── validate-strk20-json.ts               # Submission metadata validation
├── docs/
│   ├── architecture.md
│   ├── privacy-boundaries.md
│   ├── compatibility.md
│   ├── troubleshooting.md
│   └── contributing.md
├── public/
│   └── mainnet-evidence.json                 # Curated public evidence projection
├── .github/
│   ├── workflows/ci.yml
│   └── pull_request_template.md
├── .env.example
├── .gitignore
├── .nvmrc
├── AGENTS.md
├── LICENSE
├── README.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── strk20.json
├── tsconfig.base.json
└── vitest.config.ts
```

Folders that are not needed for the first passing slice are not scaffolded early. In particular, `contracts/anonymizer-example` is created only after the real private-transfer gate passes.

## 5. Core Domain Model

### 5.1 Execution mode

```ts
type ExecutionMode = "sandbox" | "real";
type ProofKind = "simulated" | "real" | "unknown";
```

`real` is not synonymous with mainnet. The network is stored separately. Qualifying submission evidence requires both `mode === "real"` and `network === "SN_MAIN"`, a successful receipt, and verified pool interaction.

### 5.2 Supported actions

```ts
type LabAction =
  | { type: "register"; actorId: ActorId }
  | { type: "shield"; actorId: ActorId; token: TokenRef; amount: bigint }
  | { type: "private-transfer"; from: ActorId; to: ActorId; token: TokenRef; amount: bigint }
  | { type: "withdraw"; actorId: ActorId; recipient: string; token: TokenRef; amount: bigint };
```

The first anonymizer extension adds a fifth action only after the initial action union and adapter contract are stable.

Amounts are represented as integer base units. JavaScript floating-point values are never used for token arithmetic.

### 5.3 Scenario step state

```ts
type StepStatus =
  | "idle"
  | "validating"
  | "awaiting-user"
  | "preparing-proof"
  | "submitting"
  | "confirming"
  | "succeeded"
  | "cancelled"
  | "failed"
  | "uncertain";
```

Sandbox actions normally move through `validating → succeeded`. They may emit controlled intermediate states for education, but cannot claim `preparing-proof` with `proofKind: "real"`.

Real wallet actions may move through all states. `uncertain` is used when a submission may exist but final status cannot yet be established; it prevents accidental resubmission.

### 5.4 Scenario state

```ts
interface ScenarioState {
  schemaVersion: number;
  runId: string;
  seed: string;
  mode: ExecutionMode;
  network: "SANDBOX" | "SN_MAIN" | "SN_SEPOLIA" | "UNKNOWN";
  proofKind: ProofKind;
  actors: Record<ActorId, ActorState>;
  tokens: Record<TokenId, TokenState>;
  steps: ScenarioStep[];
  timeline: LabEvent[];
  activeStepId?: string;
  lastError?: LabError;
  evidence: EvidenceRecord[];
}
```

### 5.5 Canonical sandbox fixture

The default scenario uses a clearly fictional token and deterministic state:

| Stage | Alice public | Alice private | Bob public | Bob private |
|---|---:|---:|---:|---:|
| Initial | 100 | 0 | 0 | 0 |
| After register | 100 | 0 | 0 | 0 |
| Alice shields 50 | 50 | 50 | 0 | 0 |
| Alice transfers 20 privately | 50 | 30 | 0 | 20 |
| Bob withdraws 10 | 50 | 30 | 10 | 10 |

Network fees are excluded from sandbox balances and the interface states that explicitly.

## 6. Adapter Contract

### 6.1 Required interface

```ts
interface LabAdapter {
  readonly id: string;
  readonly mode: ExecutionMode;

  getCapabilities(signal?: AbortSignal): Promise<CapabilityReport>;
  getInitialState(signal?: AbortSignal): Promise<AdapterSnapshot>;
  execute(
    action: LabAction,
    options: {
      signal?: AbortSignal;
      onEvent: (event: AdapterEvent) => void;
      idempotencyKey: string;
    },
  ): Promise<ActionResult>;
  getTransactionStatus(
    transactionHash: string,
    signal?: AbortSignal,
  ): Promise<TransactionStatus>;
}
```

The event callback supports wallet prompts, long proof preparation, submission, and confirmation without forcing the core package to depend on a UI framework.

### 6.2 Capability report

Capabilities are reported individually:

- wallet discovered;
- wallet connected;
- chain ID known;
- required STRK20 wallet methods present;
- balances readable;
- register supported;
- shield supported;
- private transfer supported;
- withdraw supported;
- external invoke supported;
- pool configuration matches;
- RPC verification available.

Each capability contains `status`, a plain explanation, optional technical detail, and an optional recovery action. The UI never reduces all readiness to one misleading green light.

### 6.3 Sandbox adapter

The sandbox adapter:

- runs entirely in memory;
- uses a deterministic seed;
- enforces registration and balance prerequisites;
- creates simulated note/nullifier-shaped identifiers for teaching only;
- changes balances according to value-conservation rules;
- supports deterministic failure injection;
- emits the same normalized event categories as the real adapter;
- never imports Starknet.js;
- never produces qualifying evidence.

### 6.4 Wallet API adapter

The wallet adapter:

- receives a connected wallet-standard object from the web layer;
- feature-detects STRK20 methods;
- maps core actions to the published STRK20 wallet actions;
- uses `strk20Balances` for supported private balance reads;
- uses prepare/simulation only for review and never treats an empty simulated proof as submit-ready;
- invokes real actions through the supported wallet method;
- relays progress into normalized adapter events;
- returns the transaction hash without reading wallet secrets;
- delegates receipt verification to a public RPC client;
- converts wallet rejection, `NOT_REGISTERED`, service busy, timeout, revert, and unknown errors into stable `LabError` categories.

## 7. Scenario Controller

The controller is the only component allowed to mutate scenario domain state.

Responsibilities:

1. validate an action schema;
2. check action ordering and prerequisites;
3. create an idempotency key;
4. set the active step state;
5. call the selected adapter;
6. reduce adapter events into scenario events;
7. validate the result against invariants;
8. record evidence only if its requirements are met;
9. return an immutable updated scenario snapshot.

### Required invariants

- A private recipient must be registered before private transfer.
- Amounts must be positive integers in base units.
- A spend cannot exceed the relevant public or private balance where known.
- Successful sandbox value is conserved across actors and pool representation.
- An already succeeded action is not repeated with the same idempotency key.
- A cancelled action creates no success evidence.
- An uncertain real action cannot be silently retried as a new transaction.
- Simulated events cannot become qualifying mainnet evidence.

## 8. Event Model and UI Projection

Core emits domain events; the frontend derives presentation from them.

Representative event categories:

- `scenario.created`;
- `capability.checked`;
- `action.validation-started`;
- `action.awaiting-user`;
- `proof.preparing`;
- `transaction.submitted`;
- `transaction.confirming`;
- `balance.changed`;
- `privacy.fact-recorded`;
- `action.succeeded`;
- `action.cancelled`;
- `action.failed`;
- `transaction.uncertain`;
- `evidence.verified`.

Every event includes a unique ID, run ID, step ID where applicable, timestamp, mode, proof kind, and safe structured payload. Secret values are not valid event fields.

The transaction timeline, account cards, status strip, and privacy X-ray are projections of the same event/state source. They must not maintain competing copies of balances or step results.

## 9. Privacy Fact Model

Each action maps to a reviewed set of privacy facts:

```ts
interface PrivacyFact {
  field: string;
  visibility: "public" | "private" | "conditional";
  explanation: string;
  technicalBasis: string;
}
```

Minimum catalog:

- registration;
- deposit/shield;
- private transfer;
- withdrawal;
- future anonymizer invoke.

Facts are versioned with the supported STRK20 compatibility set. The product never infers a stronger privacy statement merely because an action succeeded.

## 10. Error Taxonomy

```ts
type LabErrorCode =
  | "INVALID_ACTION"
  | "NOT_REGISTERED"
  | "INSUFFICIENT_PUBLIC_BALANCE"
  | "INSUFFICIENT_PRIVATE_BALANCE"
  | "WALLET_NOT_FOUND"
  | "WALLET_UNSUPPORTED"
  | "WALLET_REJECTED"
  | "WRONG_NETWORK"
  | "DISCOVERY_STALE"
  | "PROVER_BUSY"
  | "PROVER_UNAVAILABLE"
  | "PROOF_FAILED"
  | "SUBMISSION_FAILED"
  | "TRANSACTION_REVERTED"
  | "TRANSACTION_UNCERTAIN"
  | "RPC_UNAVAILABLE"
  | "SAVED_STATE_INCOMPATIBLE"
  | "UNKNOWN";
```

Each normalized error contains:

- stable code;
- user-safe title;
- plain explanation;
- one recommended next action;
- retryability;
- raw cause available only in advanced details;
- phase and associated step;
- mode and network.

Raw error serialization removes keys, authorization headers, full RPC URLs containing credentials, and other configured secrets.

## 11. Frontend Architecture

### 11.1 Server and Client Components

Server Components render static introduction, documentation, and curated public evidence wherever practical.

Client Components are limited to surfaces requiring:

- Zustand state;
- browser wallet discovery;
- localStorage;
- user actions;
- animation;
- live transaction progress.

This follows current Next.js guidance that browser-only APIs and interactive state belong in Client Components.

### 11.2 Workbench store

The Zustand store contains:

- current normalized `ScenarioState`;
- selected mode;
- hydration status;
- selected step/tab;
- advanced-details preference;
- non-sensitive wallet connection metadata for the current session;
- controller actions that delegate domain changes to `lab-core`.

The store does not implement balance rules or transaction logic.

### 11.3 Persistence

Zustand persistence uses:

- a named storage key with project and schema version;
- `partialize` so only sandbox scenario state and safe UI preferences persist;
- an explicit numeric version;
- migration functions for supported old shapes;
- `skipHydration` and client-controlled hydration to prevent server/client mismatches;
- validation before restored data enters the store.

Never persist:

- seed phrases or keys;
- viewing keys;
- wallet request objects;
- authorization headers;
- private discovery responses;
- unredacted errors;
- real wallet balances as sandbox balances.

Personal real-network transaction records remain session-only unless the user explicitly downloads or copies them. Curated project-owned evidence is stored separately in the repository.

### 11.4 Original design system

The frontend uses project-owned design tokens for colour, type scale, spacing, radius, shadow, status, and motion. It may follow CDR Kit's clarity and restraint but does not copy its brand tokens, copy, illustrations, or complete screen layouts.

Core surfaces:

- `ModeBadge` — always-visible execution truth;
- `EnvironmentStatus` — individual readiness checks;
- `ActorCard` — public/private balance and registration state;
- `ScenarioSteps` — guided lifecycle and Run All;
- `TransactionTimeline` — public/private movement and status;
- `PrivacyXRay` — observer-visible versus hidden information;
- `AdvancedDetails` — evidence and raw technical data;
- `ErrorRecoveryPanel` — explanation, next action, retry;
- `IntegrationSnippet` — copyable use of Lab Core;
- `EvidenceRecord` — verified public mainnet proof point.

## 12. Hosted Route Handlers

### 12.1 `GET /api/health`

Returns only application readiness and public build metadata:

```json
{
  "status": "ok",
  "build": "<public commit>",
  "compatibilitySet": "<version identifier>"
}
```

### 12.2 `POST /api/rpc`

Purpose: allow the hosted frontend to verify public mainnet data without exposing a private RPC credential.

Controls:

- fixed configured upstream hostname;
- JSON-RPC method allowlist;
- request-size limit;
- response-size limit;
- timeout;
- origin policy;
- no arbitrary URL parameter;
- redacted logging;
- basic abuse/rate control supported by the host;
- never proxy discovery requests containing viewing material;
- never proxy wallet signing or proof requests.

Initial method allowlist should be the smallest set required for chain ID, current block, transaction receipt, and public contract calls used by preflight/evidence.

### 12.3 `GET /api/evidence`

Reads and validates curated public evidence derived from the repository's `strk20.json` and optional public evidence metadata. It does not accept arbitrary evidence writes from anonymous visitors.

## 13. Mainnet Evidence Model

```ts
interface EvidenceRecord {
  id: string;
  source: "sandbox" | "wallet-session" | "project-curated";
  mode: ExecutionMode;
  proofKind: ProofKind;
  network: string;
  action: LabAction["type"] | "anonymizer-invoke";
  transactionHash?: string;
  receiptStatus?: "succeeded" | "reverted" | "pending" | "unknown";
  poolInteraction?: "verified" | "not-verified" | "not-applicable";
  explorerUrl?: string;
  createdAt: string;
}
```

A transaction qualifies for sprint evidence only when:

1. the network is Starknet mainnet;
2. the receipt is successful/final according to the supported RPC response;
3. the transaction or its receipt/events provide verifiable evidence of interaction with the official STRK20 pool;
4. the record has not already been counted;
5. the hash passes format validation;
6. the product presents a direct explorer link.

If automatic pool-interaction verification cannot be established reliably, the verifier must report `not-verified`; it must not guess.

## 14. Data Flows

### 14.1 Sandbox action lifecycle

```text
User selects Shield
  → Workbench validates the form
  → ScenarioController validates ordering and balance
  → SandboxAdapter emits validation/progress events
  → SandboxAdapter returns deterministic state changes
  → ScenarioController checks invariants
  → Zustand receives the new immutable snapshot
  → Account cards, timeline, and X-ray re-render
  → Safe sandbox state persists in browser storage
```

### 14.2 Real Wallet API lifecycle

```text
User selects real mode
  → Browser discovers wallet-standard providers
  → User deliberately connects one wallet
  → WalletAdapter feature-detects STRK20 capability
  → Preflight checks network/account/action readiness
  → User reviews action and privacy boundary
  → Wallet receives STRK20 request
  → Wallet owns keys, discovery, proof, and confirmation
  → WalletAdapter emits progress/result
  → Public RPC verifies receipt status
  → Workbench displays evidence
  → User explicitly copies/downloads personal evidence if desired
```

### 14.3 Refresh and hydration lifecycle

```text
Server renders safe initial shell
  → Client mounts
  → Persisted sandbox payload is read
  → Zod validates schema/version
  → Supported migration runs if required
  → Store hydrates or offers a safe reset
  → Real wallet state is freshly discovered, never restored as truth
```

### 14.4 Evidence publication lifecycle

```text
Team completes real mainnet actions
  → Verification script fetches public receipts
  → Pool interaction and success are checked
  → Maintainer manually reviews output
  → Valid hashes are placed in strk20.json
  → Public evidence projection is regenerated
  → CI validates metadata and hosted evidence page
```

## 15. PRD Epic-to-Component Map

### Epic 1: Understand the product immediately

Implemented by:

- Introduction route;
- original hero and product map;
- `ModeBadge`;
- `EnvironmentStatus`;
- server-rendered copy and metadata.

### Epic 2: Run the private-token lifecycle

Implemented by:

- `ScenarioController`;
- sandbox adapter;
- action schemas;
- `ScenarioSteps`;
- `ActorCard`;
- canonical sandbox fixture.

### Epic 3: See privacy, not just balances

Implemented by:

- event model;
- privacy fact catalogue;
- `TransactionTimeline`;
- `PrivacyXRay`;
- `AdvancedDetails`.

### Epic 4: Diagnose failures

Implemented by:

- `LabError` taxonomy;
- sandbox failure injection;
- wallet error normalization;
- `ErrorRecoveryPanel`;
- retry/idempotency rules.

### Epic 5: Adopt the infrastructure

Implemented by:

- `lab-core` public exports;
- Integrate route;
- `IntegrationSnippet`;
- separate example application;
- package README and API documentation.

### Epic 6: Move safely to mainnet

Implemented by:

- wallet discovery;
- Wallet API adapter;
- capability report;
- real-mode preflight;
- transaction state machine;
- public RPC verification.

### Epic 7: Verify real product evidence

Implemented by:

- evidence types and validators;
- repository verification scripts;
- Evidence route and components;
- `strk20.json` validation;
- public receipt/pool checks.

### Epic 8: Preserve and reset development state

Implemented by:

- versioned persisted Zustand state;
- migrations and validation;
- hydration gate;
- reset confirmation;
- strict separation from real wallet state.

## 16. Testing Strategy

### 16.1 Lab Core unit tests

Required tests:

- canonical fixture produces the documented balances;
- registration prerequisites;
- invalid action ordering;
- zero, negative, malformed, and excessive amounts;
- value conservation;
- duplicate idempotency key handling;
- controlled failure injection;
- every action has reviewed privacy facts;
- every raw adapter error maps to a stable category or `UNKNOWN`;
- simulated records fail qualifying-evidence validation;
- confirmed mainnet pool records pass when provided valid fixtures;
- adapter contract tests run against the sandbox and a wallet mock.

Target: at least 85% line and branch coverage for `packages/lab-core/src`, with scenario invariants and evidence qualification fully exercised.

### 16.2 Store and persistence tests

- first hydration;
- supported migration;
- invalid saved state;
- partial persistence excludes sensitive/session fields;
- reset affects only sandbox state;
- sandbox and real state cannot overwrite one another;
- no hydration mismatch in the workbench shell.

### 16.3 Component tests

- thirty-second copy and actions are present;
- mode labels use text, not colour only;
- guided action enabling/disabling;
- timeline and X-ray project the same step;
- simple/advanced toggle;
- error recovery actions;
- wallet unavailable and wrong-network states;
- pending, cancelled, failed, uncertain, and succeeded transaction views;
- hash copying and external evidence links.

### 16.4 Browser journeys

Two Chromium journeys are required:

1. open hosted-style app → run canonical sandbox flow → inspect privacy → refresh → restore → reset;
2. use a deterministic wallet mock → fail preflight → correct it → submit → confirm → display evidence.

A real wallet/mainnet smoke is recorded separately because CI must not hold user wallet keys.

### 16.5 CI gates

Every pull request must pass:

- frozen install;
- formatting check;
- lint;
- typecheck;
- unit/component tests;
- coverage thresholds;
- production build;
- `strk20.json` schema validation;
- licence/README presence;
- secret-pattern scan.

## 17. Security and Privacy Requirements

- Never request or accept seed phrases, private keys, or viewing keys.
- Never send wallet privacy data through generic hosted telemetry.
- Do not install third-party session replay or invasive analytics.
- Redact credential-bearing RPC URLs from logs and errors.
- Keep Alchemy or other private RPC credentials server-only.
- Validate and allowlist hosted RPC methods.
- Validate all data crossing wallet, persisted-state, route-handler, and repository-file boundaries.
- Do not automatically initiate a transaction after wallet connection or network switching.
- Require a review step before every real action.
- Treat pending/unknown status conservatively to avoid duplicate transactions.
- Use `rel="noopener noreferrer"` for external explorer links.
- Use a restrictive Content Security Policy compatible with the selected wallet flow.
- Keep sandbox state clearly fictional and non-monetary.
- Document public deposit, withdrawal, timing, pool-interaction, and anonymizer limitations.

## 18. Performance and Laptop Budget

Target development machine: 8 GB RAM and 256 GB storage with other applications installed.

Required constraints:

- no Docker daemon required;
- one Next.js development process plus tests run independently, not all heavy tasks concurrently;
- no Rust or Cairo compilation in the default frontend loop;
- no downloaded proving artifacts;
- no local chain database;
- core tests complete quickly enough for frequent use;
- browser sandbox remains responsive with at least 100 timeline events;
- documentation and marketing routes use Server Components where practical;
- large Starknet dependencies load only on routes/components that need them where bundling permits;
- CI runs production builds and broader tests that need not stay active on the laptop.

## 19. Deployment

### Hosted workbench

- Deploy the Next.js application to a public HTTPS URL.
- Configure server-only RPC credentials through the hosting environment.
- Expose public build commit and compatibility-set identifiers.
- Keep the sandbox functional if real-network verification is temporarily unavailable.
- Do not put the product behind authentication.

### Local development

```text
pnpm install
pnpm dev
```

The root command starts only the web application and workspace package watcher needed for active development. It does not start Docker or remote infrastructure.

### Package adoption

The initial package may be consumed through the workspace example and a Git repository reference before npm publication. Public npm publication is desirable but not allowed to delay the working hosted product or mainnet evidence.

## 20. Configuration

Public configuration:

- supported network ID;
- official pool address;
- explorer base URL;
- compatibility-set identifier;
- project source/demo links.

Server-only configuration:

- RPC upstream URL containing provider credentials;
- optional abuse-control configuration.

Example environment file contains placeholders only. No real provider key, wallet secret, private key, or viewing key enters version control.

## 21. Compatibility Manifest

The repository contains one machine-readable manifest describing:

- Node and package-manager versions;
- Next.js and React versions;
- Starknet.js version;
- wallet discovery/type package versions;
- supported wallet API capability version;
- network and pool address;
- evidence verification method;
- sandbox schema version.

The frontend exposes the manifest in Advanced details. CI verifies that documented versions agree with installed dependencies.

## 22. Anonymizer Extension Gate

The anonymizer is not part of the initial critical path. Work begins only when all of these are true:

1. canonical sandbox lifecycle passes;
2. hosted workbench is deployed;
3. a supported wallet is discovered and feature-checked;
4. at least one genuine pool transaction succeeds;
5. evidence verification works;
6. upstream confirms the selected anonymizer interface.

The smallest extension adds one reviewed action, one adapter implementation, one privacy-fact set, one contract/example, and one end-to-end scenario. It does not become a visual contract generator.

## 23. AI Usage

There is no runtime AI feature in the product. Plain-language errors and privacy facts are deterministic, reviewed content so they remain reproducible and do not leak wallet context to a model provider.

AI-assisted development may be used for:

- implementation drafting;
- test generation;
- documentation refinement;
- code review and threat-model prompts;
- accessibility and UX audits.

All generated changes remain subject to human review and the same CI gates.

## 24. Risks and Verification Gates

### Risk 1: Wallet API availability differs across wallets

Mitigation:

- feature-detect methods at runtime;
- implement one supported wallet first;
- run the compatibility spike before polishing real-mode UI;
- keep sandbox mode independent.

Verification gate: connect a real supported wallet, read STRK20 balances or receive the expected unregistered result, and successfully invoke one supported action.

### Risk 2: Package versions disagree

Mitigation:

- exact-pin the validated set;
- publish a compatibility manifest;
- copy the starter kit's Webpack fallback when necessary;
- add a CI version-consistency test.

Verification gate: clean install, production build, wallet discovery, and sandbox tests pass from the lockfile.

### Risk 3: GitHub Packages blocks easy SDK installation

Mitigation:

- prefer the Wallet API for the hosted real path;
- keep `lab-core` independent of the private SDK package where possible;
- document any authenticated package installation only for advanced contributors;
- ask upstream for supported distribution guidance.

Verification gate: a new contributor can run sandbox and web without a GitHub Packages token.

### Risk 4: Hosted RPC proxy becomes an open relay

Mitigation:

- fixed upstream;
- strict method allowlist;
- payload/time limits;
- host rate controls;
- no discovery/proof proxying.

Verification gate: tests reject arbitrary methods, upstream URLs, oversized requests, and malformed payloads.

### Risk 5: Simulated and real evidence become mixed

Mitigation:

- mode/proof discriminated unions;
- separate storage and visual sections;
- qualification validator fails closed;
- static curated evidence requires maintainer review.

Verification gate: no sandbox fixture can pass the mainnet evidence validator.

### Risk 6: Scope exceeds team time

Mitigation:

- build canonical sandbox and hosted shell first;
- perform wallet/mainnet spike before secondary polish;
- keep one shared package and two small apps;
- defer anonymizer until the gate;
- no Docker/database/authentication/general component library.

Verification gate: the project retains a deployable, understandable product at the end of every major slice.

## 25. Architecture Self-Review

### Finding 1: A separate example application adds build cost

Decision: keep it deliberately tiny. Its purpose is to prove that `lab-core` is reusable. It does not need the full workbench design system or a separate production deployment.

### Finding 2: A generic RPC proxy can introduce security and maintenance work

Decision: implement only the public methods required for receipt/evidence verification. If the host supplies an acceptable public RPC without a secret, remove the proxy rather than expanding it.

### Finding 3: Exact wallet support is still the largest unknown

Decision: make the wallet compatibility spike the first real-integration task. Do not build polished mainnet forms around unverified methods.

### Finding 4: “One command” could turn into a CLI project

Decision: for the first release, the one command is the repository's documented `pnpm dev`. The reusable product claim comes from `lab-core` and the separate consumer. A globally published launcher is optional and must not delay mainnet work.

## 26. Build Milestones

### Milestone A: product skeleton

- workspace and CI;
- original design tokens;
- introduction and workbench shell;
- mode/status truth;
- empty canonical scenario.

Exit: deployed URL passes the thirty-second comprehension test.

### Milestone B: genuine sandbox product

- `lab-core` domain model;
- sandbox adapter;
- controller and invariants;
- guided scenario;
- balances, timeline, X-ray, advanced details;
- persistence and reset;
- unit and component tests.

Exit: changed valid inputs produce changed correct results; invalid inputs produce useful errors.

### Milestone C: reusable infrastructure

- intentional public exports;
- Integrate page;
- separate example consumer;
- five-minute quickstart;
- core package tests and documentation.

Exit: example consumes `lab-core` without importing web internals.

### Milestone D: real STRK20 path

- wallet discovery;
- capability preflight;
- Wallet API adapter;
- transaction progress and conservative recovery;
- mainnet evidence verifier;
- at least three qualifying transactions.

Exit: real supported-wallet activity is verifiable and never confused with sandbox output.

### Milestone E: depth and finish

- one anonymizer extension if its gate passed;
- final accessibility/responsive pass;
- security/privacy review;
- demo path and documentation polish;
- final evidence metadata.

Exit: repository and hosted product independently support every submission claim.

## 27. Demo and Submission Flow

The implemented demo follows the PRD's three-minute sequence:

1. open the hosted introduction and identify target user, problem, and modes;
2. run the canonical sandbox lifecycle;
3. use the timeline/X-ray to explain privacy accurately;
4. trigger an unregistered-recipient or prover-unavailable failure;
5. show `lab-core` used by the separate example;
6. enter real mode and show a supported wallet/preflight;
7. show a successful verified mainnet pool transaction;
8. open Evidence and show three qualifying hashes, contract addresses if any, source, demo, and documentation.

The recorded video may use already-confirmed evidence rather than waiting for live proof generation during the recording. It must not imply that a recording is a live transaction when it is not.

## 28. External Documentation

- [Next.js App Router documentation](https://nextjs.org/docs/app)
- [Next.js environment variables](https://nextjs.org/docs/app/guides/environment-variables)
- [Next.js backend-for-frontend guidance](https://nextjs.org/docs/app/guides/backend-for-frontend)
- [Zustand persist middleware](https://zustand.docs.pmnd.rs/middlewares/persist)
- [Vitest projects](https://vitest.dev/guide/projects)
- [Vitest browser mode](https://vitest.dev/guide/browser/)
- [Starknet.js documentation](https://starknetjs.com/)
- [Starknet.js repository](https://github.com/starknet-io/starknet.js)
- [STRK20 build routes](https://strk20.starknet.io/build)
- [STRK20 by Example agent reference](https://strk20-by-example.org/llms-full.txt)
- [Starknet Privacy monorepo](https://github.com/starkware-libs/starknet-privacy)
- [STRK20 starter kit](https://github.com/Akashneelesh/strk20-starter-kit)
