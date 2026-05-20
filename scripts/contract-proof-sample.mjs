import { keccak256, toBytes } from "viem";

const workflowOutput = {
  runId: `demo_run_${Date.now()}`,
  projectName: "Launch Desk Base Agent",
  readinessScore: 82,
  riskLevel: "medium",
  result: {
    summary: "Base Sepolia agent proof with public API catalog, x402 unlock proof, and planned workflow contract.",
    ownerActions: [
      "Keep proof public and reproducible.",
      "Deploy LaunchWorkflowProof to Base Sepolia before mainnet.",
      "Promote x402 endpoint after funding.",
    ],
  },
};

const canonicalJson = JSON.stringify(workflowOutput);
const outputHash = keccak256(toBytes(canonicalJson));

console.log(
  JSON.stringify(
    {
      contract: "LaunchWorkflowProof",
      targetNetwork: "Base Sepolia",
      note: "Sample payload only. No transaction is sent.",
      recordWorkflowRunArgs: {
        runId: workflowOutput.runId,
        projectName: workflowOutput.projectName,
        readinessScore: workflowOutput.readinessScore,
        riskLevel: workflowOutput.riskLevel,
        outputHash,
        agentAddress: "0x0000000000000000000000000000000000000000",
      },
      offchainOutput: workflowOutput,
    },
    null,
    2,
  ),
);
