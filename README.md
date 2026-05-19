# Base Agent v2

Base Agent v2 is the Base-native agent track for Launch Desk.

It proves the path from AI workflow runtime to a wallet-enabled Base agent, starting with Base Sepolia, faucet funding, and x402 paid API unlocks before any mainnet spending or smart contract deployment.

## Current purpose

This folder documents and tests the Base agent path without mainnet spending or contract deployment.

It is meant to support grant, builder, and ecosystem review conversations by showing:

- what Launch Desk already demonstrates
- how it maps to Base AI agents
- what can be tested for free on Base Sepolia
- what should wait until funding or revenue exists

## Current live demo

- Product demo: Launch Desk
- Base branch: `base-miniapp`
- GitHub: `https://github.com/lovekry19950411-wu/launch-desk/tree/base-miniapp`
- Vercel: `https://launch-desk-git-base-miniapp-sheng-pung-wus-projects.vercel.app`
- Builder Code: `bc_9jnnvjew`

## Free-first scope

The current phase should stay free or near-free:

- Base Sepolia only
- no mainnet spending
- no contract deployment
- no production private key
- local x402 paid API testing on Base Sepolia only
- no database requirement

## What this pack contains

- `docs/agent-architecture.md` - Base agent architecture narrative
- `docs/free-now-paid-later.md` - free-first roadmap and paid-later checklist
- `docs/grant-submission-base.md` - human-friendly Base application text
- `scripts/check-base-proof.mjs` - local non-spending proof summary
- `scripts/base-agent-chat.mjs` - simple Chinese chat shell for wallet status and faucet actions
- `scripts/x402-test-readiness.mjs` - local x402 paid API unlock test
- `.env.example` - placeholder environment structure only

## How to run the local proof

```bash
node scripts/check-base-proof.mjs
```

This script does not send transactions, deploy contracts, or call paid APIs.

## How to test the actual Base agent status

```bash
npm install
npm run agent:status
```

This connects to the CDP wallet provider and reads wallet status only.
It does not transfer funds, request faucet funds, or deploy contracts.

## Chat mode

```bash
npm run agent:chat
```

Supported Chinese prompts:

- `查餘額`
- `錢包地址`
- `幫我領 ETH`
- `幫我領 USDC`
- `exit`

Chat mode still stays on Base Sepolia and does not touch mainnet.

## x402 paid API test

Bootstrap a local Base Sepolia payer wallet:

```bash
npm run x402:init-payer
```

Run the protected API test:

```bash
npm run x402:test
```

Expected flow:

- unpaid request returns `402`
- paid request uses Base Sepolia test USDC
- protected launch readiness JSON returns `200`

This is still testnet-only. Do not reuse the generated payer key for mainnet.
