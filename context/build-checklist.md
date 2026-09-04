# STRK20 Developer Workbench Build Checklist

Status: approved and in execution  
Date: 2026-09-02  
Final product name: STRK20 Workbench  
Repository name: `strk20-workbench`

## Build Preferences

- **Plan ownership:** Codex designs and sequences the plan; the participant reviews milestone outcomes.
- **Build mode:** Autonomous after the project repository exists and the checklist is approved.
- **Comprehension checks:** Short plain-language explanation at each review pause; no pause after every implementation detail.
- **Git cadence:** One reviewed commit for every stable checklist item or tightly coupled pair; teammate work arrives through small pull requests.
- **Verification:** Automated checks after every item plus manual review at the three named pauses.
- **Check-in cadence:** Balanced—continue autonomously between meaningful visual or technical gates.
- **Review pause 1:** First polished frontend shell and thirty-second test.
- **Review pause 2:** Complete sandbox scenario, timeline, and privacy X-ray.
- **Review pause 3:** Supported wallet/mainnet path and verified evidence.
- **Required laptop path:** Node and browser only; no Docker, local prover, local chain, database, or continuous heavy services.
- **Wow moment:** Alice privately sends value to Bob while the timeline and privacy X-ray show what observers can and cannot see, followed by an unmistakable transition from simulated mode to verified mainnet evidence.

## Sequencing Logic

The plan is ordered around risk rather than appearance:

1. establish the product identity and valid hackathon repository;
2. prove the supported-wallet path early enough to pivot;
3. create a polished shell that communicates the product;
4. build the framework-neutral scenario engine;
5. connect that engine to the visual workbench;
6. prove reusability in a separate consumer;
7. complete genuine mainnet activity and evidence;
8. attempt an anonymizer only after the core product is safe;
9. finish documentation, video, and repository metadata.

## Checklist

- [x] **1. Choose the product identity and create the single registration entry**
      Completed: 2026-09-02. **STRK20 Workbench** is public at `Alike001/strk20-workbench`; the single team entry includes `IamAlikeX` and `agbacoder01` under `Infra`. Registration PR #270 passed automation and was applied to upstream `main` as commit `fca520f`.
      Spec ref: `technical-specification.md > 26. Build Milestones > Milestone A` and `project-scope.md > Decisions Still Needed Before Registration`
      What to build: Select an original product and repository name after a collision/meaning check; confirm the GitHub owner and both Telegram usernames; create the public project repository; add a first README, MIT licence, `.gitignore`, empty valid `strk20.json`, and the planning references intended to be public; make the first commit; then fork `starkience/strk20-hackathon`, append exactly one registry object containing the project repository and both Telegram usernames, change no other entry, and open the team's only registration pull request with the approved one-sentence product description. Do not fork CDR Kit or ZK Freighter as the project base.
      Acceptance: The project repository is public and non-empty; `strk20.json` contains the four required fields; the licence is explicit; one registry PR represents the entire team; no unrelated registry entry changed; the product description identifies reusable STRK20 infrastructure rather than a generic simulator.
      Verify: Review the initial project commit; run a JSON parser against both JSON files; inspect the registration diff; confirm the public repository URL resolves; manually verify that both builders are represented before opening the external PR.

