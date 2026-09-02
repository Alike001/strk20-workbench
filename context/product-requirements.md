# STRK20 Infrastructure Product Requirements

Status: PRD candidate for approval  
Date: 2026-09-02  
Product name: STRK20 Workbench  
Repository name: `strk20-workbench`

## Product Summary

The product is a lightweight, visual workbench for developers building private Starknet applications with STRK20.

It gives a developer an immediate sandbox in which they can run the private-token lifecycle, understand what happened, inspect what was public or private, diagnose common failures, and see how to integrate the same behaviour into another application. It also provides a clearly separated real-network mode where a supported privacy wallet performs genuine STRK20 operations and the product records verifiable mainnet evidence.

The hosted workbench is the easiest entry point. The installable development package and local workbench make it reusable infrastructure rather than a one-off demonstration.

## Product Promise

> Build and debug private Starknet applications without running heavy infrastructure on your laptop. Test STRK20 workflows visually, understand their privacy boundaries, and move the same workflow to mainnet.

## Product Principles

### Understandable in thirty seconds

A visitor should not need prior knowledge of notes, nullifiers, discovery, proving, or anonymizers to understand why the product exists.

The opening view must answer:

- Who is this for? STRK20 application developers.
- What does it do? Runs and explains private application workflows.
- Why is it useful? It removes setup and debugging friction.
- Is the current result real? The active execution and proof mode are always visible.
- What should I do first? Run the guided private-transfer scenario.

### Infrastructure that behaves like a product

The product cannot stop at documentation, a component gallery, or a hard-coded animation. A developer must be able to run scenarios, change inputs, encounter real state transitions, inspect results, and use the development package from another application.

### Honest privacy

The interface must never imply that all blockchain activity is invisible. It explains deposits, withdrawals, timing, pool interactions, and public DeFi actions accurately. Simulated proofs are labelled as simulated everywhere they appear.

### Beginner clarity with expert depth

Every important state has two levels:

- a plain-language explanation shown by default;
- an **Advanced details** view containing the technical evidence.

Neither audience should be forced into the other's level of detail.

### Lightweight by default

The primary hosted and local experiences must not require Docker, a local production prover, or a powerful laptop. Heavy services are part of the real-network or advanced self-hosting path.

### Evidence over claims

Real-network claims are accompanied by transaction hashes, explorer links, network identity, pool address, execution time, and proof-mode status.

## Target Users

### Primary user: private dapp developer

A JavaScript or TypeScript developer who wants to add private balances or private actions to a Starknet application without first becoming an expert in every STRK20 subsystem.

They need to:

- understand the private-token lifecycle;
- test application behaviour safely;
- see useful errors;
- copy a correct integration pattern;
- know when they are ready for real-network testing.

### Secondary user: protocol integrator

A more experienced developer integrating wallet actions, discovery, or an anonymizer contract.

They need:

- raw requests and results;
- service and compatibility status;
- note and transaction information;
- predictable failure cases;
- evidence that application behaviour matches the expected privacy boundary.

### Secondary user: judge or evaluator

A person with little time who must determine whether the project is a real STRK20 product.

They need:

- an immediate value proposition;
- a working scenario without setup;
- clear separation between sandbox and mainnet;
- proof that another project can consume the infrastructure;
- verifiable live-pool evidence.

## Experience Levels

The interface has two information levels rather than two separate products.

### Simple view

Simple view is the default. It uses descriptions such as:

- “Alice is ready to hold private tokens.”
- “Alice moved 50 public tokens into the private pool.”
- “Bob received a private balance.”
- “This proof is simulated and cannot be submitted to mainnet.”

### Advanced details

Advanced details exposes relevant technical information such as:

- action and request type;
- pool and token addresses;
- transaction hash;
- note identifiers where safe and appropriate;
- nullifier status where relevant;
- discovery cursor and synchronization state;
- proof mode and proving block;
- raw error and normalized error category;
- public calldata or returned open-note information.

Advanced details must never reveal sensitive key material.

## Core User Journey

### Journey A: first-time hosted sandbox

