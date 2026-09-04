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
