"use client";

import {
  formatTokenAmount,
  parseTokenAmount,
  type LabAction,
  type LabError,
} from "@strk20-workbench/lab-core";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  ActionReviewPanel,
  type RealAction,
  type RealActionStatus,
} from "../action-review";
import {
  RealActionController,
  type RealActionPhase,
  type RealActionState,
} from "../../lib/wallet/real-action-controller";
import type {
  PrivateBalance,
  WalletApiAdapter,
} from "../../lib/wallet/wallet-api-adapter";
import styles from "./real-wallet-gateway.module.css";

const STRK_TOKEN =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
const STRK_DECIMALS = 18;
const STRK = {
  id: STRK_TOKEN,
  symbol: "STRK",
  decimals: STRK_DECIMALS,
  fictional: false,
} as const;

type Draft = Readonly<{
  action: RealAction;
  amount: string;
  recipient: string;
}>;

type PoolFeeState =
  | Readonly<{ status: "loading"; label: string }>
  | Readonly<{ status: "ready"; quote: PoolFeeQuote }>
  | Readonly<{ status: "error"; label: string }>;

type PrivateBalanceState =
  | Readonly<{ status: "idle" }>
  | Readonly<{ status: "requesting" }>
  | Readonly<{ status: "ready"; label: string }>
  | Readonly<{ status: "error"; label: string }>;

type RegistrationCheckState =
  | Readonly<{ status: "idle" }>
  | Readonly<{ status: "checking" }>
  | Readonly<{ status: "waiting"; message: string }>;

export type PoolFeeQuote = Readonly<{
  amount: bigint;
  label: string;
}>;

export type PoolFeePreview = Readonly<{
  costLabel: string;
  costValue: string;
  outcomeLabel: string;
  outcomeValue: string;
  note: string;
  blocksReview: boolean;
  warning?: string;
}>;

export type SafeFailureDiagnostic = Readonly<{
  phase: string;
  workbenchCode: string;
  walletCode?: string;
  walletMessage?: string;
  walletDetail?: string;
  transactionHash: string;
}>;

const EMPTY_DRAFT: Draft = {
  action: "shield",
  amount: "",
  recipient: "",
};

