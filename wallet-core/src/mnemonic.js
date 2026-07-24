/**
 * mnemonic.js
 * ---------------------------------------------------------------------------
 * Everything related to BIP-39 mnemonic phrases lives here, and nowhere else.
 * No key derivation, no RPC calls - just generating and validating the words
 * the user is going to write on a piece of paper and hide in a drawer.
 * ---------------------------------------------------------------------------
 */

import { generateMnemonic, validateMnemonic as bip39Validate, entropyToMnemonic, mnemonicToEntropy } from "bip39";

/**
 * Strength -> word count reference (BIP-39):
 *   128 bits -> 12 words
 *   160 bits -> 15 words
 *   192 bits -> 18 words
 *   224 bits -> 21 words
 *   256 bits -> 24 words
 */
export const MNEMONIC_STRENGTH = {
  WORDS_12: 128,
  WORDS_24: 256,
};

/**
 * Create a brand new mnemonic phrase.
 * @param {number} strength - entropy bits, defaults to a 12-word phrase.
 * @returns {string} space separated mnemonic words
 */
export function createMnemonic(strength = MNEMONIC_STRENGTH.WORDS_12) {
  return generateMnemonic(strength);
}

/**
 * Validate a mnemonic the user typed in (import flow).
 * @param {string} mnemonic
 * @returns {boolean}
 */
export function isValidMnemonic(mnemonic) {
  if (typeof mnemonic !== "string") return false;
  return bip39Validate(mnemonic.trim().toLowerCase());
}

/**
 * Normalize user input: trim, collapse whitespace, lowercase.
 * Wallet UIs paste mnemonics with stray spaces/newlines all the time.
 * @param {string} mnemonic
 * @returns {string}
 */
export function normalizeMnemonic(mnemonic) {
  return mnemonic.trim().toLowerCase().split(/\s+/).join(" ");
}

/**
 * Round-trip helpers, occasionally useful for backups / QR export.
 */
export function mnemonicToRawEntropy(mnemonic) {
  return mnemonicToEntropy(normalizeMnemonic(mnemonic));
}

export function rawEntropyToMnemonic(entropyHex) {
  return entropyToMnemonic(entropyHex);
}
