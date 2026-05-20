export default function handler(_request, response) {
  const runId = "run_base_agent_20260520_001";

  response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  response.status(200).json({
    ok: true,
    project: "Launch Desk Base Agent",
    mode: "public-proof",
    runId,
    proofType: "base-sepolia-x402-readiness-proof",
    lastVerifiedAt: "2026-05-20T14:48:46.234Z",
    x402: {
      network: "eip155:84532",
      price: "$0.001 test USDC",
      unpaidStatus: 402,
      paidStatus: 200,
      transaction: "0x656044d4463c0848401b9c433a995da9b4a7a8ecf5fc7dd28d70003cc398fe8f",
      receiver: "0xc97785f7EEaBafFDE32436842AD4824cB4141f8b",
    },
    readiness: {
      score: 82,
      riskLevel: "medium",
      actions: [
        "Record one paid API unlock proof.",
        "Keep the agent wallet separate from the founder wallet.",
        "Prepare x402 API docs before public beta.",
      ],
    },
    contract: {
      status: "deployed",
      name: "LaunchWorkflowProof",
      network: "Base Sepolia",
      chainId: 84532,
      deployed: true,
      address: "0xfbd1343ce44c8bf056370c222b3f90524a4e1ffb",
      deployTxHash: "0x6bd25a0f763666ceb886df9b0bd55a9d11fec34046a2e0de4c2682fc5f0d6591",
      firstRecordTxHash: "0x8618325b87c04c2823ff2c8afce81d3a321eac9e040da7b3a982172433faa879",
      runCount: 2,
      baseScanUrl: "https://sepolia.basescan.org/address/0xfbd1343ce44c8bf056370c222b3f90524a4e1ffb",
      sourcePath: "contracts/LaunchWorkflowProof.sol",
      purpose: "Record AI workflow proof metadata and output hashes onchain.",
    },
    agentSteps: [
      {
        id: "wallet-status",
        state: "finalized",
        summary: "CDP wallet provider resolved on Base Sepolia.",
      },
      {
        id: "x402-unlock",
        state: "finalized",
        summary: "Unpaid request returned 402 and paid request returned 200.",
      },
      {
        id: "readiness-preview",
        state: "finalized",
        summary: "Launch readiness score and actions generated from proof snapshot.",
      },
    ],
    events: [
      {
        time: "14:48:42",
        state: "initializing",
        message: "launch-readiness endpoint protected",
      },
      {
        time: "14:48:43",
        state: "queued",
        message: "unsigned request returned HTTP 402 Payment Required",
      },
      {
        time: "14:48:45",
        state: "settling",
        message: "test USDC payment submitted through x402 facilitator",
      },
      {
        time: "14:48:46",
        state: "finalized",
        message: "payment settled and readiness API unlocked",
      },
    ],
    nextRequiredAction: "Promote from public proof API to a real x402-protected readiness endpoint when ready.",
    safety: {
      mainnetSpending: false,
      privateKeysExposed: false,
      productionApiCalled: false,
    },
    updatedAt: "2026-05-20",
  });
}
