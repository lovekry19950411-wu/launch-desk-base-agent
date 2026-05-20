export default function handler(_request, response) {
  response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  response.status(200).json({
    ok: true,
    project: "Launch Desk Base Agent",
    mode: "public-proof",
    x402: {
      network: "eip155:84532",
      price: "$0.001 test USDC",
      unpaidStatus: 402,
      paidStatus: 200,
      transaction: "0x656044d4463c0848401b9c433a995da9b4a7a8ecf5fc7dd28d70003cc398fe8f",
      receiver: "0xc97785f7EEaBafFDE32436842AD4824cB4141f8b",
    },
    readiness: {
      score: 82,
      riskLevel: "medium",
      actions: [
        "Record one paid API unlock proof.",
        "Keep the agent wallet separate from the founder wallet.",
        "Prepare x402 API docs before public beta.",
      ],
    },
    safety: {
      mainnetSpending: false,
      privateKeysExposed: false,
      productionApiCalled: false,
    },
    updatedAt: "2026-05-20",
  });
}