1. The visitor opens the public product URL.
2. The first viewport explains the product in one headline and one supporting sentence.
3. A persistent mode badge says **Sandbox · Simulated proof**.
4. Five compact status items show Network, Pool, Discovery, Wallet, and Proof.
5. The primary action says **Run a private transfer**.
6. The visitor enters the guided workspace without creating an account or connecting a wallet.
7. Alice and Bob appear with their initial public and private balances.
8. The product guides the visitor through registration, shielding, private transfer, and withdrawal.
9. Each completed step animates on the transaction timeline.
10. The privacy X-ray updates beside the timeline to show what an outside observer can and cannot see.
11. The visitor can open integration guidance for the completed scenario.
12. The completed sandbox remains available if the page is refreshed on the same browser.

### Journey B: repeat or accelerated sandbox use

1. A returning visitor opens the workspace.
2. The previous sandbox state is restored and clearly identified as local browser data.
3. The visitor can continue, replay one action, or reset the workspace.
4. After completing the guided journey once, **Run all** becomes available.
5. The visitor may change supported scenario inputs before running again.
6. The resulting timeline and privacy X-ray reflect the new inputs rather than replaying fixed content.

### Journey C: learn from a failure

1. The visitor chooses a provided failure case or naturally causes one.
2. The failed step stops without falsely completing later steps.
3. The product states what failed in plain language.
4. It explains the likely cause and the next corrective action.
5. Advanced details preserves the original technical error.
6. The visitor can retry the failed step after fixing its condition.
7. Previously completed valid steps remain visible.

### Journey D: connect another project

1. The visitor selects **Connect your project**.
2. The product explains that the first release uses an installable development package rather than importing a repository.
3. The visitor sees the shortest installation path.
4. They select one example: balances, shield, private transfer, or withdraw.
5. The product presents a complete copyable integration example and its expected visible result.
6. A link opens the reference project using the same package.
7. The visitor sees which execution modes that example supports.

### Journey E: move to a real network

1. The visitor selects **Try real STRK20**.
2. The product explains that real mode uses a supported privacy wallet, real assets, a real proof, and network fees.
3. A compatibility preflight checks every required capability and displays each result.
4. If a supported privacy wallet is unavailable, the product leaves sandbox mode usable and provides the exact missing requirement.
5. The visitor connects the wallet intentionally.
6. The active network, account, pool, token, and proof mode become visible.
7. The visitor chooses a supported operation and reviews its public/privacy consequences.
8. The wallet requests confirmation.
9. A long-running proof state shows progress without promising an exact completion time.
10. A successful operation produces a result with transaction evidence.
11. A rejected, failed, or timed-out operation receives a distinct outcome and recovery path.

### Journey F: inspect mainnet evidence

1. The visitor opens the Evidence area.
2. Sandbox records and real-network records are visually separated.
3. Every mainnet record identifies its action and transaction hash.
4. Explorer links open the external transaction page.
5. The product identifies which records qualify as interactions with the live STRK20 pool.
6. The project team can copy or export the qualifying hashes for project metadata.
7. Contract addresses, demo URL, and video status can be reviewed beside the transaction evidence.

## Information Architecture

### 1. Introduction

Purpose: pass the thirty-second comprehension test.

Required content:

- headline;
- supporting product explanation;
- **Run a private transfer** primary action;
- **Connect your project** secondary action;
- current sandbox status strip;
- compact sandbox-to-mainnet explanation;
- proof that the project is reusable developer infrastructure;
- link to documentation and evidence.

### 2. Workbench

Purpose: run and understand scenarios.

Required content:

- active mode and proof badge;
- environment status;
- Alice and Bob account cards;
- guided step list;
- action controls;
- combined animated transaction timeline and privacy X-ray;
- simple result explanation;
- advanced technical drawer;
- integration guidance;
- retry and reset controls.

### 3. Integrate

Purpose: help another developer adopt the product.

Required content:

- install/start instructions;
- supported scenarios;
- copyable usage examples;
- expected outputs;
- compatibility requirements;
- reference application;
- link to package and source repository when published.

### 4. Real network

Purpose: make the transition from sandbox to genuine STRK20 explicit and safe.

Required content:

