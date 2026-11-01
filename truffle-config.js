/**
 * truffle-config.js
 * Configure for local Ganache and Ethereum testnets.
 */

// Uncomment for testnet deployment with .env keys:
// require('dotenv').config();
// const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    // ── Local Ganache GUI (port 7545) ──────────────────────────────────────
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",   // Match any network
    },

    // ── Local Ganache CLI (port 8545) ─────────────────────────────────────
    ganache: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "1337",
    },

    // ── Sepolia Testnet (uncomment + install @truffle/hdwallet-provider) ──
    // sepolia: {
    //   provider: () =>
    //     new HDWalletProvider(
    //       process.env.MNEMONIC,
    //       `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    //     ),
    //   network_id: 11155111,
    //   confirmations: 2,
    //   timeoutBlocks: 200,
    //   skipDryRun: true,
    // },
  },

  compilers: {
    solc: {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },

  // Artifacts output — copy Healthcare.json to the React client automatically
  contracts_build_directory: "./client/src",
};
