import Link from "next/link";

import {
  ArrowRightIcon,
  EvidencePreview,
  FinalToolkitCta,
  MainnetPath,
  PackageRail,
  ProductFrame,
  ToolkitArchitecture,
  ToolkitFooter,
  ToolkitLayers,
  ToolkitQuickstart,
} from "../../components/product-shell";
import styles from "../../components/product-shell/toolkit-landing.module.css";

export default function IntroductionPage() {
  return (
    <ProductFrame active="Introduction">
      <main className={styles.landing}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>STRK20 developer infrastructure</p>
            <h1>Private token flows, ready to build.</h1>
            <p>
              Add shield, private transfer and withdraw to a Starknet app with
              reusable components, wallet adapters and a safe local sandbox.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href="/integrate">
                Start with the toolkit <ArrowRightIcon />
              </Link>
              <Link className={styles.secondaryButton} href="/workbench">
                Try the playground <ArrowRightIcon />
              </Link>
            </div>
          </div>

          <ToolkitArchitecture />
        </section>

        <PackageRail />
        <ToolkitLayers />
        <ToolkitQuickstart />
        <MainnetPath />
        <EvidencePreview />
        <FinalToolkitCta />
      </main>
      <ToolkitFooter />
    </ProductFrame>
  );
}
