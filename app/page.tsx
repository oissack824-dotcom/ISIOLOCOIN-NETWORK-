"use client";

import { useState } from "react";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const POLYGON_CHAIN_ID = "0x89";

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus("No browser wallet detected. Install a compatible wallet and try again.");
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      const currentChain = (await window.ethereum.request({ method: "eth_chainId" })) as string;
      setAccount(accounts[0] ?? null);
      setChainId(currentChain);
      setStatus(accounts.length ? "Wallet connected. No transaction has been sent." : "No account was provided.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Wallet connection was cancelled or failed.");
    } finally {
      setBusy(false);
    }
  }

  async function switchToPolygon() {
    if (!window.ethereum) return;
    setBusy(true);
    setStatus("");
    try {
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: POLYGON_CHAIN_ID }] });
      const currentChain = (await window.ethereum.request({ method: "eth_chainId" })) as string;
      setChainId(currentChain);
      setStatus("Wallet is now connected to Polygon PoS.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not switch network.");
    } finally {
      setBusy(false);
    }
  }

  const onAccountsChanged = (...args: unknown[]) => setAccount((args[0] as string[] | undefined)?.[0] ?? null);
  const onChainChanged = (...args: unknown[]) => setChainId(args[0] as string);

  // Keep the wallet display in sync with account/network changes while connected.
  if (typeof window !== "undefined" && window.ethereum) {
    window.ethereum.removeListener?.("accountsChanged", onAccountsChanged);
    window.ethereum.removeListener?.("chainChanged", onChainChanged);
    window.ethereum.on?.("accountsChanged", onAccountsChanged);
    window.ethereum.on?.("chainChanged", onChainChanged);
  }

  const isPolygon = chainId?.toLowerCase() === POLYGON_CHAIN_ID;
  const shortAccount = account ? `${account.slice(0, 6)}…${account.slice(-4)}` : null;

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Isiolocoin home">
          <span className="brand-mark">I</span>
          <span>ISIOLO<span className="brand-light">COIN</span></span>
        </a>
        <span className="network-pill"><span className="status-dot" /> Polygon ecosystem</span>
      </header>

      <section className="hero" id="home">
        <div className="eyebrow"><span /> A user-first ecosystem</div>
        <h1>Your gateway to<br /><span>what comes next.</span></h1>
        <p className="intro">Explore the Isiolocoin ecosystem with your wallet in control. Connect to view your account and network; this starter never requests a transaction.</p>
        <div className="actions">
          <button className="primary-button" onClick={connectWallet} disabled={busy}>
            {busy ? "Please wait…" : shortAccount ? `Connected ${shortAccount}` : "Connect wallet"}
          </button>
          {account && !isPolygon && <button className="secondary-button" onClick={switchToPolygon} disabled={busy}>Switch to Polygon</button>}
        </div>
        {status && <p className="status-message" role="status">{status}</p>}
        {account && <div className="wallet-card">
          <div><span className="card-label">CONNECTED ACCOUNT</span><strong>{account}</strong></div>
          <div><span className="card-label">NETWORK</span><strong>{isPolygon ? "Polygon PoS" : `Chain ${chainId ?? "unknown"}`}</strong></div>
        </div>}
        <p className="disclaimer">Wallet connection is read-only here. Never share your recovery phrase or private key.</p>
      </section>

      <section className="features" aria-label="Foundation principles">
        <article><span className="feature-index">01</span><h2>You stay in control</h2><p>Your wallet remains yours. This starter does not custody keys or initiate asset transfers.</p></article>
        <article><span className="feature-index">02</span><h2>Built to interoperate</h2><p>Designed for future, explicitly configured connections to audited contracts and open APIs.</p></article>
        <article><span className="feature-index">03</span><h2>Privacy by design</h2><p>No analytics, tracking, AI processing, or personal-data collection is enabled by default.</p></article>
      </section>
      <footer><span>ISIOLOCOIN NETWORK</span><span>Foundation build · No token contract configured</span></footer>
    </main>
  );
}
