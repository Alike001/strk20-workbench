# Product Planning Notes

## 2026-09-02 — Scope

- The participant chose infrastructure rather than a crowded end-user application category.
- The product must be a real reusable product, specifically related to STRK20, and understandable within thirty seconds.
- The preferred visual direction combines a serious engineering control room with an approachable learning experience.
- CDR Kit is a developer-product and frontend-quality reference; ZK Freighter is a privacy-clarity and evidence reference.
- The participant emphasized that the frontend should be understandable at first glance.
- Two builders are involved. The participant and Codex will handle most core work and review the teammate's pull requests before merging.
- Reported availability was interpreted as five to seven hours per builder per day.
- The primary workflow must run on an 8 GB RAM laptop without Docker.
- Broad research was considered sufficient; only narrow upstream compatibility confirmations remain.
- Deepening rounds: one, covering product-versus-demo, thirty-second comprehension, hosted/local operation, laptop constraints, and reference-project influence.

## 2026-09-02 — Product Requirements

- The participant delegated detailed behaviour choices to the recommended defaults: “yes give the best.”
- First use is guided step-by-step; accelerated **Run all** follows.
- The signature product moment combines an animated private-transfer timeline with a privacy X-ray.
- Simple explanations are the default; advanced evidence remains available.
- The hosted sandbox requires no wallet, account, funds, Docker, or heavy local services.
- Real mode uses intentional wallet connection and preserves an explicit boundary from simulation.
- Connect Project means guided package adoption and a reference application in the first version, not repository import.
- Sandbox state persists locally and can be reset without affecting a real wallet.
- The anonymizer remains a depth-enhancing extension after the central real-network transfer is reliable.
- Deepening rounds: zero additional rounds; the participant requested the recommended product behaviour.

## 2026-09-02 — Technical Specification

- The participant approved the proposed one-core, adapter-based architecture: “use this architecture.”
- The selected structure is a pnpm workspace with a Next.js workbench, framework-neutral `lab-core`, and a deliberately small separate example consumer.
- Docker, a database, authentication, local devnet, local discovery, and local production proving remain outside the required path.
- Sandbox and real Wallet API modes share scenario contracts but use discriminated execution/proof states and separate evidence rules.
- Wallet operations stay in the browser; hosted routes handle only allowlisted public RPC verification and curated evidence.
- Zustand persistence is versioned, partial, validated, and sandbox-only; real wallet state is rediscovered rather than restored as truth.
- The main technical gate is real supported-wallet capability, followed by evidence verification. An anonymizer begins only after those gates pass.
- The first-release “one command” is the repository's lightweight `pnpm dev`; a global CLI is explicitly deferred.
- The architecture was self-reviewed for example-app cost, RPC-proxy risk, wallet uncertainty, and CLI scope creep.
- Deepening rounds: one architecture proposal and approval, followed by a specification self-review.

## 2026-09-02 — Build Checklist

- The participant confirmed autonomous planning/build with three review pauses and milestone commits.
- Review pauses are: first polished frontend/30-second test; complete sandbox timeline/X-ray; supported wallet/mainnet evidence.
- The approved wow moment combines the animated Alice-to-Bob transfer, privacy X-ray, and transition from simulated mode to verified mainnet evidence.
- The wallet/package compatibility spike is deliberately scheduled before polished real-mode UI because it is the largest technical unknown.
- Identity, repository creation, first commit, STRK20 skill installation, and the team's single registry PR are explicit early tasks.
- The registration repository is never used as the project repository, and CDR Kit/ZK Freighter are references rather than project forks.
- The anonymizer is conditional on six gates and cannot destabilize the required mainnet path.
- Teammate work is restricted to bounded PRs unless architecture/security changes are discussed first.
- The final task is adapted to the STRK20 GitHub-only handoff: repository state and `strk20.json`, not a second submission PR.
- Deepening rounds: none on the delegated path; final participant gut-check remains before build execution.

## 2026-09-02 — Build Execution

