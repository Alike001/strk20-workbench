# STRK20 Security and Trust Context

This document records the security properties and caveats stated by the public source. It is not an independent audit or a safety endorsement.

## What the contract attempts to enforce

- Only proof-backed action sequences with the expected virtual-OS program/version are accepted.
- The action message hash must match the proof facts.
- The proof base block must predate the applying block and remain inside a governance-configured validity window.
- Token value must balance across compiled nominal deposits, notes, withdrawals, and external calls.
- Note/nullifier state is write-once, preventing replay and double-spending.
- `apply_actions` and open-note deposits are pausable.
- `apply_actions` is protected by an OpenZeppelin reentrancy guard.
- Administrative operations use role-based access control.

## Privileged roles

The contract and audit identify the following authority surfaces:

| Role/capability | Publicly described power |
|---|---|
| Governance admin | Manages roles and contract upgrades. |
| Security governor | Controls auditor and screener public keys. |
| App governor | Controls fees, collector, proof-validity window, and open-note screening policy. |
| Auditor | Can decrypt registered viewing-key material and withdrawal-related data; cannot spend funds solely through that capability. |
| Proving service | Executes client actions offchain and returns proofs; can affect availability and observe proving requests. |
| Discovery operator | Receives discovery requests and request keys unless protected by the intended metadata-separation design. |
| Paymaster/relayer | Submits transactions and can observe submission-level metadata. |
| Screening operator | Screens selected deposit/interaction addresses and can reject or fail requests. |

The OpenZeppelin audit states governance could upgrade or change parameters without an onchain delay at the audited snapshot.

## Privacy boundaries

### Intended to be hidden inside the pool

- sender-to-recipient linkage;
- private note amounts and token details;
- the particular notes consumed by a transfer;
- private channel/subchannel information;
- the direct link between a user's main wallet and a properly relayed private action.

### Still observable or inferable

- that the pool was interacted with;
- public token transfers at deposit/withdraw boundaries;
- deposit and withdrawal amounts;
- timestamps and ordering;
- public DeFi calls and their amounts;
- relayer, RPC, network, browser, and service metadata;
- bridge burns/mints, destinations, amounts, domains, and timing;
- unusually distinctive amounts or low-volume anonymity sets.

An OHTTP relay mitigates a specific metadata join: it separates the client's IP from the request contents when relay and destination do not collude. It does not hide onchain amounts or timing.

## Audit snapshot

OpenZeppelin's 2026-05-29 report covered only these V1 Cairo contract files at commit `c5e2fb5`:

```text
packages/privacy/src/
├── actions.cairo
├── errors.cairo
├── events.cairo
├── hashes.cairo
├── interface.cairo
├── lib.cairo
├── objects.cairo
├── privacy.cairo
└── utils.cairo
```

| Severity | Found | Marked resolved in report |
|---|---:|---:|
| Critical | 0 | 0 |
| High | 0 | 0 |
| Medium | 2 | 2 |
| Low | 5 | 1 |
| Informational | 4 | 3 |
| Total | 11 | 6 |

### Findings marked resolved

- Invalid auditor public keys could stop registration and withdrawals.
- Auditor-key rotation could break continuous audit visibility.
- Invalid public keys produced generic panics.
- Viewing-key mutability comments contradicted write-once registration.
- Sensitive role checks were still marked as TODO.
- A salt-type inconsistency was marked resolved in the summary count/report notes.

### Findings not marked fully resolved in that report

- Signature validation occurred after expensive client-action compilation.
- Nominal token accounting did not safely model fee-on-transfer or rebasing tokens.
- Reusing an ECDH ephemeral secret could reveal channel information; the current SDK generated fresh randomness, making this a defense-in-depth concern in the audited model.
- `pack` did not enforce a 120-bit boundary at the encoding function itself; the team indicated it would resolve this.
- Some hash constructions used reserved slots inconsistently without documented rationale.

These statuses describe the audit report, not necessarily the latest `main` branch. Each item requires commit-level verification before concluding whether it remains present.

## Offchain and operational risks documented in source

### Prover availability and observation

Users need a compatible prover to produce normal private transactions. The audit says the service can be run by any party, but public availability of code does not prove that independent production providers exist. A prover can observe submitted material, delay it, reject it, or become unavailable.

### Discovery request sensitivity

The discovery service needs key material sufficient to locate/decrypt relevant state. Its README says keys are supplied per request and are not stored. The separate privacy-bridge threat model warns that a raw viewing key sent to an indexer can be correlated unless a privacy wrapper or trusted operator is used.

### OHTTP non-collusion

Metadata privacy assumes the relay and service do not collude and do not keep joinable logs. Pinning gateway key configuration also matters because runtime key discovery can introduce a trust-on-first-use risk.

### Screening configuration

The proof-interceptor README highlights several deployment-sensitive risks:

- Missing `SCREENING_URL` makes the interceptor a no-op pass-through while health checks still succeed.
- Interceptor-side and prover-side fail-open settings are separate.
- ABI drift can prevent deposit recognition.
- The listener has no application-layer client authentication; network isolation is the boundary.
- Only selected addresses are screened according to the current policy path.

### Governance and upgradeability

The contract is upgradeable and role-governed. Real risk depends on the production role holders, key custody, multisig policy, timelocks, monitoring, and incident process, none of which are established by the public repository snapshot.

### Token compatibility

The audited accounting model assumes value-preserving ERC-20 behavior. Fee-on-transfer and rebasing tokens can break the relationship between nominal notes and actual pool balance. “Any ERC-20” should therefore be read as a protocol aspiration/interface claim, not evidence that every unusual ERC-20 behavior is economically safe.

## Bridge-specific leakage

The `privacy-bridge` threat model calls out:

- amount correlation as an accepted P0 issue pending denomination/bucketing work;
- small early-user anonymity sets;
- timing links across withdraw, burn, attestation, mint, return, and cash-out;
- re-linking when a user cashes out to a known address;
- public commitments connecting the two halves of a CCTP return;
- exposure to Circle, RPC providers, AVNU, WalletConnect/Reown, the pool auditor, and service operators;
- localStorage compromise revealing history/linkage even where spend keys are not stored.

Consequently, “unlinkable” claims depend on correct use of fresh destinations, paymaster configuration, funds resting in the pool, anonymity-set size, amount patterns, and operator behavior.

## Questions to answer before production use

1. What exact pool class and commit are deployed?
2. Who controls each privileged role, and is a timelock or multisig used?
3. Which tokens are allowlisted and tested for accounting compatibility?
4. Who operates the auditor, prover, discovery service, relay, screening proxy, and paymaster?
5. What metadata does each operator log, for how long, and under what disclosure policy?
6. Has the currently deployed version received an audit covering the full onchain and offchain system?
7. What are the actual anonymity-set and amount-correlation characteristics of current usage?
8. Is there a documented recovery path for unavailable provers, discovery services, auditor-key events, or paused/upgraded contracts?

