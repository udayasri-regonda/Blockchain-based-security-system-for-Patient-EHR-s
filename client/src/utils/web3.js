import Web3 from "web3";
import Healthcare from "../Healthcare.json";

/**
 * Initialise Web3 via MetaMask / injected provider.
 * Falls back to a local Ganache/Hardhat RPC if no extension is found.
 */
export const getWeb3 = async () => {
    if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
            // EIP-1102: request account access
            await window.ethereum.request({ method: "eth_requestAccounts" });
        } catch (err) {
            throw new Error("User denied account access.");
        }
        return web3;
    }

    // Fallback: local Ganache / Hardhat node
    const provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
    return new Web3(provider);
};

/**
 * Load the deployed Healthcare smart-contract instance.
 * The ABI + network addresses come from the compiled Healthcare.json artifact.
 */
export const getContract = async (web3) => {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = Healthcare.networks[networkId];

    if (!deployedNetwork) {
        throw new Error(
            `Smart contract not found on network ${networkId}. ` +
            "Please deploy using Truffle/Hardhat and update Healthcare.json."
        );
    }

    return new web3.eth.Contract(Healthcare.abi, deployedNetwork.address);
};

/** Shorten an Ethereum address for display: 0x1234...abcd */
export const shortAddr = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "—";

/** Format a Unix timestamp to a readable date-time string */
export const formatTimestamp = (ts) => {
    if (!ts || ts === "0") return "—";
    return new Date(Number(ts) * 1000).toLocaleString();
};
