import { assertPositiveAmount } from "./amounts";
import { createLabError } from "./errors";
import type {
  ActorState,
  EvidenceRecord,
  LabAction,
  LabError,
  LabEvent,
  Network,
  ProofKind,
  ScenarioState,
  ScenarioStep,
  TokenState,
} from "./types";

export const SCENARIO_SCHEMA_VERSION = 1;
export const CANONICAL_TOKEN_ID = "lab-token";

export function createCanonicalScenarioState(input?: {
  readonly runId?: string;
  readonly seed?: string;
  readonly now?: string;
}): ScenarioState {
  const runId = input?.runId ?? "sandbox-run-1";
  const seed = input?.seed ?? "strk20-workbench-canonical";
  const timestamp = input?.now ?? "2026-09-02T00:00:00.000Z";
  const token: TokenState = {
    id: CANONICAL_TOKEN_ID,
    symbol: "LAB",
    decimals: 0,
    fictional: true,
  };
  const alice: ActorState = {
    id: "alice",
    name: "Alice",
    address: "0xA11CE",
    registered: false,
    publicBalances: { [token.id]: 100n },
    privateBalances: { [token.id]: 0n },
  };
  const bob: ActorState = {
    id: "bob",
    name: "Bob",
    address: "0xB0B",
    registered: false,
    publicBalances: { [token.id]: 0n },
    privateBalances: { [token.id]: 0n },
  };

  return freezeScenario({
    schemaVersion: SCENARIO_SCHEMA_VERSION,
    runId,
    seed,
    mode: "sandbox",
    network: "SANDBOX",
    proofKind: "simulated",
    actors: { alice, bob },
    tokens: { [token.id]: token },
    steps: [],
    timeline: [
      {
        id: `${runId}:event:1`,
        runId,
        timestamp,
        mode: "sandbox",
        proofKind: "simulated",
        type: "scenario.created",
        payload: { seed },
      },
    ],
    evidence: [],
  });
}

export function createInitialState(input: {
  readonly runId: string;
  readonly seed: string;
  readonly mode: "sandbox" | "real";
  readonly network: Network;
  readonly proofKind: ProofKind;
  readonly actors: Readonly<Record<string, ActorState>>;
  readonly tokens: Readonly<Record<string, TokenState>>;
  readonly now: string;
}): ScenarioState {
  return freezeScenario({
    schemaVersion: SCENARIO_SCHEMA_VERSION,
    runId: input.runId,
    seed: input.seed,
    mode: input.mode,
    network: input.network,
    proofKind: input.proofKind,
    actors: input.actors,
    tokens: input.tokens,
    steps: [],
    timeline: [
      {
        id: `${input.runId}:event:1`,
        runId: input.runId,
        timestamp: input.now,
        mode: input.mode,
        proofKind: input.proofKind,
        type: "scenario.created",
        payload: { seed: input.seed },
      },
    ],
    evidence: [],
  });
}

export function createImmutableScenarioSnapshot(
  state: ScenarioState,
): ScenarioState {
  return freezeScenario(state);
}

export function getBalance(
  state: ScenarioState,
  actorId: string,
  tokenId: string,
  kind: "public" | "private",
): bigint {
  const actor = state.actors[actorId];
  if (!actor) return 0n;
  return (
    (kind === "public" ? actor.publicBalances : actor.privateBalances)[
      tokenId
    ] ?? 0n
  );
}