- real-mode explanation;
- wallet connection;
- compatibility preflight;
- selected account/network/pool;
- supported action form;
- privacy review before confirmation;
- proof and transaction progress;
- final result and evidence.

### 5. Evidence

Purpose: make technical and hackathon claims independently verifiable.

Required content:

- qualifying mainnet transactions;
- action labels;
- transaction hashes and explorer links;
- deployed contract addresses if any;
- active pool address;
- demo and source links;
- simulated records clearly separated from genuine records;
- export/copy action.

### 6. Documentation

Purpose: let another developer understand, install, use, and extend the product.

Required content:

- five-minute quickstart;
- mental model;
- execution modes;
- first scenario;
- integration examples;
- supported versions;
- privacy and trust boundaries;
- troubleshooting;
- contribution guide and licence.

## Epics and User Stories

### Epic 1: Understand the product immediately

#### Story 1.1: Thirty-second orientation

As a first-time visitor, I want to understand what the product does and who it serves so that I can decide whether to continue.

Acceptance criteria:

- The first viewport names STRK20 and private Starknet application development.
- It identifies developers as the primary audience.
- It states that the product supports both sandbox testing and real-network execution.
- It shows one primary action and one secondary action.
- It does not lead with unexplained protocol terminology.
- A reviewer can distinguish the project from a wallet, mixer, block explorer, or payment app without scrolling.

#### Story 1.2: Persistent execution truth

As a visitor, I want to know whether I am seeing a simulation or genuine network activity so that I do not misunderstand the result.

Acceptance criteria:

- The active mode is visible on every product screen.
- Sandbox mode includes the words **Simulated proof**.
- Real mode includes the network name and **Real proof** only when that is true.
- Colour is not the only way modes are distinguished.
- Exported evidence includes the execution mode.

### Epic 2: Run the private-token lifecycle

#### Story 2.1: Start without setup

As a new developer, I want to try a private workflow without a wallet or funds so that I can learn immediately.

Acceptance criteria:

- The hosted sandbox opens without registration or login.
- No wallet prompt appears before the visitor selects real mode.
- Alice and Bob have understandable starting states.
- The first recommended action is visually obvious.
- A short explanation tells the visitor that sandbox assets have no monetary value.

#### Story 2.2: Complete the guided scenario

As a developer, I want to run registration, shield, private transfer, and withdrawal in order so that I understand the lifecycle.

Acceptance criteria:

- The four steps are visible before the scenario begins.
- A step explains its purpose before execution.
- An action cannot appear completed unless its state change occurred in the active scenario.
- The next valid step becomes obvious after success.
- Balances update consistently with the action.
- The visitor can review completed steps without losing progress.

#### Story 2.3: Run an accelerated scenario

As a returning developer, I want to run the complete valid scenario at once so that I can test changes quickly.

Acceptance criteria:

- **Run all** is introduced after the guided scenario has been completed or deliberately skipped.
- It displays progress for each underlying step.
- If one step fails, dependent steps do not report success.
- The timeline remains understandable after accelerated execution.
- The same resulting state is produced as running equivalent steps manually.

### Epic 3: See privacy, not just balances

#### Story 3.1: Animated transaction timeline

As a learner, I want to see value move through each stage so that the lifecycle feels concrete.

Acceptance criteria:

- Alice, the pool, and Bob are visually identifiable.
- The timeline differentiates public and private legs.
- Motion communicates state change rather than serving as decoration.
- Completed, active, failed, and pending steps are distinct.
- The timeline remains understandable with motion disabled.

#### Story 3.2: Privacy X-ray

As a developer, I want to know what an external observer can see so that I can make accurate privacy claims.

Acceptance criteria:

- Every scenario step has a public/private explanation.
- Deposit and withdrawal visibility is not hidden.
- A private transfer explains that sender, receiver, token, amount, and spent notes are private inside the pool.
- Timing and pool-interaction visibility are stated.
- An anonymizer action, when available, explains that the user link may be hidden while app-side action and amounts can remain public.
- The X-ray updates as the active step changes.

#### Story 3.3: Advanced technical details

As an experienced integrator, I want access to technical evidence so that I can diagnose behaviour without overwhelming new users.

