import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createPublicClient,
  createWalletClient,
  formatEther,
  http,
  parseEther,
} from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { loadLocalEnv, printJson } from "./lib/base-agent-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const deploymentPath = path.join(root, "deployments", "base-mainnet-v3.json");

function describeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.shortMessage || error.message,
      details: error.details,
      cause: error.cause instanceof Error ? error.cause.message : undefined,
    };
  }
  return { message: String(error) };
}

try {
  loadLocalEnv();

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.X402_PAYER_PRIVATE_KEY;
  if (!privateKey) throw new Error("Missing DEPLOYER_PRIVATE_KEY or X402_PAYER_PRIVATE_KEY in .env.local.");

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const agentOperator = process.env.MAINNET_AGENT_OPERATOR || deployment.agentOperator;
  if (!agentOperator) throw new Error("Missing MAINNET_AGENT_OPERATOR or deployment.agentOperator.");

  const rpcUrl = process.env.BASE_MAINNET_RPC_URL || process.env.EVM_MAINNET_RPC_URL || "https://mainnet.base.org";
  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({ chain: base, transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, chain: base, transport: http(rpcUrl) });

  const chainId = await publicClient.getChainId();
  if (chainId !== base.id) throw new Error(`Refusing to transfer outside Base mainnet. RPC chainId=${chainId}.`);

  const beforeWei = await publicClient.getBalance({ address: account.address });
  const agentBeforeWei = await publicClient.getBalance({ address: agentOperator });
  const gasPrice = await publicClient.getGasPrice();
  const transferGas = 21000n;
  const reserveWei = parseEther(process.env.DEPLOYER_GAS_RESERVE_ETH || "0.00002");
  const transferCostWei = transferGas * gasPrice;

  if (beforeWei <= transferCostWei + reserveWei) {
    throw new Error(
      `Insufficient deployer gas wallet balance. Balance ${formatEther(beforeWei)} ETH, transfer gas ${formatEther(
        transferCostWei,
      )} ETH, reserve ${formatEther(reserveWei)} ETH.`,
    );
  }

  const valueWei = beforeWei - transferCostWei - reserveWei;
  const txHash = await walletClient.sendTransaction({
    account,
    to: agentOperator,
    value: valueWei,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  const afterWei = await publicClient.getBalance({ address: account.address });
  const agentAfterWei = await publicClient.getBalance({ address: agentOperator });

  printJson({
    ok: true,
    mode: "fund-mainnet-agent-operator",
    from: account.address,
    to: agentOperator,
    txHash,
    transactionUrl: `https://basescan.org/tx/${txHash}`,
    status: receipt.status,
    valueEth: formatEther(valueWei),
    beforeEth: formatEther(beforeWei),
    afterEth: formatEther(afterWei),
    agentBeforeEth: formatEther(agentBeforeWei),
    agentAfterEth: formatEther(agentAfterWei),
    note: "Moved remaining deploy gas wallet ETH to the AI operator wallet, leaving a tiny reserve.",
  });
} catch (error) {
  printJson({
    ok: false,
    mode: "fund-mainnet-agent-operator",
    error: describeError(error),
  });
  process.exit(1);
}
