import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { getWeb3, getContract, shortAddr, formatTimestamp } from "./utils/web3";

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────
const Ic = ({ n, s = 20, cls = "" }) => {
  const paths = {
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    stethoscope: "M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3 M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4",
    lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
    chain: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
    check: "M20 6 9 17l-5-5",
    x: "M18 6 6 18 M6 6l12 12",
    plus: "M12 5v14 M5 12h14",
    edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
    activity: "M22 12h-4l-3 9L9 3l-3 9H2",
    alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
    db: "M12 2a9 3 0 1 0 0 .001A9 3 0 0 0 12 2z M3 5v14a9 3 0 0 0 18 0V5 M3 12a9 3 0 0 0 18 0",
    logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
    menu: "M3 12h18 M3 6h18 M3 18h18",
    eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35",
    zap: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
    heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
    bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
    file: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M13 2v7h7",
    refresh: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      {(paths[n] || "").split(" M").map((d, i) => <path key={i} d={i === 0 ? d : "M" + d} />)}
    </svg>
  );
};

// ─── Reusable UI Primitives ───────────────────────────────────────────────────

const Badge = ({ label, color = "teal" }) => {
  const c = { teal: "bg-teal-100 text-teal-800 border-teal-200", green: "bg-green-100 text-green-800 border-green-200", red: "bg-red-100 text-red-800 border-red-200", amber: "bg-amber-100 text-amber-800 border-amber-200", blue: "bg-blue-100 text-blue-800 border-blue-200", purple: "bg-purple-100 text-purple-800 border-purple-200", slate: "bg-slate-100 text-slate-700 border-slate-200" };
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c[color] || c.slate}`}>{label}</span>;
};

const Btn = ({ children, onClick, variant = "primary", size = "md", disabled = false, type = "button", cls = "", icon }) => {
  const base = "inline-flex items-center gap-2 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const sz = { sm: "px-3 py-1.5 text-xs", md: "px-5 py-2.5 text-sm", lg: "px-7 py-3.5 text-base" };
  const v = {
    primary:   "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white shadow-lg shadow-teal-500/25",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700",
    danger:    "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 text-white shadow-lg shadow-red-500/20",
    ghost:     "text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700",
    success:   "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-white shadow-lg shadow-emerald-500/20",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sz[size]} ${v[variant]} ${cls}`}>
      {icon && <Ic n={icon} s={16} />}{children}
    </button>
  );
};

const Input = ({ label, value, onChange, placeholder, type = "text", rows, required, helpText }) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>}
    {rows
      ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors resize-none" />
      : <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors" />
    }
    {helpText && <p className="text-xs text-slate-500 mt-1">{helpText}</p>}
  </div>
);

const Card = ({ children, cls = "", glow = false }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-2xl ${glow ? "shadow-lg shadow-teal-500/10" : ""} ${cls}`}>
    {children}
  </div>
);

const StatCard = ({ icon, label, value, color = "teal", sub }) => {
  const g = { teal: "from-teal-500 to-teal-600", blue: "from-blue-500 to-blue-600", purple: "from-purple-500 to-purple-600", amber: "from-amber-500 to-amber-600", emerald: "from-emerald-500 to-emerald-600", rose: "from-rose-500 to-rose-600" };
  return (
    <Card cls="p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${g[color]} flex items-center justify-center text-white flex-shrink-0`}>
        <Ic n={icon} s={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
};

