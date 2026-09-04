import {
  PrivacyScenario,
  ProductFrame,
  RoutePanel,
  RouteShell,
} from "../../../components/product-shell";
import styles from "../../../components/product-shell/product-shell.module.css";

const steps = ["Register", "Shield", "Private transfer", "Withdraw"];

export const metadata = {
  title: "Workbench · STRK20 Workbench",
  description:
    "Run and inspect a private STRK20 lifecycle in a lightweight sandbox.",
};

export default function WorkbenchPage() {
  return (
    <ProductFrame active="Workbench">
      <RouteShell
        title="Run the private-token lifecycle."
        description="Start with a wallet-free scenario. Each action will update the same balances, timeline, and privacy explanation."
        state="Sandbox · Simulated proof"
      >
        <div className={styles.workbenchLayout}>
          <RoutePanel title="Guided scenario">
            <ol className={styles.stepList}>
              {steps.map((step, index) => (
                <li key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{step}</strong>
                  <small>{index === 0 ? "Ready" : "Waiting"}</small>
                </li>
              ))}
            </ol>
            <p className={styles.panelNote}>
              Sandbox assets have no monetary value. Scenario controls arrive
              with the deterministic Lab Core engine.
            </p>
          </RoutePanel>
          <PrivacyScenario />
        </div>
      </RouteShell>
    </ProductFrame>
  );
}
