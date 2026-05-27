import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import solc from "solc";
import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  encodeDeployData,
  formatEther,
  http,
  keccak256,
  parseEther,
  toBytes,
} from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { loadLocalEnv, printJson } from "./lib/base-agent-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const contractPath = path.join(root, "contracts", "LaunchWorkflowProofV2.sol");
const deploymentPath = path.join(root, "deployments", "base-mainnet-v2.json");
const DEFAULT_APP_URL = "http://localhost:8788";

function compileContract() {
  const source = fs.readFileSync(contractPath, "utf8");
  const input = {
    language: "Solidity",
    sources: {
      "LaunchWorkflowProofV2.sol": { content: source },
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = output.errors?.filter((entry) => entry.severity === "error") ?? [];
  if (errors.length) throw new Error(errors.map((entry) => entry.formattedMessage).join("\n"));

  const artifact = output.contracts["LaunchWorkflowProofV2.sol"].LaunchWorkflowProofV2;
  return {
    abi: artifact.abi,
    bytecode: `0x${artifact.evm.bytecode.object}`,
  };
}

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

  const agentOperator = process.env.MAINNET_AGENT_OPERATOR || process.env.CDP_WALLET_ADDRESS;
  if (!agentOperator) throw new Error("Missing MAINNET_AGENT_OPERATOR or CDP_WALLET_ADDRESS.");

  const rpcUrl = process.env.BASE_MAINNET_RPC_URL || process.env.EVM_MAINNET_RPC_URL || "https://mainnet.base.org";
  const appUrl = process.env.PUBLIC_APP_URL || process.env.APP_URL || DEFAULT_APP_URL;
  const { abi, bytecode } = compileContract();
  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({ chain: base, transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, chain: base, transport: http(rpcUrl) });
  const chainId = await publicClient.getChainId();
  if (chainId !== base.id) throw new Error(`Refusing to deploy outside Base mainnet. RPC chainId=${chainId}.`);

  const beforeWei = await publicClient.getBalance({ address: account.address });
  const deployData = encodeDeployData({
    abi,
    bytecode,
    args: [agentOperator],
  });
  const deployGas = await publicClient.estimateGas({
    account: account.address,
    data: deployData,
  });
  const gasPrice = await publicClient.getGasPrice();
  const deployCostWei = deployGas * gasPrice;
  const safetyBufferWei = parseEther("0.00008");

  if (beforeWei <= deployCostWei + safetyBufferWei) {
    throw new Error(
      `Insufficient Base ETH. Balance ${formatEther(beforeWei)} ETH, estimated deploy cost ${formatEther(
        deployCostWei,
      )} ETH plus buffer ${formatEther(safetyBufferWei)} ETH.`,
    );
  }

  const deployTxHash = await walletClient.deployContract({
    abi,
    bytecode,
    account,
    args: [agentOperator],
  });
  const deployReceipt = await publicClient.waitForTransactionReceipt({ hash: deployTxHash });
  const contractAddress = deployReceipt.contractAddress;
  if (!contractAddress) throw new Error("Deployment receipt did not include a contract address.");

  const workflowOutput = {
    runId: `mainnet_receipt_${Date.now()}`,
    projectName: "Launch Desk Base Agent",
    readinessScore: 82,
    riskLevel: "medium",
    riskLevelCode: 2,
    proof: "Base mainnet AI workflow receipt contract deployed and first workflow proof recorded.",
    appUrl,
  };
  const workflowIdHash = keccak256(toBytes(workflowOutput.runId));
  const outputHash = keccak256(toBytes(JSON.stringify(workflowOutput)));
  const metadataURI = `${appUrl.replace(/\/$/, "")}/api/proof`;
  const recordData = encodeFunctionData({
    abi,
    functionName: "recordWorkflowReceipt",
    args: [
      workflowIdHash,
      outputHash,
      metadataURI,
      workflowOutput.readinessScore,
      workflowOutput.riskLevelCode,
      agentOperator,
      "0x0000000000000000000000000000000000000000",
      0n,
    ],
  });

  const recordTxHash = await walletClient.sendTransaction({
    account,
    to: contractAddress,
    data: recordData,
    value: 0n,
  });
  const recordReceipt = await publicClient.waitForTransactionReceipt({ hash: recordTxHash });
  const runCount = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "runCount",
  });
  const afterWei = await publicClient.getBalance({ address: account.address });

  const deployment = {
    ok: true,
    mode: "deploy-workflow-proof-v2-mainnet",
    contract: "LaunchWorkflowProofV2",
    deployer: account.address,
    owner: account.address,
    agentOperator,
    network: {
      name: "Base Mainnet",
      chainId: base.id,
      rpcUrl,
    },
    deployTxHash,
    contractAddress,
    baseScanUrl: `https://basescan.org/address/${contractAddress}`,
    deployTransactionUrl: `https://basescan.org/tx/${deployTxHash}`,
    firstReceipt: {
      txHash: recordTxHash,
      status: recordReceipt.status,
      transactionUrl: `https://basescan.org/tx/${recordTxHash}`,
      runCount: runCount.toString(),
      workflowIdHash,
      outputHash,
      metadataURI,
      workflowOutput,
    },
    gasEstimate: {
      deployGas: deployGas.toString(),
      gasPriceWei: gasPrice.toString(),
      estimatedDeployCostEth: formatEther(deployCostWei),
    },
    beforeEth: formatEther(beforeWei),
    afterEth: formatEther(afterWei),
    mainnetDeployment: true,
  };

  fs.writeFileSync(deploymentPath, `${JSON.stringify(deployment, null, 2)}\n`);
  printJson(deployment);
} catch (error) {
  printJson({
    ok: false,
    mode: "deploy-workflow-proof-v2-mainnet",
    error: describeError(error),
    mainnetDeployment: true,
  });
  process.exit(1);
}
