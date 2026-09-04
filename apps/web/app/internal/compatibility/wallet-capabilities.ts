export const MINIMUM_STRK20_WALLET_API = "0.10.3";

export type MethodCapability = Readonly<{
  name: "balances" | "prepare" | "invoke";
  libraryMethod: string;
  presentInLibrary: boolean;
  advertisedByWalletApi: boolean;
  invoked: false;
}>;

export type WalletCapabilityReport = Readonly<{
  walletName: string;
  chainId: string;
  featureNames: readonly string[];
  walletApiVersions: readonly string[];
  rpcSpecVersions: readonly string[];
  meetsMinimumWalletApi: boolean;
  methods: readonly MethodCapability[];
}>;

type Strk20MethodSurface = Readonly<{
  strk20Balances?: unknown;
  strk20PrepareInvoke?: unknown;
  strk20InvokeTransaction?: unknown;
}>;

function numericVersion(version: string): readonly number[] | null {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version);
  return match ? match.slice(1, 4).map(Number) : null;
}

export function walletApiMeetsMinimum(
  advertised: readonly string[],
  minimum = MINIMUM_STRK20_WALLET_API,
): boolean {
  const required = numericVersion(minimum);
  if (!required) return false;

  return advertised.some((version) => {
    const candidate = numericVersion(version);
    if (!candidate) return false;

    for (let index = 0; index < required.length; index += 1) {
      const candidatePart = candidate[index] ?? 0;
      const requiredPart = required[index] ?? 0;
      if (candidatePart > requiredPart) return true;
      if (candidatePart < requiredPart) return false;
    }
    return true;
  });
}

export function buildCapabilityReport(input: {
  walletName: string;
  chainId: string;
  featureNames: readonly string[];
  walletApiVersions: readonly string[];
  rpcSpecVersions: readonly string[];
  account: Strk20MethodSurface;
}): WalletCapabilityReport {
  const meetsMinimumWalletApi = walletApiMeetsMinimum(input.walletApiVersions);
  const methods = [
    ["balances", "strk20Balances"],
    ["prepare", "strk20PrepareInvoke"],
    ["invoke", "strk20InvokeTransaction"],
  ] as const;

  return {
    walletName: input.walletName,
    chainId: input.chainId,
    featureNames: [...input.featureNames].sort(),
    walletApiVersions: [...input.walletApiVersions],
    rpcSpecVersions: [...input.rpcSpecVersions],
    meetsMinimumWalletApi,
    methods: methods.map(([name, libraryMethod]) => ({
      name,
      libraryMethod,
      presentInLibrary: typeof input.account[libraryMethod] === "function",
      advertisedByWalletApi: meetsMinimumWalletApi,
      invoked: false,
    })),
  };
}
