import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// bip39 / tweetnacl / ed25519-hd-key / @solana/web3.js all expect a Node-like
// environment (Buffer, crypto). vite-plugin-node-polyfills patches that in
// for the browser bundle so wallet-core can run entirely client-side - the
// mnemonic and private keys never have to leave the user's machine.
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: { Buffer: true, global: true, process: true },
    }),
  ],
  server: {
    port: 5173,
  },
});
