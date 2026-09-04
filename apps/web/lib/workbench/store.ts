import {
  createCanonicalScenarioState,
  createLabError,
  type ExecutionMode,
  type LabError,
  type Network,
  type ScenarioState,
} from "@strk20-workbench/lab-core";
import { createStore } from "zustand/vanilla";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import { z } from "zod";

import {
  parsePersistedSandboxScenario,
  serializeSandboxScenario,
  type SerializedSandboxScenario,
} from "./persistence";

export const WORKBENCH_STORAGE_KEY = "strk20-workbench:sandbox:v1";
export const WORKBENCH_STORAGE_VERSION = 1;

export interface WalletSessionMetadata {
  readonly walletId: string;
  readonly accountAddress: string;
  readonly network: Network;
}

export interface WorkbenchStoreState {
  readonly scenario: ScenarioState;
  readonly sandboxSnapshot: SerializedSandboxScenario;
  readonly selectedMode: ExecutionMode;
  readonly selectedStepId?: string;
  readonly advancedDetails: boolean;
  readonly hydrated: boolean;
  readonly hydrationError?: LabError;
  readonly walletSession?: WalletSessionMetadata;
  readonly setScenario: (scenario: ScenarioState) => void;
  readonly setSelectedMode: (mode: ExecutionMode) => void;
  readonly setSelectedStepId: (stepId?: string) => void;
  readonly setAdvancedDetails: (enabled: boolean) => void;
  readonly setWalletSession: (session?: WalletSessionMetadata) => void;
  readonly resetSandbox: () => void;
  readonly finishHydration: (cause?: unknown) => void;
}

export interface CreateWorkbenchStoreOptions {
  readonly storage?: StateStorage;
  readonly initialScenario?: ScenarioState;
  readonly createResetScenario?: () => ScenarioState;
}

const persistedSliceSchema = z.object({
  sandboxSnapshot: z.unknown(),
  selectedMode: z.enum(["sandbox", "real"]).default("sandbox"),
  selectedStepId: z.string().optional(),
  advancedDetails: z.boolean().default(false),
});

const legacySliceSchema = z.object({
  sandboxScenario: z.unknown(),
  selectedStepId: z.string().optional(),
  advancedDetails: z.boolean().default(false),
});

export function createWorkbenchStore(
  options: CreateWorkbenchStoreOptions = {},
) {
  const initialScenario =
    options.initialScenario ?? createCanonicalScenarioState();
  assertSandboxScenario(initialScenario);
  const createResetScenario =
    options.createResetScenario ?? (() => createCanonicalScenarioState());
  const storage =
    options.storage ??
    (typeof window === "undefined" ? createNoopStorage() : window.localStorage);

  return createStore<WorkbenchStoreState>()(
    persist(
      (set) => ({
        scenario: initialScenario,
        sandboxSnapshot: serializeSandboxScenario(initialScenario),
        selectedMode: "sandbox",
        selectedStepId: undefined,
        advancedDetails: false,
        hydrated: false,
        hydrationError: undefined,
        walletSession: undefined,
        setScenario: (scenario) => {
          assertSandboxScenario(scenario);
          set({
            scenario,
            sandboxSnapshot: serializeSandboxScenario(scenario),
          });
        },
        setSelectedMode: (selectedMode) => set({ selectedMode }),
        setSelectedStepId: (selectedStepId) => set({ selectedStepId }),
        setAdvancedDetails: (advancedDetails) => set({ advancedDetails }),
        setWalletSession: (walletSession) => set({ walletSession }),
        resetSandbox: () => {
          const scenario = createResetScenario();
          assertSandboxScenario(scenario);
          set({
            scenario,
            sandboxSnapshot: serializeSandboxScenario(scenario),
            selectedStepId: undefined,
            hydrationError: undefined,
          });
        },
        finishHydration: (cause) =>
          set((state) => ({
            hydrated: true,
            hydrationError:
              cause === undefined
                ? state.hydrationError
                : incompatibleStateError(cause),
          })),
      }),
      {
        name: WORKBENCH_STORAGE_KEY,
        version: WORKBENCH_STORAGE_VERSION,
        storage: createJSONStorage(() => storage),
        skipHydration: true,
        partialize: (state) => ({
          sandboxSnapshot: state.sandboxSnapshot,
          selectedMode: state.selectedMode,
          selectedStepId: state.selectedStepId,
          advancedDetails: state.advancedDetails,
        }),
        migrate: migrateWorkbenchState,
        merge: mergePersistedWorkbenchState,
        onRehydrateStorage: () => (state, error) =>
          state?.finishHydration(error),
      },
    ),
  );
}

export async function rehydrateWorkbenchStore(
  store: ReturnType<typeof createWorkbenchStore>,
): Promise<void> {
  await store.persist.rehydrate();
}

export function migrateWorkbenchState(
  persisted: unknown,
  version: number,
): unknown {
  if (version === 0) {
    const legacy = legacySliceSchema.safeParse(persisted);
    if (!legacy.success) return persisted;
    return {
      sandboxSnapshot: legacy.data.sandboxScenario,
      selectedMode: "sandbox",
      selectedStepId: legacy.data.selectedStepId,
      advancedDetails: legacy.data.advancedDetails,
    };
  }
  return persisted;
}

export function mergePersistedWorkbenchState(
  persisted: unknown,
  current: WorkbenchStoreState,
): WorkbenchStoreState {
  const slice = persistedSliceSchema.safeParse(persisted);
  if (!slice.success) {
    return {
      ...current,
      hydrationError: incompatibleStateError(slice.error),
    };
  }
  const scenario = parsePersistedSandboxScenario(slice.data.sandboxSnapshot);
  if (!scenario.success) {
    return {
      ...current,
      hydrationError: incompatibleStateError(scenario.issues),
    };
  }
  return {
    ...current,
    scenario: scenario.state,
    sandboxSnapshot: serializeSandboxScenario(scenario.state),
    selectedMode: slice.data.selectedMode,
    selectedStepId: slice.data.selectedStepId,
    advancedDetails: slice.data.advancedDetails,
    hydrationError: undefined,
  };
}

function assertSandboxScenario(
  scenario: ScenarioState,
): asserts scenario is ScenarioState & {
  readonly mode: "sandbox";
  readonly network: "SANDBOX";
  readonly proofKind: "simulated";
} {
  if (
    scenario.mode !== "sandbox" ||
    scenario.network !== "SANDBOX" ||
    scenario.proofKind !== "simulated"
  ) {
    throw new TypeError(
      "The persisted workbench scenario must be simulated SANDBOX state.",
    );
  }
}

function incompatibleStateError(cause: unknown): LabError {
  return createLabError({
    code: "SAVED_STATE_INCOMPATIBLE",
    mode: "sandbox",
    network: "SANDBOX",
    phase: "failed",
    rawCause: cause,
  });
}

function createNoopStorage(): StateStorage {
  return {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
  };
}
