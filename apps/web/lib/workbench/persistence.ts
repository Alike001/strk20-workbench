import {
  createImmutableScenarioSnapshot,
  type ActorState,
  type EvidenceRecord,
  type LabAction,
  type LabError,
  type LabEvent,
  type ScenarioState,
  type ScenarioStep,
} from "@strk20-workbench/lab-core";
import { z } from "zod";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { readonly [key: string]: JsonValue };

const amountSchema = z.string().regex(/^(0|[1-9]\d*)$/);
const tokenRefSchema = z.object({ id: z.string().min(1) });
const actionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("register"), actorId: z.string().min(1) }),
  z.object({
    type: z.literal("shield"),
    actorId: z.string().min(1),
    token: tokenRefSchema,
    amount: amountSchema,
  }),
  z.object({
    type: z.literal("private-transfer"),
    from: z.string().min(1),
    to: z.string().min(1),
    token: tokenRefSchema,
    amount: amountSchema,
  }),
  z.object({
    type: z.literal("withdraw"),
    actorId: z.string().min(1),
    recipient: z.string().min(1),
    token: tokenRefSchema,
    amount: amountSchema,
  }),
]);

const stepStatusSchema = z.enum([
  "idle",
  "validating",
  "awaiting-user",
  "preparing-proof",
  "submitting",
  "confirming",
  "succeeded",
  "cancelled",
  "failed",
  "uncertain",
]);
const errorCodeSchema = z.enum([
  "INVALID_ACTION",
  "NOT_REGISTERED",
  "INSUFFICIENT_PUBLIC_BALANCE",
  "INSUFFICIENT_PRIVATE_BALANCE",
  "WALLET_NOT_FOUND",
  "WALLET_UNSUPPORTED",
  "WALLET_REJECTED",
  "WRONG_NETWORK",
  "DISCOVERY_STALE",
  "PROVER_BUSY",
  "PROVER_UNAVAILABLE",
  "PROOF_FAILED",
  "SUBMISSION_FAILED",
  "TRANSACTION_REVERTED",
  "TRANSACTION_UNCERTAIN",
  "RPC_UNAVAILABLE",
  "SAVED_STATE_INCOMPATIBLE",
  "UNKNOWN",
]);
const labErrorSchema = z.object({
  code: errorCodeSchema,
  title: z.string(),
  explanation: z.string(),
  nextAction: z.string(),
  retryable: z.boolean(),
  phase: stepStatusSchema,
  stepId: z.string().optional(),
  mode: z.literal("sandbox"),
  network: z.literal("SANDBOX"),
  rawCause: z.json().optional(),
});
const actorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  address: z.string().min(1),
  registered: z.boolean(),
  publicBalances: z.record(z.string(), amountSchema),
  privateBalances: z.record(z.string(), amountSchema),
});
const tokenSchema = z.object({
  id: z.string().min(1),
  symbol: z.string().min(1),
  decimals: z.number().int().nonnegative(),
  fictional: z.boolean(),
});
const stepSchema = z.object({
  id: z.string().min(1),
  action: actionSchema,
  idempotencyKey: z.string().min(1),
  status: stepStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  transactionHash: z.string().optional(),
  error: labErrorSchema.optional(),
});
const eventTypeSchema = z.enum([
  "scenario.created",
  "capability.checked",
  "action.validation-started",
  "action.awaiting-user",
  "proof.preparing",
  "transaction.submitted",
  "transaction.confirming",
  "balance.changed",
  "privacy.fact-recorded",
  "action.succeeded",
  "action.cancelled",
  "action.failed",
  "transaction.uncertain",
  "evidence.verified",
]);
const eventSchema = z.object({
  id: z.string().min(1),
  runId: z.string().min(1),
  stepId: z.string().optional(),
  timestamp: z.string(),
  mode: z.literal("sandbox"),
  proofKind: z.literal("simulated"),
  type: eventTypeSchema,
  payload: z.record(z.string(), z.json()),
});
const evidenceSchema = z.object({
  id: z.string().min(1),
  source: z.literal("sandbox"),
  mode: z.literal("sandbox"),
  proofKind: z.literal("simulated"),
  network: z.literal("SANDBOX"),
  action: z.enum([
    "register",
    "shield",
    "private-transfer",
    "withdraw",
    "anonymizer-invoke",
  ]),
  transactionHash: z.string().optional(),
  receiptStatus: z
    .enum(["succeeded", "reverted", "pending", "unknown"])
    .optional(),
  poolInteraction: z
    .enum(["verified", "not-verified", "not-applicable"])
    .optional(),
  explorerUrl: z.string().optional(),
  createdAt: z.string(),
});

