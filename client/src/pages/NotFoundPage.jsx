import { motion } from 'framer-motion'
import { Home, Package, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-midnight text-white">
      <Navbar />
      <main className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(213,16,110,0.18),transparent_70%)] blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          className="relative z-10 space-y-6"
        >
          <p className="font-heading text-[8rem] font-black leading-none text-white/5 sm:text-[11rem]">404</p>

          <div className="-mt-4">
            <h1
              className="font-heading text-4xl font-bold sm:text-5xl"
              style={{
                background: 'linear-gradient(to right, #D5106E, #6E3992)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Page Not Found
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg text-white/55">
              Looks like this page wandered off. Let&apos;s get you back to the good stuff.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 pt-2 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-glow-magenta px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5"
              style={{ boxShadow: '0 0 32px rgba(213,16,110,0.4)' }}
            >
              <Home size={16} />
              Back to Home
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/5"
            >
              <Search size={16} />
              Browse Products
            </Link>
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/5"
            >
              <Package size={16} />
              Track Order
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
