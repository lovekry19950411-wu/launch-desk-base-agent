import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import solc from "solc";
import { createPublicClient, createWalletClient, http, keccak256, toBytes } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { loadLocalEnv, printJson } from "./lib/base-agent-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const contractPath = path.join(root, "contracts", "LaunchWorkflowProof.sol");

function compileAbi() {
  const source = fs.readFileSync(contractPath, "utf8");
  const input = {
    language: "Solidity",
    sources: { "LaunchWorkflowProof.sol": { content: source } },
    settings: { outputSelection: { "*": { "*": ["abi"] } } },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = output.errors?.filter((entry) => entry.severity === "error") ?? [];
  if (errors.length) throw new Error(errors.map((entry) => entry.formattedMessage).join("\n"));
  return output.contracts["LaunchWorkflowProof.sol"].LaunchWorkflowProof.abi;
}

function getArg(name) {
  const match = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return match?.split("=")[1];
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
  const contractAddress = getArg("contract") || process.env.WORKFLOW_PROOF_CONTRACT_ADDRESS;

  if (!privateKey) throw new Error("Missing DEPLOYER_PRIVATE_KEY or X402_PAYER_PRIVATE_KEY in .env.local.");
  if (!contractAddress) throw new Error("Missing --contract=0x... or WORKFLOW_PROOF_CONTRACT_ADDRESS.");

  const abi = compileAbi();
  const account = privateKeyToAccount(privateKey);
  const rpcUrl = process.env.EVM_RPC_URL || "https://sepolia.base.org";
  const publicClient = createPublicClient({ chain: baseSepolia, transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http(rpcUrl) });

  const workflowOutput = {
    runId: `onchain_run_${Date.now()}`,
    projectName: "Launch Desk Base Agent",
    readinessScore: 82,
    riskLevel: "medium",
    proof: "Base Sepolia workflow proof recorded onchain.",
  };
  const outputHash = keccak256(toBytes(JSON.stringify(workflowOutput)));

  const owner = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "owner",
  });
  const beforeRunCount = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "runCount",
  });

  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi,
    functionName: "recordWorkflowRun",
    account,
    args: [
      workflowOutput.runId,
      workflowOutput.projectName,
      workflowOutput.readinessScore,
      workflowOutput.riskLevel,
      outputHash,
      account.address,
    ],
  });

  const txHash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  const afterRunCount = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "runCount",
  });

  printJson({
    ok: receipt.status === "success",
    mode: "record-workflow-proof",
    contractAddress,
    owner,
    signer: account.address,
    txHash,
    transactionUrl: `https://sepolia.basescan.org/tx/${txHash}`,
    beforeRunCount: beforeRunCount.toString(),
    afterRunCount: afterRunCount.toString(),
    outputHash,
    workflowOutput,
    receiptStatus: receipt.status,
    testnetDeployment: true,
  });
} catch (error) {
  printJson({
    ok: false,
    mode: "record-workflow-proof",
    error: describeError(error),
    testnetDeployment: true,
  });
  process.exit(1);
}
