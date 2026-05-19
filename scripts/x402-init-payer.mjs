import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createWalletProviderFromEnv, loadLocalEnv, printJson } from "./lib/base-agent-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env.local");

function appendEnv(entries) {
  const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  const lines = [];

  for (const [key, value] of Object.entries(entries)) {
    if (!value || existing.includes(`${key}=`)) continue;
    lines.push(`${key}=${value}`);
  }

  if (lines.length > 0) {
    const prefix = existing.endsWith("\n") || existing.length === 0 ? "" : "\n";
    fs.appendFileSync(envPath, `${prefix}\n# x402 local test payer. Base Sepolia only.\n${lines.join("\n")}\n`);
  }
}

loadLocalEnv();

let payerPrivateKey = process.env.X402_PAYER_PRIVATE_KEY;
if (!payerPrivateKey) payerPrivateKey = generatePrivateKey();

const payer = privateKeyToAccount(payerPrivateKey);
appendEnv({
  X402_PAYER_PRIVATE_KEY: payerPrivateKey,
  X402_PAYER_ADDRESS: payer.address,
  X402_RECEIVER_ADDRESS: process.env.X402_RECEIVER_ADDRESS || process.env.BASE_RECEIVER_ADDRESS || "",
  X402_NETWORK: process.env.X402_NETWORK || "eip155:84532",
  X402_READINESS_PRICE: process.env.X402_READINESS_PRICE || "$0.001",
  X402_FACILITATOR_URL: process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator",
  EVM_RPC_URL: process.env.EVM_RPC_URL || "https://sepolia.base.org",
});

const { walletProvider, keySetName } = await createWalletProviderFromEnv();
const network = walletProvider.getNetwork();

if (network.networkId !== "base-sepolia") {
  printJson({
    ok: false,
    mode: "x402-init-payer",
    error: "x402 payer bootstrap is only allowed on base-sepolia.",
    network,
    spending: false,
  });
  process.exit(1);
}

const cdpClient = walletProvider.getClient();

async function faucet(token) {
  try {
    const result = await cdpClient.evm.requestFaucet({
      address: payer.address,
      network: "base-sepolia",
      token,
    });
    return { ok: true, token, result };
  } catch (error) {
    return {
      ok: false,
      token,
      error: error instanceof Error ? { name: error.name, message: error.message } : String(error),
    };
  }
}

const eth = await faucet("eth");
const usdc = await faucet("usdc");

printJson({
  ok: true,
  mode: "x402-init-payer",
  keySet: keySetName,
  payerAddress: payer.address,
  receiverAddress: process.env.X402_RECEIVER_ADDRESS || process.env.BASE_RECEIVER_ADDRESS,
  network: "base-sepolia",
  ethFaucet: eth,
  usdcFaucet: usdc,
  spending: false,
  note: "Created/funded a local Base Sepolia payer wallet for x402 tests. Keep .env.local private.",
});
