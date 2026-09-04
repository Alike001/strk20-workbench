import type { LabAction, PrivacyFact } from "./types";

const PRIVACY_CATALOG: Record<LabAction["type"], readonly PrivacyFact[]> = {
  register: [
    {
      field: "registration transaction",
      visibility: "public",
      explanation:
        "Observers can see that an account interacted with the pool.",
      technicalBasis: "Registration updates public Starknet contract state.",
    },
    {
      field: "viewing key",
      visibility: "private",
      explanation:
        "The user's private viewing key is not published to chain observers.",
      technicalBasis: "Only encrypted disclosure material is registered.",
    },
  ],
  shield: [
    {
      field: "deposit account and amount",
      visibility: "public",
      explanation: "The ERC-20 deposit leg and its timing remain visible.",
      technicalBasis: "Shielding moves public ERC-20 value into the pool.",
    },
    {
      field: "resulting note",
      visibility: "private",
      explanation: "The resulting shielded note data is encrypted.",
      technicalBasis: "Private balances are represented by encrypted notes.",
    },
  ],
  "private-transfer": [
    {
      field: "sender, recipient, amount, token and spent notes",
      visibility: "private",
      explanation: "Chain observers cannot read the private payment details.",
      technicalBasis:
        "A STARK proof validates ownership and conservation without revealing note data.",
    },
    {
      field: "pool interaction and timing",
      visibility: "conditional",
      explanation: "Observers may still see a pool interaction and its timing.",
      technicalBasis:
        "The transaction is submitted to a public chain; a paymaster may separate the submitter.",
    },
  ],
  withdraw: [
    {
      field: "recipient and withdrawal amount",
      visibility: "public",
      explanation: "The public ERC-20 withdrawal leg is visible.",
      technicalBasis:
        "Unshielding returns tokens to a public Starknet address.",
    },
    {
      field: "prior private transfer path",
      visibility: "private",
      explanation: "The note history inside the pool is not directly revealed.",
      technicalBasis:
        "Nullifiers prevent double-spends without naming the spent notes.",
    },
  ],
};

export const PRIVACY_CATALOG_VERSION = "strk20-2026-09";

export function getPrivacyFacts(
  action: LabAction["type"],
): readonly PrivacyFact[] {
  return PRIVACY_CATALOG[action];
}
