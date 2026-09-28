import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  KeyRound,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import useComplaintsStore from "../../store/complaintsStore";
import logo from "../../assets/logo.svg";
import { playNotification, playPop, playClick } from "../../utils/soundEffects";

export default function AdminLogin() {
  const { adminLogin, isAdminLoggedIn } = useComplaintsStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    username: localStorage.getItem("remembered_admin_user") || "admin",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loggedOutNotice, setLoggedOutNotice] = useState(false);

  // Check if redirected from sign out
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("loggedOut") === "true") {
      setLoggedOutNotice(true);
      const timer = setTimeout(() => setLoggedOutNotice(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [location.search]);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (isAdminLoggedIn && token && !loginSuccess) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAdminLoggedIn, navigate, loginSuccess]);

  // Caps lock detection
  const handleKeyDown = (e) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState("CapsLock"));
    }
  };

  const handleQuickFill = () => {
    playPop();
    setForm({ username: "admin", password: "bjpward@2026" });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setError("");
    setLoading(true);
    playClick();

    try {
      const res = await adminLogin(form.username, form.password);
      if (res && res.success) {
        if (rememberMe) {
          localStorage.setItem("remembered_admin_user", form.username.trim());
        } else {
          localStorage.removeItem("remembered_admin_user");
        }

        setLoginSuccess(true);
        playNotification();
        setTimeout(() => {
          navigate("/admin/dashboard", { replace: true });
        }, 1100);
      } else {
        setError(res?.message || "Invalid username or password. Please try again.");
      }
    } catch (err) {
      setError("Network or server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-orange-600/20 via-brand-orange/15 to-amber-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-emerald-600/10 rounded-full blur-[100px]" />
        {/* Subtle geometric dot grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Top Navigation Bar: Back to website */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md"
        >
          <ArrowLeft size={14} /> Back to Citizen Portal
        </Link>
        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />{" "}
          Secure Gateway v2.4
        </span>
      </div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card outer glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange/30 via-orange-500/20 to-brand-green/20 rounded-[2.2rem] blur-xl opacity-70" />

        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-700/60 shadow-2xl shadow-black/80 overflow-hidden">
          {/* Top Tricolor Accent Bar */}
          <div className="h-1.5 w-full flex">
            <div className="flex-1 bg-gradient-to-r from-brand-orange to-orange-500" />
            <div className="flex-1 bg-gradient-to-r from-white/90 to-slate-200" />
            <div className="flex-1 bg-gradient-to-r from-emerald-500 to-brand-green" />
          </div>

          <div className="p-7 sm:p-9">
            {/* Logged Out Notice Banner */}
            <AnimatePresence>
              {loggedOutNotice && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-inner"
                >
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>You have been safely signed out. Thank you for your service!</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {loginSuccess ? (
                /* Success Splash Screen */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="py-10 text-center flex flex-col items-center justify-center space-y-4"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 size={44} className="text-emerald-400 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-wide">
                      Authentication Successful
                    </h3>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      Welcome back, Ward Administrator. Launching dashboard…
                    </p>
                  </div>
                  <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-brand-green rounded-full animate-pulse w-full" />
                  </div>
                </motion.div>
              ) : (
                /* Login Form */
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Header & Logo */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-orange/20 to-orange-500/10 mb-3 border border-brand-orange/30 shadow-inner">
                      <img
                        src={logo}
                        alt="Civic Portal"
                        className="h-10 w-10 object-contain drop-shadow"
                      />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
                      Ward Admin Portal
                    </h1>
                    <p className="text-slate-400 text-xs mt-1 font-medium">
                      Bengaluru Mahanagara Palike · Authorized Access Only
                    </p>
                  </div>

                  {/* Quick Fill Demo Credentials Bar */}
                  <div className="mb-5 p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-orange-200">
                      <KeyRound size={14} className="text-brand-orange" />
                      <span className="text-[11px] font-bold">Default Admin Access</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleQuickFill}
                      className="text-[11px] font-black text-white bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-brand-orange px-2.5 py-1 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-xs"
                      title="Auto-fill username: admin, password: bjpward@2026"
                    >
                      Fill Demo Credentials
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Administrator ID / Username
                      </label>
                      <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-orange transition-colors">
                          <User size={16} />
                        </div>
                        <input
                          type="text"
                          value={form.username}
                          onChange={(e) => {
                            setForm((f) => ({ ...f, username: e.target.value }));
                            setError("");
                          }}
                          placeholder="e.g. admin"
                          autoComplete="username"
                          className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-white placeholder-slate-500 outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Password
                        </label>
                        {capsLockOn && (
                          <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                            CAPS LOCK ON
                          </span>
                        )}
                      </div>
                      <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-orange transition-colors">
                          <Lock size={16} />
                        </div>
                        <input
                          type={showPw ? "text" : "password"}
                          value={form.password}
                          onChange={(e) => {
                            setForm((f) => ({ ...f, password: e.target.value }));
                            setError("");
                          }}
                          onKeyDown={handleKeyDown}
                          onKeyUp={handleKeyDown}
                          placeholder="••••••••••••"
                          autoComplete="current-password"
                          className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-11 py-2.5 text-sm font-semibold text-white placeholder-slate-500 outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                          title={showPw ? "Hide password" : "Show password"}
                        >
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me & Help */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-brand-orange focus:ring-brand-orange/30 accent-brand-orange"
                        />
                        <span>Remember username</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Default: <code className="text-amber-300 font-mono">admin</code>
                      </span>
                    </div>

                    {/* Error Box */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-2"
                        >
                          <AlertCircle size={15} className="text-red-400 shrink-0" />
                          <span>{error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-5 mt-2 bg-gradient-to-r from-brand-orange via-orange-500 to-brand-green hover:from-orange-500 hover:to-brand-green text-white font-black text-sm tracking-wide rounded-xl shadow-lg shadow-brand-orange/25 hover:shadow-brand-orange/40 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          <span>Authenticating credentials…</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={18} />
                          <span>Sign In to Admin Panel</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Security Assurance Footer */}
                  <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-300 font-semibold tracking-wide">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={13} className="text-emerald-400" />
                      256-Bit SSL Encrypted
                    </span>
                    <span className="text-slate-400">
                      BBMP Ward Role-Based Access
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
