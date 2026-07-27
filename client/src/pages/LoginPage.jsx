import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? 'Unable to login with those credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-midnight text-white">
      <Navbar />
      <main className="flex min-h-[calc(100vh-180px)] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-glow-magenta">Welcome back</p>
          <h1 className="mt-3 font-heading text-4xl font-bold text-white">Login</h1>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/80">Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="w-full rounded-2xl border border-white/10 bg-[#14141f] px-4 py-3 text-white outline-none transition focus:border-glow-magenta" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/80">Password</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required className="w-full rounded-2xl border border-white/10 bg-[#14141f] px-4 py-3 text-white outline-none transition focus:border-glow-magenta" />
            </label>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-glow-magenta px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-70" style={{ boxShadow: '0 0 28px rgba(213, 16, 110, 0.35)' }}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-white/60">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-glow-magenta">
              Register
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
