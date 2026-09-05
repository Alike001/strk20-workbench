import type { JSX, ReactNode } from "react";

import styles from "./submission-readiness-panel.module.css";

export interface SubmissionReadinessPanelProps {
  verifiedTransactionCount: number;
  requiredTransactionCount: number;
  demoVideoUrl?: string;
  demoUrl?: string;
  deploymentDetected: boolean;
  contractAddresses: readonly string[];
  repositoryUrl: string;
}

type ChecklistState = "ready" | "incomplete" | "optional" | "available";

export function SubmissionReadinessPanel({
  verifiedTransactionCount,
  requiredTransactionCount,
  demoVideoUrl,
  demoUrl,
  deploymentDetected,
  contractAddresses,
  repositoryUrl,
}: SubmissionReadinessPanelProps): JSX.Element {
  const transactionsReady =
    verifiedTransactionCount >= requiredTransactionCount;
  const publicDemoReady = Boolean(demoUrl) || deploymentDetected;
  const demoVideoReady = Boolean(demoVideoUrl);
  const repositoryEvidenceReady =
    transactionsReady && publicDemoReady && demoVideoReady;

  return (
    <article
      className={styles.panel}
      data-readiness={repositoryEvidenceReady ? "ready" : "incomplete"}
      aria-label="Repository evidence readiness"
    >
      <header className={styles.topRail}>
        <span>Submission readiness</span>
        <span>Caller-classified evidence</span>
      </header>

      <div
        className={styles.outcome}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className={styles.outcomeMark} aria-hidden="true" />
        <div>
          <p>
            {repositoryEvidenceReady
              ? "Required evidence ready"
              : "Review required"}
          </p>
          <h2>
            {repositoryEvidenceReady
              ? "Repository evidence ready"
              : "Repository evidence incomplete"}
          </h2>
          <p>
            {repositoryEvidenceReady
              ? "The caller reports enough verified transactions, a public demo, and a demo video. Review the linked evidence below."
              : "One or more required evidence items are incomplete. Review the checklist below before presenting the repository."}
          </p>
        </div>
      </div>

      <section className={styles.checklistSection}>
        <div className={styles.sectionHeading}>
          <div>
            <p>Fast review</p>
            <h3>Readiness checklist</h3>
          </div>
          <span>
            {repositoryEvidenceReady
              ? "3 of 3 requirements ready"
              : `${[transactionsReady, publicDemoReady, demoVideoReady].filter(Boolean).length} of 3 requirements ready`}
          </span>
        </div>

        <ul
          className={styles.checklist}
          aria-label="Evidence readiness checklist"
        >
          <ChecklistItem
            title="Verified transactions"
            state={transactionsReady ? "ready" : "incomplete"}
            summary={
              transactionsReady
                ? "Transaction count met"
                : "Verified transaction evidence is incomplete"
            }
          >
            <strong>
              {verifiedTransactionCount} of {requiredTransactionCount}
            </strong>{" "}
            required transactions are verified.
          </ChecklistItem>

          <ChecklistItem
            title="Public demo"
            state={publicDemoReady ? "ready" : "incomplete"}
            summary={
              demoUrl
                ? "Demo link supplied"
                : deploymentDetected
                  ? "Deployment detected"
                  : "Public demo is incomplete"
            }
          >
            {demoUrl ? (
              <ExternalLink href={demoUrl}>Open public demo</ExternalLink>
            ) : deploymentDetected ? (
              "A deployment was detected by the caller. No demo URL was supplied."
            ) : (
              "No public demo URL or detected deployment was supplied."
            )}
          </ChecklistItem>

          <ChecklistItem
            title="Demo video"
            state={demoVideoReady ? "ready" : "incomplete"}
            summary={
              demoVideoReady
                ? "Video link supplied"
                : "Demo video is incomplete"
            }
          >
            {demoVideoUrl ? (
              <ExternalLink href={demoVideoUrl}>Watch demo video</ExternalLink>
            ) : (
              "No demo video URL was supplied."
            )}
          </ChecklistItem>

          <ChecklistItem
            title="Project contracts"
            state="optional"
            summary={
              contractAddresses.length > 0
                ? `${contractAddresses.length} declared`
                : "Optional"
            }
          >
            {contractAddresses.length > 0 ? (
              <ul className={styles.contractList}>
                {contractAddresses.map((address, index) => (
                  <li key={`${address}-${index}`}>
                    <code>{address}</code>
                  </li>
                ))}
              </ul>
            ) : (
              "No project contract declared"
            )}
          </ChecklistItem>

          <ChecklistItem
            title="Repository"
            state="available"
            summary="Source link supplied"
          >
            <ExternalLink href={repositoryUrl}>
              Open source repository
            </ExternalLink>
          </ChecklistItem>
        </ul>
      </section>

      <aside className={styles.evidenceBoundary} aria-label="Evidence boundary">
        <div>
          <p>Evidence boundary</p>
          <h3>Verified count only</h3>
        </div>
        <p>
          Only the verified transaction count supplied by the parent application
          is included here. Sandbox activity, pending transactions, and
          unverified hashes are not evidence.
        </p>
      </aside>
    </article>
  );
}

function ChecklistItem({
  title,
  state,
  summary,
  children,
}: Readonly<{
  title: string;
  state: ChecklistState;
  summary: string;
  children: ReactNode;
}>): JSX.Element {
  const statusLabel =
    state === "ready"
      ? "Ready"
      : state === "incomplete"
        ? "Incomplete"
        : state === "optional"
          ? "Optional"
          : "Available";

  return (
    <li className={styles.checklistItem} data-state={state}>
      <div className={styles.itemStatus}>
        <span aria-hidden="true" />
        <strong aria-label={`${title} status: ${statusLabel}`}>
          {statusLabel}
        </strong>
      </div>
      <div className={styles.itemCopy}>
        <h4>{title}</h4>
        <p>{summary}</p>
      </div>
      <div className={styles.itemEvidence}>{children}</div>
    </li>
  );
}

function ExternalLink({
  href,
  children,
}: Readonly<{ href: string; children: ReactNode }>): JSX.Element {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children} <span aria-hidden="true">↗</span>
    </a>
  );
}
