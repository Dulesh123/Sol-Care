import { useState } from "react";
import { secretKeyToBase58, lamportsToSol } from "../services/walletService.js";

export default function AccountCard({ account, balanceEntry, isLoading, onRefresh, isConfigured }) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(account.publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const sol = balanceEntry?.lamports != null ? lamportsToSol(balanceEntry.lamports) : null;

  return (
    <div className="card account-card">
      <div className="account-card-header">
        <div>
          <span className="eyebrow">{account.path}</span>
          <p className="mono account-address">{account.publicKey}</p>
        </div>
        <button className="btn btn-icon" onClick={handleCopy} title="Copy address">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="balance-row">
        <div>
          <span className="eyebrow">Balance</span>
          <p className="balance-amount">
            {!isConfigured ? "Add an API key to view" : sol != null ? `${sol.toFixed(4)} SOL` : balanceEntry?.error ? "Unavailable" : "—"}
          </p>
        </div>
        <button className="btn" onClick={onRefresh} disabled={!isConfigured || isLoading}>
          {isLoading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="reveal-key-block">
        <button className="btn btn-danger" onClick={() => setShowKey((s) => !s)}>
          {showKey ? "Hide private key" : "Reveal private key"}
        </button>
        {showKey && (
          <div className="private-key-box">
            <p className="warning-text">
              Never share this or paste it into another website. Anyone with this key controls the funds in this
              account.
            </p>
            <p className="mono private-key-value">{secretKeyToBase58(account.keypair)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
