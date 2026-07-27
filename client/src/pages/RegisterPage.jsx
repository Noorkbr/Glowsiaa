import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../context/AuthContext'

const phoneRegex = /^01[0-9]{9}$/

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.name.trim()) { setError('Full name is required.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.phone && !phoneRegex.test(form.phone.trim())) {
      setError('Please enter a valid Bangladeshi mobile number (e.g. 01XXXXXXXXX).')
      return
    }

    try {
      await register(form.name.trim(), form.email.trim(), form.password, form.phone.trim() || undefined)
      navigate('/')
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-midnight text-white">
      <Navbar />
      <main className="flex min-h-[calc(100vh-180px)] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-glow-magenta">Join the glow fam</p>
          <h1 className="mt-3 font-heading text-4xl font-bold text-white">Create Account</h1>
          <p className="mt-2 text-sm text-white/50">Get early access, exclusive deals, and track your orders.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/80">Full Name <span className="text-red-400">*</span></span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Your full name"
                className="w-full rounded-2xl border border-white/10 bg-[#14141f] px-4 py-3 text-white outline-none transition focus:border-glow-magenta"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/80">Email Address <span className="text-red-400">*</span></span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-white/10 bg-[#14141f] px-4 py-3 text-white outline-none transition focus:border-glow-magenta"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/80">Mobile Number <span className="text-white/35">(optional)</span></span>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
                className="w-full rounded-2xl border border-white/10 bg-[#14141f] px-4 py-3 text-white outline-none transition focus:border-glow-magenta"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/80">Password <span className="text-red-400">*</span></span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Min. 6 characters"
                className="w-full rounded-2xl border border-white/10 bg-[#14141f] px-4 py-3 text-white outline-none transition focus:border-glow-magenta"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/80">Confirm Password <span className="text-red-400">*</span></span>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                required
                placeholder="Re-enter password"
                className="w-full rounded-2xl border border-white/10 bg-[#14141f] px-4 py-3 text-white outline-none transition focus:border-glow-magenta"
              />
            </label>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-glow-magenta px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-70"
              style={{ boxShadow: '0 0 28px rgba(213, 16, 110, 0.35)' }}
            >
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/55">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-glow-magenta hover:underline">
              Login
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
