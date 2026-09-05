const ALLOWED_METHODS = new Set([
  "starknet_chainId",
  "starknet_blockNumber",
  "starknet_getTransactionReceipt",
  "starknet_getTransactionStatus",
]);
const MAX_REQUEST_BYTES = 8_192;
const UPSTREAM_TIMEOUT_MS = 12_000;

type JsonRpcRequest = Readonly<{
  jsonrpc: "2.0";
  id: string | number | null;
  method: string;
  params?: unknown;
}>;

export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return errorResponse(415, "Expected an application/json request.");
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
    return errorResponse(413, "RPC request is too large.");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return errorResponse(400, "RPC request is not valid JSON.");
  }
  if (!isAllowedRequest(payload)) {
    return errorResponse(
      403,
      "This RPC method is not available through Workbench.",
    );
  }

  const rpcUrl = process.env.STARKNET_RPC_URL;
  if (!isSafeRpcUrl(rpcUrl)) {
    return errorResponse(
      503,
      "The Starknet receipt service is not configured.",
    );
  }

  try {
    const upstream = await fetch(rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: rawBody,
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    const responseBody = await upstream.text();
    return new Response(responseBody, {
      status: upstream.ok ? 200 : 502,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    return errorResponse(
      504,
      "The Starknet receipt service did not respond in time.",
    );
  }
}

function isAllowedRequest(value: unknown): value is JsonRpcRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  if (candidate.jsonrpc !== "2.0" || typeof candidate.method !== "string") {
    return false;
  }
  if (!ALLOWED_METHODS.has(candidate.method)) return false;
  if (
    candidate.id !== null &&
    typeof candidate.id !== "string" &&
    typeof candidate.id !== "number"
  ) {
    return false;
  }
  return (
    candidate.params === undefined ||
    Array.isArray(candidate.params) ||
    (candidate.params !== null && typeof candidate.params === "object")
  );
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
