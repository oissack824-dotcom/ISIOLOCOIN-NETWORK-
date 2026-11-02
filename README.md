# Isiolocoin Network — Web3 foundation

A clean starter for an Isiolocoin web application. “Web4” has no universally accepted technical standard, so this project uses the term as a product direction: user-controlled identity and data, interoperable on-chain services, and optional AI features that are transparent and consent-based.

## What’s included

- Next.js + TypeScript web app scaffold.
- Browser-injected wallet connection (for example, MetaMask).
- Wallet address and network status display.
- Polygon network switch action.
- No private keys, seed phrases, token contracts, or transaction signing are stored in the app.

## Run locally

Requirements: Node.js 20.9 or later and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Wallet features require a compatible browser wallet. The app can be viewed without one.

## Configuration

Copy `.env.example` to `.env.local` when adding integrations. Never put private keys, seed phrases, or server secrets in `NEXT_PUBLIC_*` variables. The current starter intentionally does not assume a token address or enable transfers.

## Roadmap before production

1. Confirm the authoritative token contract address and verify its source on PolygonScan.
2. Add read-only token balance/metadata views, with tests for incorrect networks and missing contracts.
3. Design wallet authentication using signed, nonce-based messages; do not treat a wallet address alone as proof of session ownership.
4. Add APIs and user-controlled data storage with explicit consent and export/deletion paths.
5. Add AI features only behind clear disclosure and user consent; do not send wallet or personal data to external services by default.
6. Threat-model and independently review contracts, API authorization, privacy, and transaction flows before handling assets.

This scaffold is not an audit, financial product, token offering, or promise of price performance. Test changes on testnets before any production deployment.
