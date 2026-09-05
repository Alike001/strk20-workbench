# STRK20 Toolkit Landing Fidelity Ledger

Date: 2026-09-05
Status: Agency-signoff fidelity achieved

## Accepted concept references

- `context/design/strk20-toolkit-hero-concept.png`
- `context/design/strk20-toolkit-middle-concept.png`
- `context/design/strk20-toolkit-proof-concept.png`
- `context/design/strk20-toolkit-mobile-concept.png`

## Concept-to-browser comparison

| Fidelity point         | Browser result                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Protocol header        | Preserves the STRK[20] Workbench wordmark, five navigation destinations, and orange **Start building** action.           |
| Hero hierarchy         | Preserves the condensed uppercase product promise, plain-language support copy, and primary/secondary adoption actions.  |
| Architecture visual    | Preserves the code-and-stack split, Core → Wallet API → React layering, action nodes, and dual environment status rail.  |
| Package rail           | Preserves the four-package infrastructure story while adding explicit readiness labels.                                  |
| Toolkit layers         | Preserves the numbered Core, Wallet API, and React sequence, responsibilities, code samples, and restrained rail layout. |
| Quickstart             | Preserves the terminal/code and private-lifecycle split using commands and React props that exist in this repository.    |
| Mainnet path           | Preserves Sandbox → Wallet check → Action review → Proof + submit → Verified receipt and the private/public boundary.    |
| Evidence and close     | Preserves the three-action evidence table and final infrastructure CTA without presenting placeholder hashes as proof.   |
| Responsive composition | Preserves the vertical mobile architecture and package/layer flow with no page-level overflow at 390px.                  |

## Intentional deviations

- The concept's `@strk20-workbench/core` label became the real package name, `@strk20-workbench/lab-core`.
- Package rail items gained **Workspace ready**, **Extracting next**, and **Planned** states because the packages are not all published or extracted.
- Concept code using imagined `Core` and `WalletClient` constructors was replaced with the repository's real `SandboxAdapter`, Wallet API method, and controlled `PrivateTransfer` props.
- Evidence rows remain **Pending first mainnet run / Not verified yet** until independently verified mainnet receipts exist.
- The browser uses the repository's existing display and monospace stacks instead of embedding a new third-party font dependency.

## Browser acceptance

- Desktop: 1536×1024, no horizontal overflow, all five product sections rendered.
- Mobile: 390×844, no horizontal overflow, full evidence section accessible.
- Console: no errors during the desktop/mobile inspection.
- Navigation: the Playground CTA resolves to `/workbench`; Components, Docs, Evidence, and GitHub remain present.
- Automated coverage: `tests/e2e/homepage.spec.ts` protects the 30-second pitch, truth labels, evidence state, CTA target, and mobile overflow.

## Copy diff

The hero headline and supporting sentence match the accepted concept. All differences below the hero are additions for current-state accuracy: package readiness, real API examples, and explicit unverified evidence. No concept copy was changed for tone alone.
