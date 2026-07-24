/**
 * __selftest__.js
 * ---------------------------------------------------------------------------
 * Quick manual check: derive 4 accounts from a fresh mnemonic and print
 * their base58 public keys, the same way the original reference script did.
 * Run with: npm test  (inside wallet-core/)
 * ---------------------------------------------------------------------------
 */

import { HDWallet } from "./hdWallet.js";

const wallet = HDWallet.generate();
console.log("Mnemonic:", wallet.mnemonic);
console.log("");

const accounts = wallet.deriveAccounts(4);
for (const account of accounts) {
  console.log(`${account.path}  ->  ${account.publicKey}`);
}

// Re-deriving from the same mnemonic must produce identical keys.
const rehydrated = HDWallet.fromMnemonic(wallet.mnemonic);
const check = rehydrated.deriveAccount(0);
if (check.publicKey !== accounts[0].publicKey) {
  throw new Error("Determinism check failed: re-derivation produced a different key");
}
console.log("\nDeterminism check passed: re-deriving account 0 gives the same public key.");
