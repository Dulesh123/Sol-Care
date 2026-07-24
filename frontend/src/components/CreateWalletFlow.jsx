import { useState } from "react";

export default function CreateWalletFlow({ mnemonic, onConfirmed, onBack }) {
  const [revealed, setRevealed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const words = mnemonic.split(" ");

  return (
    <div className="flow-card card">
      <span className="eyebrow">Step 1 of 1</span>
      <h2>Write down your recovery phrase</h2>
      <p>
        These {words.length} words are the only way to recover this wallet. Anyone who has them can move your
        funds. Write them on paper - don&apos;t screenshot or paste them anywhere.
      </p>

      <div className={`mnemonic-grid ${revealed ? "" : "mnemonic-blurred"}`}>
        {words.map((word, i) => (
          <div key={i} className="mnemonic-word">
            <span className="mnemonic-index">{i + 1}</span>
            {word}
          </div>
        ))}
      </div>

      <button className="btn" onClick={() => setRevealed((r) => !r)}>
        {revealed ? "Hide phrase" : "Reveal phrase"}
      </button>

      <label className="confirm-row">
        <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
        I&apos;ve written down my recovery phrase and stored it somewhere safe.
      </label>

      <div className="flow-actions">
        <button className="btn" onClick={onBack}>
          Back
        </button>
        <button className="btn btn-primary" disabled={!confirmed} onClick={onConfirmed}>
          Continue to wallet
        </button>
      </div>
    </div>
  );
}
