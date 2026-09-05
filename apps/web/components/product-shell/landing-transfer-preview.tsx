"use client";

import { useState } from "react";

import styles from "./product-shell.module.css";

type PreviewAction = "shield" | "send";

const preview = {
  shield: {
    alice: "50 private",
    bob: "0 private",
    description: "Alice moved 50 tokens into her private balance.",
  },
  send: {
    alice: "30 private",
    bob: "20 private",
    description: "Alice sent Bob 20 tokens without exposing the transfer.",
  },
} satisfies Record<
  PreviewAction,
  { alice: string; bob: string; description: string }
>;

export function LandingTransferPreview() {
  const [action, setAction] = useState<PreviewAction>("send");
  const state = preview[action];

  return (
    <section
      className={styles.landingPreview}
      aria-label="Interactive private transfer preview"
    >
      <div className={styles.previewPerson}>
        <span className={styles.previewAvatar} aria-hidden="true">
          A
        </span>
        <strong>Alice</strong>
        <span>{state.alice}</span>
      </div>

      <div className={styles.previewActions} aria-label="Preview an action">
        <button
          aria-pressed={action === "shield"}
          onClick={() => setAction("shield")}
          type="button"
        >
          Shield
        </button>
        <button
          aria-pressed={action === "send"}
          onClick={() => setAction("send")}
          type="button"
        >
          <span aria-hidden="true">✓</span> Send privately
        </button>
      </div>

      <div className={styles.previewDirection} aria-hidden="true">
        <span />
      </div>

      <div className={styles.previewPerson}>
        <span className={styles.previewAvatar} aria-hidden="true">
          B
        </span>
        <strong>Bob</strong>
        <span>{state.bob}</span>
      </div>

      <p className={styles.previewDescription} aria-live="polite">
        {state.description}
      </p>
      <p className={styles.previewTruth}>Sandbox · No real funds</p>
    </section>
  );
}
