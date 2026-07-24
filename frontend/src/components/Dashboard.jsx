import { useState } from "react";
import AccountDial from "./AccountDial.jsx";
import AccountCard from "./AccountCard.jsx";
import AlchemySettings from "./AlchemySettings.jsx";
import SendPanel from "./SendPanel.jsx";
import ActivityPanel from "./ActivityPanel.jsx";

export default function Dashboard({ wallet, alchemy, onLock }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { accounts, activeIndex, activeAccount, setActiveIndex, addAccount } = wallet;
  const { apiKey, setApiKey, cluster, setCluster, isConfigured, balances, isLoading, refreshBalances } = alchemy;

  const handleRefreshActive = () => {
    if (activeAccount) refreshBalances([activeAccount.publicKey]);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Vault unlocked · {cluster}</span>
          <h1 className="dashboard-title">Wallet</h1>
        </div>
        <button className="btn" onClick={onLock}>
          Lock wallet
        </button>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-left">
          <AccountDial accounts={accounts} activeIndex={activeIndex} onSelect={setActiveIndex} />
          <button className="btn add-account-btn" onClick={addAccount}>
            + Derive next account
          </button>
        </div>

        <div className="dashboard-right">
          <AlchemySettings apiKey={apiKey} setApiKey={setApiKey} cluster={cluster} setCluster={setCluster} />

          {activeAccount && (
            <>
              <AccountCard
                account={activeAccount}
                balanceEntry={balances[activeAccount.publicKey]}
                isLoading={isLoading}
                onRefresh={handleRefreshActive}
                isConfigured={isConfigured}
              />
              <div className="dashboard-columns">
                <SendPanel
                  account={activeAccount}
                  client={alchemy.client}
                  isConfigured={isConfigured}
                  cluster={cluster}
                  onSent={handleRefreshActive}
                />
                <ActivityPanel
                  account={activeAccount}
                  client={alchemy.client}
                  isConfigured={isConfigured}
                  cluster={cluster}
                  refreshKey={refreshKey}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
