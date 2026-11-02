import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET() {
  try {
    const headers: HeadersInit = { Accept: "application/json" };
    const apiKey = process.env.LI_FI_API_KEY;
    if (apiKey) headers["x-lifi-api-key"] = apiKey;

    const upstream = await fetch("https://li.quest/v1/chains", {
      headers,
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 300 },
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Unable to load supported networks from the routing provider." }, { status: 502 });
    }

    const data: unknown = await upstream.json();
    return NextResponse.json(data, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  } catch {
    return NextResponse.json({ error: "Network list is temporarily unavailable." }, { status: 503 });
  }
}
