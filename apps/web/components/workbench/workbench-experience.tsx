"use client";

import {
  parseBaseUnitAmount,
  type LabAction,
  type ScenarioState,
} from "@strk20-workbench/lab-core";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { useStore } from "zustand";

import {
  DEFAULT_SCENARIO_AMOUNTS,
  SandboxWorkbenchRuntime,
  getGuidedStage,
  type ScenarioAmounts,
} from "../../lib/workbench/runtime";
import {
  createWorkbenchStore,
  rehydrateWorkbenchStore,
} from "../../lib/workbench/store";
import { EnvironmentStatus } from "../environment-status";
import { AdvancedDetails } from "./advanced-details";
import { ErrorRecoveryPanel } from "./error-recovery-panel";
import { GuidedAction } from "./guided-action";
import { GuidedProgress, type PlaygroundStage } from "./guided-progress";
import { PrivacyXRay } from "./privacy-xray";
import { TransactionTimeline } from "./transaction-timeline";
import styles from "./workbench.module.css";

export function WorkbenchExperience() {
  const [store] = useState(() => createWorkbenchStore());
  const scenario = useStore(store, (state) => state.scenario);
  const hydrated = useStore(store, (state) => state.hydrated);
  const advancedDetails = useStore(store, (state) => state.advancedDetails);
  const selectedStepId = useStore(store, (state) => state.selectedStepId);
  const runtimeRef = useRef<SandboxWorkbenchRuntime | null>(null);
  const [busy, setBusy] = useState(false);
  const [failNext, setFailNext] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [amounts, setAmounts] = useState({
    shield: DEFAULT_SCENARIO_AMOUNTS.shield.toString(),
    transfer: DEFAULT_SCENARIO_AMOUNTS.transfer.toString(),
    withdraw: DEFAULT_SCENARIO_AMOUNTS.withdraw.toString(),
  });

  useEffect(() => {
    let active = true;
    void rehydrateWorkbenchStore(store).then(() => {
      if (!active) return;
      runtimeRef.current = new SandboxWorkbenchRuntime({
        initialState: store.getState().scenario,
      });
    });
    return () => {
      active = false;
    };
  }, [store]);

  const stage = getGuidedStage(scenario);
  const playgroundStage: PlaygroundStage =
    stage === "register" ? "shield" : stage;
  const visibleAction = actionForStage(playgroundStage);

  async function run(mode: "next" | "all") {
    if (!hydrated || busy) return;
    const parsed = parseAmounts(amounts);
    if (!parsed.success) {
      setFormError(parsed.message);
      return;
    }
    setFormError(undefined);
    setBusy(true);
    const runtime = ensureRuntime(runtimeRef, scenario);
    const update = (state: ScenarioState) => {
      store.getState().setScenario(state);
      store.getState().setSelectedStepId(state.steps.at(-1)?.id);
    };
    try {
      if (mode === "all") {
        await runtime.runAll(parsed.amounts, { failNext, onState: update });
      } else {
        await runtime.runGuidedStep(parsed.amounts, {
          failNext,
          onState: update,
        });
      }
      setFailNext(false);
    } finally {
      setBusy(false);
    }
  }

  async function retry() {
    if (busy) return;
    setBusy(true);
    try {
      await runtimeRef.current?.retry((state) => {
        store.getState().setScenario(state);
        store.getState().setSelectedStepId(state.steps.at(-1)?.id);
      });
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    if (
      !window.confirm(
        "Start the Sandbox example again? No wallet or real funds will be changed.",
      )
    ) {
      return;
    }
    store.getState().resetSandbox();
    runtimeRef.current = new SandboxWorkbenchRuntime({
      initialState: store.getState().scenario,
    });
    setAmounts({ shield: "50", transfer: "20", withdraw: "10" });
    setFailNext(false);
    setFormError(undefined);
  }

  return (
    <div className={styles.experience}>
      {formError ? (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      ) : null}
      <ErrorRecoveryPanel
        busy={busy}
        error={scenario.lastError}
        onRetry={retry}
      />

      <GuidedProgress stage={playgroundStage} />
      <GuidedAction
        amounts={amounts}
        busy={busy}
        hydrated={hydrated}
        onAmountChange={(field, value) =>
          setAmounts((current) => ({ ...current, [field]: value }))
        }
        onReset={reset}
        onRunAll={() => void run("all")}
        onRunStep={() => void run("next")}
        scenario={scenario}
        stage={playgroundStage}
      />
      <PrivacyXRay
        action={visibleAction}
        amount={amountForAction(visibleAction, amounts)}
      />

      <details
        className={styles.developerPanel}
        onToggle={(event) =>
          store.getState().setAdvancedDetails(event.currentTarget.open)
        }
        open={advancedDetails}
      >
        <summary>Developer details</summary>
        <div className={styles.developerIntro}>
          <div>
            <h2>Inspect the Sandbox</h2>
            <p>
              These details help developers test state, recovery and simulated
              events. They are not mainnet evidence.
            </p>
          </div>
          <label className={styles.failureToggle}>
            <input
              checked={failNext}
              disabled={busy || playgroundStage === "complete"}
              onChange={(event) => setFailNext(event.target.checked)}
              type="checkbox"
            />
            <span>
              <strong>Test recovery</strong>
              <small>Make the next simulated proof fail once.</small>
            </span>
          </label>
        </div>
        <EnvironmentStatus
          ariaLabel="Current workbench environment"
          items={[
            {
              label: "Execution",
              value: "Sandbox",
              detail: "Fictional tokens only",
              tone: "ready",
            },
            {
              label: "Proof",
              value: "Simulated",
              detail: "Not mainnet evidence",
              tone: "warning",
            },
            {
              label: "Network",
              value: "Local simulation",
              tone: "inactive",
            },
            {
              label: "State",
              value: hydrated ? "Ready" : "Restoring safely",
              tone: hydrated ? "ready" : "pending",
            },
          ]}
        />
        <TransactionTimeline
          events={scenario.timeline}
          onSelectStep={(stepId) => store.getState().setSelectedStepId(stepId)}
          selectedStepId={selectedStepId}
          steps={scenario.steps}
        />
        <AdvancedDetails
          onOpenChange={() => undefined}
          open={false}
          state={scenario}
        />
      </details>
    </div>
  );
}

function ensureRuntime(
  ref: MutableRefObject<SandboxWorkbenchRuntime | null>,
  state: ScenarioState,
): SandboxWorkbenchRuntime {
  if (
    !ref.current ||
    ref.current.getState().timeline.length !== state.timeline.length
  ) {
    ref.current = new SandboxWorkbenchRuntime({ initialState: state });
  }
  return ref.current;
}

function parseAmounts(
  values: Readonly<{ shield: string; transfer: string; withdraw: string }>,
):
  | { readonly success: true; readonly amounts: ScenarioAmounts }
  | { readonly success: false; readonly message: string } {
  try {
    const parsed = {
      shield: parseBaseUnitAmount(values.shield),
      transfer: parseBaseUnitAmount(values.transfer),
      withdraw: parseBaseUnitAmount(values.withdraw),
    };
    if (
      parsed.shield === 0n ||
      parsed.transfer === 0n ||
      parsed.withdraw === 0n
    ) {
      return {
        success: false,
        message: "Every amount must be greater than zero.",
      };
    }
    return { success: true, amounts: parsed };
  } catch {
    return {
      success: false,
      message: "Use whole, positive token amounts only.",
    };
  }
}

function actionForStage(stage: PlaygroundStage): LabAction["type"] {
  if (stage === "shield") return "shield";
  if (stage === "private-transfer") return "private-transfer";
  return "withdraw";
}

function amountForAction(
  action: LabAction["type"],
  amounts: Readonly<{ shield: string; transfer: string; withdraw: string }>,
): string {
  if (action === "shield") return amounts.shield;
  if (action === "withdraw") return amounts.withdraw;
  return amounts.transfer;
}