- Build execution began after the participant confirmed the accepted architecture and asked to continue.
- The selected product name is **STRK20 Workbench**, with repository name `strk20-workbench`.
- The name was selected for immediate judge comprehension and checked against the current sprint registry, npm, GitHub repository search, and general web results; no exact software-project collision was found at selection time.
- Names centered on “Veil” were avoided because that word is already heavily represented among sprint projects.
- The initial local repository surface contains an honest product README, MIT licence, secret-safe `.gitignore`, and empty valid `strk20.json`.
- The public project repository is `https://github.com/Alike001/strk20-workbench`; the team's single registry PR is intentionally paused until both exact Telegram usernames are available.
- The four sprint skills were installed project-locally and audited before use. Their only executable is a read-only network freshness checker; its 2026-09-02 quick run found no checked drift and one terminology warning.
- The skills confirm the Wallet API as the real-mode route. The hosted product will not hold viewing keys or use the low-level Privacy SDK as its normal user path.
- The lightweight pnpm workspace, Webpack-based Next.js shell, framework-neutral Lab Core package, separate example consumer, compatibility manifest, and CI are established.
- Local gates pass: frozen install, lint, typecheck, two initial tests, formatting, and production build. Dependencies occupy about 501 MB; the first compiled development request used about 1.0 GB RSS across the project processes, which fits the 8 GB laptop constraint without Docker.
- The team's only registration PR was opened as `starkience/strk20-hackathon#270` with Telegram usernames `IamAlikeX` and `agbacoder01` and category `Infra`.
- Upstream automation validated and applied the registration to `main` as commit `fca520f`, then closed the PR by design to avoid concurrent registry conflicts. Registration is complete; no second registry PR should be opened.

## 2026-09-04 — Wallet compatibility spike

- Context7 was consulted for Starknet.js, but its indexed examples stopped at the older Wallet API generation; current v6/v10 behaviour was therefore verified from official upstream source and package metadata.
- The upstream starter matrix (`starknet@10.4.0`, discovery and wallet standard `6.0.2`, types `0.10.3`) completed a clean install and Webpack production build. Replacing only Starknet.js with `10.5.0` also completed the build.
- The project selected exact candidate pins `10.5.0` / `6.0.2` / `6.0.2` / `0.10.3`. Starknet.js 10.7.1 was not selected because it advances to prerelease Wallet API 0.10.4 types.
- A hidden compatibility route now discovers only after a user click and connects only after a second explicit wallet choice. It reports safe feature/version data without requesting STRK20 balances, preparing proofs, or submitting transactions.
- Frozen-compatible install, lint, typecheck, five tests, and the Next.js 16.2.9 Webpack build pass. A wallet-free browser scan also passes; the real Ready/Xverse connection and four Telegram answers remain external gates, so checklist item 3 stays open.
- Team parallelism was refined: the second builder receives only prop-driven, isolated frontend components with explicit file boundaries while the primary branch owns architecture, wallet dependencies, global styles, and integration.

## 2026-09-04 — Product shell candidate

- A corrected image-generated product concept established the visual specification: an approachable engineering control room, dark graphite surface, cyan-teal primary accent, restrained amber privacy state, editorial sans typography, and precise monospaced technical chrome.
- The first concept's inaccurate public-Bob implication was rejected. The accepted reference accurately labels public deposit and withdrawal edges while keeping sender, recipient, amount, token, and spent notes hidden for the in-pool transfer.
- The implementation adds the Introduction, Workbench, Integrate, Evidence, and Documentation route shells with a persistent `Sandbox · Simulated proof` boundary and no automatic wallet request.
- The homepage states the developer value proposition, provides the two required actions, demonstrates the private-transfer/X-ray relationship, and maps one scenario through Sandbox, Wallet API, and Mainnet evidence.
- Evidence remains truthful at zero verified mainnet transactions, and the Integrate page labels the package as workspace-only rather than pretending it is published.
- Playwright was used because no separate in-app Browser tool was available. Desktop 1536×1024 and mobile 390×844 renders were inspected against the concept; the headline wrap and canvas alignment were corrected, all five routes loaded, and the mobile document width matched the viewport.
- Teammate issue `#3` gives `Webghost01-NG` a reusable `EnvironmentStatus` component in four isolated files. It prohibits edits to pages, global styles, wallet code, dependencies, and architecture so parallel work remains merge-safe.
- Review pause 1 remains open for the participant's thirty-second comprehension and visual-direction check.