export function RealActionFlow({
  adapter,
  walletName,
}: Readonly<{
  adapter: WalletApiAdapter;
  walletName: string;
}>) {
  const [state, setState] = useState<RealActionState>({ phase: "idle" });
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [reviewedDraft, setReviewedDraft] = useState<Draft>();
  const [draftError, setDraftError] = useState<string>();
  const [feeRefresh, setFeeRefresh] = useState(0);
  const [poolFee, setPoolFee] = useState<PoolFeeState>({
    status: "loading",
    label: "Checking the official pool…",
  });
  const [privateBalance, setPrivateBalance] = useState<PrivateBalanceState>({
    status: "idle",
  });
  const [registrationCheck, setRegistrationCheck] =
    useState<RegistrationCheckState>({ status: "idle" });
  const [registrationConfirmed, setRegistrationConfirmed] = useState(false);
  const balanceRequest = useRef<AbortController | undefined>(undefined);
  const controller = useMemo(
    () => new RealActionController({ adapter, onChange: setState }),
    [adapter],
  );

  useEffect(() => {
    let active = true;
    void readPoolFee()
      .then((quote) => {
        if (active) setPoolFee({ status: "ready", quote });
      })
      .catch(() => {
        if (active) {
          setPoolFee({
            status: "error",
            label: "Unavailable — real actions stay locked",
          });
        }
      });
    return () => {
      active = false;
    };
  }, [feeRefresh]);

  useEffect(
    () => () => {
      balanceRequest.current?.abort();
    },
    [],
  );

  async function requestPrivateBalance() {
    balanceRequest.current?.abort();
    const request = new AbortController();
    balanceRequest.current = request;
    setPrivateBalance({ status: "requesting" });

    try {
      const label = await readPrivateStrkBalance(adapter, request.signal);
      if (!request.signal.aborted) {
        setPrivateBalance({ status: "ready", label });
      }
    } catch (error) {
      if (!request.signal.aborted) {
        setPrivateBalance({
          status: "error",
          label: privateBalanceErrorMessage(error),
        });
      }
    }
  }

  async function recheckRegistration() {
    setRegistrationCheck({ status: "checking" });
    try {
      const label = await readPrivateStrkBalance(adapter);
      setPrivateBalance({ status: "ready", label });
      setRegistrationConfirmed(true);
      setRegistrationCheck({ status: "idle" });
      controller.retryReview();
    } catch (error) {
      const message = isRegistrationRequired(error)
        ? `${walletName} still reports that this account is not registered. Wait for the wallet shield transaction to confirm, then check again.`
        : privateBalanceErrorMessage(error);
      setPrivateBalance({ status: "error", label: message });
      setRegistrationCheck({ status: "waiting", message });
    }
  }

  function hidePrivateBalance() {
    balanceRequest.current?.abort();
    setPrivateBalance({ status: "idle" });
  }

  function retryPoolFee() {
    setPoolFee({
      status: "loading",
      label: "Checking the official pool…",
    });
    setFeeRefresh((attempt) => attempt + 1);
  }

  function review() {
    try {
      const action = createReviewedAction(draft);
      setDraftError(undefined);
      setReviewedDraft(draft);
      controller.review(action, createIdempotencyKey(draft.action));
    } catch (error) {
      setDraftError(
        error instanceof Error
          ? error.message
          : "Check the action details and try again.",
      );
    }
  }

  function closeOrCancel() {
    if (state.phase === "review") controller.cancelReview();
    else controller.dismiss();
  }

  const showingReview = state.phase !== "idle" && reviewedDraft;
  const busy = isActivePhase(state.phase);
  const feePreview =
    poolFee.status === "ready"
      ? buildPoolFeePreview(draft.amount, poolFee.quote, draft.action)
      : undefined;

  return (
    <section
      className={styles.realActionFlow}
      aria-labelledby="real-action-title"
    >
      <header className={styles.realActionHeading}>
        <div>
          <span>Live action builder</span>
          <h3 id="real-action-title">Make one private money move.</h3>
        </div>
        <p>
          Connected through {walletName}. The wallet keeps your keys, notes,
          private balances, discovery, and proof data.
        </p>
      </header>

      <div className={styles.privateBalanceAccess}>
        <div>
          <span>Private STRK balance</span>
          <strong>
            {privateBalance.status === "ready"
              ? privateBalance.label
              : "Hidden until you ask"}
          </strong>
          <p>
            This asks {walletName} for permission to reveal only your private
            STRK total to this page. It never reveals your viewing key or note
            contents, and it does not start a transaction.
          </p>
          {privateBalance.status === "error" ? (
            <small role="alert">{privateBalance.label}</small>
          ) : null}
        </div>
        <button
          type="button"
          disabled={privateBalance.status === "requesting"}
          onClick={() =>
            privateBalance.status === "ready"
              ? hidePrivateBalance()
              : void requestPrivateBalance()
          }
        >
          {privateBalance.status === "requesting"
            ? "Waiting for wallet…"
            : privateBalance.status === "ready"
              ? "Hide balance"
              : privateBalance.status === "error"
                ? "Try balance again"
                : "Check private STRK balance"}
        </button>
      </div>

      {!showingReview ? (
        <form
          className={styles.actionForm}
          onSubmit={(event) => {
            event.preventDefault();
            review();
          }}
        >
          <label>
            <span>What do you want to do?</span>
            <select
              value={draft.action}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  action: event.target.value as RealAction,
                })
              }
            >
              <option value="shield">Make public STRK private</option>
              <option value="private-transfer">Send private STRK</option>
              <option value="withdraw">Return private STRK to public</option>
            </select>
          </label>

          <label>
            <span>{amountInputLabel(draft.action)}</span>
            <input
              autoComplete="off"
              inputMode="decimal"
              min="0"
              name="amount"
              placeholder="Enter an amount"
              required
              value={draft.amount}
              onChange={(event) =>
                setDraft({ ...draft, amount: event.target.value })
              }
            />
            <div className={styles.feePreview} aria-live="polite">
              <div>
                <span>Live pool fee</span>
                <strong>
                  {poolFee.status === "ready"
                    ? poolFee.quote.label
                    : poolFee.label}
                </strong>
              </div>
              {feePreview ? (
                <>
                  <div>
                    <span>{feePreview.costLabel}</span>
                    <strong>{feePreview.costValue}</strong>
                  </div>
                  <div>
                    <span>{feePreview.outcomeLabel}</span>
                    <strong>{feePreview.outcomeValue}</strong>
                  </div>
                  <small>{feePreview.note}</small>
                </>
              ) : (
                <small>Enter an amount to see the expected STRK cost.</small>
              )}
            </div>
            {feePreview?.warning ? (
              <p className={styles.feeWarning} role="alert">
                {feePreview.warning}
              </p>
            ) : null}
          </label>

          {draft.action !== "shield" ? (
            <label className={styles.recipientField}>
              <span>
                {draft.action === "withdraw"
                  ? "Public recipient address"
                  : "Registered private recipient address"}
              </span>
              <input
                autoComplete="off"
                name="recipient"
                placeholder="0x..."
                required
                spellCheck="false"
                value={draft.recipient}
                onChange={(event) =>
                  setDraft({ ...draft, recipient: event.target.value.trim() })
                }
              />
              {draft.action === "private-transfer" ? (
                <small>
                  The recipient must already be registered with STRK20. Your
                  wallet sets up the private channel automatically.
                </small>
              ) : null}
            </label>
          ) : null}

          <div className={styles.formBoundary}>
            <p>
              <strong>No transaction starts here.</strong> You will see a final
              review before the wallet prepares anything.
            </p>
            <button
              type="submit"
              disabled={
                poolFee.status !== "ready" ||
                !feePreview ||
                feePreview.blocksReview
              }
            >
              Review real action
            </button>
          </div>
          {poolFee.status === "error" ? (
            <button
              className={styles.recoveryAction}
              type="button"
              onClick={retryPoolFee}
            >
              Check the pool fee again
            </button>
          ) : null}
          {draftError ? <p role="alert">{draftError}</p> : null}
        </form>
      ) : (
        <div className={styles.actionReviewStage}>
          {registrationConfirmed && state.phase === "review" ? (
            <p className={styles.registrationConfirmed} role="status">
              Registration confirmed. Review the action once more before asking{" "}
              {walletName} to continue.
            </p>
          ) : null}
          <ActionReviewPanel
            action={reviewedDraft.action}
            amount={reviewedDraft.amount}
            busy={busy}
            disabled={state.phase === "uncertain"}
            explorerUrl={explorerUrl(state.transactionHash)}
            networkLabel="Starknet Mainnet"
            onCancel={closeOrCancel}
            onConfirm={() => void controller.confirm()}
            poolFee={reviewPoolFeeLabel(reviewedDraft.action, poolFee)}
            recipientAddress={reviewedDraft.recipient || undefined}
            status={displayStatus(state.phase)}
            tokenAddress={STRK_TOKEN}
            tokenSymbol="STRK"
            transactionHash={state.transactionHash}
            expectedPrivateAmount={
              reviewedDraft.action === "shield" && feePreview
                ? feePreview.outcomeValue
                : undefined
            }
          />

          {state.message ? (
            <p className={styles.controllerMessage}>
              {state.error && isRegistrationRequired(state.error)
                ? "This account needs one-time STRK20 wallet setup before it can hold a private balance."
                : state.message}
            </p>
          ) : null}

          {state.phase === "failed" && state.error ? (
            <>
              {isRegistrationRequired(state.error) ? (
                <RegistrationRecovery
                  checking={registrationCheck.status === "checking"}
                  message={
                    registrationCheck.status === "waiting"
                      ? registrationCheck.message
                      : undefined
                  }
                  onRecheck={() => void recheckRegistration()}
                  walletName={walletName}
                />
              ) : null}
              <FailureDiagnostic
                error={state.error}
                transactionHash={state.transactionHash}
              />
            </>
          ) : null}

          {state.phase === "uncertain" ? (
            <button
              className={styles.recoveryAction}
              type="button"
              onClick={() => void controller.checkSubmittedTransaction()}
            >
              Check this transaction — do not resubmit
            </button>
          ) : null}

          {state.phase === "failed" ? (
            !state.error || !isRegistrationRequired(state.error) ? (
              <button
                className={styles.recoveryAction}
                type="button"
                onClick={() => controller.retryReview()}
              >
                Review the same action again
              </button>
            ) : null
          ) : null}
        </div>
      )}
    </section>
  );
}

