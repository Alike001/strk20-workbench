import { EvidenceExperience } from "../../../components/evidence";
import { ProductFrame, RouteShell } from "../../../components/product-shell";

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
        state="Live public receipt verification"
      >
        <EvidenceExperience />
      </RouteShell>
    </ProductFrame>
  );
}
