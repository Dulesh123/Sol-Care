import { useState } from "react";
import { buildSignedTransfer, solToLamports } from "../services/walletService.js";
import { waitForConfirmation } from "../services/alchemyService.js";

const STATUS = {
  IDLE: "idle",
  SIGNING: "signing",
  SUBMITTING: "submitting",
  CONFIRMING: "confirming",
  DONE: "done",
  ERROR: "error",
};

export default function SendPanel({ account, client, isConfigured, cluster, onSent }) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState(STATUS.IDLE);
  const [message, setMessage] = useState(null);
  const [signature, setSignature] = useState(null);

  const explorerUrl = signature
    ? `https://explorer.solana.com/tx/${signature}${cluster === "devnet" ? "?cluster=devnet" : ""}`
    : null;

  const reset = () => {
    setStatus(STATUS.IDLE);
    setMessage(null);
    setSignature(null);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      setStatus(STATUS.SIGNING);
      const { blockhash } = await client.getLatestBlockhash();
      const lamports = solToLamports(amount);
      if (!lamports || lamports <= 0) throw new Error("Enter an amount greater than 0.");

      const rawTransaction = buildSignedTransfer({
        fromKeypair: account.keypair,
        toAddress: to.trim(),
        lamports,
        blockhash,
      });

      setStatus(STATUS.SUBMITTING);
      const sig = await client.sendRawTransaction(rawTransaction);
      setSignature(sig);

      setStatus(STATUS.CONFIRMING);
      await waitForConfirmation(client, sig);

      setStatus(STATUS.DONE);
      setMessage("Transaction confirmed.");
      onSent?.();
    } catch (err) {
      setStatus(STATUS.ERROR);
      setMessage(err.message);
    }
  };

  const isBusy = status === STATUS.SIGNING || status === STATUS.SUBMITTING || status === STATUS.CONFIRMING;

  return (
    <div className="card">
      <span className="eyebrow">Send</span>
      <h3>Transfer SOL</h3>
      <form className="send-form" onSubmit={handleSend}>
        <label>
          Recipient address
          <input
            className="mono"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Solana address"
            disabled={isBusy}
            required
          />
        </label>
        <label>
          Amount (SOL)
          <input
            type="number"
            step="0.0001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={isBusy}
            required
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={!isConfigured || isBusy}>
          {status === STATUS.SIGNING && "Signing…"}
          {status === STATUS.SUBMITTING && "Submitting…"}
          {status === STATUS.CONFIRMING && "Confirming…"}
          {(status === STATUS.IDLE || status === STATUS.DONE || status === STATUS.ERROR) && "Sign & send"}
        </button>
      </form>

      {!isConfigured && <p className="settings-hint">Add an Alchemy API key above to enable sending.</p>}

      {message && (
        <div className={status === STATUS.ERROR ? "error-text" : "success-text"}>
          <p>{message}</p>
          {explorerUrl && (
            <a href={explorerUrl} target="_blank" rel="noreferrer">
              View on Solana Explorer
            </a>
          )}
          {status !== STATUS.IDLE && (
            <button className="btn btn-link" onClick={reset} type="button">
              Send another
            </button>
          )}
        </div>
      )}
    </div>
  );
}
