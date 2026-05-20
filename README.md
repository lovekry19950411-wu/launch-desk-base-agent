# Base Agent v2

Base Agent v2 is the Base-native agent track for Launch Desk.

It proves the path from AI workflow runtime to a wallet-enabled Base agent, starting with Base Sepolia, faucet funding, public proof APIs, and x402 paid API unlocks before any mainnet spending or smart contract deployment.

## Current Purpose

This folder documents and tests the Base agent path without mainnet spending or contract deployment.

It is meant to support grant, builder, and ecosystem review conversations by showing:

- what Launch Desk already demonstrates
- how it maps to Base AI agents
- what can be tested for free on Base Sepolia
- what should wait until funding or revenue exists

## Current Live Demo

- Base Agent site: `https://base-agent-v2.vercel.app`
- Base Agent GitHub: `https://github.com/lovekry19950411-wu/launch-desk-base-agent`
- Public capability catalog: `https://base-agent-v2.vercel.app/api/catalog`
- Public status API: `https://base-agent-v2.vercel.app/api/status`
- Public proof API: `https://base-agent-v2.vercel.app/api/proof`
- Public demo run API: `https://base-agent-v2.vercel.app/api/run-demo`
- OpenAPI spec: `https://base-agent-v2.vercel.app/openapi.json`
- Launch Desk product demo: `https://launch-desk-git-base-miniapp-sheng-pung-wus-projects.vercel.app`
- Launch Desk branch: `https://github.com/lovekry19950411-wu/launch-desk/tree/base-miniapp`
- Builder Code: `bc_9jnnvjew`

## Public Status Page

This repo includes a tiny static `index.html` for Vercel deployment and project verification.

It is intentionally separate from the agent scripts:

- safe public metadata only
- no private keys
- no production wallet secret
- no browser-side signing
- no change to the CDP or x402 local test flow

The page also exposes safe public proof APIs:

- `GET /api/status`
- `GET /api/catalog`
- `GET /api/proof`
- `POST /api/run-demo`

## Free-first Scope

The current phase should stay free or near-free:

- Base Sepolia only
- no mainnet spending
- no contract deployment
- no production private key
- local x402 paid API testing on Base Sepolia only
- public proof APIs for review
- no database requirement

## What This Pack Contains

- `docs/agent-architecture.md` - Base agent architecture narrative
- `docs/free-now-paid-later.md` - free-first roadmap and paid-later checklist
- `docs/grant-submission-base.md` - human-friendly Base application text
- `docs/public-api.md` - public status/proof API reference
- `docs/contract-plan.md` - Base Sepolia workflow proof contract plan
- `docs/roadmap.md` - phased roadmap from proof API to paid Base agent
- `docs/submission-checklist.md` - review and grant submission checklist
- `scripts/check-base-proof.mjs` - local non-spending proof summary
- `scripts/base-agent-chat.mjs` - simple Chinese chat shell for wallet status and faucet actions
- `scripts/x402-test-readiness.mjs` - local x402 paid API unlock test
- `.env.example` - placeholder environment structure only

## How To Run The Local Proof

```bash
node scripts/check-base-proof.mjs
```

This script does not send transactions, deploy contracts, or call paid APIs.

## Verify Public API Handlers

```bash
npm run verify:api
```

This validates the public Vercel API handlers locally: catalog, status, proof, and simulated demo run.

## Workflow Proof Contract

The first smart contract draft is:

```text
contracts/LaunchWorkflowProof.sol
```

Base Sepolia deployment:

```text
Contract: 0xfbd1343ce44c8bf056370c222b3f90524a4e1ffb
Deploy tx: 0x6bd25a0f763666ceb886df9b0bd55a9d11fec34046a2e0de4c2682fc5f0d6591
Basescan: https://sepolia.basescan.org/address/0xfbd1343ce44c8bf056370c222b3f90524a4e1ffb
```

It records compact AI workflow proof data onchain:

- run ID
- project name
- readiness score
- risk level
- output hash
- agent address
- timestamp

Generate a sample payload:

```bash
npm run contract:sample
```

This does not deploy a contract or send a transaction.

Deploy to Base Sepolia:

```bash
npm run contract:deploy:sepolia
```

Record another workflow proof:

```bash
npm run contract:record:sepolia -- --contract=0xfbd1343ce44c8bf056370c222b3f90524a4e1ffb
```

Deployment plan:

```text
docs/contract-plan.md
```

## How To Test The Actual Base Agent Status

```bash
npm install
npm run agent:status
```

This connects to the CDP wallet provider and reads wallet status only.
It does not transfer funds, request faucet funds, or deploy contracts.

## Chat Mode

```bash
npm run agent:chat
```

Supported Chinese prompts:

- `查餘額`
- `錢包地址`
- `幫我領 ETH`
- `幫我領 USDC`
- `exit`

Chat mode stays on Base Sepolia and does not touch mainnet.

## Public API Showcase

The first free phase exposes reviewer-friendly APIs that other agents, dashboards, or funding reviewers can inspect without secrets:

```bash
curl https://base-agent-v2.vercel.app/api/catalog
curl https://base-agent-v2.vercel.app/api/status
curl https://base-agent-v2.vercel.app/api/proof
```

Run the simulated agent workflow:

```bash
curl -X POST https://base-agent-v2.vercel.app/api/run-demo \
  -H "content-type: application/json" \
  -d "{\"productSummary\":\"Launch Desk Base Agent demo\",\"targetAudience\":\"Base builders\"}"
```

These public endpoints are intentionally read-only or simulated. They do not spend funds, expose private keys, deploy contracts, or sign transactions in the browser.

## x402 Paid API Test

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
