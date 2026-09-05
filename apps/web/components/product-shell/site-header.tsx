import Link from "next/link";

import styles from "./product-shell.module.css";

const links = [
  { route: "Workbench", label: "Playground", href: "/workbench" },
  { route: "Integrate", label: "Components", href: "/integrate" },
  { route: "Documentation", label: "Docs", href: "/documentation" },
  { route: "Evidence", label: "Evidence", href: "/evidence" },
] as const;

export type ProductRoute = "Introduction" | (typeof links)[number]["route"];

export function SiteHeader({ active }: { active: ProductRoute }) {
  return (
    <header className={styles.siteHeader}>
      <Link
        className={styles.brand}
        href="/"
        aria-label="STRK20 Workbench home"
      >
        <span className={styles.protocolWordmark}>
          STRK<span>[20]</span>
        </span>
        <span className={styles.brandDivider} aria-hidden="true" />
        <span>Workbench</span>
      </Link>

      <nav className={styles.navigation} aria-label="Primary navigation">
        {links.map(({ route, label, href }) => (
          <Link
            aria-current={active === route ? "page" : undefined}
            className={active === route ? styles.activeLink : undefined}
            href={href}
            key={label}
          >
            {label}
          </Link>
        ))}
        <a
          href="https://github.com/Alike001/strk20-workbench"
          rel="noreferrer"
          target="_blank"
        >
          GitHub
        </a>
      </nav>

      <Link className={styles.headerAction} href="/workbench">
        Get started
      </Link>
    </header>
  );
}
