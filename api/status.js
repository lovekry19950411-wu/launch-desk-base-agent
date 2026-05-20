export default function handler(_request, response) {
  response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  response.status(200).json({
    ok: true,
    project: "Launch Desk Base Agent",
    mode: "public-status",
    status: "base-sepolia-proof-complete",
    builderCode: "bc_9jnnvjew",
    network: {
      name: "Base Sepolia",
      caip2: "eip155:84532",
      chainId: 84532,
    },
    agent: {
      walletProvider: "cdp_evm_wallet_provider",
      addressPreview: "0x1d1c...FcCc",
      mainnetSpending: false,
      contractDeployAttempted: false,
    },
    links: {
      website: "https://base-agent-v2.vercel.app",
      github: "https://github.com/lovekry19950411-wu/launch-desk-base-agent",
      catalog: "https://base-agent-v2.vercel.app/api/catalog",
      openapi: "https://base-agent-v2.vercel.app/openapi.json",
    },
    updatedAt: "2026-05-21",
  });
}