- [x] **2. Scaffold the lightweight workspace, install STRK20 skills, and establish CI**
      Completed: 2026-09-02. The project-local skill audit and freshness check passed. Frozen install, lint, typecheck, tests, formatting, and production build pass; the first compiled development request used about 1.0 GB RSS across the project's pnpm/Next.js processes and the dependency tree uses about 501 MB on disk.
      Spec ref: `technical-specification.md > 3. Stack`, `4. Repository Structure`, `16.5 CI gates`, and `18. Performance and Laptop Budget`
      What to build: Create the pnpm workspace with `apps/web`, `apps/example`, and `packages/lab-core`; pin Node, pnpm, TypeScript, Next.js/React, testing, and formatting dependencies; begin with the starter-compatible Webpack path if necessary; add root scripts for development, build, typecheck, lint, formatting, and tests; install `welttowelt/strk20-skills` inside the project as instructed by the sprint; add `.env.example`, secret-safe `.gitignore`, PR template, and CI without Docker; expose an initial compatibility manifest.
      Acceptance: A clean clone installs from the lockfile without a GitHub Packages token; `pnpm dev` starts only lightweight Node processes; no secret is committed; all workspace packages resolve; CI checks the same commands developers run locally.
      Verify: Run `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`; inspect process and memory usage on the 8 GB laptop; run a secret-pattern scan; review every file added by the STRK20 skills installer before committing.

- [ ] **3. Run the wallet and package compatibility spike before building real-mode UI**
      Progress: 2026-09-04. The exact 10.4.0 starter and 10.5.0 candidate matrices build successfully; the candidate pins, safe capability helpers, tests, documentation, and hidden `/internal/compatibility` browser probe are implemented. The page performs deliberate discovery/connection and never invokes private balance, proof, or transaction methods. Completion remains gated on a real Ready/Xverse extension run and the STRK20 team's answers to the four recorded compatibility questions.
      Spec ref: `technical-specification.md > 3.3 Starknet and STRK20`, `6.4 Wallet API adapter`, and `24. Risks and Verification Gates > Risk 1` through `Risk 3`
      What to build: Create a disposable internal compatibility page/script that discovers supported Starknet wallets, connects only after user action, reports chain ID and advertised features, feature-detects STRK20 balances/prepare/invoke methods, and records the exact working package versions; test the starter kit's dependency combination and the upstream `starknet@10.5.0` combination; ask the STRK20 team the four outstanding compatibility questions and record answers in `docs/compatibility.md`. Keep this spike out of the final navigation until its behaviours are incorporated properly.
      Acceptance: The team knows which real wallet and exact dependency set the first release supports, or has a documented blocker/fallback before investing in real-mode forms; sandbox development remains independent of private package authentication; no key or viewing material is logged.
      Verify: Run a real browser wallet discovery/connection test; capture the capability report without secrets; produce a clean-install/build result for the selected pins; review `docs/compatibility.md` against the upstream response and lockfile.

- [x] **4. Build the original product shell and pass review pause 1**
      Completed: 2026-09-04. The participant approved continuing with the architecture and visual direction. The original desktop concept is saved in `context/design/`; the Introduction, Workbench, Integrate, Evidence, and Documentation shells, persistent sandbox/simulated-proof truth, accurate privacy scenario, and sandbox-to-mainnet product map are implemented. Desktop 1536×1024 and mobile 390×844 browser QA passed with no page overflow.
      Spec ref: `technical-specification.md > 11. Frontend Architecture`, `15. PRD Epic-to-Component Map > Epic 1`, and `26. Build Milestones > Milestone A`
      What to build: Implement an original design-token system and the Introduction, Workbench, Integrate, Evidence, and Documentation route shells; create the always-visible `ModeBadge` and individual environment-status items; write the headline, supporting explanation, primary **Run a private transfer** action, and secondary **Connect your project** action; add the compact sandbox-to-mainnet product map. Use CDR Kit's clarity and developer-product discipline as reference without copying its branding, illustrations, exact tokens, copy, or complete layouts.
      Acceptance: A new visitor can identify the target developer, STRK20 connection, sandbox purpose, real-network path, proof mode, and first action from the initial viewport; the interface is responsive and keyboard navigable; it does not resemble a wallet, trading dashboard, or token-price page.
      Verify: Run lint, typecheck, component smoke tests, and production build; inspect desktop and mobile layouts; perform the five-question thirty-second test with the participant; **pause for review 1** and do not treat the visual direction as accepted until feedback is resolved.

