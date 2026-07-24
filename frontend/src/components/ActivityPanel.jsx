import { useEffect, useState } from "react";
import { fetchRecentActivity } from "../services/alchemyService.js";

export default function ActivityPanel({ account, client, isConfigured, cluster, refreshKey }) {
  const [signatures, setSignatures] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isConfigured || !account) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchRecentActivity(client, account.publicKey)
      .then((result) => !cancelled && setSignatures(result))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [client, account, isConfigured, refreshKey]);

  return (
    <div className="card">
      <span className="eyebrow">Recent activity</span>
      <h3>Signatures</h3>

      {!isConfigured && <p className="settings-hint">Add an Alchemy API key above to load history.</p>}
      {isConfigured && isLoading && <p className="settings-hint">Loading…</p>}
      {isConfigured && error && <p className="error-text">{error}</p>}
      {isConfigured && !isLoading && !error && signatures.length === 0 && (
        <p className="settings-hint">No transactions found for this account yet.</p>
      )}

      <ul className="activity-list">
        {signatures.map((entry) => (
          <li key={entry.signature}>
            <a
              className="mono"
              href={`https://explorer.solana.com/tx/${entry.signature}${cluster === "devnet" ? "?cluster=devnet" : ""}`}
              target="_blank"
              rel="noreferrer"
            >
              {entry.signature.slice(0, 12)}…{entry.signature.slice(-8)}
            </a>
            <span className={entry.err ? "activity-status activity-failed" : "activity-status activity-ok"}>
              {entry.err ? "Failed" : "Success"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
