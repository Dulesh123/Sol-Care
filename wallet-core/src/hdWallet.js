/**
 * hdWallet.js
 * ---------------------------------------------------------------------------
 * The orchestrator. Composes mnemonic.js + seed.js + derivationPath.js +
 * keypair.js into a small, dependency-free HDWallet class that the frontend
 * can call without needing to know about ed25519-hd-key or tweetnacl at all.
 * ---------------------------------------------------------------------------
 */

import { createMnemonic, isValidMnemonic, normalizeMnemonic } from "./mnemonic.js";
import { seedHexFromMnemonic } from "./seed.js";
import { solanaDerivationPath } from "./derivationPath.js";
import { deriveKeypairFromSeed } from "./keypair.js";

export class HDWallet {
  /**
   * @param {string} mnemonic - a validated BIP-39 mnemonic
   * @param {string} [passphrase] - optional BIP-39 passphrase ("25th word")
   */
  constructor(mnemonic, passphrase = "") {
    const normalized = normalizeMnemonic(mnemonic);
    if (!isValidMnemonic(normalized)) {
      throw new Error("Invalid mnemonic phrase");
    }
    this.mnemonic = normalized;
    this._seedHex = seedHexFromMnemonic(normalized, passphrase);
  }

  /** Create a brand-new wallet with a freshly generated mnemonic. */
  static generate(strength) {
    return new HDWallet(createMnemonic(strength));
  }

  /** Rehydrate a wallet from a mnemonic the user typed in. */
  static fromMnemonic(mnemonic, passphrase = "") {
    return new HDWallet(mnemonic, passphrase);
  }

  /**
   * Derive a single account by index.
   * @param {number} accountIndex
   * @returns {{ index: number, path: string, publicKey: string, keypair: import("@solana/web3.js").Keypair }}
   */
  deriveAccount(accountIndex = 0) {
    const path = solanaDerivationPath(accountIndex);
    const keypair = deriveKeypairFromSeed(this._seedHex, path);
    return {
      index: accountIndex,
      path,
      publicKey: keypair.publicKey.toBase58(),
      keypair,
    };
  }

  /**
   * Derive the first N accounts in one call, exactly like the loop
   * in the reference script.
   * @param {number} count
   * @returns {Array<ReturnType<HDWallet['deriveAccount']>>}
   */
  deriveAccounts(count = 4) {
    const accounts = [];
    for (let i = 0; i < count; i++) {
      accounts.push(this.deriveAccount(i));
    }
    return accounts;
  }
}