## 2026-09-05 — Component-kit product refinement

- The participant clarified that the infrastructure itself is the exciting product, but the frontend must make that infrastructure understandable to technical and non-technical visitors within thirty seconds.
- The refined thesis is: **ready-made STRK20 private-transfer building blocks, with a safe playground where builders can try them before adding them to an app**.
- The CDR Kit influence remains product structure and developer clarity—not copied visuals. The playground is the showroom, reusable components are the product, and Lab Core is the engine underneath.
- The official STRK20 near-black, raised graphite, white, and single orange accent palette is now used. Protocol color creates immediate ecosystem recognition while the information hierarchy stays simpler and friendlier than the upstream documentation.
- Three accepted visual references live in `context/design/`: landing, building blocks, and guided playground. The implementation was compared at 1536×1024 and 390×844 using Playwright with system Chrome because the in-app browser was unavailable.
- Registration is now automatic first-use setup in the guided Sandbox rather than a visible fourth product step. Protocol events, failure injection, and advanced evidence remain available under **Developer details**.
- The homepage does not claim that `@strk20-workbench/react` is already shipped: its code preview is explicitly labelled **Planned React API**, and package delivery is the next checklist milestone.

## 2026-09-05 — React component package and teammate split

- Review pause 2 was accepted when the participant approved the refined design and asked to continue.
- Teammate issue `#7` gives `Webghost01-NG` the Components/Integrate page with strict file boundaries. Their GitHub access is read-only, so the issue mention is the assignment signal and their PR will come from a fork as before.
- The primary branch owns the new workspace-only `@strk20-workbench/react` package and its public API: Shield, PrivateTransfer, Withdraw, FlowProgress, and PrivacyFacts.
- Action components are controlled rather than pretending to be a wallet. The consumer supplies the execution callback and must choose `sandbox` or `real`; built-in copy preserves that truth boundary.
- The independent example is now a lightweight Vite application. Context7's current Vite guidance was checked before configuration, and exact Vite/plugin versions were verified against package metadata.
- The initial consumer typecheck correctly failed until the React package declarations were built first. The root typecheck now builds Lab Core and the React package before checking dependents, matching an external consumer boundary.
- Desktop 1536×1024 and mobile 390×844 renders were inspected against the accepted playground concept using Playwright with system Chrome. An 18 px mobile overflow was found and fixed; the complete Shield → Send privately → Withdraw interaction passed.
- Teammate PR `#8` stayed inside the assigned page/component/test boundaries. Primary review merged the new package milestone into the branch, changed the stale **In development** status to **Workspace ready**, removed three unapproved eyebrow labels, and approved the result after local and remote checks passed.
- The merged Components page was completed with a code/quickstart panel taken from the accepted building-blocks concept. It shows the real workspace import, stylesheet import, controlled props, frozen install, and separate consumer command without claiming npm publication.
- A fresh shallow clone completed installation, built `@strk20-workbench/react`, built the Vite consumer, and returned no Workbench-web internal imports. Checklist item 8 is complete.

## 2026-09-05 — Wallet API production foundation

