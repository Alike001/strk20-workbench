import { describe, expect, it } from "vitest";

import { validateSubmission } from "../scripts/validate-strk20-json.mjs";

function submission(overrides = {}) {
  return {
    transactions: [],
    contracts: [],
    demo_video: "",
    demo_url: "",
    ...overrides,
  };
}

function curated(records = []) {
  return { records };
}

function record(hash = "0xabc") {
  return {
    action: "shield",
    transaction_hash: hash,
    created_at: "2026-09-05T12:00:00.000Z",
  };
}

describe("submission metadata validation", () => {
  it("accepts the valid intentionally incomplete repository state", () => {
    expect(validateSubmission(submission(), curated())).toEqual([]);
  });

  it("matches reviewed metadata to normalized transaction hashes", () => {
    const padded = `0x${"0".repeat(61)}abc`;
    expect(
      validateSubmission(
        submission({ transactions: [padded] }),
        curated([record("0xabc")]),
      ),
    ).toEqual([]);
  });

  it("rejects duplicates, malformed fields, and metadata mismatches", () => {
    const errors = validateSubmission(
      submission({
        transactions: ["0x1", "0x01", "fake"],
        contracts: ["not-a-contract"],
        demo_video: "http://video.example",
      }),
      curated([record("0x2"), record("0x02")]),
    );

    expect(errors.join(" ")).toMatch(/duplicate transaction/i);
    expect(errors.join(" ")).toMatch(/invalid|hex/i);
    expect(errors.join(" ")).toMatch(/HTTPS/i);
    expect(errors.join(" ")).toMatch(/missing reviewed evidence metadata/i);
    expect(errors.join(" ")).toMatch(/absent from strk20.json/i);
  });

  it("enforces final transaction and video requirements only when requested", () => {
    const errors = validateSubmission(submission(), curated(), {
      requireComplete: true,
    });
    expect(errors.join(" ")).toMatch(/at least three/i);
    expect(errors.join(" ")).toMatch(/demo_video/i);
  });
});
