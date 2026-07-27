import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

const STATS = [
  { value: '10K+', label: 'Happy Customers' },
  { value: '100%', label: 'Authentic' },
  { value: '2–5', label: 'Day Delivery' },
]

const wordVariants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  visible: (i) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { delay: 0.08 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
}

const HEADLINE_WORDS = ['Reveal', 'Your', 'True']

export default function HeroSection() {
  const ref = useRef(null)
  const prefersReduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReduced ? '0%' : '18%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReduced ? '0%' : '-8%'])

  return (
    <section ref={ref} className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-midnight">
      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-60" />

      {/* Animated orbs */}
      {!prefersReduced && (
        <>
          <motion.div
            className="pointer-events-none absolute -right-32 -top-32 h-[700px] w-[700px] rounded-full bg-glow-magenta/20 blur-[130px]"
            animate={{ scale: [1, 1.12, 1], x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute -bottom-32 -left-32 h-[600px] w-[600px] rounded-full bg-glow-purple/20 blur-[120px]"
            animate={{ scale: [1, 1.18, 1], x: [0, -24, 0], y: [0, 20, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          />
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-glow-magenta/10 blur-[80px]"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        </>
      )}

      {/* Floating particles */}
      {!prefersReduced && (
        <div className="pointer-events-none absolute inset-0">
          {([
            { top: '18%', left: '8%', delay: 0, size: 'h-2 w-2' },
            { top: '72%', left: '12%', delay: 1.2, size: 'h-1.5 w-1.5' },
            { top: '30%', right: '6%', delay: 0.6, size: 'h-2.5 w-2.5' },
            { top: '65%', right: '14%', delay: 1.8, size: 'h-1.5 w-1.5' },
            { top: '50%', left: '48%', delay: 0.3, size: 'h-1 w-1' },
          ]).map((p, i) => (
            <motion.div
              key={i}
              className={`absolute ${p.size} rounded-full bg-glow-magenta`}
              style={{ top: p.top, left: p.left, right: p.right }}
              animate={{ y: [-8, 8, -8], opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
            />
          ))}
        </div>
      )}

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
        {/* Left content */}
        <motion.div style={prefersReduced ? {} : { y: textY }}>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-glow-magenta" />
            Curated luxury beauty
          </motion.p>

          <h1 className="text-5xl font-bold leading-[1.08] text-white sm:text-6xl lg:text-7xl">
            {HEADLINE_WORDS.map((word, i) => (
              <motion.span
                key={word}
                custom={i}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                className="mr-4 inline-block"
              >
                {word}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.32, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="block"
              style={{
                background: 'linear-gradient(135deg, #D5106E 0%, #9B2FD0 50%, #6E3992 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 4s ease infinite',
              }}
            >
              Glow
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6 max-w-xl text-lg leading-8 text-white/70 sm:text-xl"
          >
            Premium cosmetics curated for the modern Bangladeshi woman. Authentic. Fast. Delivered to your door.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link
              to="/products"
              className="group glow-pulse inline-flex items-center justify-center gap-2 rounded-full bg-glow-magenta px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-all hover:-translate-y-1 hover:scale-105"
              style={{ boxShadow: '0 0 32px rgba(213, 16, 110, 0.45)' }}
            >
              Explore Collection
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight size={16} />
              </motion.span>
            </Link>
            <a
              href="#our-story"
              className="inline-flex items-center justify-center rounded-full border border-white/25 px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5 hover:bg-white/5"
            >
              Our Story
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-12 flex flex-wrap gap-8"
          >
            {STATS.map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 + i * 0.12 }}
                className="text-center"
              >
                <div
                  className="font-heading text-3xl font-black"
                  style={{
                    background: 'linear-gradient(135deg, #D5106E, #6E3992)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {value}
                </div>
                <div className="mt-0.5 text-xs font-medium uppercase tracking-widest text-white/55">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — product image */}
        <motion.div
          className="relative flex items-center justify-center"
          style={prefersReduced ? {} : { y: imageY }}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Rotating ring */}
          {!prefersReduced && (
            <motion.div
              className="absolute h-[28rem] w-[28rem] rounded-full border border-glow-magenta/20 sm:h-[34rem] sm:w-[34rem]"
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              style={{
                background: 'conic-gradient(from 0deg, transparent 80%, rgba(213,16,110,0.3) 100%)',
              }}
            />
          )}

          {/* Glow blob */}
          <div className="absolute h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(213,16,110,0.45),rgba(110,57,146,0.15),transparent_65%)] blur-3xl sm:h-[32rem] sm:w-[32rem]" />

          {/* Product image card */}
          <motion.div
            animate={prefersReduced ? {} : { y: [-12, 12, -12] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10"
            whileHover={{ scale: 1.03 }}
          >
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/15 bg-white/5 p-5 shadow-[0_40px_100px_rgba(0,0,0,0.55)] shimmer">
              <img
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=480&q=85"
                alt="Premium cosmetic"
                className="h-[30rem] w-full max-w-sm rounded-[2rem] object-cover sm:w-[22rem]"
              />
              {/* Badge */}
              <motion.div
                className="absolute bottom-8 left-8 rounded-2xl border border-white/20 bg-midnight/80 px-4 py-3 backdrop-blur-xl"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <p className="text-xs text-white/55 uppercase tracking-widest">Trending</p>
                <p className="mt-0.5 text-sm font-semibold text-white">Vitamin C Serum</p>
                <p className="text-xs text-glow-magenta font-bold mt-0.5">৳1,450</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-midnight to-transparent" />
    </section>
  )
}