Acceptance criteria:

- Technical details are closed by default.
- Opening details does not replace or remove the simple explanation.
- Information is grouped by action, state, privacy, and evidence.
- Sensitive secrets are never displayed.
- Raw errors are copyable.

### Epic 4: Diagnose failures

#### Story 4.1: Understand an invalid action

As a developer, I want the workbench to explain why an action is invalid so that I can correct my integration.

Acceptance criteria:

- Invalid actions do not silently fail.
- The explanation names the affected user and prerequisite where applicable.
- The interface suggests one concrete next action.
- Raw and normalized errors remain available.
- Retrying does not duplicate already successful state changes.

#### Story 4.2: Deliberately reproduce failures

As an integrator, I want controlled failure examples so that I can test my application's error experience.

Acceptance criteria:

- At least an unregistered-recipient case is available.
- At least one proof-service failure state is available.
- A selected failure case is visibly marked as intentional.
- The workbench can return to a healthy scenario without reloading the entire product.
- Failure examples are documented as development tools, not protocol vulnerabilities.

### Epic 5: Adopt the infrastructure

#### Story 5.1: Connect a project

As an application developer, I want a short adoption path so that I can use the scenario engine outside the workbench.

Acceptance criteria:

- The product clearly states what is being installed or connected.
- The first release does not ask for broad GitHub repository access.
- A shortest-path example is presented before advanced configuration.
- The developer can choose an example by desired action.
- Each example includes its expected user-visible result.

#### Story 5.2: Verify reusability

As an evaluator, I want to see a separate reference application using the development package so that I know the workbench is not hard-coded.

Acceptance criteria:

- The reference application is visibly separate from the workbench.
- It consumes the same scenario/action interface documented for other developers.
- Its source is public.
- Its README explains how the dependency is used.
- At least one automated test exercises the reusable boundary.

### Epic 6: Move safely to mainnet

#### Story 6.1: Complete compatibility preflight

As a developer, I want to know what is missing before attempting a real transaction so that I do not waste funds or time.

Acceptance criteria:

- Preflight separately reports wallet, network, pool, account registration, balance, and required service readiness where observable.
- Passing and failing checks include words or icons in addition to colour.
- A failed check includes a corrective action.
- The transaction action remains unavailable when a required safety condition is missing.
- Sandbox mode remains available regardless of real-mode readiness.

#### Story 6.2: Review privacy before signing

As a wallet user, I want to review what will be public before confirmation so that I can make an informed decision.

Acceptance criteria:

- The action, token, amount, recipient/application, network, and expected public/private boundary are shown before the wallet prompt.
- The interface does not claim that deposits or withdrawals are invisible.
- Cancelling returns the user to an unchanged review state.
- The product never requests a seed phrase or private key.

#### Story 6.3: Follow a long-running proof

As a user, I want understandable progress while a real proof is prepared so that I do not assume the product is frozen.

Acceptance criteria:

- Proof preparation and transaction submission are different visible phases.
- The product does not promise a precise completion time it cannot guarantee.
- The user can distinguish waiting, wallet rejection, service busy, submission failure, and onchain success.
- Refresh/recovery guidance is available if the result becomes uncertain.
- Repeated clicks do not silently create duplicate requests.

### Epic 7: Verify real product evidence

#### Story 7.1: Inspect transaction proof points

As a judge or developer, I want direct transaction evidence so that I can verify mainnet claims independently.

Acceptance criteria:

- Real records include transaction hash, action, network, timestamp, and pool interaction status.
- Each hash links to a relevant explorer page.
- Simulated events cannot appear in the qualifying mainnet list.
- At least three qualifying live-pool interactions can be identified before final submission.
- Failed transactions are not counted as successful evidence.

#### Story 7.2: Export submission evidence

As a project maintainer, I want to copy the required evidence so that repository metadata remains accurate.

Acceptance criteria:

- The export contains only verified qualifying transaction hashes by default.
- Contract addresses can be included when they exist.
- Missing demo or video fields are shown as incomplete rather than invented.
- The product does not modify the public repository without an explicit maintainer action.

