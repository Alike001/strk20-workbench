import { ProductFrame, RouteShell } from "../../../components/product-shell";
import { WorkbenchExperience } from "../../../components/workbench";

export const metadata = {
  title: "Workbench · STRK20 Workbench",
  description:
    "Run and inspect a private STRK20 lifecycle in a lightweight sandbox.",
};

export default function WorkbenchPage() {
  return (
    <ProductFrame active="Workbench">
      <RouteShell
        compact
        title="Run the private-token lifecycle."
        description="Start with a wallet-free scenario. Each action will update the same balances, timeline, and privacy explanation."
        state="Sandbox · Simulated proof"
      >
        <WorkbenchExperience />
      </RouteShell>
    </ProductFrame>
  );
}