- Teammate issue `#9` assigns `Webghost01-NG` a prop-driven wallet-readiness panel with six explicit states and four-file boundaries. Wallet dependencies, adapters, pages, global styles, and transaction logic remain primary-branch responsibilities.
- The STRK20 Wallet API skill and bundled upstream pages were reread before implementation. Context7 was also queried; its indexed Starknet.js guide still showed WalletAccountV5, so the installed Starknet.js 10.5.0 declarations and the verified STRK20 reference were used for the WalletAccountV6 surface.
- Production wallet discovery is passive, while connection requires an explicit function call following a user wallet choice. The safe session records wallet, chain, API, and RPC-spec metadata but never asks for viewing or private keys.
- The real adapter maps Workbench shield/private-transfer/withdraw actions to the published deposit/transfer/withdraw Wallet API actions. It intentionally rejects a standalone register action because Wallet API `0.10.3` does not expose one. A first-time account must shield once from the privacy wallet's own screen; Workbench detects `NOT_REGISTERED`, explains that boundary, and rechecks without handling viewing keys or automatically resubmitting an action.
- Capability detection never reads private balances. Balance reads are a separate consent-gated method. Execution uses the wallet's combined prove-and-submit call, emits normalized lifecycle events, classifies stable errors, and prevents resubmission while a submitted transaction is uncertain. The separate prepare method remains capability-checked but is not placed in front of a normal shield.
- Ready X `5.33.9` reviewed a 1 STRK shield as `-1.0 STRK`, `+0.0 [STRK]`, with 6 STRK reserved for the privacy fee; the user rejected before submission. The builder now treats shield input as the gross public deposit, subtracts the live fee to show the expected private increase, and blocks deposits that cannot leave a positive private amount. Transfer and withdrawal fee previews still show amount plus fee as the required private balance.
- A server-only `/api/starknet` route accepts four read-only allowlisted JSON-RPC methods, caps payload size, enforces a timeout, and keeps `STARKNET_RPC_URL` out of browser output. The receipt verifier maps succeeded, reverted, pending, not-found, and unavailable states.
- The hosted Workbench now has an explicit real-wallet gateway. Discovery is passive; the user chooses a wallet before connection; capability checks do not read private balances or prepare proofs; readiness requires mainnet, Wallet API methods, the reviewed pool, and receipt verification. With no compatible wallet, the UI explains the blocker and keeps Sandbox usable.
- The real-action controller is intentionally independent of React presentation. It requires a reviewed action and idempotency key before calling the adapter, deduplicates concurrent confirmation requests, maps wallet/prover/submission events into explicit UI phases, and polls uncertain hashes without ever resubmitting them.
- Twenty-three focused adapter, session, proxy, and verifier tests pass alongside typecheck and lint. Malformed wallet-version advertisements are rejected, prerelease semantic versions are compared correctly, and submission timeouts are cached as uncertain rather than exposing a duplicate-send retry. Real-mode UI integration and the supported-wallet manual gate remain open, so checklist item 9 is not complete.

## 2026-09-05 — Reviewed action and public evidence pipeline

- The teammate's real-action review panel was integrated with the Wallet API controller and extended with a truthful cancelled state. Decimal token input is converted to base units without floating-point arithmetic, and private-transfer recipients can be supplied as direct Starknet addresses.
- Receipt success and verified STRK20 evidence are deliberately separate. A successful transaction is not labelled STRK20 evidence until public receipt events include the normalized official pool address.
- The Evidence page now reads only repository-curated action metadata whose hashes also exist in `strk20.json`, verifies each public receipt through a server-only RPC endpoint, rejects padded-form duplicates, and filters out sandbox or non-mainnet records again at the UI boundary.
- `evidence/mainnet.json` holds only action/hash/timestamp metadata. The new submission validator checks the four required `strk20.json` fields, felt formats, HTTPS links, duplicate values, and exact correspondence with reviewed evidence metadata; a stricter final mode requires three unique hashes and a demo video.
- Teammate PR #16 added the evidence receipt card. Review corrected its privacy language so a requested private action is caller context rather than a public receipt field.
- Teammate PR #18 added the submission readiness panel. Review made transaction counts fail closed and restricted rendered external links to HTTPS before merge.
- The integrated codebase passes 180 unit/component tests, 96.54% Lab Core statement coverage, production builds for both apps, and five Playwright journeys including the responsive repository-evidence page.
- No local RPC credential is configured. Real evidence remains correctly unverified until a server-only mainnet RPC URL is added to the host and the team performs the supported-wallet mainnet smoke.
