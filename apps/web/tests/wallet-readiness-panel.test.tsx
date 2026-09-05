import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  WalletReadinessPanel,
  type WalletReadinessPanelProps,
} from "../components/wallet-readiness";

interface ButtonProps {
  children?: ReactNode;
  onClick?: () => void;
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

function render(props: WalletReadinessPanelProps): string {
  return renderToStaticMarkup(<WalletReadinessPanel {...props} />);
}

describe("WalletReadinessPanel", () => {
  it("shows disconnected guidance and calls the connect callback", () => {
    const onConnect = vi.fn();
    const markup = render({ state: "disconnected", onConnect });
    const tree = WalletReadinessPanel({ state: "disconnected", onConnect });

    expect(markup).toContain("Connect a privacy-enabled wallet");
    expect(markup).toContain("Connecting alone never moves funds");
    expect(markup).toContain('type="button"');

    findButton(tree, "Connect wallet").props.onClick?.();
    expect(onConnect).toHaveBeenCalledOnce();
  });

  it("announces wallet discovery as a live status", () => {
    const markup = render({ state: "discovering" });

    expect(markup).toContain("Looking for compatible wallets...");
    expect(markup).toContain('aria-live="polite"');
    expect(markup).not.toMatch(/\d+%/);
  });

  it("offers both recovery actions for an unsupported wallet", () => {
    const onRetry = vi.fn();
    const onUseSandbox = vi.fn();
    const tree = WalletReadinessPanel({
      state: "unsupported",
      onRetry,
      onUseSandbox,
    });
    const markup = render({ state: "unsupported" });

    expect(markup).toContain("required STRK20 Wallet API");
    expect(markup).toContain("Retry");
    expect(markup).toContain("Continue in Sandbox");

    findButton(tree, "Retry").props.onClick?.();
    findButton(tree, "Continue in Sandbox").props.onClick?.();
    expect(onRetry).toHaveBeenCalledOnce();
    expect(onUseSandbox).toHaveBeenCalledOnce();
  });

  it("shows the current network and calls the switch callback", () => {
    const onSwitchNetwork = vi.fn();
    const tree = WalletReadinessPanel({
      state: "wrong-network",
      chainName: "Starknet Sepolia",
      onSwitchNetwork,
    });
    const markup = render({
      state: "wrong-network",
      chainName: "Starknet Sepolia",
    });

    expect(markup).toContain("Starknet Sepolia");
    expect(markup).toContain("Starknet Mainnet");

    findButton(tree, "Switch network").props.onClick?.();
    expect(onSwitchNetwork).toHaveBeenCalledOnce();
  });

  it("shows the ready wallet, network, and advertised API version", () => {
    const markup = render({
      state: "ready",
      walletName: "Braavos",
      chainName: "Starknet Mainnet",
      supportedVersion: "1.0.0",
    });

    expect(markup).toContain("Braavos");
    expect(markup).toContain("Starknet Mainnet");
    expect(markup).toContain("1.0.0");
    expect(markup).toContain(
      "Every real action still has a separate review step",
    );
  });

  it("never implies that connecting moved funds", () => {
    const disconnected = render({ state: "disconnected" });
    const connecting = render({ state: "connecting" });

    expect(disconnected).toContain("Connecting alone never moves funds");
    expect(connecting).toContain("It does not move funds");
    expect(`${disconnected} ${connecting}`).not.toMatch(
      /funds (?:were|have been) moved/i,
    );
  });
});
