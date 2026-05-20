import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import solc from "solc";
import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  http,
  keccak256,
  toBytes,
} from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { loadLocalEnv, printJson } from "./lib/base-agent-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const contractPath = path.join(root, "contracts", "LaunchWorkflowProof.sol");

function compileContract() {
  const source = fs.readFileSync(contractPath, "utf8");
  const input = {
    language: "Solidity",
    sources: {
      "LaunchWorkflowProof.sol": {
        content: source,
      },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = output.errors?.filter((entry) => entry.severity === "error") ?? [];
  if (errors.length) {
    throw new Error(errors.map((entry) => entry.formattedMessage).join("\n"));
  }

  const artifact = output.contracts["LaunchWorkflowProof.sol"].LaunchWorkflowProof;
  return {
    abi: artifact.abi,
    bytecode: `0x${artifact.evm.bytecode.object}`,
  };
}

function describeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      cause: error.cause instanceof Error ? error.cause.message : undefined,
    };
  }
  return { message: String(error) };
}

try {
  loadLocalEnv();
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.X402_PAYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("Missing DEPLOYER_PRIVATE_KEY or X402_PAYER_PRIVATE_KEY in .env.local.");
  }

  const { abi, bytecode } = compileContract();
  const account = privateKeyToAccount(privateKey);
  const rpcUrl = process.env.EVM_RPC_URL || "https://sepolia.base.org";
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(rpcUrl),
  });
  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(rpcUrl),
  });

  if (baseSepolia.id !== 84532) {
    throw new Error("Refusing to deploy outside Base Sepolia.");
  }

  const beforeWei = await publicClient.getBalance({ address: account.address });
  const txHash = await walletClient.deployContract({
    abi,
    bytecode,
    account,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  const contractAddress = receipt.contractAddress;

  if (!contractAddress) {
    throw new Error("Deployment receipt did not include a contract address.");
  }

  const workflowOutput = {
    runId: `onchain_run_${Date.now()}`,
    projectName: "Launch Desk Base Agent",
    readinessScore: 82,
    riskLevel: "medium",
    proof: "Base Sepolia contract deployment and first workflow record.",
  };
  const outputHash = keccak256(toBytes(JSON.stringify(workflowOutput)));
  const recordData = encodeFunctionData({
    abi,
    functionName: "recordWorkflowRun",
    args: [
      workflowOutput.runId,
      workflowOutput.projectName,
      workflowOutput.readinessScore,
      workflowOutput.riskLevel,
      outputHash,
      account.address,
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

  printJson({
    ok: true,
    mode: "deploy-workflow-proof",
    contract: "LaunchWorkflowProof",
    deployer: account.address,
    network: {
      name: "Base Sepolia",
      chainId: baseSepolia.id,
      rpcUrl,
    },
    txHash,
    contractAddress,
    baseScanUrl: `https://sepolia.basescan.org/address/${contractAddress}`,
    transactionUrl: `https://sepolia.basescan.org/tx/${txHash}`,
    firstRecord: {
      txHash: recordTxHash,
      status: recordReceipt.status,
      transactionUrl: `https://sepolia.basescan.org/tx/${recordTxHash}`,
      runCount: runCount.toString(),
      outputHash,
      workflowOutput,
    },
    beforeWei: beforeWei.toString(),
    afterWei: afterWei.toString(),
    abi,
    spending: false,
    testnetDeployment: true,
  });
} catch (error) {
  printJson({
    ok: false,
    mode: "deploy-workflow-proof",
    error: describeError(error),
    spending: false,
    testnetDeployment: true,
  });
  process.exit(1);
}
