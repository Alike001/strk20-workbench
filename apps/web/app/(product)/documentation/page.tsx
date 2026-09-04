import Link from "next/link";

import {
  ProductFrame,
  RoutePanel,
  RouteShell,
} from "../../../components/product-shell";
import styles from "../../../components/product-shell/product-shell.module.css";

const docs = [
  [
    "Product requirements",
    "What the workbench must do and how success is judged.",
    "context/product-requirements.md",
  ],
  [
    "Technical specification",
    "Architecture, boundaries, data flow, security, and milestones.",
    "context/technical-specification.md",
  ],
  [
    "Compatibility",
    "Exact package pins, upstream snapshots, and the open wallet gate.",
    "docs/compatibility.md",
  ],
  [
    "STRK20 architecture",
    "The pool, notes, discovery, proving, and privacy boundaries.",
    "context/strk20-architecture.md",
  ],
] as const;

export const metadata = {
  title: "Documentation · STRK20 Workbench",
  description:
    "Open architecture and compatibility documentation for STRK20 Workbench.",
};

export default function DocumentationPage() {
  return (
    <ProductFrame active="Documentation">
      <RouteShell
        title="Understand the system before trusting it."
        description="The product, architecture, compatibility decisions, and privacy limitations are documented in the same public repository as the code."
        state="Open source · MIT"
      >
        <RoutePanel title="Repository guides">
          <div className={styles.docList}>
            {docs.map(([title, body, path]) => (
              <Link
                href={`https://github.com/Alike001/strk20-workbench/blob/main/${path}`}
                key={title}
                target="_blank"
                rel="noreferrer"
              >
                <span>{title}</span>
                <p>{body}</p>
                <code>{path}</code>
              </Link>
            ))}
          </div>
        </RoutePanel>
      </RouteShell>
    </ProductFrame>
  );
}
