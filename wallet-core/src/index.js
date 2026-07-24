/**
 * index.js
 * ---------------------------------------------------------------------------
 * Public surface of wallet-core. The frontend imports only from here, never
 * from the individual files directly, so internal refactors don't ripple out.
 * ---------------------------------------------------------------------------
 */

export { createMnemonic, isValidMnemonic, normalizeMnemonic, MNEMONIC_STRENGTH } from "./mnemonic.js";
export { seedFromMnemonic, seedHexFromMnemonic } from "./seed.js";
export { solanaDerivationPath, accountIndexFromPath } from "./derivationPath.js";
export { deriveKeypairFromSeed, keypairFromSecretKey, secretKeyToArray } from "./keypair.js";
export { HDWallet } from "./hdWallet.js";
export { AlchemyRpcClient, alchemySolanaUrl } from "./alchemyRpc.js";
