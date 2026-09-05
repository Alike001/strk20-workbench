"use client";

import { useId, type FormEvent } from "react";

import type { ExecutionMode } from "@strk20-workbench/lab-core";

export type PrivacyActionStatus = "idle" | "pending" | "success" | "error";

export interface PrivacyActionProps {
  readonly amount: string;
  readonly mode: ExecutionMode;
  readonly onAmountChange: (amount: string) => void;
  readonly onSubmit: () => void | Promise<void>;
  readonly status?: PrivacyActionStatus;
  readonly error?: string;
  readonly disabled?: boolean;
  readonly tokenLabel?: string;
  readonly className?: string;
}

export interface ShieldProps extends PrivacyActionProps {
  readonly actorLabel?: string;
}

export interface PrivateTransferProps extends PrivacyActionProps {
  readonly senderLabel?: string;
  readonly recipientLabel?: string;
}

export interface WithdrawProps extends PrivacyActionProps {
  readonly actorLabel?: string;
}

export function Shield({ actorLabel = "Alice", ...props }: ShieldProps) {
  return (
    <PrivacyAction
      {...props}
      button={(amount, token) => `Shield ${amount} ${token}`}
      description={`Move ${actorLabel}’s public tokens into a private balance.`}
      title="Shield"
    />
  );
}

export function PrivateTransfer({
  senderLabel = "Alice",
  recipientLabel = "Bob",
  ...props
}: PrivateTransferProps) {
  return (
    <PrivacyAction
      {...props}
      button={(amount, token) => `Send ${amount} ${token} privately`}
      description={`${senderLabel} sends tokens to ${recipientLabel} without exposing the recipient or amount.`}
      title="Send privately"
    />
  );
}

export function Withdraw({ actorLabel = "Bob", ...props }: WithdrawProps) {
  return (
    <PrivacyAction
      {...props}
      button={(amount, token) => `Withdraw ${amount} ${token}`}
      description={`Move ${actorLabel}’s private tokens back to a public wallet.`}
      title="Withdraw"
    />
  );
}

function PrivacyAction({
  amount,
  mode,
  onAmountChange,
  onSubmit,
  status = "idle",
  error,
  disabled = false,
  tokenLabel = "tokens",
  className,
  title,
  description,
  button,
}: PrivacyActionProps & {
  readonly title: string;
  readonly description: string;
  readonly button: (amount: string, token: string) => string;
}) {
  const titleId = useId();
  const inputId = useId();
  const pending = status === "pending";
  const unavailable = disabled || pending;
  const classes = ["strk20-action", className].filter(Boolean).join(" ");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!unavailable) void onSubmit();
  }

  return (
    <section className={classes} aria-labelledby={titleId} data-mode={mode}>
      <div className="strk20-action__copy">
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor={inputId}>Amount</label>
        <div className="strk20-action__amount">
          <input
            aria-invalid={status === "error"}
            disabled={unavailable}
            id={inputId}
            inputMode="numeric"
            onChange={(event) => onAmountChange(event.target.value)}
            pattern="[0-9]*"
            value={amount}
          />
          <span>{tokenLabel}</span>
        </div>
        <button disabled={unavailable || amount.length === 0} type="submit">
          {pending ? "Working…" : button(amount, tokenLabel)}
          <svg aria-hidden="true" viewBox="0 0 20 20">
            <path d="M4 10h11M11 6l4 4-4 4" />
          </svg>
        </button>
      </form>

      <p className="strk20-action__truth">
        {mode === "sandbox"
          ? "Sandbox uses fake tokens. No wallet or real funds are involved."
          : "Real mode requests execution through a supported STRK20 wallet."}
      </p>
      <div aria-live="polite" className="strk20-action__status">
        {status === "success" ? "Action complete." : null}
        {status === "error" ? (error ?? "The action could not finish.") : null}
      </div>
    </section>
  );
}