function RegistrationRecovery({
  checking,
  message,
  onRecheck,
  walletName,
}: Readonly<{
  checking: boolean;
  message?: string;
  onRecheck: () => void;
  walletName: string;
}>) {
  return (
    <section
      className={styles.registrationRecovery}
      aria-labelledby="registration-recovery-title"
    >
      <span>One-time wallet setup</span>
      <h4 id="registration-recovery-title">
        Finish registration inside {walletName}.
      </h4>
      <p>
        STRK20 keeps the viewing key inside your wallet, and Wallet API 0.10.3
        has no registration method a website can call for you.
      </p>
      <ol>
        <li>Open the {walletName} extension and its privacy screen.</li>
        <li>Shield any amount from inside the wallet and approve it there.</li>
        <li>Wait for confirmation, return here, and check registration.</li>
      </ol>
      {message ? <p role="alert">{message}</p> : null}
      <button type="button" disabled={checking} onClick={onRecheck}>
        {checking
          ? "Checking with wallet…"
          : `I shielded in ${walletName} — check again`}
      </button>
      <small>
        This check requests only your private STRK total. It cannot move funds
        or read your viewing key.
      </small>
    </section>
  );
}

export async function readPrivateStrkBalance(
  adapter: Pick<WalletApiAdapter, "readPrivateBalances">,
  signal?: AbortSignal,
): Promise<string> {
  const balances = await adapter.readPrivateBalances([STRK_TOKEN], signal);
  const strkBalance = balances.find(isStrkBalance);
  if (!strkBalance) {
    throw new Error("The wallet did not return a private STRK balance.");
  }
  return formatTokenAmount(strkBalance.balance, STRK);
}