- [x] **5. Implement Lab Core, the canonical state machine, and invariant tests**
      Completed: 2026-09-04. Lab Core now provides framework-neutral domain, adapter, capability, privacy, persistence, error, and evidence contracts; bigint-safe amount helpers; a deterministic immutable controller; canonical Alice/Bob state; stable validation, cancellation, failure, uncertainty, idempotency, conservation, and evidence boundaries; and reusable adapter contract fixtures. The workspace has no Lab Core imports from React, Next.js, Zustand, DOM UI, Starknet.js, or wallet packages. All 25 Lab Core tests pass with 97.3% line and 91.79% branch coverage, and coverage thresholds are enforced in CI.
      Spec ref: `technical-specification.md > 5. Core Domain Model`, `6. Adapter Contract`, `7. Scenario Controller`, `8. Event Model and UI Projection`, and `10. Error Taxonomy`
      What to build: Implement framework-neutral action, actor, token, capability, event, evidence, privacy, persistence, and error types; implement base-unit-safe amount helpers; define the adapter contract; implement immutable scenario reduction, action ordering, idempotency, uncertain-state protection, and value-conservation invariants; expose only intentional public exports; create adapter contract fixtures.
      Acceptance: `lab-core` imports no React, Next.js, Zustand, DOM, or wallet UI code; the canonical state transitions are deterministic; invalid ordering and amounts fail with stable errors; cancelled, failed, uncertain, simulated, and genuine states cannot be confused; TypeScript consumers can use the public API without internal imports.
      Verify: Run Lab Core unit tests and typecheck; confirm canonical balance arithmetic; test duplicate idempotency keys and invalid action orders; enforce at least 85% line/branch coverage on the core package and full tests for the critical invariants/evidence discriminator.

- [x] **6. Build the sandbox adapter, persistence, and controlled failures**
      Completed: 2026-09-04. The deterministic in-memory Sandbox adapter now runs registration, shield, private transfer, and withdrawal with simulated note/nullifier-shaped teaching identifiers, honest simulated evidence, stable capability reporting, idempotent successes, abort/cancellation handling, and one-shot controlled prover failures that can be retried safely. The versioned Zustand store uses explicit manual hydration, Zod validation, a supported version-zero migration, JSON-safe bigint serialization, reset isolation, and a narrow persisted slice that excludes wallet sessions and real balances. The exact stored JSON projection was inspected in tests; recreation from the same storage restores Sandbox state while malformed or real-network data is rejected. All 48 workspace tests pass; Lab Core remains above its 85% gate at 97.93% lines and 93.69% branches.
      Spec ref: `technical-specification.md > 5.5 Canonical sandbox fixture`, `6.3 Sandbox adapter`, `11.2 Workbench store`, `11.3 Persistence`, and `16.2 Store and persistence tests`
      What to build: Implement the deterministic Alice/Bob fixture, simulated registration/shield/private-transfer/withdraw transitions, note-shaped teaching identifiers, normalized events, unregistered-recipient failure, prover-unavailable failure, retry behaviour, versioned Zustand persistence, schema validation/migration, controlled hydration, and reset. Persist only sandbox state and safe preferences.
      Acceptance: Changing a supported amount changes balances and resulting events; the documented 100 → shield 50 → transfer 20 → withdraw 10 fixture produces the specified final balances; simulated data cannot qualify as real evidence; refresh restores safe sandbox state; reset never affects wallet/mainnet state; no sensitive/session-only field is persisted.
      Verify: Run canonical flow, failure injection, persistence, migration, hydration, reset, privacy, and evidence-negative tests; manually inspect browser storage; reload and reset the workspace; confirm the UI still labels every sandbox result **Simulated proof**.

