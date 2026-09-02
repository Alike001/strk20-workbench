# Compatibility

The machine-readable candidate matrix lives in [`config/compatibility.json`](../config/compatibility.json). It is intentionally marked `candidate` until the browser wallet spike has verified a complete package and wallet combination.

## Confirmed direction

- Node.js 24 and pnpm 10 for the workspace.
- Next.js 16 with Webpack for the initial wallet-integration path.
- Starknet Wallet API for genuine user-facing STRK20 actions.
- No private keys, viewing keys, discovery requests, or proving requests handled by the hosted application.
- Privacy SDK examples are reference material only unless the product later adds a clearly separate key-holding operator mode.

## Compatibility gate still open

Before real-mode UI is treated as supported, the team must record:

1. the privacy-enabled wallet and extension version;
2. the advertised Wallet API versions;
3. exact `starknet` and get-starknet package versions;
4. successful capability detection without reading private balances;
5. a minimal prepare/invoke result on the selected public network;
6. the current wallet, prover, discovery, pool, and audit assumptions.

The sandbox does not depend on this gate and must remain usable if real mode is unavailable.
