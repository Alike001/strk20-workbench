import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const FELT = /^0x[0-9a-fA-F]{1,64}$/;
const ACTIONS = new Set(["shield", "private-transfer", "withdraw"]);

export function validateSubmission(
  submission,
  curated,
  { requireComplete = false } = {},
) {
  const errors = [];
  if (!isObject(submission)) {
    return ["strk20.json must contain one JSON object."];
  }
  const requiredFields = [
    "transactions",
    "contracts",
    "demo_video",
    "demo_url",
  ];
  for (const field of requiredFields) {
    if (!(field in submission))
      errors.push(`Missing strk20.json field: ${field}.`);
  }

  validateFeltArray(submission.transactions, "transactions", errors);
  validateFeltArray(submission.contracts, "contracts", errors);
  validateOptionalHttpsUrl(submission.demo_video, "demo_video", errors);
  validateOptionalHttpsUrl(submission.demo_url, "demo_url", errors);

  const transactions = Array.isArray(submission.transactions)
    ? submission.transactions.filter(
        (value) => typeof value === "string" && FELT.test(value),
      )
    : [];
  const transactionKeys = uniqueFeltKeys(transactions, "transaction", errors);

  if (!isObject(curated) || !Array.isArray(curated.records)) {
    errors.push("evidence/mainnet.json must contain a records array.");
  } else {
    const metadataKeys = new Set();
    for (const [index, record] of curated.records.entries()) {
      if (!isObject(record)) {
        errors.push(`Evidence record ${index + 1} must be an object.`);
        continue;
      }
      if (!ACTIONS.has(record.action)) {
        errors.push(`Evidence record ${index + 1} has an unsupported action.`);
      }
      if (
        typeof record.transaction_hash !== "string" ||
        !FELT.test(record.transaction_hash)
      ) {
        errors.push(
          `Evidence record ${index + 1} has an invalid transaction_hash.`,
        );
      } else {
        const key = normalizeFelt(record.transaction_hash);
        if (metadataKeys.has(key)) {
          errors.push(
            `Duplicate curated transaction hash: ${record.transaction_hash}.`,
          );
        }
        metadataKeys.add(key);
      }
      if (
        typeof record.created_at !== "string" ||
        Number.isNaN(Date.parse(record.created_at))
      ) {
        errors.push(
          `Evidence record ${index + 1} has an invalid created_at timestamp.`,
        );
      }
    }
    for (const key of transactionKeys) {
      if (!metadataKeys.has(key)) {
        errors.push(
          `A strk20.json transaction is missing reviewed evidence metadata: 0x${key}.`,
        );
      }
    }
    for (const key of metadataKeys) {
      if (!transactionKeys.has(key)) {
        errors.push(
          `Reviewed evidence metadata is absent from strk20.json: 0x${key}.`,
        );
      }
    }
  }

  if (requireComplete) {
    if (transactionKeys.size < 3) {
      errors.push(
        "Final submission requires at least three unique transaction hashes.",
      );
    }
    if (typeof submission.demo_video !== "string" || !submission.demo_video) {
      errors.push("Final submission requires a demo_video URL.");
    }
  }
  return errors;
}

async function main() {
  const requireComplete = process.argv.includes("--require-complete");
  const [submission, curated] = await Promise.all([
    readJson(new URL("../strk20.json", import.meta.url)),
    readJson(new URL("../evidence/mainnet.json", import.meta.url)),
  ]);
  const errors = validateSubmission(submission, curated, { requireComplete });
  if (errors.length > 0) {
    for (const error of errors) process.stderr.write(`- ${error}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(
    requireComplete
      ? "Submission metadata is complete and structurally valid.\n"
      : "Submission metadata is structurally valid.\n",
  );
}

async function readJson(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

function validateFeltArray(value, label, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array.`);
    return;
  }
  for (const [index, entry] of value.entries()) {
    if (typeof entry !== "string" || !FELT.test(entry)) {
      errors.push(`${label}[${index}] must be a Starknet hex value.`);
    }
  }
  uniqueFeltKeys(
    value.filter((entry) => typeof entry === "string" && FELT.test(entry)),
    label === "contracts" ? "contract" : "transaction",
    errors,
  );
}

function uniqueFeltKeys(values, label, errors) {
  const keys = new Set();
  for (const value of values) {
    const key = normalizeFelt(value);
    if (keys.has(key)) errors.push(`Duplicate ${label} value: ${value}.`);
    keys.add(key);
  }
  return keys;
}

function validateOptionalHttpsUrl(value, label, errors) {
  if (typeof value !== "string") {
    errors.push(`${label} must be a string.`);
    return;
  }
  if (!value) return;
  try {
    if (new URL(value).protocol !== "https:") {
      errors.push(`${label} must use HTTPS.`);
    }
  } catch {
    errors.push(`${label} must be a valid URL.`);
  }
}

function normalizeFelt(value) {
  return BigInt(value).toString(16);
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
