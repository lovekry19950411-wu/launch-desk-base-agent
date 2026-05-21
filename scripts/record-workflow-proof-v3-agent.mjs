import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import solc from "solc";
import {
  createPublicClient,
  encodeFunctionData,
  formatEther,
  http,
  keccak256,
  toBytes,
} from "viem";
import { base } from "viem/chains";
import { createWalletProviderFromEnv, loadLocalEnv, printJson } from "./lib/base-agent-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const contractPath = path.join(root, "contracts", "LaunchWorkflowProofV3.sol");
const deploymentPath = path.join(root, "deployments", "base-mainnet-v3.json");

function compileAbi() {
  const source = fs.readFileSync(contractPath, "utf8");
  const input = {
    language: "Solidity",
    sources: { "LaunchWorkflowProofV3.sol": { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { "*": { "*": ["abi"] } },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = output.errors?.filter((entry) => entry.severity === "error") ?? [];
  if (errors.length) throw new Error(errors.map((entry) => entry.formattedMessage).join("\n"));
  return output.contracts["LaunchWorkflowProofV3.sol"].LaunchWorkflowProofV3.abi;
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

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const agentOperator = process.env.MAINNET_AGENT_OPERATOR || deployment.agentOperator;
  if (!agentOperator) throw new Error("Missing MAINNET_AGENT_OPERATOR or deployment.agentOperator.");

  process.env.NETWORK_ID = "base-mainnet";
  process.env.RPC_URL = process.env.BASE_MAINNET_RPC_URL || process.env.EVM_MAINNET_RPC_URL || "https://mainnet.base.org";
  process.env.CDP_WALLET_ADDRESS = agentOperator;

  const abi = compileAbi();
  const publicClient = createPublicClient({ chain: base, transport: http(process.env.RPC_URL) });
  const { walletProvider, keySetName } = await createWalletProviderFromEnv();
  const operatorAddress = walletProvider.getAddress();
  const beforeWei = await publicClient.getBalance({ address: operatorAddress });

  const [owner, recordedAgentOperator, runCountBefore] = await Promise.all([
    publicClient.readContract({ address: deployment.contractAddress, abi, functionName: "owner" }),
    publicClient.readContract({ address: deployment.contractAddress, abi, functionName: "agentOperator" }),
    publicClient.readContract({ address: deployment.contractAddress, abi, functionName: "runCount" }),
  ]);

  if (operatorAddress.toLowerCase() !== recordedAgentOperator.toLowerCase()) {
    throw new Error(`Configured CDP wallet ${operatorAddress} is not the contract agent operator ${recordedAgentOperator}.`);
  }

  const workflowOutput = {
    runId: `agent_operator_mainnet_receipt_${Date.now()}`,
    projectName: "Launch Desk Base Agent",
    readinessScore: 84,
    riskLevel: "medium",
    riskLevelCode: 2,
    proof: "AI operator wallet recorded a founder-owned Launch Desk workflow receipt on Base mainnet.",
    appUrl: "https://base-agent-v2.vercel.app",
    owner,
    agentOperator: recordedAgentOperator,
    contractAddress: deployment.contractAddress,
  };
  const workflowIdHash = keccak256(toBytes(workflowOutput.runId));
  const outputHash = keccak256(toBytes(JSON.stringify(workflowOutput)));
  const metadataURI = "https://base-agent-v2.vercel.app/api/proof";

  const data = encodeFunctionData({
    abi,
    functionName: "recordWorkflowReceipt",
    args: [
      workflowIdHash,
      outputHash,
      metadataURI,
      workflowOutput.readinessScore,
      workflowOutput.riskLevelCode,
      recordedAgentOperator,
      "0x0000000000000000000000000000000000000000",
      0n,
    ],
  });

  const txHash = await walletProvider.sendTransaction({
    to: deployment.contractAddress,
    data,
    value: 0n,
  });
  const receipt = await walletProvider.waitForTransactionReceipt(txHash);
  const runCountAfter = await publicClient.readContract({
    address: deployment.contractAddress,
    abi,
    functionName: "runCount",
  });
  const afterWei = await publicClient.getBalance({ address: operatorAddress });

  deployment.firstReceipt = {
    txHash,
    status: receipt.status,
    transactionUrl: `https://basescan.org/tx/${txHash}`,
    runCount: runCountAfter.toString(),
    runCountBefore: runCountBefore.toString(),
    workflowIdHash,
    outputHash,
    metadataURI,
    workflowOutput,
    recordedBy: operatorAddress,
    keySetName,
  };
  deployment.aiOperatorRecorded = true;
  deployment.lastUpdatedAt = new Date().toISOString();

  fs.writeFileSync(deploymentPath, `${JSON.stringify(deployment, null, 2)}\n`);

  printJson({
    ok: true,
    mode: "record-workflow-proof-v3-agent",
    contractAddress: deployment.contractAddress,
    owner,
    agentOperator: recordedAgentOperator,
    recordedBy: operatorAddress,
    keySetName,
    txHash,
    transactionUrl: `https://basescan.org/tx/${txHash}`,
    runCountBefore: runCountBefore.toString(),
    runCountAfter: runCountAfter.toString(),
    beforeEth: formatEther(beforeWei),
    afterEth: formatEther(afterWei),
  });
} catch (error) {
  printJson({
    ok: false,
    mode: "record-workflow-proof-v3-agent",
    error: describeError(error),
  });
  process.exit(1);
}