### Epic 8: Preserve and reset development state

#### Story 8.1: Resume sandbox work

As a returning visitor, I want my sandbox state restored so that an accidental refresh does not erase my learning progress.

Acceptance criteria:

- Sandbox progress is stored only in the current browser by default.
- Restored state is identified as sandbox data.
- Real wallet balances are never replaced by restored sandbox values.
- Incompatible saved data triggers a safe reset offer.

#### Story 8.2: Reset safely

As a developer, I want to reset the sandbox so that I can reproduce the scenario from a known state.

Acceptance criteria:

- Reset states exactly what will be cleared.
- Reset does not affect wallet or mainnet state.
- The user confirms before non-empty sandbox history is removed.
- After reset, Alice and Bob return to documented starting states.

## Required Empty, Loading, and Error States

### No saved sandbox

- Present the guided scenario and starting balances.
- Do not show an empty analytics dashboard.

### Saved sandbox from an older incompatible version

- Explain that the saved scenario cannot be restored safely.
- Offer export where possible, then reset.
- Do not partially load inconsistent balances.

### Wallet not installed

- Keep the sandbox fully usable.
- Explain which supported wallet capability is required for real mode.
- Do not repeatedly open installation prompts.

### Wallet connected to the wrong network

- Identify the current and required networks.
- Request an intentional switch.
- Do not present the transaction as ready before switching.

### Account not registered

- Explain registration in plain language.
- Offer the appropriate registration path.
- Do not imply that the account has a private balance before registration succeeds.

### Insufficient public balance

- State whether the missing balance is the token amount or network fee.
- Preserve entered values while the user corrects the condition.

### Insufficient private balance

- Show the available private amount when safely returned by the wallet.
- Suggest lowering the amount or shielding funds.

### Discovery behind or unavailable

- Mark private balance information as incomplete or stale.
- Do not display stale information as confirmed current state.
- Explain whether retrying, waiting, or changing service configuration is appropriate.

### Prover busy or unavailable

- Distinguish temporary service unavailability from an invalid action.
- Explain that proof preparation can be retried.
- Prevent rapid repeated submissions.

### User rejects wallet request

- Mark the action as cancelled, not failed onchain.
- Preserve the review form.
- Do not create evidence records.

### Transaction submitted but result uncertain

- Preserve the transaction hash when available.
- Display an uncertain/pending state rather than success.
- Allow the user to recheck status without resubmitting.

### Mainnet transaction fails

- Show the failure separately from proof preparation.
- Do not count it toward qualifying evidence.
- Retain technical details for debugging.

### External explorer unavailable

- Keep the hash copyable.
- State that external verification is temporarily unavailable.
- Do not remove the local evidence record.

## Interaction and Content Requirements

### Language

- Use “private transfer” rather than “invisible transaction.”
- Use “simulated proof” rather than “test proof” where confusion is possible.
- Use “real network” only when the selected network and services are genuine.
- Introduce “note,” “nullifier,” and “discovery” only inside explanations or advanced details.
- Avoid claims of total anonymity.

### Visual hierarchy

- The execution/proof mode is more prominent than decorative statistics.
- The current scenario step is the strongest element in the workspace.
- The privacy X-ray and timeline operate as one coordinated explanation.
- Integration code is adjacent but visually secondary to the scenario result.
- Mainnet evidence is visually distinct from sandbox history.

### Motion

- Motion illustrates registration, entry into the pool, private transfer, withdrawal, waiting, success, and failure.
- The interface honours reduced-motion preferences.
- No important information is conveyed only through animation.

### Responsive behaviour

- The hosted introduction and scenario result remain understandable on a mobile screen.
- Desktop is the primary developer-workbench layout.
- On narrow screens, timeline, X-ray, and advanced details stack in logical order.
- Code and hashes remain copyable without forcing the entire page to scroll horizontally.

### Accessibility

- All actions are keyboard reachable.
- Status does not depend only on colour.
- Focus remains visible.
- Dialogs describe their consequence and return focus appropriately.
- Technical values have accessible labels rather than relying on visual proximity.

## Product Boundaries

### Included in the sprint product

