import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CdpEvmWalletProvider } from "@coinbase/agentkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

export function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf8");
  const env = {};
  let currentKey = null;
  let currentValue = "";

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line || line.trimStart().startsWith("#")) continue;

    if (currentKey) {
      currentValue += `\n${line}`;
      if (line.endsWith('"')) {
        env[currentKey] = currentValue.slice(0, -1);
        currentKey = null;
        currentValue = "";
      }
      continue;
    }

    const match = line.match(/^([^=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    let value = match[2] ?? "";

    if (value.startsWith('"') && !value.endsWith('"')) {
      currentKey = key;
      currentValue = value.slice(1);
      continue;
    }

    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[key] = value;
  }

  return env;
}

export function loadLocalEnv() {
  const localEnv = parseEnvFile(path.join(root, ".env.local"));
  for (const [key, value] of Object.entries(localEnv)) {
    if (!process.env[key]) process.env[key] = value;
  }
}

export async function createWalletProviderFromEnv() {
  loadLocalEnv();

  if (!process.env.CDP_WALLET_SECRET) {
    throw new Error("Missing CDP_WALLET_SECRET.");
  }

  const keySets = [
    {
      name: "ecdsa",
      apiKeyId: process.env.CDP_API_KEY_ID,
      apiKeySecret: process.env.CDP_API_KEY_SECRET,
    },
    {
      name: "ed25519",
      apiKeyId: process.env.CDP_ED25519_API_KEY_ID,
      apiKeySecret: process.env.CDP_ED25519_PRIVATE_KEY,
    },
  ].filter((entry) => entry.apiKeyId && entry.apiKeySecret);

  let lastError;
  for (const keySet of keySets) {
    try {
      const walletProvider = await CdpEvmWalletProvider.configureWithWallet({
        apiKeyId: keySet.apiKeyId,
        apiKeySecret: keySet.apiKeySecret,
        walletSecret: process.env.CDP_WALLET_SECRET,
        address: process.env.CDP_WALLET_ADDRESS || undefined,
        networkId: process.env.NETWORK_ID || "base-sepolia",
      });
      return { walletProvider, keySetName: keySet.name };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("No usable CDP API key set found.");
}
