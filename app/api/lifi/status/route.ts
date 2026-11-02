import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const CHAIN_ID = /^[1-9][0-9]{0,9}$/;
const TX_HASH = /^0x[a-fA-F0-9]{64}$/;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const txHash = query.get("txHash");
  const fromChain = query.get("fromChain");
  const toChain = query.get("toChain");
  const bridge = query.get("bridge");

  if (!txHash || !TX_HASH.test(txHash) || !fromChain || !CHAIN_ID.test(fromChain) || !toChain || !CHAIN_ID.test(toChain)) {
    return NextResponse.json({ error: "Provide a transaction hash and valid source and destination network IDs." }, { status: 400 });
  }
  if (bridge && !/^[a-zA-Z0-9 _.-]{1,80}$/.test(bridge)) {
    return NextResponse.json({ error: "Invalid bridge name." }, { status: 400 });
  }

  const params = new URLSearchParams({ txHash, fromChain, toChain });
  if (bridge) params.set("bridge", bridge);

  try {
    const headers: HeadersInit = { Accept: "application/json" };
    const apiKey = process.env.LI_FI_API_KEY;
    if (apiKey) headers["x-lifi-api-key"] = apiKey;

    const upstream = await fetch(`https://li.quest/v1/status?${params.toString()}`, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Unable to retrieve transfer status. Verify the transaction details and try again." }, { status: 502 });
    }
    return NextResponse.json(await upstream.json(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Transfer status service is temporarily unavailable." }, { status: 503 });
  }
}
