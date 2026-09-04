import {
  ProductFrame,
  RoutePanel,
  RouteShell,
} from "../../../components/product-shell";
import styles from "../../../components/product-shell/product-shell.module.css";

export const metadata = {
  title: "Evidence · STRK20 Workbench",
  description:
    "Separate simulated output from verified STRK20 mainnet evidence.",
};

export default function EvidencePage() {
  return (
    <ProductFrame active="Evidence">
      <RouteShell
        title="Evidence, not privacy claims."
        description="A result qualifies only after its mainnet receipt succeeds and interaction with the official STRK20 pool is independently verified."
        state="0 of 3 mainnet transactions verified"
      >
        <div className={styles.twoColumnShell}>
          <RoutePanel title="Qualification gate">
            <ul className={styles.gateList}>
              <li data-state="ready">Starknet mainnet network</li>
              <li data-state="waiting">Successful final receipt</li>
              <li data-state="waiting">Official pool interaction</li>
              <li data-state="waiting">Unique valid transaction hash</li>
              <li data-state="waiting">Direct explorer link</li>
            </ul>
          </RoutePanel>
          <RoutePanel title="No evidence published yet">
            <p className={styles.emptyCopy}>
              Sandbox events can teach the flow, but they can never appear here
              as real proof. Verified hashes will be added only after deliberate
              minimal-value mainnet actions and manual receipt review.
            </p>
          </RoutePanel>
        </div>
      </RouteShell>
    </ProductFrame>
  );
}
