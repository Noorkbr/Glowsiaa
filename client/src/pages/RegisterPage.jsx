import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuth()
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await register(formData.name, formData.email, formData.password, formData.phone)
      navigate('/')
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? 'Unable to create your account right now.')
    }
  }

  return (
    <div className="min-h-screen bg-midnight text-white">
      <Navbar />
      <main className="flex min-h-[calc(100vh-180px)] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-glow-magenta">Join Glowsiaa</p>
          <h1 className="mt-3 font-heading text-4xl font-bold text-white">Register</h1>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/80">Name</span>
              <input name="name" value={formData.name} onChange={handleChange} required className="w-full rounded-2xl border border-white/10 bg-[#14141f] px-4 py-3 text-white outline-none transition focus:border-glow-magenta" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/80">Email</span>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full rounded-2xl border border-white/10 bg-[#14141f] px-4 py-3 text-white outline-none transition focus:border-glow-magenta" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/80">Phone</span>
              <input name="phone" value={formData.phone} onChange={handleChange} required className="w-full rounded-2xl border border-white/10 bg-[#14141f] px-4 py-3 text-white outline-none transition focus:border-glow-magenta" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/80">Password</span>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full rounded-2xl border border-white/10 bg-[#14141f] px-4 py-3 text-white outline-none transition focus:border-glow-magenta" />
            </label>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-glow-magenta px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-70" style={{ boxShadow: '0 0 28px rgba(213, 16, 110, 0.35)' }}>
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-white/60">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-glow-magenta">
              Login
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