const Alert = ({ msg, type }) => {
  if (!msg) return null;
  const s = { success: "bg-emerald-900/50 border-emerald-700 text-emerald-300", error: "bg-red-900/50 border-red-700 text-red-300", info: "bg-blue-900/50 border-blue-700 text-blue-300", warn: "bg-amber-900/50 border-amber-700 text-amber-300" };
  const ic = { success: "check", error: "x", info: "alert", warn: "alert" };
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium mb-4 ${s[type] || s.info}`}>
      <Ic n={ic[type] || "alert"} s={16} />{msg}
    </div>
  );
};

const HashBox = ({ label = "Transaction Hash", hash }) => (
  <div className="bg-slate-950 rounded-xl p-3 mt-3">
    <p className="text-xs text-slate-500 font-mono mb-1">{label}</p>
    <p className="text-xs text-teal-400 font-mono break-all leading-relaxed">{hash}</p>
  </div>
);

const Spinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-10 h-10 border-2 border-slate-700 border-t-teal-500 rounded-full animate-spin" />
  </div>
);

const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <Card cls="relative w-full max-w-lg max-h-[90vh] overflow-y-auto z-10 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="font-bold text-white text-lg">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><Ic n="x" s={18} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </Card>
    </div>
  );
};

// ─── Web3 Hook ────────────────────────────────────────────────────────────────
const useWeb3State = () => {
  const [web3, setWeb3]           = useState(null);
  const [accounts, setAccounts]   = useState([]);
  const [contract, setContract]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [connected, setConnected] = useState(false);
  const [status, setStatus]       = useState({ type: "", msg: "" });
  const [role, setRole]           = useState("guest");
  const [stats, setStats]         = useState({ patients: 0, doctors: 0, txns: 0 });

  const notify = useCallback((msg, type = "info") => {
    setStatus({ msg, type });
    setTimeout(() => setStatus({ type: "", msg: "" }), 6000);
  }, []);

  const detectRole = useCallback(async (ctrt, addr) => {
    try {
      const adminAddr = await ctrt.methods.getAdmin().call();
      if (addr.toLowerCase() === adminAddr.toLowerCase()) { setRole("admin"); return "admin"; }
      const isDoc = await ctrt.methods.isDoctor(addr).call();
      if (isDoc) { setRole("doctor"); return "doctor"; }
      const isPat = await ctrt.methods.isPatient(addr).call();
      if (isPat) { setRole("patient"); return "patient"; }
      setRole("guest"); return "guest";
    } catch { setRole("guest"); return "guest"; }
  }, []);

  const refreshStats = useCallback(async (ctrt) => {
    try {
      const s = await ctrt.methods.getStats().call();
      setStats({ patients: Number(s[0]), doctors: Number(s[1]), txns: Number(s[2]) });
    } catch {}
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      notify("MetaMask not detected! Please install MetaMask to continue.", "error");
      return;
    }
    setLoading(true);
    try {
      const w3   = await getWeb3();
      const accs = await w3.eth.getAccounts();
      const ctrt = await getContract(w3);
      setWeb3(w3); setAccounts(accs); setContract(ctrt); setConnected(true);
      await detectRole(ctrt, accs[0]);
      await refreshStats(ctrt);
      notify("Wallet connected ✓", "success");
    } catch (err) { notify(err.message, "error"); }
    finally { setLoading(false); }
  }, [detectRole, notify, refreshStats]);

  // Auto-connect if MetaMask already has permission (no popup)
  useEffect(() => {
    const autoConnect = async () => {
      if (!window.ethereum) return;
      try {
        // eth_accounts does NOT trigger a popup — only returns already-permitted accounts
        const accs = await window.ethereum.request({ method: "eth_accounts" });
        if (accs && accs.length > 0) {
          const w3   = new (await import("web3")).default(window.ethereum);
          const ctrt = await getContract(w3);
          setWeb3(w3); setAccounts(accs); setContract(ctrt); setConnected(true);
          await detectRole(ctrt, accs[0]);
          await refreshStats(ctrt);
        }
      } catch {}
    };
    autoConnect();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (newAccs) => {
        if (newAccs.length === 0) {
          // User disconnected in MetaMask
          setAccounts([]); setConnected(false); setRole("guest");
        } else {
          setAccounts(newAccs);
          if (contract && newAccs[0]) await detectRole(contract, newAccs[0]);
        }
      });
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
  }, []); // eslint-disable-line

  return { web3, accounts, contract, loading, connected, status, notify, role, setRole, detectRole, stats, refreshStats, connect };
};

// ─── Wallet Connect Button ────────────────────────────────────────────────────
const WalletButton = ({ accounts, connected, loading, connect, role }) => {
  const roleColor = { admin: "text-purple-400", doctor: "text-blue-400", patient: "text-teal-400", guest: "text-slate-400" };
  const roleBg    = { admin: "bg-purple-500/10 border-purple-500/30", doctor: "bg-blue-500/10 border-blue-500/30", patient: "bg-teal-500/10 border-teal-500/30", guest: "" };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-sm">
        <div className="w-3.5 h-3.5 border-2 border-slate-600 border-t-teal-400 rounded-full animate-spin" />
        <span className="hidden sm:inline">Connecting…</span>
      </div>
    );
  }

  if (connected && accounts[0]) {
    return (
      <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border ${roleBg[role] || "bg-slate-800 border-slate-700"}`}>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        <div className="hidden sm:flex flex-col">
          <span className={`text-xs font-bold uppercase tracking-wide ${roleColor[role]}`}>{role}</span>
          <span className="text-xs text-slate-400 font-mono">{shortAddr(accounts[0])}</span>
        </div>
        <div className="sm:hidden">
          <span className={`text-xs font-bold ${roleColor[role]}`}>{shortAddr(accounts[0])}</span>
        </div>
      </div>
    );
  }

  return (
    <button
      id="connect-wallet-btn"
      onClick={connect}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-teal-500/25 transition-all active:scale-95"
    >
      <Ic n="chain" s={15} />
      <span>Connect Wallet</span>
    </button>
  );
};

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = ({ accounts, role, notify, loading, connected, connect }) => {
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/",          label: "Home",           icon: "home" },
    { to: "/register",  label: "Register",       icon: "user",  roles: ["guest"] },
    { to: "/profile",   label: "My Profile",     icon: "user",  roles: ["patient"] },
    { to: "/authorize", label: "Access Control", icon: "lock",  roles: ["patient"] },
    { to: "/history",   label: "Update History", icon: "edit",  roles: ["patient"] },
    { to: "/doctor",    label: "My Patients",    icon: "users", roles: ["doctor"] },
    { to: "/admin",     label: "Admin Panel",    icon: "shield", roles: ["admin"] },
    { to: "/logs",      label: "Audit Logs",     icon: "activity", roles: ["admin"] },
  ].filter(l => !l.roles || l.roles.includes(role));

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Ic n="shield" s={18} cls="text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-lg text-white tracking-tight">EHR</span>
              <span className="font-black text-lg text-teal-400 tracking-tight">Chain</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${loc.pathname === l.to ? "bg-teal-500/20 text-teal-300 border border-teal-500/30" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
                <Ic n={l.icon} s={15} />{l.label}
              </Link>
            ))}
          </div>

          {/* Wallet + Mobile menu */}
          <div className="flex items-center gap-3">
            <WalletButton accounts={accounts} connected={connected} loading={loading} connect={connect} role={role} />
            <button onClick={() => setOpen(!open)} className="md:hidden text-slate-400 hover:text-white p-2">
              <Ic n="menu" s={22} />
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {open && (
          <div className="md:hidden border-t border-slate-800 py-3 space-y-1">
            {links.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${loc.pathname === l.to ? "bg-teal-500/20 text-teal-300" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
                <Ic n={l.icon} s={16} />{l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

// ─── Wallet Guard ─────────────────────────────────────────────────────────────
const WalletGuard = ({ connected, connect, loading, children }) => {
  if (!connected) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-500/20 flex items-center justify-center mx-auto mb-6">
          <Ic n="chain" s={36} cls="text-teal-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-3">Wallet Not Connected</h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          You need to connect your MetaMask wallet to interact with the blockchain and store your data securely.
        </p>
        <button
          onClick={connect}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold shadow-lg shadow-teal-500/25 transition-all disabled:opacity-50"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Ic n="chain" s={18} />}
          {loading ? "Connecting…" : "Connect MetaMask"}
        </button>
        <p className="text-slate-600 text-xs mt-4">Make sure MetaMask is installed and connected to the correct network (Ganache port 7545).</p>
      </div>
    );
  }
  return children;
};

// ─── PAGE: Home ───────────────────────────────────────────────────────────────
const HomePage = ({ accounts, role, stats, loading, connected, connect }) => {
  const features = [
    { icon: "shield", title: "Immutable Records", desc: "AES-256 encryption + on-chain hashes make tampering mathematically impossible.", color: "teal" },
    { icon: "lock",   title: "Patient-Controlled Access", desc: "You decide who can see your records. Grant or revoke doctor access in real time via smart contracts.", color: "blue" },
    { icon: "chain",  title: "Full Audit Trail", desc: "Every access event is permanently logged on-chain with timestamp and cryptographic proof.", color: "purple" },
    { icon: "zap",    title: "Smart Contracts", desc: "Ethereum smart contracts automate permission logic — no intermediary, no downtime.", color: "amber" },
    { icon: "activity", title: "Real-time Status", desc: "Instant blockchain confirmation and verification badges on every record.", color: "emerald" },
    { icon: "heart",  title: "Patient First", desc: "Designed around patient empowerment, privacy, and seamless doctor collaboration.", color: "rose" },
  ];
  const gColors = { teal:"from-teal-500 to-teal-600", blue:"from-blue-500 to-blue-600", purple:"from-purple-500 to-purple-600", amber:"from-amber-500 to-amber-600", emerald:"from-emerald-500 to-emerald-600", rose:"from-rose-500 to-rose-600" };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-teal-500/6 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/6 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
            <span className="text-teal-300 text-sm font-medium">Ethereum · Solidity · React · MetaMask</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-none mb-6 tracking-tight">
            Healthcare Records<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400">
              On the Blockchain
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            A decentralized Electronic Health Record system powered by Ethereum smart contracts. Patient-controlled, cryptographically secured, and completely transparent.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {!connected ? (
              <button
                onClick={connect}
                disabled={loading}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white text-lg font-bold shadow-2xl shadow-teal-500/30 transition-all active:scale-95 disabled:opacity-60"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Ic n="chain" s={22} />}
                {loading ? "Connecting…" : "Connect Wallet to Get Started"}
              </button>
            ) : (
              <>
                {role === "guest" && (
                  <Link to="/register"><Btn size="lg" icon="user">Register as Patient</Btn></Link>
                )}
                {role === "patient" && (
                  <Link to="/profile"><Btn size="lg" icon="user">View My Records</Btn></Link>
                )}
                {role === "doctor" && (
                  <Link to="/doctor"><Btn size="lg" icon="users">My Patients</Btn></Link>
                )}
                {role === "admin" && (
                  <Link to="/admin"><Btn size="lg" icon="shield">Admin Panel</Btn></Link>
                )}
                <Link to="/authorize">
                  <Btn size="lg" variant="ghost" icon="lock">Manage Access</Btn>
                </Link>
              </>
            )}
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-3 gap-4 mt-16 max-w-lg mx-auto">
            {[
              { label: "Patients", value: loading ? "…" : stats.patients },
              { label: "Doctors", value: loading ? "…" : stats.doctors },
              { label: "Transactions", value: loading ? "…" : stats.txns },
            ].map(s => (
              <Card key={s.label} cls="p-4 text-center">
                <p className="text-2xl font-black text-teal-400">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Account / Connect banner */}
      <div className="max-w-5xl mx-auto px-4 mb-10">
        {connected && accounts[0] ? (
          <Card cls="p-4 border-teal-800/50" glow>
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {accounts[0].slice(2, 4).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold">Connected: <span className="font-mono text-teal-400 text-xs break-all">{accounts[0]}</span></p>
                <p className="text-slate-500 text-xs">Role detected: <span className="font-semibold text-slate-300 capitalize">{role}</span></p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            </div>
          </Card>
        ) : (
          <Card cls="p-5 border-amber-800/30 bg-amber-900/10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Ic n="alert" s={18} cls="text-amber-400" />
                </div>
                <div>
                  <p className="text-amber-300 font-semibold text-sm">Wallet not connected</p>
                  <p className="text-slate-500 text-xs">Connect MetaMask to register, view records, or authorize doctors.</p>
                </div>
              </div>
              <button
                onClick={connect}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 text-white text-sm font-semibold shadow-lg shadow-teal-500/25 transition-all flex-shrink-0 disabled:opacity-60"
              >
                <Ic n="chain" s={15} />
                {loading ? "Connecting…" : "Connect Wallet"}
              </button>
            </div>
          </Card>
        )}
      </div>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-3">Why EHRChain?</h2>
          <p className="text-slate-400">Built for security, transparency, and patient empowerment.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map(f => (
            <Card key={f.title} cls="p-6 group hover:border-teal-800 transition-colors">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gColors[f.color]} flex items-center justify-center mb-4 text-white`}>
                <Ic n={f.icon} s={18} />
              </div>
              <h3 className="font-bold text-white text-base mb-2 group-hover:text-teal-300 transition-colors">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-slate-800 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Connect Wallet", desc: "Open MetaMask, connect to the correct network (Ganache/Sepolia).", icon: "chain" },
              { step: "02", title: "Register", desc: "Patients self-register on-chain. Admin registers & authorizes doctors.", icon: "user" },
              { step: "03", title: "Grant Access", desc: "Patient authorizes doctors via smart contract — recorded immutably.", icon: "lock" },
              { step: "04", title: "Secure Access", desc: "Doctor views records only after patient approval. All events are auditable.", icon: "shield" },
            ].map(s => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white mb-3 shadow-lg shadow-teal-500/20">
                  <Ic n={s.icon} s={20} />
                </div>
                <span className="text-xs font-mono text-teal-500 mb-1">{s.step}</span>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// ─── PAGE: Register Patient ───────────────────────────────────────────────────
const RegisterPage = ({ contract, accounts, notify, detectRole, setRole, refreshStats, connected, connect, loading }) => {
  const [form, setForm] = useState({ name: "", age: "", medicalHistory: "", bloodGroup: "", contactNumber: "" });
  const [busy, setBusy] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [done, setDone] = useState(false);

  const blood = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

  const handle = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async () => {
    if (!contract || !accounts[0]) { notify("Wallet not connected!", "error"); return; }
    if (!form.name || !form.age || !form.medicalHistory) { notify("Name, Age and Medical History are required.", "warn"); return; }
    if (Number(form.age) <= 0 || Number(form.age) > 150) { notify("Enter a valid age.", "warn"); return; }
    setBusy(true);
    try {
      const receipt = await contract.methods
        .registerPatient(form.name, Number(form.age), form.medicalHistory, form.bloodGroup, form.contactNumber)
        .send({ from: accounts[0] });
      setTxHash(receipt.transactionHash);
      setDone(true);
      await detectRole(contract, accounts[0]);
      await refreshStats(contract);
      notify("Patient registered on blockchain! ✓", "success");
    } catch (err) {
      notify(err.code === 4001 ? "Transaction rejected." : err.message, "error");
    } finally { setBusy(false); }
  };

  if (done) return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-500/30">
        <Ic n="check" s={36} cls="text-white" />
      </div>
      <h2 className="text-2xl font-black text-white mb-3">Registration Successful!</h2>
      <p className="text-slate-400 mb-6">Your health record has been created on the Ethereum blockchain.</p>
      <HashBox label="Transaction Hash (save this!)" hash={txHash} />
      <div className="flex gap-3 justify-center mt-6">
        <Link to="/profile"><Btn icon="user">View My Profile</Btn></Link>
        <Link to="/authorize"><Btn variant="ghost" icon="lock">Manage Access</Btn></Link>
      </div>
    </div>
  );

  return (
    <WalletGuard connected={connected} connect={connect} loading={loading}>
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Register as Patient</h1>
        <p className="text-slate-400">Your data will be encrypted and stored on the Ethereum blockchain.</p>
      </div>
      <Card cls="p-6" glow>
        <div className="grid md:grid-cols-2 gap-x-6">
          <Input label="Full Name" value={form.name} onChange={handle("name")} placeholder="Kavya Reddy" required />
          <Input label="Age" type="number" value={form.age} onChange={handle("age")} placeholder="28" required />
        </div>
        <div className="grid md:grid-cols-2 gap-x-6">
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Blood Group</label>
            <select value={form.bloodGroup} onChange={handle("bloodGroup")} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-teal-500 transition-colors">
              <option value="">Select…</option>
              {blood.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <Input label="Contact Number" value={form.contactNumber} onChange={handle("contactNumber")} placeholder="+91 9876543210" />
        </div>
        <Input label="Medical History" value={form.medicalHistory} onChange={handle("medicalHistory")} placeholder="Describe current conditions, allergies, past surgeries, medications…" rows={4} required helpText="This will be stored encrypted on-chain. Be thorough." />

        <div className="bg-teal-900/30 border border-teal-700/30 rounded-xl p-4 mb-5">
          <div className="flex items-start gap-3">
            <Ic n="shield" s={18} cls="text-teal-400 flex-shrink-0 mt-0.5" />
            <p className="text-teal-300/90 text-sm leading-relaxed">Your data will be stored on the Ethereum blockchain — immutable and tamper-proof. Only you and doctors you explicitly authorize can access it.</p>
          </div>
        </div>

        <Btn onClick={submit} disabled={busy} size="lg" cls="w-full justify-center" icon={busy ? "refresh" : "check"}>
          {busy ? "Submitting to blockchain…" : "Register on Blockchain"}
        </Btn>
        <p className="text-center text-slate-500 text-xs mt-3">MetaMask will ask you to confirm the transaction and pay a small gas fee.</p>
      </Card>
    </div>
    </WalletGuard>
  );
};

// ─── PAGE: Patient Profile ────────────────────────────────────────────────────
const PatientProfile = ({ contract, accounts, notify }) => {
  const [details, setDetails] = useState(null);
  const [authDocs, setAuthDocs]  = useState([]);
  const [loading, setLoading]  = useState(true);
  const [docDetails, setDocDetails] = useState({});

  const fetch = useCallback(async () => {
    if (!contract || !accounts[0]) return;
    setLoading(true);
    try {
      const d = await contract.methods.getPatientDetails(accounts[0]).call({ from: accounts[0] });
      setDetails({ name: d[0], age: d[1].toString(), history: d[2], blood: d[3], contact: d[4], regAt: d[5], updAt: d[6] });
      const docs = await contract.methods.getAuthorizedDoctors(accounts[0]).call();
      setAuthDocs(docs);
      // Fetch each doctor's details
      const dd = {};
      for (const addr of docs) {
        try {
          const info = await contract.methods.getDoctorDetails(addr).call();
          dd[addr] = { name: info[0], spec: info[1] };
        } catch { dd[addr] = { name: shortAddr(addr), spec: "—" }; }
      }
      setDocDetails(dd);
    } catch (err) { notify(err.message, "error"); }
    finally { setLoading(false); }
  }, [contract, accounts, notify]);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <Spinner />;
  if (!details) return (
    <div className="text-center py-20">
      <p className="text-slate-400 mb-4">No patient record found for this wallet address.</p>
      <Link to="/register"><Btn icon="user">Register Now</Btn></Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">{details.name}</h1>
          <p className="text-slate-400 text-sm font-mono mt-1">{accounts[0]}</p>
        </div>
        <Badge label="Patient" color="teal" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Info Card */}
        <Card cls="p-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Ic n="user" s={18} cls="text-teal-400" />Personal Details</h2>
          <div className="space-y-3">
            {[
              { label: "Full Name",    value: details.name },
              { label: "Age",          value: `${details.age} years` },
              { label: "Blood Group",  value: details.blood || "—" },
              { label: "Contact",      value: details.contact || "—" },
              { label: "Registered",   value: formatTimestamp(details.regAt) },
              { label: "Last Updated", value: formatTimestamp(details.updAt) },
            ].map(f => (
              <div key={f.label} className="flex justify-between text-sm border-b border-slate-800 pb-2">
                <span className="text-slate-400">{f.label}</span>
                <span className="text-white font-medium text-right max-w-[60%]">{f.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Medical History */}
        <Card cls="p-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Ic n="file" s={18} cls="text-teal-400" />Medical History</h2>
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{details.history || "No history recorded."}</p>
          </div>
          <div className="mt-4">
            <Link to="/history"><Btn variant="ghost" size="sm" icon="edit">Update Medical History</Btn></Link>
          </div>
        </Card>
      </div>

      {/* Authorized Doctors */}
      <Card cls="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white flex items-center gap-2"><Ic n="users" s={18} cls="text-teal-400" />Authorized Doctors ({authDocs.length})</h2>
          <Link to="/authorize"><Btn variant="ghost" size="sm" icon="plus">Manage Access</Btn></Link>
        </div>
        {authDocs.length === 0
          ? <p className="text-slate-500 text-sm">No doctors authorized yet.</p>
          : (
            <div className="space-y-2">
              {authDocs.map(addr => (
                <div key={addr} className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {(docDetails[addr]?.name || "D").charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{docDetails[addr]?.name || shortAddr(addr)}</p>
                    <p className="text-slate-400 text-xs">{docDetails[addr]?.spec || addr}</p>
                  </div>
                  <Badge label="Authorized" color="green" />
                </div>
              ))}
            </div>
          )
        }
      </Card>

      {/* Blockchain Proof */}
      <Card cls="p-6 bg-slate-950">
        <h2 className="font-bold text-white mb-3 flex items-center gap-2"><Ic n="chain" s={18} cls="text-teal-400" />Blockchain Proof</h2>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="bg-slate-900 rounded-xl p-3">
            <p className="text-slate-500 text-xs mb-1">Wallet Address</p>
            <p className="text-teal-400 font-mono text-xs break-all">{accounts[0]}</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-3">
            <p className="text-slate-500 text-xs mb-1">Record Status</p>
            <Badge label="Verified On-Chain" color="green" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-400 text-sm">
          <Ic n="check" s={16} /><span>This record is immutably stored on the Ethereum blockchain.</span>
        </div>
      </Card>
    </div>
  );
};

// ─── PAGE: Doctor Authorization ───────────────────────────────────────────────
const DoctorAuthorizationPage = ({ contract, accounts, notify, connected, connect, loading }) => {
  const [docAddr, setDocAddr]   = useState("");
  const [revokeAddr, setRevoke] = useState("");
  const [busy, setBusy]         = useState({ auth: false, revoke: false });
  const [txHash, setTxHash]     = useState("");
  const [checkAddr, setCheck]   = useState("");
  const [checkResult, setCheckResult] = useState(null);

  const authorize = async () => {
    if (!docAddr) { notify("Enter doctor address", "warn"); return; }
    setBusy(p => ({ ...p, auth: true }));
    try {
      const r = await contract.methods.authorizeDoctor(docAddr).send({ from: accounts[0] });
      setTxHash(r.transactionHash);
      notify("Doctor authorized! Transaction confirmed ✓", "success");
      setDocAddr("");
    } catch (err) { notify(err.code === 4001 ? "Rejected." : err.message, "error"); }
    finally { setBusy(p => ({ ...p, auth: false })); }
  };

  const revoke = async () => {
    if (!revokeAddr) { notify("Enter doctor address", "warn"); return; }
    setBusy(p => ({ ...p, revoke: true }));
    try {
      const r = await contract.methods.revokeDoctorAccess(revokeAddr).send({ from: accounts[0] });
      setTxHash(r.transactionHash);
      notify("Access revoked! Transaction confirmed ✓", "success");
      setRevoke("");
    } catch (err) { notify(err.code === 4001 ? "Rejected." : err.message, "error"); }
    finally { setBusy(p => ({ ...p, revoke: false })); }
  };

  const checkAccess = async () => {
    if (!checkAddr) return;
    try {
      const result = await contract.methods.authorizedDoctors(accounts[0], checkAddr).call();
      setCheckResult(result);
    } catch { notify("Check failed", "error"); }
  };

  return (
    <WalletGuard connected={connected} connect={connect} loading={loading}>
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Access Control</h1>
        <p className="text-slate-400">Grant or revoke doctor access to your medical records. All actions are recorded on the blockchain.</p>
      </div>

      {txHash && <HashBox label="Last Transaction Hash" hash={txHash} />}

      {/* Authorize */}
      <Card cls="p-6" glow>
        <h2 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"><Ic n="check" s={16} cls="text-emerald-400" /></div>
          Grant Doctor Access
        </h2>
        <Input label="Doctor's Ethereum Address" value={docAddr} onChange={e => setDocAddr(e.target.value)} placeholder="0x..." helpText="The doctor must be registered by the admin first." />
        <Btn onClick={authorize} disabled={busy.auth} size="lg" variant="success" cls="w-full justify-center" icon={busy.auth ? "refresh" : "check"}>
          {busy.auth ? "Authorizing…" : "Authorize Doctor"}
        </Btn>
      </Card>

      {/* Revoke */}
      <Card cls="p-6">
        <h2 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center"><Ic n="x" s={16} cls="text-red-400" /></div>
          Revoke Doctor Access
        </h2>
        <Input label="Doctor's Ethereum Address" value={revokeAddr} onChange={e => setRevoke(e.target.value)} placeholder="0x..." />
        <Btn onClick={revoke} disabled={busy.revoke} size="lg" variant="danger" cls="w-full justify-center" icon={busy.revoke ? "refresh" : "x"}>
          {busy.revoke ? "Revoking…" : "Revoke Access"}
        </Btn>
      </Card>

      {/* Check */}
      <Card cls="p-6">
        <h2 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"><Ic n="search" s={16} cls="text-blue-400" /></div>
          Check Authorization Status
        </h2>
        <Input label="Doctor's Ethereum Address" value={checkAddr} onChange={e => setCheck(e.target.value)} placeholder="0x..." />
        <Btn onClick={checkAccess} variant="ghost" icon="eye">Check Status</Btn>
        {checkResult !== null && (
          <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold ${checkResult ? "bg-emerald-900/30 border-emerald-700 text-emerald-300" : "bg-red-900/30 border-red-700 text-red-300"}`}>
            <Ic n={checkResult ? "check" : "x"} s={16} />
            {checkResult ? "This doctor IS authorized to view your records." : "This doctor is NOT authorized."}
          </div>
        )}
      </Card>
    </div>
    </WalletGuard>
  );
};

// ─── PAGE: Update Medical History ─────────────────────────────────────────────
const UpdateHistoryPage = ({ contract, accounts, notify }) => {
  const [current, setCurrent]   = useState("");
  const [newHistory, setNew]    = useState("");
  const [busy, setBusy]         = useState(false);
  const [txHash, setTxHash]     = useState("");
  const [updateDetails, setDetails] = useState({ age: "", blood: "", contact: "" });
  const [busyDetails, setBusyD] = useState(false);

  useEffect(() => {
    if (!contract || !accounts[0]) return;
    contract.methods.getPatientDetails(accounts[0]).call({ from: accounts[0] })
      .then(d => { setCurrent(d[2]); setUpdateDetails({ age: d[1].toString(), blood: d[3], contact: d[4] }); })
      .catch(() => {});
  }, [contract, accounts]);

  const submitHistory = async () => {
    if (!newHistory) { notify("Enter new medical history", "warn"); return; }
    setBusy(true);
    try {
      const r = await contract.methods.updateMedicalHistory(newHistory).send({ from: accounts[0] });
      setTxHash(r.transactionHash);
      setCurrent(newHistory); setNew("");
      notify("Medical history updated on blockchain ✓", "success");
    } catch (err) { notify(err.code === 4001 ? "Rejected." : err.message, "error"); }
    finally { setBusy(false); }
  };

  const submitDetails = async () => {
    if (!updateDetails.age) { notify("Age is required", "warn"); return; }
    setBusyD(true);
    try {
      const r = await contract.methods.updatePatientDetails(Number(updateDetails.age), updateDetails.blood, updateDetails.contact).send({ from: accounts[0] });
      setTxHash(r.transactionHash);
      notify("Personal details updated ✓", "success");
    } catch (err) { notify(err.code === 4001 ? "Rejected." : err.message, "error"); }
    finally { setBusyD(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Update Records</h1>
        <p className="text-slate-400">Update your medical information on the blockchain.</p>
      </div>
      {txHash && <HashBox label="Last Transaction Hash" hash={txHash} />}

      {current && (
        <Card cls="p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Current Medical History</p>
          <p className="text-slate-300 text-sm leading-relaxed">{current}</p>
        </Card>
      )}

      <Card cls="p-6" glow>
        <h2 className="font-bold text-white text-lg mb-4 flex items-center gap-2"><Ic n="file" s={18} cls="text-teal-400" />Medical History</h2>
        <Input label="New Medical History" value={newHistory} onChange={e => setNew(e.target.value)} placeholder="Updated conditions, new diagnoses, medications…" rows={5} />
        <Btn onClick={submitHistory} disabled={busy} size="lg" cls="w-full justify-center" icon={busy ? "refresh" : "check"}>
          {busy ? "Updating…" : "Update Medical History"}
        </Btn>
      </Card>

      <Card cls="p-6">
        <h2 className="font-bold text-white text-lg mb-4 flex items-center gap-2"><Ic n="edit" s={18} cls="text-teal-400" />Personal Details</h2>
        <div className="grid grid-cols-2 gap-x-4">
          <Input label="Age" type="number" value={updateDetails.age} onChange={e => setDetails(p => ({ ...p, age: e.target.value }))} />
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Blood Group</label>
            <select value={updateDetails.blood} onChange={e => setDetails(p => ({ ...p, blood: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-teal-500">
              {["","A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b} value={b}>{b || "Select…"}</option>)}
            </select>
          </div>
        </div>
        <Input label="Contact Number" value={updateDetails.contact} onChange={e => setDetails(p => ({ ...p, contact: e.target.value }))} />
        <Btn onClick={submitDetails} disabled={busyDetails} variant="secondary" size="lg" cls="w-full justify-center" icon={busyDetails ? "refresh" : "check"}>
          {busyDetails ? "Updating…" : "Update Details"}
        </Btn>
      </Card>
    </div>
  );
};

// ─── PAGE: Doctor — My Patients ───────────────────────────────────────────────
const DoctorPatientsPage = ({ contract, accounts, notify }) => {
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [details, setDetails]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [loadingDetail, setLD]  = useState(false);

  useEffect(() => {
    if (!contract || !accounts[0]) return;
    setLoading(true);
    contract.methods.getPatientsForDoctor(accounts[0]).call({ from: accounts[0] })
      .then(list => { setPatients(list); setLoading(false); })
      .catch(err => { notify(err.message, "error"); setLoading(false); });
  }, [contract, accounts, notify]);

  const viewPatient = async (addr) => {
    setSelected(addr); setLD(true);
    try {
      const d = await contract.methods.getPatientDetails(addr).call({ from: accounts[0] });
      setDetails({ name: d[0], age: d[1].toString(), history: d[2], blood: d[3], contact: d[4], regAt: d[5], updAt: d[6] });
    } catch (err) { notify(err.message, "error"); setDetails(null); }
    finally { setLD(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">My Patients</h1>
        <p className="text-slate-400">Patients who have authorized you to view their records.</p>
      </div>

      {loading ? <Spinner /> : patients.length === 0
        ? (
          <Card cls="p-12 text-center">
            <Ic n="users" s={40} cls="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No patients have authorized you yet.</p>
            <p className="text-slate-500 text-sm mt-1">Ask your patients to authorize your Ethereum address via the Access Control page.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Patient list */}
            <div className="space-y-3">
              <p className="text-slate-500 text-sm">{patients.length} patient(s) found</p>
              {patients.map((addr) => (
                <button key={addr} onClick={() => viewPatient(addr)} className={`w-full text-left p-4 rounded-xl border transition-all ${selected === addr ? "border-teal-500 bg-teal-500/10" : "border-slate-800 bg-slate-900 hover:border-slate-700"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {addr.slice(2, 4).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{shortAddr(addr)}</p>
                      <p className="text-slate-500 text-xs font-mono truncate">{addr}</p>
                    </div>
                    <Ic n="chevron" s={16} cls={`text-slate-500 ml-auto flex-shrink-0 ${selected === addr ? "text-teal-400" : ""}`} />
                  </div>
                </button>
              ))}
            </div>

            {/* Patient detail */}
            <div>
              {!selected && <Card cls="p-8 text-center"><p className="text-slate-500">Select a patient to view their records</p></Card>}
              {loadingDetail && <Spinner />}
              {details && !loadingDetail && (
                <Card cls="p-5" glow>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-white text-xl">{details.name}</h3>
                    <Badge label="Authorized" color="green" />
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    {[
                      { l: "Age",          v: `${details.age} years` },
                      { l: "Blood Group",  v: details.blood || "—" },
                      { l: "Contact",      v: details.contact || "—" },
                      { l: "Registered",   v: formatTimestamp(details.regAt) },
                      { l: "Last Updated", v: formatTimestamp(details.updAt) },
                    ].map(f => (
                      <div key={f.l} className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-400">{f.l}</span>
                        <span className="text-white font-medium">{f.v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-800 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Medical History</p>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{details.history}</p>
                  </div>
                  <HashBox label="Patient Wallet Address" hash={selected} />
                </Card>
              )}
            </div>
          </div>
        )
      }
    </div>
  );
};

// ─── PAGE: Admin Panel ────────────────────────────────────────────────────────
const AdminPanelPage = ({ contract, accounts, notify, stats }) => {
  const [docAddr, setDocAddr]   = useState("");
  const [docName, setDocName]   = useState("");
  const [docSpec, setDocSpec]   = useState("");
  const [newAdmin, setNewAdmin] = useState("");
  const [emergency, setEmergency] = useState({ addr: "", result: null });
  const [busy, setBusy]         = useState({ doc: false, admin: false, emg: false });
  const [txHash, setTxHash]     = useState("");

  const registerDoc = async () => {
    if (!docAddr || !docName) { notify("Address and name required", "warn"); return; }
    setBusy(p => ({ ...p, doc: true }));
    try {
      const r = await contract.methods.registerDoctor(docAddr, docName, docSpec).send({ from: accounts[0] });
      setTxHash(r.transactionHash);
      notify(`Dr. ${docName} registered ✓`, "success");
      setDocAddr(""); setDocName(""); setDocSpec("");
    } catch (err) { notify(err.code === 4001 ? "Rejected." : err.message, "error"); }
    finally { setBusy(p => ({ ...p, doc: false })); }
  };

  const changeAdmin = async () => {
    if (!newAdmin) { notify("Enter new admin address", "warn"); return; }
    setBusy(p => ({ ...p, admin: true }));
    try {
      const r = await contract.methods.setAdmin(newAdmin).send({ from: accounts[0] });
      setTxHash(r.transactionHash);
      notify("Admin address updated ✓", "success");
      setNewAdmin("");
    } catch (err) { notify(err.code === 4001 ? "Rejected." : err.message, "error"); }
    finally { setBusy(p => ({ ...p, admin: false })); }
  };

  const emergencyFetch = async () => {
    if (!emergency.addr) { notify("Enter patient address", "warn"); return; }
    setBusy(p => ({ ...p, emg: true }));
    try {
      const r = await contract.methods.emergencyAccess(emergency.addr).send({ from: accounts[0] });
      setTxHash(r.transactionHash);
      // Read the return (we need a call for data, the send logs it)
      const data = await contract.methods.emergencyAccess(emergency.addr).call({ from: accounts[0] });
      setEmergency(p => ({ ...p, result: { name: data[0], age: data[1].toString(), history: data[2] } }));
      notify("Emergency access logged on-chain ✓", "success");
    } catch (err) { notify(err.code === 4001 ? "Rejected." : err.message, "error"); }
    finally { setBusy(p => ({ ...p, emg: false })); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white">
          <Ic n="shield" s={20} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Admin Panel</h1>
          <p className="text-slate-400 text-sm">System administration — wallet: <span className="font-mono text-purple-400">{shortAddr(accounts[0])}</span></p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon="users" label="Total Patients" value={stats.patients} color="teal" />
        <StatCard icon="user" label="Total Doctors" value={stats.doctors} color="blue" />
        <StatCard icon="activity" label="Total Transactions" value={stats.txns} color="purple" />
      </div>

      {txHash && <HashBox label="Last Transaction Hash" hash={txHash} />}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Register Doctor */}
        <Card cls="p-6" glow>
          <h2 className="font-bold text-white text-lg mb-4 flex items-center gap-2"><Ic n="user" s={18} cls="text-blue-400" />Register Doctor</h2>
          <Input label="Doctor Ethereum Address" value={docAddr} onChange={e => setDocAddr(e.target.value)} placeholder="0x..." required />
          <Input label="Full Name" value={docName} onChange={e => setDocName(e.target.value)} placeholder="Dr. Suresh Rao" required />
          <Input label="Specialization" value={docSpec} onChange={e => setDocSpec(e.target.value)} placeholder="Cardiology" />
          <Btn onClick={registerDoc} disabled={busy.doc} size="lg" cls="w-full justify-center" icon={busy.doc ? "refresh" : "check"}>
            {busy.doc ? "Registering…" : "Register Doctor"}
          </Btn>
        </Card>

        {/* Change Admin */}
        <Card cls="p-6">
          <h2 className="font-bold text-white text-lg mb-4 flex items-center gap-2"><Ic n="shield" s={18} cls="text-purple-400" />Transfer Admin Role</h2>
          <Input label="New Admin Address" value={newAdmin} onChange={e => setNewAdmin(e.target.value)} placeholder="0x..." helpText="⚠️ This will immediately transfer admin access." />
          <Btn onClick={changeAdmin} disabled={busy.admin} variant="danger" size="lg" cls="w-full justify-center" icon={busy.admin ? "refresh" : "alert"}>
            {busy.admin ? "Transferring…" : "Set New Admin"}
          </Btn>
        </Card>
      </div>

      {/* Emergency Access */}
      <Card cls="p-6 border-red-900/40">
        <h2 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center"><Ic n="alert" s={15} cls="text-red-400" /></div>
          Emergency Access
        </h2>
        <p className="text-slate-500 text-xs mb-4">Override patient authorization for emergency situations. Permanently logged on blockchain.</p>
        <Input label="Patient Ethereum Address" value={emergency.addr} onChange={e => setEmergency(p => ({ ...p, addr: e.target.value }))} placeholder="0x..." />
        <Btn onClick={emergencyFetch} disabled={busy.emg} variant="danger" icon={busy.emg ? "refresh" : "bell"}>
          {busy.emg ? "Accessing…" : "Emergency Access"}
        </Btn>
        {emergency.result && (
          <div className="mt-4 bg-red-900/20 border border-red-800 rounded-xl p-4">
            <p className="text-red-300 font-bold mb-2">⚠️ Emergency Record Retrieved</p>
            <div className="space-y-1 text-sm">
              <p className="text-slate-300"><span className="text-slate-500">Name:</span> {emergency.result.name}</p>
              <p className="text-slate-300"><span className="text-slate-500">Age:</span> {emergency.result.age}</p>
              <p className="text-slate-300"><span className="text-slate-500">History:</span> {emergency.result.history}</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── PAGE: Audit Logs ─────────────────────────────────────────────────────────
const AuditLogsPage = ({ contract, accounts, notify }) => {
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount]   = useState(0);

  useEffect(() => {
    if (!contract || !accounts[0]) return;
    const fetch = async () => {
      try {
        const n = await contract.methods.getAccessLogCount().call({ from: accounts[0] });
        setCount(Number(n));
        const fetched = [];
        for (let i = Number(n) - 1; i >= Math.max(0, Number(n) - 20); i--) {
          const log = await contract.methods.getAccessLog(i).call({ from: accounts[0] });
          fetched.push({ accessor: log[0], patient: log[1], action: log[2], timestamp: log[3] });
        }
        setLogs(fetched);
      } catch (err) { notify(err.message, "error"); }
      finally { setLoading(false); }
    };
    fetch();
  }, [contract, accounts, notify]);

  const actionColor = { GRANT: "green", REVOKE: "red", EMERGENCY: "amber", VIEW: "blue" };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Audit Logs</h1>
          <p className="text-slate-400">Immutable access trail — {count} total on-chain events. Showing last 20.</p>
        </div>
        <Badge label="Admin Only" color="purple" />
      </div>

      {loading ? <Spinner /> : logs.length === 0
        ? <Card cls="p-12 text-center"><p className="text-slate-500">No access logs found.</p></Card>
        : (
          <Card cls="overflow-hidden">
            <div className="grid grid-cols-5 text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 bg-slate-950 border-b border-slate-800">
              <span className="col-span-2">Accessor</span>
              <span>Action</span>
              <span className="col-span-2">Timestamp</span>
            </div>
            <div className="divide-y divide-slate-800">
              {logs.map((log, i) => (
                <div key={i} className="grid grid-cols-5 items-center px-5 py-3 text-sm hover:bg-slate-800/50 transition-colors">
                  <div className="col-span-2 min-w-0">
                    <p className="text-teal-400 font-mono text-xs">{shortAddr(log.accessor)}</p>
                    <p className="text-slate-600 font-mono text-xs truncate">{log.accessor}</p>
                  </div>
                  <Badge label={log.action} color={actionColor[log.action] || "slate"} />
                  <div className="col-span-2">
                    <p className="text-slate-300 text-xs">{formatTimestamp(log.timestamp)}</p>
                    <p className="text-slate-600 text-xs font-mono">Patient: {shortAddr(log.patient)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      }
    </div>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
const App = () => {
  const { web3, accounts, contract, loading, connected, status, notify, role, detectRole, setRole, stats, refreshStats, connect } = useWeb3State();

  const sharedProps = { web3, accounts, contract, notify, role, detectRole, setRole, stats, refreshStats, connected, connect, loading };

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <Navbar accounts={accounts} role={role} notify={notify} loading={loading} connected={connected} connect={connect} />

        {/* Global status toast */}
        {status.msg && (
          <div className="fixed top-20 right-4 z-50 max-w-sm w-full">
            <Alert msg={status.msg} type={status.type} />
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <Routes>
            <Route path="/"          element={<HomePage {...sharedProps} loading={loading} />} />
            <Route path="/register"  element={<RegisterPage {...sharedProps} />} />
            <Route path="/profile"   element={connected && role === "patient" ? <PatientProfile {...sharedProps} /> : <Navigate to="/" />} />
            <Route path="/authorize" element={<DoctorAuthorizationPage {...sharedProps} />} />
            <Route path="/history"   element={connected && role === "patient" ? <UpdateHistoryPage {...sharedProps} /> : <Navigate to="/" />} />
            <Route path="/doctor"    element={connected && role === "doctor"  ? <DoctorPatientsPage {...sharedProps} /> : <Navigate to="/" />} />
            <Route path="/admin"     element={connected && role === "admin"   ? <AdminPanelPage {...sharedProps} /> : <Navigate to="/" />} />
            <Route path="/logs"      element={connected && role === "admin"   ? <AuditLogsPage {...sharedProps} /> : <Navigate to="/" />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 py-8 text-center">
          <p className="text-slate-600 text-sm">EHRChain · Blockchain-Based Electronic Health Record Security System</p>
          <p className="text-slate-700 text-xs mt-1">B.Tech AI/ML Final Year Project · NNRG 2024–25 · R.UdayaSri · T.Anil Kumar · T.Sai Teja</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
