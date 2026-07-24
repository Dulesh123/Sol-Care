export default function AlchemySettings({ apiKey, setApiKey, cluster, setCluster }) {
  return (
    <div className="card settings-card">
      <span className="eyebrow">Alchemy connection</span>
      <div className="settings-row">
        <label>
          Cluster
          <select value={cluster} onChange={(e) => setCluster(e.target.value)}>
            <option value="devnet">Devnet</option>
            <option value="mainnet">Mainnet</option>
          </select>
        </label>
        <label className="settings-key">
          API key
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste your Alchemy Solana API key"
          />
        </label>
      </div>
      <p className="settings-hint">
        Get a free key from an Alchemy app at{" "}
        <a href="https://dashboard.alchemy.com" target="_blank" rel="noreferrer">
          dashboard.alchemy.com
        </a>
        , then select Solana as the network. The key only ever reads/broadcasts to the RPC endpoint - it can&apos;t
        move your funds by itself.
      </p>
    </div>
  );
}
