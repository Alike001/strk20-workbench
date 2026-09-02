# STRK20 Infrastructure Product Scope

Status: scope candidate for approval  
Date: 2026-09-02  
Final product name: STRK20 Workbench  
Repository name: `strk20-workbench`

## Product Thesis

STRK20 provides the privacy protocol, but application developers still have to understand and coordinate the wallet API, pool, discovery, proving, accounts, tokens, networks, and anonymizer behaviour.

We will build a lightweight, visual STRK20 developer workbench that lets developers test and understand a private application workflow on an ordinary laptop, then run the same workflow through genuine STRK20 mainnet infrastructure.

This is infrastructure presented as a usable product. It is not another private-payments application and it is not a scripted simulator pretending to be production privacy.

## Thirty-Second Explanation

> Build and debug private Starknet applications without running heavy infrastructure on your laptop. Test STRK20 workflows in a visual sandbox, understand what is public and private, then move the same workflow to mainnet.

A first-time visitor must understand within thirty seconds that:

1. the product is for developers;
2. it is built specifically around STRK20;
3. it tests private Starknet workflows;
4. lightweight testing and genuine mainnet proving are different modes;
5. the tool can be used by other projects, not only demonstrated by its creators.

## Target User

The primary user is a JavaScript or TypeScript developer building a private dapp on Starknet who does not want to become an expert in every STRK20 subsystem before testing an application.

Secondary users are:

- wallet and SDK integrators diagnosing STRK20 behaviour;
- Cairo developers testing an anonymizer contract;
- hackathon builders who need a reliable path from a local scenario to mainnet evidence;
- learners who need to see the boundary between public and private information.

## User Problem

Today a developer may need to answer all of these before their product logic can be tested:

- Which Starknet.js and STRK20 package versions are compatible?
- Is the wallet/account registered for private balances?
- Is the pool available?
- Is discovery synchronized?
- Is the proof simulated or genuine?
- Which part of an anonymizer action is public?
- Why did a private transaction fail?
- How does a tested local flow become a real mainnet transaction?

The upstream repository contains most of the underlying primitives, but it does not package them as one lightweight, application-facing workflow.

## Product, Not Demo

The Alice-to-Bob private transfer is the first scenario used to explain and verify the product. It is not the product itself.

The reusable product consists of:

- an installable scenario and adapter package;
- a lightweight command that starts the workbench;
- a hosted workbench that requires no installation;
- a visual inspector for STRK20 behaviour and privacy boundaries;
- a path for an external project to use the same scenario engine;
- a real-network adapter and evidence export.

Another developer must be able to use it without changing our source code or replaying a hard-coded presentation.

## Core Workflow

### First visit

1. The developer opens the hosted workbench or starts it locally.
2. The first screen states the product promise and current execution mode.
3. They select **Run a private transfer**.
4. The workbench prepares Alice and Bob and explains their starting state.
5. It runs registration, shield, private transfer, and withdrawal steps.
6. A timeline shows what changed and which information was public or private.
7. If a step fails, the raw error and a plain-language explanation are shown together.
8. The developer can view the equivalent integration code.

### Real-network handoff

1. The developer selects real-network mode.
2. The workbench verifies wallet, network, pool, package, and service compatibility.
3. The user connects a supported privacy wallet.
4. Sensitive keys remain under the user's wallet rather than being collected by the hosted application.
5. The user performs a real STRK20 workflow.
6. The workbench records explorer-verifiable evidence and can prepare the relevant submission metadata.

## Execution Modes

| Mode              | Runs where                                          | Purpose                                 | Proof status                      |
| ----------------- | --------------------------------------------------- | --------------------------------------- | --------------------------------- |
| Hosted sandbox    | Browser plus lightweight hosted application         | Immediate learning and scenario testing | Explicitly simulated              |
| Local workbench   | Node process and browser on the developer's machine | Project integration and automated tests | Explicitly simulated by default   |
| Real network      | Browser wallet plus remote STRK20 services          | Genuine testnet/mainnet activity        | Genuine                           |
| Full self-hosting | Powerful external machine or future advanced setup  | Infrastructure operators                | Genuine when correctly configured |

Docker and a locally hosted production prover are not requirements for the first release. Heavy work is delegated to remote services, CI, or a supported privacy wallet.

## What We Are Building

### Must have

1. **Lab Core**
   - TypeScript scenario model.
   - Swappable simulated and real-network adapters.
   - Register, shield, private transfer, and withdraw actions.
   - Typed states and useful errors.

2. **Visual Workbench**
   - Hosted and locally runnable frontend.
   - Environment/service status.
   - Alice and Bob scenario.
   - Transaction and privacy timeline.
   - Public-versus-private inspector.
   - Raw technical evidence alongside plain-language explanations.
   - Unmissable simulated-versus-real proof labels.

3. **Real STRK20 path**
   - Compatible Wallet API integration.
   - Supported real-network configuration.
   - Three successful mainnet transactions against the live pool.
   - Explorer links and evidence export.

4. **Developer adoption surface**
   - Installable package or single lightweight start command.
   - One reference integration separate from the workbench itself.
   - Five-minute quickstart.
   - Version/compatibility documentation.
   - Tests and an open-source licence.

### Should have

- A compatibility preflight for network, wallet, package versions, pool, discovery, and proof mode.
- Several controlled failure cases, beginning with an unregistered recipient and an unavailable/busy prover.
- Copyable integration code for each scenario step.
- One anonymizer scenario after the real private-transfer path is stable.

### Could have after the sprint core

- Visual custom-scenario composition.
- More anonymizer adapters.
- Advanced reorg and discovery-lag controls.
- A full local devnet profile.
- A self-hosted prover profile.
- A broader React component library.

