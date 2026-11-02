"use client";

import { useEffect, useState } from "react";

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
const POLYGON_NETWORK = {
  chainId: POLYGON_CHAIN_ID,
  chainName: "Polygon",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  rpcUrls: [process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "https://polygon-rpc.com"],
  blockExplorerUrls: ["https://polygonscan.com"],
};

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [status, setStatus] = useState("Wallet not connected.");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) {
      setStatus("No browser wallet detected. Install a compatible wallet to continue.");
      return;
    }

    const syncWallet = async () => {
      try {
        const accounts = (await window.ethereum.request({ method: "eth_accounts" })) as string[];
        const currentChain = (await window.ethereum.request({ method: "eth_chainId" })) as string;
        setAccount(accounts[0] ?? null);
        setChainId(currentChain);
        setStatus(accounts[0] ? "Wallet connected and ready." : "Wallet not connected.");
      } catch {
        setStatus("Wallet detected but unable to read account state.");
      }
    };

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts[0] ?? null);
      setStatus(accounts[0] ? "Wallet connected and ready." : "Wallet disconnected.");
    };

    const handleChainChanged = (nextChainId: string) => {
      setChainId(nextChainId);
      setStatus("Network updated.");
    };

    syncWallet();
    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  async function connectWallet() {
    if (typeof window === "undefined" || !window.ethereum) {
      setStatus("No browser wallet detected. Install MetaMask or another EVM wallet.");
      return;
    }

    setBusy(true);
    setStatus("Requesting wallet access...");

    try {
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      const currentChain = (await window.ethereum.request({ method: "eth_chainId" })) as string;
      setAccount(accounts[0] ?? null);
      setChainId(currentChain);
      setStatus(accounts[0] ? "Wallet connected and ready." : "Wallet access was not granted.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Wallet connection was rejected or failed.");
    } finally {
      setBusy(false);
    }
  }

  async function switchToPolygon() {
    if (typeof window === "undefined" || !window.ethereum) {
      setStatus("No browser wallet detected.");
      return;
    }

    setBusy(true);
    setStatus("Switching network to Polygon...");

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: POLYGON_CHAIN_ID }],
      });
      const currentChain = (await window.ethereum.request({ method: "eth_chainId" })) as string;
      setChainId(currentChain);
      setStatus("Polygon network selected.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Switch failed.";
      if (message.toLowerCase().includes("wallet_addethereumchain") || message.toLowerCase().includes("chain not found")) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [POLYGON_NETWORK],
          });
          const currentChain = (await window.ethereum.request({ method: "eth_chainId" })) as string;
          setChainId(currentChain);
          setStatus("Polygon network was added and selected.");
        } catch (addError) {
          setStatus(addError instanceof Error ? addError.message : "Unable to add Polygon network.");
        }
      } else {
        setStatus(message);
      }
    } finally {
      setBusy(false);
    }
  }

  const isPolygon = chainId?.toLowerCase() === POLYGON_CHAIN_ID.toLowerCase();
  const shortAccount = account ? `${account.slice(0, 6)}…${account.slice(-4)}` : null;

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Isiolocoin home">
          <span className="brand-mark">I</span>
          <span>
            ISIOLO<span className="brand-light">COIN</span>
          </span>
        </a>

        <div className="topbar-actions">
          <span className="network-pill">
            <span className="status-dot" /> Polygon-ready
          </span>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="eyebrow">
          <span /> Production-grade ecosystem foundation
        </div>

        <h1>
          Build the next<br />
          <span>Isiolocoin layer.</span>
        </h1>

        <p className="intro">
          A user-first web experience for wallet access, network switching, and future token and DeFi integrations.
          This foundation is built for trust, interoperability, and clean deployment to production.
        </p>

        <div className="actions">
          <button className="primary-button" onClick={connectWallet} disabled={busy}>
            {busy ? "Please wait…" : shortAccount ? `Connected ${shortAccount}` : "Connect wallet"}
          </button>

          {account && !isPolygon && (
            <button className="secondary-button" onClick={switchToPolygon} disabled={busy}>
              Switch to Polygon
            </button>
          )}
        </div>

        {status && (
          <p className="status-message" role="status">
            {status}
          </p>
        )}

        {account && (
          <div className="wallet-card" aria-live="polite">
            <div>
              <span className="card-label">Connected account</span>
              <strong>{account}</strong>
            </div>
            <div>
              <span className="card-label">Active network</span>
              <strong>{isPolygon ? "Polygon PoS" : chainId ?? "Unknown"}</strong>
            </div>
          </div>
        )}

        <p className="disclaimer">
          Read-only wallet connectivity is enabled here. Private keys and recovery phrases are never requested.
        </p>
      </section>

      <section className="features" aria-label="Core product pillars">
        <article>
          <span className="feature-index">01</span>
          <h2>Wallet-first access</h2>
          <p>Secure browser wallet connectivity for account status, network state, and future token actions.</p>
        </article>

        <article>
          <span className="feature-index">02</span>
          <h2>On-chain readiness</h2>
          <p>Polygon network configuration is included to support fast deployment and low-cost user transactions.</p>
        </article>

        <article>
          <span className="feature-index">03</span>
          <h2>Production discipline</h2>
          <p>Clear environment configuration, explicit network handling, and no hidden private-key or custodial logic.</p>
        </article>
      </section>

      <section className="stack" aria-label="Production roadmap">
        <div className="stack-header">
          <span className="mini-label">Production path</span>
          <h3>What comes next</h3>
        </div>

        <div className="roadmap-grid">
          <div>
            <strong>1. Token integration</strong>
            <p>Verify the official contract address, ABI, decimals, and market metadata.</p>
          </div>
          <div>
            <strong>2. Balance + portfolio</strong>
            <p>Display wallet holdings, transaction history, and staking-read data from Polygon.</p>
          </div>
          <div>
            <strong>3. On-ramp & swaps</strong>
            <p>Add user-safe fiat and token flows behind explicit consent and audit review.</p>
          </div>
          <div>
            <strong>4. Governance & trust</strong>
            <p>Introduce admin controls, policy docs, and security review checkpoints before launch.</p>
          </div>
        </div>
      </section>

      <footer>
        <span>ISIOLOCOIN NETWORK</span>
        <span>Foundation build · ready for production handoff</span>
      </footer>
    </main>
  );
}
