import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalEnv, printJson } from "./lib/base-agent-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const deploymentPath = path.join(root, "deployments", "base-mainnet-v3.json");

function readDeployment() {
  if (!fs.existsSync(deploymentPath)) return {};
  return JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
}

loadLocalEnv();
const deployment = readDeployment();

const ownerWallet = process.env.BASE_RECEIVER_ADDRESS
  || process.env.X402_RECEIVER_ADDRESS
  || deployment.owner
  || "0xc97785f7EEaBafFDE32436842AD4824cB4141f8b";

const agentOperator = process.env.CDP_WALLET_ADDRESS
  || process.env.MAINNET_AGENT_OPERATOR
  || deployment.agentOperator
  || "0x1d1ce502DE895c4cB6b946bE172f68B03581FcCc";

const contractAddress = process.env.BASE_MAINNET_WORKFLOW_CONTRACT
  || process.env.LAUNCH_WORKFLOW_PROOF_V3
  || deployment.contractAddress
  || "0xd6Cfc034ee69eb58c1cBD6A15660c95a49804F65";

printJson({
  ok: true,
  mode: "revenue-routing-plan",
  spending: false,
  transferAttempted: false,
  contractWriteAttempted: false,
  roles: {
    bossOwnerWallet: ownerWallet,
    aiOperatorWallet: agentOperator,
    workflowProofContract: contractAddress,
  },
  revenueFlow: [
    {
      step: 1,
      name: "Paid API unlock",
      route: "x402 / USDC payment should point directly to bossOwnerWallet.",
      receiver: ownerWallet,
      reason: "Best for early stage: revenue does not sit inside the AI operator wallet.",
    },
    {
      step: 2,
      name: "AI workflow proof",
      route: "AI operator records a receipt hash to LaunchWorkflowProofV3 after an approved run.",
      operator: agentOperator,
      contract: contractAddress,
      reason: "Creates onchain proof without giving the operator ownership of revenue.",
    },
    {
      step: 3,
      name: "Optional sweep",
      route: "Only if future services accidentally receive funds in the AI operator wallet, sweep excess back to bossOwnerWallet.",
      enabledByDefault: false,
      reason: "Avoid surprise transfers and keep gas under owner control.",
    },
  ],
  recommendedEnv: {
    BASE_RECEIVER_ADDRESS: ownerWallet,
    X402_RECEIVER_ADDRESS: ownerWallet,
    REVENUE_SWEEP_ENABLED: "false",
    REVENUE_SWEEP_TARGET_ADDRESS: ownerWallet,
    REVENUE_SWEEP_RESERVE_ETH: "0.00005",
    BASE_MAINNET_WORKFLOW_CONTRACT: contractAddress,
  },
  officialPositioning:
    "CDP Server Wallet controls the AI operator, x402/USDC unlocks paid API access, and Base mainnet contract receipts prove workflow execution.",
});
