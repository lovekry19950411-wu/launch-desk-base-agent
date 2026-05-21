import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import solc from "solc";
import { encodeDeployData } from "viem";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const contractPath = path.join(root, "contracts", "LaunchWorkflowProofV3.sol");
const outputPath = path.join(root, "owner-deploy.html");

const OWNER_ADDRESS = "0xc97785f7EEaBafFDE32436842AD4824cB4141f8b";
const AGENT_OPERATOR_ADDRESS = "0x1d1ce502DE895c4cB6b946bE172f68B03581FcCc";

function compileContract() {
  const source = fs.readFileSync(contractPath, "utf8");
  const input = {
    language: "Solidity",
    sources: { "LaunchWorkflowProofV3.sol": { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = output.errors?.filter((entry) => entry.severity === "error") ?? [];
  if (errors.length) throw new Error(errors.map((entry) => entry.formattedMessage).join("\n"));
  const artifact = output.contracts["LaunchWorkflowProofV3.sol"].LaunchWorkflowProofV3;
  return { abi: artifact.abi, bytecode: `0x${artifact.evm.bytecode.object}` };
}

const { abi, bytecode } = compileContract();
const deployData = encodeDeployData({
  abi,
  bytecode,
  args: [OWNER_ADDRESS, AGENT_OPERATOR_ADDRESS],
});

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="base:app_id" content="6a0cdbb91c1db8c69c491bb1" />
    <title>Launch Desk Owner Deploy</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #080807;
        --panel: #12110f;
        --text: #f6f0e6;
        --muted: #a9a096;
        --line: rgba(255, 255, 255, 0.1);
        --gold: #d7b46a;
        --green: #8bd9a4;
        --red: #ff9b8b;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background:
          radial-gradient(circle at top left, rgba(215, 180, 106, 0.14), transparent 34rem),
          var(--bg);
        color: var(--text);
      }
      main {
        width: min(820px, calc(100vw - 40px));
        margin: 0 auto;
        padding: 56px 0;
      }
      .eyebrow {
        color: var(--gold);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
      h1 {
        margin: 14px 0 14px;
        font-size: clamp(40px, 7vw, 72px);
        line-height: 0.95;
      }
      p {
        margin: 0;
        color: var(--muted);
        font-size: 16px;
        line-height: 1.75;
      }
      .panel {
        margin-top: 28px;
        padding: 22px;
        border: 1px solid var(--line);
        border-radius: 18px;
        background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.014));
      }
      .row {
        display: grid;
        grid-template-columns: 160px 1fr;
        gap: 16px;
        padding: 14px 0;
        border-top: 1px solid var(--line);
      }
      .row:first-child { border-top: 0; }
      .row span { color: var(--muted); }
      code {
        overflow-wrap: anywhere;
        color: var(--gold);
        font-family: "Cascadia Code", ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 13px;
      }
      button {
        width: 100%;
        margin-top: 20px;
        padding: 15px 16px;
        border: 1px solid rgba(215, 180, 106, 0.45);
        border-radius: 14px;
        background: linear-gradient(180deg, rgba(215, 180, 106, 0.26), rgba(215, 180, 106, 0.14));
        color: var(--text);
        font: inherit;
        font-weight: 750;
        cursor: pointer;
      }
      button:disabled {
        cursor: not-allowed;
        opacity: 0.58;
      }
      .status {
        margin-top: 16px;
        min-height: 92px;
        padding: 14px;
        border: 1px solid var(--line);
        border-radius: 14px;
        background: rgba(0,0,0,0.28);
        color: var(--muted);
        line-height: 1.7;
        overflow-wrap: anywhere;
      }
      .ok { color: var(--green); }
      .error { color: var(--red); }
    </style>
  </head>
  <body>
    <main>
      <div class="eyebrow">Launch Desk / Final Owner Deployment</div>
      <h1>Deploy from the owner wallet.</h1>
      <p>
        This page deploys the same LaunchWorkflowProofV3 contract directly from your Base owner wallet.
        Use it only when the grant platform requires the smart contract deployer to be your wallet.
      </p>

      <section class="panel">
        <div class="row"><span>Required wallet</span><code>${OWNER_ADDRESS}</code></div>
        <div class="row"><span>AI operator</span><code>${AGENT_OPERATOR_ADDRESS}</code></div>
        <div class="row"><span>Network</span><code>Base Mainnet / chainId 8453</code></div>
        <button id="deploy">Connect ${OWNER_ADDRESS.slice(0, 6)}...${OWNER_ADDRESS.slice(-4)} and deploy final proof contract</button>
        <div class="status" id="status">Waiting for owner wallet.</div>
      </section>
    </main>

    <script>
      const OWNER_ADDRESS = "${OWNER_ADDRESS}";
      const DEPLOY_DATA = "${deployData}";
      const statusBox = document.querySelector("#status");
      const deployButton = document.querySelector("#deploy");

      function setStatus(message, type = "") {
        statusBox.className = "status " + type;
        statusBox.innerHTML = message;
      }

      async function ensureBaseMainnet() {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        if (chainId === "0x2105") return;
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x2105" }],
          });
        } catch (error) {
          if (error.code !== 4902) throw error;
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0x2105",
              chainName: "Base",
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://mainnet.base.org"],
              blockExplorerUrls: ["https://basescan.org"],
            }],
          });
        }
      }

      deployButton.addEventListener("click", async () => {
        deployButton.disabled = true;
        try {
          if (!window.ethereum) throw new Error("No browser wallet found. Open this page with MetaMask / Coinbase Wallet.");
          setStatus("Connecting wallet...");
          await ensureBaseMainnet();
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          const from = accounts[0];
          if (!from || from.toLowerCase() !== OWNER_ADDRESS.toLowerCase()) {
            throw new Error("Wrong wallet. Please switch to " + OWNER_ADDRESS + " before deploying.");
          }

          setStatus("Wallet connected. Please confirm the contract deployment in your wallet.");
          const txHash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [{ from, data: DEPLOY_DATA }],
          });
          setStatus(
            'Deployment submitted.<br><br>Tx: <a href="https://basescan.org/tx/' + txHash + '" target="_blank" rel="noopener">' + txHash + "</a><br><br>Wait for confirmation, then copy the new contract address from BaseScan.",
            "ok",
          );
        } catch (error) {
          setStatus(error.message || String(error), "error");
          deployButton.disabled = false;
        }
      });
    </script>
  </body>
</html>
`;

fs.writeFileSync(outputPath, html);
console.log(`Wrote ${outputPath}`);
