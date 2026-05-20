# Roadmap

This roadmap keeps Launch Desk Base Agent focused on Base-native AI workflow infrastructure.

## Phase 1 - Public Proof Layer

Status: complete

- Public status page
- Public `/api/status`
- Public `/api/proof`
- Public `/api/run-demo`
- OpenAPI spec
- Demo video
- GitHub repo
- Builder Code metadata

## Phase 2 - Real x402 Protected API

Status: next

Goal: replace the simulated demo API with a real x402-protected readiness endpoint.

Scope:

- `POST /api/launch-readiness`
- unpaid request returns `402`
- paid request unlocks readiness JSON
- Base Sepolia first
- no browser-side private keys
- no mainnet spending until reviewed

## Phase 3 - Live Agent Status

Status: planned

Goal: move public proof data from static snapshots to live read-only checks.

Scope:

- read CDP wallet status server-side
- expose safe balance/network metadata
- keep secrets in Vercel environment variables
- never expose private keys or wallet secrets

## Phase 4 - Production Payment Path

Status: later

Goal: turn Launch Desk workflow outputs into paid API products.

Scope:

- USDC-gated launch readiness API
- USDC-gated risk analysis API
- USDC-gated launch copy API
- usage documentation
- basic pricing page

## Phase 5 - Optional Onchain Contract

Status: only if needed

Do not deploy a contract just to look more complete.

Only add a minimal contract if a campaign, grant, customer, or partner requires onchain proof.

Possible contract shapes:

- proof registry
- paid API receipt registry
- launch workflow attestation record

## Phase 6 - Shared AI Core

Status: later

Goal: let Base and World integrations reuse the same Launch Desk AI workflow core.

Shape:

```text
Launch Desk AI Core
  -> Base Adapter: CDP wallet, x402, USDC
  -> World Adapter: World ID, WLD payment, Mini App
```

This keeps the AI logic shared while platform-specific identity and payment layers stay separate.
