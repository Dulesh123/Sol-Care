/**
 * alchemyService.js
 * ---------------------------------------------------------------------------
 * App-level wrapper around wallet-core's AlchemyRpcClient. Handles nothing
 * cryptographic - only network I/O against Alchemy's Solana JSON-RPC.
 * ---------------------------------------------------------------------------
 */

import { AlchemyRpcClient, alchemySolanaUrl } from "wallet-core";

export function createAlchemyClient(cluster, apiKey) {
  return new AlchemyRpcClient(alchemySolanaUrl(cluster, apiKey));
}

/** Fetch balances for several addresses in parallel. Returns { [address]: lamports }. */
export async function fetchBalances(client, addresses) {
  const entries = await Promise.all(
    addresses.map(async (address) => {
      try {
        const lamports = await client.getBalance(address);
        return [address, { lamports, error: null }];
      } catch (err) {
        return [address, { lamports: null, error: err.message }];
      }
    })
  );
  return Object.fromEntries(entries);
}

/** Poll getSignatureStatuses until confirmed/finalized or the timeout elapses. */
export async function waitForConfirmation(client, signature, { timeoutMs = 30000, intervalMs = 1500 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const status = await client.getSignatureStatus(signature);
    if (status?.err) throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
    if (status?.confirmationStatus === "confirmed" || status?.confirmationStatus === "finalized") {
      return status;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error("Timed out waiting for confirmation. Check the signature on an explorer.");
}

/** Recent activity for the history panel, newest first. */
export async function fetchRecentActivity(client, address, limit = 8) {
  const signatures = await client.getSignaturesForAddress(address, limit);
  return signatures ?? [];
}
