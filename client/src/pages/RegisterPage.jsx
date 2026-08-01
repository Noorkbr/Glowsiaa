import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, Phone, Sparkles, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const phoneRegex = /^01[0-9]{9}$/

const Field = ({ label, optional, icon: Icon, children }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-white/80">
      {label} {optional && <span className="text-white/30 text-xs">(optional)</span>}
    </label>
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />}
      {children}
    </div>
  </div>
)

const inputCls = (icon) =>
  `w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 ${icon ? 'pl-11' : 'px-4'} pr-4 text-white outline-none transition focus:border-glow-magenta focus:ring-2 focus:ring-glow-magenta/20 placeholder:text-white/30`

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Full name is required.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.phone && !phoneRegex.test(form.phone.trim())) {
      setError('Enter a valid Bangladeshi mobile number (01XXXXXXXXX).'); return
    }
    try {
      await register(form.name.trim(), form.email.trim(), form.password, form.phone.trim() || undefined)
      navigate('/')
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-midnight px-4 py-12">
      {/* Aurora blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div className="absolute -top-32 left-[-10%] h-[500px] w-[500px] rounded-full bg-glow-purple/18 blur-[130px]"
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }} transition={{ duration: 16, repeat: Infinity }} />
        <motion.div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-glow-magenta/18 blur-[130px]"
          animate={{ x: [0, 40, 0], y: [0, -40, 0] }} transition={{ duration: 12, repeat: Infinity }} />
      </div>
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-midnight-3/90 shadow-2xl backdrop-blur-2xl"
          style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(110,57,146,0.18)' }}>

          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#6E3992,#9B2FD0,#D5106E)' }} />

          <div className="p-8 sm:p-10">
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-glow-purple/20 to-glow-magenta/20 text-glow-magenta"
                style={{ boxShadow: '0 0 32px rgba(110,57,146,0.3)' }}>
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <Link to="/" className="font-heading text-3xl font-black tracking-[0.28em]"
                  style={{ background: 'linear-gradient(135deg,#D5106E,#9B2FD0,#6E3992)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  GLOWSIAA
                </Link>
                <p className="mt-1 text-sm text-white/50">Join the glow community 💄</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Full Name" icon={User}>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name"
                  className={inputCls(true)} />
              </Field>

              <Field label="Email Address" icon={Mail}>
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@email.com"
                  className={inputCls(true)} />
              </Field>

              <Field label="Mobile Number" optional icon={Phone}>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="01XXXXXXXXX"
                  className={inputCls(true)} />
              </Field>

              <Field label="Password" icon={Lock}>
                <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required
                  placeholder="Min. 6 characters" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-12 text-white outline-none transition focus:border-glow-magenta focus:ring-2 focus:ring-glow-magenta/20 placeholder:text-white/30" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </Field>

              <Field label="Confirm Password" icon={Lock}>
                <input type={showConfirm ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={handleChange} required
                  placeholder="Re-enter password" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-12 text-white outline-none transition focus:border-glow-magenta focus:ring-2 focus:ring-glow-magenta/20 placeholder:text-white/30" />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </Field>

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
                {isLoading ? 'Creating Account…' : 'Create Account'}
              </motion.button>
            </form>

            <p className="mt-6 text-center text-sm text-white/50">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-glow-magenta transition hover:text-glow-pink">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
