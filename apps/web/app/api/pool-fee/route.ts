import { formatTokenAmount } from "@strk20-workbench/lab-core";
import { hash } from "starknet";

const OFFICIAL_POOL =
  "0x040337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a";
const GET_FEE_AMOUNT_SELECTOR = hash.getSelectorFromName("get_fee_amount");
const UPSTREAM_TIMEOUT_MS = 12_000;
const STRK = {
  id: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  symbol: "STRK",
  decimals: 18,
  fictional: false,
} as const;

export async function GET(): Promise<Response> {
  const rpcUrl = process.env.STARKNET_RPC_URL;
  if (!isSafeRpcUrl(rpcUrl)) {
    return errorResponse(
      503,
      "The Starknet pool fee service is not configured.",
    );
  }

  try {
    const upstream = await fetch(rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "strk20-pool-fee",
        method: "starknet_call",
        params: [
          {
            contract_address: OFFICIAL_POOL,
            entry_point_selector: GET_FEE_AMOUNT_SELECTOR,
            calldata: [],
          },
          "latest",
        ],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    if (!upstream.ok) {
      return errorResponse(502, "The Starknet RPC rejected the pool fee read.");
    }

    const payload: unknown = await upstream.json();
    const feeAmount = parseFeeAmount(payload);
    if (feeAmount === undefined) {
      return errorResponse(502, "The Starknet pool returned an invalid fee.");
    }

    return Response.json(
      {
        poolAddress: OFFICIAL_POOL,
        tokenSymbol: STRK.symbol,
        feeAmount: feeAmount.toString(),
        feeFormatted: formatTokenAmount(feeAmount, STRK),
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return errorResponse(
      504,
      "The Starknet pool fee service did not respond in time.",
    );
  }
}

function parseFeeAmount(value: unknown): bigint | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const result = (value as { result?: unknown }).result;
  if (!Array.isArray(result) || result.length !== 1) return undefined;
  const rawFee = result[0];
  if (typeof rawFee !== "string" || !/^0x[0-9a-fA-F]+$/.test(rawFee)) {
    return undefined;
  }
  try {
    const fee = BigInt(rawFee);
    return fee >= 0n ? fee : undefined;
  } catch {
    return undefined;
  }
}

function isSafeRpcUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function errorResponse(status: number, message: string): Response {
  return Response.json(
    { error: { code: status, message } },
    { status, headers: { "cache-control": "no-store" } },
  );
}
