import { useCallback, useMemo, useState } from "react";
import { createAlchemyClient, fetchBalances } from "../services/alchemyService.js";

const ENV_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY || "";
const ENV_CLUSTER = import.meta.env.VITE_SOLANA_CLUSTER || "devnet";

/**
 * Owns the Alchemy connection settings (cluster + API key) and balance
 * lookups for whatever addresses the caller passes in.
 */
export function useAlchemy() {
  const [apiKey, setApiKey] = useState(ENV_API_KEY);
  const [cluster, setCluster] = useState(ENV_CLUSTER);
  const [balances, setBalances] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState(null);

  const client = useMemo(() => (apiKey ? createAlchemyClient(cluster, apiKey) : null), [apiKey, cluster]);

  const refreshBalances = useCallback(
    async (addresses) => {
      if (!client || addresses.length === 0) return;
      setIsLoading(true);
      setLastError(null);
      try {
        const result = await fetchBalances(client, addresses);
        setBalances((prev) => ({ ...prev, ...result }));
      } catch (err) {
        setLastError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  return {
    apiKey,
    setApiKey,
    cluster,
    setCluster,
    client,
    isConfigured: Boolean(apiKey),
    balances,
    isLoading,
    lastError,
    refreshBalances,
  };
}
