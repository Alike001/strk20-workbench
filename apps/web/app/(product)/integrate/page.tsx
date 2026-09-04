import {
  ProductFrame,
  ProductMap,
  RoutePanel,
  RouteShell,
} from "../../../components/product-shell";
import styles from "../../../components/product-shell/product-shell.module.css";

export const metadata = {
  title: "Integrate · STRK20 Workbench",
  description: "Adopt the reusable STRK20 Workbench scenario core.",
};

export default function IntegratePage() {
  return (
    <ProductFrame active="Integrate">
      <RouteShell
        title="Connect the workbench to your project."
        description="Use one framework-neutral scenario contract in the browser sandbox and through the supported Starknet Wallet API route."
        state="Package surface · In workspace"
      >
        <div className={styles.twoColumnShell}>
          <RoutePanel title="One scenario contract">
            <pre className={styles.codeBlock}>
              <code>{`import { isGenuineExecution } from "@strk20-workbench/lab-core";

const publishable = isGenuineExecution(
  execution.mode,
  execution.proofKind,
);`}</code>
            </pre>
            <p className={styles.panelNote}>
              This is the current workspace API. The scenario contract will be
              added and locked in Lab Core milestone 5; the package is not
              published to npm yet.
            </p>
          </RoutePanel>
          <RoutePanel title="Adoption path">
            <ul className={styles.plainList}>
              <li>Run the canonical scenario without a wallet.</li>
              <li>
                Inspect public and private boundaries from normalized events.
              </li>
              <li>Swap in the Wallet API adapter when compatibility passes.</li>
              <li>
                Verify genuine mainnet evidence separately from simulation.
              </li>
            </ul>
          </RoutePanel>
        </div>
        <ProductMap />
      </RouteShell>
    </ProductFrame>
  );
}
