export {
  addBaseUnits,
  assertPositiveAmount,
  formatTokenAmount,
  parseBaseUnitAmount,
  subtractBaseUnits,
} from "./amounts";
export {
  createAdapterContractFixture,
  type AdapterFixture,
} from "./contract-fixtures";
export {
  ScenarioController,
  type ControllerOutcome,
  type ControllerResult,
  type ExecuteOptions,
} from "./controller";
export { createLabError, sanitizeRawCause } from "./errors";
export {
  executionTruth,
  isEvidenceConsistentWithExecution,
  isGenuineExecution,
  isQualifyingMainnetEvidence,
} from "./evidence";
export { getPrivacyFacts, PRIVACY_CATALOG_VERSION } from "./privacy";
export {
  CANONICAL_TOKEN_ID,
  createCanonicalScenarioState,
  createInitialState,
  getBalance,
  SCENARIO_SCHEMA_VERSION,
  totalValue,
  validateAction,
} from "./scenario";
export type * from "./types";

import type { CompatibilitySummary } from "./types";

export const compatibilitySummary: CompatibilitySummary = Object.freeze({
  product: "STRK20 Workbench",
  sandboxRequiresWallet: false,
  realRoute: "Wallet API",
});
