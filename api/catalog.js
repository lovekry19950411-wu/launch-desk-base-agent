export default function handler(_request, response) {
  response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  response.status(200).json({
    ok: true,
    project: "Launch Desk Base Agent",
    mode: "public-agent-catalog",
    description:
      "A public-safe catalog of the Base-native agent proof APIs exposed by Launch Desk Base Agent.",
    baseUrl: "https://base-agent-v2.vercel.app",
    builderCode: "bc_9jnnvjew",
    network: {
      name: "Base Mainnet + Base Sepolia",
      caip2: "eip155:8453",
      productionMainnet: true,
    },
    capabilities: [
      {
        id: "agent-status",
        endpoint: "GET /api/status",
        status: "live",
        summary: "Public agent status, Builder Code, network, and safe wallet-provider metadata.",
        freePhase: true,
      },
      {
        id: "x402-proof",
        endpoint: "GET /api/proof",
        status: "live",
        summary: "Public x402 testnet proof snapshot and readiness result.",
        freePhase: true,
      },
      {
        id: "runtime-demo",
        endpoint: "POST /api/run-demo",
        status: "live",
        summary: "Public-safe simulated agent runtime with events and launch readiness output.",
        freePhase: true,
      },
      {
        id: "paid-readiness-api",
        endpoint: "POST /api/launch-readiness",
        status: "planned",
        summary: "Real x402-protected readiness endpoint for paid USDC unlocks.",
        freePhase: false,
      },
      {
        id: "builder-code-transactions",
        endpoint: "onchain transaction metadata",
        status: "planned",
        summary: "Append Builder Code to real Base transactions when mainnet testing starts.",
        freePhase: false,
      },
      {
        id: "workflow-proof-contract",
        endpoint: "contracts/LaunchWorkflowProofV2.sol",
        status: "deployed",
        summary: "Mainnet smart contract deployed on Base for recording Launch Desk workflow receipt hashes and metadata.",
        freePhase: false,
      },
    ],
    contract: {
      name: "LaunchWorkflowProofV3",
      network: "Base Mainnet",
      address: "0xd6Cfc034ee69eb58c1cBD6A15660c95a49804F65",
      owner: "0xc97785f7EEaBafFDE32436842AD4824cB4141f8b",
      agentOperator: "0x1d1ce502DE895c4cB6b946bE172f68B03581FcCc",
      runCount: 0,
      baseScanUrl: "https://basescan.org/address/0xd6Cfc034ee69eb58c1cBD6A15660c95a49804F65",
    },
    safety: {
      privateKeysExposed: false,
      mainnetSpending: true,
      contractDeployAttempted: true,
      browserSigning: false,
    },
    nextPaidSteps: [
      "Fund a small Base mainnet wallet with ETH for gas and USDC for x402 testing.",
      "Promote the proof endpoint into a real x402-protected readiness API.",
      "Append Builder Code to qualifying transactions where supported.",
      "Deploy a minimal contract only if a campaign or customer requires it.",
    ],
    updatedAt: "2026-05-21",
  });
}
