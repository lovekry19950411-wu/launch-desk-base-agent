import { createWalletProviderFromEnv, loadLocalEnv } from "./lib/base-agent-utils.mjs";

loadLocalEnv();
const networkId = process.env.NETWORK_ID || "base-sepolia";

function describeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message || "(empty message)",
      code: error.code,
      status: error.status,
      cause: error.cause instanceof Error ? error.cause.message : undefined,
    };
  }
  return { message: String(error) };
}

try {
  const { walletProvider, keySetName } = await createWalletProviderFromEnv();

  const balanceWei = await walletProvider.getBalance();
  const network = walletProvider.getNetwork();

  console.log(JSON.stringify({
    ok: true,
    mode: "base-agent-status",
    keySet: keySetName,
    walletProvider: walletProvider.getName(),
    address: walletProvider.getAddress(),
    network,
    balanceWei: balanceWei.toString(),
    spending: false,
    transferAttempted: false,
    faucetAttempted: false,
    note: "Status check only. No transaction, faucet claim, or contract deploy was attempted.",
  }, null, 2));
} catch (error) {
  console.log(JSON.stringify({
    ok: false,
    mode: "base-agent-status",
    error: describeError(error),
    network: networkId,
    spending: false,
    transferAttempted: false,
    faucetAttempted: false,
  }, null, 2));
  process.exit(1);
}
