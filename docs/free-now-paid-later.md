# Free Now, Paid Later

This project should avoid spending money until the product and grant path are clearer.

## Do now

These are free or near-free:

- keep Launch Desk live on Vercel free tier
- keep Base Sepolia as the test network
- document agent wallet architecture
- use Builder Code for Base attribution
- prepare x402 API design
- record demos and submit proof
- collect builder feedback

## Do later

These may require funds or stronger commitment:

- Base mainnet transactions
- smart contract deployment
- x402 production settlement
- production wallet funding
- custom domain
- paid monitoring / analytics
- contract audit
- larger model usage

## Why not deploy a contract yet

A smart contract is not the first requirement for Launch Desk.

The product value is workflow orchestration and paid API access. x402 or wallet-gated API access may be enough for the first monetization test.

Deploy a contract only if:

- the grant explicitly requires it
- a paid workflow needs onchain state
- API payment receipts are not enough
- there is funding for gas and maintenance

## Suggested next paid milestone

The first paid milestone should be small:

- one x402-protected endpoint
- Base Sepolia first
- price: small USDC test amount
- no database
- no contract

Only after that works should mainnet be considered.

