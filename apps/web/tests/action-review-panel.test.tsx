import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  ActionReviewPanel,
  type ActionReviewPanelProps,
  type RealActionStatus,
} from "../components/action-review";

interface ButtonProps {
  children?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

const baseProps: ActionReviewPanelProps = {
  action: "private-transfer",
  tokenSymbol: "STRK",
  tokenAddress: "caller-supplied-token-address",
  amount: "25",
  recipientLabel: "Bob",
  recipientAddress: "caller-supplied-recipient-address",
  networkLabel: "Starknet Mainnet",
  poolFee: "Shown by wallet before approval",
  status: "review",
  onConfirm: () => undefined,
  onCancel: () => undefined,
};

const statuses: ReadonlyArray<readonly [RealActionStatus, string, string]> = [
  ["review", "Review this real action.", "Nothing has been submitted."],
  [
    "preparing-proof",
    "Preparing the proof request...",
    "A proof and transaction are not verified yet.",
  ],
  [
    "awaiting-wallet",
    "Waiting for wallet approval...",
    "No transaction is verified yet.",
  ],
  [
    "submitted",
    "Transaction submitted.",
    "Submission is not confirmation or verification.",
  ],
  [
    "confirming",
    "Waiting for network confirmation...",
    "It is not verified yet.",
  ],
  [
    "succeeded",
    "Starknet confirmed the transaction.",
    "Expected-pool interaction is verified separately",
  ],
  [
    "cancelled",
    "Nothing was submitted.",
    "This action stopped before a transaction was submitted.",
  ],
  [
    "failed",
    "Action failed.",
    "No verified success was recorded for this attempt.",
  ],
  [
    "uncertain",
    "Submitted, but confirmation is not visible yet.",
    "Do not submit again until the transaction status is checked.",
  ],
];

function render(overrides: Partial<ActionReviewPanelProps> = {}): string {
  return renderToStaticMarkup(
    <ActionReviewPanel {...baseProps} {...overrides} />,
  );
}

function textContent(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }

      return isValidElement<ButtonProps>(child)
        ? textContent(child.props.children)
        : "";
    })
    .join("");
}

function findButton(
  node: ReactNode,
  accessibleName: string,
): ReactElement<ButtonProps> {
  let match: ReactElement<ButtonProps> | undefined;

  function visit(current: ReactNode): void {
    Children.forEach(current, (child) => {
      if (match || !isValidElement<ButtonProps>(child)) {
        return;
      }

      if (
        child.type === "button" &&
        textContent(child.props.children) === accessibleName
      ) {
        match = child;
        return;
      }

      visit(child.props.children);
    });
  }

  visit(node);

  if (!match) {
    throw new Error(`Could not find button: ${accessibleName}`);
  }

  return match;
}

describe("ActionReviewPanel", () => {
  it.each(statuses)(
    "renders the %s status without premature verification",
    (status, heading, description) => {
      const html = render({ status });

      expect(html).toContain(heading);
      expect(html).toContain(description);
      expect(html).toContain('aria-live="');

      expect(html).not.toContain("Verified STRK20 evidence");
    },
  );

  it("renders every caller-supplied review value and no numeric built-in fee", () => {
    const html = render();

    expect(html).toContain("Real funds · Starknet Mainnet");
    expect(html).toContain("Private transfer");
    expect(html).toContain("STRK");
    expect(html).toContain("caller-supplied-token-address");
    expect(html).toContain("25 STRK");
    expect(html).toContain("Bob");
    expect(html).toContain("caller-supplied-recipient-address");
    expect(html).toContain("Shown by wallet before approval");
  });

  it.each([
    ["shield", "shield 25 STRK into the private pool", "depositing account"],
    [
      "private-transfer",
      "send 25 STRK privately to Bob",
      "sender-to-recipient link",
    ],
    [
      "withdraw",
      "withdraw 25 STRK from the private pool to Bob",
      "withdrawal recipient",
    ],
  ] as const)("shows action-specific facts for %s", (action, summary, fact) => {
    const html = render({ action });

    expect(html).toContain(summary);
    expect(html).toContain(fact);
    expect(html).toContain("Private inside the pool");
    expect(html).toContain("Remains public");
  });

  it("keeps confirm and cancel behavior caller-controlled", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const tree = ActionReviewPanel({ ...baseProps, onConfirm, onCancel });

    findButton(
      tree,
      "Ask wallet to prepare private transfer",
    ).props.onClick?.();
    findButton(tree, "Cancel review").props.onClick?.();

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it.each([{ busy: true }, { disabled: true }])(
    "disables review controls for caller state %o",
    (controlState) => {
      const html = render(controlState);

      expect(html.match(/disabled=""/g)).toHaveLength(2);
      if ("busy" in controlState) {
        expect(html).toContain('aria-busy="true"');
      }
    },
  );

  it("shows only caller-supplied transaction evidence", () => {
    expect(render({ status: "submitted" })).not.toContain(
      "Transaction hash supplied by caller",
    );

    const html = render({
      status: "submitted",
      transactionHash: "caller-supplied-transaction-hash",
      explorerUrl:
        "https://explorer.example/transaction/caller-supplied-transaction-hash",
    });

    expect(html).toContain("caller-supplied-transaction-hash");
    expect(html).toContain(
      'href="https://explorer.example/transaction/caller-supplied-transaction-hash"',
    );
  });

  it("never asks for or renders wallet secrets", () => {
    const html = render();

    expect(html).toContain("never asks for private keys");
    expect(html).not.toContain("seed phrase");
    expect(html).not.toContain("Enter private key");
  });
});