- Hosted sandbox.
- Lightweight local workbench.
- Guided Alice-to-Bob lifecycle.
- Accelerated replay.
- Privacy X-ray and animated timeline.
- Simple and advanced information levels.
- At least two controlled failure experiences.
- Developer integration guidance.
- Reusable Lab Core boundary demonstrated by a separate example.
- Supported privacy-wallet real mode.
- Compatibility preflight.
- Mainnet transaction evidence and export.
- Documentation, tests, contribution guidance, and licence.

### Add with more time

- User-created scenario sequences.
- Many saved workspaces.
- Team collaboration and shared scenario links.
- Repository importing or automated source inspection.
- Full local devnet orchestration.
- Local production-prover management.
- Anonymizer visual builder.
- Multiple production DeFi adapters.
- General-purpose React component package.
- Hosted accounts and cross-device synchronization.

### Explicit non-goals

- Custodying user keys or funds.
- Creating a new wallet.
- Reimplementing the STRK20 pool, discovery protocol, or prover.
- Claiming that public deposit, withdrawal, timing, or DeFi information is hidden.
- Requiring a login for the sandbox.
- Requiring Docker for the primary workflow.
- Supporting every wallet, network, token, browser, and operating system in the first release.
- Copying CDR Kit screens or ZK Freighter source/assets.

## Submission Proof Points

The finished public repository and product should allow an evaluator to verify:

1. **Immediate comprehension** — the purpose and target user are obvious in the first viewport.
2. **Reusable infrastructure** — a separate reference application consumes the shared development package.
3. **STRK20 depth** — the product understands registration, balances, shield, private transfer, withdraw, wallet behaviour, discovery/proof status, and privacy boundaries.
4. **Working sandbox** — a visitor can complete the lifecycle without a wallet.
5. **Honest modes** — simulated and real activity cannot be confused.
6. **Mainnet reality** — at least three successful transactions touch the official pool and are independently verifiable.
7. **Developer quality** — installation, quickstart, examples, tests, version compatibility, licence, and contribution instructions are public.
8. **Product finish** — empty, loading, error, cancellation, pending, and successful states are intentionally designed.
9. **Ecosystem value** — another STRK20 builder can adopt the package or scenario pattern.

## Success Criteria

### Thirty-second test

A person unfamiliar with the project can answer all five questions after viewing the opening screen for thirty seconds:

- Who is it for?
- What problem does it solve?
- Why is STRK20 involved?
- What can I try now?
- Am I looking at simulation or mainnet?

### Five-minute adoption test

A JavaScript developer can find the installation path, run or understand the first scenario, and locate the equivalent integration guidance within five minutes.

### Product test

The scenario engine accepts changed supported inputs and produces corresponding state, timeline, privacy, and error results rather than replaying fixed presentation content.

### Mainnet test

A supported wallet user can complete a genuine STRK20 operation, receive a clear final status, and inspect an external transaction record.

### Trust test

At no point does the interface request private keys, represent simulated proofs as real, count failed transactions as evidence, or claim stronger privacy than the underlying action provides.

## PRD Decisions Made

- Use a guided first scenario; introduce **Run all** afterward.
- Present privacy explanation and animated transaction state together.
- Lead with the privacy result; keep integration guidance one click away or adjacent on large screens.
- Use simple explanations by default and an **Advanced details** control for protocol evidence.
- Combine the animated Alice-to-Bob timeline and privacy X-ray as the signature interaction.
- Persist sandbox state in the current browser without accounts.
- Preserve full sandbox access when a wallet or real service is unavailable.
- Require intentional wallet confirmation for every real operation.
- Keep Docker and a local production prover outside the required workflow.
- Treat the anonymizer as the first major extension after the central real transfer path is stable.

## Open Product Questions for Upstream Confirmation

These are not invitations to expand the product. They affect the exact wording or availability of real mode:

1. Which supported privacy wallets expose the required STRK20 actions at the sprint deadline?
2. What preflight information can the wallet expose without weakening privacy?
3. What recovery behaviour is recommended when proof preparation completes but submission status becomes uncertain?
4. Which anonymizer capability is sufficiently stable for the first reference extension?