export async function readPoolFee(
  request: typeof fetch = fetch,
): Promise<PoolFeeQuote> {
  const response = await request("/api/pool-fee", {
    method: "GET",
    cache: "no-store",
  });
  if (!response.ok) throw new Error("The pool fee is unavailable.");
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("The pool fee response is invalid.");
  }
  const feeFormatted = (payload as { feeFormatted?: unknown }).feeFormatted;
  const feeAmount = (payload as { feeAmount?: unknown }).feeAmount;
  if (
    typeof feeFormatted !== "string" ||
    !/^\d+(?:\.\d+)? STRK$/.test(feeFormatted) ||
    typeof feeAmount !== "string" ||
    !/^\d+$/.test(feeAmount)
  ) {
    throw new Error("The pool fee response is invalid.");
  }
  const amount = BigInt(feeAmount);
  if (formatTokenAmount(amount, STRK) !== feeFormatted) {
    throw new Error("The pool fee response is inconsistent.");
  }
  return { amount, label: feeFormatted };
}

export function buildPoolFeePreview(
  amountInput: string,
  fee: PoolFeeQuote,
  action: RealAction = "shield",
): PoolFeePreview | undefined {
  let amount: bigint;
  try {
    amount = parseTokenAmount(amountInput, STRK_DECIMALS);
  } catch {
    return undefined;
  }

  const amountLabel = formatTokenAmount(amount, STRK);
  if (action === "shield") {
    const privateAmount = amount > fee.amount ? amount - fee.amount : 0n;
    const blocksReview = amount <= fee.amount;
    return {
      costLabel: "Public STRK leaving wallet",
      costValue: amountLabel,
      outcomeLabel: "Expected private STRK received",
      outcomeValue: formatTokenAmount(privateAmount, STRK),
      note: `The ${fee.label} pool fee is reserved from the shield amount, not added on top.`,
      blocksReview,
      ...(blocksReview
        ? {
            warning: `Enter more than ${fee.label}. This amount would leave 0 STRK private after the pool fee.`,
          }
        : {}),
    };
  }

  return {
    costLabel: "Private STRK balance required",
    costValue: formatTokenAmount(amount + fee.amount, STRK),
    outcomeLabel:
      action === "private-transfer"
        ? "Private recipient receives"
        : "Public recipient receives",
    outcomeValue: amountLabel,
    note: `The ${fee.label} pool fee is charged from your private balance in addition to this amount.`,
    blocksReview: false,
  };
}

