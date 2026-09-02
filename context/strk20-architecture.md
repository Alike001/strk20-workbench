# STRK20 Implementation Architecture

Primary source snapshot: [`starknet-privacy@bc75e4b`](https://github.com/starkware-libs/starknet-privacy/tree/bc75e4bac71ad0ce10c6e63effc33b5b25131a4f).

## System view

```text
User wallet
  └─ signs and submits through Starknet account / optional paymaster
       ↓
TypeScript SDK
  ├─ discovers notes and channels
  ├─ selects input notes and creates change
  ├─ compiles ordered private actions
  └─ requests a proof
       ↓
Transaction prover ── optional proof-interceptor ── Elliptic screening
  ├─ runs actions in a virtual Starknet block
  └─ returns validity proof + proof facts
       ↓
Starknet proof validation
       ↓
Privacy pool account contract
  ├─ validates proof facts
  ├─ applies write-once state updates and nullifiers
  ├─ moves public ERC-20 tokens at deposit/withdraw boundaries
  └─ may invoke one external anonymizer per transaction
       ↓
Ekubo / Vesu / shadow account / bridge integration
```

Separately, the discovery service reads encrypted pool storage through Starknet RPC and helps the wallet locate its state.

## Repository layout

| Path | Language | Responsibility |
|---|---|---|
| `packages/privacy/` | Cairo | Privacy-pool account contract and protocol source of truth. |
| `packages/ekubo_swap_anonymizer/` | Cairo | Single-hop Ekubo swap adapter. |
| `packages/vesu_lending_anonymizer/` | Cairo | Vesu vault/lending adapter. |
| `packages/shadow_account_anonymizer/` | Cairo | Private sub-account interaction adapter. |
| `sdk/` | TypeScript | Main wallet/integration SDK and transaction builder. |
| `client/` | TypeScript | Additional client package built on the SDK. |
| `crates/discovery-core/` | Rust | Slot computation, traversal, cryptography, and test backend. |
| `crates/discovery-service/` | Rust | HTTP service for note/channel discovery. |
| `proof-interceptor/` | TypeScript | Prover-side transaction screening sidecar. |
| `elliptic-proxy/` | TypeScript | HMAC-authenticated adapter to the Elliptic AML API. |
| `demo/` | React/TypeScript | Developer-facing pool explorer. |
| `e2e/` | TypeScript/Cairo | Devnet and integration scenarios. |
| `lean/` | Lean | Formal-verification work. |
| `docs/audit/` | PDF/Markdown | Published audit material. |

## Onchain action model

The contract compiles client actions into server actions. Client actions must be ordered by phase:

| Phase | Action | Meaning |
|---:|---|---|
| 0 | `SetViewingKey` | First-time registration; immutable after the write-once storage entry is created. |
| 1 | `OpenChannel` | Create a sender-to-recipient channel. |
| 2 | `OpenSubchannel` | Create a token-specific lane inside that channel. |
| 3 | `Deposit` | Bring public ERC-20 value into the pool accounting. |
| 4 | `UseNote` | Spend an existing note and create its nullifier. |
| 5 | `CreateEncNote` | Create a private encrypted note. |
| 5 | `CreateOpenNote` | Create an unencrypted placeholder whose amount will be filled later. |
| 6 | `Withdraw` | Send token value out of the pool. |
| 7 | `InvokeExternal` | Call one external integration contract. |

Atomic token-balance conservation is checked across the compiled action set before actions are applied.

## Cryptographic data model

- **Viewing key:** the private key used by a wallet to discover/decrypt its state and derive its public registration key. At registration, an encrypted copy of the private key is stored for the configured auditor.
- **Channel:** a unidirectional sender-to-recipient relationship. ECDH-derived material is encrypted for the recipient.
- **Subchannel:** a token-specific lane within a channel. Token details are encrypted.
- **Encrypted note:** a UTXO-like value record. Its amount is masked using Poseidon-derived key material; ownership/spendability is bound to channel and key data.
- **Open note:** a placeholder for an amount that is unknown until an external action completes, such as a swap, bridge transfer, or lending interaction.
- **Nullifier:** a deterministic spent marker derived from private note data. Revealing it prevents a second spend without revealing the original note link directly.
- **Proof facts:** validated metadata from the proved virtual execution, including program/version and the action message hash expected by the pool contract.

The contract README states that hashes use Poseidon with domain-separation tags and encryption uses ECDH with ephemeral keys.

## Registration and key lifecycle

The current contract implementation documents registration as first-use only. Its `set_viewing_key` implementation creates write-once entries for:

- the user's public key; and
- the user's private key encrypted to the auditor's current public key.

The repository's contract README line saying “register or replace viewing key” is inconsistent with the implementation comment and write-once behavior. The implementation and the audit's corrected documentation support immutability.

## Proving lifecycle

The SDK's documented sequence is:

1. Refresh discoverable notes/channels or load a consistent discovery snapshot.
2. Select input notes and build the desired action chain.
3. Choose a finalized proving base block.
4. Ask the transaction prover to execute the client actions in a virtual Starknet environment.
5. Receive proof material and proof facts.
6. Build and sign the Starknet transaction.
7. Submit directly or through a paymaster.
8. Wait for acceptance before using the returned optimistic registry or rediscovering state.

The SDK says the prover reads finalized state and documents a ten-block acceptance/age rule. Recently deployed accounts, funded balances, spent nullifiers, and previous private transactions may need to age into the prover's usable base state before the next proof.

## Discovery lifecycle

Two discovery providers are documented:

- `ContractDiscoveryProvider`: direct Starknet RPC access, intended mainly for development/testing.
- `IndexerDiscoveryProvider`: HTTP discovery service with pagination and reorg detection, recommended by the repository for production.

Despite the SDK class name “Indexer,” the Rust service README describes the current service as stateless and RPC-backed, with no local database. It traverses contract storage and filters/decrypts request-scoped results.

Optional OHTTP support puts a relay between client and discovery/prover service:

- the relay can see the client IP but not the encrypted request body;
- the service can see the request body but not the original client IP;
- privacy depends on the relay and service not colluding and not retaining joinable logs.

## External DeFi invocation

The transaction builder allows at most one external invocation per transaction. A common pattern is:

1. consume a private input note;
2. withdraw its value to an anonymizer;
3. call the external protocol through the anonymizer;
4. deposit the returned asset into an open note;
5. bind the resulting note to its private recipient.

The monorepo includes concrete adapters for Ekubo swaps, Vesu lending, and shadow accounts. App-side action details and amounts may remain public even when the main user's identity link is hidden.

## Compliance screening path

For screening-enabled deployments:

```text
SDK proof request
  → transaction prover
      → proof-interceptor sidecar
          → elliptic-proxy
              → Elliptic AML API
```

On an allowed deposit, the screening service returns a Stark-curve signature over the depositor address. The prover passes it back as additional data, and the SDK includes it in the contract call so the pool can verify it onchain.

The proof-interceptor README documents configuration-sensitive bypass and fail-open behavior. Screening is therefore not a property of the source code alone; it depends on the deployed pool policy, compatible ABI, environment variables, prover settings, and network isolation.

## Version snapshot

| Component | Documented compatible revision |
|---|---|
| SDK | `PRIVACY-0.14.3-RC.6` |
| Proof interceptor | `PRIVACY-0.14.3-RC.6` image/tag family |
| Transaction prover | `PRIVACY-0.14.3-RC.2` image |
| Discovery service | `PRIVACY-0.14.3-RC.2` image |
| Pathfinder | `v0.22.7` |
| SDK package version | `0.14.3-rc.6` |
| Starknet.js in SDK | `10.5.0` |
| Cairo workspace dependency | `2.17.0` |
| OpenZeppelin Cairo dependency | `3.0.0` |

Use the compatibility row from the repository release being deployed. Do not assume all current default branches are mutually compatible.

