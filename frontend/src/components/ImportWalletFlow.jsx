import { useState } from "react";

export default function ImportWalletFlow({ onSubmit, onBack, error }) {
  const [value, setValue] = useState("");

  return (
    <div className="flow-card card">
      <span className="eyebrow">Restore wallet</span>
      <h2>Enter your recovery phrase</h2>
      <p>Separate each word with a space, exactly as it was written down.</p>

      <textarea
        rows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="word1 word2 word3 ..."
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
      />

      {error && <p className="error-text">{error}</p>}

      <div className="flow-actions">
        <button className="btn" onClick={onBack}>
          Back
        </button>
        <button className="btn btn-primary" disabled={!value.trim()} onClick={() => onSubmit(value)}>
          Restore wallet
        </button>
      </div>
    </div>
  );
}
