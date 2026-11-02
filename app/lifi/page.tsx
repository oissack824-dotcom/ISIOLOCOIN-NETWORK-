"use client";

import { FormEvent, useEffect, useState } from "react";

type Chain = { id: number; name: string; chainType?: string };
type Quote = {
  tool?: string;
  action?: { fromChain?: number; toChain?: number; fromToken?: { symbol?: string }; toToken?: { symbol?: string } };
  estimate?: { fromAmount?: string; toAmount?: string; toAmountMin?: string; executionDuration?: number };
  includedSteps?: Array<{ tool?: string; type?: string; estimate?: { executionDuration?: number } }>;
};
type EthereumProvider = {
  request: (args: { method: string }) => Promise<unknown>;
};

declare global {
  interface Window { ethereum?: EthereumProvider }
}

const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const TX_HASH = /^0x[a-fA-F0-9]{64}$/;

export default function LifiPage() {
  const [chains, setChains] = useState<Chain[]>([]);
  const [account, setAccount] = useState("");
  const [fromChain, setFromChain] = useState("137");
  const [toChain, setToChain] = useState("1");
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("0.005");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [busy, setBusy] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [statusFrom, setStatusFrom] = useState("137");
  const [statusTo, setStatusTo] = useState("1");
  const [transferStatus, setTransferStatus] = useState<unknown>(null);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    fetch("/api/lifi/chains")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load networks.");
        setChains(Array.isArray(data.chains) ? data.chains : []);
      })
      .catch((error: unknown) => setQuoteError(error instanceof Error ? error.message : "Could not load networks."));
  }, []);

  async function connectWallet() {
    if (!window.ethereum) {
      setQuoteError("No EVM wallet found. Connect a compatible browser wallet or enter a sender address.");
      return;
    }
    try {
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      setAccount(accounts[0] ?? "");
      setQuoteError("");
    } catch {
      setQuoteError("Wallet connection was cancelled or failed.");
    }
  }

  async function requestQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuote(null);
    setQuoteError("");
    setBusy(true);
    try {
      const rawAmount = amount.trim();
      const decimals = Number((document.getElementById("token-decimals") as HTMLInputElement | null)?.value ?? "18");
      if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36) throw new Error("Token decimals must be between 0 and 36.");
      if (!/^(?:0|[1-9][0-9]*)(?:\.[0-9]+)?$/.test(rawAmount) || Number(rawAmount) <= 0) throw new Error("Enter a positive token amount.");
      const [whole = "0", fraction = ""] = rawAmount.split(".");
      if (fraction.length > decimals) throw new Error(`Amount has more fractional digits than the selected ${decimals} token decimals.`);
      const fromAmount = (BigInt(whole) * 10n ** BigInt(decimals) + BigInt((fraction + "0".repeat(decimals)).slice(0, decimals) || "0")).toString();
      const sender = account || (document.getElementById("sender-address") as HTMLInputElement | null)?.value.trim() || "";
      const response = await fetch("/api/lifi/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromChain, toChain, fromToken, toToken, fromAddress: sender, fromAmount, slippage: Number(slippage) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Quote request failed.");
      setQuote(data as Quote);
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : "Unable to retrieve a quote.");
    } finally {
      setBusy(false);
    }
  }

  async function checkStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTransferStatus(null);
    setStatusError("");
    if (!TX_HASH.test(txHash.trim())) {
      setStatusError("Enter a valid 32-byte transaction hash.");
      return;
    }
    try {
      const params = new URLSearchParams({ txHash: txHash.trim(), fromChain: statusFrom, toChain: statusTo });
      const response = await fetch(`/api/lifi/status?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Status lookup failed.");
      setTransferStatus(data);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Unable to retrieve transfer status.");
    }
  }

  const selectStyle = { width: "100%", padding: 12, borderRadius: 8, color: "#f3f5ef", background: "#101816", border: "1px solid rgba(224,242,228,.18)" };
  const inputStyle = { ...selectStyle };

  return (
    <main className="page-shell lifi-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Isiolocoin home"><span className="brand-mark">I</span><span>ISIOLO<span className="brand-light">COIN</span></span></a>
        <span className="network-pill"><span className="status-dot" /> Multichain routes</span>
      </header>

      <section className="hero lifi-hero">
        <div className="eyebrow"><span /> Powered by LI.FI</div>
        <h1>Explore <span>multichain.</span></h1>
        <p className="intro">Get a cross-chain route quote and check transfer status. This preview is read-only: it does not request approvals, sign transactions, or move funds.</p>
        <button className="secondary-button" type="button" onClick={connectWallet}>{account ? `Wallet ${account.slice(0, 6)}…${account.slice(-4)}` : "Connect wallet (optional)"}</button>
      </section>

      <section className="lifi-card" aria-labelledby="quote-title">
        <h2 id="quote-title">Route quote</h2>
        <p className="lifi-note">Choose token contract addresses from the provider’s supported network/token lists. Amount is entered in human units; decimals default to 18.</p>
        <form className="lifi-form" onSubmit={requestQuote}>
          {!account && <label>Sender wallet address<input id="sender-address" style={inputStyle} placeholder="0x…" autoComplete="off" /></label>}
          <div className="lifi-two-col">
            <label>From network<select style={selectStyle} value={fromChain} onChange={(event) => setFromChain(event.target.value)}>{chains.map((chain) => <option key={chain.id} value={chain.id}>{chain.name} ({chain.id})</option>)}</select></label>
            <label>To network<select style={selectStyle} value={toChain} onChange={(event) => setToChain(event.target.value)}>{chains.map((chain) => <option key={chain.id} value={chain.id}>{chain.name} ({chain.id})</option>)}</select></label>
          </div>
          <div className="lifi-two-col">
            <label>From token contract<input style={inputStyle} value={fromToken} onChange={(event) => setFromToken(event.target.value.trim())} placeholder="0x…" autoComplete="off" required /></label>
            <label>To token contract<input style={inputStyle} value={toToken} onChange={(event) => setToToken(event.target.value.trim())} placeholder="0x…" autoComplete="off" required /></label>
          </div>
          <div className="lifi-two-col">
            <label>Amount<input style={inputStyle} value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="e.g. 1.25" inputMode="decimal" required /></label>
            <label>From-token decimals<input id="token-decimals" style={inputStyle} defaultValue="18" type="number" min="0" max="36" /></label>
          </div>
          <label>Maximum slippage (%)<input style={inputStyle} value={String(Number(slippage) * 100)} onChange={(event) => setSlippage(String(Number(event.target.value) / 100))} type="number" min="0" max="5" step="0.1" /></label>
          <button className="primary-button" type="submit" disabled={busy || chains.length === 0}>{busy ? "Finding route…" : chains.length === 0 ? "Loading supported networks…" : "Get quote"}</button>
        </form>
        {quoteError && <p className="lifi-error" role="alert">{quoteError}</p>}
        {quote && <div className="quote-result" aria-live="polite"><h3>Indicative route</h3><p><strong>Route provider:</strong> {quote.tool ?? "LI.FI"}</p><p><strong>Estimated output (base units):</strong> {quote.estimate?.toAmount ?? "Unavailable"}</p><p><strong>Minimum output (base units):</strong> {quote.estimate?.toAmountMin ?? "Unavailable"}</p><p><strong>Estimated duration:</strong> {quote.estimate?.executionDuration ? `${Math.ceil(quote.estimate.executionDuration / 60)} min` : "Not provided"}</p>{quote.includedSteps?.length ? <p><strong>Route steps:</strong> {quote.includedSteps.map((step) => step.tool ?? step.type ?? "Step").join(" → ")}</p> : null}<p className="lifi-note">Quote is not a guaranteed execution price. Verify the token contracts, route, fees, and slippage in your wallet before any future transaction.</p></div>}
      </section>

      <section className="lifi-card" aria-labelledby="status-title">
        <h2 id="status-title">Check transfer status</h2>
        <form className="lifi-form" onSubmit={checkStatus}>
          <label>Source transaction hash<input style={inputStyle} value={txHash} onChange={(event) => setTxHash(event.target.value.trim())} placeholder="0x…" autoComplete="off" required /></label>
          <div className="lifi-two-col">
            <label>Source network<select style={selectStyle} value={statusFrom} onChange={(event) => setStatusFrom(event.target.value)}>{chains.map((chain) => <option key={chain.id} value={chain.id}>{chain.name} ({chain.id})</option>)}</select></label>
            <label>Destination network<select style={selectStyle} value={statusTo} onChange={(event) => setStatusTo(event.target.value)}>{chains.map((chain) => <option key={chain.id} value={chain.id}>{chain.name} ({chain.id})</option>)}</select></label>
          </div>
          <button className="secondary-button" type="submit">Check status</button>
        </form>
        {statusError && <p className="lifi-error" role="alert">{statusError}</p>}
        {transferStatus !== null && <pre className="status-result" aria-live="polite">{JSON.stringify(transferStatus, null, 2)}</pre>}
      </section>

      <p className="lifi-disclaimer">Never share seed phrases or private keys. LI.FI routes are third-party data; independently verify all assets, networks, and transaction details. No contract address for ISIOLO is assumed or prefilled.</p>
      <footer><span>ISIOLOCOIN NETWORK</span><span>Multichain quotes · transaction execution disabled</span></footer>
    </main>
  );
}
