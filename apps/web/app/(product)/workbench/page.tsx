import { ProductFrame } from "../../../components/product-shell";
import { RealWalletGateway } from "../../../components/wallet-readiness";
import { WorkbenchExperience } from "../../../components/workbench";
import styles from "../../../components/workbench/workbench.module.css";

export const metadata = {
  title: "Workbench · STRK20 Workbench",
  description:
    "Run and inspect a private STRK20 lifecycle in a lightweight sandbox.",
};

export default function WorkbenchPage() {
  return (
    <ProductFrame active="Workbench">
      <main className={styles.playgroundPage}>
        <header className={styles.playgroundHeading}>
          <div>
            <h1>Try a private transfer.</h1>
            <p>
              Use fake tokens to see how money moves from public to private and
              back again.
            </p>
          </div>
          <p>Sandbox · No wallet · No real funds</p>
        </header>
        <section id="sandbox-workbench">
          <WorkbenchExperience />
        </section>
        <RealWalletGateway />
      </main>
    </ProductFrame>
  );
}
