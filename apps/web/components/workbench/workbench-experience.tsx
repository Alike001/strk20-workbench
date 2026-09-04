"use client";

import {
  getBalance,
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
  type GuidedStage,
  type ScenarioAmounts,
} from "../../lib/workbench/runtime";
import {
  createWorkbenchStore,
  rehydrateWorkbenchStore,
} from "../../lib/workbench/store";
import { ActorCard } from "../actor-card";
import { EnvironmentStatus } from "../environment-status";
import { AdvancedDetails } from "./advanced-details";
import { ErrorRecoveryPanel } from "./error-recovery-panel";
import { PrivacyXRay } from "./privacy-xray";
import { ScenarioSteps, type ScenarioStepView } from "./scenario-steps";
import { TransactionTimeline } from "./transaction-timeline";
import styles from "./workbench.module.css";

const stageOrder: readonly Exclude<GuidedStage, "complete">[] = [
  "register",
  "shield",
  "private-transfer",
  "withdraw",
];

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
  const selectedAction = actionForSelection(scenario, selectedStepId);

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
        await runtime.runNext(parsed.amounts, { failNext, onState: update });
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
        "Reset the fictional Sandbox scenario? Wallet and real-network session data will not be changed.",
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
      <EnvironmentStatus
        ariaLabel="Current workbench environment"
        items={[
          {
            label: "Execution",
            value: "Sandbox",
            detail: "Fictional LAB only",
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

      <div className={styles.workspace}>
        <ScenarioSteps
          amounts={amounts}
          busy={busy || !hydrated}
          complete={stage === "complete"}
          failNext={failNext}
          onAmountChange={(field, value) =>
            setAmounts((current) => ({ ...current, [field]: value }))
          }
          onFailNextChange={setFailNext}
          onReset={reset}
          onRunAll={() => void run("all")}
          onRunStep={() => void run("next")}
          steps={stepViews(stage)}
        />

        <div className={styles.centerColumn}>
          <section
            className={styles.actorGrid}
            aria-label="Scenario actors and balances"
          >
            <ActorCard
              active={stage !== "withdraw"}
              address={scenario.actors.alice?.address ?? "Unknown"}
              compact
              name="Alice"
              privateBalance={{
                amount: getBalance(
                  scenario,
                  "alice",
                  "lab-token",
                  "private",
                ).toString(),
                symbol: "LAB",
              }}
              publicBalance={{
                amount: getBalance(
                  scenario,
                  "alice",
                  "lab-token",
                  "public",
                ).toString(),
                symbol: "LAB",
              }}
              registration={
                scenario.actors.alice?.registered
                  ? "registered"
                  : "not-registered"
              }
            />
            <span className={styles.actorFlow} aria-hidden="true">
              private flow →
            </span>
            <ActorCard
              active={stage === "withdraw"}
              address={scenario.actors.bob?.address ?? "Unknown"}
              compact
              name="Bob"
              privateBalance={{
                amount: getBalance(
                  scenario,
                  "bob",
                  "lab-token",
                  "private",
                ).toString(),
                symbol: "LAB",
              }}
              publicBalance={{
                amount: getBalance(
                  scenario,
                  "bob",
                  "lab-token",
                  "public",
                ).toString(),
                symbol: "LAB",
              }}
              registration={
                scenario.actors.bob?.registered
                  ? "registered"
                  : "not-registered"
              }
            />
          </section>
          <TransactionTimeline
            events={scenario.timeline}
            onSelectStep={(stepId) =>
              store.getState().setSelectedStepId(stepId)
            }
            selectedStepId={selectedStepId}
            steps={scenario.steps}
          />
        </div>

        <PrivacyXRay action={selectedAction} />
      </div>

      <AdvancedDetails
        onOpenChange={(open) => store.getState().setAdvancedDetails(open)}
        open={advancedDetails}
        state={scenario}
      />
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
        message: "Every scenario amount must be greater than zero.",
      };
    }
    return { success: true, amounts: parsed };
  } catch {
    return {
      success: false,
      message: "Use whole, positive LAB base-unit amounts only.",
    };
  }
}

function stepViews(stage: GuidedStage): readonly ScenarioStepView[] {
  const current =
    stage === "complete" ? stageOrder.length : stageOrder.indexOf(stage);
  const descriptions = [
    "Open private channels for Alice and Bob.",
    "Move Alice’s public LAB into a shielded balance.",
    "Move private LAB from Alice to Bob.",
    "Return part of Bob’s balance to public state.",
  ];
  return stageOrder.map((item, index) => ({
    label:
      item === "private-transfer"
        ? "Private transfer"
        : `${item[0]?.toUpperCase()}${item.slice(1)}`,
    description: descriptions[index]!,
    status:
      index < current ? "complete" : index === current ? "ready" : "waiting",
  }));
}

function actionForSelection(
  state: ScenarioState,
  selectedStepId?: string,
): LabAction["type"] {
  return (
    state.steps.find((step) => step.id === selectedStepId)?.action.type ??
    state.steps.at(-1)?.action.type ??
    "private-transfer"
  );
}
