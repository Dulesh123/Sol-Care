import { useCallback, useMemo, useState } from "react";
import { createNewWallet, importWallet, deriveAccounts, deriveNextAccount } from "../services/walletService.js";

/**
 * Owns the HDWallet instance and its derived accounts in memory only.
 * Nothing here ever touches localStorage/sessionStorage - refreshing the
 * page is equivalent to closing the vault.
 */
export function useWallet() {
  const [hdWallet, setHdWallet] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState(null);

  const createWallet = useCallback(() => {
    const wallet = createNewWallet();
    setHdWallet(wallet);
    setAccounts(deriveAccounts(wallet, 4));
    setActiveIndex(0);
    setError(null);
    return wallet.mnemonic;
  }, []);

  const restoreWallet = useCallback((mnemonicInput) => {
    try {
      const wallet = importWallet(mnemonicInput);
      setHdWallet(wallet);
      setAccounts(deriveAccounts(wallet, 4));
      setActiveIndex(0);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  const addAccount = useCallback(() => {
    if (!hdWallet) return;
    setAccounts((prev) => [...prev, deriveNextAccount(hdWallet, prev.length)]);
  }, [hdWallet]);

  const lockWallet = useCallback(() => {
    setHdWallet(null);
    setAccounts([]);
    setActiveIndex(0);
    setError(null);
  }, []);

  const activeAccount = useMemo(() => accounts[activeIndex] ?? null, [accounts, activeIndex]);

  return {
    isUnlocked: hdWallet !== null,
    mnemonic: hdWallet?.mnemonic ?? null,
    accounts,
    activeAccount,
    activeIndex,
    setActiveIndex,
    createWallet,
    restoreWallet,
    addAccount,
    lockWallet,
    error,
  };
}
