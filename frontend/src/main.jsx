import React from "react";
import ReactDOM from "react-dom/client";
import { Buffer } from "buffer";
import App from "./App.jsx";
import "./styles/index.css";

// wallet-core's dependencies (bip39, tweetnacl, ed25519-hd-key) expect a
// global Buffer, the way they'd get one under Node. vite-plugin-node-polyfills
// handles most of this, but we pin it explicitly here too for safety.
if (!window.Buffer) window.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
