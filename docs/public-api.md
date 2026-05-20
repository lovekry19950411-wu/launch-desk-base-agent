# Public API Reference

These endpoints are safe public proof endpoints for reviewers, grant evaluators, and ecosystem dashboards.

They do not expose private keys, wallet secrets, production API keys, or mainnet spending controls.

## Base URL

```text
https://base-agent-v2.vercel.app
```

## OpenAPI

```text
https://base-agent-v2.vercel.app/openapi.json
```

## GET /api/status

Returns the public agent status.

```bash
curl https://base-agent-v2.vercel.app/api/status
```

Response shape:

```json
{
  "ok": true,
  "project": "Launch Desk Base Agent",
  "mode": "public-status",
  "status": "base-sepolia-proof-complete",
  "builderCode": "bc_9jnnvjew",
  "network": {
    "name": "Base Sepolia",
    "caip2": "eip155:84532",
    "chainId": 84532
  },
  "agent": {
    "walletProvider": "cdp_evm_wallet_provider",
    "addressPreview": "0x1d1c...FcCc",
    "mainnetSpending": false,
    "contractDeployAttempted": false
  }
}
```

## GET /api/proof

Returns the public x402 and readiness proof snapshot.

```bash
curl https://base-agent-v2.vercel.app/api/proof
```

Response shape:

```json
{
  "ok": true,
  "project": "Launch Desk Base Agent",
  "mode": "public-proof",
  "x402": {
    "network": "eip155:84532",
    "price": "$0.001 test USDC",
    "unpaidStatus": 402,
    "paidStatus": 200,
    "transaction": "0x656044d4463c0848401b9c433a995da9b4a7a8ecf5fc7dd28d70003cc398fe8f"
  },
  "readiness": {
    "score": 82,
    "riskLevel": "medium"
  }
}
```

## Safety Boundary

The public API is currently a proof layer only.

- No mainnet spending
- No private key exposure
- No production API calls
- No contract deployment
- No database

The next production step is to replace this proof snapshot with live read-only status and a real x402-protected readiness endpoint.

## POST /api/run-demo

Runs a public-safe simulated agent run.

```bash
curl -X POST https://base-agent-v2.vercel.app/api/run-demo \
  -H "content-type: application/json" \
  -d "{\"productSummary\":\"Launch Desk Base Agent demo\"}"
```

This endpoint returns runtime events and a readiness result. It does not spend funds, expose private keys, deploy contracts, or call production APIs.
