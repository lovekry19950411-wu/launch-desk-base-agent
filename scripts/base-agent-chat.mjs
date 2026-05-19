import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { cdpApiActionProvider } from "@coinbase/agentkit";
import { createWalletProviderFromEnv } from "./lib/base-agent-utils.mjs";

function formatEthFromWei(wei) {
  const value = BigInt(wei);
  const whole = value / 10n ** 18n;
  const fraction = value % 10n ** 18n;
  const padded = fraction.toString().padStart(18, "0").slice(0, 6);
  return `${whole}.${padded} ETH`;
}

function detectIntent(text) {
  const normalized = text.toLowerCase().trim();

  if (!normalized) return { type: "empty" };
  if (/exit|quit|離開|退出/.test(normalized)) return { type: "exit" };
  if (/地址|錢包|钱包|wallet|details/.test(normalized)) return { type: "details" };
  if (/餘額|余额|balance|查水|查一下/.test(normalized)) return { type: "balance" };
  if (/領|领|faucet|fund|水/.test(normalized)) {
    if (/usdc/.test(normalized)) return { type: "faucet", assetId: "usdc" };
    if (/eurc/.test(normalized)) return { type: "faucet", assetId: "eurc" };
    if (/cbbtc/.test(normalized)) return { type: "faucet", assetId: "cbbtc" };
    return { type: "faucet", assetId: "eth" };
  }

  return { type: "unknown" };
}

async function main() {
  console.log("Base Agent v2 已啟動");
  console.log("你可以輸入：查餘額 / 錢包地址 / 幫我領 ETH / 幫我領 USDC / exit");
  console.log("");

  const { walletProvider, keySetName } = await createWalletProviderFromEnv();
  const rl = readline.createInterface({ input, output });

  try {
    while (true) {
      const answer = await rl.question("你：");
      const intent = detectIntent(answer);

      if (intent.type === "exit") {
        console.log("代理：收到，先停在這裡。");
        break;
      }

      if (intent.type === "empty") continue;

      if (intent.type === "details") {
        const network = walletProvider.getNetwork();
        console.log(`代理：錢包地址是 ${walletProvider.getAddress()}`);
        console.log(`代理：目前網路是 ${network.networkId}，chainId ${network.chainId}，keySet ${keySetName}`);
        continue;
      }

      if (intent.type === "balance") {
        const balanceWei = await walletProvider.getBalance();
        console.log(`代理：這個錢包目前 native ETH 餘額是 ${formatEthFromWei(balanceWei)}`);
        console.log("代理：USDC 是 ERC-20，這個簡易查詢先只顯示 gas 餘額。");
        continue;
      }

      if (intent.type === "faucet") {
        const network = walletProvider.getNetwork();
        if (network.networkId !== "base-sepolia") {
          console.log(`代理：安全起見，領水只允許 base-sepolia；目前是 ${network.networkId}`);
          continue;
        }

        console.log(`代理：正在幫你向 Base Sepolia faucet 領 ${intent.assetId.toUpperCase()}...`);
        const result = await cdpApiActionProvider().faucet(walletProvider, { assetId: intent.assetId });
        console.log(`代理：完成。${result}`);
        continue;
      }

      console.log("代理：我目前先支援查餘額、錢包地址、幫你領 Base Sepolia 測試 ETH/USDC。");
    }
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error("代理：執行時出錯。");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
