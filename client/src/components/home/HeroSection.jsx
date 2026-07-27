import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-midnight">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(213,16,110,0.14),transparent_34%),radial-gradient(circle_at_left,rgba(110,57,146,0.18),transparent_28%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-16 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 16 }}
        >
          <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            Curated luxury beauty
          </p>
          <h1 className="text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
            Reveal Your <br />
            <span
              style={{
                background: 'linear-gradient(to right, #D5106E, #6E3992)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              True Glow
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/70 sm:text-xl">
            Premium cosmetics curated for the modern Bangladeshi woman.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full bg-glow-magenta px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5"
              style={{ boxShadow: '0 0 32px rgba(213, 16, 110, 0.45)' }}
            >
              Explore the Collection
            </Link>
            <a
              href="#our-story"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/5"
            >
              Our Story
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-4 text-sm font-medium text-white/75 sm:gap-6">
            <span>10K+ Happy Customers</span>
            <span className="hidden text-white/30 sm:inline">|</span>
            <span>100% Authentic</span>
            <span className="hidden text-white/30 sm:inline">|</span>
            <span>Fast Delivery</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.15 }}
          className="relative flex items-center justify-center"
        >
          <div className="absolute h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(213,16,110,0.5),rgba(110,57,146,0.12),transparent_68%)] blur-3xl sm:h-[28rem] sm:w-[28rem]" />
          <motion.div
            animate={{ y: [-10, 10] }}
            transition={{ duration: 4.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
          >
            <img
              src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80"
              alt="Premium cosmetic bottle"
              className="h-[28rem] w-full max-w-md rounded-[1.5rem] object-cover sm:w-[26rem]"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
