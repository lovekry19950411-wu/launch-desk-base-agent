# CDP Agent Revenue Configuration

This document explains the Base/CDP setup in plain language for grant reviewers, future builders, and handoff.

## Current roles

- Founder / owner wallet: `0xc97785f7EEaBafFDE32436842AD4824cB4141f8b`
- AI operator wallet: `0x1d1ce502DE895c4cB6b946bE172f68B03581FcCc`
- Base mainnet proof contract: `0xd6Cfc034ee69eb58c1cBD6A15660c95a49804F65`
- Builder Code: `bc_9jnnvjew`

## What this means

The owner wallet is the boss wallet. It should receive revenue and keep final control.

The AI operator wallet is a CDP Server Wallet. It can execute approved workflow actions, such as recording a receipt hash to the Base contract, but it should not hold large funds.

The proof contract is the public receipt layer. It stores workflow proof metadata, not private customer content.

## Revenue flow

Phase 1 keeps revenue simple:

1. A paid API or x402 unlock points directly to the owner wallet.
2. The AI operator records the workflow proof after the run is approved.
3. If the operator ever receives funds by mistake, a future sweep tool can move excess back to the owner wallet.

Automatic sweeping is disabled by default.

## Environment variables

```env
BASE_RECEIVER_ADDRESS=0xc97785f7EEaBafFDE32436842AD4824cB4141f8b
X402_RECEIVER_ADDRESS=0xc97785f7EEaBafFDE32436842AD4824cB4141f8b
BASE_MAINNET_WORKFLOW_CONTRACT=0xd6Cfc034ee69eb58c1cBD6A15660c95a49804F65
MAINNET_AGENT_OPERATOR=0x1d1ce502DE895c4cB6b946bE172f68B03581FcCc
REVENUE_SWEEP_ENABLED=false
REVENUE_SWEEP_TARGET_ADDRESS=0xc97785f7EEaBafFDE32436842AD4824cB4141f8b
REVENUE_SWEEP_RESERVE_ETH=0.00005
```

## Useful commands

```bash
npm run agent:chat
npm run agent:status
npm run revenue:plan
npm run proof
npm run verify:api
```

Mainnet write commands require explicit owner approval:

```bash
npm run contract:record:mainnet:v3
```

## Official positioning

Launch Desk Base Agent is a Base-native AI workflow agent proof:

- CDP Server Wallet gives the AI operator a controlled onchain identity.
- x402 / USDC unlocks prepare paid API access for AI workflow services.
- Base mainnet smart contract receipts prove that workflow runs happened.
- Revenue routes to the founder wallet first, while the operator only keeps minimal gas.
