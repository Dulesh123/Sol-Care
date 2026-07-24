/**
 * seed.js
 * ---------------------------------------------------------------------------
 * Turns a BIP-39 mnemonic into the 512-bit seed used for HD derivation.
 * This is the only file that touches mnemonicToSeedSync.
 * ---------------------------------------------------------------------------
 */

import { mnemonicToSeedSync } from "bip39";
import { normalizeMnemonic } from "./mnemonic.js";

/**
 * Derive the binary seed buffer for a mnemonic (optionally with a passphrase,
 * i.e. the BIP-39 "25th word").
 * @param {string} mnemonic
 * @param {string} [passphrase]
 * @returns {Buffer}
 */
export function seedFromMnemonic(mnemonic, passphrase = "") {
  return mnemonicToSeedSync(normalizeMnemonic(mnemonic), passphrase);
}

/**
 * Same as above but returned as a hex string, which is what
 * ed25519-hd-key's derivePath() expects.
 * @param {string} mnemonic
 * @param {string} [passphrase]
 * @returns {string}
 */
export function seedHexFromMnemonic(mnemonic, passphrase = "") {
  return seedFromMnemonic(mnemonic, passphrase).toString("hex");
}
