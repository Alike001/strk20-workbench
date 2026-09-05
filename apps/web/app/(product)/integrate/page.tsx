import { ComponentsPage } from "../../../components/integrate";
import { ProductFrame } from "../../../components/product-shell";

export const metadata = {
  title: "Components · STRK20 Workbench",
  description:
    "Explore reusable STRK20 private-transfer building blocks and try them safely in the Sandbox playground.",
};

export default function IntegratePage() {
  return (
    <ProductFrame active="Integrate">
      <ComponentsPage />
    </ProductFrame>
  );
}
