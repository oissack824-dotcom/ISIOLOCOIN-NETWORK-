import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const POSITIVE_INTEGER = /^[1-9][0-9]{0,77}$/;
const CHAIN_ID = /^[1-9][0-9]{0,9}$/;

type QuoteInput = {
  fromChain?: unknown;
  toChain?: unknown;
  fromToken?: unknown;
  toToken?: unknown;
  fromAddress?: unknown;
  toAddress?: unknown;
  fromAmount?: unknown;
  slippage?: unknown;
};

export async function POST(request: NextRequest) {
  let body: QuoteInput;
  try {
    body = (await request.json()) as QuoteInput;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const { fromChain, toChain, fromToken, toToken, fromAddress, toAddress, fromAmount, slippage } = body;
  if (typeof fromChain !== "string" || !CHAIN_ID.test(fromChain) ||
      typeof toChain !== "string" || !CHAIN_ID.test(toChain)) {
    return NextResponse.json({ error: "Select supported source and destination networks." }, { status: 400 });
  }
  if (typeof fromToken !== "string" || !ADDRESS.test(fromToken) ||
      typeof toToken !== "string" || !ADDRESS.test(toToken)) {
    return NextResponse.json({ error: "Enter valid token contract addresses for both networks." }, { status: 400 });
  }
  if (typeof fromAddress !== "string" || !ADDRESS.test(fromAddress)) {
    return NextResponse.json({ error: "Connect a wallet or enter a valid sender address." }, { status: 400 });
  }
  if (toAddress !== undefined && (typeof toAddress !== "string" || !ADDRESS.test(toAddress))) {
    return NextResponse.json({ error: "Recipient must be a valid EVM address." }, { status: 400 });
  }
  if (typeof fromAmount !== "string" || !POSITIVE_INTEGER.test(fromAmount)) {
    return NextResponse.json({ error: "Amount must be a positive integer in the token's smallest units." }, { status: 400 });
  }
  if (slippage !== undefined && (typeof slippage !== "number" || !Number.isFinite(slippage) || slippage < 0 || slippage > 0.05)) {
    return NextResponse.json({ error: "Slippage must be between 0 and 5%." }, { status: 400 });
  }

  const params = new URLSearchParams({
    fromChain,
    toChain,
    fromToken,
    toToken,
    fromAddress,
    fromAmount,
  });
  if (toAddress) params.set("toAddress", toAddress);
  if (slippage !== undefined) params.set("slippage", String(slippage));

  try {
    const headers: HeadersInit = { Accept: "application/json" };
    const apiKey = process.env.LI_FI_API_KEY;
    if (apiKey) headers["x-lifi-api-key"] = apiKey;

    const upstream = await fetch(`https://li.quest/v1/quote?${params.toString()}`, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "The routing provider could not produce a quote. Check the networks, tokens, amount, and wallet address." }, { status: 502 });
    }

    const result = await upstream.json();
    // Quotes can include an executable transaction request. This read-only UI must not expose or execute it.
    const { transactionRequest: _transactionRequest, approvalAddress: _approvalAddress, ...safeQuote } = result;
    return NextResponse.json(safeQuote, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Quote service is temporarily unavailable." }, { status: 503 });
  }
}
