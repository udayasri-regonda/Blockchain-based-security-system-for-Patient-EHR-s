import React from "react";
import ReactDOM from "react-dom/client";
import { PrivyProvider } from "@privy-io/react-auth";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <PrivyProvider
      appId={process.env.REACT_APP_PRIVY_APP_ID}
      config={{
        // ── Login methods — NO MetaMask ──
        loginMethods: ["email", "google"],

        // ── Auto-create embedded wallets ──
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          noPromptOnSignature: false,
        },

        // ── Chain: Sepolia ──
        defaultChain: {
          id: 11155111,
          name: "Sepolia",
          network: "sepolia",
          nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          rpcUrls: {
            default: {
              http: [process.env.REACT_APP_SEPOLIA_RPC_URL ||
                     "https://ethereum-sepolia-rpc.publicnode.com"]
            }
          },
          blockExplorers: {
            default: { name: "Etherscan", url: "https://sepolia.etherscan.io" }
          },
        },
        supportedChains: [/* same chain config */],

        // ── UI customization ──
        appearance: {
          theme:       "dark",
          accentColor: "#14b8a6",
          logo:        "https://sepolia.etherscan.io/images/main/empty-token.png",
        },
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
);