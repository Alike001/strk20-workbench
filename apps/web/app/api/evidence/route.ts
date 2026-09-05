import curatedEvidence from "../../../../../evidence/mainnet.json";
import submission from "../../../../../strk20.json";

import {
  buildPublicEvidence,
  isUsableRpcUrl,
  OFFICIAL_STRK20_POOL,
  RpcEvidenceVerifier,
} from "../../../lib/evidence";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const rpcUrl = process.env.STARKNET_RPC_URL;
  const verifier = isUsableRpcUrl(rpcUrl)
    ? new RpcEvidenceVerifier({
        endpoint: rpcUrl,
        expectedPool: OFFICIAL_STRK20_POOL,
      })
    : undefined;
  const projection = await buildPublicEvidence({
    submission,
    curated: curatedEvidence,
    verifier,
  });
  return Response.json(projection, {
    headers: { "cache-control": "no-store" },
  });
}