- [ ] **7. Connect the sandbox to the timeline, privacy X-ray, and review pause 2**
      Spec ref: `technical-specification.md > 8. Event Model and UI Projection`, `9. Privacy Fact Model`, `11.4 Original design system`, and `15. PRD Epic-to-Component Map > Epic 2` through `Epic 4`
      What to build: Connect workbench controls to the scenario controller; implement actor cards, guided steps, Run All, transaction timeline, coordinated privacy X-ray, simple result copy, Advanced details, error recovery, retry, and reset confirmation; ensure all views project one normalized state source; add purposeful motion and reduced-motion behaviour.
      Acceptance: A visitor can complete the full guided lifecycle, then run the accelerated version; account cards, steps, timeline, X-ray, and details always agree; public deposit/withdrawal and timing limitations are stated; an intentional failure stops dependent actions and suggests a correction; changed inputs do not replay fixed presentation content.
      Verify: Run component/integration tests and the first browser journey; manually exercise guided, Run All, failure, retry, refresh, migration/reset, mobile, keyboard, and reduced-motion paths; **pause for review 2** with the participant and resolve functional/visual feedback before real-mode work continues.

- [ ] **8. Prove developer adoption with Integrate documentation and a separate consumer**
      Spec ref: `technical-specification.md > 15. PRD Epic-to-Component Map > Epic 5`, `19. Deployment > Package adoption`, and `26. Build Milestones > Milestone C`
      What to build: Finalize the `lab-core` public API; create the deliberately small `apps/example` consumer using only public package exports; implement the Integrate route with the shortest install/start path, one private-transfer example, expected result, supported modes, and compatibility statement; add package README, five-minute quickstart, architecture, privacy-boundary, troubleshooting, and contribution documentation.
      Acceptance: The example is visibly separate from the workbench; it imports no web internals; a JavaScript/TypeScript developer can identify how to install/use Lab Core within five minutes; the repository demonstrates reusable infrastructure rather than a single hard-coded frontend.
      Verify: Build and test the example independently; search for forbidden internal imports; follow the quickstart from a clean temporary clone; verify all public documentation links and ensure package exports match documented imports.

- [ ] **9. Implement the supported Wallet API adapter and real-mode safety flow**
      Spec ref: `technical-specification.md > 6.4 Wallet API adapter`, `12. Hosted Route Handlers`, `14.2 Real Wallet API lifecycle`, `15. PRD Epic-to-Component Map > Epic 6`, and `17. Security and Privacy Requirements`
      What to build: Replace the compatibility spike with production wallet discovery, deliberate connection, runtime capability report, network/pool/account preflight, STRK20 balance access, action review, supported Wallet API action mapping, long-running proof/submit/confirm states, user rejection, busy/unavailable service handling, uncertain-state recovery, and a minimal allowlisted public RPC verifier if a secret-backed provider is required. Keep all signing and privacy-sensitive wallet work in the wallet/browser boundary.
      Acceptance: Unsupported wallets fail with an actionable message while sandbox remains usable; no transaction begins on connect or network switch; every real action has a review step; proof preparation, submission, confirmation, cancellation, failure, and uncertainty are distinct; the application never requests or logs keys/viewing material.
      Verify: Run wallet-mock adapter contract tests and the second browser journey; test wrong network, missing capability, rejected request, busy prover, successful submission, revert, and uncertain receipt; audit hosted route allowlists/redaction; perform a supported-wallet manual smoke with minimal value.

- [ ] **10. Execute and verify the mainnet path, then pass review pause 3**
      Spec ref: `technical-specification.md > 13. Mainnet Evidence Model`, `14.4 Evidence publication lifecycle`, `15. PRD Epic-to-Component Map > Epic 7`, and `26. Build Milestones > Milestone D`
      What to build: Implement strict evidence types, receipt/status verification, pool-interaction checks, explorer links, duplicate detection, curated public evidence, `strk20.json` validation, and the Evidence screen; using the supported privacy wallet and minimal amounts, deliberately execute at least three successful Starknet mainnet transactions against the official STRK20 pool—prefer shield, private transfer, and withdraw—and place only verified hashes in repository metadata after manual review.
      Acceptance: Sandbox events and failed/pending/unverified transactions cannot enter the qualifying list; each qualifying record identifies mainnet, action, success, official-pool interaction, transaction hash, and explorer link; `strk20.json` remains valid; the hosted product can demonstrate a genuine STRK20 path without exposing secrets.
      Verify: Run evidence and metadata validators; independently open every explorer link and compare receipt/pool evidence; cross-check against the official pool address; run the real product path; **pause for review 3** before declaring the mainnet requirement complete.

