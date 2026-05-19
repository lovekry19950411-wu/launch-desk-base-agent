import express from "express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { loadLocalEnv } from "./lib/base-agent-utils.mjs";

loadLocalEnv();

const app = express();
const port = Number(process.env.X402_SERVER_PORT || 4021);
const facilitatorUrl = process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator";
const network = process.env.X402_NETWORK || "eip155:84532";
const payTo = process.env.X402_RECEIVER_ADDRESS || process.env.BASE_RECEIVER_ADDRESS;
const price = process.env.X402_READINESS_PRICE || "$0.001";

if (!payTo) throw new Error("Missing X402_RECEIVER_ADDRESS or BASE_RECEIVER_ADDRESS.");

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, mode: "x402-readiness-server", network, price, payTo });
});

const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });
app.use(paymentMiddleware(
  {
    "POST /api/x402/launch-readiness": {
      accepts: [{ scheme: "exact", price, network, payTo }],
      description: "Launch Desk Base x402 readiness report",
      mimeType: "application/json",
    },
  },
  new x402ResourceServer(facilitatorClient).register(network, new ExactEvmScheme()),
));

app.post("/api/x402/launch-readiness", (req, res) => {
  const productSummary = req.body?.productSummary || "Launch Desk Base agent demo";
  res.json({
    ok: true,
    paid: true,
    productSummary,
    readinessScore: 82,
    riskLevel: "medium",
    blockers: [
      "Keep Base Sepolia while testing payment unlocks.",
      "Move to mainnet only after funding, domain, and payout checks are ready.",
    ],
    priorityActions: [
      "Record one paid API unlock proof.",
      "Keep the agent wallet separate from the founder wallet.",
      "Prepare x402 API docs before public beta.",
    ],
    ownerChecklist: [
      "Founder: verify Base payment route.",
      "Agent: produce launch readiness output.",
      "Reviewer: confirm no private keys are committed.",
    ],
    generatedAt: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(JSON.stringify({ ok: true, mode: "x402-readiness-server", port, network, price, payTo }));
});
