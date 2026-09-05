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

export type PoolFeeQuote = Readonly<{
  amount: bigint;
  label: string;
}>;

export type PoolFeePreview = Readonly<{
  totalLabel: string;
  warning?: string;
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
      ? buildPoolFeePreview(draft.amount, poolFee.quote)
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
            <span>Amount in STRK</span>
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
                    <span>Amount + pool fee</span>
                    <strong>{feePreview.totalLabel}</strong>
                  </div>
                  <small>
                    Your wallet shows any additional charges before approval.
                  </small>
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
              disabled={poolFee.status !== "ready" || !feePreview}
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
          <ActionReviewPanel
            action={reviewedDraft.action}
            amount={reviewedDraft.amount}
            busy={busy}
            disabled={state.phase === "uncertain"}
            explorerUrl={explorerUrl(state.transactionHash)}
            networkLabel="Starknet Mainnet"
            onCancel={closeOrCancel}
            onConfirm={() => void controller.confirm()}
            poolFee={`${poolFee.status === "ready" ? poolFee.quote.label : "Unavailable"} · confirm again in your wallet`}
            recipientAddress={reviewedDraft.recipient || undefined}
            status={displayStatus(state.phase)}
            tokenAddress={STRK_TOKEN}
            tokenSymbol="STRK"
            transactionHash={state.transactionHash}
          />

          {state.message ? (
            <p className={styles.controllerMessage}>{state.message}</p>
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
            <button
              className={styles.recoveryAction}
              type="button"
              onClick={() => controller.retryReview()}
            >
              Review the same action again
            </button>
          ) : null}
        </div>
      )}
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
): PoolFeePreview | undefined {
  let amount: bigint;
  try {
    amount = parseTokenAmount(amountInput, STRK_DECIMALS);
  } catch {
    return undefined;
  }

  return {
    totalLabel: formatTokenAmount(amount + fee.amount, STRK),
    ...(fee.amount > amount
      ? {
          warning: `The ${fee.label} pool fee is greater than your ${formatTokenAmount(amount, STRK)} amount. Review the cost before continuing.`,
        }
      : {}),
  };
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
      return "Ready X says this wallet has not used STRK20 yet. Your first successful shield registers it automatically. No transaction was started.";
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
    return "This wallet is not registered with STRK20 yet. Registration happens on first use.";
  }
  return "The private balance could not be read. No transaction was started.";
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
