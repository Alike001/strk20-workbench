import Link from "next/link";

import {
  ArrowRightIcon,
  PrivacyScenario,
  ProductFrame,
  ProductMap,
} from "../../components/product-shell";
import styles from "../../components/product-shell/product-shell.module.css";

export default function IntroductionPage() {
  return (
    <ProductFrame active="Introduction">
      <main className={styles.introduction}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1>Build private Starknet apps without the heavy setup.</h1>
            <p>
              Run a complete STRK20 flow in your browser, inspect what the chain
              can see, then move the same integration to a supported wallet on
              mainnet.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href="/workbench">
                Run a private transfer <ArrowRightIcon />
              </Link>
              <Link className={styles.secondaryAction} href="/integrate">
                Connect your project <ArrowRightIcon />
              </Link>
            </div>
            <dl
              className={styles.statusReadout}
              aria-label="Current workbench status"
            >
              <div>
                <dt>mode</dt>
                <dd>sandbox</dd>
              </div>
              <div>
                <dt>proof</dt>
                <dd>simulated</dd>
              </div>
              <div>
                <dt>wallet</dt>
                <dd>not connected</dd>
              </div>
              <div>
                <dt>privacy actions</dt>
                <dd>disabled</dd>
              </div>
            </dl>
          </div>

          <PrivacyScenario />
        </section>

        <ProductMap />
      </main>
    </ProductFrame>
  );
}
