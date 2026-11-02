# Isiolocoin Network — Web3 foundation

A clean starter for an Isiolocoin web application. “Web4” has no universally accepted technical standard, so this project uses the term as a product direction: user-controlled identity and data, interoperable on-chain services, and optional AI features that are transparent and consent-based.

## Included

- Next.js + TypeScript web app with read-only browser wallet connectivity.
- Polygon network switching.
- Multichain route-quote and transfer-status preview at `/lifi`, powered by LI.FI’s API.
- Server-side API proxy for LI.FI network discovery, quotes, and status checks. The LI.FI key is never sent to client code.
- Transaction execution, approvals, token transfers, custody, and staking are intentionally not implemented.

## Run locally

Requirements: Node.js 20.9 or later and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 and the multichain preview at http://localhost:3000/lifi. You can try route discovery without a LI.FI API key; configure one only if your LI.FI account needs it. Store `LI_FI_API_KEY` as a server-side environment secret in your deployment provider. Never use a `NEXT_PUBLIC_` prefix for secrets, commit real keys, or share private keys/seed phrases.

## Multichain quote preview

The `/lifi` page fetches supported networks through `/api/lifi/chains`, submits validated quote requests to `/api/lifi/quote`, and looks up transfers through `/api/lifi/status`. The quote interface takes token contract addresses and the source token decimals from the user; it does not assume the Isiolocoin contract address or select a token on the user's behalf. Quotes are indicative and may include changing fees, routes, or availability. Verify the output and all transaction details independently.

The proxy filters executable transaction data from quote responses and does not execute, sign, or submit transactions. Before enabling execution, add wallet-library integration, simulate and validate transactions, handle approvals and chain changes safely, obtain independent security review, and test against provider documentation and testnets.

## Production checklist

1. Confirm and independently verify the authoritative token contract address, chain, source, supply, and decimals.
2. Add automated unit, integration, and end-to-end tests, plus dependency/security scanning and CI build checks.
3. Add deployment-specific abuse controls and monitoring to API routes; use a shared rate limiter/WAF rather than relying on in-memory limits in serverless deployments.
4. Threat-model wallet authentication, privacy, API authorization, and future transaction flows.
5. Independently review contracts and transaction UX; test on testnets before any production asset interaction.
6. Review legal, consumer-protection, and privacy obligations for each launch jurisdiction.

This scaffold is not an audit, financial product, token offering, or promise of price performance. It has not been independently audited. Production deployments should not enable asset handling until the controls above are completed.
