import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  SubmissionReadinessPanel,
  type SubmissionReadinessPanelProps,
} from "../components/submission-readiness";

const baseProps: SubmissionReadinessPanelProps = {
  verifiedTransactionCount: 0,
  requiredTransactionCount: 3,
  deploymentDetected: false,
  contractAddresses: [],
  repositoryUrl: "caller-repository-url",
};

function render(
  overrides: Partial<SubmissionReadinessPanelProps> = {},
): string {
  return renderToStaticMarkup(
    <SubmissionReadinessPanel {...baseProps} {...overrides} />,
  );
}

describe("SubmissionReadinessPanel", () => {
  it("shows every missing requirement in the zero state", () => {
    const html = render();

    expect(html).toContain("Repository evidence incomplete");
    expect(html).toContain("0 of 3");
    expect(html).toContain("Verified transaction evidence is incomplete");
    expect(html).toContain("Public demo is incomplete");
    expect(html).toContain("Demo video is incomplete");
    expect(html).toContain("No project contract declared");
  });

  it("marks exactly the required verified transaction count ready", () => {
    const html = render({ verifiedTransactionCount: 3 });

    expect(html).toContain("3 of 3");
    expect(html).toContain("Transaction count met");
    expect(html).toContain("Repository evidence incomplete");
  });

  it("marks more than the required verified transaction count ready", () => {
    const html = render({ verifiedTransactionCount: 5 });

    expect(html).toContain("5 of 3");
    expect(html).toContain("Transaction count met");
  });

  it("accepts caller-detected deployment without inventing a demo link", () => {
    const html = render({ deploymentDetected: true });

    expect(html).toContain("Deployment detected");
    expect(html).toContain(
      "A deployment was detected by the caller. No demo URL was supplied.",
    );
    expect(html).not.toContain("Open public demo");
  });

  it("keeps overall readiness incomplete when the video is missing", () => {
    const html = render({
      verifiedTransactionCount: 3,
      demoUrl: "caller-demo-url",
    });

    expect(html).toContain("Transaction count met");
    expect(html).toContain("Demo link supplied");
    expect(html).toContain("Demo video is incomplete");
    expect(html).not.toContain(">Repository evidence ready<");
  });

  it("keeps empty contracts optional without failing otherwise ready evidence", () => {
    const html = render({
      verifiedTransactionCount: 3,
      deploymentDetected: true,
      demoVideoUrl: "caller-video-url",
      contractAddresses: [],
    });

    expect(html).toContain("Repository evidence ready");
    expect(html).toContain("No project contract declared");
    expect(html).toContain("Project contracts status: Optional");
  });

  it.each([
    {
      label: "transactions",
      props: {
        verifiedTransactionCount: 2,
        deploymentDetected: true,
        demoVideoUrl: "caller-video-url",
      },
    },
    {
      label: "public demo",
      props: {
        verifiedTransactionCount: 3,
        demoVideoUrl: "caller-video-url",
      },
    },
    {
      label: "demo video",
      props: {
        verifiedTransactionCount: 3,
        deploymentDetected: true,
      },
    },
  ] as const)("does not report ready without $label", ({ props }) => {
    expect(render(props)).not.toContain(">Repository evidence ready<");
  });

  it("reports ready only when transactions, public demo, and video are ready", () => {
    const html = render({
      verifiedTransactionCount: 4,
      demoUrl: "caller-demo-url",
      demoVideoUrl: "caller-video-url",
    });

    expect(html).toContain("Repository evidence ready");
    expect(html).toContain("3 of 3 requirements ready");
  });

  it("renders only caller-supplied links and contract values", () => {
    const html = render({
      verifiedTransactionCount: 3,
      demoUrl: "caller-demo-url",
      demoVideoUrl: "caller-video-url",
      contractAddresses: ["caller-contract-one", "caller-contract-two"],
      repositoryUrl: "caller-repository-url",
    });

    expect(html).toContain('href="caller-repository-url"');
    expect(html).toContain('href="caller-demo-url"');
    expect(html).toContain('href="caller-video-url"');
    expect(html).toContain("caller-contract-one");
    expect(html).toContain("caller-contract-two");
    expect(html.match(/target="_blank"/g)).toHaveLength(3);
    expect(html.match(/rel="noopener noreferrer"/g)).toHaveLength(3);
  });

  it("states the verified-count boundary without invented evidence or claims", () => {
    const html = render();

    expect(html).toContain(
      "Only the verified transaction count supplied by the parent application is included here.",
    );
    expect(html).toContain(
      "Sandbox activity, pending transactions, and unverified hashes are not evidence.",
    );
    expect(html).not.toContain("0x");
    expect(html).not.toContain("https://");
    expect(html).not.toMatch(/submitted|accepted|qualified|approved|winner/i);
    expect(html).not.toMatch(
      /wallet key|viewing key|note contents|proof payload|balance|rpc secret|environment variable/i,
    );
  });

  it("exposes polite overall status and labelled checklist semantics", () => {
    const html = render();

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-atomic="true"');
    expect(html).toContain('aria-label="Evidence readiness checklist"');
    expect(html).toContain("Verified transactions status: Incomplete");
    expect(html).toContain("Repository status: Available");
  });
});
