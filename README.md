# Solana HD Wallet

A web-based, non-custodial Solana wallet. One recovery phrase derives an unlimited
number of accounts (`m/44'/501'/i'/0'`), exactly like the reference script this was
built from — the derivation logic just lives in its own package instead of a
throwaway script, and gets a React UI plus live balances/sends over Alchemy.

```
solana-hd-wallet/
├── wallet-core/              All HD wallet + RPC logic, isolated from the UI
│   ├── src/
│   │   ├── mnemonic.js       Generate / validate BIP-39 phrases
│   │   ├── seed.js           Mnemonic -> 512-bit seed
│   │   ├── derivationPath.js Solana's m/44'/501'/i'/0' path builder
│   │   ├── keypair.js        seed + path -> Solana Keypair (nacl + ed25519-hd-key)
│   │   ├── hdWallet.js       HDWallet class composing the above
│   │   ├── alchemyRpc.js     JSON-RPC client for Alchemy's Solana endpoint
│   │   ├── index.js          Public exports
│   │   └── __selftest__.js   `npm test` — derives 4 accounts and prints them
│   └── package.json
│
├── frontend/                 React (Vite) app — the only consumer of wallet-core
│   ├── src/
│   │   ├── components/       WelcomeScreen, Create/ImportWalletFlow, AccountDial,
│   │   │                     AccountCard, SendPanel, ActivityPanel, AlchemySettings
│   │   ├── hooks/             useWallet.js, useAlchemy.js
│   │   ├── services/          walletService.js (wraps wallet-core), alchemyService.js
│   │   ├── styles/index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── .env.example
│
└── package.json               npm workspaces root (links the two folders)
```

## Setup

```bash
npm install                 # installs both workspaces
cp frontend/.env.example frontend/.env
```

Get a free Alchemy API key at [dashboard.alchemy.com](https://dashboard.alchemy.com)
(create an app, choose Solana as the chain, Devnet to start), then either:

- put it in `frontend/.env` as `VITE_ALCHEMY_API_KEY=...`, or
- paste it directly into the "Alchemy connection" card in the running app

## Run

```bash
npm run dev                 # starts the Vite dev server on http://localhost:5173
```

## Build

```bash
npm run build                # production build in frontend/dist
```

## Test the derivation logic on its own

```bash
npm run test:core            # runs wallet-core/src/__selftest__.js
```

This derives 4 accounts from a fresh mnemonic and prints their base58 public keys —
the same output as the original script, just sourced from the isolated modules.

## How the pieces fit together

1. **Create/Import** — `CreateWalletFlow`/`ImportWalletFlow` call `useWallet()`, which
   calls `walletService.js`, which calls `wallet-core`'s `HDWallet.generate()` /
   `HDWallet.fromMnemonic()`. The mnemonic and every derived `Keypair` live only in
   React state — nothing is written to `localStorage`, `sessionStorage`, or any
   server. Refreshing the tab clears everything (by design).
2. **Accounts** — `HDWallet.deriveAccounts(n)` walks `m/44'/501'/0'/0'`,
   `m/44'/501'/1'/0'`, ... using `derivationPath.js` + `keypair.js`, identical to the
   loop in the original snippet. `AccountDial` is the UI for switching between them.
3. **Balances / history** — `useAlchemy()` builds an `AlchemyRpcClient` (from
   `wallet-core/src/alchemyRpc.js`) pointed at your API key + cluster, and
   `alchemyService.js` wraps it with `fetchBalances`, `fetchRecentActivity`, and
   `waitForConfirmation`.
4. **Sending** — `SendPanel` builds a `SystemProgram.transfer` instruction, signs it
   locally with the sender's `Keypair` (`walletService.buildSignedTransfer`), and
   submits the already-signed, base64-serialized transaction via
   `AlchemyRpcClient.sendRawTransaction`. The private key is never sent to Alchemy or
   anywhere else — only the finished, signed transaction is.

## Security notes

- This is a learning/demo-grade wallet, not an audited product. Treat it accordingly
  before putting real mainnet funds anywhere near it.
- The recovery phrase and private keys exist only in memory for the lifetime of the
  tab. There is no "remember me" — that's intentional.
- The "Reveal private key" action is intentionally a deliberate, separate click, and
  the key is never logged or sent over the network.
- Prefer Devnet while testing. Switch to Mainnet only once you're comfortable with the
  code.
