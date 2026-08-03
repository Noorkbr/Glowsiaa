import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Clock, Flame, Zap } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import { useRealtime } from '../../context/RealtimeContext'

/* ─── Countdown helper ─────────────────────────────────────── */
function useCountdown(targetMs) {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, targetMs - Date.now()))
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(Math.max(0, targetMs - Date.now())), 1000)
    return () => clearInterval(t)
  }, [targetMs])
  const s = Math.floor(timeLeft / 1000)
  return {
    hours:   String(Math.floor(s / 3600)).padStart(2, '0'),
    minutes: String(Math.floor((s % 3600) / 60)).padStart(2, '0'),
    seconds: String(s % 60).padStart(2, '0'),
    done:    timeLeft === 0,
  }
}

/* ─── Digit tile ───────────────────────────────────────────── */
function Digit({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={value}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="flex h-14 w-14 items-center justify-center rounded-xl bg-midnight/60 text-2xl font-black text-white backdrop-blur-sm sm:h-16 sm:w-16 sm:text-3xl"
          style={{ border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 0 20px rgba(213,16,110,0.2)' }}
        >
          {value}
        </motion.div>
      </AnimatePresence>
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">{label}</span>
    </div>
  )
}

/* ─── Main component ───────────────────────────────────────── */
export default function FlashSaleBanner() {
  const { settings } = useSiteSettings()
  const settingsKey = useRealtime('settings')
  const [dealProduct, setDealProduct] = useState(null)
  // Stable fallback end time — only computed once per mount (not on every render)
  const [fallbackEnd] = useState(() => Date.now() + 8 * 60 * 60 * 1000)

  // saleEndMs is memoized so it doesn't recalculate on every render
  const saleEndMs = useMemo(() => {
    if (settings.flash_sale_end_time) {
      const t = new Date(settings.flash_sale_end_time).getTime()
      return isNaN(t) ? fallbackEnd : t
    }
    return fallbackEnd
  }, [settings.flash_sale_end_time, fallbackEnd])

  const { hours, minutes, seconds, done } = useCountdown(saleEndMs)

  // Fetch the admin-selected product; fallback to highest-discount product
  useEffect(() => {
    const productId = settings.flash_sale_product_id
    if (productId) {
      api.get(`/products/${productId}`)
        .then(({ data }) => { if (data.product) setDealProduct(data.product) })
        .catch(() => {
          // fallback: get highest-discount product
          api.get('/products').then(({ data }) => {
            const list = data.products || []
            if (list.length > 0) {
              const sorted = [...list].sort((a, b) => (b.comparePrice - b.price) - (a.comparePrice - a.price))
              setDealProduct(sorted[0])
            }
          }).catch(() => {})
        })
    } else {
      api.get('/products')
        .then(({ data }) => {
          const list = data.products || []
          if (list.length > 0) {
            const sorted = [...list].sort((a, b) => (b.comparePrice - b.price) - (a.comparePrice - a.price))
            setDealProduct(sorted[0])
          }
        })
        .catch(() => {})
    }
  }, [settings.flash_sale_product_id, settingsKey])

  // If admin disabled flash sale OR timer done, hide
  if (settings.flash_sale_enabled === false) return null
  if (done) return null

  const price         = dealProduct ? Number(dealProduct.price || 0) : 0
  const comparePrice  = dealProduct ? Number(dealProduct.comparePrice || price) : 0
  const discountText  = settings.flash_sale_discount_text || `${comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 40}% OFF`
  const saleTitle     = settings.flash_sale_title || 'Flash Sale — Today Only'
  const saleSubtitle  = settings.flash_sale_subtitle || 'Limited time, limited stock. Don\'t miss the glow-up deal.'
  const imgUrl        = dealProduct?.images?.[0]?.url || dealProduct?.images?.[0] || dealProduct?.image ||
                        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=85'

  return (
    <section className="relative overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(213,16,110,0.12) 0%, rgba(110,57,146,0.18) 50%, rgba(213,16,110,0.08) 100%)' }} />
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-20" />

      {/* Animated blobs */}
      <motion.div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-glow-magenta/20 blur-[100px]"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-glow-purple/15 blur-[100px]"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />

      <div className="relative mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-glow-magenta/25 bg-midnight-2/80 p-6 backdrop-blur-2xl sm:p-8 lg:p-10"
          style={{ boxShadow: '0 0 0 1px rgba(213,16,110,0.15), 0 40px 100px rgba(0,0,0,0.6)' }}>

          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Label + countdown */}
            <div className="flex-1 space-y-5 text-center lg:text-left">
              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 rounded-full px-4 py-2"
                style={{ background: 'rgba(213,16,110,0.15)', border: '1px solid rgba(213,16,110,0.35)' }}
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Flame size={16} className="text-glow-magenta" />
                <span className="text-xs font-bold uppercase tracking-[0.28em] text-glow-magenta">⚡ {saleTitle}</span>
              </motion.div>

              <div>
                <h2 className="font-heading text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                  Up to{' '}
                  <span style={{ background: 'linear-gradient(135deg,#D5106E,#9B2FD0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {discountText}
                  </span>
                </h2>
                <p className="mt-2 text-base text-white/55 sm:text-lg">
                  {saleSubtitle}
                </p>
              </div>

              {/* Countdown */}
              <div>
                <div className="mb-3 flex items-center justify-center gap-2 lg:justify-start">
                  <Clock size={14} className="text-white/50" />
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">Ends in</span>
                </div>
                <div className="flex items-end justify-center gap-3 lg:justify-start">
                  <Digit value={hours} label="Hrs" />
                  <span className="mb-5 text-2xl font-black text-glow-magenta">:</span>
                  <Digit value={minutes} label="Min" />
                  <span className="mb-5 text-2xl font-black text-glow-magenta">:</span>
                  <Digit value={seconds} label="Sec" />
                </div>
              </div>

              <motion.div whileHover={{ x: 4 }}>
                <Link to="/products"
                  className="btn-shimmer inline-flex items-center gap-2 rounded-full bg-glow-magenta px-7 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white"
                  style={{ boxShadow: '0 0 32px rgba(213,16,110,0.45)' }}>
                  <Zap size={15} />
                  Shop Now
                  <ArrowRight size={15} />
                </Link>
              </motion.div>
            </div>

            {/* Right: Product image */}
            <div className="relative flex-shrink-0">
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full bg-glow-magenta/20 blur-3xl scale-110" />
              <motion.div
                className="relative"
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                  <motion.div
                    className="absolute -right-3 -top-3 z-20 rounded-full bg-glow-magenta px-3 py-1.5 text-sm font-black text-white"
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ boxShadow: '0 0 20px rgba(213,16,110,0.7)' }}
                  >
                    {discountText}
                  </motion.div>

                <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5"
                  style={{ width: 'clamp(200px, 25vw, 280px)', height: 'clamp(200px, 25vw, 280px)' }}>
                  <img src={imgUrl} alt={dealProduct?.name || 'Flash deal'}
                    className="h-full w-full object-cover" />
                </div>

                {/* Price tag */}
                {dealProduct && (
                  <motion.div
                    className="absolute -left-4 bottom-8 rounded-2xl px-4 py-2.5 text-sm backdrop-blur-sm"
                    style={{ background: 'rgba(5,5,10,0.85)', border: '1px solid rgba(213,16,110,0.3)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-xs text-white/50 line-through">৳{comparePrice.toLocaleString('en-BD')}</p>
                    <p className="text-lg font-black text-glow-magenta">৳{price.toLocaleString('en-BD')}</p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

