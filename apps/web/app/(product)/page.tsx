import Link from "next/link";

import {
  ArrowRightIcon,
  BuildingBlocks,
  LandingTransferPreview,
  ProductFrame,
} from "../../components/product-shell";
import styles from "../../components/product-shell/product-shell.module.css";

export default function IntroductionPage() {
  return (
    <ProductFrame active="Introduction">
      <main className={styles.introduction}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1>Add private transfers to your Starknet app.</h1>
            <p>
              Try shielding, private transfers and withdrawals in a safe
              playground. Then copy the components into your app and connect
              STRK20.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href="/workbench">
                Try the playground <ArrowRightIcon />
              </Link>
              <Link className={styles.secondaryAction} href="/integrate">
                Explore components <ArrowRightIcon />
              </Link>
            </div>
          </div>

          <LandingTransferPreview />
        </section>

        <BuildingBlocks />
      </main>
    </ProductFrame>
  );
}
