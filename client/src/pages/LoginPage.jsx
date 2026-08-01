import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Invalid email or password.')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-midnight px-4 py-16">
      {/* Aurora blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div className="absolute -top-32 right-[-10%] h-[550px] w-[550px] rounded-full bg-glow-magenta/20 blur-[130px]"
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute bottom-[-10%] left-[-10%] h-[450px] w-[450px] rounded-full bg-glow-purple/18 blur-[130px]"
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} />
      </div>
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-midnight-3/90 shadow-2xl backdrop-blur-2xl"
          style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(213,16,110,0.12)' }}>

          {/* Top glow strip */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#D5106E,#9B2FD0,#6E3992)' }} />

          <div className="p-8 sm:p-10">
            {/* Logo */}
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-glow-magenta/20 to-glow-purple/20 text-glow-magenta"
                style={{ boxShadow: '0 0 32px rgba(213,16,110,0.3)' }}>
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <Link to="/" className="font-heading text-3xl font-black tracking-[0.28em]"
                  style={{ background: 'linear-gradient(135deg,#D5106E,#9B2FD0,#6E3992)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  GLOWSIAA
                </Link>
                <p className="mt-1 text-sm text-white/50">Welcome back, gorgeous ✨</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="you@email.com"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-white outline-none transition focus:border-glow-magenta focus:ring-2 focus:ring-glow-magenta/20 placeholder:text-white/30" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-12 text-white outline-none transition focus:border-glow-magenta focus:ring-2 focus:ring-glow-magenta/20 placeholder:text-white/30" />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white/70">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </motion.div>
              )}

              <motion.button type="submit" disabled={isLoading}
                whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                className="btn-shimmer w-full rounded-2xl bg-glow-magenta py-4 text-sm font-bold uppercase tracking-[0.18em] text-white disabled:opacity-70"
                style={{ boxShadow: '0 0 32px rgba(213,16,110,0.4)' }}>
                {isLoading ? 'Signing in…' : 'Login to Glowsiaa'}
              </motion.button>
            </form>

            <p className="mt-6 text-center text-sm text-white/50">
              New here?{' '}
              <Link to="/register" className="font-semibold text-glow-magenta transition hover:text-glow-pink">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/25">
          Your data is encrypted and secure 🔒
        </p>
      </motion.div>
    </div>
  )
}