function amountInputLabel(action: RealAction): string {
  if (action === "shield") return "Total public STRK to deposit";
  if (action === "private-transfer") return "Private STRK to send";
  return "Private STRK to withdraw";
}

function reviewPoolFeeLabel(action: RealAction, poolFee: PoolFeeState): string {
  if (poolFee.status !== "ready") return "Unavailable";
  return action === "shield"
    ? `${poolFee.quote.label} · deducted from this deposit`
    : `${poolFee.quote.label} · charged from private balance`;
}

function FailureDiagnostic({
  error,
  transactionHash,
}: Readonly<{ error: LabError; transactionHash?: string }>) {
  const diagnostic = buildSafeFailureDiagnostic(error, transactionHash);
  return (
    <details className={styles.failureDiagnostic} open>
      <summary>Safe failure details</summary>
      <dl>
        <div>
          <dt>Stopped during</dt>
          <dd>{diagnostic.phase}</dd>
        </div>
        <div>
          <dt>Workbench code</dt>
          <dd>{diagnostic.workbenchCode}</dd>
        </div>
        {diagnostic.walletCode ? (
          <div>
            <dt>Wallet code</dt>
            <dd>{diagnostic.walletCode}</dd>
          </div>
        ) : null}
        {diagnostic.walletMessage ? (
          <div>
            <dt>Wallet message</dt>
            <dd>{diagnostic.walletMessage}</dd>
          </div>
        ) : null}
        {diagnostic.walletDetail ? (
          <div>
            <dt>Wallet detail</dt>
            <dd>{diagnostic.walletDetail}</dd>
          </div>
        ) : null}
        <div>
          <dt>Transaction hash</dt>
          <dd>{diagnostic.transactionHash}</dd>
        </div>
      </dl>
      <p>
        Only the wallet&apos;s error code and message are shown. Keys, notes,
        balances, RPC URLs, and secrets are never included.
      </p>
    </details>
  );
}

export function buildSafeFailureDiagnostic(
  error: LabError,
  transactionHash?: string,
): SafeFailureDiagnostic {
  const walletValues = collectWalletDiagnosticValues(error.rawCause);
  return {
    phase: failurePhaseLabel(error.phase),
    workbenchCode: error.code,
    ...(walletValues.codes[0] ? { walletCode: walletValues.codes[0] } : {}),
    ...(walletValues.messages[0]
      ? { walletMessage: walletValues.messages[0] }
      : {}),
    ...(walletValues.messages[1]
      ? { walletDetail: walletValues.messages[1] }
      : {}),
    transactionHash: transactionHash ?? "No hash returned by wallet",
  };
}

function collectWalletDiagnosticValues(value: unknown): {
  codes: string[];
  messages: string[];
} {
  const codes: string[] = [];
  const messages: string[] = [];

  function visit(candidate: unknown, depth: number) {
    if (depth > 3 || candidate === null || candidate === undefined) return;
    if (typeof candidate === "string") {
      addUnique(messages, sanitizeDiagnosticText(candidate));
      return;
    }
    if (typeof candidate !== "object" || Array.isArray(candidate)) return;

    const record = candidate as Record<string, unknown>;
    if (typeof record.code === "number" || typeof record.code === "string") {
      addUnique(codes, String(record.code).slice(0, 64));
    }
    if (typeof record.message === "string") {
      addUnique(messages, sanitizeDiagnosticText(record.message));
    }
    for (const key of ["error", "cause", "data", "details"] as const) {
      visit(record[key], depth + 1);
    }
  }

  visit(value, 0);
  return { codes, messages };
}

