/**
 * derivationPath.js
 * ---------------------------------------------------------------------------
 * Solana's convention (shared by Phantom, Solflare, Sollet, etc.) is
 * BIP-44 coin type 501, fully hardened:
 *
 *    m / 44' / 501' / account' / 0'
 *
 * account increments per wallet the user creates from the same seed phrase.
 * Keeping this in one file means every place that needs a path (derivation,
 * account labels, import/export) agrees on the exact same string format.
 * ---------------------------------------------------------------------------
 */

const PURPOSE = 44;
const SOLANA_COIN_TYPE = 501;

/**
 * Build the standard Solana HD path for a given account index.
 * @param {number} accountIndex - 0, 1, 2, ...
 * @returns {string} e.g. "m/44'/501'/0'/0'"
 */
export function solanaDerivationPath(accountIndex = 0) {
  if (!Number.isInteger(accountIndex) || accountIndex < 0) {
    throw new Error("accountIndex must be a non-negative integer");
  }
  return `m/${PURPOSE}'/${SOLANA_COIN_TYPE}'/${accountIndex}'/0'`;
}

/**
 * Parse a path back into its account index, used when labelling
 * imported/derived accounts in the UI.
 * @param {string} path
 * @returns {number}
 */
export function accountIndexFromPath(path) {
  const match = /^m\/44'\/501'\/(\d+)'\/0'$/.exec(path);
  if (!match) throw new Error(`Not a recognized Solana derivation path: ${path}`);
  return Number(match[1]);
}
