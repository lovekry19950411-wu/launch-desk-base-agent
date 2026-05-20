function readJsonBody(request) {
  return new Promise((resolve) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk.toString();
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ ok: false, error: "Method not allowed. Use POST." });
    return;
  }

  const input = await readJsonBody(request);
  const brief = input.productSummary || "Launch Desk Base Agent public demo";
  const runId = `demo_run_${Date.now()}`;

  response.status(200).json({
    ok: true,
    mode: "simulated-agent-run",
    runId,
    input: {
      productSummary: brief,
      targetAudience: input.targetAudience || "Base builders, AI agent reviewers, and prototype customers",
      network: "Base Sepolia",
    },
    events: [
      {
        state: "initializing",
        message: "agent runtime accepted launch brief",
      },
      {
        state: "validating",
        message: "CDP wallet proof and Base Sepolia network guard checked",
      },
      {
        state: "queued",
        message: "x402 payment gate simulated as HTTP 402 -> paid unlock",
      },
      {
        state: "analyzing",
        message: "launch readiness, risks, and owner actions generated",
      },
      {
        state: "finalized",
        message: "public-safe demo run complete",
      },
    ],
    result: {
      readinessScore: 82,
      riskLevel: "medium",
      paymentMode: "x402 test USDC proof",
      ownerActions: [
        "Keep Base Sepolia proof public and reproducible.",
        "Add real x402-protected readiness endpoint before paid beta.",
        "Move to mainnet only after funding and safety checks.",
      ],
    },
    safety: {
      mainnetSpending: false,
      privateKeysExposed: false,
      productionApiCalled: false,
      contractDeployAttempted: false,
    },
  });
}
