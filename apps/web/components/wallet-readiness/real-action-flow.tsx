"use client";

import { parseTokenAmount, type LabAction } from "@strk20-workbench/lab-core";
import { useMemo, useState } from "react";

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
import type { WalletApiAdapter } from "../../lib/wallet/wallet-api-adapter";
import styles from "./real-wallet-gateway.module.css";

const STRK_TOKEN =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
const STRK_DECIMALS = 18;

type Draft = Readonly<{
  action: RealAction;
  amount: string;
  recipient: string;
}>;

const EMPTY_DRAFT: Draft = {
  action: "shield",
  amount: "0.01",
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
  const controller = useMemo(
    () => new RealActionController({ adapter, onChange: setState }),
    [adapter],
  );

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
              placeholder="0.01"
              required
              value={draft.amount}
              onChange={(event) =>
                setDraft({ ...draft, amount: event.target.value })
              }
            />
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
            <button type="submit">Review real action</button>
          </div>
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
            poolFee="Calculated and shown by your wallet"
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

function isActivePhase(phase: RealActionPhase): boolean {
  return [
    "awaiting-wallet",
    "preparing-proof",
    "submitting",
    "confirming",
  ].includes(phase);
}
