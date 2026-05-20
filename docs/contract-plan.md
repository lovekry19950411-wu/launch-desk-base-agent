# LaunchWorkflowProof Contract Plan

This is the contract plan for the free/testnet phase of Launch Desk Base Agent.

## Goal

Deploy a minimal Base Sepolia contract that proves Launch Desk can write AI workflow results onchain.

The contract is not a token, marketplace, staking contract, or payment processor.

It is a compact proof layer:

```text
AI workflow run -> offchain JSON output -> output hash -> Base Sepolia contract record
```

## Contract

`contracts/LaunchWorkflowProof.sol`

## What It Records

Each workflow run stores:

- `runId`
- `projectName`
- `readinessScore`
- `riskLevel`
- `outputHash`
- `agentAddress`
- `createdAt`

Full AI output should stay offchain. Only the hash and compact metadata go onchain.

## Why This Fits Base Agent Direction

Launch Desk Base Agent already has:

- CDP wallet proof
- Base Sepolia faucet proof
- x402 unlock proof
- public API catalog
- simulated AI workflow runtime

The contract adds the missing onchain proof layer.

## Builder Code

Builder Code does not require contract changes.

Base Builder Code attribution is appended to transaction calldata and read by offchain indexers. The contract can stay simple and continue to execute normally.

## Deployment Phases

### Phase 1: Local contract and sample payload

Status: current.

- Write the contract
- Generate sample workflow proof payload
- Do not deploy
- Do not spend mainnet funds

### Phase 2: Base Sepolia deployment

Status: complete.

Required testnet ETH only.

- Deploy `LaunchWorkflowProof` to Base Sepolia
- Record one sample workflow run
- Add contract address and tx hash to `/api/proof`
- Add Basescan link to the public page

Deployment:

```text
Contract: 0xfbd1343ce44c8bf056370c222b3f90524a4e1ffb
Deploy tx: 0x6bd25a0f763666ceb886df9b0bd55a9d11fec34046a2e0de4c2682fc5f0d6591
First successful record tx: 0x8618325b87c04c2823ff2c8afce81d3a321eac9e040da7b3a982172433faa879
Basescan: https://sepolia.basescan.org/address/0xfbd1343ce44c8bf056370c222b3f90524a4e1ffb
```

### Phase 3: Base mainnet deployment

Requires real ETH for gas.

- Deploy the same minimal contract to Base mainnet
- Record production workflow proofs
- Pair with real x402 USDC unlocks

## Local Sample

```bash
npm run contract:sample
```

This prints sample arguments for `recordWorkflowRun(...)`.

No transaction is sent.

## Future Deployment Command

After a deployer wallet is funded on Base Sepolia:

```bash
forge create contracts/LaunchWorkflowProof.sol:LaunchWorkflowProof \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --account deployer \
  --broadcast
```

Do not run `--broadcast` until the wallet and RPC are confirmed.
