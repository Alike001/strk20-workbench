import Link from "next/link";

import { TerminalIcon } from "./icons";
import { ModeBadge } from "./mode-badge";
import styles from "./product-shell.module.css";

const links = [
  ["Introduction", "/"],
  ["Workbench", "/workbench"],
  ["Integrate", "/integrate"],
  ["Evidence", "/evidence"],
  ["Documentation", "/documentation"],
] as const;

export type ProductRoute = (typeof links)[number][0];

export function SiteHeader({ active }: { active: ProductRoute }) {
  return (
    <header className={styles.siteHeader}>
      <Link
        className={styles.brand}
        href="/"
        aria-label="STRK20 Workbench home"
      >
        <span className={styles.brandMark}>
          <TerminalIcon />
        </span>
        <span>STRK20 Workbench</span>
      </Link>

      <nav className={styles.navigation} aria-label="Primary navigation">
        {links.map(([label, href]) => (
          <Link
            aria-current={active === label ? "page" : undefined}
            className={active === label ? styles.activeLink : undefined}
            href={href}
            key={label}
          >
            {label}
          </Link>
        ))}
      </nav>

      <ModeBadge />
    </header>
  );
}
