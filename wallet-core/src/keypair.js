/**
 * keypair.js
 * ---------------------------------------------------------------------------
 * The one file that actually produces a Solana keypair from a seed + path.
 * This mirrors the reference logic exactly:
 *
 *   const derivedSeed = derivePath(path, seedHex).key;
 *   const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
 *   Keypair.fromSecretKey(secret)
 *
 * Nothing here knows about mnemonics, React, or the network - it only ever
 * sees a seed (hex) and a path, and hands back a Solana Keypair.
 * ---------------------------------------------------------------------------
 */

import nacl from "tweetnacl";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";

/**
 * Derive a single Solana Keypair for one HD path.
 * @param {string} seedHex - hex-encoded BIP-39 seed (see seed.js)
 * @param {string} path - e.g. "m/44'/501'/0'/0'" (see derivationPath.js)
 * @returns {Keypair} @solana/web3.js Keypair
 */
export function deriveKeypairFromSeed(seedHex, path) {
  const { key: derivedSeed } = derivePath(path, seedHex);
  const { secretKey } = nacl.sign.keyPair.fromSeed(derivedSeed);
  return Keypair.fromSecretKey(secretKey);
}

/**
 * Convenience: derive straight from a raw secret key byte array
 * (e.g. re-hydrating an account that was already derived once and
 * cached in memory), without touching nacl or ed25519-hd-key again.
 * @param {Uint8Array|number[]} secretKey - 64-byte Solana secret key
 * @returns {Keypair}
 */
export function keypairFromSecretKey(secretKey) {
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

/**
 * Serialize a Keypair's secret key so it can be safely handed to
 * something like a redux store / React state as plain JSON-friendly data.
 * @param {Keypair} keypair
 * @returns {number[]}
 */
export function secretKeyToArray(keypair) {
  return Array.from(keypair.secretKey);
}
