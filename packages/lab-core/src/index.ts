export type ExecutionMode = "sandbox" | "real";
export type ProofKind = "simulated" | "real";

export interface CompatibilitySummary {
  readonly product: "STRK20 Workbench";
  readonly sandboxRequiresWallet: false;
  readonly realRoute: "Wallet API";
}

export const compatibilitySummary: CompatibilitySummary = Object.freeze({
  product: "STRK20 Workbench",
  sandboxRequiresWallet: false,
  realRoute: "Wallet API",
});

export function isGenuineExecution(
  mode: ExecutionMode,
  proofKind: ProofKind,
): boolean {
  return mode === "real" && proofKind === "real";
}
