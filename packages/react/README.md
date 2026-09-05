# @strk20-workbench/react

Reusable, controlled React components for understandable STRK20 privacy flows.

The package is currently workspace-only and is not published to npm. It supplies the user interface; the consuming application supplies the Sandbox or supported-wallet execution callback.

## Workspace quickstart

```tsx
import { useState } from "react";

import { PrivateTransfer } from "@strk20-workbench/react";
import "@strk20-workbench/react/styles.css";

export function Payment({
  onPrivateTransfer,
}: {
  onPrivateTransfer: (amount: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState("20");

  return (
    <PrivateTransfer
      amount={amount}
      mode="sandbox"
      onAmountChange={setAmount}
      onSubmit={() => onPrivateTransfer(amount)}
      recipientLabel="Bob"
      senderLabel="Alice"
    />
  );
}
```

## Public components

- `Shield`
- `PrivateTransfer`
- `Withdraw`
- `FlowProgress`
- `PrivacyFacts`

Every action requires an explicit `mode`. Sandbox copy always says that tokens and results are simulated. Real mode says that execution is requested through a supported STRK20 wallet; it never presents the component itself as a wallet or proof system.
