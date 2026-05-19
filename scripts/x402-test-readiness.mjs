import { spawn } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";
import { x402Client, x402HTTPClient, wrapFetchWithPayment } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";
import { loadLocalEnv, printJson } from "./lib/base-agent-utils.mjs";

loadLocalEnv();

const port = Number(process.env.X402_SERVER_PORT || 4021);
const baseUrl = `http://127.0.0.1:${port}`;
const privateKey = process.env.X402_PAYER_PRIVATE_KEY;
const rpcUrl = process.env.EVM_RPC_URL || "https://sepolia.base.org";
const network = process.env.X402_NETWORK || "eip155:84532";

if (!privateKey) {
  printJson({
    ok: false,
    mode: "x402-test-readiness",
    error: "Missing X402_PAYER_PRIVATE_KEY. Run npm run x402:init-payer first.",
  });
  process.exit(1);
}

const server = spawn(process.execPath, ["scripts/x402-readiness-server.mjs"], {
  cwd: process.cwd(),
  stdio: ["ignore", "pipe", "pipe"],
  env: process.env,
});

let serverOutput = "";
server.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
server.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });

async function waitForHealth() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return response.json();
    } catch {
      // Wait until the local server is listening.
    }
    await wait(250);
  }
  throw new Error(`x402 readiness server did not start. Output: ${serverOutput}`);
}

try {
  const health = await waitForHealth();
  const payload = {
    productSummary: "Launch Desk Base agent x402 paid readiness test",
    targetAudience: "Base builders and AI agent reviewers",
  };

  const unpaid = await fetch(`${baseUrl}/api/x402/launch-readiness`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const client = new x402Client();
  client.register(network, new ExactEvmScheme(privateKeyToAccount(privateKey), { rpcUrl }));
  const paidFetch = wrapFetchWithPayment(fetch, client);

  const paid = await paidFetch(`${baseUrl}/api/x402/launch-readiness`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const responseBody = await paid.json();
  const paymentResponse = new x402HTTPClient(client).getPaymentSettleResponse((name) => paid.headers.get(name));

  printJson({
    ok: unpaid.status === 402 && paid.ok && responseBody?.paid === true,
    mode: "x402-test-readiness",
    health,
    unpaidStatus: unpaid.status,
    paidStatus: paid.status,
    payerAddress: process.env.X402_PAYER_ADDRESS,
    receiverAddress: process.env.X402_RECEIVER_ADDRESS || process.env.BASE_RECEIVER_ADDRESS,
    network,
    price: process.env.X402_READINESS_PRICE || "$0.001",
    paymentResponse,
    responseBody,
  });
} catch (error) {
  printJson({
    ok: false,
    mode: "x402-test-readiness",
    error: error instanceof Error ? { name: error.name, message: error.message } : String(error),
    serverOutput,
  });
  process.exitCode = 1;
} finally {
  server.kill();
}
