import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, User, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react'
import useComplaintsStore from '../../store/complaintsStore'
import logo from '../../assets/logo.svg'

/* ─── Logo Fill Loading Component ─── */
function LogoFillLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-4">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* dim base logo */}
        <img src={logo} alt="" className="absolute inset-0 w-full h-full object-contain opacity-15" />
        {/* animated fill overlay using clip-path */}
        <img
          src={logo}
          alt="Loading…"
          className="absolute inset-0 w-full h-full object-contain logo-fill-anim"
        />
        {/* orange glow ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
      </div>
      <div className="text-center">
        <p className="text-dark font-bold text-base">Verifying Credentials</p>
        <p className="text-slate-400 text-xs mt-1 font-medium">Please wait a moment…</p>
      </div>
      {/* progress bar */}
      <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full logo-progress-anim" />
      </div>
    </div>
  )
}

export default function AdminLogin() {
  const adminLogin = useComplaintsStore(s => s.adminLogin)
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    const ok = await adminLogin(form.username, form.password)
    setLoading(false)
    if (ok) navigate('/admin/dashboard')
    else setError('Invalid username or password. Please try again.')
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 overflow-hidden">
      {/* Rich background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(255,107,0,0.18),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_80%,rgba(59,130,246,0.08),transparent)]" />
        {/* subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glow behind card */}
        <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 via-transparent to-accent/20 rounded-[2rem] blur-xl opacity-60" />

        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Top accent stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-orange-400 to-amber-400" />

          <div className="p-10">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <LogoFillLoader />
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Logo & Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-orange-50 mb-4 border border-primary/10 shadow-inner">
                      <img src={logo} alt="ADDA_360" className="h-14 w-14 object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold text-dark">Admin Portal</h1>
                    <p className="text-slate-400 text-sm mt-1.5 font-medium">ADDA_360 Ward Connect · Authorized Access Only</p>
                  </div>

                  <form onSubmit={handle} className="space-y-5">
                    {/* Username */}
                    <div>
                      <label className="label-style">Username</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                          <User size={16} />
                        </div>
                        <input
                          type="text"
                          value={form.username}
                          onChange={e => { setForm(f => ({ ...f, username: e.target.value })); setError('') }}
                          className="input-style pl-10 transition-shadow focus:shadow-lg focus:shadow-primary/10"
                          placeholder="Enter username"
                          autoComplete="username"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="label-style">Password</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                          <Lock size={16} />
                        </div>
                        <input
                          type={showPw ? 'text' : 'password'}
                          value={form.password}
                          onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError('') }}
                          className="input-style pl-10 pr-12 transition-shadow focus:shadow-lg focus:shadow-primary/10"
                          placeholder="Enter password"
                          autoComplete="current-password"
                        />
                        <button type="button" onClick={() => setShowPw(v => !v)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-1">
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-2 text-red-500 text-sm font-semibold bg-red-50 border border-red-100 rounded-xl px-4 py-3"
                        >
                          <AlertCircle size={16} className="shrink-0" /> {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="w-full mt-2 py-3 px-6 bg-gradient-to-r from-primary to-orange-500 hover:from-orange-500 hover:to-primary text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                      <ShieldCheck size={18} />
                      Sign In to Admin Panel
                    </button>
                  </form>

                  <p className="text-center text-[10px] text-slate-300 mt-8 uppercase tracking-widest">
                    Restricted Access · ADDA_360 Ward Management System
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* CSS animations injected via style tag */}
      <style>{`
        @keyframes logoFill {
          0%   { clip-path: inset(100% 0 0 0); opacity: 0.3; }
          20%  { opacity: 1; }
          100% { clip-path: inset(0% 0 0 0); opacity: 1; }
        }
        @keyframes logoPulse {
          0%, 100% { clip-path: inset(0% 0 0 0); }
          50%       { clip-path: inset(5% 0 0 0); }
        }
        .logo-fill-anim {
          animation: logoFill 1.2s cubic-bezier(0.4,0,0.2,1) forwards,
                     logoPulse 0.6s ease-in-out 1.2s infinite;
        }
        @keyframes progressFill {
          0%   { width: 0%; }
          30%  { width: 40%; }
          70%  { width: 75%; }
          100% { width: 95%; }
        }
        .logo-progress-anim {
          animation: progressFill 1.8s cubic-bezier(0.4,0,0.2,1) forwards;
        }
      `}</style>
    </div>
  )
}
