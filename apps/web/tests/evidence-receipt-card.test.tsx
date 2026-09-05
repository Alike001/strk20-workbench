import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  EvidenceReceiptCard,
  type EvidenceReceiptCardProps,
  type EvidenceReceiptStatus,
} from "../components/evidence-receipt";

const baseProps: EvidenceReceiptCardProps = {
  action: "private-transfer",
  status: "pending",
  networkLabel: "Caller-supplied network",
  poolAddress: "caller-supplied-pool-address",
  transactionHash: "caller-supplied-transaction-hash",
  expectedPoolVerified: false,
  explanation: "A caller-supplied explanation of the requested action.",
};

const statuses: ReadonlyArray<readonly [EvidenceReceiptStatus, string]> = [
  ["pending", "Confirmation pending"],
  ["confirmed", "Confirmed transaction"],
  ["reverted", "Transaction reverted"],
  ["uncertain", "Confirmation not visible"],
];

function render(overrides: Partial<EvidenceReceiptCardProps> = {}): string {
  return renderToStaticMarkup(
    <EvidenceReceiptCard {...baseProps} {...overrides} />,
  );
}

describe("EvidenceReceiptCard", () => {
  it.each(statuses)("renders the %s receipt status", (status, heading) => {
    const html = render({ status });

    expect(html).toContain(heading);
    expect(html).toContain('aria-live="');
  });

  it("does not verify a confirmed transaction without the expected pool check", () => {
    const html = render({ status: "confirmed", expectedPoolVerified: false });

    expect(html).toContain("Confirmed · Pool not verified");
    expect(html).toContain("This is not verified STRK20 evidence.");
    expect(html).not.toContain(">Verified STRK20 evidence<");
  });

  it("labels only a confirmed expected-pool receipt as verified evidence", () => {
    const html = render({ status: "confirmed", expectedPoolVerified: true });

    expect(html).toContain("Verified STRK20 evidence");
    expect(html).toContain("Receipt + pool check passed");
  });

  it.each(["pending", "uncertain"] as const)(
    "warns against resubmission while %s",
    (status) => {
      const html = render({ status });

      expect(html).toContain("Do not submit again");
      expect(html).not.toContain(">Verified STRK20 evidence<");
    },
  );

  it("presents a reverted receipt as an unsuccessful alert", () => {
    const html = render({ status: "reverted", expectedPoolVerified: true });

    expect(html).toContain('role="alert"');
    expect(html).toContain("Reverted · Unsuccessful");
    expect(html).toContain("did not complete successfully");
    expect(html).not.toContain(">Verified STRK20 evidence<");
  });

  it("renders caller-supplied values and optional explorer evidence", () => {
    const html = render({
      action: "withdraw",
      networkLabel: "Caller network label",
      poolAddress: "caller-pool",
      transactionHash: "caller-transaction",
      contractAddress: "caller-contract",
      timestampLabel: "Caller timestamp",
      explorerUrl: "https://explorer.example/tx/caller-transaction",
      explanation: "Caller explanation",
    });

    expect(html).toContain("Withdraw");
    expect(html).toContain("Caller network label");
    expect(html).toContain("caller-pool");
    expect(html).toContain("caller-transaction");
    expect(html).toContain("caller-contract");
    expect(html).toContain("Caller timestamp");
    expect(html).toContain("Caller explanation");
    expect(html).toContain(
      'href="https://explorer.example/tx/caller-transaction"',
    );
  });

  it("does not invent optional explorer or contract evidence", () => {
    const html = render();

    expect(html).toContain("No explorer URL supplied by the caller.");
    expect(html).not.toContain("<dt>Contract</dt>");
    expect(html).not.toContain("0x");
  });

  it("includes the privacy limitation without qualification claims or secrets", () => {
    const html = render({ status: "confirmed", expectedPoolVerified: true });

    expect(html).toContain(
      "Public evidence does not prove that all action details were private.",
    );
    expect(html).toContain(
      "The requested action is caller context, not necessarily a public receipt field.",
    );
    expect(html).not.toContain("Public receipt fields");
    expect(html).not.toMatch(/hackathon|qualif(?:y|ied|ication)/i);
    expect(html).not.toMatch(
      /private key|viewing key|note contents|proof payload|balance/i,
    );
  });

  it("uses status semantics for non-error outcomes and alerts for uncertain ones", () => {
    expect(render({ status: "pending" })).toContain('role="status"');
    expect(render({ status: "confirmed" })).toContain('role="status"');
    expect(render({ status: "uncertain" })).toContain('role="alert"');
    expect(render({ status: "reverted" })).toContain('role="alert"');
  });
});
