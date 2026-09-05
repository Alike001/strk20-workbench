import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { EvidenceRecord } from "@strk20-workbench/lab-core";

import {
  EvidenceExperience,
  EvidenceResults,
  loadPublicEvidence,
} from "../components/evidence";
import type { PublicEvidenceResponse } from "../lib/evidence";

const verified: EvidenceRecord = {
  id: "verified",
  source: "project-curated",
  mode: "real",
  proofKind: "real",
  network: "SN_MAIN",
  action: "private-transfer",
  transactionHash: "0xabc",
  receiptStatus: "succeeded",
  poolInteraction: "verified",
  explorerUrl: "https://voyager.online/tx/0xabc",
  createdAt: "2026-09-05T12:00:00.000Z",
};

function response(records: readonly EvidenceRecord[]): PublicEvidenceResponse {
  return {
    officialPool: "0xpool",
    requiredTransactions: 3,
    rpcConfigured: true,
    records,
    issues: [],
    manifest: {
      transactions: records.flatMap((record) =>
        record.transactionHash ? [record.transactionHash] : [],
      ),
      contracts: [],
      demoVideo: "",
      demoUrl: "",
    },
  };
}

describe("EvidenceExperience", () => {
  it("starts with a truthful non-submitting verification state", () => {
    const html = renderToStaticMarkup(<EvidenceExperience />);

    expect(html).toContain("Checking repository evidence");
    expect(html).toContain("Nothing is submitted from this page");
  });

  it("counts only qualifying curated mainnet records", () => {
    const sandbox: EvidenceRecord = {
      ...verified,
      id: "sandbox",
      source: "sandbox",
      mode: "sandbox",
      proofKind: "simulated",
      network: "SANDBOX",
      transactionHash: "0xfake",
    };
    const unverified: EvidenceRecord = {
      ...verified,
      id: "unverified",
      transactionHash: "0xdef",
      poolInteraction: "not-verified",
    };
    const html = renderToStaticMarkup(
      <EvidenceResults response={response([verified, unverified, sandbox])} />,
    );

    expect(html).toContain("1 of 3 verified");
    expect(html).toContain("0xabc");
    expect(html).toContain("0xdef");
    expect(html).not.toContain("0xfake");
    expect(html).toContain("Checked-in hashes are not trusted automatically");
  });

  it("renders the repository-empty state without fake evidence", () => {
    const html = renderToStaticMarkup(
      <EvidenceResults response={response([])} />,
    );

    expect(html).toContain("0 of 3 verified");
    expect(html).toContain("No public evidence published yet");
    expect(html).toContain("Sandbox results never appear here");
    expect(html).toContain("Repository evidence incomplete");
    expect(html).toContain("No project contract declared");
  });

  it("surfaces validation issues", () => {
    const html = renderToStaticMarkup(
      <EvidenceResults
        response={{ ...response([]), issues: ["Metadata needs review."] }}
      />,
    );
    expect(html).toContain("Needs attention");
    expect(html).toContain("Metadata needs review.");
  });

  it("loads only from the public evidence endpoint", async () => {
    const request = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(response([])), { status: 200 }),
      );
    await expect(loadPublicEvidence(undefined, request)).resolves.toMatchObject(
      {
        records: [],
      },
    );
    expect(request).toHaveBeenCalledWith("/api/evidence", {
      cache: "no-store",
      signal: undefined,
    });
  });

  it("rejects an unavailable evidence endpoint", async () => {
    const request = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 503 }));
    await expect(loadPublicEvidence(undefined, request)).rejects.toThrow(/503/);
  });
});