export function validateAction(
  state: ScenarioState,
  action: LabAction,
  stepId?: string,
): LabError | undefined {
  const common = {
    mode: state.mode,
    network: state.network,
    phase: "validating" as const,
    stepId,
  };
  const uncertain = state.steps.find((step) => step.status === "uncertain");
  if (uncertain)
    return createLabError({
      ...common,
      code: "TRANSACTION_UNCERTAIN",
      explanation: `Resolve ${uncertain.id} before starting another action.`,
    });
  if (state.activeStepId)
    return createLabError({
      ...common,
      code: "INVALID_ACTION",
      explanation: "Another action is already active.",
    });

  if (action.type === "register") {
    const actor = state.actors[action.actorId];
    if (!actor || actor.registered)
      return createLabError({
        ...common,
        code: "INVALID_ACTION",
        explanation: actor
          ? "This actor is already registered."
          : "The actor does not exist.",
      });
    return undefined;
  }

  if (typeof action.amount !== "bigint")
    return createLabError({
      ...common,
      code: "INVALID_ACTION",
      explanation: "Amounts must use integer base units.",
    });
  try {
    assertPositiveAmount(action.amount);
  } catch (cause) {
    return createLabError({
      ...common,
      code: "INVALID_ACTION",
      rawCause: cause,
    });
  }
  if (!state.tokens[action.token.id])
    return createLabError({
      ...common,
      code: "INVALID_ACTION",
      explanation: "The selected token is not part of this scenario.",
    });

  if (action.type === "private-transfer") {
    const sender = state.actors[action.from];
    const recipient = state.actors[action.to];
    if (!sender || !recipient || action.from === action.to)
      return createLabError({
        ...common,
        code: "INVALID_ACTION",
        explanation: "A private transfer needs two different known actors.",
      });
    if (!sender.registered || !recipient.registered)
      return createLabError({ ...common, code: "NOT_REGISTERED" });
    if (
      getBalance(state, action.from, action.token.id, "private") < action.amount
    )
      return createLabError({
        ...common,
        code: "INSUFFICIENT_PRIVATE_BALANCE",
      });
    return undefined;
  }

  const actor = state.actors[action.actorId];
  if (!actor)
    return createLabError({
      ...common,
      code: "INVALID_ACTION",
      explanation: "The actor does not exist.",
    });
  if (!actor.registered)
    return createLabError({ ...common, code: "NOT_REGISTERED" });
  if (action.type === "withdraw" && action.recipient.trim().length === 0)
    return createLabError({
      ...common,
      code: "INVALID_ACTION",
      explanation: "A withdrawal needs a public recipient address.",
    });
  const balanceKind = action.type === "shield" ? "public" : "private";
  if (
    getBalance(state, action.actorId, action.token.id, balanceKind) <
    action.amount
  ) {
    return createLabError({
      ...common,
      code:
        action.type === "shield"
          ? "INSUFFICIENT_PUBLIC_BALANCE"
          : "INSUFFICIENT_PRIVATE_BALANCE",
    });
  }
  return undefined;
}

export function applySuccessfulAction(
  state: ScenarioState,
  action: LabAction,
): ScenarioState {
  const before = totalValue(state);
  const actors = { ...state.actors };
  if (action.type === "register") {
    const actor = requireActor(state, action.actorId);
    actors[action.actorId] = { ...actor, registered: true };
  } else if (action.type === "private-transfer") {
    actors[action.from] = changeActorBalance(
      requireActor(state, action.from),
      action.token.id,
      0n,
      -action.amount,
    );
    actors[action.to] = changeActorBalance(
      requireActor(state, action.to),
      action.token.id,
      0n,
      action.amount,
    );
  } else {
    const actor = requireActor(state, action.actorId);
    actors[action.actorId] = changeActorBalance(
      actor,
      action.token.id,
      action.type === "shield" ? -action.amount : action.amount,
      action.type === "shield" ? action.amount : -action.amount,
    );
  }
  const next = freezeScenario({ ...state, actors });
  if (totalValue(next) !== before)
    throw new Error("Scenario value-conservation invariant failed.");
  return next;
}

export function totalValue(state: ScenarioState): bigint {
  return Object.values(state.actors).reduce(
    (total, actor) =>
      total +
      Object.values(actor.publicBalances).reduce(
        (sum, amount) => sum + amount,
        0n,
      ) +
      Object.values(actor.privateBalances).reduce(
        (sum, amount) => sum + amount,
        0n,
      ),
    0n,
  );
}