function addUnique(values: string[], value: string) {
  if (value && !values.includes(value)) values.push(value);
}

function sanitizeDiagnosticText(value: string): string {
  return value
    .replace(/\bhttps?:\/\/[^\s)]+/giu, "[redacted URL]")
    .replace(/\bbearer\s+\S+/giu, "Bearer [redacted]")
    .replace(
      /\b(api[_-]?key|token|secret|authorization|password|credential|rpc)\s*[:=]\s*["']?[^\s,"'}]+/giu,
      "$1=[redacted]",
    )
    .replace(/\s+/gu, " ")
    .trim()
    .slice(0, 280);
}

function failurePhaseLabel(phase: LabError["phase"]): string {
  const labels: Partial<Record<LabError["phase"], string>> = {
    validating: "Action validation",
    "awaiting-user": "Wallet request",
    "preparing-proof": "Proof preparation",
    submitting: "Wallet submission",
    confirming: "Receipt confirmation",
  };
  return labels[phase] ?? phase.replaceAll("-", " ");
}

export function createReviewedAction(draft: Draft): LabAction {
  const amount = parseTokenAmount(draft.amount, STRK_DECIMALS);
  if (draft.action === "shield") {
    return {
      type: "shield",
      actorId: "alice",
      token: { id: STRK_TOKEN },
      amount,
    };
  }
  const recipient = requireStarknetAddress(draft.recipient);
  if (draft.action === "withdraw") {
    return {
      type: "withdraw",
      actorId: "alice",
      recipient,
      token: { id: STRK_TOKEN },
      amount,
    };
  }
  return {
    type: "private-transfer",
    from: "alice",
    to: recipient,
    token: { id: STRK_TOKEN },
    amount,
  };
}

export function displayStatus(phase: RealActionPhase): RealActionStatus {
  if (phase === "submitting") return "submitted";
  if (phase === "idle") return "review";
  return phase;
}

function requireStarknetAddress(value: string): string {
  if (!/^0x[0-9a-fA-F]{1,64}$/.test(value)) {
    throw new TypeError("Enter a valid Starknet recipient address.");
  }
  return value;
}

function createIdempotencyKey(action: RealAction): string {
  const randomPart = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
  return `${action}-${randomPart}`;
}

function explorerUrl(transactionHash?: string): string | undefined {
  return transactionHash
    ? `https://voyager.online/tx/${transactionHash}`
    : undefined;
}

function isStrkBalance(balance: PrivateBalance): boolean {
  try {
    return BigInt(balance.token) === BigInt(STRK_TOKEN);
  } catch {
    return false;
  }
}

export function privateBalanceErrorMessage(error: unknown): string {
  if (isLabError(error)) {
    if (error.code === "NOT_REGISTERED") {
      return "STRK20 is available, but this account has not completed one-time wallet setup. Open Ready X, shield once from its own privacy screen, then return and try again. No transaction was started.";
    }
    if (error.code === "WALLET_REJECTED") {
      return "Balance access was cancelled in the wallet. No private balance was shared.";
    }
    if (error.code === "WALLET_UNSUPPORTED") {
      return "This wallet version cannot provide the STRK20 balance request. No transaction was started.";
    }
  }
  const message = walletErrorMessage(error);
  if (/reject|refus|cancel/i.test(message)) {
    return "Balance access was cancelled. No private balance was shared.";
  }
  if (/not.?registered/i.test(message)) {
    return "This account is not registered with STRK20 yet. Shield once from the wallet's own privacy screen, then return and try again.";
  }
  return "The private balance could not be read. No transaction was started.";
}

export function isRegistrationRequired(error: unknown): boolean {
  if (isLabError(error)) return error.code === "NOT_REGISTERED";
  return /not.?registered/i.test(walletErrorMessage(error));
}

function isLabError(error: unknown): error is LabError {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  );
}

function walletErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    error !== null &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "";
}

function isActivePhase(phase: RealActionPhase): boolean {
  return [
    "awaiting-wallet",
    "preparing-proof",
    "submitting",
    "confirming",
  ].includes(phase);
}
