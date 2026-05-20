# Submission Checklist

Use this checklist when submitting Launch Desk Base Agent to Base, Talent, MiniPay/Celo-adjacent campaigns, or public builder updates.

## Core Links

- Website: `https://base-agent-v2.vercel.app`
- GitHub: `https://github.com/lovekry19950411-wu/launch-desk-base-agent`
- Public capability catalog: `https://base-agent-v2.vercel.app/api/catalog`
- Public status API: `https://base-agent-v2.vercel.app/api/status`
- Public proof API: `https://base-agent-v2.vercel.app/api/proof`
- Public demo run API: `https://base-agent-v2.vercel.app/api/run-demo`
- OpenAPI spec: `https://base-agent-v2.vercel.app/openapi.json`
- Builder Code: `bc_9jnnvjew`

## One-line Description

Launch Desk Base Agent is a Base-native AI workflow agent proof showing CDP wallet readiness, Base Sepolia testing, and x402 paid API unlocks for AI workflow services.

## Short Description

Launch Desk Base Agent is an early Base-native AI agent prototype. It demonstrates how an AI workflow product can evolve from a static dashboard into agent infrastructure with a CDP wallet, x402 API unlock flow, Base Sepolia proof, public proof endpoints, and a path toward USDC-gated AI workflow services.

## What To Submit

- App/project website
- GitHub repo
- Demo video
- App thumbnail and screenshot
- Builder Code if requested
- Public proof API links if there is a notes field

## What To Emphasize

- Base Sepolia proof is already working
- x402 payment unlock was tested
- The agent has public status/proof APIs
- The agent exposes a public capability catalog and OpenAPI spec
- The Base Sepolia workflow proof contract has a minimal audited-by-reading draft
- The workflow proof contract is deployed on Base Sepolia
- No private keys are exposed
- No mainnet spending was attempted
- Smart contract deployment is intentionally deferred until it is necessary

## Suggested Note

This is still an early prototype. The current goal is to prove the Base-native AI agent path before moving to mainnet: CDP wallet, x402 paid API unlock, and public proof endpoints first; production payments and contracts later.

## Current Limitations

- No production mainnet payment yet
- No smart contract deployment yet
- Contract is deployed on Base Sepolia, but not yet on Base mainnet
- Agent console uses safe public proof APIs, not live wallet signing in the browser
- x402 settlement proof is from the verified Base Sepolia test flow

## Next Milestones

1. Turn `/api/proof` into a live read-only proof service.
2. Add a real x402-protected `/api/launch-readiness` endpoint.
3. Add Builder Code attribution to agent-triggered transactions where supported.
4. Move from Base Sepolia to mainnet only after funding and safety checks.
5. Add a minimal contract only if a campaign or customer requires onchain proof.