- [ ] **11. Apply the depth gate, finish quality, and make the product release-ready**
      Spec ref: `technical-specification.md > 22. Anonymizer Extension Gate`, `24. Risks and Verification Gates`, and `26. Build Milestones > Milestone E`
      What to build: Evaluate every anonymizer gate. If all pass, add exactly one reviewed anonymizer action/example with accurate public/private facts and tests; if any gate fails, document the evidence-based deferral and spend the remaining effort on wallet reliability, privacy wording, accessibility, responsive behaviour, CSP, RPC restrictions, dependency/security review, performance, and failure recovery. Complete the compatibility manifest and public deployment.
      Acceptance: The optional anonymizer never destabilizes the required private-transfer/mainnet product; the deployed URL works without authentication; the primary path remains usable on the target laptop; security and privacy claims match upstream behaviour; CI is green; the repository has no secrets, missing licence, broken links, or unsupported claims.
      Verify: Run the complete CI suite, production smoke, accessibility checks, responsive checks, dependency/secret review, privacy claim review, and a clean-clone five-minute adoption test; verify hosted health/build/compatibility identifiers; test sandbox behaviour during simulated RPC or wallet unavailability.

- [ ] **12. Prepare the final GitHub sprint handoff and submission evidence**
      Spec ref: `technical-specification.md > 27. Demo and Submission Flow` and `product-requirements.md > Submission Proof Points`
      What to build: Finalize the README's thirty-second pitch, problem, architecture, quickstart, screenshots, live URL, mainnet evidence, privacy boundaries, limitations, team credits, licence, and contribution path; record a truthful three-minute demo following the approved wow-moment sequence; add the video link, demo URL when needed, verified transactions, and deployed contract addresses to root `strk20.json`; confirm the public repository's Website/deployment metadata; prepare a concise handoff summary for judges and future contributors. Do not open a second registry PR because no final submission PR exists.
      Acceptance: The public URL, source, video, quickstart, licence, team, contract addresses, and at least three verified mainnet pool transactions are easy to find; a judge understands the product within thirty seconds; every claim can be verified from the repository or explorer; `strk20.json` contains no placeholder presented as complete; the repository state alone represents the final entry.
      Verify: Run all CI and metadata validators from a clean clone; test every public link in an incognito browser; watch the video against the three-minute flow; ask a fresh reviewer the five thirty-second questions; compare the final repository to all sprint requirements and judging criteria; confirm no unmerged required PR remains.

## Parallel Work Boundaries

The second builder can safely receive pull requests for:

- isolated introduction/documentation sections after design tokens exist;
- status, evidence, empty-state, or error-display components with supplied props/tests;
- documentation and quickstart verification;
- responsive/accessibility fixes;
- test cases against already-approved public interfaces.

The second builder should not independently change:

- scenario invariants;
- adapter contracts;
- wallet dependency versions;
- mainnet/pool configuration;
- evidence qualification rules;
- security boundaries;
- global design direction.

Those changes require an issue-level decision and primary review before implementation.

## Checklist Completion Rule

An item is complete only when its acceptance criteria and verification pass. A visually finished screen with mocked logic does not complete a core/integration item, and a working transaction without privacy/error UX does not complete the product item.

The autonomous build may continue through ordinary test failures and implementation corrections. It pauses for the participant at the three named review gates, for missing external credentials/usernames, before opening the registration PR, before spending real mainnet funds, and before publishing final submission claims.
