const proof = {
  project: "Launch Desk / Base Agent v2",
  mode: "proof-pack",
  network: process.env.NETWORK_ID || "base-sepolia",
  builderCode: process.env.BASE_BUILDER_CODE || "bc_9jnnvjew",
  receiverAddress: process.env.BASE_RECEIVER_ADDRESS || "0xc97785f7EEaBafFDE32436842AD4824cB4141f8b",
  spending: false,
  deploysContract: false,
  callsPaidApi: false,
  currentPhase: "free-first documentation and architecture proof",
  laterPaidItems: [
    "x402 protected API",
    "Base Sepolia payment test",
    "mainnet receiver funding",
    "smart contract deployment only if required",
  ],
};

console.log(JSON.stringify(proof, null, 2));

