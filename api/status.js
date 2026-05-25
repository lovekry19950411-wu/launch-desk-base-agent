import { getOrigin } from "./_origin.js";

export default function handler(_request, response) {
  const origin = getOrigin(_request);

  response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  response.status(200).json({
    ok: true,
    project: "Launch Desk Base Agent",
    mode: "public-status",
    status: "base-mainnet-contract-proof-live",
    builderCode: "bc_9jnnvjew",
    network: {
      name: "Base Mainnet + Base Sepolia proof stack",
      caip2: "eip155:8453",
      chainId: 8453,
    },
    agent: {
      walletProvider: "cdp_evm_wallet_provider",
      addressPreview: "0x1d1c...FcCc",
      mainnetSpending: true,
      contractDeployAttempted: true,
    },
    contract: {
      name: "LaunchWorkflowProofV3",
      network: "Base Mainnet",
      address: "0xd6Cfc034ee69eb58c1cBD6A15660c95a49804F65",
      ownerPreview: "0xc977...1f8b",
      agentOperatorPreview: "0x1d1c...FcCc",
      runCount: 0,
      baseScanUrl: "https://basescan.org/address/0xd6Cfc034ee69eb58c1cBD6A15660c95a49804F65",
    },
    links: {
      website: origin,
      github: "https://github.com/lovekry19950411-wu/launch-desk-base-agent",
      catalog: `${origin}/api/catalog`,
      openapi: `${origin}/openapi.json`,
    },
    updatedAt: "2026-05-21",
  });
}
