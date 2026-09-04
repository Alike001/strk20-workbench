import type { ReactNode } from "react";

import { SiteHeader, type ProductRoute } from "./site-header";
import styles from "./product-shell.module.css";

export function ProductFrame({
  active,
  children,
}: Readonly<{ active: ProductRoute; children: ReactNode }>) {
  return (
    <div className={styles.productFrame}>
      <SiteHeader active={active} />
      {children}
    </div>
  );
}