## What We Are Not Building

- A new privacy pool, proof system, or circuit.
- A new STRK20 wallet or browser extension.
- Another public note indexer.
- A production prover.
- A generic blockchain simulator unrelated to STRK20.
- A large drag-and-drop workflow platform.
- A collection of shallow DeFi integrations.
- A Docker-heavy default installation.
- A clone of CDR Kit or ZK Freighter.
- A UI that describes mock proofs as real privacy.

## Frontend and UX Direction

The visual personality is an approachable engineering control room: serious enough for protocol developers, but understandable to a developer encountering STRK20 for the first time.

The first viewport should contain:

- one plain headline and supporting sentence;
- **Run a private transfer** as the primary action;
- **Connect your project** as the secondary action;
- network, pool, discovery, wallet, and proof-mode status;
- a compact diagram showing sandbox-to-mainnet progression;
- no token-price dashboard, generic crypto statistics, or unexplained privacy terminology.

The likely frontend stack is Next.js, TypeScript, and Tailwind CSS, running directly through Node without Docker. The repository will keep the reusable scenario logic outside the frontend so another application can consume it.

## How CDR Kit Influences the Product

| CDR Kit principle                                   | Our STRK20 implementation                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------- |
| Difficult protocol becomes one developer experience | Pool, wallet, discovery, proof, and network state use one mental model    |
| One core supports multiple surfaces                 | Lab Core supports the hosted workbench, local command, tests, and example |
| Mock mode reduces adoption friction                 | Hosted and local sandbox modes require no funds or heavy prover           |
| Documentation is part of the product                | Explanations and copyable integration code appear beside scenario state   |
| Technical evidence builds trust                     | Mainnet transactions, versions, modes, and service health remain visible  |

We may reuse small generic portions of MIT-licensed CDR Kit code only if they provide clear value, and only while preserving its licence notice. Its Story-specific product architecture, copy, brand, illustrations, and screen composition will not be copied wholesale.

## How ZK Freighter Influences the Product

| ZK Freighter principle                     | Our STRK20 implementation                                                    |
| ------------------------------------------ | ---------------------------------------------------------------------------- |
| Shared privacy core, thin product surfaces | STRK20 logic stays in Lab Core; the workbench presents it                    |
| Be explicit about privacy boundaries       | Every scenario states what is public, private, or merely unlinkable          |
| Supporting services stay narrow            | The hosted frontend coordinates services but does not become a key custodian |
| Network choice is configuration            | The scenario remains stable while its adapter changes                        |
| Claims have verifiable evidence            | Real mode displays transaction hashes and explorer links                     |

ZK Freighter is an architectural and UX reference only. Its code and assets will not be copied without an explicit licence.

## Original Differentiation

CDR Kit packages Story Protocol development. ZK Freighter is a Stellar privacy wallet system. This product addresses a different missing workflow:

> one lightweight place to build, inspect, debug, and graduate an STRK20 application from simulation to real mainnet execution.

Its distinctive product features are:

- the same scenario interface across simulated and real modes;
- privacy-boundary inspection;
- STRK20-specific compatibility checks;
- beginner explanations paired with expert evidence;
- low-resource laptop support;
- a deliberate handoff to genuine mainnet proving rather than a simulated dead end.

## Three-Minute Demonstration

1. **0:00–0:25 — Product comprehension**  
   Open the hosted workbench. State the problem, promise, target developer, and current proof mode.

2. **0:25–1:15 — Working sandbox**  
   Run Alice-to-Bob registration, shield, and private-transfer steps. Show balance and timeline changes.

3. **1:15–1:45 — Privacy understanding**  
   Open the inspector and show exactly which data is public and private.

4. **1:45–2:10 — Developer value**  
   Trigger one realistic failure, display the explanation, and show the corresponding integration code/test.

5. **2:10–2:50 — Real product evidence**  
   Switch to real mode, connect a supported wallet, and show a completed mainnet STRK20 operation and explorer evidence.

6. **2:50–3:00 — Ecosystem value**  
   Show how another project installs Lab Core and state the next anonymizer capability.

## Submission Story

> STRK20 gave Starknet a privacy protocol. We made it practical for application developers. Our lightweight workbench lets a builder learn and test the private lifecycle on an ordinary laptop, diagnose integrations visually, and move the same workflow to a real wallet and mainnet without confusing simulation with production privacy.

## Team and Delivery Constraints

- Two builders.
- Reported availability: five to seven hours per builder per day; confirm if this interpretation is wrong.
- The primary builder and Codex will hold architecture, STRK20 integration, final UX, review, and mainnet evidence together.
- The second builder will work through small pull requests on isolated UI, documentation, tests, and bounded features.
- Architectural, dependency, and core privacy-flow changes require review before merge.
- The required path must remain usable on an 8 GB RAM, 256 GB storage laptop.

## Definition of Done

The first release is done when:

- a stranger understands the product within thirty seconds;
- the hosted sandbox works without installation or wallet funds;
- the local workbench runs without Docker on the target laptop;
- the central scenario is reusable rather than hard-coded presentation logic;
- the interface never confuses simulated and genuine proofs;
- another example consumes Lab Core;
- the real-wallet path successfully touches the live STRK20 pool at least three times;
- the public repository contains a reproducible quickstart, tests, architecture/trust documentation, a licence, and complete `strk20.json` evidence.

## Decisions Still Needed Before Registration

1. GitHub owner or organization for the public repository.
2. Both Telegram usernames for the single registry entry.
3. Confirmation from the STRK20 team on supported wallet/local behaviour, package distribution, and pinned compatibility versions.

These decisions do not require more broad ecosystem research.
