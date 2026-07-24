import { useState } from "react";
import { useWallet } from "./hooks/useWallet.js";
import { useAlchemy } from "./hooks/useAlchemy.js";
import WelcomeScreen from "./components/WelcomeScreen.jsx";
import CreateWalletFlow from "./components/CreateWalletFlow.jsx";
import ImportWalletFlow from "./components/ImportWalletFlow.jsx";
import Dashboard from "./components/Dashboard.jsx";

const SCREEN = { WELCOME: "welcome", CREATE: "create", IMPORT: "import", DASHBOARD: "dashboard" };

export default function App() {
  const wallet = useWallet();
  const alchemy = useAlchemy();
  const [screen, setScreen] = useState(SCREEN.WELCOME);
  const [pendingMnemonic, setPendingMnemonic] = useState(null);

  const handleCreate = () => {
    const mnemonic = wallet.createWallet();
    setPendingMnemonic(mnemonic);
    setScreen(SCREEN.CREATE);
  };

  const handleImportSubmit = (mnemonicInput) => {
    if (wallet.restoreWallet(mnemonicInput)) setScreen(SCREEN.DASHBOARD);
  };

  const handleLock = () => {
    wallet.lockWallet();
    setPendingMnemonic(null);
    setScreen(SCREEN.WELCOME);
  };

  return (
    <main className="app-shell">
      {screen === SCREEN.WELCOME && (
        <WelcomeScreen onChooseCreate={handleCreate} onChooseImport={() => setScreen(SCREEN.IMPORT)} />
      )}

      {screen === SCREEN.CREATE && pendingMnemonic && (
        <CreateWalletFlow
          mnemonic={pendingMnemonic}
          onConfirmed={() => setScreen(SCREEN.DASHBOARD)}
          onBack={handleLock}
        />
      )}

      {screen === SCREEN.IMPORT && (
        <ImportWalletFlow onSubmit={handleImportSubmit} onBack={() => setScreen(SCREEN.WELCOME)} error={wallet.error} />
      )}

      {screen === SCREEN.DASHBOARD && wallet.isUnlocked && (
        <Dashboard wallet={wallet} alchemy={alchemy} onLock={handleLock} />
      )}
    </main>
  );
}
