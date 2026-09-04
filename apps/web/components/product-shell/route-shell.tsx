import type { ReactNode } from "react";

import styles from "./product-shell.module.css";

export function RouteShell({
  title,
  description,
  state,
  children,
}: Readonly<{
  title: string;
  description: string;
  state: string;
  children: ReactNode;
}>) {
  return (
    <main className={styles.routeMain}>
      <header className={styles.routeHeading}>
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <span>{state}</span>
      </header>
      {children}
    </main>
  );
}

export function RoutePanel({
  title,
  children,
}: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <section className={styles.routePanel}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
