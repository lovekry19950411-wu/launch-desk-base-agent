import { cdpApiActionProvider } from "@coinbase/agentkit";
import { createWalletProviderFromEnv, printJson } from "./lib/base-agent-utils.mjs";

const assetArg = process.argv.find((arg) => arg.startsWith("--asset="));
const assetId = assetArg ? assetArg.split("=")[1]?.toLowerCase() : "eth";
const allowedAssets = new Set(["eth", "usdc", "eurc", "cbbtc"]);

if (!allowedAssets.has(assetId)) {
  printJson({
    ok: false,
    error: `Unsupported Base Sepolia faucet asset: ${assetId}`,
    allowedAssets: [...allowedAssets],
    spending: false,
  });
  process.exit(1);
}

try {
  const { walletProvider, keySetName } = await createWalletProviderFromEnv();
  const network = walletProvider.getNetwork();

  if (network.networkId !== "base-sepolia") {
    printJson({
      ok: false,
      error: "Faucet is only allowed here on base-sepolia.",
      network,
      spending: false,
      faucetAttempted: false,
    });
    process.exit(1);
  }

  const beforeWei = await walletProvider.getBalance();
  const result = await cdpApiActionProvider().faucet(walletProvider, { assetId });
  const afterWei = await walletProvider.getBalance();

  printJson({
    ok: true,
    mode: "base-agent-faucet",
    keySet: keySetName,
    address: walletProvider.getAddress(),
    network,
    assetId,
    beforeWei: beforeWei.toString(),
    afterWei: afterWei.toString(),
    result,
    spending: false,
    faucetAttempted: true,
    transferAttempted: false,
    contractDeployAttempted: false,
  });
} catch (error) {
  printJson({
    ok: false,
    mode: "base-agent-faucet",
    error: error instanceof Error ? { name: error.name, message: error.message || "(empty message)" } : String(error),
    spending: false,
    faucetAttempted: true,
  });
  process.exit(1);
}

