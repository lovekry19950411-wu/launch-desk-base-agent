# Submission Checklist

Use this checklist when submitting Launch Desk Base Agent to Base, Talent, MiniPay/Celo-adjacent campaigns, or public builder updates.

## Core Links

- Website: `https://launch-desk-base-agent.onrender.com`
- GitHub: `https://github.com/lovekry19950411-wu/launch-desk-base-agent`
- Public capability catalog: `https://launch-desk-base-agent.onrender.com/api/catalog`
- Public status API: `https://launch-desk-base-agent.onrender.com/api/status`
- Public proof API: `https://launch-desk-base-agent.onrender.com/api/proof`
- Public demo run API: `https://launch-desk-base-agent.onrender.com/api/run-demo`
- OpenAPI spec: `https://launch-desk-base-agent.onrender.com/openapi.json`
- Builder Code: `bc_9jnnvjew`
- Base mainnet contract proof: `https://basescan.org/address/0xd6Cfc034ee69eb58c1cBD6A15660c95a49804F65`

## One-line Description

Launch Desk Base Agent is a Base-native AI workflow agent proof showing CDP wallet readiness, x402-style paid API unlocks, and Base mainnet smart contract proof for AI workflow services.

## Short Description

Launch Desk Base Agent is an early Base-native AI agent prototype. It demonstrates how an AI workflow product can evolve from a static dashboard into agent infrastructure with a CDP wallet, x402 API unlock flow, public proof endpoints, revenue routing to the owner wallet, and Base mainnet smart contract proof.

## What To Submit

- App/project website
- GitHub repo
- Demo video
- App thumbnail and screenshot
- Builder Code if requested
- Public proof API links if there is a notes field

## What To Emphasize

- Base Sepolia proof is already working
- Base mainnet V3 workflow proof contract is deployed
- x402 payment unlock was tested
- The agent has public status/proof APIs
- The agent exposes a public capability catalog and OpenAPI spec
- Revenue is configured to route directly to the owner wallet, not sit inside the agent
- The AI operator wallet is limited to proof/operation tasks
- No private keys are exposed
- No automatic mainnet spending is enabled

## Suggested Note

This is still an early prototype. The current goal is to prove the Base-native AI agent path with controlled onchain scope: CDP wallet, x402-style paid API unlock, public proof endpoints, direct owner revenue routing, and a Base mainnet workflow proof contract.

## Current Limitations

- No production customer payment volume yet
- No automatic revenue sweep is enabled yet
- Agent console uses safe public proof APIs, not live wallet signing in the browser
- x402 settlement proof is from the verified Base Sepolia test flow
- Mainnet contract proof exists, but production usage is still intentionally limited

## Next Milestones

1. Turn `/api/proof` into a live read-only proof service.
2. Add a real x402-protected `/api/launch-readiness` endpoint.
3. Add Builder Code attribution to agent-triggered transactions where supported.
4. Add Paymaster only for high-intent verified workflow actions.
5. Enable revenue sweep only after explicit owner approval and spending limits.
