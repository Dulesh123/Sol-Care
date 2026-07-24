/**
 * alchemyRpc.js
 * ---------------------------------------------------------------------------
 * A thin JSON-RPC 2.0 client for Alchemy's Solana endpoints. This file never
 * touches a mnemonic, seed, or private key - it only ever sees public keys
 * (as base58 strings) and already-signed, serialized transactions.
 * ---------------------------------------------------------------------------
 */

const DEFAULT_TIMEOUT_MS = 15000;

export class AlchemyRpcClient {
  /**
   * @param {string} rpcUrl - full Alchemy Solana JSON-RPC URL, e.g.
   *   "https://solana-devnet.g.alchemy.com/v2/<API_KEY>"
   */
  constructor(rpcUrl) {
    if (!rpcUrl) throw new Error("AlchemyRpcClient requires an RPC URL");
    this.rpcUrl = rpcUrl;
    this._id = 0;
  }

  /**
   * Low-level JSON-RPC 2.0 call.
   * @param {string} method
   * @param {any[]} [params]
   */
  async call(method, params = []) {
    this._id += 1;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(this.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: this._id, method, params }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Alchemy RPC HTTP ${response.status}: ${response.statusText}`);
      }

      const payload = await response.json();
      if (payload.error) {
        throw new Error(`Alchemy RPC error ${payload.error.code}: ${payload.error.message}`);
      }
      return payload.result;
    } finally {
      clearTimeout(timeout);
    }
  }

  /** Lamports balance for a base58 public key. */
  async getBalance(publicKeyBase58) {
    const result = await this.call("getBalance", [publicKeyBase58, { commitment: "confirmed" }]);
    return result?.value ?? 0;
  }

  /** Full account info (owner, data, lamports, executable, rentEpoch). */
  async getAccountInfo(publicKeyBase58) {
    const result = await this.call("getAccountInfo", [
      publicKeyBase58,
      { encoding: "base64", commitment: "confirmed" },
    ]);
    return result?.value ?? null;
  }

  /** Recent blockhash, needed to build a new transaction. */
  async getLatestBlockhash() {
    const result = await this.call("getLatestBlockhash", [{ commitment: "confirmed" }]);
    return result?.value; // { blockhash, lastValidBlockHeight }
  }

  /** Submit an already-signed, base64-serialized transaction. */
  async sendRawTransaction(base64Transaction) {
    return this.call("sendTransaction", [
      base64Transaction,
      { encoding: "base64", preflightCommitment: "confirmed", skipPreflight: false },
    ]);
  }

  /** Poll for a transaction's confirmation status. */
  async getSignatureStatus(signature) {
    const result = await this.call("getSignatureStatuses", [[signature], { searchTransactionHistory: true }]);
    return result?.value?.[0] ?? null;
  }

  /** Recent transaction signatures for an address (history view). */
  async getSignaturesForAddress(publicKeyBase58, limit = 15) {
    return this.call("getSignaturesForAddress", [publicKeyBase58, { limit }]);
  }

  /** Full parsed transaction detail for the history view. */
  async getTransaction(signature) {
    return this.call("getTransaction", [
      signature,
      { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
    ]);
  }

  /** Devnet/testnet only: request an airdrop of lamports for testing. */
  async requestAirdrop(publicKeyBase58, lamports) {
    return this.call("requestAirdrop", [publicKeyBase58, lamports]);
  }
}

/**
 * Build the right Alchemy URL for a given cluster + API key without
 * scattering string templates across the app.
 * @param {"mainnet"|"devnet"} cluster
 * @param {string} apiKey
 */
export function alchemySolanaUrl(cluster, apiKey) {
  const subdomain = cluster === "mainnet" ? "solana-mainnet" : "solana-devnet";
  return `https://${subdomain}.g.alchemy.com/v2/${apiKey}`;
}
