import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getWeb3, getContract } from "../utils/web3";

const Web3Context = createContext(null);

export const useWeb3 = () => {
    const ctx = useContext(Web3Context);
    if (!ctx) throw new Error("useWeb3 must be used inside Web3Provider");
    return ctx;
};

export const Web3Provider = ({ children }) => {
    const [web3, setWeb3]         = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [contract, setContract] = useState(null);
    const [loading, setLoading]   = useState(true);
    const [status, setStatus]     = useState({ type: "", msg: "" });

    // Role detection (simple heuristics — enhance with on-chain isDoctor/isPatient)
    const [role, setRole] = useState("guest"); // guest | patient | doctor | admin

    const notify = useCallback((msg, type = "info") => {
        setStatus({ msg, type });
        setTimeout(() => setStatus({ type: "", msg: "" }), 5000);
    }, []);

    const detectRole = useCallback(async (contractInst, accountAddr) => {
        try {
            const adminAddr = await contractInst.methods.getAdmin().call();
            if (accountAddr.toLowerCase() === adminAddr.toLowerCase()) {
                setRole("admin"); return;
            }
            const isDoc = await contractInst.methods.isDoctor(accountAddr).call();
            if (isDoc) { setRole("doctor"); return; }
            const isPat = await contractInst.methods.isPatient(accountAddr).call();
            if (isPat) { setRole("patient"); return; }
            setRole("guest");
        } catch { setRole("guest"); }
    }, []);

    const init = useCallback(async () => {
        setLoading(true);
        try {
            const w3       = await getWeb3();
            const accs     = await w3.eth.getAccounts();
            const ctrt     = await getContract(w3);
            setWeb3(w3);
            setAccounts(accs);
            setContract(ctrt);
            await detectRole(ctrt, accs[0]);
            notify("Connected to blockchain ✓", "success");
        } catch (err) {
            notify(err.message, "error");
        } finally {
            setLoading(false);
        }
    }, [detectRole, notify]);

    useEffect(() => {
        init();
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", async (newAccs) => {
                setAccounts(newAccs);
                if (contract && newAccs[0]) await detectRole(contract, newAccs[0]);
                notify(`Account: ${newAccs[0]}`, "info");
            });
            window.ethereum.on("chainChanged", () => window.location.reload());
        }
    }, []); // eslint-disable-line

    return (
        <Web3Context.Provider value={{ web3, accounts, contract, loading, status, notify, role, setRole, detectRole, reinit: init }}>
            {children}
        </Web3Context.Provider>
    );
};
