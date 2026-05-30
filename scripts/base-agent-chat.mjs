import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { cdpApiActionProvider } from "@coinbase/agentkit";
import { createWalletProviderFromEnv, loadLocalEnv } from "./lib/base-agent-utils.mjs";

loadLocalEnv();

function formatEthFromWei(wei) {
  const value = BigInt(wei);
  const whole = value / 10n ** 18n;
  const fraction = value % 10n ** 18n;
  const padded = fraction.toString().padStart(18, "0").slice(0, 6);
  return `${whole}.${padded} ETH`;
}

function shortAddress(address = "") {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function detectIntent(text) {
  const normalized = text.toLowerCase().trim();

  if (!normalized) return { type: "empty" };
  if (/^(exit|quit|q|bye|離開|退出|結束)$/.test(normalized)) return { type: "exit" };
  if (/help|指令|幫助|怎麼用/.test(normalized)) return { type: "help" };
  if (/錢包|wallet|地址|details|身份/.test(normalized)) return { type: "details" };
  if (/餘額|balance|資產|有多少/.test(normalized)) return { type: "balance" };
  if (/收入|收款|receiver|revenue|轉帳/.test(normalized)) return { type: "revenue" };
  if (/合約|contract|proof|證明|上鏈/.test(normalized)) return { type: "proof" };
  if (/領|faucet|fund|水/.test(normalized)) {
    if (/usdc/.test(normalized)) return { type: "faucet", assetId: "usdc" };
    if (/eurc/.test(normalized)) return { type: "faucet", assetId: "eurc" };
    if (/cbbtc/.test(normalized)) return { type: "faucet", assetId: "cbbtc" };
    return { type: "faucet", assetId: "eth" };
  }

  return { type: "unknown" };
}

function printHelp() {
  console.log("可用指令：");
  console.log("- 查錢包 / 查身份：顯示 CDP agent wallet 與網路");
  console.log("- 查餘額：顯示原生 ETH gas 餘額");
  console.log("- 領 ETH / 領 USDC：只在 Base Sepolia 測試網領水");
  console.log("- 收入設定：顯示收入應流向哪個 BOSS wallet");
  console.log("- 合約 proof：顯示目前 Base 主網 proof contract");
  console.log("- exit：離開");
}

async function main() {
  const { walletProvider, keySetName } = await createWalletProviderFromEnv();
  const rl = readline.createInterface({ input, output });

  console.log("Launch Desk Base Agent v2 已啟動。");
  console.log("這是 CDP Server Wallet 控制的 AI operator，不會在聊天模式自動花主網錢。");
  printHelp();
  console.log("");

  try {
    while (true) {
      const answer = await rl.question("你要代理人做什麼？> ");
      const intent = detectIntent(answer);

      if (intent.type === "exit") {
        console.log("已停止代理人聊天模式。");
        break;
      }

      if (intent.type === "empty") continue;

      if (intent.type === "help") {
        printHelp();
        continue;
      }

      if (intent.type === "details") {
        const network = walletProvider.getNetwork();
        console.log(`CDP agent wallet：${walletProvider.getAddress()}`);
        console.log(`錢包提供者：${walletProvider.getName()}`);
        console.log(`網路：${network.networkId} / chainId ${network.chainId}`);
        console.log(`Key set：${keySetName}`);
        console.log("角色：AI operator，負責執行你授權的 proof / workflow 動作。");
        continue;
      }

      if (intent.type === "balance") {
        const balanceWei = await walletProvider.getBalance();
        console.log(`原生 gas 餘額：${formatEthFromWei(balanceWei)}`);
        console.log("提醒：這裡只顯示原生 ETH。USDC 等 ERC-20 需要用鏈上查詢或區塊瀏覽器確認。");
        continue;
      }

      if (intent.type === "revenue") {
        const receiver = process.env.BASE_RECEIVER_ADDRESS || process.env.X402_RECEIVER_ADDRESS;
        const x402Receiver = process.env.X402_RECEIVER_ADDRESS || receiver;
        console.log(`BOSS / 收款 wallet：${receiver || "尚未設定"}`);
        console.log(`x402 收款設定：${x402Receiver || "尚未設定"}`);
        console.log("建議：收入先直接進 BOSS wallet；AI operator 只保留少量 gas 做 proof。");
        continue;
      }

      if (intent.type === "proof") {
        const contractAddress = process.env.BASE_MAINNET_WORKFLOW_CONTRACT
          || process.env.LAUNCH_WORKFLOW_PROOF_V3
          || "0xd6Cfc034ee69eb58c1cBD6A15660c95a49804F65";
        console.log(`Base 主網 proof contract：${contractAddress}`);
        console.log(`Basescan：https://basescan.org/address/${contractAddress}`);
        console.log(`AI operator：${shortAddress(walletProvider.getAddress())}`);
        console.log("此聊天模式只顯示狀態；真正寫入合約請用 npm run contract:record:mainnet:v3 並先確認。");
        continue;
      }

      if (intent.type === "faucet") {
        const network = walletProvider.getNetwork();
        if (network.networkId !== "base-sepolia") {
          console.log(`現在是 ${network.networkId}，拒絕領水。Faucet 只允許 Base Sepolia 測試網。`);
          continue;
        }

        console.log(`正在向 Base Sepolia faucet 申請 ${intent.assetId.toUpperCase()}...`);
        const result = await cdpApiActionProvider().faucet(walletProvider, { assetId: intent.assetId });
        console.log(`完成：${result}`);
        continue;
      }

      console.log("我看不懂這個指令。你可以輸入：查錢包、查餘額、領 ETH、領 USDC、收入設定、合約 proof。");
    }
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error("代理人執行失敗：");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
