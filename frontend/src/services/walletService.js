/**
 * walletService.js
 * ---------------------------------------------------------------------------
 * The single seam between the React app and wallet-core. Every component that
 * needs a mnemonic, a keypair, or a signature goes through here - never
 * imports wallet-core directly. That keeps the key-handling surface area
 * small and auditable in one place.
 *
 * Security note: everything here lives in memory (React state) only. Nothing
 * is written to localStorage/sessionStorage/cookies. Closing or refreshing
 * the tab discards the mnemonic and all derived keys, by design.
 * ---------------------------------------------------------------------------
 */

import { HDWallet, MNEMONIC_STRENGTH, isValidMnemonic, normalizeMnemonic } from "wallet-core";
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

/** Create a brand new 12-word wallet. */
export function createNewWallet() {
  return HDWallet.generate(MNEMONIC_STRENGTH.WORDS_12);
}

/** Import an existing wallet from a typed-in mnemonic. Throws if invalid. */
export function importWallet(mnemonicInput) {
  const normalized = normalizeMnemonic(mnemonicInput);
  if (!isValidMnemonic(normalized)) {
    throw new Error("That recovery phrase doesn't look valid. Check the word order and spelling.");
  }
  return HDWallet.fromMnemonic(normalized);
}

/** Re-export so components can validate as-you-type without extra imports. */
export { isValidMnemonic, normalizeMnemonic };

/**
 * Derive the first `count` accounts as plain, UI-friendly objects.
 * The Keypair (and therefore the secret key) stays attached but callers
 * should treat `.keypair` as sensitive and only read `.secretKeyBase58Preview`
 * style helpers when the user has explicitly asked to reveal it.
 */
export function deriveAccounts(hdWallet, count = 4) {
  return hdWallet.deriveAccounts(count).map((account) => ({
    index: account.index,
    path: account.path,
    publicKey: account.publicKey,
    keypair: account.keypair,
  }));
}

/** Derive one more account past whatever has already been created. */
export function deriveNextAccount(hdWallet, existingCount) {
  const account = hdWallet.deriveAccount(existingCount);
  return { index: account.index, path: account.path, publicKey: account.publicKey, keypair: account.keypair };
}

/**
 * Reveal a secret key as a base58 string, only called from an explicit
 * "show private key" user action - never logged, never sent anywhere.
 */
export function secretKeyToBase58(keypair) {
  return bs58Encode(keypair.secretKey);
}

// Minimal bs58 encode so we don't need an extra top-level dependency just
// for this one, rarely-used "reveal" action.
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function bs58Encode(bytes) {
  let digits = [0];
  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  for (let k = 0; k < bytes.length - 1 && bytes[k] === 0; k++) {
    digits.push(0);
  }
  return digits
    .reverse()
    .map((d) => BASE58_ALPHABET[d])
    .join("");
}

/**
 * Build, sign, and serialize a SOL transfer - signing happens locally with
 * the sender's Keypair and never leaves the browser. The caller is
 * responsible for submitting the returned base64 string via alchemyService.
 */
export function buildSignedTransfer({ fromKeypair, toAddress, lamports, blockhash }) {
  const toPubkey = new PublicKey(toAddress); // throws on malformed addresses
  const tx = new Transaction({
    recentBlockhash: blockhash,
    feePayer: fromKeypair.publicKey,
  }).add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey,
      lamports,
    })
  );
  tx.sign(fromKeypair);
  return tx.serialize().toString("base64");
}

export function solToLamports(sol) {
  return Math.round(Number(sol) * LAMPORTS_PER_SOL);
}

export function lamportsToSol(lamports) {
  return lamports / LAMPORTS_PER_SOL;
}
