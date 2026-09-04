import { CompatibilityProbe } from "./compatibility-probe";

export const metadata = {
  title: "Wallet compatibility · STRK20 Workbench",
  robots: { index: false, follow: false },
};

export default function CompatibilityPage() {
  return (
    <main className="compatibility-page">
      <CompatibilityProbe />
    </main>
  );
}