export const serializedSandboxScenarioSchema = z.object({
  schemaVersion: z.literal(1),
  runId: z.string().min(1),
  seed: z.string().min(1),
  mode: z.literal("sandbox"),
  network: z.literal("SANDBOX"),
  proofKind: z.literal("simulated"),
  actors: z.record(z.string(), actorSchema),
  tokens: z.record(z.string(), tokenSchema),
  steps: z.array(stepSchema),
  timeline: z.array(eventSchema),
  activeStepId: z.string().optional(),
  lastError: labErrorSchema.optional(),
  evidence: z.array(evidenceSchema),
});

export type SerializedSandboxScenario = z.infer<
  typeof serializedSandboxScenarioSchema
>;

export type PersistedScenarioResult =
  | { readonly success: true; readonly state: ScenarioState }
  | { readonly success: false; readonly issues: readonly string[] };

export function serializeSandboxScenario(
  state: ScenarioState,
): SerializedSandboxScenario {
  if (
    state.mode !== "sandbox" ||
    state.network !== "SANDBOX" ||
    state.proofKind !== "simulated"
  ) {
    throw new TypeError("Only simulated SANDBOX scenarios may be persisted.");
  }

  return serializedSandboxScenarioSchema.parse({
    ...state,
    actors: Object.fromEntries(
      Object.entries(state.actors).map(([id, actor]) => [
        id,
        {
          ...actor,
          publicBalances: serializeBalances(actor.publicBalances),
          privateBalances: serializeBalances(actor.privateBalances),
        },
      ]),
    ),
    steps: state.steps.map((step) => ({
      ...step,
      action: serializeAction(step.action),
      error: step.error ? serializeError(step.error) : undefined,
    })),
    timeline: state.timeline.map((event) => ({
      ...event,
      payload: toJsonRecord(event.payload),
    })),
    lastError: state.lastError ? serializeError(state.lastError) : undefined,
  });
}

export function parsePersistedSandboxScenario(
  value: unknown,
): PersistedScenarioResult {
  const parsed = serializedSandboxScenarioSchema.safeParse(value);
  if (!parsed.success) {
    return {
      success: false,
      issues: parsed.error.issues.map(
        (issue) => `${issue.path.join(".") || "state"}: ${issue.message}`,
      ),
    };
  }

  const data = parsed.data;
  const state: ScenarioState = {
    ...data,
    actors: Object.fromEntries(
      Object.entries(data.actors).map(([id, actor]) => [
        id,
        {
          ...actor,
          publicBalances: deserializeBalances(actor.publicBalances),
          privateBalances: deserializeBalances(actor.privateBalances),
        } satisfies ActorState,
      ]),
    ),
    steps: data.steps.map(
      (step) =>
        ({
          ...step,
          action: deserializeAction(step.action),
          error: step.error as LabError | undefined,
        }) satisfies ScenarioStep,
    ),
    timeline: data.timeline as readonly LabEvent[],
    lastError: data.lastError as LabError | undefined,
    evidence: data.evidence as readonly EvidenceRecord[],
  };
  return { success: true, state: createImmutableScenarioSnapshot(state) };
}

function serializeBalances(
  balances: Readonly<Record<string, bigint>>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(balances).map(([tokenId, amount]) => [
      tokenId,
      amount.toString(),
    ]),
  );
}

function deserializeBalances(
  balances: Readonly<Record<string, string>>,
): Record<string, bigint> {
  return Object.fromEntries(
    Object.entries(balances).map(([tokenId, amount]) => [
      tokenId,
      BigInt(amount),
    ]),
  );
}

function serializeAction(action: LabAction): unknown {
  return action.type === "register"
    ? action
    : { ...action, amount: action.amount.toString() };
}

function deserializeAction(action: z.infer<typeof actionSchema>): LabAction {
  return action.type === "register"
    ? action
    : { ...action, amount: BigInt(action.amount) };
}

function serializeError(error: LabError): unknown {
  return {
    ...error,
    rawCause:
      error.rawCause === undefined ? undefined : toJsonValue(error.rawCause),
  };
}

function toJsonRecord(
  value: Readonly<Record<string, unknown>>,
): Record<string, JsonValue> {
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, child]) => [key, toJsonValue(child)] as const)
      .filter((entry) => entry[1] !== undefined),
  ) as Record<string, JsonValue>;
}

function toJsonValue(value: unknown): JsonValue | undefined {
  if (typeof value === "bigint") return value.toString();
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .map(toJsonValue)
      .filter((item) => item !== undefined) as JsonValue[];
  }
  if (typeof value === "object") {
    return toJsonRecord(value as Readonly<Record<string, unknown>>);
  }
  return undefined;
}