export function freezeScenario(state: ScenarioState): ScenarioState {
  const actors = Object.fromEntries(
    Object.entries(state.actors).map(([id, actor]) => [
      id,
      Object.freeze({
        ...actor,
        publicBalances: Object.freeze({ ...actor.publicBalances }),
        privateBalances: Object.freeze({ ...actor.privateBalances }),
      }),
    ]),
  );
  const tokens = Object.fromEntries(
    Object.entries(state.tokens).map(([id, token]) => [
      id,
      Object.freeze({ ...token }),
    ]),
  );
  const steps = state.steps.map((step) =>
    Object.freeze({
      ...step,
      action: freezeAction(step.action),
      error: step.error ? Object.freeze({ ...step.error }) : undefined,
    }),
  );
  const timeline = state.timeline.map((event) =>
    Object.freeze({ ...event, payload: Object.freeze({ ...event.payload }) }),
  );
  const evidence = state.evidence.map((record) => Object.freeze({ ...record }));
  return Object.freeze({
    ...state,
    actors: Object.freeze(actors),
    tokens: Object.freeze(tokens),
    steps: Object.freeze(steps),
    timeline: Object.freeze(timeline),
    evidence: Object.freeze(evidence),
  });
}

export function appendStep(
  state: ScenarioState,
  step: ScenarioStep,
): ScenarioState {
  return freezeScenario({
    ...state,
    steps: [...state.steps, step],
    activeStepId: step.id,
    lastError: undefined,
  });
}

export function updateStep(
  state: ScenarioState,
  stepId: string,
  patch: Partial<
    Pick<ScenarioStep, "status" | "updatedAt" | "transactionHash" | "error">
  >,
): ScenarioState {
  return freezeScenario({
    ...state,
    steps: state.steps.map((step) =>
      step.id === stepId ? { ...step, ...patch } : step,
    ),
  });
}

export function appendEvent(
  state: ScenarioState,
  event: LabEvent,
): ScenarioState {
  return freezeScenario({ ...state, timeline: [...state.timeline, event] });
}

export function finalizeState(input: {
  readonly state: ScenarioState;
  readonly proofKind?: ProofKind;
  readonly error?: LabError;
  readonly evidence?: EvidenceRecord;
}): ScenarioState {
  const evidenceExists =
    input.evidence &&
    input.state.evidence.some(
      (record) =>
        record.id === input.evidence?.id ||
        (record.transactionHash &&
          record.transactionHash === input.evidence?.transactionHash),
    );
  return freezeScenario({
    ...input.state,
    proofKind: input.proofKind ?? input.state.proofKind,
    activeStepId: undefined,
    lastError: input.error,
    evidence:
      input.evidence && !evidenceExists
        ? [...input.state.evidence, input.evidence]
        : input.state.evidence,
  });
}

export function createEvent(input: {
  readonly state: ScenarioState;
  readonly type: LabEvent["type"];
  readonly timestamp: string;
  readonly stepId?: string;
  readonly proofKind?: ProofKind;
  readonly payload?: Readonly<Record<string, unknown>>;
}): LabEvent {
  return Object.freeze({
    id: `${input.state.runId}:event:${input.state.timeline.length + 1}`,
    runId: input.state.runId,
    stepId: input.stepId,
    timestamp: input.timestamp,
    mode: input.state.mode,
    proofKind: input.proofKind ?? input.state.proofKind,
    type: input.type,
    payload: Object.freeze({ ...(input.payload ?? {}) }),
  });
}

function requireActor(state: ScenarioState, actorId: string): ActorState {
  const actor = state.actors[actorId];
  if (!actor) throw new Error(`Unknown actor: ${actorId}`);
  return actor;
}

function changeActorBalance(
  actor: ActorState,
  tokenId: string,
  publicDelta: bigint,
  privateDelta: bigint,
): ActorState {
  const publicBalance = (actor.publicBalances[tokenId] ?? 0n) + publicDelta;
  const privateBalance = (actor.privateBalances[tokenId] ?? 0n) + privateDelta;
  if (publicBalance < 0n || privateBalance < 0n)
    throw new Error("Scenario balance cannot become negative.");
  return {
    ...actor,
    publicBalances: { ...actor.publicBalances, [tokenId]: publicBalance },
    privateBalances: { ...actor.privateBalances, [tokenId]: privateBalance },
  };
}

function freezeAction(action: LabAction): LabAction {
  if (action.type === "register") return Object.freeze({ ...action });
  return Object.freeze({
    ...action,
    token: Object.freeze({ ...action.token }),
  });
}
