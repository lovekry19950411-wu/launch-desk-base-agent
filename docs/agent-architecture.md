# Base Agent Architecture

Launch Desk already works as an AI workflow runtime demo: a user enters a launch brief, and the system presents a structured workflow with readiness, risks, owner tasks, and release assets.

The Base direction is to make this workflow agent-ready and payment-ready, not to rebuild the product UI.

## Product layer

Launch Desk remains the user-facing demo.

It shows:

- AI workflow execution
- launch readiness analysis
- risk and owner planning
- payment unlock concept
- premium founder-facing interface

## Agent layer

Base Agent v2 is the technical proof layer.

It should eventually handle:

- wallet readiness
- paid API access
- x402 payment verification
- agent-to-agent service access
- Base Sepolia testing before mainnet

## Why Base

Base is relevant because Launch Desk can become an AI workflow service where agents and builders pay for specific launch-planning outputs.

The long-term path is:

Brief input -> AI workflow runtime -> gated API output -> x402 payment -> Base settlement.

## Current non-spending proof

For now, the proof stays offchain or testnet only:

- document agent architecture
- keep Base Sepolia env structure
- show Builder Code / Base identity linkage
- avoid mainnet gas
- avoid contract deployment until there is a clear reason

## Future technical additions

Add these only when needed:

- CDP Agent Wallet
- x402 protected API route
- Base Sepolia payment test
- mainnet receiver address
- optional smart contract if API payments are not enough

