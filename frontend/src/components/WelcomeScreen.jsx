export default function WelcomeScreen({ onChooseCreate, onChooseImport }) {
  return (
    <div className="welcome">
      <span className="eyebrow">Solana &middot; HD Wallet</span>
      <h1 className="welcome-title">
        One phrase.
        <br />
        Every account.
      </h1>
      <p className="welcome-copy">
        This wallet derives every account from a single recovery phrase, the same way a hardware wallet
        does - client-side, following the <span className="mono">m/44&apos;/501&apos;/i&apos;/0&apos;</span>{" "}
        path. Nothing is sent anywhere until you sign and submit a transaction.
      </p>
      <div className="welcome-actions">
        <button className="btn btn-primary" onClick={onChooseCreate}>
          Create a new wallet
        </button>
        <button className="btn" onClick={onChooseImport}>
          Import with recovery phrase
        </button>
      </div>
    </div>
  );
}
