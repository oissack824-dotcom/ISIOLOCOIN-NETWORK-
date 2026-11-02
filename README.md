# Isiolocoin Network — Web3 foundation

A clean starter for an Isiolocoin web application. “Web4” has no universally accepted technical standard, so this project uses the term as a product direction: user-controlled identity and data, interoperable on-chain services, and optional AI features that are transparent and consent-based.

## Included

- Next.js + TypeScript web app with read-only browser wallet connectivity.
- Polygon network switching.
- Multichain route-quote and transfer-status preview at `/lifi`, powered by LI.FI’s API.
- Server-side API proxy for LI.FI network discovery, quotes, and status checks. The LI.FI key is never sent to client code.
- Transaction execution, approvals, token transfers, custody, and staking are intentionally not implemented.

## Local development

Requirements: Node.js 20.9 or later and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 and the multichain preview at http://localhost:3000/lifi. Configure an optional development LI.FI API key in `.env.local` if your account has one. Do not commit `.env.local` or real credentials.

## LI.FI development and production environments

LI.FI's Routing API does **not** provide a separate sandbox base URL or supported testnet routing environment. Both development and production integrations use the same live API base (`https://li.quest/v1`) and the supported mainnet routes returned by `GET /v1/chains`. The `NEXT_PUBLIC_DEPLOYMENT_ENV` variable is an application/deployment label, not a LI.FI sandbox switch. Development quote requests therefore use live route data; this application only displays quotes and status and does not sign, approve, or submit transactions.

Use separate deployments and secrets for isolation:

- Local development: `NEXT_PUBLIC_DEPLOYMENT_ENV=development`; put an optional development API key in ignored `.env.local`.
- Production hosting: set `NEXT_PUBLIC_DEPLOYMENT_ENV=production` in the production deployment and configure its own `LI_FI_API_KEY` as a server-side secret. Do not reuse or expose credentials unnecessarily.
- Keep the base URL fixed to LI.FI's documented endpoint. Do not set it from browser input or an untrusted request parameter.

An API key may be optional for basic calls, but can be used for account-specific access/rate limits. The server proxy sends it as `x-lifi-api-key`; the key must never be exposed in a `NEXT_PUBLIC_*` variable. If you need to test transaction execution, use a dedicated low-value wallet and explicit operational safeguards: LI.FI mainnet quotes are not a sandbox and can lead to real asset transactions if an execution layer is later added.

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
