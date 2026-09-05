import { DocumentationGuide } from "../../../components/documentation/documentation-guide";
import { ProductFrame } from "../../../components/product-shell";

export const metadata = {
  title: "Documentation · STRK20 Workbench",
  description:
    "Understand the STRK20 Workbench toolkit, adoption path, readiness, and privacy boundaries.",
};

export default function DocumentationPage() {
  return (
    <ProductFrame active="Documentation">
      <DocumentationGuide />
    </ProductFrame>
  );
}
