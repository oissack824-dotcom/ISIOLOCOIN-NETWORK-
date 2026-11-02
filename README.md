# Isiolocoin Network — Web3 foundation

A clean starter for an Isiolocoin web application. “Web4” has no universally accepted technical standard, so this project uses the term as a product direction: user-controlled identity and data, interoperable on-chain services, and optional AI features that are transparent and consent-based.

## Included

- Next.js + TypeScript web app with read-only browser wallet connectivity.
- Polygon network switching.
- Multichain route-quote and transfer-status preview at `/lifi`, powered by LI.FI’s API.
- Server-side API proxy for LI.FI network discovery, quotes, and status checks. The LI.FI key is never sent to client code.
- A configurable $17 USD reference-price display. It is not a market feed, peg, redemption promise, or guarantee.
- Transaction execution, approvals, token transfers, custody, and staking are intentionally not implemented.

## Run locally

Requirements: Node.js 20.9 or later and npm.

```bash
npm install
cp .env.example .env.local
# For local development, set NEXT_PUBLIC_DEPLOYMENT_ENV=development in .env.local.
npm run dev
```

Open http://localhost:3000 and the multichain preview at http://localhost:3000/lifi. Configure an optional development LI.FI API key in `.env.local` if your account has one. Do not commit `.env.local` or real credentials.

## LI.FI development and production environments

The LI.FI Routing API does **not** provide a separate sandbox base URL or supported testnet routing environment. The server routes use the live API base (`https://li.quest/v1`) in every application mode and the supported mainnet routes returned by `GET /v1/chains`. `NEXT_PUBLIC_DEPLOYMENT_ENV` labels the app deployment only; it does not switch LI.FI to a sandbox. Development quote requests use live route data, but this application only displays quotes and status and does not sign, approve, or submit transactions.

For the deployed live app, set `NEXT_PUBLIC_DEPLOYMENT_ENV=production` and `NEXT_PUBLIC_ISIOLO_PRICE_USD=17` in the hosting provider's environment configuration. Set `LI_FI_API_KEY` there as a server-side secret if required by your LI.FI account. The committed `.env.example` is only a template; it cannot configure secrets or environment variables in an external hosting provider. Never put the key in a `NEXT_PUBLIC_*` variable.

For development, use a separate deployment and optional development API key. Since LI.FI has no sandbox, any quote is based on live mainnet routing data. If a transaction execution layer is ever added, testing must be explicitly controlled and could move real assets; use a dedicated low-value wallet and strict safeguards.

## Multichain quote preview

The `/lifi` page fetches supported networks through `/api/lifi/chains`, submits validated quote requests to `/api/lifi/quote`, and looks up transfers through `/api/lifi/status`. The quote interface takes token contract addresses and the source token decimals from the user; it does not assume the Isiolocoin contract address or select a token on the user's behalf. Quotes are indicative and may include changing fees, routes, or availability. Verify the output and all transaction details independently.

The proxy filters executable transaction data from quote responses and does not execute, sign, or submit transactions. Before enabling execution, add wallet-library integration, simulate and validate transactions, handle approvals and chain changes safely, obtain independent security review, and test the complete flow with strict wallet/amount controls.

## Production checklist

1. Confirm and independently verify the authoritative token contract address, chain, source, supply, and decimals.
2. Add automated unit, integration, and end-to-end tests, plus dependency/security scanning and CI build checks.
3. Add deployment-specific abuse controls and monitoring to API routes; use a shared rate limiter/WAF rather than relying on in-memory limits in serverless deployments.
4. Threat-model wallet authentication, privacy, API authorization, and future transaction flows.
5. Independently review contracts and transaction UX; use dedicated wallets and minimal amounts for any mainnet integration testing.
6. Review legal, consumer-protection, and privacy obligations for each launch jurisdiction.

This scaffold is not an audit, financial product, token offering, or promise of price performance. It has not been independently audited. Production deployments should not enable asset handling until the controls above are completed.
